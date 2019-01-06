// ES6
import ReactMapboxGl, { GeoJSONLayer, Marker } from 'react-mapbox-gl';
import commonStyle from '../scss/_common.scss';
import DynamicMapStyle from '../scss/dynamicMap.scss';
import pathUtils from '../../../services/pathUtils';

const geoJSON = {
  'type': 'FeatureCollection',
  'features': [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    }
  ]
};

var geoJSONPt = {
  'type': 'FeatureCollection',
  'features': [{
    'type': 'Feature',
    'geometry': {
      'type': 'Point',
      'coordinates': [0, 0]
    }
  }]
};


export default class DynamicMap extends React.Component {
  constructor(props) {
    super(props);
    this.map = null;
    this.state = {
      geoJSON: null,
      bounds: null,
      geoJSONPt: [],
      loading: true,
      pathData: null
    };
    this.onMapHover = this.onMapHover.bind(this);
    this.onMapLoad = this.onMapLoad.bind(this);
    this.setupPathData = this.setupPathData.bind(this);
    this.fetchPath = this.fetchPath.bind(this);
    this.getBars = this.getBars.bind(this);
    this.fitBounds = this.fitBounds.bind(this);
    this.highlightPoint = this.highlightPoint.bind(this);
    this.markTrailHead = this.markTrailHead.bind(this);
    this.onMouseOverPath = this.onMouseOverPath.bind(this);
    this.onMouseOutPath = this.onMouseOutPath.bind(this);
    this.getBarId = this.getBarId.bind(this);
    this.getBarChartId = this.getBarChartId.bind(this);
  }

  fetchPath(url) {
    fetch(`${url}?redividePath=${this.props.redividePathCount}`)
      .then(response => {
        return response.json();
      })
      .then(json => {
        this.setupPathData(json.data[0]);
      })
      .catch(error => {
        console.log('error', error);
      });
  }

  setupPathData(data) {
    const points = data.gpx_data.points.map(({ lat, lon }) => {
      return [parseFloat(lon), parseFloat(lat)];
    });
    const bounds = data.gpx_data.bounds;

    geoJSON.features[0].geometry.coordinates = points;
    this.setState({
      geoJSON,
      highlightedBar: null,
      pathData: data,
      loading: false,
      bounds: [
        [bounds.minlon, bounds.minlat],
        [bounds.maxlon, bounds.maxlat]
      ].map(group => {
        return group.map(item => {
          return parseFloat(item);
        });
      })
    });
  }

  getBarChartId() {
    return `NT-PathService-${this.state.pathData.id}-barChart`;
  }
  getBarId(index) {
    return `NT-PathService-${this.state.pathData.id}-bar-${index}`;
  }

  onMouseOverPath(e, trueIndex) {
    this.onMouseOutPath(e);
    if (this.props.onMouseOverPath) {
      this.props.onMouseOverPath(e, trueIndex);
    }
    const el = document.getElementById(this.getBarId(trueIndex));
    el.style.opacity = 1;
    el.style.background = '#ff0000';
  }

  onMouseOutPath(e) {
    const els = document.querySelectorAll(`#${this.getBarChartId()} > div`);
    if (this.props.onMouseOutPath) {
      this.props.onMouseOutPath(e);
    }
    els.forEach((el) => {
      el.style.opacity = 0.25;
      el.style.background = '#333';
    });
  }

  getBars(points) {
    if (points.length > 0) {
      const bars = pathUtils.getElevBarsAsLines(points, 100, 100);
      return bars.map((bar, index) => {
        return <div 
          className={DynamicMapStyle.bar} 
          key={index} 
          id={this.getBarId(index)}
          style={{
            width: '.5%',
            height: bar.height + '%'
          }} 
          onMouseOver={(function (e) {
            this.highlightPoint([Number(bar.lon), Number(bar.lat)]);
            this.onMouseOverPath(e, index);
          }).bind(this)}
          onMouseOut={(function (e) {
            this.highlightPoint(null);
            this.onMouseOutPath(e, index);
          }).bind(this)}
        ></div>
      });
    } else {
      return false;
    }
  }

  shouldComponentUpdate(newProps) {
    const changedProps = Object.keys(newProps).filter((newPropKey) => {
      
      return newProps[newPropKey] !== this.props[newPropKey]
    });
    // handle individual commands
    if (changedProps.length === 1) {
      if (changedProps.indexOf('setBounds') !== -1) {
        this.fitBounds();
        return false;
      } 
    } else if (this.state.pathData && changedProps.length === 0) {
      return false;
    } else {
      return true;
    }
  }


  componentDidMount() {
    let url = '';
    if (this.props.trailId) {
      url = `${this.props.serviceHosts.paths}/${this.props.trailId}/heroPath`;
      this.fetchPath(url);
    } else if (this.props.pathId) {
      url = `${this.props.serviceHosts.paths}/paths/${this.props.pathId}`;
      this.fetchPath(url);
    } else if (this.props.pathData) {
      this.setupPathData(this.props.pathData);
    }
  }

  fitBounds() {
    if (this.map) {
      this.map.fitBounds(this.state.bounds);
    }
  }

  onMapLoad(map) {
    this.map = map;
    if (this.state.pathData) {
      this.markTrailHead([Number(this.state.pathData.gpx_data.points[0].lon), Number(this.state.pathData.gpx_data.points[0].lat) ]);
    }
  }

  markTrailHead(pt) {
    console.log('marking trailhead...pt;', pt);
    if (this.map) {
      if (!this.map.getSource('source_point_trailHead')) {
        this.map.addSource('source_point_trailHead', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [{
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': pt
              }
            }]
          }
        });
        this.map.addLayer({
          'id': 'point_trailHead',
          'type': 'circle',
          afterLayerId: 'geojson-1-line',
          'source': 'source_point_trailHead',
          'paint': {
            'circle-radius': {
              'base': 5,
              'stops': [[1, 5], [24, 5]]
            },
            'circle-opacity': 0.25,
            'circle-color': '#0000ff'
          }
        });
      }
    }
  }

  highlightPoint(pt) {
    if (this.map) {

      if (!this.map.getSource('point')) {
        this.map.addSource('point', {
          'type': 'geojson',
          'data': geoJSONPt
        });
        this.map.addLayer({
          'id': 'hover_pt_highlight',
          'type': 'circle',
          afterLayerId: 'geojson-1-line',
          'source': 'point',
          'paint': {
            'circle-radius': {
              'base': 10,
              'stops': [[1, 10], [24, 5]]
            },
            'circle-opacity': 0.5,
            'circle-color': '#ff0000'
          }
        });
      }
    }
    
    if (pt) {
      geoJSONPt.features[0].geometry.coordinates = pt;
      this.map.getSource('point').setData(geoJSONPt);
    } else {
      geoJSONPt.features[0].geometry.coordinates = [];
      this.map.getSource('point').setData(geoJSONPt);
    }
  }

  onMapHover(map, e) {
    if (!map.getSource('point')) {
      map.addSource('point', {
        'type': 'geojson',
        'data': geoJSONPt
      });
      map.addLayer({
        'id': 'hover_pt',
        'type': 'circle',
        afterLayerId: 'geojson-1-line',
        'source': 'point',
        'paint': {
          'circle-radius': {
            'base': 10,
            'stops': [[1, 10], [24, 5]]
          },
          'circle-opacity': 0.5,
          'circle-color': '#ff0000'
        }
      });
      
    }
    // map.moveLayer('geojson-1-line', 'hover_pt');
    const lnglat = e.lngLat;
    const tol = 4;
    const geoJSONFeatures = map.queryRenderedFeatures([[e.point.x - tol, e.point.y - tol], [e.point.x + tol, e.point.y + tol]]).filter((feature) => {
    
      return (feature.source.toLowerCase().indexOf('geojson') !== -1);
    });

    if (geoJSONFeatures.length) {
      const trueIndex = pathUtils.getClosestPointIndex([lnglat.lng, lnglat.lat], this.state.pathData.gpx_data.redividedPoints);
      this.onMouseOverPath(e, trueIndex);
      geoJSONPt.features[0].geometry.coordinates = [lnglat.lng, lnglat.lat];
      map.getSource('point').setData(geoJSONPt);
    } else {
      this.onMouseOutPath(e);
      geoJSONPt.features[0].geometry.coordinates = [];
      map.getSource('point').setData(geoJSONPt);
    }
  }
  
  render() {
    const Map = ReactMapboxGl({
      accessToken:
        'pk.eyJ1IjoiY2ptNzcxIiwiYSI6ImNqOG92Z3YyYjA5Y3EzMnBjZTdoZnN0a3YifQ.7ff2wUzKItFMviEA60OcFA',
      attributionControl: false
    });

    return (this.state.loading) ? (<div className={commonStyle.loading}></div>) : (
      <div className={DynamicMapStyle.dynMapWpr}>
        <Map
          style="mapbox://styles/cjm771/cjpjymsoc0nsz2slnpyrkxdol"
          onMouseMove={this.onMapHover}
          onStyleLoad={this.onMapLoad}
          onDataLoading={this.onDataLoading}
          fitBounds={this.state.bounds}
          fitBoundsOptions={{padding: 10}}
          containerStyle={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        >
          <GeoJSONLayer
            data={this.state.geoJSON}
            lineLayout={{
              'line-join': 'round',
              'line-cap': 'round'
            }}
            linePaint={{
              'line-color': '#888',
              'line-width': 3
            }}
          />
        </Map>
        {
          !this.state.pathData ? '' : (
            <div id={this.getBarChartId()} className={DynamicMapStyle.barChart}>
              {
                this.getBars(this.state.pathData.gpx_data.redividedPoints)
              }
            </div>
          )
        }
       
      </div>
    );
  }
}

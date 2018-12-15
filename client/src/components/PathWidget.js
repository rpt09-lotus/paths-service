// ES6
import ReactMapboxGl, { GeoJSONLayer, Marker } from 'react-mapbox-gl';

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


export default class PathWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      geoJSON: null,
      bounds: null,
      geoJSONPt: [],
      loading: true
    };
    this.onMapHover = this.onMapHover.bind(this);
  }

  componentDidMount() {
    fetch(`${this.props.serviceHosts.paths}/${this.props.trailId}/heroPath`)
      .then(response => {
        return response.json();
      })
      .then(json => {
        const points = json.data[0].gpx_data.points.map(({ lat, lon }) => {
          return [parseFloat(lon), parseFloat(lat)];
        });
        const bounds = json.data[0].gpx_data.bounds;

        geoJSON.features[0].geometry.coordinates = points;
        this.setState({
          geoJSON,
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
      })
      .catch(error => {
        console.log('error', error);
      });
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
          'circle-radius': 30,
          'circle-opacity': 0.5,
          'circle-color': '#ff0000'
        }
      });
      
    }
    map.moveLayer('geojson-1-line', 'hover_pt');
    const lnglat = e.lngLat;
    const tol = 4;
    const geoJSONFeatures = map.queryRenderedFeatures([[e.point.x - tol, e.point.y - tol], [e.point.x + tol, e.point.y + tol]]).filter((feature) => {
    
      return (feature.source.toLowerCase().indexOf('geojson') !== -1);
    });
    if (geoJSONFeatures.length) {
      const geoJSONFeature = geoJSONFeatures[0];
      geoJSONPt.features[0].geometry.coordinates = [lnglat.lng, lnglat.lat];
      map.getSource('point').setData(geoJSONPt);
    } else {
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

    return (this.state.loading) ? (<div className='loading'></div>) : (
      <Map
        style="mapbox://styles/cjm771/cjpjymsoc0nsz2slnpyrkxdol"
        onMouseMove={this.onMapHover}
        onDataLoading={this.onDataLoading}
        fitBounds={this.state.bounds}
        fitBoundsOptions={{padding: 50}}
        containerStyle={{
          height: '400px',
          width: '100%'
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
    );
  }
}

// in render()

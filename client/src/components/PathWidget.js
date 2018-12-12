// ES6
import ReactMapboxGl, { GeoJSONLayer } from 'react-mapbox-gl';

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

export default class PathWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      geoJSON: null,
      bounds: null,
      loading: true
    };
  }

  componentDidMount() {
    fetch(`http://localhost:3005/${this.props.trailId}/heroPath`)
      .then(response => {
        return response.json();
      })
      .then(json => {
        const points = json.data[0].gpx_data.points.map(({ lat, lon }) => {
          return [parseFloat(lon), parseFloat(lat)];
        });
        const bounds = json.data[0].gpx_data.bounds;

        geoJSON.features[0].geometry.coordinates = points;
        console.log(geoJSON);
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

  render() {
    const Map = ReactMapboxGl({
      accessToken:
        'pk.eyJ1IjoiY2ptNzcxIiwiYSI6ImNqOG92Z3YyYjA5Y3EzMnBjZTdoZnN0a3YifQ.7ff2wUzKItFMviEA60OcFA',
      attributionControl: false
    });
    return (this.state.loading) ? (<div className='loading'></div>) : (
      <Map
        style="mapbox://styles/cjm771/cjpjymsoc0nsz2slnpyrkxdol"
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

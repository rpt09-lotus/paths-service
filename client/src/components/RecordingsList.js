// ES6
import Recording from './Recording';

export default class RecordingsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recordings: [],
      loading: true
    };
  }

  componentDidMount() {
    fetch(`${this.props.serviceHosts.paths}/${this.props.trailId}/recordings?sortBy=date,desc`)
      .then(response => {
        return response.json();
      })
      .then(json => {
        this.setState({
          recordings: json.data,
          loading: false
        });
      })
      .catch(error => {
        console.log('error', error);
      });
  }

  render() {
    return (this.state.loading) ? (<div className='loading'></div>) : (
      !this.state.recordings.length ? (<div className='info'>No Recordings for this route.</div>) : (
        this.state.recordings.map((recording, index) => (
          <Recording key={index} recording={recording} serviceHosts={this.props.serviceHosts} />
        ))
      )
    );
  }
}
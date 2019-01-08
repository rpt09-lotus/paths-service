import {createNameSpace, getTrailIdFromUrl, getServiceHosts} from '../services/utils.js';
import RecordingsList from './RecordingsList';
import PathWidget from './PathWidget';
import CommonStyle from '../scss/_common.scss';

// create namespaced object for storing my react elements
const ns = createNameSpace('NT.PathsService');
const SERVICE_HOSTS = getServiceHosts();

// canonical path react widget
ns.CanonicalPath = class CanonicalPath extends React.Component {

  constructor(props) {
    super();
    this.state = {
      loading: true,
      trailId: getTrailIdFromUrl(),
      pathData: null
    };
  }

  componentDidMount() {
    const url = `${SERVICE_HOSTS.paths}/${this.state.trailId}/heroPath`;
    fetch(url)
      .then(response => {
        return response.json();
      })
      .then(json => {
        this.setState({
          pathData: json.data[0]
        });
      })
      .catch(error => {
        console.log('error', error);
      });
  }


  render() {
    return (!this.state.pathData ? <div className={CommonStyle.loading}></div> :
      <PathWidget 
        heightRatio={0.75}
        path={this.state.pathData} 
        serviceHosts={SERVICE_HOSTS} 
      />
    );
  }
};

// recording widget
ns.Recordings = class Recordings extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      trailId: getTrailIdFromUrl()
    };
  }

  render() {
    return (
      <RecordingsList trailId={this.state.trailId} serviceHosts={SERVICE_HOSTS} />
    );
  }
};



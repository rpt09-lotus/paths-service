import style from '../scss/style.scss';
import {createNameSpace, getTrailIdFromUrl} from '../services/utils.js';
import PathWidget from '../components/PathWidget';
import RecordingsList from './RecordingsList';

// create namespaced object for storing my react elements
const ns = createNameSpace('NT.PathsService');

let SERVICE_HOSTS = {};

if (process.env.NODE_ENV === 'production') {
  SERVICE_HOSTS = {
    trails: 'http://trail-env.8jhbbn2nrv.us-west-2.elasticbeanstalk.com/',
    profile: '',
    photos: 'http://trail-photos-service-dev.us-west-1.elasticbeanstalk.com',
    reviews: 'http://trail-photos-service-dev.us-west-1.elasticbeanstalk.com',
    paths: 'http://ec2-54-172-80-40.compute-1.amazonaws.com',
  };
} else {
  SERVICE_HOSTS = {
    trails: 'http://localhost:3001',
    profile: 'http://localhost:3002',
    photos: 'http://localhost:3003',
    reviews: 'http://localhost:3004',
    paths: 'http://localhost:3005',
  };
}


// canonical path react widget
ns.CanonicalPath = class CanonicalPath extends React.Component {

  constructor(props) {
    super();
    this.state = {
      trailId: getTrailIdFromUrl()
    };
  }

  render() {
    return (
      <div className='col-12'>
        <h1>Canonical Path Widget</h1>
        <p className={style.test}>This will <span className={style.red}>be</span> the main path widget of the page</p>
        <PathWidget trailId={this.state.trailId} serviceHosts={SERVICE_HOSTS} />
      </div>
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
      <div>
        <h1>Recordings Widget</h1>
        <RecordingsList trailId={this.state.trailId} serviceHosts={SERVICE_HOSTS} />
      </div>
    );
  }
};



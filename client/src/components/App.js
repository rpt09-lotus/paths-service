import style from '../scss/style.scss';
import {createNameSpace, getTrailIdFromUrl} from '../services/utils.js';
import DynamicMap from '../components/DynamicMap';
import RecordingsList from './RecordingsList';

// create namespaced object for storing my react elements
const ns = createNameSpace('NT.PathsService');

let SERVICE_HOSTS = {};

if (process.env.NODE_ENV === 'production') {
  SERVICE_HOSTS = {
    trails: 'http://trail-env.8jhbbn2nrv.us-west-2.elasticbeanstalk.com',
    profile: 'http://profile-service.be6c6ztrma.us-west-2.elasticbeanstalk.com',
    photos: 'http://trail-photos-service-dev.us-west-1.elasticbeanstalk.com',
    reviews: 'http://trail-photos-service-dev.us-west-1.elasticbeanstalk.com',
    paths: 'http://ec2-54-172-80-40.compute-1.amazonaws.com',
  };
} else {
  const SAFE_ORIGINS = ['localhost', 'chris-m-2.local'];
  let localHost = 'localhost';
  SAFE_ORIGINS.forEach((host) => {
    if (window.location.origin.indexOf(host) !== -1 ) {
      localHost = host;
    }
  });

  SERVICE_HOSTS = {
    trails: `http://${localHost}:3001`,
    profile: `http:///${localHost}:3002`,
    photos: `http:///${localHost}:3003`,
    reviews: `http:///${localHost}:3004`,
    paths: `http:///${localHost}:3005`,
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
      <DynamicMap trailId={this.state.trailId} serviceHosts={SERVICE_HOSTS} />
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



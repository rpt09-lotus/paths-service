import style from '../scss/style.scss';
import {createNameSpace} from '../services/utils.js';
import PathWidget from '../components/PathWidget';
import RecordingsList from './RecordingsList';

// create namespaced object for storing my react elements
const ns = createNameSpace('NT.PathsService');

// canonical path react widget
ns.CanonicalPath = class CanonicalPath extends React.Component {

  constructor(props) {
    super();
  }

  render() {
    return (
      <div className='col-12'>
        <h1>Canonical Path Widget</h1>
        <p className={style.test}>This will <span className={style.red}>be</span> the main path widget of the page</p>
        <PathWidget trailId={1} />
      </div>
    );
  }
    
};

// recording widget
ns.Recordings = class Recordings extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>Recordings Widget</h1>
        <RecordingsList trailId={1} />
      </div>
    );
  }
};



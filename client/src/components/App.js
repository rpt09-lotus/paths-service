import style from '../scss/style.scss';
import {createNameSpace} from '../services/utils.js';

// create namespaced object for storing my react elements
const ns = createNameSpace('NT.PathsService');

// canonical path react widget
ns.CanonicalPath = class CanonicalPath extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>Canonical Path Widget</h1>
        <p className={style.test}>This will <span className={style.red}>be</span> the main path widget of the page</p>
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
        <p>This is the recording widget of the page</p>
      </div>
    );
  }
};



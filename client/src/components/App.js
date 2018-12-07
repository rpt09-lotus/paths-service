import style from '../scss/style.scss';

export class CanonicalPath extends React.Component {

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
    
}

export class Recordings extends React.Component {

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
    
}
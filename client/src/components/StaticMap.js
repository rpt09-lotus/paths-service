import SVG from 'react-inlinesvg';
import staticMapStyle from '../scss/staticMap.scss';

class StaticMap extends React.Component {
  constructor (props) {
    super(props);
    this.timer = null;
    this.bounceBefore = 50;
    this.state = {
      loading: true
    };
    this.onSVGLoad = this.onSVGLoad.bind(this);
    this.onMouseOutPath = this.onMouseOutPath.bind(this);
    this.onMouseOverPath = this.onMouseOverPath.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    let shouldUpdate = false;
    Object.keys(this.state).forEach((itemKey) => {
      if (this.state[itemKey] !== nextState[itemKey]) {
        shouldUpdate = true;
      }
    });
    return shouldUpdate;
  }

  onMouseOverPath(e, index, extraData) {
    [extraData.el, extraData.elToShow].forEach(currEl => {
      currEl.style.fill = '#ff0000';
      currEl.style.fillOpacity = 0.85;
    });
  }

  onMouseOutPath(e, index, extraData) {
    [extraData.el, extraData.elToShow].forEach((currEl, index) => {
      if (index === 0) {
        currEl.style.fill = extraData.originalElStyle.fill;
        currEl.style.fillOpacity = extraData.originalElStyle.fillOpacity;
      } else {
        currEl.style.fill = extraData.originalElToShowStyle.fill;
        currEl.style.fillOpacity = extraData.originalElToShowStyle.fillOpacity;
      }
    });
  }
  
  
  onSVGLoad() {
    const id = this.props.recording.id;
    this.setState({
      loading: false
    });
    const els = document.querySelectorAll(`#pathMap-${id} svg path`);
    els.forEach((el, index) => {
      let elToShow;
      if (index % 2 === 0) {
        elToShow = els[index + 1];
      } else {
        elToShow = els[index - 1];
      }
    
      const originalElStyle = {
        fill: el.style.fill,
        fillOpacity: el.style.fillOpacity
      };

      const originalElToShowStyle = {
        fill: elToShow.style.fill,
        fillOpacity: elToShow.style.fillOpacity
      };
    
      const trueIndex = Math.floor(index / 2);
      document.querySelectorAll(`#pathMap-${id} svg path`)[index].style.pointerEvents = 'all';
      const extraData = {el, elToShow, originalElStyle, originalElToShowStyle};

      el.addEventListener('mouseover', (e) => {
        this.onMouseOverPath(e, trueIndex, extraData);
        this.props.onMouseOverPath(e, trueIndex, extraData);
      });

      el.addEventListener('mouseout', (e) => {
        this.onMouseOutPath(e, trueIndex, extraData);
        this.props.onMouseOutPath(e, trueIndex, extraData);
      });
    });
  }

  render() {
    const {recording, serviceHosts} = this.props;
    const width = 500;
    const height = Math.floor((this.props.heightRatio || 0.35) * width);
    return (
      <div 
        className={`${staticMapStyle.staticMap} ${!this.state.loading ? staticMapStyle.loaded : ''}`}
      >
        <SVG
          src={`${serviceHosts.paths}/paths/${recording.id}/image/${width}/${height}`}
          onLoad={(src) => { setTimeout(() => { this.onSVGLoad(); }, 100); } }
        ></SVG>
      </div>
    );
  }
}

export default StaticMap;
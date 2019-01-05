import Moment from 'react-moment';
import recordingStyle from '../scss/recording.scss';
import ProfileBadge from './ProfileBadge';
import RankingStars from './RankingStars';
import PathWidget from './PathWidget';
import SVG from 'react-inlinesvg';
import Tooltip from './Tooltip';

class Recording extends React.Component {
  constructor (props) {
    super(props);
    this.timer = null;
    this.bounceBefore = 50;
    this.redividedPathCount = 100;
    this.pathStats = null;
    this.state = {
      user: null,
      loading: true,
      mouseEvent: null,
      eventFree: true
    };
    this.onSVGLoad = this.onSVGLoad.bind(this);
    this.updateHoverStats = this.updateHoverStats.bind(this);
    this.updateTooltipPosition = this.updateTooltipPosition.bind(this);
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
 
  updateHoverStats(id) {
    const updateStats = () => {
      let stats = '';
      const currentLocation = this.pathStats.gpx_data.redividedPoints[id];
      stats += ((id / this.redividedPathCount) * this.pathStats.gpx_data.length.value).toFixed(2) + ' ' + this.pathStats.gpx_data.length.units;
      const currElev = Math.round(currentLocation.ele * 3.28084);
      const minElev = this.pathStats.gpx_data.min_max_elevation.value.min;
      stats += '<br/>' + currElev + 'ft ( Δ' + Math.round(currElev - minElev) + ' ft)';
      this.updateTooltipPosition(null, stats);
    };
    if (!this.pathStats) {
      this.updateTooltipPosition(null, '<img style="width: 14px" src="https://s3.amazonaws.com/9trails-gpx/general/loading_spinner.gif" />');
      fetch(`${this.props.serviceHosts.paths}/paths/${this.props.recording.id}?redividePath=${this.redividedPathCount}`).then((data) => {
        return data.json();
      }).then((resultObj) => {
        this.pathStats = resultObj.data[0];
        updateStats();
      }).catch((error) => {
        console.log('Error when fetching hover stats:', error);
      });
    } else {
      updateStats();
    }
  }
  
  updateTooltipPosition(e, content) {
    var cumulativeOffset = function(element) {
      var top = 0;
      var left = 0;
      do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
      } while (element);
  
      return {
        top: top,
        left: left
      };
    };
    const tooltip = document.getElementById('pathTooltip-' + this.props.recording.id);
    if (content) {
      tooltip.innerHTML = content;
    }
    if (e) {
      const parent = document.getElementById('pathMap-' + this.props.recording.id);
      const {top: parentTop, left: parentLeft} = cumulativeOffset(parent);
      const parentWidth = parent.clientWidth;
      const parentHeight = parent.clientHeight;
      tooltip.style.left =
          (e.pageX - parentLeft + tooltip.clientWidth + 10 < parentWidth)
            ? (e.pageX - parentLeft + 10 + 'px')
            : (parentWidth + 5 - tooltip.clientWidth + 'px');
      tooltip.style.top =
          (e.pageY - parentTop + tooltip.clientHeight + 10 < parentHeight)
            ? (e.pageY - parentTop + 10 + 'px')
            : (parentHeight + 5 - tooltip.clientHeight + 'px');
      tooltip.style.display = 'block';
      tooltip.style.opacity = 1;
    } else {
      tooltip.style.opacity = 0;
      tooltip.style.display = 'none';
    }
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
    
      document.querySelectorAll(`#pathMap-${id} svg path`)[index].style.pointerEvents = 'all';

      const originalEl = {
        fill: el.style.fill,
        fillOpacity: el.style.fillOpacity
      };

      const originalElToShow = {
        fill: elToShow.style.fill,
        fillOpacity: elToShow.style.fillOpacity
      };
      el.addEventListener('pointerover', (e) => {
        // update tooltip
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          const trueIndex = Math.floor(index / 2);
          this.updateHoverStats(trueIndex);
          this.updateTooltipPosition(e, this.state.tooltipContent);
        }, this.bounceBefore);


        [el, elToShow].forEach(currEl => {
          currEl.style.fill = '#ff0000';
          currEl.style.fillOpacity = 0.85;
        });
      });
      el.addEventListener('pointerout', (e) => {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.updateTooltipPosition(null);
        }, this.bounceBefore);
        [el, elToShow].forEach((currEl, index) => {
          if (index === 0) {
            currEl.style.fill = originalEl.fill;
            currEl.style.fillOpacity = originalEl.fillOpacity;
          } else {
            currEl.style.fill = originalElToShow.fill;
            currEl.style.fillOpacity = originalElToShow.fillOpacity;
          }
        });
      });
    });
  }
  render() {
    const {recording, serviceHosts} = this.props;

    return (
      <div className={`row ${recordingStyle.recordingCard}`}>
        <div className='col-2'>
          <ProfileBadge 
            userId={this.props.recording.user_id} 
            serviceHosts={this.props.serviceHosts} 
          />
        </div>
        <div className='col-10 row no-gutters'>
          <div className='col-8'>
            <div className={recordingStyle.comment}>
              {recording.comment}
            </div>
            {
              !recording.tag ? '' : (
                <div className='badge badge-secondary'>
                  {recording.tag}
                </div>
              )
            }
          </div>
          <div className={`col-4 ${recordingStyle.rightCol}`}>
            <RankingStars ranking={recording.rating} />
            <div className={recordingStyle.postedOn}>
              <Moment fromNow ago>{recording.date}</Moment> ago
            </div>
          </div>
          <div className={`${recordingStyle.staticMapWpr} col-12`}>
            <div 
              className={`${recordingStyle.staticMap} ${!this.state.loading ? recordingStyle.loaded : ''}`}
              id={`pathMap-${recording.id}`}
            >
              <Tooltip
                id={recording.id}
              />
              <SVG
                src={`${serviceHosts.paths}/paths/${recording.id}/image/500/200`}
                onLoad={(src) => { setTimeout(() => { this.onSVGLoad(); }, 100); } }
              ></SVG>
              {/* <img src={`${serviceHosts.paths}/paths/${recording.id}/image/500/200?mode=png`} /> */}
              {/* <PathWidget pathId={recording.id} serviceHosts={this.props.serviceHosts} /> */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Recording;
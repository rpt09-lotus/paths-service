import Moment from 'react-moment';
import recordingStyle from '../scss/recording.scss';
import ProfilePic from './ProfilePic';
import RankingStars from './RankingStars';
import PathWidget from './PathWidget';
import SVG from 'react-inlinesvg';
import Tooltip from './Tooltip';

class Recording extends React.Component {
  constructor (props) {
    super(props);
    this.timer = null;
    this.bounceBefore = 50;
    this.state = {
      user: null,
      loading: true,
      mouseEvent: null,
      eventFree: true,
      tooltipContent: null
    };
    this.onSVGLoad = this.onSVGLoad.bind(this);
    this.updateTooltipPosition = this.updateTooltipPosition.bind(this);
  }

  componentDidMount() {
    fetch(`${this.props.serviceHosts.profile}/user/${this.props.recording.user_id}`).then((data) => {
      return data.json();
    }).then((resultObj) => {
      this.setState({
        user: resultObj.data.attributes
      });
    }).catch((error) => {
      console.log('Error when fetching user:', error);
    });
  }
  
  updateTooltipPosition(e) {
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
      tooltip.innerHTML = 'o hai';
      tooltip.style.opacity = 1;
    } else {
      tooltip.style.opacity = 0;
    }
  }

  onSVGLoad(id) {
    console.log(id, 'loaded!');
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
      console.log(index);
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

        console.log(index + 'path highlighted!');
        // update tooltip
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.updateTooltipPosition(e);
        }, this.bounceBefore);

        console.log('hover over');


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
        console.log('hover out');
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
          {/* {recording.user_id} */}
          <ProfilePic user={this.state.user} />
          { !this.state.user ? '' : (
            <div className={recordingStyle.userInfo}>
              <div className={recordingStyle.name}>
                {this.state.user.first_name} {this.state.user.pro ? <span className='badge badge-success'>Pro</span> : ''}
              </div>
              <div className={recordingStyle.joined}>
                joined <Moment fromNow ago>{this.state.user.date_joined}</Moment> ago
              </div>
            </div>
          )}
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
                onLoad={(src) => { setTimeout(() => { this.onSVGLoad(recording.id); }, 100); } }
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
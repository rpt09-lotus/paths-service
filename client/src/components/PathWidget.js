import StaticMap from './StaticMap';
import Tooltip from './Tooltip';
import PathWidgetStyle from '../scss/pathWidget.scss';

class PathWidget extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      tooltipContent: null
    }
    this.redividedPathCount = 100;
    this.pathStats = null;
    this.updateHoverStats = this.updateHoverStats.bind(this);
    this.updateTooltipPosition = this.updateTooltipPosition.bind(this);
    this.onStaticMapMouseOverPath = this.onStaticMapMouseOverPath.bind(this);
    this.onStaticMapMouseOutPath = this.onStaticMapMouseOutPath.bind(this);
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
  
  onStaticMapMouseOverPath(e, index, extraData) {
    this.updateHoverStats(index);
    this.updateTooltipPosition(e, this.state.tooltipContent);
  }

  onStaticMapMouseOutPath(e, index, extraData) {
    this.updateTooltipPosition(null);
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

  render() {
    const {recording, serviceHosts} = this.props;

    return (
      <div className={`${PathWidgetStyle.mapWpr} col-12`}>
        <Tooltip
          id={recording.id}
        />
        <StaticMap
          recording={recording}
          serviceHosts={serviceHosts}
          onMouseOverPath={this.onStaticMapMouseOverPath}
          onMouseOutPath={this.onStaticMapMouseOutPath}
        />
      </div>
    );
    
  }

} 

export default PathWidget;
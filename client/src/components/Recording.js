import Moment from 'react-moment';
import recordingStyle from '../scss/recording.scss';
import ProfilePic from './ProfilePic';
import RankingStars from './RankingStars';
import PathWidget from './PathWidget';
import SVG from 'react-inlinesvg';

class Recording extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      user: null,
      loading: true
    };
    this.onSVGLoad = this.onSVGLoad.bind(this);
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

  onSVGLoad(src) {
    console.log(src, 'loaded!');
    this.setState({
      loading: false
    });
    debugger;
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
              <SVG
                src={`${serviceHosts.paths}/paths/${recording.id}/image/500/200`}
                onLoad={(src) => { this.onSVGLoad(recording.id); }}
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
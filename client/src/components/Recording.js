import Moment from 'react-moment';
import recordingStyle from '../scss/recording.scss';
import ProfilePic from './ProfilePic';
import RankingStars from './RankingStars';

class Recording extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      user: null
    };
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
                {this.state.user.first_name}
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
            <div className={recordingStyle.staticMap}>
              <img src={`${serviceHosts.paths}/paths/${recording.id}/image/500/200`} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Recording;
import Moment from 'react-moment';
import recordingStyle from '../scss/recording.scss';
import ProfileBadge from './ProfileBadge';
import RankingStars from './RankingStars';
import PathWidget from './PathWidget';


class Recording extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      user: null,
      loading: true
    };
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
          <PathWidget
            recording={recording}
            serviceHosts={serviceHosts}
          />
        </div>
      </div>
    );
  }
}

export default Recording;
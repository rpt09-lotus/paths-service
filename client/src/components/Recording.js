import Moment from 'react-moment';
import recordingStyle from '../scss/recording.scss';
import ProfilePic from './ProfilePic';
import RankingStars from './RankingStars';

const Recording = ({recording, serviceHosts}) => {
  return (
    <div className={`row ${recordingStyle.recordingCard}`}>
      <div className='col-2'>
        {/* {recording.user_id} */}
        <ProfilePic src='something' />
      </div>
      <div className='col-10 row no-gutters'>
        <div className='col-8'>
          <div className='comment'>
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
            <img src={`${serviceHosts.paths}/paths/${recording.id}/image/500/300`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recording;
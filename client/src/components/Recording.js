import recordingStyle from '../scss/recording.scss';
import ProfilePic from './ProfilePic';
import RankingStars from './RankingStars';

const Recording = ({recording}) => {
  return (
    <div className={`row ${recordingStyle.recordingCard}`}>
      <div className='col-2'>
        {/* {recording.user_id} */}
        <ProfilePic src='something' />
      </div>
      <div className='col-8'>
        {recording.comment}
        <RankingStars ranking={recording.rating} />
      </div>
    </div>
  );
};

export default Recording;
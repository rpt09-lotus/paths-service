import recordingStyle from '../scss/recording.scss';

const Recording = ({recording}) => {
  return (
    <div className={`row ${recordingStyle.recordingCard}`}>
      <div className='col-2'>{recording.user_id}</div>
      <div className='col-8'>{recording.comment}</div>
    </div>
  );
};

export default Recording;
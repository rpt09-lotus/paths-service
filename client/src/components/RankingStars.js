import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import rankingStyle from '../scss/ranking.scss';

const RankingStars = ({ranking}) => (
  <div className={rankingStyle['ranking-wpr']}> {
    Array.from({length: 5}).map((val, index) => {
      return (
        <div key={index} className={`${rankingStyle.star} ${(index < ranking) ? rankingStyle.filled : ''}`}>
          <FontAwesomeIcon icon={faStar} />
        </div>
      );
    })}
  </div>
);

export default RankingStars;
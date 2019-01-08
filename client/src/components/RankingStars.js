import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import rankingStyle from '../scss/ranking.scss';

class RankingStars extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      mouseOver: 0
    };
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
  }

  handleMouseOver(index) {
    this.setState({
      mouseOver: index
    });
  }

  handleMouseOut() {
    this.setState({
      mouseOver: 0
    });
  }

  render() {
    const {ranking, interactive, onClick} = this.props;
    return (  
      <div className={`${rankingStyle['ranking-wpr']} ${(interactive ? rankingStyle.interactive : '')}`}> {
        Array.from({length: 5}).map((val, index) => {
          return (
            <div 
              key={index} 
              onClick={interactive && onClick ? () => { onClick(index); } : () => {}}
              onMouseOver={() => { this.handleMouseOver(index); }} 
              onMouseOut={this.handleMouseOut} 
              className={`${rankingStyle.star} 
                ${(index < ranking) ? rankingStyle.filled : ''}
                ${(index < this.state.mouseOver) ? rankingStyle.hovered : ''}
              `}
            >
              <FontAwesomeIcon icon={faStar} />
            </div>
          );
        })}
      </div>
    );
  }
}

export default RankingStars;
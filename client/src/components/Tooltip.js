import tooltipStyle from '../scss/tooltip.scss';

class Tooltip extends React.Component {

  constructor(props) {
    super(props);
    this.id = 'pathTooltip-' + props.id;
  }




  render() {
    return (
      <div
        id={this.id}
        className={`${tooltipStyle.tooltip}`}
      >
      </div>
    );
  }
}

export default Tooltip;

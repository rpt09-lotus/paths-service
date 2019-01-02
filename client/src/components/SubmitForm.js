import SubmitFormStyle from '../scss/submitForm.scss';

export default class SubmitForm extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (!this.props.visible ? '' : (
      <div>HELLO IM A FORM</div>
    )
    );
  }
}
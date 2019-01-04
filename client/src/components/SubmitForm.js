import SubmitFormStyle from '../scss/submitForm.scss';
import ProfilePic from './ProfilePic';
import {getTrailIdFromUrl} from '../services/utils';
import Moment from 'react-moment';
import RankingStars from './RankingStars';
import { faPray } from '@fortawesome/free-solid-svg-icons';

export default class SubmitForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      comment: '',
      activity: '',
      gpxFile: '',
      ranking: 0
    };
    this.onRankingChange = this.onRankingChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
  }


  onSubmit() {
    console.log('current state: ', this.state);
  }

  onRankingChange(index) {
    this.setState({
      ranking: (index === this.state.ranking - 1) ? 0 : index + 1
    });
  }

  handleFileChange(e) {
    // todo , get file contents
    console.log('file Changed...');
  }

  handleInputChange(value, stateKey) {
    const newState = {};
    newState[stateKey] = value;
    this.setState(newState);
  }

  componentDidMount() {
    fetch(`${this.props.serviceHosts.profile}/user/${getTrailIdFromUrl()}`).then((data) => {
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
    return (!this.props.visible ? '' : (
      <div className={`${SubmitFormStyle.submitForm} row`}>
        <div className='col-2'>
          <ProfilePic user={this.state.user} />
          { !this.state.user ? '' : (
            <div className={SubmitFormStyle.userInfo}>
              <div className={SubmitFormStyle.name}>
                {this.state.user.first_name} {this.state.user.pro ? <span className='badge badge-success'>Pro</span> : ''}
              </div>
              <div className={SubmitFormStyle.joined}>
                joined <Moment fromNow ago>{this.state.user.date_joined}</Moment> ago
              </div>
            </div>
          )}
        </div>
        <div className='col-10 row no-gutters'>
          <div className='col-8 form-group'>
            <h4 className={SubmitFormStyle.header}>Upload A Recording</h4>
            <div className="custom-file">
              <input type="file" onChange={this.handleFileChange} className="custom-file-input" id="customFile" />
              <label className="custom-file-label" htmlFor="customFile">Choose file</label>
            </div>
            <textarea onChange={(e) => {this.handleInputChange(e.target.value, 'comment'); }} placeholder='Comment' className={`form-control ${SubmitFormStyle.formInput}`}>
            </textarea>
            <button onClick={this.onSubmit} className='btn btn-primary'>
              Submit
            </button>
            <button onClick={this.props.onCancel} className='btn btn-danger'>
              Cancel
            </button>
          </div>
          <div className={`col-4 ${SubmitFormStyle.rightCol}`}>
            <select onChange={(e) => {this.handleInputChange(e.target.value, 'activity'); }} className={`form-control ${SubmitFormStyle.formInput}`}>
              {
                ['Activity..','backpacking', 'birding', 'camping', 'cross-country-skiing', 
                  'fishing', 'hiking', 'horseback-riding', 'mountain-biking', 'nature-trips', 
                  'off-road-driving', 'paddle-sports', 'road-biking', 'rock-climbing', 'scenic-driving', 
                  'snowshoeing', 'skiing', 'surfing', 'trail-running', 'walking'].map((item, index) => {
                  return (<option key={index} value={(item === 'Activity..') ? '' : item}>{item}</option>);
                })
              }
            </select>
            <div className={SubmitFormStyle.ranking}>
              <RankingStars 
                ranking={this.state.ranking} 
                interactive={true} 
                onClick={this.onRankingChange} />
            </div>
          </div>
        </div>
      </div>
    )
    );
  }
}
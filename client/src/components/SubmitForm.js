import SubmitFormStyle from '../scss/submitForm.scss';
import ProfileBadge from './ProfileBadge';
import {getTrailIdFromUrl} from '../services/utils';
import RankingStars from './RankingStars';

export default class SubmitForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      user: null,
      comment: '',
      activity: '',
      gpxFile: '',
      fileName: null,
      ranking: 0
    };
    this.onRankingChange = this.onRankingChange.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.setError = this.setError.bind(this);
    this.getFields = this.getFields.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
  }


  onSubmit() {
    return fetch(`${this.props.serviceHosts.paths}/${getTrailIdFromUrl()}/recordings`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.getFields()), // body data type must match "Content-Type" header
    })
      .then((result) => {
        return result.json();
      })
      .then((result) => {
        if (result.error) {
          throw result.error;
        }
        this.setError(null);
        this.setSuccess('Successfully Posted! Although we\'re currently not saving anything to database');
      })
      .catch((error) => {
        this.setError(`${error}`);
      });
  }

  onRankingChange(index) {
    this.setState({
      ranking: (index === this.state.ranking - 1) ? 0 : index + 1
    });
  }

  resetForm() {

    document.querySelectorAll(
      '#NT-pathService-submitForm input, ' +
      '#NT-pathService-submitForm select, ' +
      '#NT-pathService-submitForm textarea'
    ).forEach((element) => {
      element.value = '';
    });

    this.setState({
      comment: '',
      activity: '',
      gpxFile: '',
      fileName: null,
      ranking: 0
    });
  }
  
  setSuccess(success) {
    this.resetForm();
    this.setState({
      success: success
    }, () => {
      setTimeout(() => {
        this.setState({
          success: null
        });
      }, 5000);
    });
  }

  setError(error) {
    this.setState({
      error
    });
  }

  getFields() {
    return {
      user_id: getTrailIdFromUrl(),
      date: JSON.stringify(new Date()),
      ranking: this.state.ranking,
      comment: this.state.comment,
      gpx: this.state.gpxFile
    };
  }



  handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {

      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (function (evt) {
        this.setState({
          fileName: file.name,
          gpxFile: evt.target.result
        });
      }).bind(this);

      reader.onerror = (function (evt) { this.setError('Error reading file'); }).bind(this);
    }
  }

  handleInputChange(value, stateKey) {
    const newState = {};
    newState[stateKey] = value;
    this.setState(newState);
  }

  render() {
    return (!this.props.visible ? '' : (
      <div id='NT-pathService-submitForm' className={`${SubmitFormStyle.submitForm} row`}>
        <div className='col-2'>
          <ProfileBadge 
            userId={getTrailIdFromUrl()} 
            serviceHosts={this.props.serviceHosts} 
          />
        </div>
        <div className='col-10 row no-gutters'>
          <div className='col-8 form-group'>
            <h4 className={SubmitFormStyle.header}>Upload A Recording</h4>
            {
              this.state.error ? (
                <div className={SubmitFormStyle.errorBox}>
                  {this.state.error}
                </div>  
              ) : ''
            }
            {
              this.state.success ? (
                <div className={SubmitFormStyle.successBox}>
                  {this.state.success}
                </div>  
              ) : ''
            }
            <div className="custom-file">
              <input type="file" onChange={this.handleFileChange} accept=".gpx" className="custom-file-input" id="customFile" />
              <label className="custom-file-label" htmlFor="customFile">{this.state.fileName || 'Choose gpx file..'}</label>
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
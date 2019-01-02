import commonStyle from '../scss/_common.scss';
import RecordingsListStyle from '../scss/recordingsList.scss';
import Recording from './Recording';
import SubmitForm from './SubmitForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

export default class RecordingsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recordings: [],
      loading: true,
      submitFormVisible: false
    };
    this.showSubmissionForm = this.showSubmissionForm.bind(this);
  }

  showSubmissionForm() {
    this.setState({
      submitFormVisible: !this.state.submitFormVisible
    });
  }

  componentDidMount() {
    fetch(`${this.props.serviceHosts.paths}/${this.props.trailId}/recordings?sortBy=date,desc`)
      .then(response => {
        return response.json();
      })
      .then(json => {
        this.setState({
          recordings: json.data,
          loading: false
        });
      })
      .catch(error => {
        console.log('error', error);
      });
  }

  render() {
    return (this.state.loading) ? (<div className={commonStyle.loading}></div>) : (
      !this.state.recordings.length ? (<div className={commonStyle.info}>No Recordings for this route.</div>) : (
        <div className={`${RecordingsListStyle.main}`}>
          <div className={`${RecordingsListStyle.nav} row`}>
            <div className='col-6'>
              <button className='btn btn-light' onClick={this.showSubmissionForm}>
                {
                  (!this.state.submitFormVisible ? (
                    <span><FontAwesomeIcon icon={faPlus} /> Add a recording</span>
                  ) : <span><FontAwesomeIcon icon={faTimes} /> Cancel</span>
                  )
                }
              </button>
            </div>
            <div className={`${RecordingsListStyle.rightCol} col-6`}>
              <select className='form-control'>
                <option value='date,desc'>Sort by: Newest First</option>
                <option value='date,asc'>Sort by: Oldest First</option>
                <option value='rating,desc'>Sort By: Highest Rated</option>
                <option value='rating,asc'>Sort By: Lowest Rated</option>
              </select>
            </div>
          </div>
          <SubmitForm
            visible={this.state.submitFormVisible}
          />
          { 
            this.state.recordings.map((recording, index) => (
              <Recording key={index} recording={recording} serviceHosts={this.props.serviceHosts} />
            ))
          }
        </div>
      )
    );
  }
}
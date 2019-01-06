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
      sortBy: 'date,desc',

      submitFormVisible: false
    };
    this.showSubmissionForm = this.showSubmissionForm.bind(this);
    this.handleUserCancelledForm = this.handleUserCancelledForm.bind(this);
    this.handleSortByChange = this.handleSortByChange.bind(this);
    this.fetchRecordings = this.fetchRecordings.bind(this);
  }

  showSubmissionForm() {
    this.setState({
      submitFormVisible: !this.state.submitFormVisible
    });
  }

  handleUserCancelledForm() {
    this.setState({
      submitFormVisible: false
    });
  }

  fetchRecordings() {
    fetch(`${this.props.serviceHosts.paths}/${this.props.trailId}/recordings?sortBy=${this.state.sortBy}`)
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

  componentDidMount() {
    this.fetchRecordings();
  }

  handleSortByChange(e) {
    this.setState({
      sortBy: e.target.value
    },() => {
      this.fetchRecordings();
    });
  }

  render() {
    return (this.state.loading) ? (<div className={commonStyle.loading}></div>) : (
      !this.state.recordings.length ? (<div className={commonStyle.info}>No Recordings for this route.</div>) : (
        <div className={`${RecordingsListStyle.main}`}>
          <div className={`${RecordingsListStyle.nav} row`}>
            <div className='col-6'>
              <button className={(this.state.submitFormVisible) ? 'btn btn-light' : 'btn btn-light'} onClick={this.showSubmissionForm}>
                {
                  (!this.state.submitFormVisible ? (
                    <span><FontAwesomeIcon icon={faPlus} /> Add a recording</span>
                  ) : <span><FontAwesomeIcon icon={faTimes} /> Cancel</span>
                  )
                }
              </button>
            </div>
            <div className={`${RecordingsListStyle.rightCol} col-6`}>
              <select onChange={this.handleSortByChange} className='form-control'>
                <option value='date,desc'>Sort by: Newest First</option>
                <option value='date,asc'>Sort by: Oldest First</option>
                <option value='rating,desc'>Sort By: Highest Rated</option>
                <option value='rating,asc'>Sort By: Lowest Rated</option>
              </select>
            </div>
          </div>
          <SubmitForm
            visible={this.state.submitFormVisible}
            serviceHosts={this.props.serviceHosts} 
            onCancel={this.handleUserCancelledForm}
          />
          { 
            this.state.recordings.map((recording) => (
              <Recording key={recording.id} recording={recording} serviceHosts={this.props.serviceHosts} />
            ))
          }
        </div>
      )
    );
  }
}
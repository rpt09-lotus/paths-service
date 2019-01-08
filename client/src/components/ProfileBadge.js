import ProfileBadgeStyle from '../scss/profileBadge.scss';
import ProfilePic from './ProfilePic'; 
import Moment from 'react-moment';

class ProfileBadge extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null
    };
  }

  componentDidMount() {
    fetch(`${this.props.serviceHosts.profile}/user/${this.props.userId}`).then((data) => {
      return data.json();
    }).then((resultObj) => {
      this.setState({
        user: resultObj.data.attributes
      });
    }).catch((error) => {
      this.setError(`Error when fetching user: ${error}`);
    });
  }

  render() {
    return (
      <div>
        <ProfilePic user={this.state.user} />
        { !this.state.user ? '' : (
          <div className={ProfileBadgeStyle.userInfo}>
            <div className={ProfileBadgeStyle.name}>
              {this.state.user.first_name} {this.state.user.pro ? <span className='badge badge-success'>Pro</span> : ''}
            </div>
            <div className={ProfileBadgeStyle.joined}>
              joined <Moment fromNow ago>{this.state.user.date_joined}</Moment> ago
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ProfileBadge;
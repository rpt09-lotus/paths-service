import profilePicStyle from '../scss/profilePic.scss';

class ProfilePic extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loaded: false
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        loaded: true
      });
    }, 5000);
  }

  render() {
    return (
      <div className={profilePicStyle['profile-image-wpr']}>
        <div className={profilePicStyle['default-image']}>
          <div className={`${profilePicStyle['profile-image']} ${(this.state.loaded) ? profilePicStyle['loaded'] : ''}`}>
          </div>
        </div>
      </div>
    );
  }
}

export default ProfilePic;
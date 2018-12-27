import profilePicStyle from '../scss/profilePic.scss';

class ProfilePic extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loaded: false
    };
  }

  render() {
    return (
      <div className={profilePicStyle['profile-image-wpr']}>
        <div className={profilePicStyle['default-image']}>
          <div 
            className={`${profilePicStyle['profile-image']} ${(this.props.user) ? profilePicStyle['loaded'] : ''}`}
            style={!this.props.user ? {} : {
              background: `url(${this.props.user.photo_url})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          >
          </div>
        </div>
      </div>
    );
  }
}

export default ProfilePic;
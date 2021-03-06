import decode from 'jwt-decode';


class AuthService {
  getProfile() {
    return decode(this.getToken());
  }

  loggedIn() {
    // Checks if there is a saved token and it's still valid
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token); // handwaiving here
  }

  isTokenExpired(token) {
    try {
      const decoded = decode(token);
      if (decoded.exp < Date.now() / 1000) {
        return true;
      } else return false;
    } catch (err) {
      return false;
    }
  }

  getToken() {
    // Retrieves the user token from localStorage
    const userData = localStorage.getItem('hw-token');
    return userData;
  }

  updateUser(newUserInfo) {
    localStorage.setItem('hw-userEmail', newUserInfo.updateUserProfile.email);
    localStorage.setItem('hw-userDisplayName', newUserInfo.updateUserProfile.displayName);
  }

  getUserEmail (){
    const userData = localStorage.getItem('hw-userEmail');
    return userData;
  }

  getUserID (){
    const userID = localStorage.getItem('hw-userID');
    return userID;
  }

  login(authData) {
    // Saves user token to localStorage
    console.log(JSON.stringify(authData));
    localStorage.setItem('hw-token',authData.token);
    localStorage.setItem('hw-userID', authData.user._id);
    localStorage.setItem('hw-userEmail', authData.user.email);
    localStorage.setItem('hw-userDisplayName', authData.user.displayName);
    window.location.assign('/');
  }



  logout() {
    // Clear user token and profile data from localStorage
    // axios.defaults.headers.common["Authorization"] = null;
    localStorage.removeItem('hw-token');
    localStorage.removeItem('hw-userID');
    localStorage.removeItem('hw-userEmail');
    localStorage.removeItem('hw-userDisplayName');
    // this will reload the page and reset the state of the application
    window.location.assign('/');
  }
}

export default new AuthService();
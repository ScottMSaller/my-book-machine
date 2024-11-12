import { jwtDecode } from 'jwt-decode';

interface UserToken {
  name: string;
  exp: number;
}

class AuthService {
  // Get user data by decoding the token
  getProfile() {
    const token = this.getToken();
    return token ? jwtDecode<UserToken>(token) : null;
  }

  // Check if the user is logged in
  loggedIn() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  // Check if the token has expired
  isTokenExpired(token: string) {
    try {
      const decoded = jwtDecode<UserToken>(token);
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      console.error('Error decoding token:', err);
      return false;
    }
  }

  // Retrieve token from localStorage
  getToken() {
    return localStorage.getItem('id_token');
  }

  // Save token to localStorage and reload page
  login(idToken: string) {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/');
  }

  // Clear token from localStorage and reload page
  logout() {
    localStorage.removeItem('id_token');
    window.location.assign('/');
  }
}

export default new AuthService();


// src/services/auth.ts
export const authService = {
  isAuthenticated: () => {
    // Check if user has a valid token in localStorage/sessionStorage
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return !!token;
  },
  
  getCurrentUser: () => {
    // Get user from localStorage/sessionStorage
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Optional: Add login/logout methods
  login: (token: string, user: any, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    }
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('currentUser');
  }
};
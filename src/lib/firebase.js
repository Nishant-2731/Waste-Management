// Custom authentication API
const API_BASE = 'http://localhost:3001/api';

export const auth = {
  // Sign up a new user
  signUp: async (email, password, name) => {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }
    
    // Store token in localStorage
    localStorage.setItem('token', data.token);
    return data.user;
  },

  // Sign in existing user
  signIn: async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Signin failed');
    }
    
    // Store token in localStorage
    localStorage.setItem('token', data.token);
    return data.user;
  },

  // Get current user
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        localStorage.removeItem('token');
        return null;
      }
      
      const data = await response.json();
      return data.user;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  },

  // Sign out
  signOut: () => {
    localStorage.removeItem('token');
    window.location.reload();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Database-like functions for user data
export const db = {
  // Update user points
  updateUserPoints: async (points) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/users/points`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ points }),
    });

    if (!response.ok) {
      throw new Error('Failed to update points');
    }

    return response.json();
  },

  // Award points to user
  awardPoints: async (amount, reason = 'device-serial', serial = null) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/users/award`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ amount, reason, serial }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to award points');
    }

    return response.json();
  }
};
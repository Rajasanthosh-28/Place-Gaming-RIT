// Centralized API helper
// With the Vite proxy configured, we use relative URLs (no hardcoded localhost:5000)
const API = '';

export const getToken = () => localStorage.getItem('token');

export const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

export const authHeadersNoContent = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// Fetch current user from backend and sync to localStorage
export const fetchCurrentUser = async () => {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      // Token is invalid — clear it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    const user = await res.json();
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
};

export const getLocalUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

export default API;

import axios from 'axios';

const isDev = import.meta.env.DEV;

const API = axios.create({
  baseURL: isDev ? '/api' : 'https://edu-connect-fwoo.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const persistBlockedAccount = (payload = {}) => {
  const blockedUser = {
    ...(payload.user || {}),
    isBlocked: true,
    blockedReason: payload.reason || payload.user?.blockedReason || payload.message,
  };
  localStorage.setItem('blockedAccount', JSON.stringify(blockedUser));
};

const redirectToBlocked = () => {
  if (window.location.pathname !== '/blocked') {
    window.location.href = '/blocked';
  }
};

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${API.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        if (
          refreshError.response?.status === 403 &&
          refreshError.response?.data?.error === 'account_suspended'
        ) {
          persistBlockedAccount(refreshError.response.data);
          localStorage.removeItem('accessToken');
          redirectToBlocked();
          return Promise.reject(refreshError);
        }
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle account suspension (blocked by admin)
    if (error.response?.status === 403 && error.response?.data?.error === 'account_suspended') {
      persistBlockedAccount(error.response.data);
      localStorage.removeItem('accessToken');
      redirectToBlocked();
    }

    return Promise.reject(error);
  }
);

export default API;

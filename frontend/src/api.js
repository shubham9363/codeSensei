import axios from 'axios';

const API_BASE = import.meta.env.PROD ? '' : '';

const api = axios.create({
  baseURL: API_BASE + '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('codesensei_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const verifyOtp = (data) => api.post('/auth/verify-otp', data);
export const resendOtp = (data) => api.post('/auth/resend-otp', data);
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);
export const getMe = () => api.get('/auth/me');

// Problems
export const getProblems = () => api.get('/problems');
export const getProblem = (id) => api.get(`/problems/${id}`);
export const createProblem = (data) => api.post('/problems', data);
export const deleteProblem = (id) => api.delete(`/problems/${id}`);

// Bugs
export const getBugs = () => api.get('/bugs');
export const getBug = (id) => api.get(`/bugs/${id}`);
export const createBug = (data) => api.post('/bugs', data);
export const deleteBug = (id) => api.delete(`/bugs/${id}`);

// Submissions
export const createSubmission = (data) => api.post('/submissions', data);
export const getSubmissions = () => api.get('/submissions');
export const getMySubmissions = () => api.get('/submissions/my');
export const addFeedback = (id, feedback) => api.put(`/submissions/${id}/feedback`, { feedback });

// AI Hints
export const getHint = (data) => api.post('/ai/hint', data);

// Users
export const getLeaderboard = () => api.get('/users/leaderboard');
export const getUsers = () => api.get('/users');
export const updateProgress = (data) => api.put('/users/progress', data);
export const updateProfile = (data) => api.put('/users/profile', data);
export const resetUser = (id) => api.put(`/users/${id}/reset`);
export const deleteUser = (id) => api.delete(`/users/${id}`);

export default api;

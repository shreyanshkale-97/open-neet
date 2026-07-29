import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
};

export const userApi = {
  getMe: () => api.get('/users/me'),
  getDashboard: () => api.get('/users/me/dashboard'),
  getHistory: () => api.get('/users/me/history'),
  updateProfile: (data: any) => api.patch('/users/me'),
};

export const questionsApi = {
  getSubjects: () => api.get('/questions/subjects'),
  searchBank: (params: any) => api.get('/questions/bank/search', { params }),
};

export const aiApi = {
  generateQuestions: (data: any) => api.post('/ai/generate-questions', data),
  getJobStatus: (id: string) => api.get(`/ai/jobs/${id}`),
};

export const ownPaperApi = {
  processPaper: (formData: FormData, jobId?: string) =>
    api.post('/ai/own-paper', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(jobId ? { 'x-job-id': jobId } : {}),
      },
    }),
  getProgress: (jobId: string) => api.get(`/ai/own-paper/progress/${jobId}`),
};

export const testsApi = {
  createTest: (data: any) => api.post('/tests/create', data),
  getTest: (id: string) => api.get(`/tests/${id}`),
  startTest: (id: string) => api.post(`/tests/${id}/start`),
  saveAnswer: (id: string, data: any) => api.post(`/tests/${id}/answer`, data),
  submitTest: (id: string) => api.post(`/tests/${id}/submit`),
  getResult: (id: string) => api.get(`/tests/${id}/result`),
  getReport: (id: string) => api.get(`/tests/${id}/report`),
};

export const adminApi = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  suspendUser: (id: string, isSuspended: boolean) => api.patch(`/admin/users/${id}/suspend`, { isSuspended }),
  getFeatureFlags: () => api.get('/admin/feature-flags'),
  updateFeatureFlag: (flag: string, enabled: boolean) => api.patch(`/admin/feature-flags/${flag}`, { enabled }),
  getAuditLogs: (params?: any) => api.get('/admin/audit-logs', { params }),
};
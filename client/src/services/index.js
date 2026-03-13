import API from './api';

export const authService = {
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getMe: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  updatePassword: async (passwords) => {
    const response = await API.put('/auth/updatepassword', passwords);
    return response.data;
  },
};

export const userService = {
  getUsers: async (params) => {
    const response = await API.get('/users', { params });
    return response.data;
  },

  getUser: async (id) => {
    const response = await API.get(`/users/${id}`);
    return response.data;
  },

  getDashboard: async () => {
    const response = await API.get('/users/dashboard/stats');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await API.put('/users/profile', data);
    if (response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  deleteAccount: async () => {
    const response = await API.delete('/users/account');
    return response.data;
  },
};

export const skillService = {
  getSkills: async (params) => {
    const response = await API.get('/skills', { params });
    return response.data;
  },

  getSkill: async (id) => {
    const response = await API.get(`/skills/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await API.get('/skills/categories/list');
    return response.data;
  },

  createSkill: async (data) => {
    const response = await API.post('/skills', data);
    return response.data;
  },

  updateSkill: async (id, data) => {
    const response = await API.put(`/skills/${id}`, data);
    return response.data;
  },

  deleteSkill: async (id) => {
    const response = await API.delete(`/skills/${id}`);
    return response.data;
  },
};

export const matchService = {
  findMatches: async (params) => {
    const response = await API.get('/matches/find', { params });
    return response.data;
  },

  getRecommendations: async () => {
    const response = await API.get('/matches/recommendations');
    return response.data;
  },

  sendRequest: async (data) => {
    const response = await API.post('/matches/request', data);
    return response.data;
  },

  getReceivedRequests: async (params) => {
    const response = await API.get('/matches/received', { params });
    return response.data;
  },

  getSentRequests: async (params) => {
    const response = await API.get('/matches/sent', { params });
    return response.data;
  },

  respondToRequest: async (id, data) => {
    const response = await API.put(`/matches/${id}/respond`, data);
    return response.data;
  },

  cancelRequest: async (id) => {
    const response = await API.put(`/matches/${id}/cancel`);
    return response.data;
  },
};

export const sessionService = {
  createSession: async (data) => {
    const response = await API.post('/sessions', data);
    return response.data;
  },

  getSessions: async (params) => {
    const response = await API.get('/sessions', { params });
    return response.data;
  },

  getSession: async (id) => {
    const response = await API.get(`/sessions/${id}`);
    return response.data;
  },

  updateSession: async (id, data) => {
    const response = await API.put(`/sessions/${id}`, data);
    return response.data;
  },

  completeSession: async (id) => {
    const response = await API.put(`/sessions/${id}/complete`);
    return response.data;
  },

  cancelSession: async (id, data) => {
    const response = await API.put(`/sessions/${id}/cancel`, data);
    return response.data;
  },
};

export const chatService = {
  getOrCreateChat: async (userId) => {
    const response = await API.post('/chats', { userId });
    return response.data;
  },

  getChats: async () => {
    const response = await API.get('/chats');
    return response.data;
  },

  getChat: async (id) => {
    const response = await API.get(`/chats/${id}`);
    return response.data;
  },

  sendMessage: async (id, content) => {
    const response = await API.post(`/chats/${id}/messages`, { content });
    return response.data;
  },

  deleteChat: async (id) => {
    const response = await API.delete(`/chats/${id}`);
    return response.data;
  },
};

export const reviewService = {
  createReview: async (data) => {
    const response = await API.post('/reviews', data);
    return response.data;
  },

  getUserReviews: async (userId) => {
    const response = await API.get(`/reviews/user/${userId}`);
    return response.data;
  },

  getReview: async (id) => {
    const response = await API.get(`/reviews/${id}`);
    return response.data;
  },

  updateReview: async (id, data) => {
    const response = await API.put(`/reviews/${id}`, data);
    return response.data;
  },

  respondToReview: async (id, response) => {
    const res = await API.put(`/reviews/${id}/respond`, { response });
    return res.data;
  },

  deleteReview: async (id) => {
    const response = await API.delete(`/reviews/${id}`);
    return response.data;
  },
};

export const adminService = {
  getStats: async () => {
    const response = await API.get('/admin/stats');
    return response.data;
  },

  getAllUsers: async (params) => {
    const response = await API.get('/admin/users', { params });
    return response.data;
  },

  blockUser: async (id, reason) => {
    const response = await API.put(`/admin/users/${id}/block`, { reason });
    return response.data;
  },

  unblockUser: async (id) => {
    const response = await API.put(`/admin/users/${id}/unblock`);
    return response.data;
  },

  grantPremium: async (id, duration) => {
    const response = await API.put(`/admin/users/${id}/grant-premium`, { duration });
    return response.data;
  },

  deleteUser: async (id, reason) => {
    const response = await API.delete(`/admin/users/${id}`, { data: { reason } });
    return response.data;
  },

  getLogs: async (params) => {
    const response = await API.get('/admin/logs', { params });
    return response.data;
  },
};

export const pointsService = {
  getBalance: async () => {
    const response = await API.get('/points');
    return response.data;
  },

  getTransactions: async (params) => {
    const response = await API.get('/points/transactions', { params });
    return response.data;
  },

  purchasePoints: async (amount, paymentId) => {
    const response = await API.post('/points/purchase', { amount, paymentId });
    return response.data;
  },

  getPackages: async () => {
    const response = await API.get('/points/packages');
    return response.data;
  },
};

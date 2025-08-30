import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Add request interceptor to include auth token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints
export const api = {
  // Authentication
  login: (data: { username: string; role: string }) => 
    axios.post('/login', data),

  // Ledger
  getLedger: () => 
    axios.get('/ledger'),

  // Marketplace
  getMarketplace: () => 
    axios.get('/marketplace'),
  
  createOffer: (data: { producerId: string; creditsAvailable: number; pricePerCredit: number }) =>
    axios.post('/marketplace', data),

  // Production
  submitProduction: (data: { producerId: string; tons: number; notes?: string; file?: string }) =>
    axios.post('/production', data),
  
  getPendingReports: () =>
    axios.get('/production/pending'),
  
  approveReport: (data: { reportId: string; regulatorId: string }) =>
    axios.post('/approve', data),

  // Trading
  executeTrade: (data: { buyerId: string; offerId: string; quantity: number }) =>
    axios.post('/trade', data),

  // Users
  getUserProfile: (userId: string) =>
    axios.get(`/users/${userId}`),
  
  getUserTransactions: (userId: string) =>
    axios.get(`/transactions/${userId}`),
};

export default api;
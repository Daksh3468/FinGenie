import axios from 'axios';

// Read from environment variable, fallback to localhost
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/api';

// Export for use in other components
export const getApiBase = () => API_BASE;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 600000, // 10 minutes for large document processing
});

export async function uploadAndAnalyze(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function healthCheck() {
  const response = await api.get('/health');
  return response.data;
}

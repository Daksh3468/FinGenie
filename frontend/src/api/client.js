import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 600000, // 10 minutes for large SEC dataset processing
});

export async function uploadAndAnalyze(file, apiKey = null) {
  const formData = new FormData();
  formData.append('file', file);
  if (apiKey) {
    formData.append('api_key', apiKey);
  }

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function healthCheck() {
  const response = await api.get('/health');
  return response.data;
}

import axios from 'axios';
import { supabase } from '../lib/supabase';

// URL del backend Express
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const baseApi = axios.create({
  baseURL: API_URL,
});

// Interceptor para inyectar el token de Supabase en las peticiones al backend
baseApi.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

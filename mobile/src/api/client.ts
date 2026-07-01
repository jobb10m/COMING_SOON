import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Reuses the exact same Express REST API as the web client.
const API_URL = (Constants.expoConfig?.extra as any)?.apiUrl || 'http://localhost:5000/api';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  await AsyncStorage.setItem('accessToken', data.data.accessToken);
  await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
  return data.data.user;
}

export async function logoutRequest() {
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
}

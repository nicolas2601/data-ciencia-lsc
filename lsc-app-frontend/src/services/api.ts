import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import type { PredictionResponse } from '../types';

// Cambiar a tu IP local si usas dispositivo físico
// Ejemplo: http://192.168.1.100:8000
const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const predictSign = async (videoUri: string): Promise<PredictionResponse> => {
  try {
    // Crear FormData
    const formData = new FormData();
    
    // Leer el archivo y crear el blob
    const fileInfo = await FileSystem.getInfoAsync(videoUri);
    
    if (!fileInfo.exists) {
      throw new Error('El archivo de video no existe');
    }

    // Añadir el archivo al FormData
    formData.append('file', {
      uri: videoUri,
      type: 'video/mp4',
      name: 'sign_video.mp4',
    } as any);

    const response = await api.post<PredictionResponse>('/predict', formData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || error.message;
      throw new Error(`Error de predicción: ${message}`);
    }
    throw error;
  }
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch {
    return false;
  }
};

export const getAvailableWords = async (): Promise<string[]> => {
  try {
    const response = await api.get<string[]>('/palabras-disponibles');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo palabras disponibles:', error);
    return [];
  }
};

export interface PredictionResponse {
  palabras: string[];
  frase: string;
  confianza: number;
  tiempo_procesamiento: number;
}

export interface ApiError {
  detail: string;
}

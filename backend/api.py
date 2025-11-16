#!/usr/bin/env python3
"""
API FastAPI para el sistema de interpretación de LSC
Endpoints para clasificar videos y generar frases
"""

import os

# Usar la versión legacy de Keras para cargar modelos guardados en formato H5
os.environ.setdefault("TF_USE_LEGACY_KERAS", "1")

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tensorflow as tf
import numpy as np
import cv2
import mediapipe as mp
import tempfile
from typing import List
import pickle
from transformers import T5Tokenizer, T5ForConditionalGeneration
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.layers import InputLayer
from tensorflow.keras.mixed_precision import Policy
from tensorflow.keras.utils import custom_object_scope


_original_inputlayer_from_config = InputLayer.from_config.__func__


@classmethod
def _accept_batch_shape(cls, config):
    if "batch_shape" in config and "batch_input_shape" not in config:
        config["batch_input_shape"] = config.pop("batch_shape")
    return _original_inputlayer_from_config(cls, config)


InputLayer.from_config = _accept_batch_shape

app = FastAPI(
    title="LSC Interpreter API",
    description="API para interpretar Lenguaje de Señas Colombiano",
    version="1.0.0"
)

# CORS - Permitir acceso desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Variables globales para modelos
modelo_clasificador = None
labels_dict = None
modelo_generativo = None
tokenizer = None
mp_hands = None
max_length = None
num_features = None


@app.on_event("startup")
async def cargar_modelos():
    """Cargar modelos al iniciar la aplicación"""
    global modelo_clasificador, labels_dict, modelo_generativo, tokenizer, mp_hands, max_length, num_features
    
    try:
        print("🔄 Cargando modelos...")
        
        # Cargar modelo LSTM
        with custom_object_scope({"DTypePolicy": Policy}):
            modelo_clasificador = tf.keras.models.load_model(
                'models/mejor_modelo_lsc.h5', compile=False
            )
        print("   ✓ Modelo LSTM cargado")
        
        # Cargar diccionario de labels
        with open('models/labels_dict.pkl', 'rb') as f:
            labels_dict = pickle.load(f)
        print(f"   ✓ Labels cargados ({len(labels_dict)} palabras)")
        
        # Cargar configuración
        with open('models/config.pkl', 'rb') as f:
            config = pickle.load(f)
            max_length = config['max_length']
            num_features = config['num_features']
        print(f"   ✓ Configuración cargada (max_length={max_length}, features={num_features})")
        
        # Cargar modelo generativo T5
        try:
            tokenizer = T5Tokenizer.from_pretrained("models/t5-lsc-finetuned")
            modelo_generativo = T5ForConditionalGeneration.from_pretrained("models/t5-lsc-finetuned")
            print("   ✓ Modelo T5 fine-tuneado cargado")
        except:
            # Fallback a modelo base si no existe el fine-tuneado
            tokenizer = T5Tokenizer.from_pretrained("t5-small")
            modelo_generativo = T5ForConditionalGeneration.from_pretrained("t5-small")
            print("   ⚠️  Usando T5 base (no fine-tuneado)")
        
        # Inicializar MediaPipe
        mp_hands = mp.solutions.hands
        print("   ✓ MediaPipe inicializado")
        
        print("✅ Todos los modelos cargados exitosamente\n")
        
    except Exception as e:
        print(f"❌ Error cargando modelos: {e}")
        raise


def extraer_keypoints_video(video_path: str) -> np.ndarray:
    """
    Extrae keypoints de manos desde un video usando MediaPipe
    Retorna array de shape (30, 126)
    """
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=2,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    cap = cv2.VideoCapture(video_path)
    keypoints_sequence = []
    
    frame_count = 0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Calcular intervalo para samplear 30 frames
    frame_interval = max(1, total_frames // 30) if total_frames > 30 else 1
    
    while cap.isOpened() and len(keypoints_sequence) < 30:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Solo procesar frames en el intervalo
        if frame_count % frame_interval == 0:
            # Convertir BGR a RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(frame_rgb)
            
            frame_keypoints = []
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    for landmark in hand_landmarks.landmark:
                        frame_keypoints.extend([landmark.x, landmark.y, landmark.z])
            
            # Normalizar a exactamente 126 valores (21 * 3 * 2)
            expected_size = 126
            if len(frame_keypoints) == 0:
                frame_keypoints = [0.0] * expected_size
            elif len(frame_keypoints) < expected_size:
                frame_keypoints.extend([0.0] * (expected_size - len(frame_keypoints)))
            elif len(frame_keypoints) > expected_size:
                frame_keypoints = frame_keypoints[:expected_size]
            
            keypoints_sequence.append(frame_keypoints)
        
        frame_count += 1
    
    cap.release()
    hands.close()
    
    # Padding si es necesario
    if len(keypoints_sequence) < 30:
        padding = keypoints_sequence[-1] if len(keypoints_sequence) > 0 else [0.0] * 126
        while len(keypoints_sequence) < 30:
            keypoints_sequence.append(padding)
    
    return np.array(keypoints_sequence, dtype=np.float32)


def predecir_palabra(keypoints_seq: np.ndarray) -> tuple:
    """
    Predice la palabra a partir de keypoints
    Retorna (palabra, confianza)
    """
    # Asegurar que tenga el shape correcto
    if keypoints_seq.shape != (30, 126):
        raise ValueError(f"Shape incorrecto: {keypoints_seq.shape}, esperado (30, 126)")
    
    # Expandir dimensión de batch
    keypoints_batch = np.expand_dims(keypoints_seq, axis=0)
    
    # Predecir
    prediccion = modelo_clasificador.predict(keypoints_batch, verbose=0)
    clase_predicha = np.argmax(prediccion, axis=1)[0]
    confianza = float(np.max(prediccion))
    palabra = labels_dict[clase_predicha]
    
    return palabra, confianza


def generar_frase(palabras: List[str]) -> str:
    """
    Genera una frase coherente a partir de glosas usando T5
    """
    if not palabras:
        return ""
    
    # Convertir a mayúsculas y unir
    glosas = ' '.join([p.upper() for p in palabras])
    input_text = f"translate gloss to text: {glosas}"
    
    # Tokenizar
    inputs = tokenizer(input_text, return_tensors="pt", max_length=512, truncation=True)
    
    # Generar
    outputs = modelo_generativo.generate(
        inputs.input_ids,
        max_length=50,
        num_beams=4,
        early_stopping=True,
        no_repeat_ngram_size=2
    )
    
    frase = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return frase


# ============== ENDPOINTS ==============

@app.get("/")
async def root():
    """Información de la API"""
    return {
        "message": "LSC Interpreter API",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "GET /": "Información de la API",
            "GET /health": "Estado de la API",
            "GET /palabras-disponibles": "Lista de palabras reconocibles",
            "POST /predict": "Predecir palabra de un video",
            "POST /predict-sequence": "Predecir secuencia de videos",
        }
    }


@app.get("/health")
async def health_check():
    """Verificar estado de la API y modelos"""
    modelos_cargados = all([
        modelo_clasificador is not None,
        labels_dict is not None,
        modelo_generativo is not None,
        tokenizer is not None,
        mp_hands is not None
    ])
    
    return {
        "status": "healthy" if modelos_cargados else "unhealthy",
        "models_loaded": modelos_cargados,
        "available_words": len(labels_dict) if labels_dict else 0,
        "max_length": max_length,
        "num_features": num_features
    }


@app.get("/palabras-disponibles")
async def obtener_palabras():
    """Retorna la lista de palabras que el modelo puede reconocer"""
    if labels_dict is None:
        raise HTTPException(status_code=503, detail="Modelos no cargados")
    
    palabras = sorted(labels_dict.values())
    
    return {
        "total": len(palabras),
        "palabras": palabras
    }


@app.post("/predict")
async def predecir_video_endpoint(file: UploadFile = File(...)):
    """
    Predice la palabra de un video de lenguaje de señas
    
    Args:
        file: Video en formato MP4, MOV, AVI, etc.
    
    Returns:
        {
            "success": bool,
            "palabra": str,
            "confianza": float,
            "frames_procesados": int
        }
    """
    if modelo_clasificador is None:
        raise HTTPException(status_code=503, detail="Modelos no cargados")
    
    # Validar tipo de archivo
    allowed_extensions = ['.mp4', '.mov', '.avi', '.mkv']
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Formato no soportado. Use: {', '.join(allowed_extensions)}"
        )
    
    # Guardar video temporalmente
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_path = tmp_file.name
    
    try:
        # Procesar video
        keypoints = extraer_keypoints_video(tmp_path)
        
        if len(keypoints) == 0:
            raise HTTPException(
                status_code=400, 
                detail="No se detectaron keypoints en el video"
            )
        
        # Predecir
        palabra, confianza = predecir_palabra(keypoints)
        
        return {
            "success": True,
            "palabra": palabra,
            "confianza": float(confianza),
            "frames_procesados": len(keypoints)
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando video: {str(e)}")
    
    finally:
        # Limpiar archivo temporal
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.post("/predict-sequence")
async def predecir_secuencia_endpoint(
    files: List[UploadFile] = File(...),
    umbral_confianza: float = 0.7
):
    """
    Predice una secuencia de palabras y genera una frase
    
    Args:
        files: Lista de videos (orden importa)
        umbral_confianza: Confianza mínima para aceptar predicción (0.0-1.0)
    
    Returns:
        {
            "success": bool,
            "palabras_detectadas": List[str],
            "frase_generada": str,
            "detalles": List[dict],
            "total_videos": int,
            "videos_aceptados": int
        }
    """
    if modelo_clasificador is None or modelo_generativo is None:
        raise HTTPException(status_code=503, detail="Modelos no cargados")
    
    if not files:
        raise HTTPException(status_code=400, detail="No se enviaron videos")
    
    palabras_detectadas = []
    detalles = []
    
    for idx, file in enumerate(files):
        # Guardar video temporalmente
        file_ext = os.path.splitext(file.filename)[1].lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        try:
            # Procesar video
            keypoints = extraer_keypoints_video(tmp_path)
            
            if len(keypoints) > 0:
                palabra, confianza = predecir_palabra(keypoints)
                
                detalle = {
                    "posicion": idx + 1,
                    "archivo": file.filename,
                    "palabra": palabra,
                    "confianza": float(confianza),
                    "aceptada": confianza >= umbral_confianza
                }
                
                detalles.append(detalle)
                
                if confianza >= umbral_confianza:
                    palabras_detectadas.append(palabra)
            else:
                detalles.append({
                    "posicion": idx + 1,
                    "archivo": file.filename,
                    "error": "No se detectaron keypoints"
                })
        
        except Exception as e:
            detalles.append({
                "posicion": idx + 1,
                "archivo": file.filename,
                "error": str(e)
            })
        
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    
    # Generar frase
    frase = ""
    if palabras_detectadas:
        try:
            frase = generar_frase(palabras_detectadas)
        except Exception as e:
            # Fallback: unir palabras con espacios
            frase = " ".join(palabras_detectadas)
            print(f"Error generando frase con T5: {e}")
    
    return {
        "success": True,
        "palabras_detectadas": palabras_detectadas,
        "frase_generada": frase,
        "detalles": detalles,
        "total_videos": len(files),
        "videos_aceptados": len(palabras_detectadas)
    }


# ============== EJECUTAR ==============

if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*60)
    print("🚀 Iniciando API de LSC Interpreter")
    print("="*60 + "\n")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info"
    )

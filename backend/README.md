# 🚀 LSC Interpreter - Backend API

API REST para interpretar Lenguaje de Señas Colombiano (LSC) y convertirlo en texto en español.

## 📋 Características

- **Clasificación de palabras LSC**: Reconoce 41 palabras del lenguaje de señas colombiano
- **Traducción a español natural**: Convierte secuencias de glosas en frases coherentes
- **API REST**: Endpoints documentados con FastAPI
- **Modelos de ML**: LSTM + T5 para clasificación y generación

## 🏗️ Arquitectura

```
Video → MediaPipe → Keypoints → LSTM → Palabra → T5 → Frase Natural
```

## 🔧 Instalación Local

### Prerequisitos
- Python 3.11+
- pip

### Pasos

```bash
# Clonar repositorio
git clone <tu-repo>
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt
```

## 📦 Modelos Necesarios

Debes tener los siguientes archivos en la carpeta `models/`:

```
models/
├── mejor_modelo_lsc.h5          # Modelo LSTM entrenado
├── config.pkl                    # Configuración
├── labels_dict.pkl               # Diccionario de labels
└── t5-lsc-finetuned/            # Modelo T5 (opcional)
    ├── config.json
    ├── pytorch_model.bin
    └── tokenizer_config.json
```

### Descargar Modelos

```bash
# Opción 1: Git LFS (si usas Git LFS)
git lfs pull

# Opción 2: Descargar manualmente
# [Link a Google Drive / OneDrive / etc.]

# Opción 3: Entrenar localmente
# Ver instrucciones en el repositorio principal
```

## ▶️ Ejecución

### Desarrollo

```bash
# Modo desarrollo (con reload automático)
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

### Producción

```bash
# Modo producción
uvicorn api:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker

```bash
# Build
docker build -t lsc-interpreter .

# Run
docker run -p 8000:8000 -v $(pwd)/models:/app/models lsc-interpreter
```

## 📚 Documentación API

Una vez ejecutando, visita:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔍 Endpoints

### `GET /`
Información general de la API

### `GET /health`
Estado de salud de la API y modelos

**Response:**
```json
{
  "status": "healthy",
  "models_loaded": true,
  "available_words": 41
}
```

### `GET /palabras-disponibles`
Lista de palabras que el modelo puede reconocer

**Response:**
```json
{
  "total": 41,
  "palabras": ["hola", "buenos-dias", ...]
}
```

### `POST /predict`
Predice la palabra de un video

**Request:**
- `file`: Video en formato MP4, MOV, AVI, etc.

**Response:**
```json
{
  "success": true,
  "palabra": "hola",
  "confianza": 0.95,
  "frames_procesados": 30
}
```

**Ejemplo cURL:**
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@video.mp4"
```

### `POST /predict-sequence`
Predice una secuencia de videos y genera frase

**Request:**
- `files`: Lista de videos (orden importa)
- `umbral_confianza`: (opcional) Confianza mínima (default: 0.7)

**Response:**
```json
{
  "success": true,
  "palabras_detectadas": ["hola", "como", "estar"],
  "frase_generada": "Hola, ¿cómo estás?",
  "detalles": [...],
  "total_videos": 3,
  "videos_aceptados": 3
}
```

**Ejemplo Python:**
```python
import requests

files = [
    ("files", open("video1.mp4", "rb")),
    ("files", open("video2.mp4", "rb")),
    ("files", open("video3.mp4", "rb"))
]

response = requests.post(
    "http://localhost:8000/predict-sequence",
    files=files
)

print(response.json())
```

## 🌐 Deployment

### Heroku

```bash
# Login
heroku login

# Crear app
heroku create lsc-interpreter

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

### Railway

```bash
# Instalar CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### AWS EC2

```bash
# Conectar a instancia
ssh -i key.pem ubuntu@ec2-instance

# Clonar y configurar
git clone <repo>
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Ejecutar con supervisor/systemd
```

### Docker + DigitalOcean

```bash
# Build y push a Docker Hub
docker build -t usuario/lsc-interpreter .
docker push usuario/lsc-interpreter

# En DigitalOcean, crear droplet y:
docker pull usuario/lsc-interpreter
docker run -d -p 80:8000 usuario/lsc-interpreter
```

## 🔒 Variables de Entorno

Crear archivo `.env`:

```bash
# API
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4

# Modelos
MODELS_PATH=./models
MAX_UPLOAD_SIZE=50MB

# CORS
CORS_ORIGINS=*

# Opcional: GPU
USE_GPU=false
```

Cargar en `api.py`:
```python
from dotenv import load_dotenv
load_dotenv()
```

## 📊 Palabras Reconocidas (41 total)

### Saludos y Tiempo
hola, buenos-dias, buenas-noches, tarde, año, futuro, pasado, ya

### Personas
yo, el-ella, hombre, mujer, adulto, bebe, anciano, hijo, persona, sordo, ellas-ellos, ellos-dos-ellas-dos

### Verbos
ir, llegar, comprar, dormir, jugar, nacer, necesitar, ver, visitar, pedalear-bicleta

### Objetos y Lugares
balon, bus, casas, futbol, hambre, pais, reunion

### Otros
algunos, cada-uno, otro, un

## 🐛 Troubleshooting

### Error: "Modelos no cargados"
**Solución**: Asegúrate de tener los archivos en `models/`

### Error: "No se detectaron keypoints"
**Solución**: El video debe mostrar manos claramente visibles

### Performance lento
**Solución**: 
- Usar GPU (configurar TensorFlow/PyTorch con CUDA)
- Aumentar workers de Uvicorn
- Implementar caché

### Error de memoria
**Solución**:
- Limitar tamaño de upload
- Procesar videos en streaming
- Aumentar RAM del servidor

## 📈 Performance

- **Latencia por video**: 1-3 segundos (CPU)
- **Latencia por video**: 0.3-0.8 segundos (GPU)
- **Accuracy**: 85-95%
- **Throughput**: ~10-20 req/s (depende de hardware)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE

## 👥 Autores

- [Tu nombre] - *Trabajo inicial*

## 🙏 Agradecimientos

- Dataset LSC
- MediaPipe de Google
- Comunidad de personas sordas colombianas

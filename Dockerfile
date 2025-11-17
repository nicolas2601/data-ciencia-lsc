# Dockerfile optimizado para Coolify - LSC Interpreter API
# Imagen base ligera con Python 3.11
FROM python:3.11-slim-bullseye

# Metadatos del contenedor
LABEL maintainer="nicolas2601"
LABEL description="API para interpretación de Lenguaje de Señas Colombiano"
LABEL version="1.0.0"

# Variables de entorno para optimización
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DEBIAN_FRONTEND=noninteractive \
    TF_USE_LEGACY_KERAS=1 \
    TF_CPP_MIN_LOG_LEVEL=2

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgl1-mesa-glx \
    libgstreamer1.0-0 \
    libgstreamer-plugins-base1.0-0 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Crear usuario no-root para seguridad
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Crear directorio de trabajo
WORKDIR /app

# Copiar requirements primero para aprovechar cache de Docker
COPY backend/requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación
COPY backend/ .

# Crear directorios necesarios
RUN mkdir -p models utils logs temp && \
    mkdir -p /home/appuser/.cache/huggingface/hub && \
    mkdir -p /tmp/matplotlib && \
    chown -R appuser:appuser /home/appuser /tmp /app

# Variables de entorno para cache
ENV TRANSFORMERS_CACHE=/tmp/huggingface \
    MPLCONFIGDIR=/tmp/matplotlib \
    HF_HOME=/tmp/huggingface

# Cambiar al usuario no-root
USER appuser

# Puerto que expone la aplicación
EXPOSE 8002

# Healthcheck para Coolify
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8002/health || exit 1

# Comando de inicio optimizado para producción
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8002", "--workers", "1", "--access-log"]

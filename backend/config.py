"""
Configuración de la aplicación
Carga variables de entorno y proporciona valores por defecto
"""

import os
from pathlib import Path
from typing import List


class Settings:
    """Configuración de la aplicación"""
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent
    MODELS_PATH: Path = BASE_DIR / os.getenv("MODELS_PATH", "models")
    
    # API
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    API_WORKERS: int = int(os.getenv("API_WORKERS", "4"))
    
    # CORS
    CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS", "*").split(",")
    
    # Upload
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))
    
    # Procesamiento
    MAX_FRAMES_PER_VIDEO: int = int(os.getenv("MAX_FRAMES_PER_VIDEO", "30"))
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.7"))
    
    # GPU
    USE_GPU: bool = os.getenv("USE_GPU", "false").lower() == "true"
    CUDA_VISIBLE_DEVICES: str = os.getenv("CUDA_VISIBLE_DEVICES", "0")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: Path = BASE_DIR / os.getenv("LOG_FILE", "logs/api.log")
    
    # Seguridad (opcional)
    API_KEY: str = os.getenv("API_KEY", "")
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    # Cache (opcional)
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "3600"))
    
    # Monitoring (opcional)
    SENTRY_DSN: str = os.getenv("SENTRY_DSN", "")
    PROMETHEUS_ENABLED: bool = os.getenv("PROMETHEUS_ENABLED", "false").lower() == "true"
    
    @classmethod
    def validate(cls):
        """Valida que la configuración sea correcta"""
        if not cls.MODELS_PATH.exists():
            raise FileNotFoundError(f"Carpeta de modelos no encontrada: {cls.MODELS_PATH}")
        
        required_files = [
            cls.MODELS_PATH / "mejor_modelo_lsc.h5",
            cls.MODELS_PATH / "config.pkl",
            cls.MODELS_PATH / "labels_dict.pkl"
        ]
        
        for file in required_files:
            if not file.exists():
                raise FileNotFoundError(f"Archivo requerido no encontrado: {file}")
        
        print("✅ Configuración validada correctamente")
    
    @classmethod
    def summary(cls):
        """Muestra un resumen de la configuración"""
        print("\n" + "="*60)
        print("⚙️  CONFIGURACIÓN DE LA API")
        print("="*60)
        print(f"🌐 Host: {cls.API_HOST}:{cls.API_PORT}")
        print(f"👷 Workers: {cls.API_WORKERS}")
        print(f"📁 Modelos: {cls.MODELS_PATH}")
        print(f"🎬 Max frames: {cls.MAX_FRAMES_PER_VIDEO}")
        print(f"📊 Threshold: {cls.CONFIDENCE_THRESHOLD}")
        print(f"🖥️  GPU: {'Activada' if cls.USE_GPU else 'Desactivada'}")
        print(f"📝 Log level: {cls.LOG_LEVEL}")
        print("="*60 + "\n")


# Instancia global de configuración
settings = Settings()


# Cargar .env si existe
def load_env():
    """Carga variables de entorno desde archivo .env"""
    env_file = Settings.BASE_DIR / ".env"
    if env_file.exists():
        from dotenv import load_dotenv
        load_dotenv(env_file)
        print(f"✅ Variables de entorno cargadas desde {env_file}")
    else:
        print("⚠️  Archivo .env no encontrado, usando valores por defecto")


if __name__ == "__main__":
    # Test de configuración
    load_env()
    settings.summary()
    try:
        settings.validate()
    except FileNotFoundError as e:
        print(f"❌ Error de validación: {e}")

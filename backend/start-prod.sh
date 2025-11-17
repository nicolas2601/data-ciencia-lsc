#!/bin/bash
# Script de inicio optimizado para producción en Coolify

set -e

echo "🚀 Iniciando LSC Interpreter API en modo producción..."

# Verificar que los modelos existen
if [ ! -d "/app/models" ]; then
    echo "⚠️  Directorio de modelos no encontrado, creando..."
    mkdir -p /app/models
fi

# Verificar conectividad
echo "🔍 Verificando conectividad..."
python -c "import tensorflow as tf; print(f'TensorFlow: {tf.__version__}')"
python -c "import transformers; print(f'Transformers: {transformers.__version__}')"

# Iniciar la aplicación
echo "🎯 Iniciando servidor..."
exec uvicorn api:app \
    --host 0.0.0.0 \
    --port 8002 \
    --workers 1 \
    --access-log \
    --log-level info \
    --no-server-header

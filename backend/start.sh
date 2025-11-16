#!/bin/bash
# Script para iniciar el backend de LSC Interpreter

echo "=========================================="
echo "🚀 LSC Interpreter Backend"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si estamos en el directorio correcto
if [ ! -f "api.py" ]; then
    echo -e "${RED}❌ Error: api.py no encontrado${NC}"
    echo "   Por favor ejecuta desde el directorio backend/"
    exit 1
fi

# Verificar modelos
echo "🔍 Verificando modelos..."
if [ ! -d "models" ]; then
    echo -e "${RED}❌ Error: Carpeta models/ no encontrada${NC}"
    echo ""
    echo "💡 Debes copiar los modelos entrenados:"
    echo "   cp -r ../models/ ./models/"
    exit 1
fi

if [ ! -f "models/mejor_modelo_lsc.h5" ]; then
    echo -e "${RED}❌ Error: Modelo LSTM no encontrado${NC}"
    echo "   Archivo faltante: models/mejor_modelo_lsc.h5"
    exit 1
fi

if [ ! -f "models/config.pkl" ]; then
    echo -e "${RED}❌ Error: Configuración no encontrada${NC}"
    echo "   Archivo faltante: models/config.pkl"
    exit 1
fi

echo -e "${GREEN}✅ Modelos encontrados${NC}"
echo ""

# Verificar entorno virtual
echo "🔍 Verificando entorno virtual..."
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Entorno virtual no encontrado. Creando...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✅ Entorno virtual creado${NC}"
fi

# Activar entorno virtual
source venv/bin/activate

# Verificar dependencias
echo "🔍 Verificando dependencias..."
if ! python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Dependencias no instaladas. Instalando...${NC}"
    pip install --quiet -r requirements.txt
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
fi

echo ""

# Modo de ejecución
MODE=${1:-dev}

if [ "$MODE" = "dev" ]; then
    echo "🛠️  Modo: Desarrollo (con auto-reload)"
    echo "📡 URL: http://localhost:8000"
    echo "📚 Docs: http://localhost:8000/docs"
    echo ""
    echo "Presiona Ctrl+C para detener"
    echo "=========================================="
    echo ""
    
    uvicorn api:app --reload --host 0.0.0.0 --port 8000

elif [ "$MODE" = "prod" ]; then
    WORKERS=${2:-4}
    echo "🏭 Modo: Producción (sin auto-reload)"
    echo "👷 Workers: $WORKERS"
    echo "📡 URL: http://localhost:8000"
    echo ""
    echo "Presiona Ctrl+C para detener"
    echo "=========================================="
    echo ""
    
    uvicorn api:app --host 0.0.0.0 --port 8000 --workers $WORKERS

elif [ "$MODE" = "test" ]; then
    echo "🧪 Modo: Test"
    echo ""
    
    # Iniciar servidor en background
    uvicorn api:app --host 0.0.0.0 --port 8000 &
    API_PID=$!
    
    # Esperar a que inicie
    echo "⏳ Esperando que la API inicie..."
    sleep 5
    
    # Ejecutar tests
    python test_api.py
    TEST_EXIT_CODE=$?
    
    # Detener servidor
    kill $API_PID
    
    exit $TEST_EXIT_CODE

else
    echo -e "${RED}❌ Modo no reconocido: $MODE${NC}"
    echo ""
    echo "Uso:"
    echo "  ./start.sh           # Modo desarrollo"
    echo "  ./start.sh dev       # Modo desarrollo"
    echo "  ./start.sh prod [N]  # Modo producción (N workers)"
    echo "  ./start.sh test      # Ejecutar tests"
    exit 1
fi

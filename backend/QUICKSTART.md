# ⚡ Quickstart - LSC Interpreter Backend

## 🎯 Objetivo

Levantar la API del LSC Interpreter en 5 minutos.

---

## 📋 Prerequisitos

- ✅ Python 3.11+
- ✅ Modelos entrenados en `models/`

---

## 🚀 Opción 1: Script Automático (Recomendado)

```bash
cd backend
./start.sh
```

El script:
1. Verifica que los modelos existan
2. Crea entorno virtual si no existe
3. Instala dependencias
4. Inicia el servidor

**Acceder**: http://localhost:8000/docs

---

## 🔧 Opción 2: Manual

### 1. Copiar Modelos

```bash
# Desde el directorio DATACIENCIA/
cp -r models/ backend/models/
```

### 2. Instalar Dependencias

```bash
cd backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar paquetes
pip install -r requirements.txt
```

### 3. Iniciar Servidor

```bash
# Desarrollo (con auto-reload)
uvicorn api:app --reload --host 0.0.0.0 --port 8000

# Producción (4 workers)
uvicorn api:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 🐳 Opción 3: Docker

```bash
cd backend

# Build
docker build -t lsc-interpreter .

# Run
docker run -p 8000:8000 -v $(pwd)/models:/app/models lsc-interpreter
```

**O con Docker Compose:**

```bash
docker-compose up
```

---

## ✅ Verificar que Funciona

### 1. Health Check

```bash
curl http://localhost:8000/health
```

**Response esperado:**
```json
{
  "status": "healthy",
  "models_loaded": true,
  "available_words": 41
}
```

### 2. Ejecutar Tests

```bash
python test_api.py
```

### 3. Probar con Video

```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@path/to/video.mp4"
```

---

## 📚 Documentación Completa

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **README Completo**: [README.md](README.md)
- **Guía de Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🐛 Troubleshooting

### Error: "Modelos no cargados"

```bash
# Copiar modelos desde el directorio principal
cd backend
cp -r ../models/ ./models/

# Verificar
ls -la models/
```

Debes ver:
- `mejor_modelo_lsc.h5`
- `config.pkl`
- `labels_dict.pkl`
- `t5-lsc-finetuned/` (opcional)

### Error: "Module not found"

```bash
# Reinstalar dependencias
pip install -r requirements.txt
```

### Puerto 8000 en uso

```bash
# Cambiar puerto
uvicorn api:app --port 8080

# O matar proceso
lsof -ti:8000 | xargs kill -9
```

---

## 🎯 Próximos Pasos

1. ✅ API funcionando localmente
2. 🌐 Subir a GitHub
3. 🚀 Desplegar (ver [DEPLOYMENT.md](DEPLOYMENT.md))
4. 🎨 Crear frontend
5. 📱 Crear app móvil

---

**¡Listo! Ya tienes la API corriendo.** 🎉

Para deployment, ver [DEPLOYMENT.md](DEPLOYMENT.md).

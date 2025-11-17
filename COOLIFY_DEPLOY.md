# 🚀 Despliegue en Coolify - LSC Interpreter API

## 📋 Requisitos Previos

- Servidor con Coolify instalado
- Git LFS configurado en el repositorio
- Modelos entrenados subidos al repositorio

## 🔧 Configuración en Coolify

### 1. Crear Nueva Aplicación

1. Ve a tu panel de Coolify
2. Crea un nuevo proyecto: **LSC Interpreter**
3. Selecciona **Dockerfile** como tipo de aplicación
4. Conecta tu repositorio: `https://github.com/nicolas2601/data-ciencia-lsc.git`

### 2. Variables de Entorno

Configura estas variables en Coolify:

```bash
# API Configuration
API_HOST=0.0.0.0
API_PORT=8002
API_WORKERS=1

# TensorFlow Configuration
TF_USE_LEGACY_KERAS=1
TF_CPP_MIN_LOG_LEVEL=2
CUDA_VISIBLE_DEVICES=""

# CORS Configuration
CORS_ORIGINS=*
CORS_CREDENTIALS=true
CORS_METHODS=*
CORS_HEADERS=*

# Logging
LOG_LEVEL=info
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
```

### 3. Configuración del Build

- **Dockerfile**: `Dockerfile` (en la raíz del proyecto)
- **Build Context**: `.` (raíz del proyecto)
- **Puerto**: `8002`

### 4. Health Check

La aplicación incluye un endpoint de health check en `/health` que Coolify puede usar para verificar el estado.

### 5. Recursos Recomendados

- **CPU**: 1-2 vCPUs
- **RAM**: 2-4 GB (mínimo 2GB para cargar los modelos)
- **Storage**: 10-20 GB

## 📁 Estructura de Archivos

```
/
├── Dockerfile              # Configuración del contenedor
├── .dockerignore           # Archivos excluidos del build
├── COOLIFY_DEPLOY.md       # Documentación de despliegue
├── backend/
│   ├── api.py              # API principal
│   ├── requirements.txt    # Dependencias Python
│   ├── start-prod.sh       # Script de inicio para producción
│   ├── models/             # Modelos de ML (Git LFS)
│   └── utils/              # Utilidades
└── lsc-app-frontend/       # Frontend React Native (no se despliega)
```

## 🔍 Verificación del Despliegue

1. **Health Check**: `GET /health`
2. **API Info**: `GET /`
3. **Palabras Disponibles**: `GET /palabras-disponibles`

## 🐛 Troubleshooting

### Problema: Modelos no se cargan

**Solución**: Verificar que Git LFS esté configurado correctamente:

```bash
git lfs track "*.h5" "*.pkl"
git add .gitattributes
git commit -m "Configure Git LFS"
git push
```

### Problema: Error de memoria

**Solución**: Aumentar la memoria asignada a mínimo 2GB en Coolify.

### Problema: TensorFlow no funciona

**Solución**: Verificar que las variables de entorno estén configuradas:
- `TF_USE_LEGACY_KERAS=1`
- `TF_CPP_MIN_LOG_LEVEL=2`

## 📊 Monitoreo

- **Logs**: Disponibles en el panel de Coolify
- **Métricas**: CPU, RAM y red en tiempo real
- **Health Status**: Verificación automática cada 30 segundos

## 🔄 Actualizaciones

Para actualizar la aplicación:

1. Haz push de los cambios al repositorio
2. Coolify detectará automáticamente los cambios
3. Se iniciará un nuevo build y despliegue

## 🛡️ Seguridad

- La aplicación corre con usuario no-root
- CORS configurado para producción
- Health checks para disponibilidad
- Logs estructurados para auditoría

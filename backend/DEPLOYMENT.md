# 🚀 Guía de Deployment - LSC Interpreter Backend

## 📦 Preparación Pre-Deployment

### 1. Entrenar Modelos

Antes de desplegar, debes tener los modelos entrenados:

```bash
# En el directorio principal (DATACIENCIA/)
python dataset.py
python entrenar_lstm.py
python generar_frases_dataset.py
python fine_tune_t5.py
```

### 2. Copiar Modelos al Backend

```bash
# Desde DATACIENCIA/
cp -r models/ backend/models/
```

### 3. Verificar Estructura

```
backend/
├── api.py
├── config.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env
├── models/
│   ├── mejor_modelo_lsc.h5
│   ├── config.pkl
│   ├── labels_dict.pkl
│   └── t5-lsc-finetuned/
└── README.md
```

---

## 🌐 Opciones de Deployment

### 1️⃣ Heroku (Gratis/Fácil)

#### Preparación

```bash
cd backend

# Crear Procfile
echo "web: uvicorn api:app --host 0.0.0.0 --port \$PORT" > Procfile

# Crear runtime.txt
echo "python-3.11" > runtime.txt
```

#### Deploy

```bash
# Instalar Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Crear app
heroku create lsc-interpreter-api

# Subir modelos con Git LFS (si son pequeños)
git lfs install
git lfs track "*.h5"
git lfs track "*.pkl"
git add .gitattributes

# Deploy
git add .
git commit -m "Deploy backend"
git push heroku main

# Ver logs
heroku logs --tail

# Abrir
heroku open
```

**⚠️ Limitación**: Archivos > 100MB necesitan Git LFS Pro o almacenamiento externo.

---

### 2️⃣ Railway (Recomendado)

Railway es más fácil y tiene mejor soporte para archivos grandes.

#### Deploy

```bash
cd backend

# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Deploy
railway up

# Ver logs
railway logs

# Obtener URL
railway domain
```

**💡 Ventajas**:
- Deploy automático desde GitHub
- 500 horas gratis/mes
- Soporta archivos grandes
- Dashboard intuitivo

---

### 3️⃣ Render (Simple)

#### Deploy desde GitHub

1. Push a GitHub:
   ```bash
   git add .
   git commit -m "Backend ready"
   git push origin main
   ```

2. En Render.com:
   - Click "New Web Service"
   - Conectar repositorio
   - Configurar:
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn api:app --host 0.0.0.0 --port $PORT`
     - **Python Version**: 3.11

3. Deploy automático en cada push

---

### 4️⃣ Docker + DigitalOcean

#### Preparación

```bash
cd backend

# Build imagen
docker build -t lsc-interpreter .

# Test local
docker run -p 8000:8000 -v $(pwd)/models:/app/models lsc-interpreter
```

#### Deploy en DigitalOcean

```bash
# 1. Crear Droplet (Ubuntu)
# - Plan: Basic ($6/mes)
# - RAM: 2GB mínimo

# 2. Conectar
ssh root@your-droplet-ip

# 3. Instalar Docker
apt update
apt install -y docker.io docker-compose

# 4. Clonar repo
git clone <tu-repo>
cd backend

# 5. Deploy
docker-compose up -d

# 6. Ver logs
docker-compose logs -f
```

---

### 5️⃣ AWS EC2 (Producción)

#### Preparación

```bash
# Crear instancia EC2 (t2.medium)
# Security Group: permitir puerto 8000
```

#### Deploy

```bash
# Conectar a EC2
ssh -i key.pem ubuntu@ec2-ip

# Instalar dependencias
sudo apt update
sudo apt install -y python3.11 python3-pip nginx

# Clonar repo
git clone <tu-repo>
cd backend

# Configurar entorno
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Crear servicio systemd
sudo nano /etc/systemd/system/lsc-api.service
```

**Archivo `/etc/systemd/system/lsc-api.service`:**
```ini
[Unit]
Description=LSC Interpreter API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/backend
Environment="PATH=/home/ubuntu/backend/venv/bin"
ExecStart=/home/ubuntu/backend/venv/bin/uvicorn api:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Iniciar servicio
sudo systemctl daemon-reload
sudo systemctl start lsc-api
sudo systemctl enable lsc-api
sudo systemctl status lsc-api

# Configurar Nginx (opcional)
sudo nano /etc/nginx/sites-available/lsc-api
```

**Archivo Nginx:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/lsc-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL con Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

---

### 6️⃣ Google Cloud Run (Serverless)

```bash
cd backend

# Instalar gcloud CLI
curl https://sdk.cloud.google.com | bash

# Login
gcloud auth login

# Configurar proyecto
gcloud config set project tu-proyecto-id

# Build y push
gcloud builds submit --tag gcr.io/tu-proyecto-id/lsc-interpreter

# Deploy
gcloud run deploy lsc-interpreter \
  --image gcr.io/tu-proyecto-id/lsc-interpreter \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300

# Obtener URL
gcloud run services describe lsc-interpreter --region us-central1
```

---

## 📊 Comparación de Opciones

| Plataforma | Costo | Facilidad | Performance | Archivos Grandes |
|------------|-------|-----------|-------------|------------------|
| **Heroku** | Gratis/$7/mes | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ |
| **Railway** | $5/mes | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ |
| **Render** | Gratis/$7/mes | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ |
| **DigitalOcean** | $6/mes | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ |
| **AWS EC2** | ~$15/mes | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ |
| **Cloud Run** | Pay-as-you-go | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ |

---

## 🔒 Seguridad en Producción

### Variables de Entorno

```bash
# Nunca commitear .env
echo ".env" >> .gitignore

# En producción, configurar:
API_KEY=tu-secret-key-aqui
CORS_ORIGINS=https://tu-frontend.com
```

### Rate Limiting

Instalar:
```bash
pip install slowapi
```

En `api.py`:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/predict")
@limiter.limit("10/minute")
async def predict(...):
    ...
```

### HTTPS

Siempre usar HTTPS en producción:
- Heroku/Railway/Render: Automático
- EC2/DO: Configurar Let's Encrypt (ver arriba)

---

## 📈 Monitoring

### Logs

```bash
# Heroku
heroku logs --tail

# Railway
railway logs

# Docker
docker-compose logs -f

# Systemd
journalctl -u lsc-api -f
```

### Uptime Monitoring

Servicios gratis:
- UptimeRobot: https://uptimerobot.com
- StatusCake: https://www.statuscake.com
- Pingdom: https://www.pingdom.com

### Performance

Instalar Sentry:
```bash
pip install sentry-sdk
```

```python
import sentry_sdk

sentry_sdk.init(
    dsn="tu-sentry-dsn",
    traces_sample_rate=1.0,
)
```

---

## 🚀 CI/CD Automático

### GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        run: |
          npm i -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## ✅ Checklist Post-Deployment

- [ ] API responde en la URL pública
- [ ] `/health` retorna status "healthy"
- [ ] `/palabras-disponibles` muestra 41 palabras
- [ ] `/predict` funciona con un video de prueba
- [ ] Logs están funcionando
- [ ] Monitoring configurado
- [ ] Variables de entorno seguras
- [ ] HTTPS habilitado
- [ ] Rate limiting configurado (opcional)
- [ ] Documentación actualizada con URL

---

## 🐛 Troubleshooting Deployment

### Error: "Modelos no cargados"
**Causa**: Archivos de modelos no están en el servidor  
**Solución**: Subir con Git LFS o almacenamiento externo (S3, Google Cloud Storage)

### Error: "Out of memory"
**Causa**: Instancia con poca RAM  
**Solución**: Aumentar RAM (mínimo 2GB) o usar modelo más pequeño

### Error: "Application timeout"
**Causa**: Procesamiento de video tarda mucho  
**Solución**: Aumentar timeout o usar GPU

### Respuesta lenta
**Solución**: 
- Usar GPU
- Aumentar workers de Uvicorn
- Implementar caché
- Usar CDN para modelos

---

## 📞 URLs de Documentación

Después del deployment, comparte:
- **API Docs**: `https://tu-dominio.com/docs`
- **Health Check**: `https://tu-dominio.com/health`
- **Repo GitHub**: `https://github.com/tu-usuario/lsc-interpreter`

---

**¡Deployment exitoso! 🎉**

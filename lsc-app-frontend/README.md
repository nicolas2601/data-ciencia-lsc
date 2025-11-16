# 📱 LSC Interpreter - App Móvil

App móvil en React Native para interpretar Lengua de Señas Colombiana (LSC) usando IA.

## ✨ Características

- 📹 **Grabación en tiempo real** con cámara frontal
- 🧠 **IA avanzada**: LSTM + Transformers (T5)
- 🎨 **Diseño moderno** con colores vibrantes
- ⚡ **Predicción rápida** con backend FastAPI
- 📊 **Resultados detallados** con métricas de confianza

## 🚀 Inicio Rápido

### 1️⃣ Instalar dependencias

```bash
cd lsc-app-frontend
pnpm install
```

### 2️⃣ Configurar backend

**IMPORTANTE**: Asegúrate de que el backend esté corriendo antes de usar la app.

```bash
# En otra terminal, desde la raíz del proyecto
cd backend
python api.py
```

El backend debe estar en `http://localhost:8000`

### 3️⃣ Configurar IP (solo si usas dispositivo físico)

Si vas a probar en un **dispositivo físico** (no simulador), necesitas cambiar la IP:

1. Abre `src/services/api.ts`
2. Cambia `http://localhost:8000` por tu IP local:

```typescript
// Ejemplo con tu IP local
const API_BASE_URL = 'http://192.168.1.100:8000';
```

Para encontrar tu IP:
- **Linux/Mac**: `ifconfig` o `ip addr`
- **Windows**: `ipconfig`

### 4️⃣ Ejecutar la app

```bash
pnpm start
```

Luego escanea el QR con **Expo Go**:
- 📱 **iOS**: [Expo Go en App Store](https://apps.apple.com/app/expo-go/id982107779)
- 🤖 **Android**: [Expo Go en Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## 📁 Estructura del Proyecto

```
lsc-app-frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── GradientButton.tsx
│   │   ├── ResultCard.tsx
│   │   └── CameraView.tsx
│   ├── screens/            # Pantallas principales
│   │   ├── HomeScreen.tsx
│   │   └── CameraScreen.tsx
│   ├── services/           # Servicios API
│   │   └── api.ts
│   └── types/              # Tipos TypeScript
│       └── index.ts
├── App.tsx                 # Componente principal
├── global.css              # Estilos TailwindCSS
└── tailwind.config.js      # Configuración Tailwind
```

## 🎨 Diseño

### Paleta de Colores

- **Primary** (Azul): `#0ea5e9` - Principal, botones
- **Secondary** (Magenta): `#d946ef` - Acentos
- **Success** (Verde): `#10b981` - Métricas positivas
- **Warning** (Naranja): `#f59e0b` - Alertas
- **Error** (Rojo): `#ef4444` - Errores

### Componentes

- **GradientButton**: Botones con gradientes vibrantes
- **ResultCard**: Card animada con resultados
- **CameraView**: Vista de cámara con guías visuales

## 🔧 Configuración Avanzada

### Cambiar tiempo máximo de grabación

Edita `src/components/CameraView.tsx`:

```typescript
const video = await cameraRef.current.recordAsync({
  maxDuration: 5, // Cambiar a 10, 15, etc.
});
```

### Cambiar API URL

Edita `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://tu-servidor:8000';
```

## 📱 Uso de la App

1. **Inicio**: Verifica que el servidor esté conectado
2. **Grabar**: Toca "Comenzar a Interpretar"
3. **Posicionar**: Coloca tus manos dentro del marco guía
4. **Grabar**: Toca el botón rojo para grabar (máx. 5 seg)
5. **Esperar**: La IA procesará el video
6. **Resultado**: Verás la traducción y métricas

## 🐛 Solución de Problemas

### ❌ "Servidor desconectado"

**Causa**: El backend no está corriendo o la IP es incorrecta.

**Solución**:
```bash
# Verificar que el backend esté corriendo
cd backend
python api.py

# Verificar que esté en http://localhost:8000
curl http://localhost:8000/health
```

### ❌ "Error de predicción"

**Causa**: El video no se pudo procesar.

**Solución**:
- Asegúrate de tener buena iluminación
- Mantén las manos visibles en el encuadre
- Graba por al menos 2-3 segundos

### ❌ App se cierra al abrir cámara

**Causa**: Permisos de cámara no otorgados.

**Solución**:
- iOS: Configuración → LSC Interpreter → Permitir Cámara
- Android: Configuración → Apps → LSC Interpreter → Permisos

### ❌ "Cannot find module"

**Causa**: Dependencias no instaladas.

**Solución**:
```bash
rm -rf node_modules
pnpm install
```

## 🛠️ Stack Tecnológico

- **React Native** 0.81
- **Expo** 54
- **TypeScript** 5.9
- **NativeWind** (TailwindCSS) 4.2
- **Expo Camera** 17
- **Axios** para HTTP
- **React Native Reanimated** para animaciones

## 📄 Licencia

Proyecto académico para el curso de Redes Neuronales.

## 👨‍💻 Desarrollo

```bash
# Modo desarrollo
pnpm start

# Limpiar cache
pnpm start -c

# Ver logs
pnpm start --clear
```

## 🎉 ¡Listo!

La app está configurada y lista para usar. Disfruta interpretando LSC con IA! 🚀

#!/usr/bin/env python3
"""
Script de prueba para la API
Verifica que todos los endpoints funcionen correctamente
"""

import requests
import sys
from pathlib import Path


API_URL = "http://localhost:8000"


def test_health():
    """Test del endpoint de health"""
    print("🔍 Testing /health...")
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Status: {data.get('status')}")
            print(f"   ✅ Modelos cargados: {data.get('models_loaded')}")
            print(f"   ✅ Palabras disponibles: {data.get('available_words')}")
            return True
        else:
            print(f"   ❌ Error: Status code {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"   ❌ Error: No se puede conectar a {API_URL}")
        print("   💡 Asegúrate de que la API esté ejecutándose")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_root():
    """Test del endpoint root"""
    print("\n🔍 Testing /...")
    try:
        response = requests.get(f"{API_URL}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Message: {data.get('message')}")
            print(f"   ✅ Version: {data.get('version')}")
            return True
        else:
            print(f"   ❌ Error: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_palabras_disponibles():
    """Test del endpoint de palabras disponibles"""
    print("\n🔍 Testing /palabras-disponibles...")
    try:
        response = requests.get(f"{API_URL}/palabras-disponibles", timeout=5)
        if response.status_code == 200:
            data = response.json()
            total = data.get('total', 0)
            palabras = data.get('palabras', [])
            print(f"   ✅ Total de palabras: {total}")
            print(f"   ✅ Primeras 5 palabras: {palabras[:5]}")
            return True
        else:
            print(f"   ❌ Error: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_predict(video_path=None):
    """Test del endpoint de predicción"""
    print("\n🔍 Testing /predict...")
    
    if not video_path:
        print("   ⚠️  No se proporcionó video de prueba")
        print("   💡 Uso: python test_api.py path/to/video.mp4")
        return None
    
    video_file = Path(video_path)
    if not video_file.exists():
        print(f"   ❌ Error: Archivo no encontrado: {video_path}")
        return False
    
    try:
        with open(video_file, 'rb') as f:
            files = {'file': (video_file.name, f, 'video/mp4')}
            response = requests.post(f"{API_URL}/predict", files=files, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Palabra detectada: {data.get('palabra')}")
            print(f"   ✅ Confianza: {data.get('confianza', 0):.2%}")
            print(f"   ✅ Frames procesados: {data.get('frames_procesados')}")
            return True
        else:
            print(f"   ❌ Error: Status code {response.status_code}")
            print(f"   ❌ Response: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def main():
    """Ejecuta todos los tests"""
    print("="*60)
    print("🧪 TESTS DE LA API LSC INTERPRETER")
    print("="*60)
    
    # Tests básicos
    results = []
    results.append(("Health Check", test_health()))
    results.append(("Root Endpoint", test_root()))
    results.append(("Palabras Disponibles", test_palabras_disponibles()))
    
    # Test de predicción (opcional)
    if len(sys.argv) > 1:
        video_path = sys.argv[1]
        result = test_predict(video_path)
        if result is not None:
            results.append(("Predicción", result))
    else:
        print("\n💡 Para probar el endpoint /predict:")
        print("   python test_api.py path/to/video.mp4")
    
    # Resumen
    print("\n" + "="*60)
    print("📊 RESUMEN DE TESTS")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {status} - {name}")
    
    print("-"*60)
    print(f"   Total: {passed}/{total} tests pasaron")
    print("="*60)
    
    # Exit code
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()

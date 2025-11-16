import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface CameraViewComponentProps {
  onVideoRecorded: (uri: string) => void;
}

export const CameraViewComponent: React.FC<CameraViewComponentProps> = ({ onVideoRecorded }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const startRecording = async () => {
    if (!cameraRef.current) return;
    
    try {
      setIsRecording(true);

      const video = await cameraRef.current.recordAsync({
        maxDuration: 5, // 5 segundos máximo
      });

      if (video?.uri) {
        onVideoRecorded(video.uri);
      }
    } catch (error) {
      console.error('Error grabando:', error);
      Alert.alert('Error', 'No se pudo grabar el video');
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  if (!permission) {
    return (
      <LinearGradient
        colors={['#1f2937', '#374151', '#4b5563']}
        style={styles.loadingContainer}
      >
        <View style={styles.loadingContent}>
          <MaterialCommunityIcons name="camera-off" size={64} color="#9ca3af" />
          <Text style={styles.loadingText}>Cargando cámara...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!permission.granted) {
    return (
      <LinearGradient
        colors={['#1f2937', '#374151', '#4b5563']}
        style={styles.permissionContainer}
      >
        <View style={styles.permissionContent}>
          <View style={styles.permissionIcon}>
            <MaterialCommunityIcons name="camera-off" size={64} color="#ef4444" />
          </View>
          <Text style={styles.permissionTitle}>
            Permiso de cámara requerido
          </Text>
          <Text style={styles.permissionSubtitle}>
            Necesitamos acceso a tu cámara para grabar las señas
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={styles.permissionButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.permissionButtonGradient}
            >
              <Text style={styles.permissionButtonText}>Dar Permiso</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      >
        {/* Overlay hermoso con guías */}
        <View style={styles.overlay}>
          {/* Header elegante */}
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent']}
            style={styles.header}
          >
            <Text style={styles.statusText}>
              {isRecording ? '🔴 Grabando...' : '📹 Listo para grabar'}
            </Text>
            {!isRecording && (
              <Text style={styles.instructionText}>
                Coloca tus manos dentro del marco
              </Text>
            )}
          </LinearGradient>

          {/* Guías visuales hermosas */}
          <View style={styles.guidesContainer}>
            <View style={styles.guideFrame}>
              <View style={[styles.guideCorner, styles.topLeft]} />
              <View style={[styles.guideCorner, styles.topRight]} />
              <View style={[styles.guideCorner, styles.bottomLeft]} />
              <View style={[styles.guideCorner, styles.bottomRight]} />
            </View>
          </View>

          {/* Botón de grabar súper hermoso */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
            style={styles.footer}
          >
            <View style={styles.recordButtonContainer}>
              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                style={[
                  styles.recordButton,
                  { backgroundColor: isRecording ? '#ef4444' : '#ffffff' }
                ]}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={isRecording ? 'stop' : 'record'}
                  size={40}
                  color={isRecording ? 'white' : '#ef4444'}
                />
              </TouchableOpacity>
            </View>
            {!isRecording && (
              <Text style={styles.recordText}>
                Toca para grabar (máx. 5 seg)
              </Text>
            )}
          </LinearGradient>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 16,
  },
  
  // Permission screen
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 32,
  },
  permissionIcon: {
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionSubtitle: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  permissionButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Camera
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  instructionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  
  // Guides
  guidesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: 280,
    height: 350,
    position: 'relative',
  },
  guideCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#3b82f6',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  
  // Footer
  footer: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  recordButtonContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  recordText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

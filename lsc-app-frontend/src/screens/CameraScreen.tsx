import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraViewComponent } from '../components/CameraView';
import { ResultCard } from '../components/ResultCard';
import { GradientButton } from '../components/GradientButton';
import { predictSign } from '../services/api';
import type { PredictionResponse } from '../types';

interface CameraScreenProps {
  onBack: () => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({ onBack }) => {
  const [showCamera, setShowCamera] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);

  const handleVideoRecorded = async (uri: string) => {
    console.log('Video grabado:', uri);
    setShowCamera(false);
    setLoading(true);

    try {
      const prediction = await predictSign(uri);
      setResult(prediction);
    } catch (error) {
      console.error('Error en predicción:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'No se pudo procesar el video',
        [
          {
            text: 'Reintentar',
            onPress: () => {
              setShowCamera(true);
              setResult(null);
            },
          },
          { text: 'Volver', onPress: onBack },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setShowCamera(true);
    setResult(null);
  };

  if (showCamera) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.cameraContainer}>
          <CameraViewComponent onVideoRecorded={handleVideoRecorded} />
          
          {/* Botón de volver elegante */}
          <View style={styles.backButtonContainer}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0', '#ffffff']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header hermoso */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.headerBackButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Resultado</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingCard}>
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text style={styles.loadingTitle}>
                    🧠 Procesando señas...
                  </Text>
                  <Text style={styles.loadingSubtitle}>
                    Esto puede tardar unos segundos
                  </Text>
                </View>
              </View>
            ) : result ? (
              <View>
                <ResultCard
                  palabras={result.palabras}
                  frase={result.frase}
                  confianza={result.confianza}
                  tiempoProcesamiento={result.tiempo_procesamiento}
                />

                {/* Botones de acción hermosos */}
                <View style={styles.actionButtons}>
                  <GradientButton
                    onPress={handleTryAgain}
                    title="🔄 Grabar otra seña"
                    variant="primary"
                  />
                  <TouchableOpacity
                    onPress={onBack}
                    style={styles.secondaryButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.secondaryButtonText}>
                      ← Volver al inicio
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Tip elegante */}
                <View style={styles.tipCard}>
                  <View style={styles.tipHeader}>
                    <MaterialCommunityIcons name="lightbulb-on" size={20} color="#3b82f6" />
                    <Text style={styles.tipTitle}>💡 Consejo</Text>
                  </View>
                  <Text style={styles.tipText}>
                    Para mejores resultados, asegúrate de tener buena iluminación y que tus 
                    manos estén completamente visibles en el encuadre.
                  </Text>
                </View>
              </View>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  // Camera styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  // Results screen styles
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerBackButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 16,
  },
  headerSpacer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Action buttons
  actionButtons: {
    marginTop: 24,
    gap: 16,
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  
  // Tip card
  tipCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});

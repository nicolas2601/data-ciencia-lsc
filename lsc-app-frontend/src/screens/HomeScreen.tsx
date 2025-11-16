import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientButton } from '../components/GradientButton';
import { checkHealth, getAvailableWords } from '../services/api';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  onNavigateToCamera: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToCamera }) => {
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    setLoading(true);
    try {
      const status = await checkHealth();
      setIsServerOnline(status);
      
      if (status) {
        const words = await getAvailableWords();
        setAvailableWords(words);
      }
    } catch (error) {
      setIsServerOnline(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPress = () => {
    if (!isServerOnline) {
      Alert.alert(
        '⚠️ Servidor desconectado',
        'El servidor backend no está disponible. Asegúrate de que esté corriendo en http://localhost:8000',
        [
          { text: 'Reintentar', onPress: checkServerStatus },
          { text: 'Continuar', onPress: onNavigateToCamera, style: 'cancel' }
        ]
      );
      return;
    }
    onNavigateToCamera();
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <LinearGradient
        colors={['#1e40af', '#3b82f6', '#60a5fa']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header con diseño hermoso */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  style={styles.logoGradient}
                >
                  <MaterialCommunityIcons name="sign-language" size={80} color="#1e40af" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>LSC Interpreter</Text>
              <Text style={styles.subtitle}>Lenguaje de Señas Colombiano</Text>
              <View style={styles.decorativeLine} />
            </View>

            {/* Estado del servidor con diseño moderno */}
            <View style={styles.statusCard}>
              <TouchableOpacity 
                onPress={checkServerStatus}
                style={[
                  styles.statusButton,
                  { backgroundColor: loading ? '#f1f5f9' : isServerOnline ? '#dcfce7' : '#fee2e2' }
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.statusIconContainer}>
                  <MaterialCommunityIcons
                    name={loading ? 'loading' : isServerOnline ? 'check-circle' : 'alert-circle'}
                    size={28}
                    color={loading ? '#64748b' : isServerOnline ? '#16a34a' : '#dc2626'}
                  />
                </View>
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusTitle}>
                    {loading ? 'Verificando servidor...' : isServerOnline ? 'Servidor conectado' : 'Servidor desconectado'}
                  </Text>
                  <Text style={styles.statusSubtitle}>
                    {loading ? 'Un momento...' : isServerOnline ? `${availableWords.length} palabras disponibles` : 'Toca para reintentar'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Features con diseño elegante */}
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>✨ Características</Text>
              
              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: '#dbeafe' }]}>
                  <MaterialCommunityIcons name="camera" size={28} color="#1d4ed8" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Grabación inteligente</Text>
                  <Text style={styles.featureDescription}>Captura automática de 5 segundos</Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: '#ede9fe' }]}>
                  <MaterialCommunityIcons name="brain" size={28} color="#7c3aed" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>IA de última generación</Text>
                  <Text style={styles.featureDescription}>LSTM + Transformers (77% accuracy)</Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: '#dcfce7' }]}>
                  <MaterialCommunityIcons name="translate" size={28} color="#16a34a" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Traducción automática</Text>
                  <Text style={styles.featureDescription}>De señas a español natural</Text>
                </View>
              </View>
            </View>

            {/* Botón principal rediseñado */}
            <View style={styles.buttonContainer}>
              <GradientButton
                onPress={handleStartPress}
                title="🚀 Comenzar a Interpretar"
                loading={loading}
              />
            </View>

            {/* Footer elegante */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Desarrollado con ❤️ para el curso de Redes Neuronales
              </Text>
              <Text style={styles.versionText}>
                v1.0.0 • React Native + TensorFlow + T5
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 16,
  },
  decorativeLine: {
    width: 60,
    height: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    opacity: 0.8,
  },
  statusCard: {
    marginBottom: 40,
  },
  statusButton: {
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  featuresSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
  },
});

export default HomeScreen;

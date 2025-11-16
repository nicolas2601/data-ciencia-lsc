import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ResultCardProps {
  palabras: string[];
  frase: string;
  confianza: number;
  tiempoProcesamiento: number;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  palabras,
  frase,
  confianza,
  tiempoProcesamiento,
}) => {
  return (
    <View style={styles.container}>
      {/* Header hermoso */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="hand-wave" size={32} color="#3b82f6" />
        </View>
        <Text style={styles.title}>
          Resultado
        </Text>
      </View>

      {/* Frase traducida con gradiente */}
      <LinearGradient
        colors={['#dbeafe', '#bfdbfe', '#93c5fd']}
        style={styles.phraseCard}
      >
        <Text style={styles.phraseLabel}>
          📝 FRASE TRADUCIDA
        </Text>
        <Text style={styles.phraseText}>
          {frase}
        </Text>
      </LinearGradient>

      {/* Palabras detectadas */}
      <View style={styles.wordsSection}>
        <Text style={styles.wordsLabel}>
          🔤 PALABRAS DETECTADAS ({palabras.length})
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.wordsScrollView}
          contentContainerStyle={styles.wordsScrollContent}
        >
          {palabras.map((palabra, index) => (
            <View
              key={index}
              style={styles.wordChip}
            >
              <Text style={styles.wordText}>
                {palabra}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Métricas hermosas */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: '#dcfce7' }]}>
            <MaterialCommunityIcons name="speedometer" size={24} color="#16a34a" />
          </View>
          <Text style={styles.metricLabel}>Confianza</Text>
          <Text style={[styles.metricValue, { color: '#16a34a' }]}>
            {(confianza * 100).toFixed(1)}%
          </Text>
        </View>
        
        <View style={styles.metricDivider} />
        
        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: '#fed7aa' }]}>
            <MaterialCommunityIcons name="timer-outline" size={24} color="#ea580c" />
          </View>
          <Text style={styles.metricLabel}>Tiempo</Text>
          <Text style={[styles.metricValue, { color: '#ea580c' }]}>
            {tiempoProcesamiento.toFixed(2)}s
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  phraseCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  phraseLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  phraseText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    lineHeight: 28,
  },
  wordsSection: {
    marginBottom: 24,
  },
  wordsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 12,
  },
  wordsScrollView: {
    marginBottom: 8,
  },
  wordsScrollContent: {
    paddingRight: 16,
  },
  wordChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  wordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
  },
});

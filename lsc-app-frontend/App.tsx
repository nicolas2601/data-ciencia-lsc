import './global.css';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import { CameraScreen } from './src/screens/CameraScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'camera'>('home');

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {currentScreen === 'home' ? (
        <HomeScreen onNavigateToCamera={() => setCurrentScreen('camera')} />
      ) : (
        <CameraScreen onBack={() => setCurrentScreen('home')} />
      )}
    </SafeAreaProvider>
  );
}

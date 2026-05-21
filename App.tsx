import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
// IMPORTANTE: Importamos el NavigationContainer
import { NavigationContainer } from '@react-navigation/native';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AppNavigator from './src/navigation/AppNavigator';

const Router = () => {
  const { session, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF5A5F" />
      </View>
    );
  }

  // Si hay sesión, devolvemos el NAVEGADOR COMPLETO DE PESTAÑAS
  if (session && session.user) {
    return <AppNavigator />;
  }

  // Si no hay sesión, devolvemos las pantallas sueltas públicas
  return showLogin ? (
    <LoginScreen onNavigateToRegister={() => setShowLogin(false)} />
  ) : (
    <RegisterScreen onNavigateToLogin={() => setShowLogin(true)} />
  );
};

export default function App() {
  return (
    <AuthProvider>
      {/* TODO debe ir envuelto en el NavigationContainer */}
      <NavigationContainer>
        <Router />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
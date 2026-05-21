import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { FeaturedCarousel, FeaturedSpace } from '../components/FeaturedCarousel';
import { colors, typography, spacing } from '../theme';

// Datos extraídos del diseño Figma
const FEATURED_SPACES: FeaturedSpace[] = [
  {
    id: '1',
    imageUrl: require('../../assets/images/alabaster-oasis.png'),
    title: 'The Alabaster Oasis',
    subtitle: 'Spa Experience · Rain Shower',
    pricePerHour: 45,
    rating: 4.9,
  },
  {
    id: '2',
    imageUrl: require('../../assets/images/copper-hearth.png'),
    title: 'Copper Hearth Kitchen',
    subtitle: 'Pro Gear · Island Dining',
    pricePerHour: 28,
    rating: 4.8,
  },
  {
    id: '3',
    imageUrl: require('../../assets/images/zen-timber.png'),
    title: 'Zen Timber Retreat',
    subtitle: 'Japanese Soak · Cedar Scent',
    pricePerHour: 60,
    rating: 5.0,
  },
];

export default function HomeScreen() {
  const { profile } = useAuth();

  return (
    <View style={styles.masterContainer}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          <Text style={styles.title}>
            🏠 Bienvenido, {profile?.nombre || 'Viajero'}
          </Text>
          <Text style={styles.subtitle}>¡Has entrado a la zona privada!</Text>

          {/* Carrusel de espacios destacados */}
          <FeaturedCarousel
            title="Curated Escapes"
            subtitle="Handpicked sanctuaries near your current location"
            spaces={FEATURED_SPACES}
            onSpacePress={(id) => {
              // TODO: navegar a detalle del espacio
              console.log('Space pressed:', id);
            }}
            onViewAll={() => {
              // TODO: navegar a lista completa
              console.log('View all pressed');
            }}
          />

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  masterContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing[5],
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing[2],
    textAlign: 'center',
    paddingTop: spacing[5],
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing[8],
    textAlign: 'center',
  },
});

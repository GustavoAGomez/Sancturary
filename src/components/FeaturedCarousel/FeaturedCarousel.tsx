import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import SpaceCard, { SpaceCardProps } from './SpaceCard';
import { colors, typography, spacing, radii, shadows } from '../../theme';

// Cada item del carrusel extiende SpaceCard y añade un id
export interface FeaturedSpace extends Omit<SpaceCardProps, 'onPress' | 'onFavoritePress'> {
  id: string;
}

interface FeaturedCarouselProps {
  /** Título de la sección */
  title?: string;
  /** Subtítulo descriptivo */
  subtitle?: string;
  /** Lista de espacios a mostrar */
  spaces: FeaturedSpace[];
  /** Callback al pulsar "View all" */
  onViewAll?: () => void;
  /** Callback al pulsar una tarjeta */
  onSpacePress?: (spaceId: string) => void;
  /** Callback al pulsar favorito en una tarjeta */
  onFavoritePress?: (spaceId: string) => void;
}

export default function FeaturedCarousel({
  title = 'Curated Escapes',
  subtitle = 'Handpicked sanctuaries near your current location',
  spaces,
  onViewAll,
  onSpacePress,
  onFavoritePress,
}: FeaturedCarouselProps) {
  return (
    <View style={styles.container}>
      {/* Encabezado: título + "View all" */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={onViewAll}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View all</Text>
          <Text style={styles.viewAllChevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Carrusel horizontal de tarjetas */}
      <FlatList
        data={spaces}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
        ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
        renderItem={({ item }) => (
          <SpaceCard
            imageUrl={item.imageUrl}
            title={item.title}
            subtitle={item.subtitle}
            pricePerHour={item.pricePerHour}
            rating={item.rating}
            onPress={() => onSpacePress?.(item.id)}
            onFavoritePress={() => onFavoritePress?.(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingVertical: spacing[10],
    ...shadows.stickyFooter,
  },

  // --- Encabezado ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing[6] + spacing[2], // 24 + 8 = 32 (24 sección + 8 inner)
    marginBottom: spacing[8],
  },
  headerText: {
    flex: 1,
    gap: 4,
    marginRight: spacing[4],
  },
  title: {
    ...typography.h1,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.75,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // --- Botón "View all" ---
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    ...typography.buttonSmall,
    color: colors.primary,
  },
  viewAllChevron: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },

  // --- Carrusel ---
  carouselContent: {
    paddingHorizontal: spacing[6],
  },
  cardSeparator: {
    width: spacing[6],
  },
});

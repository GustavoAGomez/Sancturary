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

// Each carousel item extends SpaceCard and adds an id
export interface FeaturedSpace extends Omit<SpaceCardProps, 'onPress' | 'onFavoritePress'> {
  id: string;
}

interface FeaturedCarouselProps {
  /** Section title */
  title?: string;
  /** Descriptive subtitle */
  subtitle?: string;
  /** List of spaces to display */
  spaces: FeaturedSpace[];
  /** Callback when "View all" is pressed */
  onViewAll?: () => void;
  /** Callback when a card is pressed */
  onSpacePress?: (spaceId: string) => void;
  /** Callback when the favorite button on a card is pressed */
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
      {/* Header: title + "View all" */}
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

      {/* Horizontal carousel of cards */}
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

  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing[6] + spacing[2], // 24 + 8 = 32 (24 section + 8 inner)
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

  // --- "View all" button ---
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

  // --- Carousel ---
  carouselContent: {
    paddingHorizontal: spacing[6],
  },
  cardSeparator: {
    width: spacing[6],
  },
});

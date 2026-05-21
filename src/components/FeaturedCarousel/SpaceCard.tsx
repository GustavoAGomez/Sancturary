import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';

// Datos que necesita cada tarjeta de espacio
export interface SpaceCardProps {
  /** Imagen principal: require() local o { uri: string } */
  imageUrl: ImageSourcePropType;
  /** Nombre del espacio */
  title: string;
  /** Descripción corta (ej. "Spa Experience · Rain Shower") */
  subtitle: string;
  /** Precio por hora */
  pricePerHour: number;
  /** Puntuación promedio */
  rating: number;
  /** Callback al pulsar "View Details" */
  onPress?: () => void;
  /** Callback al pulsar el botón de favorito */
  onFavoritePress?: () => void;
}

export default function SpaceCard({
  imageUrl,
  title,
  subtitle,
  pricePerHour,
  rating,
  onPress,
  onFavoritePress,
}: SpaceCardProps) {
  return (
    <View style={styles.card}>
      {/* Imagen del espacio */}
      <View style={styles.imageContainer}>
        <Image
          source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl}
          style={styles.image}
        />

        {/* Badge de rating con blur */}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingIcon}>★</Text>
          <Text style={styles.ratingText}>{rating}</Text>
        </View>

        {/* Botón de favorito */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoritePress}
          activeOpacity={0.7}
        >
          <Text style={styles.favoriteIcon}>♡</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido inferior */}
      <View style={styles.content}>
        {/* Fila: info + precio */}
        <View style={styles.infoRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>

          <View style={styles.priceBlock}>
            <Text style={styles.price}>${pricePerHour}</Text>
            <Text style={styles.priceUnit}>/hr</Text>
          </View>
        </View>

        {/* Botón "View Details" */}
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CARD_WIDTH = 320;
const IMAGE_HEIGHT = 256;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.header,
  },

  // --- Imagen ---
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // --- Rating badge (esquina superior derecha) ---
  ratingBadge: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.overlayLight80,
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  ratingIcon: {
    fontSize: 11,
    color: colors.accent,
  },
  ratingText: {
    fontFamily: typography.label.fontFamily,
    fontSize: typography.label.fontSize,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  // --- Botón favorito (esquina superior izquierda) ---
  favoriteButton: {
    position: 'absolute',
    top: spacing[4],
    left: spacing[4],
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    fontSize: 12,
    color: colors.textPrimary,
  },

  // --- Contenido inferior ---
  content: {
    padding: spacing[6],
    gap: spacing[6],
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  titleBlock: {
    flex: 1,
    gap: 4,
    marginRight: spacing[3],
  },
  title: {
    ...typography.h3,
    fontSize: 20,
    lineHeight: 28,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: typography.label.fontSize,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontFamily: typography.bodySemiBold.fontFamily,
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  priceUnit: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: typography.label.fontSize,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  // --- Botón "View Details" ---
  detailsButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing[3],
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: {
    ...typography.buttonSmall,
    color: colors.textSecondary,
  },
});

/**
 * Sistema de spacing basado en múltiplos de 8px,
 * consistente con el grid del diseño Figma.
 */
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

// Atajos semánticos
export const insets = {
  /** Padding horizontal estándar de pantalla (24px en diseño) */
  screenHorizontal: spacing[6],
  /** Padding vertical del header (16px top) */
  headerTop: spacing[4],
  /** Padding inferior del header (24px) */
  headerBottom: spacing[6],
  /** Gap entre secciones principales */
  sectionGap: spacing[8],
  /** Gap entre elementos dentro de una card */
  cardInner: spacing[4],
} as const;

export type SpacingToken = keyof typeof spacing;

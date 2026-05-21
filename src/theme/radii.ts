/**
 * Border radius extraídos del diseño Figma.
 */
export const radii = {
  /** Cards de contenido, imágenes */
  md: 16,
  /** Botones CTA, cards grandes */
  lg: 32,
  /** Header AppBar, secciones extra redondeadas */
  xl: 48,
  /** Botones circulares, pills, badges, avatares */
  full: 9999,
} as const;

export type RadiiToken = keyof typeof radii;

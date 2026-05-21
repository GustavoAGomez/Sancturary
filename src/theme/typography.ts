import { TextStyle } from 'react-native';

/**
 * Tipografía extraída del diseño Figma — "The Sanctuary"
 *
 * Familias:
 *   - Headings → Plus Jakarta Sans (ExtraBold / Bold / SemiBold)
 *   - Body / UI → Inter (Regular / Medium / SemiBold)
 *
 * NOTA: Las fuentes deben cargarse con expo-font antes de usarse.
 *       Mientras no estén cargadas, RN usará la fuente por defecto del sistema.
 */

// Familias tipográficas
export const fontFamily = {
  headingExtraBold: 'PlusJakartaSans-ExtraBold',
  headingBold: 'PlusJakartaSans-Bold',
  headingSemiBold: 'PlusJakartaSans-SemiBold',
  bodyRegular: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  bodyItalic: 'Inter-Italic',
  bodySemiBoldItalic: 'Inter-SemiBoldItalic',
} as const;

// Escala de tamaños (px del diseño = puntos en RN)
export const fontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

// Alturas de línea proporcionales
export const lineHeight = {
  tight: 1.1,    // headings grandes
  snug: 1.25,    // headings medianos
  normal: 1.4,   // body text
  relaxed: 1.6,  // párrafos largos
} as const;

// Estilos tipográficos predefinidos (listos para usar en StyleSheet)
export const typography = {
  // --- Headings (Plus Jakarta Sans) ---
  h1: {
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['4xl'],
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    fontWeight: '800',
  } satisfies TextStyle,

  h2: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize['2xl'],
    lineHeight: fontSize['2xl'] * lineHeight.snug,
    fontWeight: '700',
  } satisfies TextStyle,

  h3: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.snug,
    fontWeight: '600',
  } satisfies TextStyle,

  h4: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.snug,
    fontWeight: '600',
  } satisfies TextStyle,

  // --- Body (Inter) ---
  bodyLarge: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.normal,
    fontWeight: '400',
  } satisfies TextStyle,

  body: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
    fontWeight: '400',
  } satisfies TextStyle,

  bodyMedium: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
    fontWeight: '500',
  } satisfies TextStyle,

  bodySemiBold: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
    fontWeight: '600',
  } satisfies TextStyle,

  // --- Labels / Captions ---
  label: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    fontWeight: '600',
  } satisfies TextStyle,

  caption: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
    fontWeight: '500',
    letterSpacing: 0.5,
  } satisfies TextStyle,

  // --- UI ---
  button: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.snug,
    fontWeight: '600',
  } satisfies TextStyle,

  buttonSmall: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.snug,
    fontWeight: '600',
  } satisfies TextStyle,

  tabLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    fontWeight: '500',
  } satisfies TextStyle,
} as const;

export type TypographyToken = keyof typeof typography;

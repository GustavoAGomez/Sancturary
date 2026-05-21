/**
 * Theme central — punto de acceso único a todos los tokens de diseño.
 *
 * Uso:
 *   import { theme } from '@/theme';
 *   // o importaciones granulares:
 *   import { colors } from '@/theme/colors';
 *
 * Ejemplo en StyleSheet:
 *   const styles = StyleSheet.create({
 *     container: {
 *       backgroundColor: theme.colors.background,
 *       padding: theme.spacing[6],
 *       borderRadius: theme.radii.md,
 *       ...theme.shadows.subtle,
 *     },
 *     title: {
 *       ...theme.typography.h1,
 *       color: theme.colors.textPrimary,
 *     },
 *   });
 */

export { colors } from './colors';
export type { ColorToken } from './colors';

export { fontFamily, fontSize, lineHeight, typography } from './typography';
export type { TypographyToken } from './typography';

export { spacing, insets } from './spacing';
export type { SpacingToken } from './spacing';

export { radii } from './radii';
export type { RadiiToken } from './radii';

export { shadows } from './shadows';
export type { ShadowToken } from './shadows';

// Objeto unificado para acceso con un solo import
import { colors } from './colors';
import { fontFamily, fontSize, lineHeight, typography } from './typography';
import { spacing, insets } from './spacing';
import { radii } from './radii';
import { shadows } from './shadows';

export const theme = {
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  typography,
  spacing,
  insets,
  radii,
  shadows,
} as const;

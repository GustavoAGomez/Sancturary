/**
 * Paleta de colores extraída del diseño Figma — "The Sanctuary"
 */

// Colores base (primitivos)
const palette = {
  teal600: '#006A62',
  teal400: '#26A69A',
  gold500: '#FFBF00',
  gold800: '#795900',
  gold900: '#6D5000',
  black: '#1A1C1C',
  gray900: '#222222',
  gray700: '#3D4947',
  gray500: '#6B7280',
  gray200: '#E8E8E8',
  gray100: '#F3F3F3',
  gray50: '#F9F9F9',
  white: '#FFFFFF',
} as const;

// Tokens semánticos: se referencian por uso, no por color
export const colors = {
  // --- Primario (Teal) ---
  primary: palette.teal600,
  primaryLight: palette.teal400,
  primaryShadow: 'rgba(0, 106, 98, 0.20)',
  primaryOverlay10: 'rgba(0, 106, 98, 0.10)',    // badge tints, fondo sutil
  primaryOverlay30: 'rgba(0, 106, 98, 0.30)',

  // --- Secundario / Accent (Gold) ---
  accent: palette.gold500,
  accentDark: palette.gold800,
  accentDarker: palette.gold900,
  accentOverlay10: 'rgba(255, 191, 0, 0.10)',
  accentOverlay20: 'rgba(255, 191, 0, 0.20)',

  // --- Texto ---
  textPrimary: palette.black,
  textSecondary: palette.gray700,
  textMuted: palette.gray500,
  textInverse: palette.white,

  // --- Fondos ---
  background: palette.gray50,
  surface: palette.gray100,
  surfaceElevated: palette.white,

  // --- Bordes / Divisores ---
  border: palette.gray200,
  divider: palette.gray200,

  // --- Overlays ---
  overlayDark40: 'rgba(26, 28, 28, 0.40)',
  overlayDark60: 'rgba(26, 28, 28, 0.60)',
  overlayLight60: 'rgba(255, 255, 255, 0.60)',
  overlayLight80: 'rgba(255, 255, 255, 0.80)',

  // --- Glass / Blur ---
  glass10: 'rgba(188, 201, 198, 0.10)',
  glass15: 'rgba(188, 201, 198, 0.15)',
  glass20: 'rgba(188, 201, 198, 0.20)',
  glass30: 'rgba(188, 201, 198, 0.30)',
  glassFrost50: 'rgba(243, 243, 243, 0.50)',
  glassFrost60: 'rgba(226, 226, 226, 0.60)',

  // --- Estados / Transparencias funcionales ---
  shadowSubtle: 'rgba(0, 0, 0, 0.05)',
  shadowMedium: 'rgba(0, 0, 0, 0.10)',
  shadowSoft: 'rgba(0, 0, 0, 0.03)',
  shadowWide: 'rgba(0, 0, 0, 0.04)',

  // Acceso directo a la paleta primitiva si se necesita
  palette,
} as const;

export type ColorToken = keyof Omit<typeof colors, 'palette'>;

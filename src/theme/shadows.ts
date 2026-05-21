import { ViewStyle } from 'react-native';

/**
 * Sombras extraídas del diseño Figma.
 *
 * React Native solo soporta shadow* props en iOS.
 * Para Android se usa `elevation`. Los valores de elevation
 * son aproximaciones al efecto visual del diseño.
 */
export const shadows = {
  /** Cards de contenido — sombra muy sutil */
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  } satisfies ViewStyle,

  /** Cards elevadas, dropdowns */
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  } satisfies ViewStyle,

  /** Panels grandes, modales */
  strong: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
  } satisfies ViewStyle,

  /** Panels amplios con sombra difusa */
  wide: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 40 },
    shadowOpacity: 0.04,
    shadowRadius: 80,
    elevation: 4,
  } satisfies ViewStyle,

  /** Top App Bar */
  header: {
    shadowColor: '#1A1C1C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 4,
  } satisfies ViewStyle,

  /** Botones CTA primarios (teal glow) */
  primaryCta: {
    shadowColor: '#006A62',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  } satisfies ViewStyle,

  /** Sticky footer de booking */
  stickyFooter: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.04,
    shadowRadius: 40,
    elevation: 8,
  } satisfies ViewStyle,
} as const;

export type ShadowToken = keyof typeof shadows;

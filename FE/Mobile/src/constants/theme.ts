import { Platform } from 'react-native';

export const colors = {
  primary: '#1246D8', primaryDark: '#0A2878', primarySoft: '#EAF0FF', navy: '#071B3B',
  ink: '#101828', text: '#182230', textSecondary: '#667085', textMuted: '#98A2B3',
  white: '#FFFFFF', background: '#F5F7FB', surface: '#FFFFFF', surfaceAlt: '#EEF2F8',
  border: '#E4E7EC', borderStrong: '#D0D5DD', danger: '#E23D3D', dangerSoft: '#FFF0F0',
  success: '#12965B', successSoft: '#EAF8F1', warning: '#F79009', warningSoft: '#FFF6E8',
  purple: '#6D3CE7', overlay: 'rgba(4, 15, 36, 0.62)', black: '#000000',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 } as const;
export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '800' as const },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: '800' as const },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const },
  h3: { fontSize: 17, lineHeight: 23, fontWeight: '700' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  captionMedium: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
  tiny: { fontSize: 11, lineHeight: 15, fontWeight: '600' as const },
} as const;

export const shadows = Platform.select({
  ios: {
    card: { shadowColor: '#0B1F44', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
    elevated: { shadowColor: '#0B1F44', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 18 },
  },
  android: { card: { elevation: 2 }, elevated: { elevation: 6 } },
  default: {
    card: { boxShadow: '0 4px 16px rgba(11, 31, 68, 0.08)' },
    elevated: { boxShadow: '0 8px 24px rgba(11, 31, 68, 0.14)' },
  },
})!;

export const layout = { screenPadding: 16, maxContentWidth: 900, tabBarHeight: Platform.OS === 'ios' ? 84 : 68 } as const;

// Backward-compatible exports for the unused Expo starter helpers.
export const Colors = {
  light: { text: colors.text, background: colors.background, backgroundElement: colors.surfaceAlt, backgroundSelected: colors.primarySoft, textSecondary: colors.textSecondary },
  dark: { text: colors.white, background: colors.navy, backgroundElement: '#102A52', backgroundSelected: colors.primary, textSecondary: '#BAC7DD' },
} as const;
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export const Fonts = Platform.select({ ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' }, default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' }, web: { sans: 'system-ui', serif: 'Georgia', rounded: 'system-ui', mono: 'monospace' } })!;
export const Spacing = { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 } as const;
export const BottomTabInset = Platform.select({ ios: 50, android: 68 }) ?? 0;
export const MaxContentWidth = layout.maxContentWidth;

import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { useApp } from '@/state/app-context';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './ui/icon';

export function Toast() {
  const { toast } = useApp(); const insets = useSafeAreaInsets(); if (!toast) return null;
  return <View pointerEvents="none" style={[styles.wrap, { top: insets.top + spacing.sm }]}><Icon name="check-circle" size={20} color={colors.success} /><Text style={styles.text}>{toast}</Text></View>;
}
const styles = StyleSheet.create({ wrap: { position: 'absolute', zIndex: 100, left: spacing.lg, right: spacing.lg, alignSelf: 'center', maxWidth: 520, minHeight: 48, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, ...shadows.elevated }, text: { ...typography.captionMedium, color: colors.text, flex: 1 } });

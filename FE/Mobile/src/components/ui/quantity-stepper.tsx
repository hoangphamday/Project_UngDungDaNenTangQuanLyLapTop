import { colors, radius, spacing, typography } from '@/constants/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './icon';

export function QuantityStepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <View style={styles.wrap}><Pressable onPress={() => onChange(Math.max(1, value - 1))} style={styles.button}><Icon name="minus" size={16} color={value <= 1 ? colors.textMuted : colors.text} /></Pressable><Text style={styles.value}>{value}</Text><Pressable onPress={() => onChange(Math.min(10, value + 1))} style={styles.button}><Icon name="plus" size={16} /></Pressable></View>;
}
const styles = StyleSheet.create({ wrap: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }, button: { width: 32, height: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt }, value: { minWidth: 32, textAlign: 'center', ...typography.captionMedium, color: colors.text, paddingHorizontal: spacing.xs } });

import { colors, radius, spacing, typography } from '@/constants/theme';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Icon } from './ui/icon';

interface SearchBarProps { value?: string; onChangeText?: (value: string) => void; onPress?: () => void; onFilterPress?: () => void; placeholder?: string; autoFocus?: boolean }
export function SearchBar({ value, onChangeText, onPress, onFilterPress, placeholder = 'Tìm laptop, hãng, CPU, GPU...', autoFocus }: SearchBarProps) {
  return <View style={styles.row}><Pressable style={styles.box} onPress={onPress}><Icon name="search" size={20} color={colors.textSecondary} /><TextInput editable={!onPress} pointerEvents={onPress ? 'none' : 'auto'} autoFocus={autoFocus} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textMuted} style={styles.input} /></Pressable>{onFilterPress && <Pressable style={styles.filter} onPress={onFilterPress}><Icon name="sliders" color={colors.white} /></Pressable>}</View>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: spacing.sm }, box: { flex: 1, height: 48, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border }, input: { flex: 1, color: colors.text, ...typography.body, paddingVertical: 0 }, filter: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' } });

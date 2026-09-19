import { colors, radius, spacing, typography } from '@/constants/theme';
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { Icon, type IconName } from './icon';

interface ButtonProps { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'; icon?: IconName; loading?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle>; compact?: boolean }
export function Button({ title, onPress, variant = 'primary', icon, loading, disabled, style, compact }: ButtonProps) {
  const filled = variant === 'primary' || variant === 'danger';
  const color = variant === 'primary' ? colors.white : variant === 'danger' ? colors.white : variant === 'secondary' ? colors.primary : variant === 'ghost' ? colors.textSecondary : colors.primary;
  return (
    <Pressable
      accessibilityRole="button" onPress={onPress} disabled={disabled || loading}
      style={({ pressed }) => [styles.base, styles[variant], compact && styles.compact, (disabled || loading) && styles.disabled, pressed && styles.pressed, style]}>
      {loading ? <ActivityIndicator size="small" color={filled ? colors.white : colors.primary} /> : <>{icon && <Icon name={icon} size={18} color={color} />}<Text style={[styles.text, { color }]}>{title}</Text></>}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base: { minHeight: 50, borderRadius: radius.md, paddingHorizontal: spacing.xl, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  compact: { minHeight: 40, paddingHorizontal: spacing.lg }, primary: { backgroundColor: colors.primary }, secondary: { backgroundColor: colors.primarySoft }, outline: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primary }, danger: { backgroundColor: colors.danger }, ghost: { backgroundColor: 'transparent' },
  text: { ...typography.bodyMedium }, pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] }, disabled: { opacity: 0.5 },
});

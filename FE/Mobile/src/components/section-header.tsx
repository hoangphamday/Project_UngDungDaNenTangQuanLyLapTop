import { colors, spacing, typography } from '@/constants/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './ui/icon';

export function SectionHeader({ title, subtitle, action = 'Xem tất cả', onPress }: { title: string; subtitle?: string; action?: string; onPress?: () => void }) {
  return <View style={styles.row}><View style={styles.copy}><Text style={styles.title}>{title}</Text>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}</View>{onPress && <Pressable onPress={onPress} style={styles.action}><Text style={styles.actionText}>{action}</Text><Icon name="chevron-right" size={16} color={colors.primary} /></Pressable>}</View>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: spacing.md }, copy: { flex: 1 }, title: { ...typography.h2, color: colors.text }, subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 }, action: { flexDirection: 'row', alignItems: 'center', marginLeft: spacing.md, paddingVertical: spacing.xs }, actionText: { ...typography.captionMedium, color: colors.primary } });

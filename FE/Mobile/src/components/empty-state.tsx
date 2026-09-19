import { colors, spacing, typography } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './ui/button';
import { Icon, type IconName } from './ui/icon';

export function EmptyState({ icon = 'box', title, description, action, onAction }: { icon?: IconName; title: string; description: string; action?: string; onAction?: () => void }) {
  return <View style={styles.wrap}><View style={styles.icon}><Icon name={icon} size={38} color={colors.primary} /></View><Text style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text>{action && onAction && <Button title={action} compact onPress={onAction} style={styles.button} />}</View>;
}
const styles = StyleSheet.create({ wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl }, icon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }, title: { ...typography.h3, color: colors.text, textAlign: 'center' }, description: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, maxWidth: 310 }, button: { marginTop: spacing.xl } });

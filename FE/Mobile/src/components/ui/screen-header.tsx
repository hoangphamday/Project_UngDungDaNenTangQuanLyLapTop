import { colors, layout, spacing, typography } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from './icon';

interface ScreenHeaderProps { title: string; subtitle?: string; rightIcon?: IconName; onRightPress?: () => void; back?: boolean }
export function ScreenHeader({ title, subtitle, rightIcon, onRightPress, back = true }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets(); const router = useRouter();
  return <View style={[styles.wrap, { paddingTop: insets.top + spacing.sm }]}><View style={styles.inner}>
    {back ? <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconButton}><Icon name="arrow-left" /></Pressable> : <View style={styles.spacer} />}
    <View style={styles.copy}><Text numberOfLines={1} style={styles.title}>{title}</Text>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}</View>
    {rightIcon ? <Pressable onPress={onRightPress} hitSlop={10} style={styles.iconButton}><Icon name={rightIcon} /></Pressable> : <View style={styles.spacer} />}
  </View></View>;
}
const styles = StyleSheet.create({ wrap: { backgroundColor: colors.white, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, inner: { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center', minHeight: 54, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center' }, iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }, spacer: { width: 40 }, copy: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.sm }, title: { ...typography.h3, color: colors.text }, subtitle: { ...typography.tiny, color: colors.textSecondary, marginTop: 1 } });

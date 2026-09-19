import { colors } from '@/constants/theme';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from './icon';
export function Checkbox({ checked, onPress }: { checked: boolean; onPress: () => void }) { return <Pressable onPress={onPress} hitSlop={8} accessibilityRole="checkbox" accessibilityState={{ checked }}><View style={[styles.box, checked && styles.checked]}>{checked && <Icon name="check" size={15} color={colors.white} />}</View></Pressable>; }
const styles = StyleSheet.create({ box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }, checked: { backgroundColor: colors.primary, borderColor: colors.primary } });

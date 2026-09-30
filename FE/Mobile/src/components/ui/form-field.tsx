import { colors, radius, spacing, typography } from '@/constants/theme';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Icon, type IconName } from './icon';

interface FormFieldProps extends TextInputProps { label: string; icon?: IconName; error?: string }
export function FormField({ label, icon, error, secureTextEntry, ...props }: FormFieldProps) {
  const [visible, setVisible] = useState(false);
  return <View style={styles.group}><Text style={styles.label}>{label}</Text><View style={[styles.field, error && styles.fieldError]}>{icon && <Icon name={icon} size={19} color={colors.textSecondary} />}<TextInput {...props} secureTextEntry={secureTextEntry && !visible} placeholderTextColor={colors.textMuted} style={styles.input} />{secureTextEntry && <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8}><Icon name={visible ? 'eye-off' : 'eye'} size={19} color={colors.textSecondary} /></Pressable>}</View>{error && <Text style={styles.error}>{error}</Text>}</View>;
}
const styles = StyleSheet.create({ group: { gap: 6 }, label: { ...typography.captionMedium, color: colors.text }, field: { height: 52, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.white }, fieldError: { borderColor: colors.danger }, input: { flex: 1, ...typography.body, color: colors.text, paddingVertical: 0 }, error: { ...typography.tiny, color: colors.danger } });

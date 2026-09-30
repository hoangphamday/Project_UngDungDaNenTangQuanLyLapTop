import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { ScreenHeader } from '@/components/ui/screen-header';
import { colors, layout, radius, spacing, typography } from '@/constants/theme';
import { useApp } from '@/state/app-context';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ChangePasswordScreen() {
  const { notify } = useApp(); const [oldPassword, setOldPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [confirm, setConfirm] = useState(''); const valid = oldPassword.length >= 8 && newPassword.length >= 8 && newPassword === confirm;
  const save = () => { notify('Đổi mật khẩu thành công'); setOldPassword(''); setNewPassword(''); setConfirm(''); };
  return <View style={styles.page}><ScreenHeader title="Đổi mật khẩu" /><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.info}><Text style={styles.infoTitle}>Tạo mật khẩu an toàn</Text><Text style={styles.infoText}>Sử dụng ít nhất 8 ký tự, kết hợp chữ hoa, chữ thường và chữ số.</Text></View><View style={styles.form}><FormField label="Mật khẩu hiện tại" icon="lock" value={oldPassword} onChangeText={setOldPassword} secureTextEntry /><FormField label="Mật khẩu mới" icon="lock" value={newPassword} onChangeText={setNewPassword} secureTextEntry /><FormField label="Xác nhận mật khẩu mới" icon="lock" value={confirm} onChangeText={setConfirm} secureTextEntry error={confirm && confirm !== newPassword ? 'Mật khẩu xác nhận chưa khớp' : undefined} /></View><Button title="Cập nhật mật khẩu" disabled={!valid} onPress={save} style={styles.button} /></ScrollView></View>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.background }, content: { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center', padding: spacing.lg }, info: { padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.primarySoft, marginBottom: spacing.md }, infoTitle: { ...typography.h3, color: colors.primaryDark }, infoText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs }, form: { padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, gap: spacing.lg }, button: { marginTop: spacing.xl } });

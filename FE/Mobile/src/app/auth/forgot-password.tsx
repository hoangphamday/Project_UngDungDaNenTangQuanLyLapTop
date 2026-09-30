import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter(); const [phone, setPhone] = useState(''); const valid = /^0\d{9}$/.test(phone);
  return <AuthShell title="Quên mật khẩu?" subtitle="Nhập số điện thoại đã đăng ký để nhận mã xác thực"><View style={styles.form}><FormField label="Số điện thoại" icon="phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="0901234567" /><Button title="Gửi mã xác thực" disabled={!valid} onPress={() => router.push({ pathname: '/auth/otp', params: { phone, mode: 'reset' } })} /></View></AuthShell>;
}
const styles = StyleSheet.create({ form: { gap: spacing.xl } });

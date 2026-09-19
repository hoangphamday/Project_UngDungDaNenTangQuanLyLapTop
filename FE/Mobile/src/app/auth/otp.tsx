import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useApp } from '@/state/app-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function OtpScreen() {
  const { phone = '0901234567', mode = 'register' } = useLocalSearchParams<{ phone?: string; mode?: string }>(); const router = useRouter(); const { login, notify } = useApp(); const [otp, setOtp] = useState(''); const [seconds, setSeconds] = useState(59);
  useEffect(() => { if (!seconds) return; const timer = setTimeout(() => setSeconds((value) => value - 1), 1000); return () => clearTimeout(timer); }, [seconds]);
  const verify = () => { if (mode === 'register') { login(); notify('Đăng ký tài khoản thành công'); router.replace('/(tabs)'); } else { notify('Xác thực thành công, bạn có thể đặt mật khẩu mới'); router.replace('/auth/login'); } };
  return <AuthShell title="Xác thực OTP" subtitle={`Mã gồm 6 chữ số đã được gửi đến ${phone}`}><View style={styles.form}><TextInput value={otp} onChangeText={(value) => setOtp(value.replace(/\D/g, ''))} maxLength={6} keyboardType="number-pad" autoFocus style={styles.otp} placeholder="000000" placeholderTextColor={colors.borderStrong} /><Text style={styles.hint}>Mã demo: nhập 6 chữ số bất kỳ</Text><Button title="Xác nhận" disabled={otp.length !== 6} onPress={verify} /><View style={styles.resend}><Text style={styles.resendText}>Chưa nhận được mã? </Text><Pressable disabled={seconds > 0} onPress={() => { setSeconds(59); notify('Đã gửi lại mã OTP'); }}><Text style={[styles.resendLink, seconds > 0 && styles.disabled]}>{seconds > 0 ? `Gửi lại sau ${seconds}s` : 'Gửi lại mã'}</Text></Pressable></View></View></AuthShell>;
}
const styles = StyleSheet.create({ form: { gap: spacing.xl }, otp: { height: 68, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primarySoft, textAlign: 'center', fontSize: 30, lineHeight: 36, fontWeight: '700', letterSpacing: 12, color: colors.navy, paddingLeft: 12 }, hint: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: -spacing.md }, resend: { flexDirection: 'row', justifyContent: 'center' }, resendText: { ...typography.caption, color: colors.textSecondary }, resendLink: { ...typography.captionMedium, color: colors.primary }, disabled: { color: colors.textMuted } });

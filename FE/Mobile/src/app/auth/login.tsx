import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { colors, spacing, typography } from '@/constants/theme';
import { useApp } from '@/state/app-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter(); const { login } = useApp(); const [identity, setIdentity] = useState(''); const [password, setPassword] = useState(''); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const submit = async () => { if (!identity.trim() || !password) return setError('Vui lòng nhập tài khoản và mật khẩu.'); setError(''); setLoading(true); try { await login(identity.trim(),password); router.replace('/(tabs)'); } catch(e) { setError(e instanceof Error?e.message:'Không thể đăng nhập'); } finally { setLoading(false); } };
  return <AuthShell title="Chào mừng trở lại" subtitle="Đăng nhập để tiếp tục mua sắm tại LapZone" back={false}><View style={styles.form}><FormField label="Email, số điện thoại hoặc tên đăng nhập" icon="user" value={identity} onChangeText={setIdentity} autoCapitalize="none" placeholder="Nhập thông tin đăng nhập" /><FormField label="Mật khẩu" icon="lock" value={password} onChangeText={setPassword} secureTextEntry placeholder="Nhập mật khẩu" /><Pressable onPress={() => router.push('/auth/forgot-password')} style={styles.forgot}><Text style={styles.link}>Quên mật khẩu?</Text></Pressable>{error && <Text style={styles.error}>{error}</Text>}<Button title="Đăng nhập" loading={loading} onPress={submit} /></View><View style={styles.register}><Text style={styles.normal}>Chưa có tài khoản? </Text><Pressable onPress={() => router.push('/auth/register')}><Text style={styles.link}>Đăng ký ngay</Text></Pressable></View><Text style={styles.demo}>Bản demo chấp nhận mọi tài khoản có mật khẩu từ 8 ký tự.</Text></AuthShell>;
}
const styles = StyleSheet.create({ form: { gap: spacing.lg }, forgot: { alignSelf: 'flex-end', marginTop: -4 }, link: { ...typography.captionMedium, color: colors.primary }, error: { ...typography.caption, color: colors.danger, marginTop: -6 }, register: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl }, normal: { ...typography.body, color: colors.textSecondary }, demo: { ...typography.tiny, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl } });

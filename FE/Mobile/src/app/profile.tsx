import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Icon } from '@/components/ui/icon';
import { ScreenHeader } from '@/components/ui/screen-header';
import { colors, layout, radius, spacing, typography } from '@/constants/theme';
import { userProfile } from '@/data/mock-data';
import { useApp } from '@/state/app-context';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { notify } = useApp(); const [name, setName] = useState(userProfile.fullName); const [email, setEmail] = useState(userProfile.email); const [phone, setPhone] = useState(userProfile.phone); const [birthday, setBirthday] = useState(userProfile.birthday);
  return <View style={styles.page}><ScreenHeader title="Hồ sơ cá nhân" /><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.avatarWrap}><View style={styles.avatar}><Text style={styles.avatarText}>NA</Text></View><View style={styles.camera}><Icon name="camera" size={17} color={colors.white} /></View><Text style={styles.avatarHint}>Chạm để thay ảnh đại diện</Text></View><View style={styles.form}><FormField label="Họ và tên" icon="user" value={name} onChangeText={setName} /><FormField label="Tên đăng nhập" icon="user" value={userProfile.username} editable={false} /><FormField label="Số điện thoại" icon="phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" /><FormField label="Email" icon="mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /><FormField label="Ngày sinh" icon="clock" value={birthday} onChangeText={setBirthday} /><FormField label="Giới tính" icon="user" value={userProfile.gender} editable={false} /></View><Button title="Lưu thay đổi" onPress={() => notify('Đã cập nhật hồ sơ cá nhân')} style={styles.save} /></ScrollView></View>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.background }, content: { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center', padding: spacing.lg, paddingBottom: spacing.xxxl }, avatarWrap: { alignItems: 'center', paddingVertical: spacing.xl }, avatar: { width: 92, height: 92, borderRadius: 46, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, avatarText: { ...typography.h1, color: colors.white }, camera: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.navy, borderWidth: 3, borderColor: colors.background, alignItems: 'center', justifyContent: 'center', marginTop: -25, marginLeft: 65 }, avatarHint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.md }, form: { padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, gap: spacing.lg }, save: { marginTop: spacing.xl } });

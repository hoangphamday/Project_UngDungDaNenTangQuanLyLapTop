import { EmptyState } from '@/components/empty-state';
import { ProductCard } from '@/components/product-card';
import { colors, layout, spacing, typography } from '@/constants/theme';
import { products } from '@/data/mock-data';
import { useApp } from '@/state/app-context';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FavoritesScreen() {
  const { favorites } = useApp(); const router = useRouter(); const data = products.filter((item) => favorites.has(item.id));
  return <SafeAreaView edges={['top']} style={styles.safe}><View style={styles.header}><Text style={styles.title}>Yêu thích</Text><Text style={styles.subtitle}>{data.length} sản phẩm đã lưu</Text></View><FlatList data={data} numColumns={2} keyExtractor={(item) => item.id} renderItem={({ item }) => <ProductCard product={item} style={styles.card} />} columnWrapperStyle={styles.row} contentContainerStyle={[styles.content, !data.length && styles.emptyContent]} ListEmptyComponent={<EmptyState icon="heart" title="Chưa có sản phẩm yêu thích" description="Lưu lại những chiếc laptop bạn quan tâm để dễ dàng xem lại." action="Khám phá sản phẩm" onAction={() => router.push('/products')} />} /></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg, backgroundColor: colors.white }, title: { ...typography.h1, color: colors.text }, subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 3 }, content: { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center', padding: spacing.lg, paddingBottom: spacing.xxxl }, emptyContent: { flexGrow: 1 }, row: { gap: spacing.md, marginBottom: spacing.md }, card: { flex: 1, minWidth: 0 } });

import { BannerCarousel } from '@/components/banner-carousel';
import { EmptyState } from '@/components/empty-state';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { ProductCard } from '@/components/product-card';
import { SearchBar } from '@/components/search-bar';
import { SectionHeader } from '@/components/section-header';
import { Icon, type IconName } from '@/components/ui/icon';
import { colors, layout, radius, spacing, typography } from '@/constants/theme';
import { brands, categories } from '@/data/mock-data';
import { useCatalog } from '@/hooks/use-catalog';
import { useApp } from '@/state/app-context';
import type { Product } from '@/types';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Countdown() {
  const [seconds, setSeconds] = useState(2 * 3600 + 47 * 60 + 18);
  useEffect(() => { const timer = setInterval(() => setSeconds((value) => value > 0 ? value - 1 : 3 * 3600), 1000); return () => clearInterval(timer); }, []);
  const values = [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60];
  return <View style={styles.countdown}>{values.map((value, index) => <View key={index} style={styles.timeWrap}><View style={styles.timeBox}><Text style={styles.timeText}>{String(value).padStart(2, '0')}</Text></View>{index < 2 && <Text style={styles.colon}>:</Text>}</View>)}</View>;
}

function HorizontalProducts({ data }: { data: Product[] }) {
  return <FlatList horizontal data={data} keyExtractor={(item) => item.id} renderItem={({ item }) => <ProductCard product={item} horizontal />} contentContainerStyle={styles.horizontalList} showsHorizontalScrollIndicator={false} initialNumToRender={3} windowSize={4} />;
}

function HomeHeader({ products }: { products: Product[] }) {
  const router = useRouter(); const { cartCount } = useApp(); const insets = useSafeAreaInsets();
  return <View>
    <View style={[styles.top, { paddingTop: insets.top + spacing.md }]}><View><Text style={styles.greeting}>Xin chào, Nguyễn An</Text><View style={styles.brandRow}><View style={styles.logo}><Icon name="laptop" size={17} color={colors.white} /></View><Text style={styles.brand}>Lap<Text style={styles.brandAccent}>Zone</Text></Text></View></View><View style={styles.actions}><Pressable onPress={() => router.push('/notifications')} style={styles.actionButton}><Icon name="bell" size={21} /><View style={styles.notificationDot} /></Pressable><Pressable onPress={() => router.push('/cart')} style={styles.actionButton}><Icon name="cart" size={21} />{cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{Math.min(cartCount, 9)}</Text></View>}</Pressable></View></View>
    <View style={styles.search}><SearchBar onPress={() => router.push('/products')} onFilterPress={() => router.push('/products?filter=1')} /></View>
    <View style={styles.section}><BannerCarousel /></View>
    <View style={styles.section}><SectionHeader title="Danh mục laptop" onPress={() => router.push('/(tabs)/categories')} /><View style={styles.categories}>{categories.map((category) => <Pressable key={category.id} onPress={() => router.push(`/products?category=${encodeURIComponent(category.name)}`)} style={styles.category}><View style={[styles.categoryIcon, { backgroundColor: category.background }]}><Icon name={category.icon as IconName} size={25} color={category.color} /></View><Text numberOfLines={1} style={styles.categoryText}>{category.name}</Text></Pressable>)}</View></View>
    <View style={[styles.section, styles.flashSection]}><View style={styles.flashHeader}><View><View style={styles.flashTitle}><Icon name="flash" size={20} color={colors.danger} /><Text style={styles.flashTitleText}>Flash Sale</Text></View><Text style={styles.flashSubtitle}>Kết thúc sau</Text></View><Countdown /></View><HorizontalProducts data={products.slice(0, 5)} /></View>
    <View style={styles.section}><SectionHeader title="Sản phẩm nổi bật" subtitle="Lựa chọn được yêu thích nhất" onPress={() => router.push('/products?sort=popular')} /><HorizontalProducts data={products.filter((item) => item.isFeatured || item.rating >= 4.8).slice(0, 6)} /></View>
    <View style={styles.section}><SectionHeader title="Mới tại LapZone" subtitle="Công nghệ mới, trải nghiệm mới" onPress={() => router.push('/products?sort=newest')} /><HorizontalProducts data={[...products].filter((item) => item.isNew).concat(products).slice(0, 6)} /></View>
    <View style={styles.section}><SectionHeader title="Thương hiệu nổi bật" onPress={() => router.push('/(tabs)/categories')} /><FlatList horizontal data={brands} keyExtractor={(item) => item} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandList} renderItem={({ item }) => <Pressable onPress={() => router.push(`/products?brand=${item}`)} style={styles.brandPill}><Text style={styles.brandPillText}>{item}</Text></Pressable>} /></View>
    <View style={styles.suggestionTitle}><SectionHeader title="Dành riêng cho bạn" subtitle="Gợi ý dựa trên nhu cầu của bạn" /></View>
  </View>;
}

export default function HomeScreen() {
  const { data, loading, refreshing, error, refetch } = useCatalog(); const router = useRouter();
  if (loading) return <View style={styles.loading}><LoadingSkeleton cards={6} /></View>;
  if (error) return <EmptyState icon="warning" title="Chưa thể tải trang chủ" description={error} action="Thử lại" onAction={refetch} />;
  return <FlatList data={data.slice(0, 8)} numColumns={2} keyExtractor={(item) => item.id} renderItem={({ item }) => <ProductCard product={item} style={styles.gridCard} />} columnWrapperStyle={styles.gridRow} ListHeaderComponent={<HomeHeader products={data} />} contentContainerStyle={styles.listContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />} ListFooterComponent={<Pressable onPress={() => router.push('/products')} style={styles.allProducts}><Text style={styles.allProductsText}>Xem toàn bộ laptop</Text><Icon name="chevron-right" size={17} color={colors.primary} /></Pressable>} initialNumToRender={4} maxToRenderPerBatch={6} windowSize={7} removeClippedSubviews />;
}

const styles = StyleSheet.create({
  listContent: { backgroundColor: colors.background, paddingBottom: spacing.xxxl, width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center' }, loading: { flex: 1, paddingTop: 80 }, top: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, greeting: { ...typography.caption, color: colors.textSecondary }, brandRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 }, logo: { width: 27, height: 27, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 7 }, brand: { fontSize: 23, lineHeight: 29, fontWeight: '800', color: colors.navy }, brandAccent: { color: colors.primary }, actions: { flexDirection: 'row', gap: spacing.sm }, actionButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', position: 'relative' }, notificationDot: { position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.danger, borderWidth: 1, borderColor: colors.white }, badge: { position: 'absolute', top: 5, right: 4, minWidth: 17, height: 17, borderRadius: 9, paddingHorizontal: 4, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.white }, badgeText: { fontSize: 9, color: colors.white, fontWeight: '800' }, search: { backgroundColor: colors.white, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }, section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl }, categories: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs }, category: { flex: 1, alignItems: 'center', gap: 6 }, categoryIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, categoryText: { ...typography.tiny, color: colors.text, textAlign: 'center', width: '100%' }, flashSection: { backgroundColor: '#FFF6F2', paddingVertical: spacing.lg, borderRadius: radius.xl }, flashHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg }, flashTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 }, flashTitleText: { ...typography.h2, color: colors.danger }, flashSubtitle: { ...typography.tiny, color: colors.textSecondary, marginTop: 2 }, countdown: { flexDirection: 'row' }, timeWrap: { flexDirection: 'row', alignItems: 'center' }, timeBox: { minWidth: 30, height: 30, borderRadius: 8, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' }, timeText: { ...typography.tiny, color: colors.white }, colon: { color: colors.navy, fontWeight: '800', marginHorizontal: 3 }, horizontalList: { gap: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: 1 }, brandList: { gap: spacing.sm }, brandPill: { height: 48, minWidth: 90, borderRadius: radius.md, paddingHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, brandPillText: { ...typography.bodyMedium, color: colors.navy }, suggestionTitle: { paddingHorizontal: spacing.lg, marginTop: spacing.xxl }, gridRow: { gap: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.md }, gridCard: { flex: 1, minWidth: 0 }, allProducts: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: spacing.md, paddingHorizontal: spacing.lg }, allProductsText: { ...typography.captionMedium, color: colors.primary },
});

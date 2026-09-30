import { BannerCarousel } from '@/components/banner-carousel';
import { EmptyState } from '@/components/empty-state';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { ProductCard } from '@/components/product-card';
import { SearchBar } from '@/components/search-bar';
import { SectionHeader } from '@/components/section-header';
import { Icon, type IconName } from '@/components/ui/icon';
import { colors, layout, radius, spacing, typography } from '@/constants/theme';
import { catalogService } from '@/services/catalog.service';
import { useApp } from '@/state/app-context';
import type { Product } from '@/types';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CatalogItem = { id: string; name: string };
type HomeData = { products: Product[]; categories: CatalogItem[]; brands: CatalogItem[] };
const emptyData: HomeData = { products: [], categories: [], brands: [] };
const requestHome = async (): Promise<HomeData> => {
  const [products, categories, brands] = await Promise.all([catalogService.getProducts(), catalogService.getCategories(), catalogService.getBrands()]);
  return { products, categories, brands };
};

function HorizontalProducts({ data }: { data: Product[] }) {
  return <FlatList horizontal data={data} keyExtractor={(item) => item.id} renderItem={({ item }) => <ProductCard product={item} horizontal />} contentContainerStyle={styles.horizontalList} showsHorizontalScrollIndicator={false} />;
}

function categoryIcon(name: string): IconName {
  const lower = name.toLocaleLowerCase('vi');
  if (lower.includes('gaming')) return 'flash';
  if (lower.includes('văn phòng')) return 'receipt';
  if (lower.includes('đồ họa') || lower.includes('thiết kế')) return 'camera';
  if (lower.includes('học') || lower.includes('sinh viên')) return 'user';
  return 'laptop';
}

function HomeHeader({ data }: { data: HomeData }) {
  const router = useRouter();
  const { cartCount } = useApp();
  const insets = useSafeAreaInsets();
  const sale = data.products.filter((item) => item.originalPrice && item.originalPrice > item.price);
  return <View>
    <View style={[styles.top, { paddingTop: insets.top + spacing.md }]}>
      <View><Text style={styles.greeting}>Chào mừng đến với</Text><View style={styles.brandRow}><View style={styles.logo}><Icon name="laptop" size={17} color={colors.white} /></View><Text style={styles.brand}>Lap<Text style={styles.brandAccent}>Zone</Text></Text></View></View>
      <View style={styles.actions}>
        <Pressable accessibilityLabel="Thông báo" onPress={() => router.push('/notifications')} style={styles.actionButton}><Icon name="bell" size={21} /></Pressable>
        <Pressable accessibilityLabel="Giỏ hàng" onPress={() => router.push('/cart')} style={styles.actionButton}><Icon name="cart" size={21} />{cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text></View>}</Pressable>
      </View>
    </View>
    <View style={styles.search}><SearchBar onPress={() => router.push('/products')} onFilterPress={() => router.push('/products?filter=1')} /></View>
    {data.products.length > 0 && <View style={styles.section}><BannerCarousel products={data.products} /></View>}
    {data.categories.length > 0 && <View style={styles.section}><SectionHeader title="Danh mục laptop" onPress={() => router.push('/products')} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>{data.categories.map((category) => <Pressable key={category.id} onPress={() => router.push(`/products?category=${encodeURIComponent(category.name)}`)} style={styles.category}><View style={styles.categoryIcon}><Icon name={categoryIcon(category.name)} size={25} color={colors.primary} /></View><Text numberOfLines={2} style={styles.categoryText}>{category.name}</Text></Pressable>)}</ScrollView></View>}
    {sale.length > 0 && <View style={[styles.section, styles.saleSection]}><SectionHeader title="Giá ưu đãi" subtitle="Sản phẩm đang giảm giá" onPress={() => router.push('/products')} /><HorizontalProducts data={sale.slice(0, 8)} /></View>}
    {data.products.length > 0 && <View style={styles.section}><SectionHeader title="Mới cập nhật" subtitle="Laptop vừa được đưa lên cửa hàng" onPress={() => router.push('/products?sort=newest')} /><HorizontalProducts data={data.products.slice(0, 8)} /></View>}
    {data.brands.length > 0 && <View style={styles.section}><SectionHeader title="Thương hiệu" onPress={() => router.push('/products')} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandList}>{data.brands.map((brand) => <Pressable key={brand.id} onPress={() => router.push(`/products?brand=${encodeURIComponent(brand.name)}`)} style={styles.brandPill}><Text style={styles.brandPillText}>{brand.name}</Text></Pressable>)}</ScrollView></View>}
    <View style={styles.gridTitle}><SectionHeader title="Khám phá laptop" subtitle={`${data.products.length} sản phẩm đang bán`} /></View>
  </View>;
}

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState<HomeData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchData = useCallback(async () => {
    try {
      setData(await requestHome());
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể tải trang chủ');
    }
  }, []);
  const load = useCallback(async () => {
    setRefreshing(true);
    try { await fetchData(); } finally { setRefreshing(false); }
  }, [fetchData]);
  useEffect(() => {
    let active = true;
    void requestHome().then((result) => { if (active) { setData(result); setError(null); } })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Không thể tải trang chủ'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <View style={styles.loading}><LoadingSkeleton cards={6} /></View>;
  if (error && !data.products.length) return <EmptyState icon="warning" title="Chưa thể tải trang chủ" description={error} action="Thử lại" onAction={load} />;
  return <FlatList data={data.products.slice(0, 12)} numColumns={2} keyExtractor={(item) => item.id} renderItem={({ item }) => <ProductCard product={item} style={styles.gridCard} />} columnWrapperStyle={data.products.length ? styles.gridRow : undefined} ListHeaderComponent={<HomeHeader data={data} />} contentContainerStyle={styles.listContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} colors={[colors.primary]} />} ListEmptyComponent={<EmptyState icon="laptop" title="Chưa có laptop" description="Sản phẩm sẽ xuất hiện khi quản trị viên đăng bán." />} ListFooterComponent={data.products.length ? <Pressable onPress={() => router.push('/products')} style={styles.allProducts}><Text style={styles.allProductsText}>Xem tất cả laptop</Text><Icon name="chevron-right" size={17} color={colors.primary} /></Pressable> : null} initialNumToRender={4} maxToRenderPerBatch={6} windowSize={7} />;
}

const styles = StyleSheet.create({
  listContent: { backgroundColor: colors.background, paddingBottom: spacing.xxxl, width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center', flexGrow: 1 },
  loading: { flex: 1, paddingTop: 80 },
  top: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { ...typography.caption, color: colors.textSecondary },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  logo: { width: 27, height: 27, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 7 },
  brand: { fontSize: 23, lineHeight: 29, fontWeight: '800', color: colors.navy }, brandAccent: { color: colors.primary },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 5, right: 4, minWidth: 17, height: 17, borderRadius: 9, paddingHorizontal: 4, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.white },
  badgeText: { fontSize: 9, color: colors.white, fontWeight: '800' },
  search: { backgroundColor: colors.white, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  categories: { gap: spacing.md, paddingVertical: spacing.sm },
  category: { width: 84, alignItems: 'center', gap: 6 },
  categoryIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  categoryText: { ...typography.tiny, color: colors.text, textAlign: 'center', width: '100%' },
  saleSection: { backgroundColor: '#FFF6F2', paddingVertical: spacing.lg, borderRadius: radius.xl },
  horizontalList: { gap: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: 1 },
  brandList: { gap: spacing.sm, paddingVertical: spacing.sm },
  brandPill: { height: 48, minWidth: 90, borderRadius: radius.md, paddingHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  brandPillText: { ...typography.bodyMedium, color: colors.navy },
  gridTitle: { paddingHorizontal: spacing.lg, marginTop: spacing.xxl },
  gridRow: { gap: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  gridCard: { flex: 1, minWidth: 0 },
  allProducts: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  allProductsText: { ...typography.captionMedium, color: colors.primary },
});

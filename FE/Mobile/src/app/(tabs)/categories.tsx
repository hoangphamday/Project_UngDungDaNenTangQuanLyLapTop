import { ProductCard } from '@/components/product-card';
import { SearchBar } from '@/components/search-bar';
import { SectionHeader } from '@/components/section-header';
import { Icon, type IconName } from '@/components/ui/icon';
import { colors, layout, radius, spacing, typography } from '@/constants/theme';
import { brands, categories, products } from '@/data/mock-data';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoriesScreen() {
  const router = useRouter();
  return <SafeAreaView edges={['top']} style={styles.safe}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={styles.eyebrow}>KHÁM PHÁ LAPZONE</Text><Text style={styles.title}>Danh mục laptop</Text><Text style={styles.subtitle}>Tìm chiếc laptop phù hợp với nhu cầu của bạn</Text>
    <View style={styles.search}><SearchBar onPress={() => router.push('/products')} /></View>
    <View style={styles.categoryGrid}>{categories.map((category, index) => <Pressable key={category.id} onPress={() => router.push(`/products?category=${encodeURIComponent(category.name)}`)} style={[styles.categoryCard, index === 0 && styles.categoryWide]}><View style={[styles.categoryIcon, { backgroundColor: category.background }]}><Icon name={category.icon as IconName} size={30} color={category.color} /></View><View style={styles.categoryCopy}><Text style={styles.categoryName}>Laptop {category.name}</Text><Text style={styles.categoryCount}>{products.filter((item) => item.category === category.name).length || 8} sản phẩm</Text></View><Icon name="chevron-right" size={18} color={colors.textMuted} /></Pressable>)}</View>
    <View style={styles.section}><SectionHeader title="Chọn theo thương hiệu" /><View style={styles.brandGrid}>{brands.map((brand) => <Pressable key={brand} onPress={() => router.push(`/products?brand=${brand}`)} style={styles.brand}><Text style={styles.brandText}>{brand}</Text></Pressable>)}</View></View>
    <View style={styles.section}><SectionHeader title="Được quan tâm nhiều" onPress={() => router.push('/products?sort=popular')} /><FlatList horizontal data={products.slice(0, 6)} keyExtractor={(item) => item.id} renderItem={({ item }) => <ProductCard product={item} horizontal />} contentContainerStyle={styles.row} showsHorizontalScrollIndicator={false} /></View>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, content: { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center', padding: spacing.lg, paddingBottom: spacing.xxxl }, eyebrow: { ...typography.tiny, color: colors.primary, letterSpacing: 1.3, marginTop: spacing.sm }, title: { ...typography.display, color: colors.text, marginTop: spacing.xs }, subtitle: { ...typography.body, color: colors.textSecondary, marginTop: 4 }, search: { marginTop: spacing.xl }, categoryGrid: { marginTop: spacing.xl, gap: spacing.md }, categoryCard: { minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border }, categoryWide: { minHeight: 108, backgroundColor: colors.navy }, categoryIcon: { width: 58, height: 58, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' }, categoryCopy: { flex: 1 }, categoryName: { ...typography.h3, color: colors.text }, categoryCount: { ...typography.caption, color: colors.textSecondary, marginTop: 3 }, section: { marginTop: spacing.xxl }, brandGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, brand: { width: '31.6%', height: 58, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, brandText: { ...typography.bodyMedium, color: colors.navy }, row: { gap: spacing.md, paddingBottom: spacing.sm } });

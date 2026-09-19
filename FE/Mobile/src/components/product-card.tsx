import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { useApp } from '@/state/app-context';
import type { Product } from '@/types';
import { discountPercent, formatCurrency } from '@/utils/format';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ProductImage } from './product-image';
import { Icon } from './ui/icon';

function ProductCardBase({ product, horizontal = false, style }: { product: Product; horizontal?: boolean; style?: StyleProp<ViewStyle> }) {
  const router = useRouter(); const { favorites, toggleFavorite, addToCart } = useApp(); const discount = discountPercent(product.price, product.originalPrice);
  return <Pressable onPress={() => router.push(`/product/${product.id}`)} style={({ pressed }) => [styles.card, horizontal && styles.horizontal, pressed && styles.pressed, style]}>
    <View style={styles.imageWrap}><ProductImage uri={product.image} style={styles.image} />{discount > 0 && <View style={styles.discount}><Text style={styles.discountText}>-{discount}%</Text></View>}{product.isNew && <View style={styles.new}><Text style={styles.newText}>MỚI</Text></View>}<Pressable hitSlop={8} onPress={(event) => { event.stopPropagation(); toggleFavorite(product.id); }} style={styles.favorite}><Icon name="heart" size={18} color={favorites.has(product.id) ? colors.danger : colors.textMuted} /></Pressable></View>
    <View style={styles.content}><Text style={styles.brand}>{product.brand}</Text><Text numberOfLines={2} style={styles.name}>{product.name}</Text><View style={styles.rating}><Icon name="star" size={14} color={colors.warning} /><Text style={styles.ratingText}>{product.rating} · Đã bán {product.sold}</Text></View><View style={styles.priceRow}><View style={styles.priceCopy}><Text style={styles.price}>{formatCurrency(product.price)}</Text>{product.originalPrice && <Text style={styles.original}>{formatCurrency(product.originalPrice)}</Text>}</View><Pressable hitSlop={8} onPress={(event) => { event.stopPropagation(); addToCart(product); }} style={styles.add}><Icon name="cart" size={17} color={colors.white} /></Pressable></View></View>
  </Pressable>;
}
export const ProductCard = memo(ProductCardBase);
const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, ...shadows.card }, horizontal: { width: 178 }, pressed: { opacity: 0.92 }, imageWrap: { height: 142, backgroundColor: '#F7F9FC', position: 'relative' }, image: { width: '100%', height: '100%' }, discount: { position: 'absolute', left: spacing.sm, top: spacing.sm, paddingHorizontal: 7, paddingVertical: 4, backgroundColor: colors.danger, borderRadius: radius.sm }, discountText: { ...typography.tiny, color: colors.white }, new: { position: 'absolute', left: spacing.sm, top: spacing.sm, paddingHorizontal: 7, paddingVertical: 4, backgroundColor: colors.success, borderRadius: radius.sm }, newText: { ...typography.tiny, color: colors.white }, favorite: { position: 'absolute', right: spacing.sm, top: spacing.sm, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center' }, content: { padding: spacing.md }, brand: { ...typography.tiny, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 }, name: { ...typography.captionMedium, color: colors.text, height: 38, marginTop: 3 }, rating: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: spacing.xs }, ratingText: { fontSize: 11, color: colors.textSecondary }, priceRow: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs }, priceCopy: { flex: 1 }, price: { fontSize: 15, lineHeight: 20, fontWeight: '800', color: colors.danger }, original: { fontSize: 11, lineHeight: 15, color: colors.textMuted, textDecorationLine: 'line-through' }, add: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
});

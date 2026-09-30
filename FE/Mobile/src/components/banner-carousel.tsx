import { ProductImage } from '@/components/product-image';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { Product } from '@/types';
import { formatCurrency } from '@/utils/format';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function BannerCarousel({ products }: { products: Product[] }) {
  const router = useRouter();
  const slides = products.filter((product) => product.originalPrice && product.originalPrice > product.price).slice(0, 4);
  if (!slides.length && products.length) slides.push(products[0]);
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setActive((index) => (index + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);
  if (!slides.length) return null;
  const product = slides[active % slides.length];
  return <View>
    <Pressable onPress={() => router.push(`/product/${product.id}`)} style={styles.slide}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{product.originalPrice ? 'GIÁ ƯU ĐÃI' : 'LAPTOP MỚI'}</Text>
        <Text numberOfLines={2} style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        <View style={styles.cta}><Text style={styles.ctaText}>Xem chi tiết</Text></View>
      </View>
      <View style={styles.visual}><ProductImage uri={product.image} style={styles.image} /></View>
    </Pressable>
    {slides.length > 1 && <View style={styles.dots}>{slides.map((item, index) => <Pressable key={item.id} onPress={() => setActive(index)} style={[styles.dot, active === index && styles.dotActive]} />)}</View>}
  </View>;
}

const styles = StyleSheet.create({
  slide: { height: 194, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.navy, flexDirection: 'row' },
  copy: { flex: 1.2, padding: spacing.xl, justifyContent: 'center' },
  eyebrow: { ...typography.tiny, color: '#83D9FF', letterSpacing: 1 },
  title: { fontSize: 21, lineHeight: 26, fontWeight: '800', color: colors.white, marginTop: 6 },
  price: { ...typography.bodyMedium, color: colors.white, marginTop: spacing.sm },
  cta: { alignSelf: 'flex-start', backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 7, marginTop: spacing.md },
  ctaText: { ...typography.tiny, color: colors.primary },
  visual: { flex: 0.8, padding: spacing.md, justifyContent: 'center' },
  image: { width: '100%', height: 150, borderRadius: radius.md },
  dots: { height: 22, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.borderStrong },
  dotActive: { width: 20, backgroundColor: colors.primary },
});

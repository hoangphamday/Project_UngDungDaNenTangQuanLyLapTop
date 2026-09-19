import { colors, radius, spacing } from '@/constants/theme';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export function LoadingSkeleton({ cards = 4 }: { cards?: number }) {
  const [opacity] = useState(() => new Animated.Value(0.4));
  useEffect(() => { const animation = Animated.loop(Animated.sequence([Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }), Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true })])); animation.start(); return () => animation.stop(); }, [opacity]);
  return <View style={styles.grid}>{Array.from({ length: cards }, (_, index) => <Animated.View key={index} style={[styles.card, { opacity }]}><View style={styles.image} /><View style={styles.lineLong} /><View style={styles.lineShort} /><View style={styles.price} /></Animated.View>)}</View>;
}
const styles = StyleSheet.create({ grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, padding: spacing.lg }, card: { width: '47.8%', height: 252, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md }, image: { height: 130, backgroundColor: colors.surfaceAlt, borderRadius: radius.md }, lineLong: { height: 12, marginTop: spacing.md, width: '92%', backgroundColor: colors.surfaceAlt, borderRadius: 6 }, lineShort: { height: 12, marginTop: spacing.sm, width: '70%', backgroundColor: colors.surfaceAlt, borderRadius: 6 }, price: { height: 15, marginTop: spacing.lg, width: '58%', backgroundColor: colors.surfaceAlt, borderRadius: 7 } });

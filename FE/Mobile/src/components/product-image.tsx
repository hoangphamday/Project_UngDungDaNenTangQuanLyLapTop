import { colors } from '@/constants/theme';
import { Image, type ImageStyle } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type StyleProp } from 'react-native';
import { Icon } from './ui/icon';

export function ProductImage({ uri, style }: { uri: string; style?: StyleProp<ImageStyle> }) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  if (failedUri === uri || !uri) return <View style={[styles.fallback, style]}><Icon name="laptop" size={42} color={colors.textMuted} /></View>;
  return <Image source={{ uri }} style={style} contentFit="contain" transition={180} cachePolicy="memory-disk" recyclingKey={uri} onError={() => setFailedUri(uri)} />;
}
const styles = StyleSheet.create({ fallback: { backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' } });

import { Toast } from '@/components/toast';
import { colors } from '@/constants/theme';
import { AppProvider } from '@/state/app-context';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => { SplashScreen.hideAsync(); }, []);
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><AppProvider>
    <StatusBar style="dark" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" /><Stack.Screen name="(tabs)" /><Stack.Screen name="products/index" />
      <Stack.Screen name="product/[id]" /><Stack.Screen name="cart" /><Stack.Screen name="checkout" />
      <Stack.Screen name="order/[id]" /><Stack.Screen name="notifications" /><Stack.Screen name="profile" />
      <Stack.Screen name="addresses" /><Stack.Screen name="change-password" />
      <Stack.Screen name="auth/login" options={{ animation: 'fade' }} /><Stack.Screen name="auth/register" />
      <Stack.Screen name="auth/forgot-password" /><Stack.Screen name="auth/otp" />
    </Stack>
    <Toast />
  </AppProvider></SafeAreaProvider></GestureHandlerRootView>;
}

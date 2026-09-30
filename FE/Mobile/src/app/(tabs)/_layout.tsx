import { Icon, type IconName } from '@/components/ui/icon';
import { colors, layout, typography } from '@/constants/theme';
import { Tabs } from 'expo-router';
import { Platform, type ColorValue } from 'react-native';

const tabIcon = (name: IconName) => {
  function TabBarIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Icon name={name} size={focused ? 24 : 22} color={color} />;
  }
  return TabBarIcon;
};
export default function TabsLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.textMuted, tabBarLabelStyle: { ...typography.tiny, marginTop: Platform.OS === 'android' ? 2 : 0 }, tabBarStyle: { height: layout.tabBarHeight, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 24 : 8, borderTopColor: colors.border, backgroundColor: colors.white }, tabBarHideOnKeyboard: true }}>
    <Tabs.Screen name="index" options={{ title: 'Trang chủ', tabBarIcon: tabIcon('home') }} />
    <Tabs.Screen name="categories" options={{ title: 'Danh mục', tabBarIcon: tabIcon('grid') }} />
    <Tabs.Screen name="favorites" options={{ title: 'Yêu thích', tabBarIcon: tabIcon('heart') }} />
    <Tabs.Screen name="orders" options={{ title: 'Đơn hàng', tabBarIcon: tabIcon('receipt') }} />
    <Tabs.Screen name="account" options={{ title: 'Tài khoản', tabBarIcon: tabIcon('user') }} />
  </Tabs>;
}

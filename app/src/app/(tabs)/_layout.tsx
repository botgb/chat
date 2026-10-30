import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors, fonts } from '../../theme';

const icon = (glyph: string) =>
  function TabIcon({ focused }: { focused: boolean }) {
    return <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.45 }}>{glyph}</Text>;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarLabelStyle: { fontFamily: fonts.ui, fontSize: 12 },
        tabBarStyle: { borderTopWidth: 2, borderTopColor: colors.line, height: 64, paddingTop: 6 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Trilha', tabBarIcon: icon('🗺️') }} />
      <Tabs.Screen name="revisar" options={{ title: 'Revisar', tabBarIcon: icon('🔁') }} />
      <Tabs.Screen name="provas" options={{ title: 'Provas', tabBarIcon: icon('📚') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: icon('👤') }} />
    </Tabs>
  );
}

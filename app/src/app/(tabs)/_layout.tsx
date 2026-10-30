import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { colors } from '../../theme';

// Abas só com ícones; a aba ativa ganha uma moldura destacada.
const icon = (glyph: string) =>
  function TabIcon({ focused }: { focused: boolean }) {
    return (
      <View
        style={{
          width: 52,
          height: 44,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: focused ? colors.primary : 'transparent',
          backgroundColor: focused ? '#EAF1FF' : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 26, opacity: focused ? 1 : 0.7 }}>{glyph}</Text>
      </View>
    );
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { borderTopWidth: 2, borderTopColor: colors.line, height: 72, paddingTop: 10 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Trilha', tabBarIcon: icon('🏠') }} />
      <Tabs.Screen name="missoes" options={{ title: 'Missões', tabBarIcon: icon('🎯') }} />
      <Tabs.Screen name="ranking" options={{ title: 'Ranking', tabBarIcon: icon('🏆') }} />
      <Tabs.Screen name="assinatura" options={{ title: 'Assinatura', tabBarIcon: icon('👑') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: icon('👤') }} />
    </Tabs>
  );
}

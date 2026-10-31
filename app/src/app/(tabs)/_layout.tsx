import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Art, ArtName } from '../../illustrations/Art';
import {  } from '../../theme';
import { useColors } from '../../theme/ThemeContext';

// Abas só com ícones; a aba ativa ganha uma moldura destacada.
const icon = (art: ArtName) =>
  function TabIcon({ focused }: { focused: boolean }) {
    const colors = useColors();
    return (
      <View
        style={{
          width: 58,
          height: 54,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: focused ? colors.primary : 'transparent',
          backgroundColor: focused ? colors.selectedBg : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Art name={art} size={40} opacity={focused ? 1 : 0.75} />
      </View>
    );
  };

export default function TabsLayout() {
  const colors = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: colors.bg, borderTopWidth: 2, borderTopColor: colors.line, height: 84, paddingTop: 12 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Trilha', tabBarAccessibilityLabel: 'Trilha', tabBarIcon: icon('inicio') }} />
      <Tabs.Screen name="missoes" options={{ title: 'Missões', tabBarAccessibilityLabel: 'Missões', tabBarIcon: icon('missoes') }} />
      <Tabs.Screen name="ranking" options={{ title: 'Ranking', tabBarAccessibilityLabel: 'Ranking', tabBarIcon: icon('ranking') }} />
      <Tabs.Screen name="assinatura" options={{ title: 'Assinatura', tabBarAccessibilityLabel: 'Assinatura', tabBarIcon: icon('assinatura') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarAccessibilityLabel: 'Perfil', tabBarIcon: icon('perfil') }} />
    </Tabs>
  );
}

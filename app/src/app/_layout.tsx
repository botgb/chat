import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible';
import { Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppStateProvider } from '../state/AppState';
import { colors } from '../theme';

export default function RootLayout() {
  const [loaded] = useFonts({
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });
  useEffect(() => {
    if (Platform.OS === 'web') return;
    // Mostra os lembretes mesmo com o app aberto.
    import('expo-notifications').then((N) =>
      N.setNotificationHandler({
        handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
      }),
    );
  }, []);

  if (!loaded) return null;

  return (
    <AppStateProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="licao" options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="provas" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="configuracoes" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </AppStateProvider>
  );
}

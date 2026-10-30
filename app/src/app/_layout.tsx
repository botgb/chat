import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible';
import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppStateProvider } from '../state/AppState';
import { colors, fonts } from '../theme';

export default function RootLayout() {
  const [loaded] = useFonts({
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_800ExtraBold,
  });
  if (!loaded) return null;

  return (
    <AppStateProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.sheet },
          headerTitleStyle: { fontFamily: fonts.displayMedium, color: colors.ink },
          headerTintColor: colors.ink,
          contentStyle: { backgroundColor: colors.sheet },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="provas" options={{ title: 'Provas' }} />
        <Stack.Screen name="licao" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </AppStateProvider>
  );
}

import { router, useLocalSearchParams } from 'expo-router';
import { PromoPlayer } from '../components/PromoPlayer';

// Prévia dos vídeos do Plus para desenvolvimento: /promo-preview?id=vidas.
// No app publicado (__DEV__ falso) a tela não mostra nada.
export default function PromoPreview() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!__DEV__) return null;
  return <PromoPlayer visible forceId={id} onClose={() => router.back()} onCta={() => router.back()} />;
}

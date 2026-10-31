// Plano de assinatura do usuário. A cobrança ainda não existe: todo mundo está no grátis.
// Para testar as telas pagas em desenvolvimento: EXPO_PUBLIC_PLAN=ultra npx expo start
export type Plan = 'gratis' | 'plus' | 'ultra';

export function currentPlan(): Plan {
  const forced = process.env.EXPO_PUBLIC_PLAN;
  if (__DEV__ && (forced === 'plus' || forced === 'ultra')) return forced;
  return 'gratis';
}

/** Plus ou Ultra (ambos tiram os vídeos entre as lições e dão vidas infinitas). */
export const hasPlus = (): boolean => currentPlan() !== 'gratis';
/** Ultra: provas ilimitadas, ofensiva protegida e estatísticas por assunto. */
export const hasUltra = (): boolean => currentPlan() === 'ultra';

/** Provas no aparelho ao mesmo tempo nos planos grátis e Plus. */
export const FREE_EXAM_LIMIT = 5;

import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { TopBar } from '../../components/TopBar';
import { Art, ArtName } from '../../illustrations/Art';
import { currentPlan } from '../../lib/plus';
import { Colors, fonts, radius, space, type } from '../../theme';
import { useStyles } from '../../theme/ThemeContext';

// Apresentação dos planos. A cobrança exige compras dentro do app (App Store / Google Play)
// e um build próprio do app; ainda não está ligada.
type Benefit = { icon: ArtName; title: string; text: string };

const PLUS: Benefit[] = [
  { icon: 'vidas', title: 'Vidas infinitas', text: 'Errar não interrompe a lição.' },
  { icon: 'raio', title: 'Sem anúncios', text: 'Nada de vídeos entre uma lição e outra.' },
];

const ULTRA: Benefit[] = [
  { icon: 'plus', title: 'Tudo do Plus', text: 'Vidas infinitas e nenhum anúncio.' },
  { icon: 'prova', title: 'Provas ilimitadas', text: 'Baixe quantas provas quiser ao mesmo tempo (no grátis e no Plus, até 5).' },
  { icon: 'ofensiva', title: 'Ofensiva protegida', text: 'A ofensiva só zera depois de 2 dias seguidos sem estudar, sempre.' },
  { icon: 'ranking', title: 'Acertos por assunto', text: 'Veja em quais assuntos de cada matéria você mais erra.' },
];

const PLAN_NAME = { gratis: 'Grátis', plus: 'Plus', ultra: 'Ultra' } as const;

export default function Assinatura() {
  const styles = useStyles(createStyles);
  const plan = currentPlan();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar />
      <ScrollView contentContainerStyle={{ padding: space(4), gap: space(5), paddingBottom: space(12) }}>
        <Text style={styles.current}>Seu plano: {PLAN_NAME[plan]}</Text>

        <PlanCard
          crown="plus"
          name="Aprova Plus"
          tagline="Estude sem pausas."
          benefits={PLUS}
          tone="plus"
          active={plan === 'plus'}
        />
        <PlanCard
          crown="ultra"
          name="Aprova Ultra"
          tagline="Para quem leva a preparação a sério."
          benefits={ULTRA}
          tone="ultra"
          active={plan === 'ultra'}
        />

        <Text style={[styles.muted, { textAlign: 'center' }]}>
          As assinaturas ainda não estão disponíveis. Tudo o que existe hoje no app continua grátis.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanCard({ crown, name, tagline, benefits, tone, active }: { crown: ArtName; name: string; tagline: string; benefits: Benefit[]; tone: 'plus' | 'ultra'; active: boolean }) {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.card}>
      {tone === 'ultra' && <PulseFrame />}
      <View style={styles.head}>
        <Art name={crown} size={64} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, tone === 'ultra' && { color: '#FFC531' }]}>{name}</Text>
          <Text style={styles.tagline}>{tagline}</Text>
        </View>
      </View>
      <View style={{ gap: space(3) }}>
        {benefits.map((b) => (
          <View key={b.title} style={styles.benefit}>
            <Art name={b.icon} size={32} />
            <View style={{ flex: 1 }}>
              <Text style={styles.benefitTitle}>{b.title}</Text>
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          </View>
        ))}
      </View>
      <Button label={active ? 'Seu plano atual' : 'Em breve'} disabled onPress={() => {}} />
    </View>
  );
}

// Moldura amarela que pulsa como um LED (fica acesa e parada com "reduzir movimento").
function PulseFrame() {
  const styles = useStyles(createStyles);
  const glow = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!alive || reduce) return;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 0.25, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(glow, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      );
      loop.start();
    });
    return () => {
      alive = false;
      loop?.stop();
    };
  }, [glow]);
  return (
    <>
      <View pointerEvents="none" style={styles.frameBase} />
      <Animated.View pointerEvents="none" style={[styles.frameGlow, { opacity: glow }]} />
    </>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  current: { fontFamily: fonts.displayMedium, fontSize: type.body, color: colors.inkSoft, textAlign: 'center' },
  card: { backgroundColor: colors.card, borderRadius: radius.card, borderCurve: 'continuous', borderWidth: 2, borderColor: colors.line, borderBottomWidth: 6, padding: space(5), gap: space(4) },
  frameBase: { position: 'absolute', top: -2, left: -2, right: -2, bottom: -6, borderRadius: radius.card, borderCurve: 'continuous', borderWidth: 3, borderColor: 'rgba(255, 197, 49, 0.35)' },
  frameGlow: { position: 'absolute', top: -2, left: -2, right: -2, bottom: -6, borderRadius: radius.card, borderCurve: 'continuous', borderWidth: 3, borderColor: '#FFC531', boxShadow: '0 0 16px 3px rgba(255, 197, 49, 0.75), inset 0 0 10px 1px rgba(255, 197, 49, 0.35)' },
  head: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  name: { fontFamily: fonts.display, fontSize: type.title, color: colors.ink },
  tagline: { fontFamily: fonts.ui, fontSize: type.body - 1, color: colors.inkSoft },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: space(3), padding: space(3), borderRadius: radius.row, borderCurve: 'continuous', backgroundColor: colors.surface },
  benefitTitle: { fontFamily: fonts.displayMedium, fontSize: type.body, color: colors.ink },
  benefitText: { fontFamily: fonts.body, fontSize: type.small, color: colors.inkSoft, lineHeight: type.small * 1.4 },
  muted: { fontFamily: fonts.body, fontSize: type.small + 1, color: colors.inkSoft, lineHeight: (type.small + 1) * 1.4 },
});

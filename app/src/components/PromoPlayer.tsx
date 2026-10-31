// Vídeos curtos do Plus exibidos após as lições (roteiros em docs/roteiros-plus.md).
// São animações nativas: funcionam offline e não pesam no download.
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Art, Mascot, MascotName } from '../illustrations/Art';
import { fonts, space, type } from '../theme';

export const PROMO_MS = 10_000;
export const SKIP_AFTER_MS = 5_000;
const FINAL_AT = 7_000;

type T = Animated.Value; // tempo em milissegundos, de 0 a PROMO_MS

/** Opacidade que aparece em `from` e some em `to` (ou fica, se `to` for omitido). */
const show = (t: T, from: number, to = PROMO_MS + 1) =>
  t.interpolate({ inputRange: [from - 250, from, to - 250, to], outputRange: [0, 1, 1, 0], extrapolate: 'clamp' });

/** Valor que vai de `a` a `b` entre os instantes `from` e `until`. */
const tween = (t: T, from: number, until: number, a: number, b: number) =>
  t.interpolate({ inputRange: [from, until], outputRange: [a, b], extrapolate: 'clamp' });

type Promo = {
  id: string;
  mascot: MascotName;
  bg: string;
  bgDark: string;
  problem: string;
  solution: string;
  benefit: string;
  prop: (t: T) => ReactNode;
};

const Heart = ({ opacity, scale = 1 }: { opacity: Animated.AnimatedInterpolation<number> | number; scale?: number }) => (
  <Animated.View style={{ opacity, transform: [{ scale }] }}>
    <Art name="vidas" size={34} />
  </Animated.View>
);

export const PROMOS: Promo[] = [
  {
    id: 'vidas',
    mascot: 'gabaritatu',
    bg: '#2F6FE8',
    bgDark: '#1F4FB8',
    problem: 'Errou de novo?',
    solution: 'No Plus, as vidas não acabam.',
    benefit: 'Vidas ilimitadas',
    prop: (t) => (
      <View style={{ alignItems: 'center' }}>
        <Animated.View style={[s.row, { opacity: show(t, 600, 4000) }]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Heart key={i} opacity={tween(t, 1200 + i * 450, 1500 + i * 450, 1, 0.15)} />
          ))}
        </Animated.View>
        <Animated.View style={[s.row, s.overlay, { opacity: show(t, 4000) }]}>
          <Heart opacity={1} scale={1.4} />
          <Text style={s.bigSymbol}>∞</Text>
        </Animated.View>
      </View>
    ),
  },
  {
    id: 'simulado',
    mascot: 'simulaguia',
    bg: '#D93030',
    bgDark: '#A32121',
    problem: 'Questão solta é aquecimento.',
    solution: 'Treine a prova inteira, no tempo oficial.',
    benefit: 'Simulados completos',
    prop: (t) => (
      <View style={{ alignItems: 'center' }}>
        <Animated.View style={[s.row, { opacity: show(t, 600, 4000) }]}>
          {[0, 1, 2].map((i) => (
            <Animated.View key={i} style={{ opacity: show(t, 900 + i * 400, 4000), transform: [{ rotate: `${(i - 1) * 12}deg` }] }}>
              <Art name="prova" size={44} />
            </Animated.View>
          ))}
        </Animated.View>
        <Animated.View style={[s.row, s.overlay, { opacity: show(t, 4000) }]}>
          <Animated.View style={{ transform: [{ rotate: tween(t, 4000, 7000, 0, 360).interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) }] }}>
            <Art name="cronometro" size={52} />
          </Animated.View>
          <Text style={s.bigText}>5h30</Text>
        </Animated.View>
      </View>
    ),
  },
  {
    id: 'estatisticas',
    mascot: 'aprovaca',
    bg: '#7A4FD8',
    bgDark: '#5C35B3',
    problem: 'Você sabe onde mais erra?',
    solution: 'Veja seu acerto por assunto.',
    benefit: 'Estatísticas por assunto',
    prop: (t) => (
      <Animated.View style={[s.bars, { opacity: show(t, 3600) }]}>
        {[
          { label: 'Bio', pct: 0.82 },
          { label: 'Quím', pct: 0.7 },
          { label: 'Mat', pct: 0.64 },
          { label: 'Fís', pct: 0.38, low: true },
        ].map((b, i) => (
          <View key={b.label} style={s.barCol}>
            {b.low && <Animated.Text style={[s.barTag, { opacity: show(t, 5600) }]}>38%</Animated.Text>}
            <View style={s.barTrack}>
              <Animated.View
                style={[
                  s.barFill,
                  { backgroundColor: b.low ? '#FF5C5C' : '#FFFFFF', transform: [{ scaleY: tween(t, 4000 + i * 250, 5000 + i * 250, 0, b.pct) }] },
                ]}
              />
            </View>
            <Text style={s.barLabel}>{b.label}</Text>
          </View>
        ))}
      </Animated.View>
    ),
  },
  {
    id: 'ofensiva',
    mascot: 'passarinho',
    bg: '#14A090',
    bgDark: '#0E7A6E',
    problem: 'Dia corrido?',
    solution: 'Congelamentos extras protegem sua sequência.',
    benefit: 'Ofensiva protegida',
    prop: (t) => (
      <View style={[s.row, { opacity: 1 }]}>
        <Animated.View
          style={{
            opacity: show(t, 600),
            transform: [{ rotate: t.interpolate({ inputRange: [600, 1000, 1400, 1800, 2200, 4000], outputRange: ['0deg', '-8deg', '8deg', '-8deg', '0deg', '0deg'], extrapolate: 'clamp' }) }],
          }}
        >
          <View style={s.flameWrap}>
            <Animated.View style={[s.iceShield, { opacity: show(t, 4200), transform: [{ scale: tween(t, 4200, 4800, 0.6, 1) }] }]} />
            <Art name="ofensiva" size={56} />
          </View>
        </Animated.View>
        <Animated.Text style={[s.bigText, { opacity: show(t, 600) }]}>120</Animated.Text>
      </View>
    ),
  },
  {
    id: 'sem-anuncios',
    mascot: 'gabamico',
    bg: '#E8780F',
    bgDark: '#B85A00',
    problem: 'Tipo este aqui…',
    solution: 'No Plus, nada de interrupção.',
    benefit: 'Estude sem anúncios',
    prop: (t) => (
      <Animated.View
        style={{
          opacity: show(t, 600, 6200),
          transform: [{ translateX: tween(t, 5200, 6200, 0, 400) }, { rotate: '-4deg' }],
        }}
      >
        <View style={s.adCard}>
          <Text style={s.adText}>Anúncio</Text>
          <Animated.Text style={[s.adX, { opacity: show(t, 4000) }]}>✕</Animated.Text>
        </View>
      </Animated.View>
    ),
  },
  {
    id: 'elenco',
    mascot: 'radacao',
    bg: '#22305E',
    bgDark: '#141D3D',
    problem: 'Rumo à aprovação…',
    solution: '…com o time completo e sem limites.',
    benefit: 'Plus: tudo liberado',
    prop: (t) => (
      <View style={s.row}>
        {(['gabaritatu', 'gabamico', 'aprovaca', 'simulaguia', 'passarinho'] as MascotName[]).map((m, i) => (
          <Animated.View key={m} style={{ opacity: show(t, 800 + i * 450), transform: [{ translateY: tween(t, 800 + i * 450, 1200 + i * 450, 30, 0) }] }}>
            <Mascot name={m} size={48} />
          </Animated.View>
        ))}
      </View>
    ),
  },
];

let lastPromo: string | null = null;

/** Sorteia um vídeo diferente do último exibido. */
export function pickPromo(random = Math.random): Promo {
  const pool = PROMOS.filter((p) => p.id !== lastPromo);
  const p = pool[Math.floor(random() * pool.length)];
  lastPromo = p.id;
  return p;
}

export function PromoPlayer({
  visible,
  onClose,
  onCta,
  forceId,
}: {
  visible: boolean;
  onClose: () => void;
  onCta: () => void;
  forceId?: string; // só para a prévia de desenvolvimento
}) {
  const promo = useMemo(
    () => (forceId ? PROMOS.find((p) => p.id === forceId) ?? PROMOS[0] : visible ? pickPromo() : PROMOS[0]),
    [visible, forceId],
  );
  const t = useRef(new Animated.Value(0)).current;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!visible) return;
    t.setValue(0);
    setElapsed(0);
    const anim = Animated.timing(t, { toValue: PROMO_MS, duration: PROMO_MS, easing: Easing.linear, useNativeDriver: true });
    anim.start(({ finished }) => finished && onClose());
    const started = Date.now();
    const tick = setInterval(() => setElapsed(Date.now() - started), 250);
    return () => {
      anim.stop();
      clearInterval(tick);
    };
    // onClose muda a cada renderização de quem chama; o vídeo só reinicia quando abre
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, t]);

  const canSkip = elapsed >= SKIP_AFTER_MS;
  const showCta = elapsed >= FINAL_AT - 250;
  const left = Math.max(1, Math.ceil((SKIP_AFTER_MS - elapsed) / 1000));

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={() => {
        if (canSkip) onClose();
      }}>
      <SafeAreaView style={[s.screen, { backgroundColor: promo.bg }]}>
        <View style={s.top}>
          <View style={[s.track, { backgroundColor: promo.bgDark }]}>
            <Animated.View style={[s.fill, { transform: [{ scaleX: tween(t, 0, PROMO_MS, 0, 1) }] }]} />
          </View>
          <Pressable
            onPress={onClose}
            disabled={!canSkip}
            accessibilityRole="button"
            accessibilityLabel={canSkip ? 'Pular' : `Pular em ${left} segundos`}
            style={[s.skip, { backgroundColor: promo.bgDark }]}
          >
            <Text style={s.skipText}>{canSkip ? 'Pular ✕' : `Pular em ${left}`}</Text>
          </Pressable>
        </View>

        <View style={s.stage}>
          <View style={s.texts}>
            <Animated.Text style={[s.line, { opacity: show(t, 600, 4000) }]}>{promo.problem}</Animated.Text>
            <Animated.Text style={[s.line, s.abs, { opacity: show(t, 4000, FINAL_AT) }]}>{promo.solution}</Animated.Text>
            <Animated.View style={[s.abs, s.finalBox, { opacity: show(t, FINAL_AT), transform: [{ scale: tween(t, FINAL_AT, FINAL_AT + 400, 0.8, 1) }] }]}>
              <View style={s.badge}>
                <Art name="assinatura" size={28} />
                <Text style={s.badgeText}>Plus</Text>
              </View>
              <Text style={s.benefit}>{promo.benefit}</Text>
            </Animated.View>
          </View>

          <View style={s.propArea}>{promo.prop(t)}</View>

          <Animated.View
            style={{
              transform: [
                { translateY: tween(t, 0, 600, 260, 0) },
                { translateY: t.interpolate({ inputRange: [600, 2600, 4600, 6600, 8600, 10000], outputRange: [0, -6, 0, -6, 0, -4] }) },
              ],
            }}
          >
            <Mascot name={promo.mascot} size={150} />
          </Animated.View>
        </View>

        <View style={[s.bottom, { opacity: showCta ? 1 : 0 }]} pointerEvents={showCta ? 'auto' : 'none'}>
          <Pressable onPress={onCta} accessibilityRole="button" style={({ pressed }) => [s.cta, pressed && { transform: [{ translateY: 3 }] }]}>
            <Text style={[s.ctaText, { color: promo.bgDark }]}>Conhecer o Plus</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingHorizontal: space(4), paddingTop: space(2) },
  track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, width: '100%', backgroundColor: '#FFFFFF', transformOrigin: 'left' },
  skip: { borderRadius: 999, paddingHorizontal: space(3), paddingVertical: space(1.5), minWidth: 104, alignItems: 'center' },
  skipText: { fontFamily: fonts.display, fontSize: type.small + 1, color: '#FFFFFF' },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space(6), paddingHorizontal: space(6) },
  texts: { minHeight: 110, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  line: { fontFamily: fonts.display, fontSize: type.title + 2, lineHeight: (type.title + 2) * 1.2, color: '#FFFFFF', textAlign: 'center' },
  abs: { position: 'absolute', left: 0, right: 0 },
  finalBox: { alignItems: 'center', gap: space(2) },
  badge: { flexDirection: 'row', alignItems: 'center', gap: space(2), backgroundColor: '#2B2D42', paddingHorizontal: space(4), paddingVertical: space(1.5), borderRadius: 999 },
  badgeText: { fontFamily: fonts.display, fontSize: type.lead, color: '#FFC531' },
  benefit: { fontFamily: fonts.display, fontSize: type.hero, lineHeight: type.hero * 1.1, color: '#FFFFFF', textAlign: 'center' },
  propArea: { minHeight: 100, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  overlay: { position: 'absolute' },
  bigSymbol: { fontFamily: fonts.display, fontSize: 64, color: '#FFFFFF' },
  bigText: { fontFamily: fonts.display, fontSize: 44, color: '#FFFFFF' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: space(4), height: 120 },
  barCol: { alignItems: 'center', gap: space(1) },
  barTrack: { width: 30, height: 90, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: 30, height: 90, borderRadius: 8, transformOrigin: 'bottom' },
  barLabel: { fontFamily: fonts.display, fontSize: type.small, color: '#FFFFFF' },
  barTag: { fontFamily: fonts.display, fontSize: type.small, color: '#FFFFFF', backgroundColor: '#FF5C5C', paddingHorizontal: 6, borderRadius: 6, overflow: 'hidden' },
  flameWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  iceShield: { position: 'absolute', width: 96, height: 96, borderRadius: 48, borderWidth: 5, borderColor: '#BDEBFF', backgroundColor: 'rgba(189,235,255,0.25)' },
  adCard: { backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: space(8), paddingVertical: space(5), alignItems: 'center', justifyContent: 'center' },
  adText: { fontFamily: fonts.display, fontSize: type.title, color: '#9AA0B5' },
  adX: { position: 'absolute', fontFamily: fonts.display, fontSize: 80, color: '#D93030' },
  bottom: { paddingHorizontal: space(5), paddingBottom: space(5) },
  cta: { backgroundColor: '#FFFFFF', borderRadius: 16, borderBottomWidth: 5, borderBottomColor: 'rgba(0,0,0,0.18)', paddingVertical: space(3.5), alignItems: 'center' },
  ctaText: { fontFamily: fonts.display, fontSize: type.lead },
});

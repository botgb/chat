// Vídeos curtos do Plus exibidos após as lições (roteiros em docs/roteiros-plus.md).
// São animações nativas com diálogo entre os mascotes, efeitos sonoros e trilha:
// funcionam offline e não pesam no download.
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Art, Mascot, MascotName, TalkingMascot } from '../illustrations/Art';
import { createPromoAudio, PromoAudio, Sfx } from '../lib/promoAudio';
import { useApp } from '../state/AppState';
import { fonts, space, type } from '../theme';

export const PROMO_MS = 10_000;
export const SKIP_AFTER_MS = 5_000;
export const FINAL_AT = 7_000;
const SCENE_2 = 4_000;
const ENTER_MS = 600;
const TICK_MS = 100;

type T = Animated.Value; // tempo em milissegundos, de 0 a PROMO_MS

/** Opacidade que aparece em `from` e some em `to` (ou fica, se `to` for omitido). */
const show = (t: T, from: number, to = PROMO_MS + 1) =>
  t.interpolate({ inputRange: [from - 250, from, to - 250, to], outputRange: [0, 1, 1, 0], extrapolate: 'clamp' });

/** Valor que vai de `a` a `b` entre os instantes `from` e `until`. */
const tween = (t: T, from: number, until: number, a: number, b: number) =>
  t.interpolate({ inputRange: [from, until], outputRange: [a, b], extrapolate: 'clamp' });

/** Uma fala: quem fala (posição no elenco), quando começa e termina, e o texto do balão. */
export type Line = { who: number; from: number; to: number; text: string };

export type Promo = {
  id: string;
  cast: MascotName[]; // um (monólogo) ou dois (diálogo: esquerda e direita)
  lines: Line[];
  bg: string;
  bgDark: string;
  benefit: string;
  prop: (t: T) => ReactNode;
};

const Heart = ({ opacity, scale = 1 }: { opacity: Animated.AnimatedInterpolation<number> | number; scale?: number }) => (
  <Animated.View style={{ opacity, transform: [{ scale }] }}>
    <Art name="vidas" size={30} />
  </Animated.View>
);

export const PROMOS: Promo[] = [
  {
    id: 'vidas',
    cast: ['gabamico', 'gabaritatu'],
    lines: [
      { who: 0, from: 800, to: 3800, text: 'Acabaram suas vidas de novo, Gabaritatu?' },
      { who: 1, from: SCENE_2, to: FINAL_AT, text: 'Que nada. No Plus, minhas vidas não acabam.' },
    ],
    bg: '#2F6FE8',
    bgDark: '#1F4FB8',
    benefit: 'Vidas ilimitadas',
    prop: (t) => (
      <View style={{ alignItems: 'center' }}>
        <Animated.View style={[s.row, { opacity: show(t, 600, SCENE_2) }]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Heart key={i} opacity={tween(t, 1400 + i * 400, 1700 + i * 400, 1, 0.15)} />
          ))}
        </Animated.View>
        <Animated.View style={[s.row, s.overlay, { opacity: show(t, SCENE_2 + 600) }]}>
          <Heart opacity={1} scale={1.4} />
          <Text style={s.bigSymbol}>∞</Text>
        </Animated.View>
      </View>
    ),
  },
  {
    id: 'simulado',
    cast: ['simulaguia'],
    lines: [
      { who: 0, from: 800, to: 3800, text: 'Questão solta é aquecimento.' },
      { who: 0, from: SCENE_2, to: FINAL_AT, text: 'Quer passar? Treine a prova inteira, no tempo oficial.' },
    ],
    bg: '#D93030',
    bgDark: '#A32121',
    benefit: 'Simulados completos',
    prop: (t) => (
      <View style={{ alignItems: 'center' }}>
        <Animated.View style={[s.row, { opacity: show(t, 600, SCENE_2) }]}>
          {[0, 1, 2].map((i) => (
            <Animated.View key={i} style={{ opacity: show(t, 1000 + i * 400, SCENE_2), transform: [{ rotate: `${(i - 1) * 12}deg` }] }}>
              <Art name="prova" size={40} />
            </Animated.View>
          ))}
        </Animated.View>
        <Animated.View style={[s.row, s.overlay, { opacity: show(t, SCENE_2) }]}>
          <Animated.View style={{ transform: [{ rotate: tween(t, SCENE_2, FINAL_AT, 0, 360).interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) }] }}>
            <Art name="cronometro" size={48} />
          </Animated.View>
          <Text style={s.bigText}>5h30</Text>
        </Animated.View>
      </View>
    ),
  },
  {
    id: 'estatisticas',
    cast: ['radacao', 'aprovaca'],
    lines: [
      { who: 0, from: 800, to: 3800, text: 'Eu acho que vou bem em tudo.' },
      { who: 1, from: SCENE_2, to: FINAL_AT, text: 'Acha? No Plus eu sei: Física, 38%.' },
    ],
    bg: '#7A4FD8',
    bgDark: '#5C35B3',
    benefit: 'Estatísticas por assunto',
    prop: (t) => (
      <Animated.View style={[s.bars, { opacity: show(t, SCENE_2) }]}>
        {[
          { label: 'Bio', pct: 0.82 },
          { label: 'Quím', pct: 0.7 },
          { label: 'Mat', pct: 0.64 },
          { label: 'Fís', pct: 0.38, low: true },
        ].map((b, i) => (
          <View key={b.label} style={s.barCol}>
            {b.low && <Animated.Text style={[s.barTag, { opacity: show(t, 5800) }]}>38%</Animated.Text>}
            <View style={s.barTrack}>
              <Animated.View
                style={[
                  s.barFill,
                  { backgroundColor: b.low ? '#FF5C5C' : '#FFFFFF', transform: [{ scaleY: tween(t, 4300 + i * 250, 5300 + i * 250, 0, b.pct) }] },
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
    cast: ['gabaritatu', 'passarinho'],
    lines: [
      { who: 0, from: 800, to: 3800, text: '120 dias de ofensiva! Mas amanhã eu viajo…' },
      { who: 1, from: SCENE_2, to: FINAL_AT, text: 'Relaxa. No Plus, o congelamento segura pra você.' },
    ],
    bg: '#14A090',
    bgDark: '#0E7A6E',
    benefit: 'Ofensiva protegida',
    prop: (t) => (
      <View style={s.row}>
        <Animated.View
          style={{
            opacity: show(t, 600),
            transform: [{ rotate: t.interpolate({ inputRange: [2200, 2600, 3000, 3400, 3800], outputRange: ['0deg', '-10deg', '10deg', '-10deg', '0deg'], extrapolate: 'clamp' }) }],
          }}
        >
          <View style={s.flameWrap}>
            <Animated.View style={[s.iceShield, { opacity: show(t, 4800), transform: [{ scale: tween(t, 4800, 5400, 0.6, 1) }] }]} />
            <Art name="ofensiva" size={52} />
          </View>
        </Animated.View>
        <Animated.Text style={[s.bigText, { opacity: show(t, 600) }]}>120</Animated.Text>
      </View>
    ),
  },
  {
    id: 'sem-anuncios',
    cast: ['gabamico'],
    lines: [
      { who: 0, from: 800, to: 3800, text: 'Sim, eu sou um anúncio.' },
      { who: 0, from: SCENE_2, to: FINAL_AT, text: 'No Plus, eu sumo. Nada de interrupção.' },
    ],
    bg: '#E8780F',
    bgDark: '#B85A00',
    benefit: 'Estude sem anúncios',
    prop: (t) => (
      <Animated.View
        style={{
          opacity: show(t, 600, 6400),
          transform: [{ translateX: tween(t, 5400, 6400, 0, 400) }, { rotate: '-4deg' }],
        }}
      >
        <View style={s.adCard}>
          <Text style={s.adText}>Anúncio</Text>
          <Animated.Text style={[s.adX, { opacity: show(t, 4600) }]}>✕</Animated.Text>
        </View>
      </Animated.View>
    ),
  },
  {
    id: 'elenco',
    cast: ['radacao', 'gabaritatu'],
    lines: [
      { who: 0, from: 800, to: 3600, text: 'E aí, time? Bora estudar?' },
      { who: 1, from: 3800, to: FINAL_AT, text: 'Bora gabaritar! Com o Plus, tudo liberado!' },
    ],
    bg: '#22305E',
    bgDark: '#141D3D',
    benefit: 'Plus: tudo liberado',
    prop: (t) => (
      <View style={s.row}>
        {(['gabamico', 'aprovaca', 'simulaguia', 'passarinho'] as MascotName[]).map((m, i) => (
          <Animated.View
            key={m}
            style={{
              opacity: show(t, 1600 + i * 350),
              transform: [
                { translateY: tween(t, 1600 + i * 350, 1900 + i * 350, 40, 0) },
                // todos pulam juntos quando o Gabaritatu chama o time
                { translateY: t.interpolate({ inputRange: [4200, 4400, 4600], outputRange: [0, -14, 0], extrapolate: 'clamp' }) },
              ],
            }}
          >
            <Mascot name={m} size={46} />
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

export type Cue = { at: number; sfx?: Sfx; voice?: number };

/** Linha do tempo de sons: entradas, pulo a cada fala, troca de cena e vinheta final. */
export function promoCues(promo: Promo): Cue[] {
  const cues: Cue[] = promo.cast.map((_, i) => ({ at: i * 250, sfx: 'pop' as Sfx }));
  promo.lines.forEach((l, i) => cues.push({ at: l.from, sfx: 'boing' }, { at: l.from + 80, voice: i }));
  cues.push({ at: SCENE_2 - 150, sfx: 'whoosh' }, { at: FINAL_AT, sfx: 'vinheta' }, { at: FINAL_AT + 500, sfx: 'ding' });
  return cues.sort((a, b) => a.at - b.at);
}

/** Pulo curto do personagem no início de cada fala dele. */
function hops(t: T, lines: Line[], who: number) {
  const starts = lines.filter((l) => l.who === who).map((l) => l.from);
  if (!starts.length) return 0;
  const input: number[] = [];
  const output: number[] = [];
  for (const f of starts) {
    input.push(f, f + 140, f + 300);
    output.push(0, -18, 0);
  }
  return t.interpolate({ inputRange: input, outputRange: output, extrapolate: 'clamp' });
}

function Bubble({ t, line, side }: { t: T; line: Line; side: 'left' | 'right' | 'center' }) {
  const align = side === 'left' ? 'flex-start' : side === 'right' ? 'flex-end' : 'center';
  return (
    <Animated.View
      style={[
        s.bubbleWrap,
        { alignItems: align, opacity: show(t, line.from + 100, line.to), transform: [{ scale: tween(t, line.from, line.from + 220, 0.7, 1) }] },
      ]}
    >
      <View style={s.bubble}>
        <Text style={s.bubbleText}>{line.text}</Text>
      </View>
      <View style={[s.tail, side === 'left' ? { marginLeft: 44 } : side === 'right' ? { marginRight: 44 } : null]} />
    </Animated.View>
  );
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
  const { settings } = useApp();
  const promo = useMemo(
    () => (forceId ? PROMOS.find((p) => p.id === forceId) ?? PROMOS[0] : visible ? pickPromo() : PROMOS[0]),
    [visible, forceId],
  );
  const t = useRef(new Animated.Value(0)).current;
  const [elapsed, setElapsed] = useState(0);
  const audio = useRef<PromoAudio | null>(null);

  useEffect(() => {
    if (!visible) return;
    t.setValue(0);
    setElapsed(0);
    const sound = createPromoAudio(promo.id, settings.sound);
    audio.current = sound;
    const cues = promoCues(promo);
    let next = 0;
    const anim = Animated.timing(t, { toValue: PROMO_MS, duration: PROMO_MS, easing: Easing.linear, useNativeDriver: true });
    anim.start(({ finished }) => finished && onClose());
    const started = Date.now();
    const tick = setInterval(() => {
      const now = Date.now() - started;
      setElapsed(now);
      while (next < cues.length && cues[next].at <= now) {
        const c = cues[next++];
        if (c.sfx) sound.sfx(c.sfx);
        if (c.voice !== undefined) sound.voice(c.voice);
      }
    }, TICK_MS);
    return () => {
      anim.stop();
      clearInterval(tick);
      sound.release();
      audio.current = null;
    };
    // onClose muda a cada renderização de quem chama; o vídeo só reinicia quando abre
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, t, promo]);

  const canSkip = elapsed >= SKIP_AFTER_MS;
  const showCta = elapsed >= FINAL_AT - 250;
  const left = Math.max(1, Math.ceil((SKIP_AFTER_MS - elapsed) / 1000));
  // A boca mexe durante a fala e para um pouco antes de o balão sumir.
  const speaking = promo.lines.find((l) => elapsed >= l.from && elapsed < l.to - 500)?.who;
  const duo = promo.cast.length > 1;
  const close = () => {
    audio.current?.release();
    onClose();
  };
  const cta = () => {
    audio.current?.release();
    onCta();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={() => {
        if (canSkip) close();
      }}
    >
      <SafeAreaView style={[s.screen, { backgroundColor: promo.bg }]}>
        <View style={s.top}>
          <View style={[s.track, { backgroundColor: promo.bgDark }]}>
            <Animated.View style={[s.fill, { transform: [{ scaleX: tween(t, 0, PROMO_MS, 0, 1) }] }]} />
          </View>
          <Pressable
            onPress={close}
            disabled={!canSkip}
            accessibilityRole="button"
            accessibilityLabel={canSkip ? 'Pular' : `Pular em ${left} segundos`}
            style={[s.skip, { backgroundColor: promo.bgDark }]}
          >
            <Text style={s.skipText}>{canSkip ? 'Pular ✕' : `Pular em ${left}`}</Text>
          </Pressable>
        </View>

        <View style={s.stage}>
          <View style={s.talk}>
            {promo.lines.map((l, i) => (
              <Bubble key={i} t={t} line={l} side={duo ? (l.who === 0 ? 'left' : 'right') : 'center'} />
            ))}
            <Animated.View style={[s.abs, s.finalBox, { opacity: show(t, FINAL_AT), transform: [{ scale: tween(t, FINAL_AT, FINAL_AT + 400, 0.8, 1) }] }]}>
              <View style={s.badge}>
                <Art name="assinatura" size={28} />
                <Text style={s.badgeText}>Plus</Text>
              </View>
              <Text style={s.benefit}>{promo.benefit}</Text>
            </Animated.View>
          </View>

          <View style={s.propArea}>{promo.prop(t)}</View>

          <View style={[s.cast, { justifyContent: duo ? 'space-between' : 'center' }]}>
            {promo.cast.map((m, i) => {
              const fromSide = !duo ? 0 : i === 0 ? -320 : 320;
              const delay = i * 250;
              return (
                <Animated.View
                  key={m}
                  style={{
                    transform: [
                      { translateX: tween(t, delay, delay + ENTER_MS, fromSide, 0) },
                      { translateY: duo ? 0 : tween(t, 0, ENTER_MS, 280, 0) },
                      { translateY: hops(t, promo.lines, i) },
                      // respira de leve o tempo todo
                      { translateY: t.interpolate({ inputRange: [ENTER_MS, 2600, 4600, 6600, 8600, PROMO_MS], outputRange: [0, -5, 0, -5, 0, -3] }) },
                      // inclina um pouco na direção de quem está falando
                      { rotate: duo && speaking !== undefined && speaking !== i ? (i === 0 ? '4deg' : '-4deg') : '0deg' },
                    ],
                  }}
                >
                  <TalkingMascot name={m} size={duo ? 128 : 156} talking={speaking === i} />
                </Animated.View>
              );
            })}
          </View>
        </View>

        <View style={[s.bottom, { opacity: showCta ? 1 : 0 }]} pointerEvents={showCta ? 'auto' : 'none'}>
          <Pressable onPress={cta} accessibilityRole="button" style={({ pressed }) => [s.cta, pressed && { transform: [{ translateY: 3 }] }]}>
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
  stage: { flex: 1, justifyContent: 'center', gap: space(4), paddingHorizontal: space(5) },
  talk: { minHeight: 150, justifyContent: 'flex-end' },
  bubbleWrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  bubble: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: space(4), paddingVertical: space(3), maxWidth: '86%' },
  bubbleText: { fontFamily: fonts.display, fontSize: type.lead + 1, lineHeight: (type.lead + 1) * 1.25, color: '#22242F' },
  tail: { width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 14, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#FFFFFF' },
  abs: { position: 'absolute', left: 0, right: 0 },
  finalBox: { alignItems: 'center', gap: space(2), bottom: 0 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: space(2), backgroundColor: '#2B2D42', paddingHorizontal: space(4), paddingVertical: space(1.5), borderRadius: 999 },
  badgeText: { fontFamily: fonts.display, fontSize: type.lead, color: '#FFC531' },
  benefit: { fontFamily: fonts.display, fontSize: type.hero, lineHeight: type.hero * 1.1, color: '#FFFFFF', textAlign: 'center' },
  propArea: { minHeight: 90, alignItems: 'center', justifyContent: 'center' },
  cast: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: space(2) },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  overlay: { position: 'absolute' },
  bigSymbol: { fontFamily: fonts.display, fontSize: 60, color: '#FFFFFF' },
  bigText: { fontFamily: fonts.display, fontSize: 40, color: '#FFFFFF' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: space(4), height: 110 },
  barCol: { alignItems: 'center', gap: space(1) },
  barTrack: { width: 28, height: 80, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: 28, height: 80, borderRadius: 8, transformOrigin: 'bottom' },
  barLabel: { fontFamily: fonts.display, fontSize: type.small, color: '#FFFFFF' },
  barTag: { fontFamily: fonts.display, fontSize: type.small, color: '#FFFFFF', backgroundColor: '#FF5C5C', paddingHorizontal: 6, borderRadius: 6, overflow: 'hidden' },
  flameWrap: { width: 90, height: 90, alignItems: 'center', justifyContent: 'center' },
  iceShield: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 5, borderColor: '#BDEBFF', backgroundColor: 'rgba(189,235,255,0.25)' },
  adCard: { backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: space(8), paddingVertical: space(4), alignItems: 'center', justifyContent: 'center' },
  adText: { fontFamily: fonts.display, fontSize: type.title, color: '#9AA0B5' },
  adX: { position: 'absolute', fontFamily: fonts.display, fontSize: 72, color: '#D93030' },
  bottom: { paddingHorizontal: space(5), paddingBottom: space(5) },
  cta: { backgroundColor: '#FFFFFF', borderRadius: 16, borderBottomWidth: 5, borderBottomColor: 'rgba(0,0,0,0.18)', paddingVertical: space(3.5), alignItems: 'center' },
  ctaText: { fontFamily: fonts.display, fontSize: type.lead },
});

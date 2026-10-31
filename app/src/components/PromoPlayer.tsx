// Vídeos do Plus exibidos após as lições: animação de recorte (cutout) com cenário, câmera,
// diálogo, efeitos e vozes. Roteiros em src/promos/roteiros.ts; motor em src/promos/timeline.ts.
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { Art } from '../illustrations/Art';
import { EXPRESSIONS, ExpressionName, MASCOTS, MASCOTS_TALK, MascotName } from '../illustrations/mascots';
import { SCENES, SceneName } from '../illustrations/scenes';
import { createPromoAudio, PromoAudio } from '../lib/promoAudio';
import { SCRIPTS } from '../promos/roteiros';
import { ActorState, buildTimeline, cues, FRAME_MS, FrameState, frameAt, Script, Timeline } from '../promos/timeline';
import { useApp } from '../state/AppState';
import { fonts } from '../theme';

export const SKIP_AFTER_MS = 5_000;
const SW = 360; // largura do cenário
const SH = 640; // altura do cenário
const FEET = 590; // onde os pés tocam o chão
const BOX_W = 176; // tamanho base do personagem no cenário
const BOX_H = 235;

export const PROMOS = SCRIPTS;

let lastPromo: string | null = null;

/** Sorteia um vídeo diferente do último exibido. */
export function pickPromo(random = Math.random): Script {
  const pool = SCRIPTS.filter((p) => p.id !== lastPromo);
  const p = pool[Math.floor(random() * pool.length)];
  lastPromo = p.id;
  return p;
}

const SCENE_BG: Record<SceneName, string> = { quarto: '#4E5296', biblioteca: '#E9C98F', sala: '#86BDAF' };
const END_BG: Record<string, string> = { vidas: '#2F6FE8', anuncio: '#7A4FD8', assinatura: '#D93030' };

// ---------- Peças do recorte ----------

const SceneBg = memo(function SceneBg({ name, k }: { name: SceneName; k: number }) {
  return <SvgXml xml={SCENES[name]} width={SW * k} height={SH * k} />;
});

/** Os dois quadros (boca fechada e aberta) ficam montados; só a opacidade muda. */
const MascotFrames = memo(function MascotFrames({ name, expr, open, w, h }: { name: MascotName; expr: ExpressionName | null; open: boolean; w: number; h: number }) {
  const [closedXml, openXml] = expr ? EXPRESSIONS[expr] : [MASCOTS[name], MASCOTS_TALK[name]];
  return (
    <View style={{ width: w, height: h }}>
      <SvgXml xml={closedXml} width={w} height={h} style={{ position: 'absolute', opacity: open ? 0 : 1 }} />
      <SvgXml xml={openXml} width={w} height={h} style={{ position: 'absolute', opacity: open ? 1 : 0 }} />
    </View>
  );
});

// Acessórios no mesmo sistema de coordenadas do mascote (120 x 160).
const OCULOS =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160"><path d="M38 44 H58 Q60 44 59 48 L57 56 Q56 60 52 60 H44 Q40 60 39 56 L37 48 Q36 44 38 44 Z M62 44 H82 Q84 44 83 48 L81 56 Q80 60 76 60 H68 Q64 60 63 56 L61 48 Q60 44 62 44 Z" fill="#14151C"/><path d="M58 47 H62" stroke="#14151C" stroke-width="3"/><path d="M42 47 L47 47 M66 47 L71 47" stroke="#FFFFFF" stroke-width="2" opacity="0.6" stroke-linecap="round"/></svg>';
const SUOR = (f: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160"><path d="M90 ${34 + (f % 3) * 4} q-5 8 0 11 q5 -3 0 -11 Z" fill="#8FD3FF"/><path d="M30 ${40 + ((f + 1) % 3) * 4} q-5 8 0 11 q5 -3 0 -11 Z" fill="#8FD3FF"/></svg>`;

function Actor({ a, st, k }: { a: ActorState; st: FrameState; k: number }) {
  const w = BOX_W * a.s * k;
  const h = BOX_H * a.s * k;
  const left = (a.x - (BOX_W * a.s) / 2 + a.shakeX) * k;
  const top = (FEET + a.y - BOX_H * a.s) * k;
  const oculosOn = a.name === 'simulaguia' && st.vars.oculos !== undefined;
  // Tirando os óculos: sobem e somem em 1 s (em degraus, como o resto).
  const tirando = oculosOn && st.vars.oculos === 0 ? Math.min(1, (st.t - (st.since.oculos ?? 0)) / 1000) : 0;
  return (
    <View style={{ position: 'absolute', left, top, width: w, height: h, transform: [{ rotate: `${a.rot}deg` }] }}>
      <MascotFrames name={a.name} expr={a.expr} open={a.mouthOpen} w={w} h={h} />
      {oculosOn && tirando < 1 && (
        <SvgXml xml={OCULOS} width={w} height={h} style={{ position: 'absolute', opacity: 1 - tirando, transform: [{ translateY: -tirando * 30 * k }] }} />
      )}
      {a.name === 'passarinho' && st.vars.suor === 1 && <SvgXml xml={SUOR(st.frame)} width={w} height={h} style={{ position: 'absolute' }} />}
      {a.name === 'aprovaca' && st.vars.placa === 1 && (
        <View style={[s.placa, { left: w * 0.02, top: h * 0.5, width: w * 0.96, paddingVertical: 8 * k, borderRadius: 6 * k, transform: [{ rotate: '-3deg' }] }]}>
          <Text style={[s.placaText, { fontSize: 26 * k * a.s }]}>ANÚNCIO</Text>
        </View>
      )}
    </View>
  );
}

// ---------- Objetos de cena de cada vídeo ----------

const QUESTOES = [
  { area: 'MATEMÁTICA', q: 'Se 2x + 3 = 11, quanto vale x?', alts: ['2', '3', '5', '4', '6'] },
  { area: 'QUÍMICA', q: 'Qual é a fórmula da água?', alts: ['H₂O', 'CO₂', 'O₂', 'NaCl', 'H₂O₂'] },
  { area: 'MATEMÁTICA', q: 'Quanto é √81?', alts: ['8', '9', '7', '81', '18'] },
  { area: 'LITERATURA', q: 'Quem escreveu Dom Casmurro?', alts: ['Machado de Assis', 'Gabamico', 'Clarice Lispector', 'Jorge Amado', 'Cecília Meireles'] },
];

function QuestionCard({ st, k }: { st: FrameState; k: number }) {
  const q = QUESTOES[st.vars.q ?? 0];
  const marca = st.vars.marca ?? 0;
  return (
    <View style={[s.card, { left: 24 * k, top: 96 * k, width: 312 * k, padding: 12 * k, borderRadius: 14 * k, transform: [{ rotate: '-1.5deg' }] }]}>
      <Text style={[s.cardArea, { fontSize: 11 * k }]}>{q.area}</Text>
      <Text style={[s.cardQ, { fontSize: 16 * k, marginBottom: 6 * k }]}>{q.q}</Text>
      {q.alts.map((alt, i) => {
        const bad = marca === i + 1;
        return (
          <View key={i} style={[s.alt, { paddingVertical: 4 * k, paddingHorizontal: 8 * k, marginTop: 4 * k, borderRadius: 8 * k }, bad && s.altBad]}>
            <Text style={[s.altText, { fontSize: 13 * k }, bad && { color: '#FFFFFF' }]}>
              {String.fromCharCode(65 + i)}) {alt}
              {bad ? '   ✕' : ''}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function PhaseDone({ st, k }: { st: FrameState; k: number }) {
  const t = st.t - (st.since.fase ?? 0);
  return (
    <View style={[s.card, { left: 70 * k, top: 120 * k, width: 220 * k, padding: 14 * k, borderRadius: 16 * k, alignItems: 'center', transform: [{ rotate: '2deg' }] }]}>
      <Text style={[s.cardQ, { fontSize: 18 * k }]}>Fase concluída!</Text>
      <View style={{ flexDirection: 'row', gap: 6 * k, marginTop: 6 * k }}>
        {[0, 1, 2].map((i) => (
          <Text key={i} style={{ fontSize: (t > 250 + i * 250 ? 34 : 0.1) * k, color: '#FFC531' }}>
            ★
          </Text>
        ))}
      </View>
    </View>
  );
}

function HeartsHud({ st, k }: { st: FrameState; k: number }) {
  const lost = st.vars.perdidos ?? 0;
  const inf = st.vars.infinito === 1;
  return (
    <View style={[s.hudWrap, { top: 14 * k }]}>
      <View style={[s.hud, { gap: 4 * k, paddingHorizontal: 10 * k, paddingVertical: 4 * k }]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Art key={i} name="vidas" size={22 * k} opacity={!inf && i >= 5 - lost ? 0.18 : 1} />
      ))}
      {inf && <Text style={[s.hudInf, { fontSize: 22 * k }]}>∞</Text>}
      </View>
    </View>
  );
}

/** Chuva de corações: posições fixas por índice, caindo em degraus. */
function HeartRain({ st, k }: { st: FrameState; k: number }) {
  const t = st.t - (st.since.chuva ?? 0);
  return (
    <>
      {Array.from({ length: 16 }, (_, i) => {
        const x = (i * 97) % 340;
        const y = -40 + ((t * (0.35 + (i % 4) * 0.08) + i * 53) % 700);
        return (
          <View key={i} style={{ position: 'absolute', left: x * k, top: y * k, transform: [{ rotate: `${(i % 5) * 12 - 24}deg` }] }}>
            <Art name="vidas" size={(22 + (i % 3) * 8) * k} />
          </View>
        );
      })}
    </>
  );
}

function Bubble({ st, k }: { st: FrameState; k: number }) {
  const line = st.line;
  const a = line && st.actors.find((x) => x.name === line.who);
  if (!line || !a) return null;
  // Topo da cabeça na tela, já com a câmera aplicada.
  const toScreenX = (dx: number) => (dx - st.cam.x) * st.cam.s + SW / 2;
  const toScreenY = (dy: number) => (dy - st.cam.y) * st.cam.s + SH / 2;
  const hx = Math.min(SW - 20, Math.max(20, toScreenX(a.x)));
  const headTop = toScreenY(FEET + a.y - BOX_H * a.s * 0.92);
  const width = 250;
  const left = Math.min(SW - width - 8, Math.max(8, hx - width / 2));
  const bottom = Math.max(150, Math.min(SH - 40, headTop - 4));
  const shout = line.text === line.text.toUpperCase() && /[A-Z]/.test(line.text);
  return (
    <View style={{ position: 'absolute', left: left * k, width: width * k, bottom: (SH - bottom) * k, alignItems: 'flex-start' }}>
      <View style={[s.bubble, { padding: 10 * k, borderRadius: 16 * k, borderWidth: 2.5 * k, alignSelf: hx < SW / 3 ? 'flex-start' : hx > (SW * 2) / 3 ? 'flex-end' : 'center' }]}>
        <Text style={[s.bubbleText, { fontSize: (shout ? 18 : 16) * k, lineHeight: (shout ? 22 : 20) * k }]}>{line.text}</Text>
      </View>
      <View style={[s.tail, { marginLeft: (hx - left - 9) * k, borderLeftWidth: 9 * k, borderRightWidth: 9 * k, borderTopWidth: 14 * k }]} />
    </View>
  );
}

function EndCard({ tl, st, k, onCta }: { tl: Timeline; st: FrameState; k: number; onCta: () => void }) {
  const t = st.t - tl.endAt;
  const { title, lines } = tl.script.end;
  return (
    <View style={[StyleSheet.absoluteFill, s.end, { backgroundColor: END_BG[tl.script.id] ?? '#2F6FE8', gap: 10 * k }]}>
      <View style={[s.badge, { gap: 8 * k, paddingHorizontal: 16 * k, paddingVertical: 8 * k, transform: [{ rotate: '-3deg' }, { scale: t < 160 ? 0.6 : 1 }] }]}>
        <Art name="assinatura" size={30 * k} />
        <Text style={[s.badgeText, { fontSize: 26 * k }]}>{title}</Text>
      </View>
      {lines.map((l, i) =>
        t > 300 + i * 330 ? (
          <Text key={l} style={[s.endLine, { fontSize: 30 * k, lineHeight: 36 * k, transform: [{ rotate: `${i % 2 ? 1.5 : -1.5}deg` }] }]}>
            {l}
          </Text>
        ) : null,
      )}
      <Pressable onPress={onCta} accessibilityRole="button" style={({ pressed }) => [s.cta, { marginTop: 20 * k, paddingVertical: 14 * k, paddingHorizontal: 28 * k, borderRadius: 16 * k }, pressed && { transform: [{ translateY: 3 }] }]}>
        <Text style={[s.ctaText, { fontSize: 18 * k, color: END_BG[tl.script.id] ?? '#2F6FE8' }]}>Conhecer o Plus</Text>
      </Pressable>
    </View>
  );
}

// ---------- Player ----------

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
  const script = useMemo(
    () => (forceId ? SCRIPTS.find((p) => p.id === forceId) ?? SCRIPTS[0] : visible ? pickPromo() : SCRIPTS[0]),
    [visible, forceId],
  );
  const tl = useMemo(() => buildTimeline(script), [script]);
  const [ms, setMs] = useState(0);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const audio = useRef<PromoAudio | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!visible) return;
    setMs(0);
    const sound = createPromoAudio(tl.lines.map((l) => l.id), settings.sound);
    audio.current = sound;
    const list = cues(tl);
    let next = 0;
    const started = Date.now();
    const tick = setInterval(() => {
      const now = Date.now() - started;
      setMs(now);
      while (next < list.length && list[next].at <= now) {
        const c = list[next++];
        if (c.sfx) sound.sfx(c.sfx);
        if (c.voice) sound.voice(c.voice);
      }
      if (now >= tl.total) {
        clearInterval(tick);
        closeRef.current();
      }
    }, FRAME_MS);
    return () => {
      clearInterval(tick);
      sound.release();
      audio.current = null;
    };
    // O som é preparado quando o vídeo abre; mudar a configuração no meio não o reinicia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, tl]);

  const st = frameAt(tl, ms);
  const k = box.w ? Math.min(box.w / SW, box.h / SH) : 0;
  const canSkip = ms >= SKIP_AFTER_MS;
  const left = Math.max(1, Math.ceil((SKIP_AFTER_MS - ms) / 1000));
  const close = () => {
    audio.current?.release();
    onClose();
  };
  const cta = () => {
    audio.current?.release();
    onCta();
  };
  const camT = [
    { translateX: (SW / 2 - st.cam.x) * st.cam.s * k },
    { translateY: (SH / 2 - st.cam.y) * st.cam.s * k },
    { scale: st.cam.s },
  ];

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={() => {
        if (canSkip) close();
      }}>
      <SafeAreaView style={[s.screen, { backgroundColor: st.ending ? END_BG[script.id] : SCENE_BG[script.scene] }]}>
        <View style={s.top}>
          <View style={s.track}>
            <View style={[s.trackFill, { width: `${Math.min(100, (ms / tl.total) * 100)}%` }]} />
          </View>
          <Pressable
            onPress={close}
            disabled={!canSkip}
            accessibilityRole="button"
            accessibilityLabel={canSkip ? 'Pular' : `Pular em ${left} segundos`}
            style={s.skip}
          >
            <Text style={s.skipText}>{canSkip ? 'Pular ✕' : `Pular em ${left}`}</Text>
          </Pressable>
        </View>
        <View style={s.fill} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
          {k > 0 && (
            <View style={[s.stage, { width: SW * k, height: SH * k }]}>
              <View style={[StyleSheet.absoluteFill, { transform: camT }]}>
                <SceneBg name={script.scene} k={k} />
                {script.id === 'vidas' && st.vars.card === 1 && <QuestionCard st={st} k={k} />}
                {script.id === 'anuncio' && st.vars.fase === 1 && <PhaseDone st={st} k={k} />}
                {st.actors.map((a) => (
                  <Actor key={a.name} a={a} st={st} k={k} />
                ))}
              </View>
              {script.id === 'vidas' && st.vars.chuva === 1 && <HeartRain st={st} k={k} />}
              {script.id === 'vidas' && !st.ending && <HeartsHud st={st} k={k} />}
              <Bubble st={st} k={k} />
              {st.ending && <EndCard tl={tl} st={st} k={k} onCta={cta} />}
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const INK = '#22242F';
const s = StyleSheet.create({
  screen: { flex: 1 },
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stage: { overflow: 'hidden' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.25)' },
  trackFill: { height: 6, backgroundColor: '#FFFFFF' },
  skip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, minWidth: 104, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)' },
  skipText: { fontFamily: fonts.display, fontSize: 14, color: '#FFFFFF' },
  bubble: { backgroundColor: '#FFFFFF', borderColor: INK, maxWidth: '100%' },
  bubbleText: { fontFamily: fonts.display, color: INK },
  tail: { width: 0, height: 0, marginTop: -2, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: INK },
  card: { position: 'absolute', backgroundColor: '#FFFDF6', borderWidth: 2, borderColor: INK },
  cardArea: { fontFamily: fonts.display, color: '#2F6FE8', letterSpacing: 1 },
  cardQ: { fontFamily: fonts.display, color: INK },
  alt: { backgroundColor: '#EEF0F6' },
  altBad: { backgroundColor: '#D93030' },
  altText: { fontFamily: fonts.display, color: INK },
  placa: { position: 'absolute', backgroundColor: '#FFFDF6', borderWidth: 3, borderColor: '#D93030', alignItems: 'center' },
  placaText: { fontFamily: fonts.display, color: '#D93030', letterSpacing: 1 },
  hudWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  hud: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.35)' },
  hudInf: { fontFamily: fonts.display, color: '#FFFFFF' },
  end: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: INK, borderRadius: 999 },
  badgeText: { fontFamily: fonts.display, color: '#FFC531' },
  endLine: { fontFamily: fonts.display, color: '#FFFFFF', textAlign: 'center' },
  cta: { backgroundColor: '#FFFFFF', borderBottomWidth: 5, borderBottomColor: 'rgba(0,0,0,0.2)' },
  ctaText: { fontFamily: fonts.display },
});

// Motor dos vídeos do Plus: transforma um roteiro (sequência de falas, pausas e ações) em uma
// linha do tempo e calcula o estado de cada quadro. Sem React, para poder ser testado.
import type { ExpressionName, MascotName } from '../illustrations/mascots';
import type { SceneName } from '../illustrations/scenes';
import type { Sfx } from '../lib/promoAudio';
import falas from './falas.json';
import { VOICE_MS } from './vozes';

/** Quadros por segundo: animação de recorte, propositalmente "travada". */
export const FPS = 12;
export const FRAME_MS = 1000 / FPS;
/** Tempo extra depois de cada fala antes da próxima. */
export const GAP_MS = 200;
/** Duração do cartão final com o botão "Conhecer o Plus". */
export const END_CARD_MS = 3500;

export type LineData = { id: string; quem: string; texto: string; direcao: string };
const LINES: Record<string, LineData> = Object.fromEntries(
  Object.values(falas.videos as Record<string, LineData[]>).flat().map((l) => [l.id, l]),
);
export const lineData = (id: string): LineData => {
  const l = LINES[id];
  if (!l) throw new Error(`fala desconhecida: ${id}`);
  return l;
};

/** Duração da fala: a da voz gravada, se existir; senão uma estimativa pelo tamanho do texto. */
export const lineMs = (id: string) => VOICE_MS[id] ?? Math.max(700, 380 + 58 * lineData(id).texto.length);

export type Action =
  | { t: 'place'; who: MascotName; x: number; y?: number; s?: number; z?: number } // posição instantânea
  | { t: 'move'; who: MascotName; x?: number; y?: number; s?: number; ms: number }
  | { t: 'shake'; who: MascotName; ms: number }
  | { t: 'hop'; who: MascotName; n?: number }
  | { t: 'face'; who: MascotName; expr: ExpressionName | null }
  | { t: 'cam'; s: number; x: number; y: number; ms?: number } // ms omitido = corte seco
  | { t: 'set'; key: string; value: number } // variáveis dos objetos de cena
  | { t: 'sfx'; name: Sfx; delay?: number };

export type Beat =
  | { say: string; with?: Action[]; extra?: number } // fala; ações no início dela
  | { wait: number; with?: Action[] } // pausa (dramática ou não)
  | { do: Action[] }; // ações instantâneas

export type Script = {
  id: string;
  scene: SceneName;
  beats: Beat[];
  end: { title: string; lines: string[] };
};

export type Line = { id: string; who: MascotName; text: string; from: number; to: number };
type Timed = { at: number; a: Action };

export type Timeline = {
  script: Script;
  lines: Line[];
  events: Timed[];
  endAt: number; // início do cartão final
  total: number;
};

export function buildTimeline(script: Script): Timeline {
  let at = 0;
  const lines: Line[] = [];
  const events: Timed[] = [];
  for (const b of script.beats) {
    if ('say' in b) {
      const d = lineData(b.say);
      const ms = lineMs(b.say);
      lines.push({ id: b.say, who: d.quem as MascotName, text: d.texto, from: at, to: at + ms });
      for (const a of b.with ?? []) events.push({ at, a });
      at += ms + GAP_MS + (b.extra ?? 0);
    } else if ('wait' in b) {
      for (const a of b.with ?? []) events.push({ at, a });
      at += b.wait;
    } else {
      for (const a of b.do) events.push({ at, a });
    }
  }
  return { script, lines, events, endAt: at, total: at + END_CARD_MS };
}

/** Sons em ordem: efeitos das ações, a voz de cada fala e a vinheta do cartão final. */
export function cues(tl: Timeline): { at: number; sfx?: Sfx; voice?: string }[] {
  const out: { at: number; sfx?: Sfx; voice?: string }[] = [];
  for (const e of tl.events) if (e.a.t === 'sfx') out.push({ at: e.at + (e.a.delay ?? 0), sfx: e.a.name });
  for (const l of tl.lines) out.push({ at: l.from, voice: l.id });
  out.push({ at: tl.endAt, sfx: 'vinheta' }, { at: tl.endAt + 500, sfx: 'ding' });
  return out.sort((a, b) => a.at - b.at);
}

type Tween = { from: number; to: number; start: number; ms: number };
const val = (tw: Tween, t: number) => (tw.ms <= 0 || t >= tw.start + tw.ms ? tw.to : tw.from + (tw.to - tw.from) * Math.max(0, (t - tw.start) / tw.ms));
const fixed = (v: number): Tween => ({ from: v, to: v, start: 0, ms: 0 });

export type ActorState = {
  name: MascotName;
  x: number; // centro, em unidades do cenário (0 a 360)
  y: number; // deslocamento vertical a partir do chão
  s: number;
  z: number;
  expr: ExpressionName | null;
  talking: boolean;
  mouthOpen: boolean;
  rot: number;
  shakeX: number;
};

export type FrameState = {
  t: number;
  frame: number;
  actors: ActorState[];
  cam: { s: number; x: number; y: number };
  vars: Record<string, number>;
  since: Record<string, number>; // quando cada variável mudou pela última vez
  line: Line | null;
  ending: boolean;
};

/** Estado de um instante do vídeo, já arredondado para o quadro (12 por segundo). */
export function frameAt(tl: Timeline, ms: number): FrameState {
  const frame = Math.floor(ms / FRAME_MS);
  const t = frame * FRAME_MS;
  const actors = new Map<MascotName, { x: Tween; y: Tween; s: Tween; z: number; expr: ExpressionName | null; shakeUntil: number; hopAt: number; hopN: number }>();
  let cam = { s: fixed(1), x: fixed(180), y: fixed(320) };
  const vars: Record<string, number> = {};
  const since: Record<string, number> = {};

  for (const { at, a } of tl.events) {
    if (at > t) break;
    if (a.t === 'place') {
      actors.set(a.who, { x: fixed(a.x), y: fixed(a.y ?? 0), s: fixed(a.s ?? 1), z: a.z ?? 0, expr: null, shakeUntil: 0, hopAt: -1, hopN: 0 });
      continue;
    }
    if (a.t === 'cam') {
      const tw = (cur: Tween, to: number): Tween => ({ from: val(cur, at), to, start: at, ms: a.ms ?? 0 });
      cam = { s: tw(cam.s, a.s), x: tw(cam.x, a.x), y: tw(cam.y, a.y) };
      continue;
    }
    if (a.t === 'set') {
      vars[a.key] = a.value;
      since[a.key] = at;
      continue;
    }
    if (a.t === 'sfx') continue;
    const st = actors.get(a.who);
    if (!st) continue;
    if (a.t === 'move') {
      if (a.x !== undefined) st.x = { from: val(st.x, at), to: a.x, start: at, ms: a.ms };
      if (a.y !== undefined) st.y = { from: val(st.y, at), to: a.y, start: at, ms: a.ms };
      if (a.s !== undefined) st.s = { from: val(st.s, at), to: a.s, start: at, ms: a.ms };
    } else if (a.t === 'shake') st.shakeUntil = at + a.ms;
    else if (a.t === 'hop') {
      st.hopAt = at;
      st.hopN = a.n ?? 1;
    } else if (a.t === 'face') st.expr = a.expr;
  }

  const ending = t >= tl.endAt;
  const line = ending ? null : tl.lines.find((l) => t >= l.from && t < l.to) ?? null;
  const out: ActorState[] = [];
  for (const [name, st] of actors) {
    const talking = !!line && line.who === name && t < line.to - 150;
    // Pulo: parábola de 4 quadros por pulo.
    const hopT = st.hopAt >= 0 ? (t - st.hopAt) / 330 : -1;
    const hop = hopT >= 0 && hopT < st.hopN ? -26 * Math.sin(Math.PI * (hopT % 1)) : 0;
    // Respiração em degraus, cada personagem no seu ritmo.
    const breathe = (Math.floor(frame / 6) + name.length) % 2 === 0 ? 0 : -2;
    const shaking = t < st.shakeUntil;
    out.push({
      name,
      x: val(st.x, t),
      y: val(st.y, t) + hop + (talking ? 0 : breathe),
      s: val(st.s, t),
      z: st.z,
      expr: st.expr,
      talking,
      mouthOpen: talking && frame % 2 === 0,
      // Ao falar, o corpo inteiro balança como recorte de papel.
      rot: talking ? (Math.floor(frame / 2) % 2 === 0 ? -2 : 2) : 0,
      shakeX: shaking ? (frame % 2 === 0 ? -5 : 5) : 0,
    });
  }
  out.sort((a, b) => a.z - b.z);
  return { t, frame, actors: out, cam: { s: val(cam.s, t), x: val(cam.x, t), y: val(cam.y, t) }, vars, since, line, ending };
}

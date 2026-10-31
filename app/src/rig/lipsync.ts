// Sincronia labial a partir do texto: cada letra vira uma boca da biblioteca, com o tempo
// da fala dividido pelo "peso" de cada som. Sem voz gravada, é o que move a boca; com voz,
// usa a duração real da fala.
import type { MouthName } from './library';

export const LIP_MIN_MS = 1000 / 12; // cada boca fica pelo menos 2 quadros a 24 fps

const strip = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function visemeOf(ch: string): { m: MouthName; w: number } | null {
  if ('a'.includes(ch)) return { m: 'A', w: 1.3 };
  if ('e'.includes(ch)) return { m: 'E', w: 1.2 };
  if ('i'.includes(ch)) return { m: 'I', w: 1.1 };
  if ('o'.includes(ch)) return { m: 'O', w: 1.3 };
  if ('u'.includes(ch)) return { m: 'U', w: 1.1 };
  if ('mbp'.includes(ch)) return { m: 'MBP', w: 0.8 };
  if ('fv'.includes(ch)) return { m: 'FV', w: 0.8 };
  if ('lntd'.includes(ch)) return { m: 'L', w: 0.7 };
  if ('szcxjgç'.includes(ch)) return { m: 'S', w: 0.8 };
  if ('rkqh'.includes(ch)) return { m: 'E', w: 0.6 };
  if (ch === ' ') return { m: 'MBP', w: 0.5 };
  if (',;:'.includes(ch)) return { m: 'MBP', w: 2.5 };
  if ('.!?…'.includes(ch)) return { m: 'MBP', w: 3 };
  return null;
}

export type LipTrack = { at: number; m: MouthName }[];

const PRIORITY: Partial<Record<MouthName, number>> = { A: 3, O: 3, E: 2.5, I: 2.5, U: 2.5, MBP: 2, FV: 1.5 };
const pri = (m: MouthName) => PRIORITY[m] ?? 1;

/**
 * Sequência de bocas para a fala, de 0 a `ms`. Sons mais curtos que 2 quadros se juntam ao
 * vizinho, e a boca que fica é a mais visível (vogais primeiro, depois M/B/P e F/V).
 */
export function lipTrack(text: string, ms: number): LipTrack {
  const units = [...strip(text)].map(visemeOf).filter((u): u is { m: MouthName; w: number } => !!u);
  const total = units.reduce((s, u) => s + u.w, 0) || 1;
  const segs = units.map((u) => ({ m: u.m, dur: (u.w / total) * ms }));
  const mergeSame = () => {
    for (let i = segs.length - 1; i > 0; i--) {
      if (segs[i].m === segs[i - 1].m) {
        segs[i - 1].dur += segs[i].dur;
        segs.splice(i, 1);
      }
    }
  };
  mergeSame();
  for (;;) {
    const i = segs.findIndex((x) => x.dur < LIP_MIN_MS);
    if (i < 0 || segs.length < 2) break;
    const j = i + 1 < segs.length ? i + 1 : i - 1;
    const [a, b] = [segs[Math.min(i, j)], segs[Math.max(i, j)]];
    const merged = { m: pri(b.m) > pri(a.m) ? b.m : a.m, dur: a.dur + b.dur };
    segs.splice(Math.min(i, j), 2, merged);
    mergeSame();
  }
  const track: LipTrack = [];
  let t = 0;
  for (const x of segs) {
    track.push({ at: t, m: x.m });
    t += x.dur;
  }
  return track;
}

/** Boca no instante `t` da fala (ms desde o início dela). */
export function mouthAt(track: LipTrack, t: number, shout = false): MouthName {
  let m: MouthName = 'MBP';
  for (const k of track) {
    if (k.at > t) break;
    m = k.m;
  }
  if (shout && (m === 'A' || m === 'O' || m === 'E')) return 'grito';
  return m;
}

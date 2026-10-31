// Montagem do boneco de recorte: junta as peças do personagem com as bibliotecas de olhos,
// bocas e mãos, numa pose. Cada membro é dividido em segmentos presos por "tachinhas"
// (ombro, cotovelo, quadril e joelho), que giram de forma independente.
import type { Character } from './characters';
import { EyeName, eyeSvg, HandName, handSvg, INK, MouthName, mouthSvg } from './library';

export type View = 'frente' | '3q' | 'perfil' | 'costas';
export const VIEWS: View[] = ['frente', '3q', 'perfil', 'costas'];

/** Ângulos em graus. Braço/perna: [ombro ou quadril, cotovelo ou joelho]; positivo abre para fora. */
export type Pose = {
  view: View;
  facing: 1 | -1; // 1 = virado para a direita da tela; -1 = espelhado
  eyes: EyeName;
  mouth: MouthName;
  armL: [number, number];
  armR: [number, number];
  legL: [number, number];
  legR: [number, number];
  handL: HandName;
  handR: HandName;
  armLFront?: boolean; // braço na frente do tronco (gestos sobre o peito)
  armRFront?: boolean;
  prop?: boolean; // mostrar o objeto do personagem
  /** Alvos das mãos (sistema 120 x 160): calculam ombro e cotovelo, com o cotovelo para fora. */
  handLTarget?: [number, number];
  handRTarget?: [number, number];
  /** Estica e achata a partir dos pés (1 = normal). Ex.: no ar 0.9/1.12; ao cair 1.15/0.85. */
  sx?: number;
  sy?: number;
  /** Variação do traço "fervendo" (0, 1 ou 2), trocada a cada 2 quadros. */
  boil?: number;
  /** Contorno de tinta e hachura (padrão: ligado). */
  ink?: boolean;
};

export const DEFAULT_POSE: Pose = {
  view: 'frente', facing: 1, eyes: 'neutro', mouth: 'repouso',
  armL: [8, 0], armR: [8, 0], legL: [0, 0], legR: [0, 0], handL: 'punho', handR: 'punho', prop: true,
};

const UPPER = 19; // comprimento do braço e do antebraço
const THIGH = 14; // coxa e canela
const SNEAKER = '#DDE1EC';
const SOLE = '#8E95AB';

const rad = (d: number) => (d * Math.PI) / 180;
/** Gira o vetor (0, len) — que aponta para baixo — pelo ângulo, no sentido do SVG. */
const down = (deg: number, len: number): [number, number] => [-Math.sin(rad(deg)) * len, Math.cos(rad(deg)) * len];

type ViewGeo = {
  shoulderL: [number, number]; shoulderR: [number, number];
  hipL: [number, number]; hipR: [number, number];
  torso: [number, number]; // x e largura
  faceDx: number; headDx: number;
  farScale: number; // escala do olho do lado de longe
  showPrint: boolean;
  farArmBehind: boolean;
};

const GEO: Record<View, ViewGeo> = {
  frente: { shoulderL: [32, 90], shoulderR: [88, 90], hipL: [51.5, 124], hipR: [68.5, 124], torso: [34, 52], faceDx: 0, headDx: 0, farScale: 1, showPrint: true, farArmBehind: false },
  '3q': { shoulderL: [37, 90], shoulderR: [88, 90], hipL: [54, 124], hipR: [69, 124], torso: [37, 48], faceDx: 7, headDx: 2, farScale: 0.82, showPrint: true, farArmBehind: true },
  perfil: { shoulderL: [62, 90], shoulderR: [58, 90], hipL: [62, 124], hipR: [56, 124], torso: [42, 36], faceDx: 15, headDx: 3, farScale: 0, showPrint: false, farArmBehind: true },
  costas: { shoulderL: [32, 90], shoulderR: [88, 90], hipL: [51.5, 124], hipR: [68.5, 124], torso: [34, 52], faceDx: 0, headDx: 0, farScale: 0, showPrint: false, farArmBehind: false },
};

function arm(c: Character, at: [number, number], ang: [number, number], side: -1 | 1, hand: HandName) {
  const sleeve = c.outfit.sleeve ?? c.outfit.top;
  // Lado esquerdo abre girando no sentido horário (ângulo positivo no SVG); o direito, ao contrário.
  const a = side === -1 ? ang[0] : -ang[0];
  const e = side === -1 ? ang[1] : -ang[1];
  const seg = `<rect x="-6.5" y="-3" width="13" height="${UPPER + 4}" rx="6.5" fill="${sleeve}"/>`;
  return `<g transform="translate(${at[0]} ${at[1]}) rotate(${a})">${seg}<g transform="translate(0 ${UPPER}) rotate(${e})">${seg}<g transform="translate(0 ${UPPER})">${handSvg(hand, c.skin)}</g></g></g>`;
}

/** Centro da mão no sistema do personagem (para prender objetos sem girá-los). */
export function handPoint(at: [number, number], ang: [number, number], side: -1 | 1): [number, number] {
  const a = side === -1 ? ang[0] : -ang[0];
  const e = side === -1 ? ang[1] : -ang[1];
  const p1 = down(a, UPPER);
  const p2 = down(a + e, UPPER);
  return [at[0] + p1[0] + p2[0], at[1] + p1[1] + p2[1]];
}

/**
 * Cinemática inversa de dois segmentos: ângulos [ombro, cotovelo] que levam a mão ao alvo,
 * com o cotovelo dobrando para fora do corpo. Fora de alcance, o braço estica na direção dele.
 */
export function ikArm(at: [number, number], target: [number, number], side: -1 | 1): [number, number] {
  const dx = target[0] - at[0];
  const dy = target[1] - at[1];
  const dist = Math.min(Math.max(Math.hypot(dx, dy), 1), UPPER * 2 - 0.01);
  const base = (Math.atan2(-dx, dy) * 180) / Math.PI; // ângulo SVG que aponta para o alvo
  const alpha = (Math.acos(dist / (2 * UPPER)) * 180) / Math.PI;
  // Das duas soluções, fica a do cotovelo mais para fora.
  const elbowX = (A: number) => at[0] + down(A, UPPER)[0];
  const A = side * (elbowX(base + alpha) - elbowX(base - alpha)) > 0 ? base + alpha : base - alpha;
  const ex = at[0] + down(A, UPPER)[0];
  const ey = at[1] + down(A, UPPER)[1];
  const B = (Math.atan2(-(at[0] + dx - ex), at[1] + dy - ey) * 180) / Math.PI;
  const r = (v: number) => Math.round(v * 10) / 10;
  return side === -1 ? [r(A), r(B - A)] : [r(-A), r(-(B - A))];
}

const INKLINE = '#2A2320';
/** Pequeno deslocamento estável por camada e variação: as linhas "fervem" como papel. */
function boil(layer: number, b: number | undefined, cx: number, cy: number) {
  if (b === undefined) return '';
  const h = Math.sin((layer + 1) * 12.9898 + (b + 1) * 78.233) * 43758.5453;
  const f = h - Math.floor(h);
  const g2 = (Math.sin((layer + 3) * 39.3468 + (b + 2) * 11.135) * 24634.6345) % 1;
  return ` transform="translate(${((f - 0.5) * 0.7).toFixed(2)} ${((Math.abs(g2) - 0.5) * 0.7).toFixed(2)}) rotate(${((f - 0.5) * 1.2).toFixed(2)} ${cx} ${cy})"`;
}
const inked = (on: boolean, w: number, body: string, t = '') =>
  on ? `<g stroke="${INKLINE}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"${t}>${body}</g>` : t ? `<g${t}>${body}</g>` : body;
const HATCH_DEF = `<defs><pattern id="hachura" width="4.5" height="4.5" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><line x1="0" y1="0" x2="0" y2="4.5" stroke="#000000" stroke-width="1.1" opacity="0.16"/></pattern></defs>`;

function leg(c: Character, at: [number, number], ang: [number, number], side: -1 | 1, view: View, hatch = true) {
  const a = side === -1 ? ang[0] : -ang[0];
  const k = side === -1 ? ang[1] : -ang[1];
  const pants = c.outfit.pants;
  // De perfil, o tênis aponta para a frente.
  const shoe = view === 'perfil'
    ? `<rect x="-7" y="-2" width="22" height="9" rx="4.5" fill="${SNEAKER}"/><rect x="-7" y="4" width="22" height="3" rx="1.5" fill="${SOLE}"/>`
    : `<rect x="-10" y="-2" width="20" height="9" rx="4.5" fill="${SNEAKER}"/><rect x="-10" y="4" width="20" height="3" rx="1.5" fill="${SOLE}"/>`;
  return `<g transform="translate(${at[0]} ${at[1]}) rotate(${a})"><rect x="-6.5" y="-4" width="13" height="${THIGH + 6}" rx="5" fill="${pants}"/>${hatch ? `<rect x="-6.5" y="-4" width="13" height="${THIGH + 6}" rx="5" fill="url(#hachura)" stroke="none"/>` : ''}<g transform="translate(0 ${THIGH}) rotate(${k})"><rect x="-6.5" y="-3" width="13" height="${THIGH + 4}" rx="5" fill="${pants}"/><g transform="translate(0 ${THIGH + 1}) rotate(${-a - k})">${shoe}</g></g></g>`;
}

function eye(c: Character, pose: Pose, which: 'l' | 'r', g: ViewGeo) {
  const [x, y] = c.eyes[which];
  const far = which === 'l'; // ao virar para a direita, o olho esquerdo fica do lado de longe
  const scale = far ? g.farScale : 1;
  if (scale === 0) return '';
  const dx = pose.view === 'perfil' ? g.faceDx - 4 : far ? g.faceDx - 2 : g.faceDx;
  const svg = eyeSvg(pose.eyes, { w: c.eyes.w, h: c.eyes.h, lid: c.lid, brow: c.brow, side: which === 'l' ? -1 : 1 });
  return `<g transform="translate(${x + dx} ${y}) scale(${scale} 1)">${svg}</g>`;
}

/**
 * Quadro do boneco: sobra espaço dos lados e em cima para braços abertos e erguidos.
 * As peças continuam no sistema 120 x 160; o quadro vai de -30 a 150 na horizontal.
 */
export const FRAME = { x: -30, y: 0, w: 180, h: 165 };
/** Close do rosto, para folhas de modelo de olhos e bocas. */
export const FACE_FRAME = { x: 22, y: 6, w: 80, h: 80 };

/** Monta o boneco inteiro como um SVG. */
export function composePuppet(c: Character, poseIn: Pose, frame = FRAME): string {
  const g = GEO[poseIn.view];
  const pose = { ...poseIn };
  if (pose.handLTarget) pose.armL = ikArm(g.shoulderL, pose.handLTarget, -1);
  if (pose.handRTarget) pose.armR = ikArm(g.shoulderR, pose.handRTarget, 1);
  const ink = pose.ink !== false;
  const b = pose.boil;
  const parts: string[] = [];
  if (c.behind && pose.view !== 'costas') parts.push(inked(ink, 2.2, c.behind, boil(0, b, 60, 98)));

  // Pernas (a de longe primeiro).
  parts.push(inked(ink, 2, leg(c, g.hipL, pose.legL, -1, pose.view, ink) + leg(c, g.hipR, pose.legR, 1, pose.view, ink), boil(1, b, 60, 140)));

  const armLsvg = inked(ink, 2, arm(c, g.shoulderL, pose.armL, -1, pose.handL), boil(2, b, g.shoulderL[0], g.shoulderL[1]));
  const armRsvg = inked(ink, 2, arm(c, g.shoulderR, pose.armR, 1, pose.handR), boil(3, b, g.shoulderR[0], g.shoulderR[1]));
  const behindL = !pose.armLFront || g.farArmBehind;
  if (behindL) parts.push(armLsvg);
  if (!pose.armRFront) parts.push(armRsvg);

  // Tronco, com hachura.
  const [tx, tw] = g.torso;
  let torso = `<rect x="${tx}" y="82" width="${tw}" height="50" rx="15" fill="${c.outfit.topDark}"/><rect x="${tx}" y="82" width="${tw}" height="46" rx="15" fill="${c.outfit.top}"/>`;
  if (ink) torso += `<rect x="${tx}" y="82" width="${tw}" height="50" rx="15" fill="url(#hachura)" stroke="none"/>`;
  if (c.print && g.showPrint) {
    const sx = tw / 52;
    torso += pose.view === 'frente' ? c.print : `<g transform="translate(${tx + 2} 0) scale(${sx} 1) translate(-34 0)">${c.print}</g>`;
  }
  parts.push(inked(ink, 2.2, torso, boil(4, b, 60, 106)));
  if (!behindL) parts.push(armLsvg);
  if (pose.armRFront) parts.push(armRsvg);

  // Cabeça: pescoço, formato, rosto que desliza, olhos, boca e o que fica por cima.
  let head = '';
  if (c.neck) head += c.neck;
  head += `<g transform="translate(${g.headDx} 0)">${c.head}</g>`;
  let face = '';
  if (pose.view !== 'costas') {
    if (c.face) face += `<g transform="translate(${g.faceDx} 0)">${c.face}</g>`;
    face += eye(c, pose, 'l', g) + eye(c, pose, 'r', g);
    const m = c.mouth;
    face += `<g transform="translate(${m.x + g.faceDx} ${m.y}) scale(${m.s ?? 1})">${mouthSvg(pose.mouth, m.color ?? INK)}</g>`;
    if (c.faceOver) face += `<g transform="translate(${g.faceDx} 0)">${c.faceOver}</g>`;
  }
  parts.push(`<g${boil(5, b, 60, 50)}>${inked(ink, 2.2, head)}${inked(ink, 1.3, face)}</g>`);

  // Objeto na mão, sempre em pé.
  if (pose.prop !== false && c.prop) {
    const side = c.prop.hand === 'L' ? -1 : 1;
    const [hx, hy] = handPoint(side === -1 ? g.shoulderL : g.shoulderR, side === -1 ? pose.armL : pose.armR, side);
    parts.push(inked(ink, 1.6, `<g transform="translate(${hx.toFixed(1)} ${hy.toFixed(1)})">${c.prop.svg}</g>`));
  }

  let body = parts.join('');
  // Estica e achata a partir dos pés.
  const sx = pose.sx ?? 1;
  const sy = pose.sy ?? 1;
  if (sx !== 1 || sy !== 1) body = `<g transform="translate(60 157) scale(${sx} ${sy}) translate(-60 -157)">${body}</g>`;
  const flipped = pose.facing === -1 ? `<g transform="translate(120 0) scale(-1 1)">${body}</g>` : body;
  // Sombra no chão (não estica junto, só encolhe quando o boneco sobe).
  const shadow = `<ellipse cx="60" cy="157.5" rx="${(30 * sx).toFixed(1)}" ry="3.6" fill="#000000" opacity="0.16"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${frame.x} ${frame.y} ${frame.w} ${frame.h}">${ink ? HATCH_DEF : ''}${shadow}${flipped}</svg>`;
}

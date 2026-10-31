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

function leg(c: Character, at: [number, number], ang: [number, number], side: -1 | 1, view: View) {
  const a = side === -1 ? ang[0] : -ang[0];
  const k = side === -1 ? ang[1] : -ang[1];
  const pants = c.outfit.pants;
  // De perfil, o tênis aponta para a frente.
  const shoe = view === 'perfil'
    ? `<rect x="-7" y="-2" width="22" height="9" rx="4.5" fill="${SNEAKER}"/><rect x="-7" y="4" width="22" height="3" rx="1.5" fill="${SOLE}"/>`
    : `<rect x="-10" y="-2" width="20" height="9" rx="4.5" fill="${SNEAKER}"/><rect x="-10" y="4" width="20" height="3" rx="1.5" fill="${SOLE}"/>`;
  return `<g transform="translate(${at[0]} ${at[1]}) rotate(${a})"><rect x="-6.5" y="-4" width="13" height="${THIGH + 6}" rx="5" fill="${pants}"/><g transform="translate(0 ${THIGH}) rotate(${k})"><rect x="-6.5" y="-3" width="13" height="${THIGH + 4}" rx="5" fill="${pants}"/><g transform="translate(0 ${THIGH + 1}) rotate(${-a - k})">${shoe}</g></g></g>`;
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
export function composePuppet(c: Character, pose: Pose, frame = FRAME): string {
  const g = GEO[pose.view];
  const parts: string[] = [];
  if (c.behind && pose.view !== 'costas') parts.push(c.behind);

  // Pernas (a de longe primeiro).
  parts.push(leg(c, g.hipL, pose.legL, -1, pose.view), leg(c, g.hipR, pose.legR, 1, pose.view));

  const armLsvg = arm(c, g.shoulderL, pose.armL, -1, pose.handL);
  const armRsvg = arm(c, g.shoulderR, pose.armR, 1, pose.handR);
  const behindL = !pose.armLFront || g.farArmBehind;
  if (behindL) parts.push(armLsvg);
  if (!pose.armRFront) parts.push(armRsvg);

  // Tronco.
  const [tx, tw] = g.torso;
  parts.push(`<rect x="${tx}" y="82" width="${tw}" height="50" rx="15" fill="${c.outfit.topDark}"/><rect x="${tx}" y="82" width="${tw}" height="46" rx="15" fill="${c.outfit.top}"/>`);
  if (c.print && g.showPrint) {
    const sx = tw / 52;
    parts.push(pose.view === 'frente' ? c.print : `<g transform="translate(${tx + 2} 0) scale(${sx} 1) translate(-34 0)">${c.print}</g>`);
  }
  if (!behindL) parts.push(armLsvg);
  if (pose.armRFront) parts.push(armRsvg);

  // Cabeça: pescoço, formato, rosto que desliza, olhos, boca e o que fica por cima.
  if (c.neck) parts.push(c.neck);
  parts.push(`<g transform="translate(${g.headDx} 0)">${c.head}</g>`);
  if (pose.view !== 'costas') {
    if (c.face) parts.push(`<g transform="translate(${g.faceDx} 0)">${c.face}</g>`);
    parts.push(eye(c, pose, 'l', g), eye(c, pose, 'r', g));
    const m = c.mouth;
    parts.push(`<g transform="translate(${m.x + g.faceDx} ${m.y}) scale(${m.s ?? 1})">${mouthSvg(pose.mouth, m.color ?? INK)}</g>`);
    if (c.faceOver) parts.push(`<g transform="translate(${g.faceDx} 0)">${c.faceOver}</g>`);
  }

  // Objeto na mão, sempre em pé.
  if (pose.prop !== false && c.prop) {
    const side = c.prop.hand === 'L' ? -1 : 1;
    const [hx, hy] = handPoint(side === -1 ? g.shoulderL : g.shoulderR, side === -1 ? pose.armL : pose.armR, side);
    parts.push(`<g transform="translate(${hx.toFixed(1)} ${hy.toFixed(1)})">${c.prop.svg}</g>`);
  }

  const body = parts.join('');
  const flipped = pose.facing === -1 ? `<g transform="translate(120 0) scale(-1 1)">${body}</g>` : body;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${frame.x} ${frame.y} ${frame.w} ${frame.h}">${flipped}</svg>`;
}

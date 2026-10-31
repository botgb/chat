// Bibliotecas compartilhadas do recorte (cutout): olhos, bocas e mãos.
// Cada peça é um fragmento SVG centrado em (0, 0), no sistema do personagem (120 x 160),
// e é trocada inteira de um quadro para o outro, como nos bonecos de papel.
export const INK = '#22242F';
const W = '#FFFFFF';
const TONGUE = '#E86A7A';

export type EyeName =
  | 'neutro' | 'aberto' | 'arregalado' | 'fechado' | 'semicerrado' | 'feliz' | 'triste'
  | 'raiva' | 'surpreso' | 'olhaEsquerda' | 'olhaDireita' | 'sono' | 'choro';
export const EYE_NAMES: EyeName[] = [
  'neutro', 'aberto', 'arregalado', 'fechado', 'semicerrado', 'feliz', 'triste',
  'raiva', 'surpreso', 'olhaEsquerda', 'olhaDireita', 'sono', 'choro',
];

export type MouthName =
  | 'repouso' | 'sorriso' | 'sorrisao' | 'A' | 'E' | 'I' | 'O' | 'U' | 'MBP' | 'FV' | 'L' | 'S'
  | 'grito' | 'nojo' | 'lingua' | 'triste' | 'ohh';
export const MOUTH_NAMES: MouthName[] = [
  'repouso', 'sorriso', 'sorrisao', 'A', 'E', 'I', 'O', 'U', 'MBP', 'FV', 'L', 'S',
  'grito', 'nojo', 'lingua', 'triste', 'ohh',
];

export type HandName = 'aberta' | 'punho' | 'aponta' | 'joinha' | 'segura' | 'tchau' | 'paz';
export const HAND_NAMES: HandName[] = ['aberta', 'punho', 'aponta', 'joinha', 'segura', 'tchau', 'paz'];

const f = (n: number) => +n.toFixed(2);

/**
 * Olho. `side` diz de que lado do rosto ele está (-1 esquerdo, 1 direito), para as
 * pálpebras e sobrancelhas inclinarem para o lado certo.
 */
export function eyeSvg(name: EyeName, o: { w: number; h: number; lid: string; brow?: string | null; side: -1 | 1 }): string {
  const { w, h, lid, side } = o;
  const brow = o.brow ?? INK;
  const white = (rw = w, rh = h) => `<ellipse cx="0" cy="0" rx="${f(rw)}" ry="${f(rh)}" fill="${W}"/>`;
  const pupil = (dx = 0.6, r = h * 0.72) => `<circle cx="${f(dx)}" cy="${f(0.8)}" r="${f(r)}" fill="${INK}"/>`;
  // Pálpebra de cima até a altura `y` (fração de h); `slant` > 0 abaixa o canto de fora.
  const lidTo = (y: number, slant = 0) => {
    const yo = (y + slant) * h; // canto de fora
    const yi = (y - slant) * h; // canto de dentro
    const xo = side * (w + 1);
    const xi = -side * (w + 1);
    return `<path d="M${f(xi)} ${f(-h - 1.5)} H${f(xo)} V${f(yo)} Q0 ${f(Math.min(yo, yi) - 0.3 * h)} ${f(xi)} ${f(yi)} Z" fill="${lid}"/>`;
  };
  const browLine = (dy: number, tilt: number) =>
    `<path d="M${f(-w)} ${f(-h - 3 + dy - side * tilt)} L${f(w)} ${f(-h - 3 + dy + side * tilt)}" stroke="${brow}" stroke-width="2.6" stroke-linecap="round"/>`;
  const neutralBrow = o.brow ? browLine(0, 0.6) : '';
  switch (name) {
    case 'neutro':
      return white() + pupil() + lidTo(-0.15) + neutralBrow;
    case 'aberto':
      return white() + pupil() + neutralBrow;
    case 'arregalado':
      return white(w * 1.2, h * 1.45) + `<circle cx="0" cy="0.5" r="${f(h * 0.38)}" fill="${INK}"/>` + browLine(-4, 0);
    case 'fechado':
      return `<path d="M${f(-w)} 0 Q0 ${f(h * 0.7)} ${f(w)} 0" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
    case 'semicerrado':
      return white() + pupil(0.6, h * 0.6) + lidTo(0.3) + `<path d="M${f(-w)} ${f(h * 0.75)} H${f(w)}" stroke="${lid}" stroke-width="2"/>` + browLine(2, 0);
    case 'feliz':
      return `<path d="M${f(-w)} ${f(h * 0.35)} Q0 ${f(-h)} ${f(w)} ${f(h * 0.35)}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
    case 'triste':
      return white() + pupil(0.4, h * 0.65) + lidTo(-0.15, 0.35) + browLine(-1, -1.8);
    case 'raiva':
      return white() + pupil(0.4, h * 0.65) + lidTo(-0.1, -0.4) + browLine(1, 2.4);
    case 'surpreso':
      return white(w * 1.1, h * 1.25) + pupil(0, h * 0.55) + browLine(-5, -0.6);
    case 'olhaEsquerda':
      return white() + pupil(-w * 0.45) + lidTo(-0.15) + neutralBrow;
    case 'olhaDireita':
      return white() + pupil(w * 0.45) + lidTo(-0.15) + neutralBrow;
    case 'sono':
      return white() + pupil(0.6, h * 0.6) + lidTo(0.5) + `<path d="M${f(-w)} ${f(h * 0.55)} Q0 ${f(h * 0.85)} ${f(w)} ${f(h * 0.55)}" fill="none" stroke="${INK}" stroke-width="1.6"/>`;
    case 'choro':
      return white() + pupil(0.4, h * 0.65) + lidTo(-0.15, 0.35) + browLine(-1, -1.8) +
        `<path d="M${f(side * w * 0.6)} ${f(h + 1)} q-2.4 4.5 0 6.5 q2.4 -2 0 -6.5 Z" fill="#8FD3FF"/>`;
  }
}

/** Boca para sincronia labial e expressões. `s` é a escala (1 = 14 de largura). */
export function mouthSvg(name: MouthName, color = INK): string {
  const line = (d: string) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  switch (name) {
    case 'repouso': return line('M-6 0 Q1 3.5 6 -2.5');
    case 'sorriso': return line('M-7 -1.5 Q0 6 7 -1.5');
    case 'sorrisao': return `<path d="M-8 -2 Q0 10 8 -2 Q0 1 -8 -2 Z" fill="${W}" stroke="${color}" stroke-width="2" stroke-linejoin="round"/><path d="M-3 0 V4 M2 0 V4.5" stroke="${color}" stroke-width="1.2"/>`;
    case 'A': return `<ellipse cx="0" cy="1" rx="5" ry="6" fill="${color}"/><ellipse cx="0" cy="4.5" rx="3.2" ry="1.8" fill="${TONGUE}"/>`;
    case 'E': return `<ellipse cx="0" cy="0.5" rx="7" ry="4" fill="${color}"/><path d="M-5.5 -2 H5.5 V-0.6 H-5.5 Z" fill="${W}"/>`;
    case 'I': return `<ellipse cx="0" cy="0" rx="7" ry="2.6" fill="${color}"/><path d="M-5.5 -1.2 H5.5 M-5.5 1.2 H5.5" stroke="${W}" stroke-width="1.4"/>`;
    case 'O': return `<circle cx="0" cy="0.5" r="5" fill="${color}"/>`;
    case 'U': return `<ellipse cx="0" cy="0.5" rx="3.4" ry="3.6" fill="${color}"/><ellipse cx="0" cy="0.5" rx="4.8" ry="5" fill="none" stroke="${color}" stroke-width="1.4" opacity="0.5"/>`;
    case 'MBP': return line('M-6 0 Q0 1.5 6 0');
    case 'FV': return `<ellipse cx="0" cy="1" rx="6" ry="3" fill="${color}"/><path d="M-4 -1.6 H4 V0.6 H-4 Z" fill="${W}"/>`;
    case 'L': return `<ellipse cx="0" cy="0.5" rx="6" ry="4.6" fill="${color}"/><path d="M-3 -2.6 Q0 -0.5 3 -2.6 Q0 2 -3 -2.6 Z" fill="${TONGUE}"/>`;
    case 'S': return `<rect x="-7" y="-2.6" width="14" height="5.2" rx="2.6" fill="${W}" stroke="${color}" stroke-width="1.8"/><path d="M-6 0 H6" stroke="${color}" stroke-width="1"/>`;
    case 'grito': return `<ellipse cx="0" cy="2" rx="9" ry="10" fill="${color}"/><path d="M-6 -5 H6 V-3 H-6 Z" fill="${W}"/><ellipse cx="0" cy="8" rx="5" ry="3" fill="${TONGUE}"/>`;
    case 'nojo': return line('M-7 1 Q-3.5 -3 0 1 T7 -1');
    case 'lingua': return line('M-7 -1.5 Q0 5 7 -1.5') + `<path d="M-2 2.4 Q0 9 3 2 Z" fill="${TONGUE}"/>`;
    case 'triste': return line('M-6 3 Q0 -3 6 3');
    case 'ohh': return `<circle cx="0" cy="0.5" r="2.8" fill="${color}"/>`;
  }
}

/** Mão em luva redonda. Local: pulso em cima, dedos para baixo (segue o antebraço). */
export function handSvg(name: HandName, skin: string): string {
  const palm = `<circle cx="0" cy="0" r="6.5" fill="${skin}"/>`;
  const shade = 'opacity="0.18"';
  const knuckles = `<path d="M-3.5 3 H3.5" stroke="${INK}" stroke-width="1.2" ${shade}/>`;
  switch (name) {
    case 'punho': return palm + knuckles;
    case 'aberta': return palm + [-4.5, -1.5, 1.5, 4.5].map((x) => `<ellipse cx="${x}" cy="6" rx="1.7" ry="3.2" fill="${skin}"/>`).join('') + `<ellipse cx="-6.5" cy="0" rx="3.2" ry="1.7" fill="${skin}"/>`;
    case 'aponta': return palm + `<rect x="-1.8" y="3" width="3.6" height="10" rx="1.8" fill="${skin}"/>` + knuckles;
    case 'joinha': return palm + `<rect x="-9.5" y="-1.8" width="6" height="3.6" rx="1.8" fill="${skin}" transform="rotate(-70 -6.5 0)"/>` + knuckles;
    case 'segura': return `<path d="M-6.5 0 A6.5 6.5 0 1 1 6.5 0 L3 0 A3 3 0 1 0 -3 0 Z" fill="${skin}"/>`;
    case 'tchau': return palm + [-5.5, -2, 2, 5.5].map((x, i) => `<ellipse cx="${x}" cy="6" rx="1.7" ry="3.4" fill="${skin}" transform="rotate(${(i - 1.5) * 14} ${x} 3)"/>`).join('') + `<ellipse cx="-7" cy="-1" rx="3.2" ry="1.7" fill="${skin}"/>`;
    case 'paz': return palm + `<rect x="-3.4" y="3" width="3" height="9" rx="1.5" fill="${skin}" transform="rotate(12 -2 3)"/><rect x="0.4" y="3" width="3" height="9" rx="1.5" fill="${skin}" transform="rotate(-12 2 3)"/>` + knuckles;
  }
}

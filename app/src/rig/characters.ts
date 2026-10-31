// Peças de cada personagem por matéria (prévia aprovada em scripts/materias/previa.html).
// Coordenadas no sistema 120 x 160. A cabeça é dividida em camadas para que o rosto deslize
// quando o personagem vira (3/4 e perfil), como nos bonecos de recorte:
//   head     — formato da cabeça, orelhas, cabelo e chapéu (não desliza)
//   face     — focinho, nariz, bigodes (desliza com a virada)
//   faceOver — o que fica por cima dos olhos, como óculos (desliza junto)
// Olhos e boca vêm das bibliotecas, encaixados nos pontos `eyes` e `mouth`.
import { INK } from './library';

const W = '#FFFFFF';

export type Character = {
  id: string;
  name: string;
  subject: string;
  skin: string; // mãos e pele
  lid: string; // cor da pálpebra
  brow: string | null; // cor da sobrancelha (null = sem sobrancelha no olho neutro)
  outfit: { top: string; topDark: string; pants: string; sleeve?: string };
  behind?: string; // atrás de tudo (casco da lesma)
  print?: string; // estampa e detalhes da roupa, na frente do tronco
  neck?: string; // entre o tronco e a cabeça (pescoço da girafa)
  head: string;
  face?: string;
  faceOver?: string;
  eyes: { l: [number, number]; r: [number, number]; w: number; h: number };
  mouth: { x: number; y: number; s?: number; color?: string };
  prop?: { hand: 'L' | 'R'; svg: string }; // objeto na mão, com (0, 0) no centro da mão
};

const whiskers = (y: number, color: string, x0 = 46, x1 = 74) =>
  `<path d="M${x0} ${y} L${x0 - 12} ${y - 3} M${x0} ${y + 4} L${x0 - 12} ${y + 5} M${x1} ${y} L${x1 + 12} ${y - 3} M${x1} ${y + 4} L${x1 + 12} ${y + 5}" stroke="${color}" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>`;

const PEN = (body: string, cap: string) =>
  `<g transform="rotate(-35)"><rect x="-3" y="-24" width="6" height="28" rx="2" fill="${body}"/><rect x="-3" y="-24" width="6" height="7" rx="2" fill="${cap}"/><polygon points="-3,4 3,4 0,11" fill="${INK}"/></g>`;

export const CHARACTERS: Character[] = [
  {
    id: 'gatematica', name: 'Gatemática', subject: 'Matemática',
    skin: '#8E95A8', lid: '#8E95A8', brow: INK,
    outfit: { top: '#7A4FD8', topDark: '#5C35B3', pants: '#2B2D42' },
    print: `<path d="M49 99 H71 M55 99 V115 M65 99 Q64 111 69 115" fill="none" stroke="${W}" stroke-width="4" stroke-linecap="round"/>`,
    head: `<path d="M36 42 L40 14 L58 32 Z M84 42 L80 14 L62 32 Z" fill="#8E95A8"/><path d="M41 36 L43 22 L52 31 Z M79 36 L77 22 L68 31 Z" fill="#F2A0B5"/>
<ellipse cx="60" cy="54" rx="26" ry="23" fill="#8E95A8"/><path d="M54 32 L56 40 M60 31 V40 M66 32 L64 40" stroke="#6E758A" stroke-width="2.6" stroke-linecap="round"/>`,
    face: `<ellipse cx="60" cy="67" rx="13" ry="9" fill="#E3E6EE"/><path d="M56 61 H64 L60 65 Z" fill="#F2A0B5" stroke="#F2A0B5" stroke-width="1.5" stroke-linejoin="round"/>${whiskers(66, '#6E758A', 47, 73)}`,
    eyes: { l: [50, 53], r: [70, 53], w: 5.2, h: 4.6 },
    mouth: { x: 61, y: 70, s: 0.8 },
  },
  {
    id: 'fisicobra', name: 'Fisicobra', subject: 'Física',
    skin: '#4CAF6A', lid: '#4CAF6A', brow: null,
    outfit: { top: '#2B3A67', topDark: '#1E2A4D', pants: '#4A4F63' },
    print: `<path d="M42 106 Q47 97 52 106 T62 106 T72 106 T80 104" fill="none" stroke="#F2B518" stroke-width="3.4" stroke-linecap="round"/>`,
    head: `<ellipse cx="60" cy="52" rx="25" ry="23" fill="#4CAF6A"/><path d="M52 33 L56 37 L52 41 L48 37 Z M68 33 L72 37 L68 41 L64 37 Z M60 29 L63 32 L60 35 L57 32 Z" fill="#2E8A4C"/>`,
    face: `<ellipse cx="60" cy="66" rx="15" ry="9" fill="#CDEB9A"/><circle cx="56" cy="62" r="1.3" fill="#2E8A4C"/><circle cx="64" cy="62" r="1.3" fill="#2E8A4C"/>`,
    faceOver: `<circle cx="50" cy="52" r="8.5" fill="none" stroke="${INK}" stroke-width="2.2"/><circle cx="70" cy="52" r="8.5" fill="none" stroke="${INK}" stroke-width="2.2"/><path d="M58.5 52 H61.5" stroke="${INK}" stroke-width="2.2"/>`,
    eyes: { l: [50, 52], r: [70, 52], w: 5.2, h: 4.6 },
    mouth: { x: 60, y: 71 },
  },
  {
    id: 'quimicoala', name: 'Quimicoala', subject: 'Química',
    skin: '#9AA0AE', lid: '#9AA0AE', brow: INK,
    outfit: { top: '#F4F5F9', topDark: '#D5D9E4', pants: '#2B2D42', sleeve: '#F4F5F9' },
    print: `<path d="M52 82 L60 100 L68 82 Z" fill="#3DAA5C"/><path d="M52 82 L48 128 M68 82 L72 128" stroke="#C3C8D6" stroke-width="2"/><rect x="40" y="104" width="10" height="3" rx="1.5" fill="#2F6FE8"/>`,
    head: `<circle cx="33" cy="40" r="14" fill="#9AA0AE"/><circle cx="33" cy="40" r="8" fill="#E8EAF0"/><circle cx="87" cy="40" r="14" fill="#9AA0AE"/><circle cx="87" cy="40" r="8" fill="#E8EAF0"/>
<ellipse cx="60" cy="56" rx="25" ry="23" fill="#9AA0AE"/><path d="M48 36 L50 26 L55 33 L59 23 L63 33 L69 25 L70 35" fill="#9AA0AE"/>
<rect x="36" y="34" width="48" height="5" fill="#5A4A3A"/><circle cx="50" cy="37" r="7" fill="#9FD3F0" stroke="#5A4A3A" stroke-width="2.5"/><circle cx="70" cy="37" r="7" fill="#9FD3F0" stroke="#5A4A3A" stroke-width="2.5"/>`,
    face: `<ellipse cx="60" cy="64" rx="7" ry="9" fill="#3A3D4A"/>`,
    eyes: { l: [49, 54], r: [71, 54], w: 5.6, h: 5.2 },
    mouth: { x: 60, y: 77 },
    prop: { hand: 'R', svg: `<g transform="translate(4 -14) rotate(12)"><path d="M-4 -14 H4 V-6 L11 10 Q12 14 8 14 H-8 Q-12 14 -11 10 L-4 -6 Z" fill="${W}" opacity="0.9"/><path d="M-9 4 H9 L11 10 Q12 14 8 14 H-8 Q-12 14 -11 10 Z" fill="#7CE36B"/><circle cx="-1" cy="-18" r="2.5" fill="#7CE36B"/><circle cx="4" cy="-23" r="1.8" fill="#7CE36B"/></g>` },
  },
  {
    id: 'biolobo', name: 'Biolobo', subject: 'Biologia',
    skin: '#7D8BA6', lid: '#7D8BA6', brow: '#5E6B85',
    outfit: { top: '#3DAA5C', topDark: '#2A8A45', pants: '#6B5A3E' },
    print: `<path d="M34 86 Q36 84 46 84 L48 128 H40 Q34 126 34 118 Z M86 86 Q84 84 74 84 L72 128 H80 Q86 126 86 118 Z" fill="#C9A66B"/><rect x="38" y="100" width="7" height="6" rx="1.5" fill="#A88350"/><rect x="75" y="100" width="7" height="6" rx="1.5" fill="#A88350"/>`,
    head: `<path d="M36 40 L38 10 L56 28 Z M84 40 L82 10 L64 28 Z" fill="#7D8BA6"/><path d="M41 34 L42 20 L51 29 Z M79 34 L78 20 L69 29 Z" fill="#5E6B85"/>
<ellipse cx="60" cy="52" rx="25" ry="22" fill="#7D8BA6"/><path d="M35 56 L30 66 L42 64 Z M85 56 L90 66 L78 64 Z" fill="#7D8BA6"/>`,
    face: `<ellipse cx="60" cy="66" rx="14" ry="11" fill="#E4E8F0"/><ellipse cx="60" cy="61" rx="5.5" ry="3.8" fill="${INK}"/>`,
    eyes: { l: [50, 50], r: [70, 50], w: 5.2, h: 4.6 },
    mouth: { x: 61, y: 71, s: 0.85 },
    prop: { hand: 'R', svg: `<circle cx="6" cy="-13" r="7" fill="#BDEBFF" fill-opacity="0.6" stroke="${INK}" stroke-width="2.5"/><path d="M2 -7 L-1 0" stroke="#8B5A3C" stroke-width="4" stroke-linecap="round"/>` },
  },
  {
    id: 'histopotamo', name: 'Histopótamo', subject: 'História',
    skin: '#9B8FB8', lid: '#9B8FB8', brow: null,
    outfit: { top: '#8B5A3C', topDark: '#6E4229', pants: '#4A4F63' },
    print: `<path d="M50 82 L60 98 L70 82 Z" fill="${W}"/><path d="M54 86 L60 89 L66 86 L66 92 L60 89 L54 92 Z" fill="#D93030"/>`,
    head: `<ellipse cx="40" cy="31" rx="6" ry="5" fill="#7C6F9C"/><ellipse cx="80" cy="31" rx="6" ry="5" fill="#7C6F9C"/><ellipse cx="60" cy="48" rx="25" ry="20" fill="#9B8FB8"/>`,
    face: `<ellipse cx="60" cy="68" rx="29" ry="15" fill="#B9AED3"/><ellipse cx="51" cy="64" rx="3" ry="2.2" fill="#7C6F9C"/><ellipse cx="69" cy="64" rx="3" ry="2.2" fill="#7C6F9C"/>`,
    faceOver: `<circle cx="50" cy="45" r="7" fill="none" stroke="#C9A24A" stroke-width="1.8"/><circle cx="70" cy="45" r="7" fill="none" stroke="#C9A24A" stroke-width="1.8"/><path d="M57 45 H63" stroke="#C9A24A" stroke-width="1.8"/>`,
    eyes: { l: [50, 45], r: [70, 45], w: 4.6, h: 4 },
    mouth: { x: 60, y: 75, color: '#5C4F7C' },
    prop: { hand: 'L', svg: `<g transform="translate(-4 -12) rotate(8)"><rect x="-8" y="0" width="16" height="22" rx="3" fill="#2F6FE8"/><rect x="-5" y="3" width="10" height="2.5" fill="#F2B518"/></g>` },
  },
  {
    id: 'georafa', name: 'Georafa', subject: 'Geografia',
    skin: '#F2C14E', lid: '#F2C14E', brow: '#8B5A3C',
    outfit: { top: '#14A090', topDark: '#0E7A6E', pants: '#6B5A3E' },
    print: `<rect x="42" y="86" width="5" height="40" rx="2" fill="#8B5A3C"/><rect x="73" y="86" width="5" height="40" rx="2" fill="#8B5A3C"/>`,
    neck: `<rect x="52" y="52" width="16" height="38" rx="6" fill="#F2C14E"/><circle cx="57" cy="66" r="3" fill="#B9772E"/><circle cx="64" cy="76" r="3.4" fill="#B9772E"/><circle cx="56" cy="84" r="2.6" fill="#B9772E"/>`,
    head: `<path d="M50 26 L47 12 M70 26 L73 12" stroke="#F2C14E" stroke-width="4" stroke-linecap="round"/><circle cx="47" cy="11" r="3.6" fill="#B9772E"/><circle cx="73" cy="11" r="3.6" fill="#B9772E"/>
<ellipse cx="37" cy="32" rx="9" ry="4.5" fill="#F2C14E" transform="rotate(-20 37 32)"/><ellipse cx="83" cy="32" rx="9" ry="4.5" fill="#F2C14E" transform="rotate(20 83 32)"/>
<ellipse cx="60" cy="38" rx="21" ry="18" fill="#F2C14E"/><circle cx="47" cy="30" r="3" fill="#B9772E"/><circle cx="72" cy="28" r="2.6" fill="#B9772E"/>`,
    face: `<ellipse cx="60" cy="51" rx="15" ry="9" fill="#F7DFA0"/><circle cx="56" cy="49" r="1.5" fill="#B9772E"/><circle cx="64" cy="49" r="1.5" fill="#B9772E"/>`,
    eyes: { l: [52, 36], r: [68, 36], w: 4.8, h: 4.4 },
    mouth: { x: 60, y: 55, s: 0.75 },
  },
  {
    id: 'filosofoca', name: 'Filosofoca', subject: 'Filosofia',
    skin: '#8D98A8', lid: '#8D98A8', brow: '#6F7A8C',
    outfit: { top: '#22242F', topDark: '#14151C', pants: '#5A4A3A' },
    print: `<rect x="46" y="78" width="28" height="12" rx="6" fill="#14151C"/>`,
    head: `<ellipse cx="60" cy="52" rx="25" ry="25" fill="#8D98A8"/>`,
    face: `<circle cx="54" cy="64" r="7.5" fill="#C8D0DC"/><circle cx="66" cy="64" r="7.5" fill="#C8D0DC"/><circle cx="51" cy="63" r="0.9" fill="#6F7A8C"/><circle cx="54" cy="66" r="0.9" fill="#6F7A8C"/><circle cx="66" cy="66" r="0.9" fill="#6F7A8C"/><circle cx="69" cy="63" r="0.9" fill="#6F7A8C"/><ellipse cx="60" cy="58" rx="4.6" ry="3.4" fill="${INK}"/>${whiskers(64, '#6F7A8C', 47, 73)}`,
    eyes: { l: [49, 48], r: [71, 48], w: 6, h: 5.6 },
    mouth: { x: 60, y: 74, s: 0.7 },
  },
  {
    id: 'sociolontra', name: 'Sociolontra', subject: 'Sociologia',
    skin: '#9C6B43', lid: '#9C6B43', brow: '#7A5230',
    outfit: { top: '#D93030', topDark: '#A32121', pants: '#2B2D42' },
    print: `<path d="M46 84 Q60 94 74 84" fill="none" stroke="${W}" stroke-width="2.5"/><path d="M52 88 V100 M68 88 V100" stroke="${W}" stroke-width="2" stroke-linecap="round"/>`,
    head: `<circle cx="37" cy="44" r="4.5" fill="#7A5230"/><circle cx="83" cy="44" r="4.5" fill="#7A5230"/><path d="M34 56 Q34 34 60 33 Q86 34 86 56 Q86 76 60 78 Q34 76 34 56 Z" fill="#9C6B43"/>`,
    face: `<path d="M40 60 Q42 52 52 54 Q60 50 68 54 Q78 52 80 60 Q80 76 60 77 Q40 76 40 60 Z" fill="#E9D2B4"/><path d="M55 59 H65 Q63 64 60 64 Q57 64 55 59 Z" fill="${INK}"/>${whiskers(63, '#7A5230', 46, 74)}`,
    eyes: { l: [50, 50], r: [70, 50], w: 5.2, h: 4.6 },
    mouth: { x: 60, y: 70 },
    prop: { hand: 'R', svg: `<g transform="translate(6 -14) rotate(-25)"><path d="M2 -6 L18 -14 V12 L2 4 Z" fill="#F2B518"/><rect x="-4" y="-6" width="8" height="10" rx="2" fill="#F2B518"/><rect x="-2" y="3" width="4" height="9" rx="2" fill="${INK}"/></g>` },
  },
  {
    id: 'porcogues', name: 'Porcoguês', subject: 'Português',
    skin: '#F4A7B9', lid: '#F4A7B9', brow: '#E08AA0',
    outfit: { top: '#2B3A67', topDark: '#1E2A4D', pants: '#4A4F63', sleeve: '#F4F5F9' },
    print: `<path d="M48 82 L60 96 L72 82 Z" fill="${W}"/><path d="M58 88 L62 88 L63 104 L60 108 L57 104 Z" fill="#D93030"/>`,
    head: `<path d="M38 36 L36 22 L52 30 Z M82 36 L84 22 L68 30 Z" fill="#E08AA0"/><ellipse cx="60" cy="54" rx="25" ry="23" fill="#F4A7B9"/>`,
    face: `<ellipse cx="60" cy="64" rx="10.5" ry="7.5" fill="#F7C3CF"/><ellipse cx="56.5" cy="64" rx="2" ry="3" fill="#C0627A"/><ellipse cx="63.5" cy="64" rx="2" ry="3" fill="#C0627A"/>`,
    eyes: { l: [50, 49], r: [70, 49], w: 5.2, h: 4.6 },
    mouth: { x: 61, y: 75, s: 0.75 },
    prop: { hand: 'R', svg: PEN('#D93030', '#A32121') },
  },
  {
    id: 'literatucano', name: 'Literatucano', subject: 'Literatura',
    skin: '#2E3140', lid: '#3D8BD9', brow: '#F2B518',
    outfit: { top: '#7A4FD8', topDark: '#5C35B3', pants: '#2B2D42' },
    print: `<path d="M42 84 Q60 94 78 84 L78 90 Q60 100 42 90 Z" fill="#F2B518"/><path d="M70 90 L76 112 L68 110 Z" fill="#F2B518"/>`,
    head: `<ellipse cx="56" cy="52" rx="24" ry="24" fill="#2E3140"/>`,
    face: `<ellipse cx="56" cy="66" rx="14" ry="10" fill="${W}"/><circle cx="47" cy="47" r="8" fill="#3D8BD9"/><circle cx="64" cy="46" r="7" fill="#3D8BD9"/>`,
    faceOver: `<path d="M64 52 Q86 46 104 58 Q100 64 90 62 L66 62 Q62 58 64 52 Z" fill="#F7C531"/><path d="M66 60 L90 62 Q100 64 104 58 Q104 66 96 68 Q80 70 66 64 Z" fill="#F28C1F"/><path d="M98 56 Q104 57 104 60 Q102 66 97 67 Z" fill="#22242F"/>`,
    eyes: { l: [47, 47], r: [64, 46], w: 4.4, h: 4.1 },
    mouth: { x: 56, y: 72, s: 0.6 },
    prop: { hand: 'R', svg: `<path d="M-2 -25 Q10 -35 18 -31 Q10 -23 2 -13 Z" fill="${W}"/><path d="M1 -15 L10 -28" stroke="#C3C8D6" stroke-width="1.2"/>` },
  },
  {
    id: 'radacao', name: 'Rãdação', subject: 'Redação',
    skin: '#3DAA5C', lid: '#3DAA5C', brow: null,
    outfit: { top: '#2B2D42', topDark: '#1C1D28', pants: '#5A4A3A' },
    print: `<rect x="48" y="80" width="24" height="10" rx="5" fill="#1C1D28"/>`,
    head: `<path d="M30 58 Q30 34 60 34 Q90 34 90 58 Q90 82 60 84 Q30 82 30 58 Z" fill="#3DAA5C"/><circle cx="44" cy="40" r="11" fill="#3DAA5C"/><circle cx="76" cy="40" r="11" fill="#3DAA5C"/>
<path d="M38 32 Q38 14 60 14 Q82 14 82 32 Q60 26 38 32 Z" fill="#E0A21F"/><rect x="36" y="28" width="48" height="8" rx="4" fill="#C98A10"/><circle cx="60" cy="12" r="4.5" fill="#E0A21F"/>`,
    face: `<ellipse cx="60" cy="70" rx="20" ry="11" fill="#9AD9AC"/><circle cx="56" cy="55" r="1.8" fill="#2A8A45"/><circle cx="64" cy="55" r="1.8" fill="#2A8A45"/>`,
    eyes: { l: [44, 41], r: [76, 41], w: 6.4, h: 5.6 },
    mouth: { x: 60, y: 63, s: 1.1 },
    prop: { hand: 'R', svg: PEN('#F4F5F9', '#2F6FE8') },
  },
  {
    id: 'inglesma', name: 'Inglesma', subject: 'Inglês',
    skin: '#B8D86B', lid: '#B8D86B', brow: null,
    outfit: { top: '#2B3A67', topDark: '#1E2A4D', pants: '#4A4F63' },
    behind: `<circle cx="60" cy="98" r="40" fill="#A86E38"/><circle cx="60" cy="98" r="36" fill="#C98A4E"/><path d="M60 98 m-6 0 a6 6 0 1 1 12 0 a12 12 0 1 1 -24 0 a18 18 0 1 1 36 0 a24 24 0 1 1 -48 0" fill="none" stroke="#A86E38" stroke-width="3"/>`,
    print: `<path d="M50 82 L60 96 L70 82 Z" fill="${W}"/><path d="M58 88 L62 88 L63 102 L60 106 L57 102 Z" fill="#D93030"/>`,
    head: `<path d="M52 42 L46 16 M68 42 L74 16" stroke="#B8D86B" stroke-width="6" stroke-linecap="round"/><circle cx="46" cy="15" r="8" fill="#B8D86B"/><circle cx="74" cy="15" r="8" fill="#B8D86B"/><ellipse cx="60" cy="58" rx="23" ry="21" fill="#B8D86B"/>`,
    face: `<ellipse cx="48" cy="62" rx="4" ry="2.4" fill="#F2A0B5" opacity="0.6" stroke="none"/><ellipse cx="72" cy="62" rx="4" ry="2.4" fill="#F2A0B5" opacity="0.6" stroke="none"/>`,
    eyes: { l: [46, 15], r: [74, 15], w: 6, h: 6 },
    mouth: { x: 61, y: 66 },
    prop: { hand: 'R', svg: `<g transform="translate(2 -10)"><path d="M-8 -6 H8 V0 Q8 8 0 8 Q-8 8 -8 0 Z" fill="${W}"/><path d="M8 -4 Q14 -3 11 3 Q9 4 8 2" fill="none" stroke="${W}" stroke-width="2"/><ellipse cx="0" cy="9" rx="11" ry="2.5" fill="${W}"/><path d="M-3 -10 Q-1 -14 -3 -18 M3 -10 Q5 -14 3 -18" fill="none" stroke="${W}" stroke-width="1.5" opacity="0.7"/></g>` },
  },
  {
    id: 'espanhonca', name: 'Espanhonça', subject: 'Espanhol',
    skin: '#F2A93B', lid: '#F2A93B', brow: '#3A2A1E',
    outfit: { top: '#D93030', topDark: '#A32121', pants: '#2B2D42' },
    print: `${[[44, 96], [56, 104], [70, 96], [76, 110], [48, 114], [64, 118]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="${W}"/>`).join('')}<path d="M44 82 Q52 92 60 84 Q68 92 76 82" fill="none" stroke="${W}" stroke-width="3"/>`,
    head: `<circle cx="38" cy="34" r="8" fill="#F2A93B"/><circle cx="82" cy="34" r="8" fill="#F2A93B"/><circle cx="38" cy="34" r="4" fill="#3A2A1E"/><circle cx="82" cy="34" r="4" fill="#3A2A1E"/>
<ellipse cx="60" cy="54" rx="25" ry="23" fill="#F2A93B"/><circle cx="46" cy="38" r="3" fill="none" stroke="#3A2A1E" stroke-width="2"/><circle cx="60" cy="34" r="2.6" fill="none" stroke="#3A2A1E" stroke-width="2"/><circle cx="74" cy="38" r="3" fill="none" stroke="#3A2A1E" stroke-width="2"/>
<circle cx="40" cy="58" r="2.4" fill="none" stroke="#3A2A1E" stroke-width="1.8"/><circle cx="80" cy="58" r="2.4" fill="none" stroke="#3A2A1E" stroke-width="1.8"/>
<circle cx="86" cy="26" r="5" fill="#E8304A"/><circle cx="81" cy="22" r="4" fill="#E8304A"/><circle cx="90" cy="21" r="4" fill="#E8304A"/><circle cx="86" cy="25" r="2.5" fill="#A31A2E"/>`,
    face: `<ellipse cx="60" cy="66" rx="14" ry="10" fill="#FBE3B8"/><path d="M56 60 H64 L60 64 Z" fill="#3A2A1E" stroke="#3A2A1E" stroke-width="1.5" stroke-linejoin="round"/>`,
    eyes: { l: [50, 51], r: [70, 51], w: 5.2, h: 4.6 },
    mouth: { x: 60, y: 70 },
  },
];

export const CHARACTER_BY_ID: Record<string, Character> = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));

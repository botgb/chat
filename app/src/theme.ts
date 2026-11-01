// Mistura de Duolingo e Apple: das telas da Apple vêm o fundo cinza agrupado, os cartões
// brancos com sombra suave e cantos contínuos, os separadores finos e a fonte do sistema no
// texto; do Duolingo ficam os botões 3D, as ilustrações, as cores vivas e a fonte arredondada
// nos títulos e números. As questões usam uma fonte de alta legibilidade.
// As telas leem as cores pelo hook useColors() (theme/ThemeContext), para trocar de tema na hora.
export const lightColors = {
  bg: '#F2F2F7', // fundo agrupado (systemGroupedBackground)
  card: '#FFFFFF', // cartões e linhas de lista
  cardShadow: '0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 14px rgba(0, 0, 0, 0.05)',
  bar: 'rgba(249, 249, 251, 0.94)', // barras de cima e de baixo, translúcidas
  separator: 'rgba(60, 60, 67, 0.18)',
  surface: '#EFEFF4', // trilhas de progresso e campos dentro dos cartões
  line: '#E3E3EA',
  ink: '#1C1C1E',
  inkSoft: '#6C6C72',
  locked: '#D9DCE6',
  lockedDark: '#B8BCCB',

  primary: '#3D7BFF',
  primaryDark: '#2657CC',
  right: '#2DBE60',
  rightDark: '#1E9449',
  rightBg: '#E2F8EA',
  wrong: '#FF4B4B',
  wrongDark: '#D12F2F',
  wrongBg: '#FFE6E6',
  gold: '#FFC531',
  goldDark: '#DB9C00',
  streak: '#FF8A1F',
  heart: '#FF4B6E',
  gem: '#2EB8E6',

  // Versões com contraste suficiente (WCAG AA) para texto branco em cima e para números
  btnPrimary: '#2F6FE8',
  btnSuccess: '#178A42',
  btnDanger: '#D93030',
  btnPrimaryEdge: '#1F4FB8',
  btnSuccessEdge: '#0E6630',
  btnDangerEdge: '#A32121',
  streakText: '#B85A00',
  gemText: '#0A7AA3',
  heartText: '#C9284E',

  selectedBg: '#EAF1FF', // fundo de chips, alternativas e abas selecionados
  goldBg: '#FFF8E1',
  streakBg: '#FFF1E3',
  onColor: '#FFFFFF', // texto sobre botões e faixas coloridas
};

export type Colors = typeof lightColors;

// Escuro no estilo Duolingo: azul-petróleo acinzentado (não preto), cartões com contorno.
export const darkColors: Colors = {
  bg: '#131F24',
  card: '#1B2A31',
  cardShadow: '0 0 0 1.5px #37464F',
  bar: '#131F24',
  separator: '#37464F',
  surface: '#2A3A42',
  line: '#37464F',
  ink: '#F1F7FB',
  inkSoft: '#A3B5BE',
  locked: '#37464F',
  lockedDark: '#52656D',

  primary: '#5B8FFF',
  primaryDark: '#3D6BE0',
  right: '#3BD16F',
  rightDark: '#24A653',
  rightBg: '#1B3A2A',
  wrong: '#FF5C5C',
  wrongDark: '#E04444',
  wrongBg: '#432228',
  gold: '#FFC531',
  goldDark: '#DB9C00',
  streak: '#FF9A3D',
  heart: '#FF5C7C',
  gem: '#45C6F0',

  btnPrimary: '#2F6FE8',
  btnSuccess: '#178A42',
  btnDanger: '#D93030',
  btnPrimaryEdge: '#1F4FB8',
  btnSuccessEdge: '#0E6630',
  btnDangerEdge: '#A32121',
  streakText: '#FF9A3D',
  gemText: '#45C6F0',
  heartText: '#FF5C7C',

  selectedBg: '#1D3A52',
  goldBg: '#3A3220',
  streakBg: '#3D2A1C',
  onColor: '#FFFFFF',
};

// Uma cor por unidade, em rodízio.
export const unitColors = [
  { main: '#3D7BFF', dark: '#2657CC' },
  { main: '#9B5CFF', dark: '#7438DB' },
  { main: '#FF5CA8', dark: '#D93684' },
  { main: '#14B8A6', dark: '#0E8C7E' },
  { main: '#FF8A1F', dark: '#D96A00' },
];

export const fonts = {
  // Arredondada, do lado Duolingo: títulos, números e botões.
  display: 'Fredoka_700Bold',
  displayMedium: 'Fredoka_600SemiBold',
  // Fonte do sistema (SF Pro no iPhone), do lado Apple: textos de apoio e rótulos.
  ui: undefined as string | undefined,
  body: undefined as string | undefined,
  bodyBold: undefined as string | undefined,
  // Leitura das questões, com alta legibilidade.
  reading: 'AtkinsonHyperlegible_400Regular',
  readingBold: 'AtkinsonHyperlegible_700Bold',
};

/** Cantos e cartões no padrão da Apple. */
export const radius = { card: 20, row: 14 };

export const type = {
  small: 13,
  body: 17,
  lead: 20,
  title: 26,
  hero: 36,
};

export const space = (n: number) => n * 4;

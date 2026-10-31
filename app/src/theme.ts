// Visual divertido de jogo: cores vivas, botões "gordinhos" com sombra sólida e
// mapa de fases. Texto das questões continua numa fonte de alta legibilidade.
// As telas leem as cores pelo hook useColors() (theme/ThemeContext), para trocar de tema na hora.
export const lightColors = {
  bg: '#FFFFFF',
  surface: '#F5F6FA',
  line: '#E3E5EE',
  ink: '#2B2D42',
  inkSoft: '#6E7387',
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

// Escuro azulado, para não cansar a vista em estudos à noite; cores de destaque mais claras.
export const darkColors: Colors = {
  bg: '#141826',
  surface: '#1E2335',
  line: '#2C3248',
  ink: '#F2F4FA',
  inkSoft: '#A3A9BE',
  locked: '#2C3248',
  lockedDark: '#4E5674',

  primary: '#5B8FFF',
  primaryDark: '#3D6BE0',
  right: '#3BD16F',
  rightDark: '#24A653',
  rightBg: '#163626',
  wrong: '#FF5C5C',
  wrongDark: '#E04444',
  wrongBg: '#3D1E25',
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

  selectedBg: '#1F2D52',
  goldBg: '#33291A',
  streakBg: '#36261A',
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
  display: 'Fredoka_700Bold',
  displayMedium: 'Fredoka_600SemiBold',
  ui: 'Fredoka_500Medium',
  body: 'AtkinsonHyperlegible_400Regular',
  bodyBold: 'AtkinsonHyperlegible_700Bold',
};

export const type = {
  small: 13,
  body: 17,
  lead: 20,
  title: 26,
  hero: 36,
};

export const space = (n: number) => n * 4;

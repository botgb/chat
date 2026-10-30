// Visual divertido de jogo: cores vivas, botões "gordinhos" com sombra sólida e
// mapa de fases. Texto das questões continua numa fonte de alta legibilidade.
export const colors = {
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

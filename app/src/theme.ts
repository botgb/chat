// Identidade visual: cartão-resposta de vestibular + marca-texto.
export const colors = {
  paper: '#FFFFFF',
  sheet: '#FDF1F3', // fundo rosado da folha de respostas
  sheetLine: '#F2B8C4', // tinta "fantasma" das bolinhas vazias
  sheetInk: '#D23A5E', // contorno das bolinhas e títulos do cartão
  ink: '#16171D', // caneta preta
  inkSoft: '#5B5E6B',
  highlight: '#FFE14D', // marca-texto
  right: '#14895B',
  rightBg: '#E3F6EC',
  wrong: '#C42B1C',
  wrongBg: '#FCE7E4',
};

export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayMedium: 'BricolageGrotesque_600SemiBold',
  body: 'AtkinsonHyperlegible_400Regular',
  bodyBold: 'AtkinsonHyperlegible_700Bold',
};

// Escala tipográfica (razão ~1.25).
export const type = {
  small: 13,
  body: 17,
  lead: 20,
  title: 26,
  hero: 40,
};

export const space = (n: number) => n * 4;

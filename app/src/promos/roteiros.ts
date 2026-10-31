// Os três vídeos do Plus (textos em falas.json; descrição em docs/roteiros-plus.md).
// Coordenadas no cenário de 360 x 640: x é o centro do personagem; y desloca a partir do chão.
import type { Script } from './timeline';

const wrong = (q: number, mark: number, lost: number) => [
  { t: 'set' as const, key: 'q', value: q },
  { t: 'set' as const, key: 'marca', value: mark },
  { t: 'sfx' as const, name: 'errado' as const },
  { t: 'set' as const, key: 'perdidos', value: lost },
  { t: 'sfx' as const, name: 'coracao' as const, delay: 180 },
];

export const SCRIPTS: Script[] = [
  {
    id: 'vidas',
    scene: 'quarto',
    beats: [
      { do: [{ t: 'place', who: 'gabamico', x: 100, z: 1 }, { t: 'set', key: 'card', value: 1 }, { t: 'set', key: 'q', value: 0 }] },
      { wait: 500 },
      { say: 'vidas-01', with: [{ t: 'hop', who: 'gabamico' }] },
      { do: wrong(0, 3, 1) },
      { wait: 600 },
      { say: 'vidas-02' },
      { do: wrong(0, 2, 2) },
      { wait: 700 },
      // Cortes rápidos: mais três erros.
      { do: [...wrong(1, 2, 3), { t: 'cam', s: 1.3, x: 180, y: 240 }] },
      { wait: 650 },
      { do: [...wrong(2, 1, 4), { t: 'cam', s: 1.35, x: 100, y: 420 }, { t: 'shake', who: 'gabamico', ms: 400 }] },
      { wait: 650 },
      { do: [...wrong(3, 5, 5), { t: 'cam', s: 1.3, x: 180, y: 240 }] },
      { wait: 700 },
      { do: [{ t: 'set', key: 'card', value: 0 }, { t: 'cam', s: 1.3, x: 100, y: 410 }] },
      { say: 'vidas-03', with: [{ t: 'shake', who: 'gabamico', ms: 1700 }] },
      // Cena 2: o Gabaritatu surge devagar, atrás dele, assustadoramente feliz.
      {
        wait: 1800,
        with: [
          { t: 'cam', s: 1, x: 180, y: 320 },
          { t: 'place', who: 'gabaritatu', x: 258, y: 320, z: 0 },
          { t: 'face', who: 'gabaritatu', expr: 'gabaritatu-sorrisao' },
          { t: 'move', who: 'gabaritatu', y: 0, ms: 1600 },
          { t: 'sfx', name: 'tchan', delay: 600 },
        ],
      },
      { say: 'vidas-04' },
      { say: 'vidas-05', with: [{ t: 'hop', who: 'gabamico' }] },
      { say: 'vidas-06', with: [{ t: 'face', who: 'gabaritatu', expr: null }, { t: 'hop', who: 'gabaritatu' }] },
      // Chuva de corações; o Gabamico comemora.
      {
        wait: 600,
        with: [
          { t: 'set', key: 'chuva', value: 1 },
          { t: 'set', key: 'infinito', value: 1 },
          { t: 'sfx', name: 'festa' },
          { t: 'hop', who: 'gabamico', n: 3 },
        ],
      },
      { say: 'vidas-07', with: [{ t: 'hop', who: 'gabamico', n: 2 }] },
      { say: 'vidas-08', with: [{ t: 'hop', who: 'gabaritatu' }] },
      // Pausa dramática: close no Gabaritatu.
      { wait: 1000, with: [{ t: 'set', key: 'chuva', value: 0 }, { t: 'cam', s: 1.45, x: 258, y: 410 }] },
      { say: 'vidas-09' },
      { wait: 400 },
    ],
    end: { title: 'APROVA PLUS', lines: ['Vidas infinitas.', 'Zero anúncios.'] },
  },
  {
    id: 'anuncio',
    scene: 'biblioteca',
    beats: [
      { do: [{ t: 'place', who: 'radacao', x: 180, z: 1 }, { t: 'set', key: 'fase', value: 1 }, { t: 'sfx', name: 'ding', delay: 300 }] },
      { wait: 1100 },
      { say: 'anuncio-01', with: [{ t: 'hop', who: 'radacao' }] },
      // A Aprovaca entra na frente da câmera com a placa.
      {
        wait: 700,
        with: [
          { t: 'set', key: 'fase', value: 0 },
          { t: 'place', who: 'aprovaca', x: 480, s: 1.15, z: 2 },
          { t: 'move', who: 'aprovaca', x: 222, ms: 450 },
          { t: 'set', key: 'placa', value: 1 },
          { t: 'move', who: 'radacao', x: 88, ms: 350 },
          { t: 'sfx', name: 'whoosh' },
        ],
      },
      { say: 'anuncio-02', with: [{ t: 'shake', who: 'radacao', ms: 400 }] },
      { say: 'anuncio-03' },
      { say: 'anuncio-04', with: [{ t: 'shake', who: 'radacao', ms: 1300 }, { t: 'hop', who: 'radacao' }] },
      { say: 'anuncio-05' },
      // Silêncio: o Rãdação encara a Aprovaca.
      { wait: 1200, with: [{ t: 'cam', s: 1.5, x: 88, y: 410 }] },
      { say: 'anuncio-06' },
      { say: 'anuncio-07', with: [{ t: 'cam', s: 1.45, x: 222, y: 400 }] },
      { wait: 900 },
      // Olhando para a câmera.
      { say: 'anuncio-08', with: [{ t: 'cam', s: 1.75, x: 222, y: 390, ms: 300 }] },
      { wait: 400 },
    ],
    end: { title: 'APROVA PLUS', lines: ['Estude sem anúncios', 'e com vidas infinitas.'] },
  },
  {
    id: 'assinatura',
    scene: 'sala',
    beats: [
      { do: [{ t: 'place', who: 'passarinho', x: 262, z: 1 }, { t: 'set', key: 'suor', value: 1 }, { t: 'cam', s: 1.25, x: 262, y: 330 }] },
      { wait: 300 },
      { say: 'assinatura-01', with: [{ t: 'shake', who: 'passarinho', ms: 1900 }] },
      // A Simuláguia surge de óculos escuros.
      {
        wait: 800,
        with: [
          { t: 'cam', s: 1, x: 180, y: 320 },
          { t: 'place', who: 'simulaguia', x: -90, z: 2 },
          { t: 'move', who: 'simulaguia', x: 98, ms: 600 },
          { t: 'set', key: 'oculos', value: 1 },
          { t: 'sfx', name: 'whoosh' },
        ],
      },
      { say: 'assinatura-02' },
      { say: 'assinatura-03' },
      { say: 'assinatura-04', with: [{ t: 'hop', who: 'simulaguia' }, { t: 'shake', who: 'simulaguia', ms: 400 }] },
      { say: 'assinatura-05' },
      // Tira os óculos devagar.
      { wait: 1300, with: [{ t: 'cam', s: 1.5, x: 98, y: 400 }, { t: 'set', key: 'oculos', value: 0 }] },
      { say: 'assinatura-06' },
      { wait: 900, with: [{ t: 'sfx', name: 'tchan' }] },
      { say: 'assinatura-07', with: [{ t: 'cam', s: 1, x: 180, y: 320 }] },
      { say: 'assinatura-08', with: [{ t: 'hop', who: 'passarinho' }, { t: 'shake', who: 'passarinho', ms: 1500 }, { t: 'cam', s: 1.4, x: 262, y: 410 }] },
      { say: 'assinatura-09', with: [{ t: 'cam', s: 1.4, x: 98, y: 400 }] },
      { wait: 400 },
    ],
    end: { title: 'APROVA PLUS', lines: ['Vidas infinitas.', 'Sem anúncios.', 'Mais tempo estudando.'] },
  },
];

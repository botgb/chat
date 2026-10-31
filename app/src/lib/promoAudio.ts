// Sons dos vídeos do Plus: efeitos e trilha (gerados por scripts/sons.py) e, quando existirem,
// as vozes gravadas dos personagens (assets/vozes, roteiro em docs/roteiros-plus.md).
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

export const SFX = {
  pop: require('../../assets/sons/pop.wav'),
  whoosh: require('../../assets/sons/whoosh.wav'),
  boing: require('../../assets/sons/boing.wav'),
  ding: require('../../assets/sons/ding.wav'),
  vinheta: require('../../assets/sons/vinheta.wav'),
} as const;
export type Sfx = keyof typeof SFX;

const TRILHA = require('../../assets/sons/trilha.wav');

/**
 * Falas gravadas, na ordem das falas de cada vídeo. Fica vazio até os arquivos existirem:
 * um `require` de arquivo que não existe quebra o app. Para ativar, salve por exemplo
 * assets/vozes/vidas-1.mp3 e vidas-2.mp3 e acrescente:
 *   vidas: [require('../../assets/vozes/vidas-1.mp3'), require('../../assets/vozes/vidas-2.mp3')],
 */
export const VOICES: Partial<Record<string, number[]>> = {};

export const hasVoices = (promoId: string) => (VOICES[promoId]?.length ?? 0) > 0;

export type PromoAudio = {
  sfx: (name: Sfx) => void;
  voice: (index: number) => void;
  release: () => void;
};

const silent: PromoAudio = { sfx: () => {}, voice: () => {}, release: () => {} };

/** Prepara os sons de um vídeo. Com o som desligado nas configurações, não toca nada. */
export function createPromoAudio(promoId: string, enabled: boolean): PromoAudio {
  if (!enabled) return silent;
  const players: AudioPlayer[] = [];
  const make = (src: number, volume: number) => {
    const p = createAudioPlayer(src);
    p.volume = volume;
    players.push(p);
    return p;
  };
  try {
    // Respeita a chave de silencioso do iPhone e não interrompe a música do usuário.
    setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
    const voices = (VOICES[promoId] ?? []).map((v) => make(v, 1));
    const music = make(TRILHA, voices.length ? 0.12 : 0.28);
    const fx = Object.fromEntries((Object.keys(SFX) as Sfx[]).map((k) => [k, make(SFX[k], 0.7)])) as Record<Sfx, AudioPlayer>;
    music.play();
    const restart = (p: AudioPlayer) => {
      p.seekTo(0).catch(() => {});
      p.play();
    };
    return {
      sfx: (name) => restart(fx[name]),
      voice: (i) => voices[i] && restart(voices[i]),
      release: () => {
        for (const p of players) {
          try {
            p.pause();
            p.remove();
          } catch {
            // o player já foi liberado
          }
        }
        players.length = 0;
      },
    };
  } catch {
    // Sem áudio disponível (por exemplo, navegador sem permissão): o vídeo segue mudo.
    for (const p of players) p.remove();
    return silent;
  }
}

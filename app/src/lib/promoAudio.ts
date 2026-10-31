// Sons dos vídeos do Plus: efeitos e trilha (gerados por scripts/sons.py) e as vozes dos
// personagens, quando gravadas (scripts/vozes.py gera src/promos/vozes.ts).
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { VOICE_FILES } from '../promos/vozes';

export const SFX = {
  pop: require('../../assets/sons/pop.wav'),
  whoosh: require('../../assets/sons/whoosh.wav'),
  boing: require('../../assets/sons/boing.wav'),
  ding: require('../../assets/sons/ding.wav'),
  vinheta: require('../../assets/sons/vinheta.wav'),
  errado: require('../../assets/sons/errado.wav'),
  coracao: require('../../assets/sons/coracao.wav'),
  tchan: require('../../assets/sons/tchan.wav'),
  festa: require('../../assets/sons/festa.wav'),
} as const;
export type Sfx = keyof typeof SFX;

const TRILHA = require('../../assets/sons/trilha.wav');

export type PromoAudio = {
  sfx: (name: Sfx) => void;
  voice: (lineId: string) => void;
  release: () => void;
};

const silent: PromoAudio = { sfx: () => {}, voice: () => {}, release: () => {} };

/** Prepara os sons de um vídeo. Com o som desligado nas configurações, não toca nada. */
export function createPromoAudio(lineIds: string[], enabled: boolean): PromoAudio {
  if (!enabled) return silent;
  const players: AudioPlayer[] = [];
  const make = (src: number, volume: number) => {
    const p = createAudioPlayer(src);
    p.volume = volume;
    players.push(p);
    return p;
  };
  const release = () => {
    for (const p of players) {
      try {
        p.pause();
        p.remove();
      } catch {
        // o player já foi liberado
      }
    }
    players.length = 0;
  };
  try {
    // Respeita a chave de silencioso do iPhone e não interrompe a música do usuário.
    setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
    const voices = new Map(lineIds.filter((id) => VOICE_FILES[id]).map((id) => [id, make(VOICE_FILES[id], 1)]));
    const music = make(TRILHA, voices.size ? 0.1 : 0.22);
    music.loop = true;
    const fx = Object.fromEntries((Object.keys(SFX) as Sfx[]).map((k) => [k, make(SFX[k], 0.65)])) as Record<Sfx, AudioPlayer>;
    music.play();
    const restart = (p: AudioPlayer) => {
      p.seekTo(0).catch(() => {});
      p.play();
    };
    return {
      sfx: (name) => restart(fx[name]),
      voice: (id) => {
        const p = voices.get(id);
        if (p) restart(p);
      },
      release,
    };
  } catch {
    // Sem áudio disponível (por exemplo, navegador sem permissão): o vídeo segue mudo.
    release();
    return silent;
  }
}

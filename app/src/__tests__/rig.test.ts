import { CHARACTERS } from '../rig/characters';
import { composePuppet, DEFAULT_POSE, handPoint, ikArm, VIEWS } from '../rig/compose';
import { EYE_NAMES, eyeSvg, HAND_NAMES, handSvg, MOUTH_NAMES, mouthSvg } from '../rig/library';
import { LIP_MIN_MS, lipTrack, mouthAt } from '../rig/lipsync';
import { FPS } from '../promos/timeline';

jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(), setAudioModeAsync: jest.fn() }));

describe('biblioteca de recorte', () => {
  it('tem as peças prometidas', () => {
    expect(CHARACTERS).toHaveLength(13);
    expect(EYE_NAMES.length).toBeGreaterThanOrEqual(13);
    expect(MOUTH_NAMES.length).toBeGreaterThanOrEqual(17);
    expect(HAND_NAMES.length).toBeGreaterThanOrEqual(7);
    for (const e of EYE_NAMES) expect(eyeSvg(e, { w: 5, h: 4.6, lid: '#888', side: 1 })).toMatch(/^</);
    for (const m of MOUTH_NAMES) expect(mouthSvg(m)).toMatch(/^</);
    for (const h of HAND_NAMES) expect(handSvg(h, '#888')).toMatch(/^</);
  });

  it('monta todos os personagens em todas as vistas, sem valores inválidos', () => {
    for (const c of CHARACTERS) {
      for (const view of VIEWS) {
        for (const facing of [1, -1] as const) {
          const svg = composePuppet(c, { ...DEFAULT_POSE, view, facing });
          expect(svg.startsWith('<svg')).toBe(true);
          expect(svg).not.toMatch(/NaN|undefined/);
        }
      }
    }
  });

  it('de costas não mostra o rosto; espelhado envolve tudo num grupo invertido', () => {
    const c = CHARACTERS[0];
    const costas = composePuppet(c, { ...DEFAULT_POSE, view: 'costas' });
    expect(costas).not.toContain(c.face!.slice(0, 30));
    expect(composePuppet(c, { ...DEFAULT_POSE, facing: -1 })).toContain('scale(-1 1)');
  });

  it('a mão acompanha ombro e cotovelo', () => {
    // braço reto para baixo: mão 38 abaixo do ombro
    expect(handPoint([32, 90], [0, 0], -1).map((v) => Math.round(v))).toEqual([32, 128]);
    // braço esquerdo aberto 90°: mão vai para a esquerda, na altura do ombro
    expect(handPoint([32, 90], [90, 0], -1).map((v) => Math.round(v))).toEqual([-6, 90]);
  });
});

describe('cinemática inversa', () => {
  it('leva a mão ao alvo, com o cotovelo para fora', () => {
    const cases: [[number, number], [number, number], -1 | 1][] = [
      [[32, 90], [20, 60], -1], [[32, 90], [50, 110], -1], [[88, 90], [110, 70], 1], [[88, 90], [70, 115], 1],
    ];
    for (const [at, target, side] of cases) {
      const ang = ikArm(at, target, side);
      const [hx, hy] = handPoint(at, ang, side);
      expect(Math.hypot(hx - target[0], hy - target[1])).toBeLessThan(0.6);
      // cotovelo do lado de fora: à esquerda do ombro para o braço esquerdo e à direita para o direito
      const elbowX = at[0] + (side === -1 ? -1 : 1) * Math.abs(Math.sin((ang[0] * Math.PI) / 180)) * 19;
      expect(side * (elbowX - at[0])).toBeGreaterThanOrEqual(0);
    }
  });

  it('traço, hachura e sombra podem ser desligados', () => {
    const c = CHARACTERS[0];
    expect(composePuppet(c, DEFAULT_POSE)).toContain('hachura');
    expect(composePuppet(c, { ...DEFAULT_POSE, ink: false })).not.toContain('hachura');
    expect(composePuppet(c, { ...DEFAULT_POSE, boil: 1 })).not.toBe(composePuppet(c, { ...DEFAULT_POSE, boil: 2 }));
  });
});

describe('sincronia labial', () => {
  it('vogais abrem, M/B/P fecha, e nenhuma boca dura menos de 2 quadros', () => {
    const tr = lipTrack('Bora gabaritar!', 1500);
    const ms = tr.map((k) => k.m);
    expect(ms).toContain('O');
    expect(ms).toContain('A');
    for (let i = 1; i < tr.length; i++) expect(tr[i].at - tr[i - 1].at).toBeGreaterThanOrEqual(LIP_MIN_MS - 0.01);
    expect(mouthAt(tr, 10_000)).toBe(tr[tr.length - 1].m);
  });

  it('grito troca vogais abertas pela boca de grito', () => {
    const tr = lipTrack('AAA', 600);
    expect(mouthAt(tr, 100, true)).toBe('grito');
  });

  it('o motor roda a 24 quadros por segundo', () => {
    expect(FPS).toBe(24);
  });
});

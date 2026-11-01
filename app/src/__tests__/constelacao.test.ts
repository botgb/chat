import { layout, linkX } from '../components/LevelMap';
import { buildMap } from '../lib/levels';
import type { Question } from '../lib/types';

jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(), setAudioModeAsync: jest.fn() }));

const q = (id: string, materia: string, assunto: string): Question => ({
  id, number: 1, subject: 'x', materia, assunto, statement: [], alternatives: [], answer: 'A',
});
const pool = (materias: string[]) =>
  materias.flatMap((m) => Array.from({ length: 40 }, (_, i) => q(`${m}-${i}`, m, `Assunto ${Math.floor(i / 10)}`)));

describe('trilha em constelações', () => {
  it('agrupa exatas e humanas, em qualquer ordem de chegada', () => {
    const units = buildMap(pool(['História', 'Física', 'Geografia', 'Matemática', 'Química']), 'enem', {});
    expect(units.map((u) => u.subject)).toEqual(['Matemática', 'Física', 'Química', 'Geografia', 'História']);
  });

  it('degradê contínuo entre matérias e ilustrações sem sobrepor estrelas nem ligações', () => {
    for (const order of [['Física', 'História', 'Biologia'], ['Português', 'Matemática', 'Sociologia', 'Inglês']]) {
      const units = buildMap(pool(order), 'enem', {});
      const L = layout(units, [], 390, units[0].levels[0].id);
      // cor contínua: o fim de uma linha é o começo da seguinte
      const rgb = (c: string) => c.match(/\d+/g)!.map(Number);
      for (let i = 1; i < L.rows.length; i++) {
        const a = rgb(L.colorAt(L.rows[i].top - 0.01));
        const b = rgb(L.colorAt(L.rows[i].top));
        a.forEach((v, k) => expect(Math.abs(v - b[k])).toBeLessThanOrEqual(2));
      }
      let decos = 0;
      for (const r of L.rows) {
        if (r.kind !== 'item' || !r.deco) continue;
        decos++;
        const d = r.deco;
        const box = { x1: d.x, x2: d.x + d.w, y1: r.top + d.y, y2: r.top + d.y + d.h };
        // estrela e nome (±60 na horizontal)
        expect(r.x + 60 <= box.x1 || r.x - 60 >= box.x2).toBe(true);
        for (const l of L.links) {
          for (let y = Math.max(box.y1, l.ya); y <= Math.min(box.y2, l.yb); y += 4) {
            const x = linkX(l, y);
            expect(x < box.x1 || x > box.x2).toBe(true);
          }
        }
      }
      expect(decos).toBeGreaterThan(3);
    }
  });

  it('toda matéria com ilustrações ganha ilustrações na trilha', () => {
    const { SKY } = require('../illustrations/sky');
    for (const m of Object.keys(SKY)) {
      if (!SKY[m].decos.length) continue;
      const units = buildMap(pool([m]), 'enem', {});
      const L = layout(units, [], 390, units[0].levels[0].id);
      const n = L.rows.filter((r) => r.kind === 'item' && r.deco).length;
      expect([m, n > 2]).toEqual([m, true]);
    }
  });

  it('as próximas estrelas ficam mais apagadas quanto mais longe da atual', () => {
    const units = buildMap(pool(['Física']), 'enem', {});
    const L = layout(units, [], 390, units[0].levels[0].id);
    const fades = L.rows.filter((r) => r.kind === 'item' && r.item.kind === 'level').map((r) => (r as { fade: number }).fade);
    expect(fades[0]).toBe(1);
    for (let i = 2; i < fades.length; i++) expect(fades[i]).toBeLessThanOrEqual(fades[i - 1]);
    expect(fades[fades.length - 1]).toBeLessThan(0.5);
  });
});

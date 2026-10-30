// Mapa de fases: cada matéria é uma unidade com fases de LEVEL_SIZE questões.
// Dentro da unidade as fases abrem em sequência; a primeira de cada unidade já vem aberta,
// para o aluno escolher por onde começar.
import { Question } from './types';

export const LEVEL_SIZE = 5;

export type LevelResult = { stars: number; bestCorrect: number };

export type Level = {
  id: string;
  index: number; // posição dentro da unidade (0..)
  last: boolean; // última fase da unidade: o "desafio"
  questionIds: string[];
  stars: number; // 0 = não concluída
  unlocked: boolean;
  current: boolean; // próxima fase a jogar na unidade
};

export type Unit = { subject: string; levels: Level[] };

export const levelId = (vestibular: string, subject: string, index: number) =>
  `${vestibular}:${subject}:${index}`;

export function starsFor(correct: number, total: number): number {
  if (total === 0) return 0;
  const r = correct / total;
  if (r === 1) return 3;
  if (r >= 0.8) return 2;
  if (r >= 0.6) return 1;
  return 0; // abaixo de 60%: precisa repetir a fase
}

/** Ordem estável: as fases não mudam de lugar quando o aluno joga. */
function stableOrder(a: Question, b: Question): number {
  return a.id.localeCompare(b.id, 'en', { numeric: true });
}

export function buildMap(
  pool: Question[],
  vestibular: string,
  results: Record<string, LevelResult>,
): Unit[] {
  const bySubject = new Map<string, Question[]>();
  for (const q of pool) bySubject.set(q.subject, [...(bySubject.get(q.subject) ?? []), q]);

  return [...bySubject.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
    .map(([subject, qs]) => {
      const sorted = [...qs].sort(stableOrder);
      const levels: Level[] = [];
      for (let i = 0; i * LEVEL_SIZE < sorted.length; i++) {
        const id = levelId(vestibular, subject, i);
        const stars = results[id]?.stars ?? 0;
        const unlocked = i === 0 || (levels[i - 1]?.stars ?? 0) > 0;
        levels.push({
          id,
          index: i,
          questionIds: sorted.slice(i * LEVEL_SIZE, (i + 1) * LEVEL_SIZE).map((q) => q.id),
          stars,
          unlocked,
          last: false,
          current: false,
        });
      }
      if (levels.length) levels[levels.length - 1].last = true;
      const next = levels.find((l) => l.unlocked && l.stars === 0);
      if (next) next.current = true;
      return { subject, levels };
    });
}

export function recordLevel(
  results: Record<string, LevelResult>,
  id: string,
  correct: number,
  total: number,
): { results: Record<string, LevelResult>; stars: number; newStars: number } {
  const stars = starsFor(correct, total);
  const prev = results[id] ?? { stars: 0, bestCorrect: 0 };
  return {
    stars,
    newStars: Math.max(0, stars - prev.stars),
    results: {
      ...results,
      [id]: { stars: Math.max(prev.stars, stars), bestCorrect: Math.max(prev.bestCorrect, correct) },
    },
  };
}

export const CHEST_EVERY = 3;

export type PathItem =
  | { kind: 'level'; level: Level }
  | { kind: 'chest'; id: string; unlocked: boolean; opened: boolean };

/** Caminho de uma unidade: as fases, com um baú depois de cada CHEST_EVERY fases. */
export function buildPath(unit: Unit, openedChests: string[]): PathItem[] {
  const items: PathItem[] = [];
  unit.levels.forEach((level, i) => {
    items.push({ kind: 'level', level });
    if ((i + 1) % CHEST_EVERY === 0 && i < unit.levels.length - 1) {
      const id = `${level.id}:bau`;
      items.push({ kind: 'chest', id, unlocked: level.stars > 0, opened: openedChests.includes(id) });
    }
  });
  return items;
}

// Mapa de fases: cada matéria é uma unidade (uma constelação) com fases de LEVEL_SIZE questões.
// A matéria vem do motor de assuntos; sem ela, usa a área da prova. Dentro da unidade as
// questões ficam agrupadas por assunto e as fases abrem em sequência; a primeira de cada
// unidade já vem aberta, para o aluno escolher por onde começar.
import { MATERIA_ORDER } from '../illustrations/sky';
import { Question } from './types';

export const LEVEL_SIZE = 5;

export type LevelResult = { stars: number; bestCorrect: number };

export type Level = {
  id: string;
  index: number; // posição dentro da unidade (0..)
  last: boolean; // última fase da unidade: o "desafio"
  questionIds: string[];
  assunto?: string; // assunto da maior parte das questões da fase
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

const materiaOf = (q: Question) => q.materia ?? q.subject;

/** Exatas juntas, depois natureza, humanas e linguagens; matérias desconhecidas no fim. */
function materiaRank(m: string): number {
  const i = MATERIA_ORDER.indexOf(m);
  return i < 0 ? MATERIA_ORDER.length : i;
}

function mainAssunto(qs: Question[]): string | undefined {
  const count = new Map<string, number>();
  for (const q of qs) if (q.assunto) count.set(q.assunto, (count.get(q.assunto) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

export function buildMap(
  pool: Question[],
  vestibular: string,
  results: Record<string, LevelResult>,
): Unit[] {
  const byMateria = new Map<string, Question[]>();
  for (const q of pool) byMateria.set(materiaOf(q), [...(byMateria.get(materiaOf(q)) ?? []), q]);

  return [...byMateria.entries()]
    .sort(([a], [b]) => materiaRank(a) - materiaRank(b) || a.localeCompare(b, 'pt-BR'))
    .map(([subject, qs]) => {
      // Questões do mesmo assunto ficam juntas; dentro do assunto, ordem estável.
      const sorted = [...qs].sort((a, b) => (a.assunto ?? '').localeCompare(b.assunto ?? '', 'pt-BR') || stableOrder(a, b));
      const levels: Level[] = [];
      for (let i = 0; i * LEVEL_SIZE < sorted.length; i++) {
        const id = levelId(vestibular, subject, i);
        const stars = results[id]?.stars ?? 0;
        const unlocked = i === 0 || (levels[i - 1]?.stars ?? 0) > 0;
        const chunk = sorted.slice(i * LEVEL_SIZE, (i + 1) * LEVEL_SIZE);
        levels.push({
          id,
          index: i,
          questionIds: chunk.map((q) => q.id),
          assunto: mainAssunto(chunk),
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

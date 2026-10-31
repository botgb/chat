// Acertos por matéria e por assunto, a partir do progresso e dos pacotes baixados.
import type { Progress } from './gamification';

export type StatRow = { name: string; correct: number; attempts: number; questions: number };

type Q = { materia?: string; assunto?: string };

const split = (key: string) => {
  const i = key.indexOf('|');
  return [key.slice(0, i), key.slice(i + 1)] as const;
};

/** Matérias com questões baixadas ou com respostas, das mais praticadas para as menos. */
export function materiaRows(p: Progress, questions: Q[]): StatRow[] {
  const rows = new Map<string, StatRow>();
  const get = (name: string) => rows.get(name) ?? rows.set(name, { name, correct: 0, attempts: 0, questions: 0 }).get(name)!;
  for (const q of questions) if (q.materia) get(q.materia).questions += 1;
  for (const [key, s] of Object.entries(p.topicStats ?? {})) {
    const r = get(split(key)[0]);
    r.correct += s.correct;
    r.attempts += s.attempts;
  }
  return [...rows.values()].sort((a, b) => b.attempts - a.attempts || a.name.localeCompare(b.name));
}

/** Assuntos de uma matéria (inclusive os ainda não praticados), dos mais praticados para os menos. */
export function assuntoRows(p: Progress, questions: Q[], materia: string): StatRow[] {
  const rows = new Map<string, StatRow>();
  const get = (name: string) => rows.get(name) ?? rows.set(name, { name, correct: 0, attempts: 0, questions: 0 }).get(name)!;
  for (const q of questions) if (q.materia === materia && q.assunto) get(q.assunto).questions += 1;
  for (const [key, s] of Object.entries(p.topicStats ?? {})) {
    const [m, a] = split(key);
    if (m !== materia) continue;
    const r = get(a);
    r.correct += s.correct;
    r.attempts += s.attempts;
  }
  return [...rows.values()].sort((a, b) => b.attempts - a.attempts || a.name.localeCompare(b.name));
}

export const pct = (r: StatRow) => (r.attempts ? Math.round((r.correct / r.attempts) * 100) : 0);

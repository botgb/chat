import { dueQuestionIds, Progress } from './gamification';
import { ExamPack, Question } from './types';

export const LESSON_SIZE = 5;

export type LessonMode = 'pratica' | 'revisao' | 'simulado';

export type LessonFilter = {
  vestibular: string;
  subjects: string[]; // vazio = todas
};

export function filterQuestions(packs: ExamPack[], filter: LessonFilter): Question[] {
  return packs
    .filter((p) => p.vestibular === filter.vestibular)
    .flatMap((p) => p.questions)
    .filter((q) => q.answer !== null)
    .filter((q) => filter.subjects.length === 0 || filter.subjects.includes(q.subject));
}

/**
 * Monta uma lição: revisões vencidas primeiro (no máx. 2 na prática), depois questões
 * inéditas priorizando a matéria com menor taxa de acerto.
 */
export function buildLesson(
  pool: Question[],
  progress: Progress,
  today: string,
  mode: LessonMode,
  size = LESSON_SIZE,
): Question[] {
  const byId = new Map(pool.map((q) => [q.id, q]));
  const due = dueQuestionIds(progress, today)
    .map((id) => byId.get(id))
    .filter((q): q is Question => !!q);

  if (mode === 'revisao') return due.slice(0, size);

  const unseen = pool.filter((q) => !progress.questions[q.id]);
  if (mode === 'simulado') return unseen.slice(0, size);

  const rate = (s: string) => {
    const st = progress.subjectStats[s];
    return st && st.attempts > 0 ? st.correct / st.attempts : 0.5;
  };
  const ranked = [...unseen].sort((a, b) => rate(a.subject) - rate(b.subject) || a.number - b.number);

  const reviews = due.slice(0, Math.min(2, size));
  const fresh = ranked.filter((q) => !reviews.includes(q)).slice(0, size - reviews.length);
  const lesson = [...reviews, ...fresh];
  if (lesson.length < size) {
    // Sem inéditas suficientes: completa com qualquer questão já vista.
    const rest = pool.filter((q) => !lesson.includes(q));
    lesson.push(...rest.slice(0, size - lesson.length));
  }
  return lesson;
}

export type TrailUnit = { subject: string; total: number; done: number };

/** Trilha: uma unidade por matéria, com progresso de questões já respondidas. */
export function buildTrail(pool: Question[], progress: Progress): TrailUnit[] {
  const units = new Map<string, TrailUnit>();
  for (const q of pool) {
    const u = units.get(q.subject) ?? { subject: q.subject, total: 0, done: 0 };
    u.total += 1;
    if (progress.questions[q.id]) u.done += 1;
    units.set(q.subject, u);
  }
  return [...units.values()].sort((a, b) => a.subject.localeCompare(b.subject, 'pt-BR'));
}

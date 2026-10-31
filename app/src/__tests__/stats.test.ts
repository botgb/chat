import { backfillTopics, initialProgress, recordAnswer } from '../lib/gamification';
import { assuntoRows, materiaRows, pct } from '../lib/stats';

const qs = [
  { id: 'a', materia: 'História', assunto: 'Brasil Colônia' },
  { id: 'b', materia: 'História', assunto: 'Idade Média' },
  { id: 'c', materia: 'Física', assunto: 'Óptica' },
];
const now = new Date(2026, 9, 31, 12);
const answer = (p: ReturnType<typeof initialProgress>, id: string, correct: boolean) => {
  const q = qs.find((x) => x.id === id)!;
  return recordAnswer(p, { questionId: id, subject: 'x', materia: q.materia, assunto: q.assunto, correct, inTime: true, useHearts: false }, now).progress;
};

describe('acertos por matéria e assunto', () => {
  it('conta acertos/feitos por matéria e por assunto, incluindo assuntos não praticados', () => {
    let p = initialProgress(0);
    p = answer(p, 'a', true);
    p = answer(p, 'a', false);
    p = answer(p, 'c', true);
    const m = materiaRows(p, qs);
    expect(m.map((r) => [r.name, r.correct, r.attempts])).toEqual([['História', 1, 2], ['Física', 1, 1]]);
    const a = assuntoRows(p, qs, 'História');
    expect(a.map((r) => [r.name, r.correct, r.attempts])).toEqual([['Brasil Colônia', 1, 2], ['Idade Média', 0, 0]]);
    expect(pct(a[0])).toBe(50);
  });

  it('conta o histórico de antes do motor de assuntos uma única vez', () => {
    const old = { ...initialProgress(0), topicsBackfilled: false, questions: { a: { box: 0, dueDay: '2026-11-01', attempts: 3, correct: 2 } } };
    const p = backfillTopics(old, qs);
    expect(p.topicStats['História|Brasil Colônia']).toEqual({ attempts: 3, correct: 2 });
    expect(backfillTopics(p, qs)).toBe(p);
    // sem pacotes com assunto, espera a próxima oportunidade
    expect(backfillTopics(old, [{ id: 'a' }])).toBe(old);
  });
});

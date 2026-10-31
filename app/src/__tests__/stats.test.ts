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

import { shouldShowPromo } from '../lib/plus';

describe('frequência do vídeo do Plus', () => {
  it('nunca no primeiro dia, a cada 2 lições e no máximo 3 por dia', () => {
    expect([1, 2, 3, 4].map((n) => shouldShowPromo(1, n))).toEqual([false, false, false, false]);
    expect([1, 2, 3, 4, 5, 6, 7, 8].map((n) => shouldShowPromo(3, n))).toEqual([false, true, false, true, false, true, false, false]);
  });
});

import { isSource, splitSources } from '../lib/sources';

describe('fontes das questões', () => {
  it('reconhece referências e deixa o texto e o comando no enunciado', () => {
    expect(isSource('FURTADO, C. Formação econômica do Brasil. São Paulo: Cia. Editora Nacional, 1997 (adaptado).')).toBe(true);
    expect(isSource('CONNOR, S. Disponível em: www.independent.co.uk. Acesso em: 14 ago. 2012 (adaptado).')).toBe(true);
    expect(isSource('As redes de alta tensão para transmissão de energia elétrica geram campo magnético.')).toBe(false);
    const { body, sources } = splitSources([
      { type: 'text', text: 'Texto base da questão.' },
      { type: 'text', text: 'SILVA, F. L. Descartes. São Paulo: Moderna, 2001 (adaptado).' },
      { type: 'text', text: 'Fragmento.' },
    ]);
    expect(sources).toEqual(['SILVA, F. L. Descartes. São Paulo: Moderna, 2001 (adaptado).']);
    expect(body.map((b) => (b.type === 'text' ? b.text : ''))).toEqual(['Texto base da questão.', 'Fragmento.']);
  });
});

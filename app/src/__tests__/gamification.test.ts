import {
  addDays,
  completeLesson,
  DIAMONDS_PER_STAR,
  HEART_REFILL_COST,
  refillHearts,
  currentHearts,
  dueQuestionIds,
  HEART_REFILL_MS,
  initialProgress,
  MAX_HEARTS,
  Progress,
  recordAnswer,
  visibleStreak,
  XP_CORRECT,
  XP_IN_TIME_BONUS,
} from '../lib/gamification';
import { buildLesson, buildTrail, filterQuestions } from '../lib/lesson';
import { buildMap, recordLevel, starsFor } from '../lib/levels';
import { CHEST_ID, CHEST_REWARD, claim, dailyMissions, missionStatus } from '../lib/missions';
import { ExamPack, Question } from '../lib/types';

const at = (day: string, hour = 12) => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d, hour);
};

const answer = (p: Progress, id: string, correct: boolean, day: string, extra: Partial<{ inTime: boolean; useHearts: boolean; subject: string }> = {}) =>
  recordAnswer(p, { questionId: id, subject: extra.subject ?? 'Matemática', correct, inTime: extra.inTime ?? true, useHearts: extra.useHearts ?? true }, at(day));

function goal(p: Progress, day: string): Progress {
  for (let i = 0; i < p.dailyGoal; i++) p = answer(p, `${day}-${i}`, true, day).progress;
  return p;
}

describe('XP', () => {
  it('dá bônus por responder dentro do tempo', () => {
    const p = initialProgress(0);
    expect(answer(p, 'q', true, '2026-01-01').xpGained).toBe(XP_CORRECT + XP_IN_TIME_BONUS);
    expect(answer(p, 'q', true, '2026-01-01', { inTime: false }).xpGained).toBe(XP_CORRECT);
    expect(answer(p, 'q', false, '2026-01-01').xpGained).toBe(0);
  });
});

describe('ofensiva', () => {
  it('conta dias seguidos com meta cumprida', () => {
    let p = goal(initialProgress(0), '2026-01-01');
    expect(p.streak).toBe(1);
    p = goal(p, '2026-01-02');
    expect(p.streak).toBe(2);
  });

  it('não conta duas vezes no mesmo dia', () => {
    let p = goal(initialProgress(0), '2026-01-01');
    p = answer(p, 'extra', true, '2026-01-01').progress;
    expect(p.streak).toBe(1);
  });

  it('usa congelamento para salvar um dia perdido', () => {
    let p = goal(initialProgress(0), '2026-01-01');
    expect(visibleStreak(p, '2026-01-03')).toBe(1);
    p = goal(p, '2026-01-03');
    expect(p.streak).toBe(2);
    expect(p.freezes).toBe(0);
  });

  it('zera depois de dias perdidos sem congelamento', () => {
    let p = goal({ ...initialProgress(0), freezes: 0 }, '2026-01-01');
    expect(visibleStreak(p, '2026-01-03')).toBe(0);
    p = goal(p, '2026-01-03');
    expect(p.streak).toBe(1);
  });
});

describe('vidas', () => {
  it('perde vida ao errar e regenera com o tempo', () => {
    let p = initialProgress(0);
    p = answer(p, 'q', false, '2026-01-01').progress;
    const t = at('2026-01-01').getTime();
    expect(currentHearts(p, t)).toBe(MAX_HEARTS - 1);
    expect(currentHearts(p, t + HEART_REFILL_MS)).toBe(MAX_HEARTS);
  });

  it('não gasta vida fora do modo prática', () => {
    const p = answer(initialProgress(0), 'q', false, '2026-01-01', { useHearts: false }).progress;
    expect(p.hearts).toBe(MAX_HEARTS);
  });
});

describe('revisão espaçada', () => {
  it('erro volta amanhã e acertos espaçam a revisão', () => {
    let p = answer(initialProgress(0), 'q', false, '2026-01-01').progress;
    expect(p.questions.q.dueDay).toBe('2026-01-02');
    expect(dueQuestionIds(p, '2026-01-02')).toEqual(['q']);
    p = answer(p, 'q', true, '2026-01-02').progress;
    expect(p.questions.q.dueDay).toBe(addDays('2026-01-02', 1));
    p = answer(p, 'q', true, '2026-01-03').progress;
    expect(p.questions.q.dueDay).toBe(addDays('2026-01-03', 3));
  });
});

const q = (id: string, subject: string, n: number, answer: string | null = 'A'): Question => ({
  id,
  number: n,
  subject,
  statement: [{ type: 'text', text: id }],
  alternatives: ['A', 'B', 'C', 'D', 'E'].map((letter) => ({ letter, text: letter })),
  answer,
});

const pack: ExamPack = {
  id: 'x',
  vestibular: 'enem',
  title: 'Teste',
  year: 2026,
  version: 1,
  questions: [q('m1', 'Matemática', 1), q('m2', 'Matemática', 2), q('b1', 'Biologia', 3), q('b2', 'Biologia', 4), q('anulada', 'Biologia', 5, null)],
};

describe('lições', () => {
  it('filtra por vestibular e matéria e ignora anuladas', () => {
    expect(filterQuestions([pack], { vestibular: 'enem', subjects: ['Biologia'] }).map((x) => x.id)).toEqual(['b1', 'b2']);
    expect(filterQuestions([pack], { vestibular: 'fuvest', subjects: [] })).toEqual([]);
  });

  it('prioriza revisões vencidas e a matéria mais fraca', () => {
    let p = answer(initialProgress(0), 'm1', false, '2026-01-01', { subject: 'Matemática' }).progress;
    p = answer(p, 'b1', true, '2026-01-01', { subject: 'Biologia' }).progress;
    const pool = filterQuestions([pack], { vestibular: 'enem', subjects: [] });
    const lesson = buildLesson(pool, p, '2026-01-02', 'pratica', 3).map((x) => x.id);
    // Revisões vencidas primeiro (m1 errada, b1 acertada uma vez); depois a matéria mais fraca.
    expect(lesson).toEqual(['m1', 'b1', 'm2']);
  });

  it('monta a trilha por matéria', () => {
    const p = answer(initialProgress(0), 'm1', true, '2026-01-01').progress;
    const trail = buildTrail(filterQuestions([pack], { vestibular: 'enem', subjects: [] }), p);
    expect(trail).toEqual([
      { subject: 'Biologia', total: 2, done: 0 },
      { subject: 'Matemática', total: 2, done: 1 },
    ]);
  });
});

describe('mapa de fases', () => {
  const many: Question[] = Array.from({ length: 12 }, (_, i) => q(`mat-q${i + 1}`, 'Matemática', i + 1));

  it('divide a matéria em fases de 5 e libera só a primeira', () => {
    const [unit] = buildMap(many, 'enem', {});
    expect(unit.levels.map((l) => l.questionIds.length)).toEqual([5, 5, 2]);
    expect(unit.levels.map((l) => l.unlocked)).toEqual([true, false, false]);
    expect(unit.levels[0].current).toBe(true);
    // Ordem numérica estável: q2 vem antes de q10.
    expect(unit.levels[0].questionIds[1]).toBe('mat-q2');
  });

  it('dá estrelas pelo acerto e libera a próxima fase com pelo menos 1 estrela', () => {
    expect([5, 4, 3, 2].map((c) => starsFor(c, 5))).toEqual([3, 2, 1, 0]);
    const id = buildMap(many, 'enem', {})[0].levels[0].id;
    let r = recordLevel({}, id, 2, 5);
    expect(buildMap(many, 'enem', r.results)[0].levels[1].unlocked).toBe(false);
    r = recordLevel(r.results, id, 4, 5);
    const unit = buildMap(many, 'enem', r.results)[0];
    expect(unit.levels[0].stars).toBe(2);
    expect(unit.levels[1].unlocked).toBe(true);
    expect(unit.levels[1].current).toBe(true);
    // Repetir com resultado pior não tira estrelas.
    r = recordLevel(r.results, id, 1, 5);
    expect(r.results[id].stars).toBe(2);
  });
});

describe('missões e diamantes', () => {
  const day = '2026-03-10';

  it('sorteia 3 missões diferentes e iguais para o mesmo dia', () => {
    const a = dailyMissions(day);
    expect(a).toHaveLength(3);
    expect(new Set(a.map((m) => m.kind)).size).toBe(3);
    expect(dailyMissions(day)).toEqual(a);
  });

  it('só resgata missão concluída, uma vez, e libera o baú no fim', () => {
    let p: Progress = initialProgress(0);
    const [m0] = dailyMissions(day);
    expect(claim(p, day, m0.id)).toBeNull();
    // Enche todos os contadores do dia.
    p = { ...p, daily: { [day]: { answered: 99, correct: 99, inTime: 99, reviews: 99, levels: 99, stars: 99, xp: 999 } } };
    let total = 0;
    for (const { mission } of missionStatus(p, day).missions) {
      expect(missionStatus(p, day).chestReady).toBe(false);
      p = claim(p, day, mission.id)!;
      total += mission.reward;
      expect(claim(p, day, mission.id)).toBeNull();
    }
    p = claim(p, day, CHEST_ID)!;
    expect(p.diamonds).toBe(total + CHEST_REWARD);
    expect(missionStatus(p, day).chestClaimed).toBe(true);
  });

  it('dá diamantes por estrela nova e gasta para recarregar vidas', () => {
    let p = completeLesson(initialProgress(0), at(day), { newStars: 3, passed: true });
    expect(p.diamonds).toBe(3 * DIAMONDS_PER_STAR);
    expect(p.daily[day].levels).toBe(1);
    p = { ...p, diamonds: HEART_REFILL_COST, hearts: 1, heartsUpdatedAt: at(day).getTime() };
    const r = refillHearts(p, at(day).getTime())!;
    expect(r.hearts).toBe(MAX_HEARTS);
    expect(r.diamonds).toBe(0);
    expect(refillHearts(r, at(day).getTime())).toBeNull();
  });
});

// Regras do jogo: funções puras, sem I/O, para serem testadas isoladamente.
// Estratégias e fontes em docs/estrategias.md.
import type { LevelResult } from './levels';

export const MAX_HEARTS = 5;
export const HEART_REFILL_MS = 30 * 60 * 1000; // 1 vida a cada 30 min
export const XP_CORRECT = 10;
export const XP_IN_TIME_BONUS = 5;
export const XP_LESSON_COMPLETE = 5;
export const DIAMONDS_PER_STAR = 2;
export const HEART_REFILL_COST = 50; // diamantes para encher as vidas

// Intervalos (em dias) das caixas de Leitner.
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30];

export type QuestionStat = {
  box: number; // índice em REVIEW_INTERVALS_DAYS; -1 = nunca acertou após erro
  dueDay: string; // YYYY-MM-DD
  attempts: number;
  correct: number;
};

/** Contadores do dia, usados pelas missões e pelos recordes. */
export type DailyStats = {
  answered: number;
  correct: number;
  inTime: number; // acertos dentro do tempo da prova
  reviews: number; // respostas no modo revisão
  levels: number; // fases concluídas
  stars: number; // estrelas novas conquistadas
  xp: number;
};

export const emptyDaily = (): DailyStats => ({ answered: 0, correct: 0, inTime: 0, reviews: 0, levels: 0, stars: 0, xp: 0 });

export type Progress = {
  xp: number;
  diamonds: number;
  bestStreak: number;
  daily: Record<string, DailyStats>;
  claimed: Record<string, string[]>; // missões resgatadas por dia
  dailyGoal: number; // questões por dia
  streak: number;
  lastStreakDay: string | null; // último dia em que a meta foi cumprida
  freezes: number; // "congelamentos" que salvam a ofensiva por 1 dia
  dayCounts: Record<string, number>; // questões respondidas por dia
  hearts: number;
  heartsUpdatedAt: number;
  questions: Record<string, QuestionStat>;
  subjectStats: Record<string, { attempts: number; correct: number }>;
  levels: Record<string, LevelResult>;
};

export function initialProgress(now: number): Progress {
  return {
    xp: 0,
    diamonds: 0,
    bestStreak: 0,
    daily: {},
    claimed: {},
    dailyGoal: 10,
    streak: 0,
    lastStreakDay: null,
    freezes: 1,
    dayCounts: {},
    hearts: MAX_HEARTS,
    heartsUpdatedAt: now,
    questions: {},
    subjectStats: {},
    levels: {},
  };
}

export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/** Vidas regeneram com o tempo. */
export function currentHearts(p: Progress, now: number): number {
  if (p.hearts >= MAX_HEARTS) return MAX_HEARTS;
  const gained = Math.floor((now - p.heartsUpdatedAt) / HEART_REFILL_MS);
  return Math.min(MAX_HEARTS, p.hearts + gained);
}

/**
 * Ofensiva exibida hoje: zera se o aluno pulou dias além dos congelamentos disponíveis.
 * Não altera o estado; o consumo de congelamentos acontece em recordAnswer.
 */
export function visibleStreak(p: Progress, today: string): number {
  if (!p.lastStreakDay) return 0;
  const gap = daysBetween(p.lastStreakDay, today);
  return gap - 1 <= p.freezes ? p.streak : 0;
}

export type AnswerInput = {
  questionId: string;
  subject: string;
  correct: boolean;
  inTime: boolean;
  useHearts: boolean;
  review?: boolean;
};

export type AnswerResult = { progress: Progress; xpGained: number; goalJustMet: boolean };

export function recordAnswer(p: Progress, input: AnswerInput, now: Date): AnswerResult {
  const today = dayKey(now);
  const ts = now.getTime();
  let xpGained = 0;
  if (input.correct) xpGained += XP_CORRECT + (input.inTime ? XP_IN_TIME_BONUS : 0);

  // Leitner: acerto sobe uma caixa, erro volta ao início (revisar amanhã).
  const prev = p.questions[input.questionId];
  let box: number;
  if (input.correct) box = Math.min((prev?.box ?? -1) + 1, REVIEW_INTERVALS_DAYS.length - 1);
  else box = -1;
  const interval = box < 0 ? 1 : REVIEW_INTERVALS_DAYS[box];
  const stat: QuestionStat = {
    box,
    dueDay: addDays(today, interval),
    attempts: (prev?.attempts ?? 0) + 1,
    correct: (prev?.correct ?? 0) + (input.correct ? 1 : 0),
  };

  const subj = p.subjectStats[input.subject] ?? { attempts: 0, correct: 0 };

  let hearts = currentHearts(p, ts);
  // Mantém a fração de tempo já acumulada para a próxima vida.
  let heartsUpdatedAt =
    hearts >= MAX_HEARTS ? ts : p.heartsUpdatedAt + (hearts - p.hearts) * HEART_REFILL_MS;
  if (input.useHearts && !input.correct && hearts > 0) {
    if (hearts === MAX_HEARTS) heartsUpdatedAt = ts;
    hearts -= 1;
  }

  const countToday = (p.dayCounts[today] ?? 0) + 1;
  const goalJustMet = countToday === p.dailyGoal;

  let { streak, lastStreakDay, freezes } = p;
  if (goalJustMet && lastStreakDay !== today) {
    const gap = lastStreakDay ? daysBetween(lastStreakDay, today) : Infinity;
    const missed = gap - 1;
    if (gap === 1) streak += 1;
    else if (missed > 0 && missed <= freezes) {
      freezes -= missed;
      streak += 1;
    } else streak = 1;
    lastStreakDay = today;
    // Ganha um congelamento a cada 7 dias de ofensiva (máx. 2).
    if (streak % 7 === 0) freezes = Math.min(2, freezes + 1);
  }

  const d = p.daily[today] ?? emptyDaily();
  const daily: DailyStats = {
    ...d,
    answered: d.answered + 1,
    correct: d.correct + (input.correct ? 1 : 0),
    inTime: d.inTime + (input.correct && input.inTime ? 1 : 0),
    reviews: d.reviews + (input.review ? 1 : 0),
    xp: d.xp + xpGained,
  };

  return {
    xpGained,
    goalJustMet,
    progress: {
      ...p,
      xp: p.xp + xpGained,
      bestStreak: Math.max(p.bestStreak, streak),
      daily: { ...p.daily, [today]: daily },
      streak,
      lastStreakDay,
      freezes,
      hearts,
      heartsUpdatedAt,
      dayCounts: { ...p.dayCounts, [today]: countToday },
      questions: { ...p.questions, [input.questionId]: stat },
      subjectStats: {
        ...p.subjectStats,
        [input.subject]: {
          attempts: subj.attempts + 1,
          correct: subj.correct + (input.correct ? 1 : 0),
        },
      },
    },
  };
}

/** Fim de lição: XP de conclusão e, em fases do mapa, diamantes pelas estrelas novas. */
export function completeLesson(p: Progress, now: Date, level?: { newStars: number; passed: boolean }): Progress {
  const today = dayKey(now);
  const d = p.daily[today] ?? emptyDaily();
  const newStars = level?.newStars ?? 0;
  return {
    ...p,
    xp: p.xp + XP_LESSON_COMPLETE,
    diamonds: p.diamonds + newStars * DIAMONDS_PER_STAR,
    daily: {
      ...p.daily,
      [today]: {
        ...d,
        xp: d.xp + XP_LESSON_COMPLETE,
        levels: d.levels + (level?.passed ? 1 : 0),
        stars: d.stars + newStars,
      },
    },
  };
}

export function refillHearts(p: Progress, now: number): Progress | null {
  if (p.diamonds < HEART_REFILL_COST || currentHearts(p, now) >= MAX_HEARTS) return null;
  return { ...p, diamonds: p.diamonds - HEART_REFILL_COST, hearts: MAX_HEARTS, heartsUpdatedAt: now };
}

/** XP de cada um dos últimos `n` dias, do mais antigo para hoje. */
export function xpHistory(p: Progress, today: string, n: number): { day: string; xp: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const day = addDays(today, i - n + 1);
    return { day, xp: p.daily[day]?.xp ?? 0 };
  });
}

export function dueQuestionIds(p: Progress, today: string): string[] {
  return Object.entries(p.questions)
    .filter(([, s]) => s.dueDay <= today)
    .sort((a, b) => a[1].box - b[1].box || a[1].dueDay.localeCompare(b[1].dueDay))
    .map(([id]) => id);
}

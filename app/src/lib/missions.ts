// Missões diárias geradas no próprio aparelho: as mesmas para o dia inteiro, sem servidor.
import type { ArtName } from '../illustrations/data';
import { DailyStats, emptyDaily, Progress } from './gamification';

export type MissionKind = keyof Omit<DailyStats, 'xp'> | 'xp';

export type Mission = {
  id: string;
  kind: MissionKind;
  target: number;
  reward: number; // diamantes
  title: string;
  icon: ArtName;
};

type Template = Omit<Mission, 'id' | 'title'> & { title: (n: number) => string };

const TEMPLATES: Template[] = [
  { kind: 'answered', target: 10, reward: 10, icon: 'prova', title: (n) => `Responda ${n} questões` },
  { kind: 'answered', target: 20, reward: 20, icon: 'prova', title: (n) => `Responda ${n} questões` },
  { kind: 'correct', target: 8, reward: 15, icon: 'missoes', title: (n) => `Acerte ${n} questões` },
  { kind: 'inTime', target: 5, reward: 15, icon: 'cronometro', title: (n) => `Acerte ${n} dentro do tempo da prova` },
  { kind: 'levels', target: 2, reward: 15, icon: 'trilha', title: (n) => `Conclua ${n} fases da trilha` },
  { kind: 'stars', target: 3, reward: 15, icon: 'estrela', title: (n) => `Ganhe ${n} estrelas novas` },
  { kind: 'reviews', target: 3, reward: 10, icon: 'revisar', title: (n) => `Revise ${n} questões que você errou` },
  { kind: 'xp', target: 100, reward: 15, icon: 'raio', title: (n) => `Ganhe ${n} XP` },
];

export const MISSIONS_PER_DAY = 3;
export const CHEST_REWARD = 30; // bônus por completar todas as missões do dia

/** Hash simples e estável da data, para sortear as missões do dia. */
function seed(day: string): number {
  let h = 2166136261;
  for (const c of day) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function dailyMissions(day: string): Mission[] {
  const picked: Template[] = [];
  let s = seed(day);
  while (picked.length < MISSIONS_PER_DAY) {
    s = Math.imul(s ^ (s >>> 15), 2246822507) >>> 0;
    const t = TEMPLATES[s % TEMPLATES.length];
    // Não repete o mesmo tipo de missão no dia.
    if (!picked.some((p) => p.kind === t.kind)) picked.push(t);
  }
  return picked.map((t, i) => ({ ...t, id: `${day}:${i}`, title: t.title(t.target) }));
}

export function missionProgress(m: Mission, stats: DailyStats | undefined): number {
  return Math.min(m.target, (stats ?? emptyDaily())[m.kind]);
}

const CHEST_ID = 'bau';

export type MissionStatus = { mission: Mission; value: number; done: boolean; claimed: boolean };

export function missionStatus(p: Progress, day: string): { missions: MissionStatus[]; chestReady: boolean; chestClaimed: boolean } {
  const claimed = p.claimed[day] ?? [];
  const missions = dailyMissions(day).map((m) => {
    const value = missionProgress(m, p.daily[day]);
    return { mission: m, value, done: value >= m.target, claimed: claimed.includes(m.id) };
  });
  return {
    missions,
    chestReady: missions.every((m) => m.claimed),
    chestClaimed: claimed.includes(CHEST_ID),
  };
}

/** Resgata uma missão concluída (ou o baú, com id "bau"). Devolve null se não puder. */
export function claim(p: Progress, day: string, id: string): Progress | null {
  const status = missionStatus(p, day);
  const already = p.claimed[day] ?? [];
  if (already.includes(id)) return null;
  let reward: number;
  if (id === CHEST_ID) {
    if (!status.chestReady) return null;
    reward = CHEST_REWARD;
  } else {
    const m = status.missions.find((x) => x.mission.id === id);
    if (!m || !m.done) return null;
    reward = m.mission.reward;
  }
  return { ...p, diamonds: p.diamonds + reward, claimed: { ...p.claimed, [day]: [...already, id] } };
}

export { CHEST_ID };

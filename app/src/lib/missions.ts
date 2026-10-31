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

// Cada tipo tem várias versões (fácil, média, difícil): o sorteio do dia escolhe 3 tipos
// diferentes e uma versão de cada, então as missões mudam todo dia.
const T = (kind: MissionKind, icon: ArtName, title: (n: number) => string, levels: [number, number][]): Template[] =>
  levels.map(([target, reward]) => ({ kind, target, reward, icon, title }));

const TEMPLATES: Template[] = [
  ...T('answered', 'prova', (n) => `Responda ${n} questões`, [[5, 5], [10, 10], [15, 15], [20, 20], [30, 30]]),
  ...T('correct', 'missoes', (n) => `Acerte ${n} questões`, [[5, 10], [8, 15], [12, 20], [15, 25]]),
  ...T('inTime', 'cronometro', (n) => `Acerte ${n} dentro do tempo da prova`, [[3, 10], [5, 15], [8, 20]]),
  ...T('levels', 'trilha', (n) => (n === 1 ? 'Conclua 1 fase da trilha' : `Conclua ${n} fases da trilha`), [[1, 10], [2, 15], [3, 20]]),
  ...T('stars', 'estrela', (n) => `Ganhe ${n} estrelas novas`, [[2, 10], [3, 15], [5, 25]]),
  ...T('reviews', 'revisar', (n) => `Revise ${n} questões que você errou`, [[2, 10], [3, 10], [5, 15]]),
  ...T('xp', 'raio', (n) => `Ganhe ${n} XP`, [[50, 10], [100, 15], [150, 20]]),
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

export function missionStatus(p: Progress, day: string): { missions: MissionStatus[]; chestReady: boolean; chestClaimed: boolean; allClaimed: boolean } {
  const claimed = p.claimed[day] ?? [];
  const missions = dailyMissions(day).map((m) => {
    const value = missionProgress(m, p.daily[day]);
    return { mission: m, value, done: value >= m.target, claimed: claimed.includes(m.id) };
  });
  return {
    missions,
    chestReady: missions.every((m) => m.claimed),
    allClaimed: missions.every((m) => m.claimed),
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
  let ids = [...already, id];
  // Ao resgatar a última missão do dia, o baú abre junto.
  if (id !== CHEST_ID && !ids.includes(CHEST_ID) && status.missions.every((m) => ids.includes(m.mission.id))) {
    ids = [...ids, CHEST_ID];
    reward += CHEST_REWARD;
  }
  return { ...p, diamonds: p.diamonds + reward, claimed: { ...p.claimed, [day]: ids } };
}

export { CHEST_ID };

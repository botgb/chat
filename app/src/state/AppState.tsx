import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import * as content from '../lib/content';
import {
  AnswerInput,
  AnswerResult,
  completeLesson,
  dayKey,
  initialProgress,
  Progress,
  openPathChest,
  recordAnswer,
  refillHearts,
} from '../lib/gamification';
import { claim } from '../lib/missions';
import { recordLevel } from '../lib/levels';
import { defaultSettings, mergeSettings, Settings } from '../lib/settings';
import { ExamPack, Manifest } from '../lib/types';

const PROGRESS_KEY = 'progress:v1';
const PREFS_KEY = 'prefs:v1';
const SETTINGS_KEY = 'settings:v1';

/** examId null = todas as provas baixadas do vestibular. */
export type Prefs = { vestibular: string | null; examId: string | null; subjects: string[] };

type AppState = {
  ready: boolean;
  progress: Progress;
  prefs: Prefs;
  manifest: Manifest | null;
  offline: boolean;
  packs: ExamPack[];
  installed: Record<string, number>;
  answer: (input: AnswerInput) => AnswerResult;
  /** Conclui a lição; se for uma fase do mapa, devolve as estrelas ganhas. */
  finishLesson: (level?: { id: string; correct: number; total: number }) => number;
  claimMission: (id: string) => boolean;
  buyHeartRefill: () => boolean;
  openChest: (id: string) => boolean;
  setPrefs: (prefs: Prefs) => void;
  setDailyGoal: (goal: number) => void;
  refreshManifest: () => Promise<void>;
  install: (examId: string) => Promise<void>;
  uninstall: (examId: string) => Promise<void>;
  settings: Settings;
  updateSettings: (next: Settings) => void;
  /** "Sair da conta": apaga os dados de perfil deste aparelho, mantendo o progresso. */
  signOut: () => void;
  /** "Excluir conta": apaga tudo do aparelho (progresso, provas, perfil e configurações). */
  deleteEverything: () => Promise<void>;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<Progress>(() => initialProgress(Date.now()));
  const [prefs, setPrefsState] = useState<Prefs>({ vestibular: null, examId: null, subjects: [] });
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [offline, setOffline] = useState(false);
  const [packs, setPacks] = useState<ExamPack[]>([]);
  const [installed, setInstalled] = useState<Record<string, number>>({});
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const refreshManifest = useCallback(async () => {
    const r = await content.loadManifest();
    setManifest(r.manifest);
    setOffline(r.offline);
  }, []);

  const reloadPacks = useCallback(async () => {
    setPacks(await content.loadInstalledPacks());
    setInstalled(await content.getInstalledVersions());
  }, []);

  useEffect(() => {
    (async () => {
      const [p, pr, st] = await Promise.all([
        AsyncStorage.getItem(PROGRESS_KEY),
        AsyncStorage.getItem(PREFS_KEY),
        AsyncStorage.getItem(SETTINGS_KEY),
      ]);
      setSettings(mergeSettings(st ? JSON.parse(st) : null));
      if (p) setProgress({ ...initialProgress(Date.now()), ...JSON.parse(p) });
      if (pr) setPrefsState({ vestibular: null, examId: null, subjects: [], ...JSON.parse(pr) });
      await reloadPacks();
      setReady(true);
      await refreshManifest();
    })();
  }, [refreshManifest, reloadPacks]);

  const save = useCallback((next: Progress) => {
    setProgress(next);
    AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  }, []);

  const answer = useCallback(
    (input: AnswerInput) => {
      const result = recordAnswer(progress, input, new Date());
      save(result.progress);
      return result;
    },
    [progress, save],
  );

  const value: AppState = {
    ready,
    progress,
    prefs,
    manifest,
    offline,
    packs,
    installed,
    answer,
    finishLesson: (level) => {
      const now = new Date();
      if (!level) {
        save(completeLesson(progress, now));
        return 0;
      }
      const r = recordLevel(progress.levels, level.id, level.correct, level.total);
      save(completeLesson({ ...progress, levels: r.results }, now, { newStars: r.newStars, passed: r.stars > 0 }));
      return r.stars;
    },
    claimMission: (id) => {
      const next = claim(progress, dayKey(new Date()), id);
      if (next) save(next);
      return !!next;
    },
    openChest: (id) => {
      const next = openPathChest(progress, id);
      if (next) save(next);
      return !!next;
    },
    buyHeartRefill: () => {
      const next = refillHearts(progress, Date.now());
      if (next) save(next);
      return !!next;
    },
    setPrefs: (next) => {
      setPrefsState(next);
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
    },
    setDailyGoal: (goal) => save({ ...progress, dailyGoal: goal }),
    refreshManifest,
    install: async (examId) => {
      const exam = manifest?.exams.find((e) => e.id === examId);
      if (!exam) throw new Error(`Prova ${examId} não está no manifest`);
      await content.installPack(exam.packUrl);
      await reloadPacks();
    },
    uninstall: async (examId) => {
      await content.removePack(examId);
      await reloadPacks();
    },
    settings,
    updateSettings: (next) => {
      setSettings(next);
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    },
    signOut: () => {
      const next = { ...settings, profile: defaultSettings().profile };
      setSettings(next);
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    },
    deleteEverything: async () => {
      for (const id of Object.keys(installed)) await content.removePack(id);
      await AsyncStorage.clear();
      setProgress(initialProgress(Date.now()));
      setPrefsState({ vestibular: null, examId: null, subjects: [] });
      setSettings(defaultSettings());
      await reloadPacks();
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp fora do AppStateProvider');
  return v;
}

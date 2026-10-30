import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import * as content from '../lib/content';
import {
  AnswerInput,
  AnswerResult,
  completeLesson,
  initialProgress,
  Progress,
  recordAnswer,
} from '../lib/gamification';
import { ExamPack, Manifest } from '../lib/types';

const PROGRESS_KEY = 'progress:v1';
const PREFS_KEY = 'prefs:v1';

export type Prefs = { vestibular: string | null; subjects: string[] };

type AppState = {
  ready: boolean;
  progress: Progress;
  prefs: Prefs;
  manifest: Manifest | null;
  offline: boolean;
  packs: ExamPack[];
  installed: Record<string, number>;
  answer: (input: AnswerInput) => AnswerResult;
  finishLesson: () => void;
  setPrefs: (prefs: Prefs) => void;
  setDailyGoal: (goal: number) => void;
  refreshManifest: () => Promise<void>;
  install: (examId: string) => Promise<void>;
  uninstall: (examId: string) => Promise<void>;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<Progress>(() => initialProgress(Date.now()));
  const [prefs, setPrefsState] = useState<Prefs>({ vestibular: null, subjects: [] });
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [offline, setOffline] = useState(false);
  const [packs, setPacks] = useState<ExamPack[]>([]);
  const [installed, setInstalled] = useState<Record<string, number>>({});

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
      const [p, pr] = await Promise.all([
        AsyncStorage.getItem(PROGRESS_KEY),
        AsyncStorage.getItem(PREFS_KEY),
      ]);
      if (p) setProgress({ ...initialProgress(Date.now()), ...JSON.parse(p) });
      if (pr) setPrefsState(JSON.parse(pr));
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
    finishLesson: () => save(completeLesson(progress)),
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
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp fora do AppStateProvider');
  return v;
}

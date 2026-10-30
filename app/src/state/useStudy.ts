import { useMemo } from 'react';
import { filterQuestions } from '../lib/lesson';
import { buildMap } from '../lib/levels';
import { Vestibular } from '../lib/types';
import { useApp } from './AppState';

/** Vestibular escolhido, matérias filtradas e o mapa de fases correspondente. */
export function useStudy() {
  const app = useApp();
  const { packs, prefs, manifest, progress } = app;

  const vestibulares: Vestibular[] = useMemo(() => {
    const ids = [...new Set(packs.map((p) => p.vestibular))];
    return ids.map(
      (id) => manifest?.vestibulares.find((v) => v.id === id) ?? { id, name: id.toUpperCase(), secondsPerQuestion: 180 },
    );
  }, [packs, manifest]);

  const vestibular =
    prefs.vestibular && vestibulares.some((v) => v.id === prefs.vestibular) ? prefs.vestibular : vestibulares[0]?.id ?? null;

  const all = useMemo(() => (vestibular ? filterQuestions(packs, { vestibular, subjects: [] }) : []), [packs, vestibular]);
  const subjects = useMemo(() => [...new Set(all.map((q) => q.subject))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [all]);
  const pool = useMemo(
    () => all.filter((q) => prefs.subjects.length === 0 || prefs.subjects.includes(q.subject)),
    [all, prefs.subjects],
  );
  const units = useMemo(() => (vestibular ? buildMap(pool, vestibular, progress.levels) : []), [pool, vestibular, progress.levels]);

  const toggleSubject = (s: string) => {
    const next = prefs.subjects.includes(s) ? prefs.subjects.filter((x) => x !== s) : [...prefs.subjects, s];
    app.setPrefs({ vestibular, subjects: next });
  };

  return { vestibulares, vestibular, subjects, pool, units, toggleSubject };
}

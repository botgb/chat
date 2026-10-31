import { useMemo } from 'react';
import { filterQuestions } from '../lib/lesson';
import { buildMap } from '../lib/levels';
import { ExamPack, Vestibular } from '../lib/types';
import { useApp } from './AppState';

/** Vestibular e prova escolhidos, matérias filtradas e o mapa de fases correspondente. */
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
  const exams: ExamPack[] = useMemo(
    () => packs.filter((p) => p.vestibular === vestibular).sort((a, b) => b.year - a.year || a.title.localeCompare(b.title)),
    [packs, vestibular],
  );
  const examId = prefs.examId && exams.some((e) => e.id === prefs.examId) ? prefs.examId : null;

  const all = useMemo(
    () => (vestibular ? filterQuestions(packs, { vestibular, examId, subjects: [] }) : []),
    [packs, vestibular, examId],
  );
  const subjects = useMemo(() => [...new Set(all.map((q) => q.subject))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [all]);
  const activeSubjects = useMemo(() => prefs.subjects.filter((s) => subjects.includes(s)), [prefs.subjects, subjects]);
  const pool = useMemo(
    () => all.filter((q) => activeSubjects.length === 0 || activeSubjects.includes(q.subject)),
    [all, activeSubjects],
  );
  // As fases de uma prova específica são diferentes das de "todas as provas".
  const scope = examId ?? vestibular ?? '';
  const units = useMemo(() => (vestibular ? buildMap(pool, scope, progress.levels) : []), [pool, scope, vestibular, progress.levels]);

  const vestibularInfo = vestibulares.find((v) => v.id === vestibular);
  const exam = exams.find((e) => e.id === examId);
  const examLabel = exam ? exam.title : vestibularInfo ? `${vestibularInfo.name}: todas` : '';

  const selectExam = (v: string, id: string | null) => app.setPrefs({ vestibular: v, examId: id, subjects: prefs.subjects });
  const setSubjects = (s: string[]) => app.setPrefs({ vestibular, examId, subjects: s });
  const toggleSubject = (s: string) =>
    setSubjects(activeSubjects.includes(s) ? activeSubjects.filter((x) => x !== s) : [...activeSubjects, s]);

  return {
    vestibulares,
    vestibular,
    vestibularInfo,
    exams,
    examId,
    examLabel,
    subjects,
    activeSubjects,
    pool,
    units,
    selectExam,
    setSubjects,
    toggleSubject,
  };
}

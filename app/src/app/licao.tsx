import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, ScrollViewInstance, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { QuestionView } from '../components/QuestionView';
import { Timer, useCountdown } from '../components/Timer';
import { currentHearts, dayKey, XP_LESSON_COMPLETE } from '../lib/gamification';
import { buildLesson, filterQuestions, LessonMode } from '../lib/lesson';
import { useApp } from '../state/AppState';
import { colors, fonts, space, type } from '../theme';

export default function Licao() {
  const app = useApp();
  const params = useLocalSearchParams<{ mode: LessonMode; vestibular: string; subjects: string }>();
  const mode: LessonMode = params.mode ?? 'pratica';
  const useHearts = mode === 'pratica';

  // A lição é montada uma vez ao abrir a tela.
  const lessonRef = useRef<ReturnType<typeof buildLesson> | null>(null);
  if (!lessonRef.current) {
    const subjects = params.subjects ? params.subjects.split('|').filter(Boolean) : [];
    const pool = filterQuestions(app.packs, { vestibular: params.vestibular, subjects });
    lessonRef.current = buildLesson(pool, app.progress, dayKey(new Date()), mode);
  }
  const lesson = lessonRef.current;

  const seconds = useMemo(() => {
    const v = app.manifest?.vestibulares.find((x) => x.id === params.vestibular);
    return v?.secondsPerQuestion ?? 180;
  }, [app.manifest, params.vestibular]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<{ correct: boolean; xp: number }[]>([]);
  const [finished, setFinished] = useState(false);
  const scroll = useRef<ScrollViewInstance>(null);

  const question = lesson[index];
  const timer = useCountdown(seconds, !revealed && !finished, index);
  const hearts = currentHearts(app.progress, Date.now());
  const outOfHearts = useHearts && hearts === 0 && !revealed;

  const confirm = () => {
    if (!selected || !question) return;
    const correct = selected === question.answer;
    const r = app.answer({ questionId: question.id, subject: question.subject, correct, inTime: timer.inTime, useHearts });
    setResults((rs) => [...rs, { correct, xp: r.xpGained }]);
    setRevealed(true);
  };

  const next = () => {
    if (index + 1 >= lesson.length) {
      app.finishLesson();
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setSelected(null);
    setRevealed(false);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  if (lesson.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Text style={styles.big}>{mode === 'revisao' ? 'Nenhuma revisão pendente' : 'Sem questões para estes filtros'}</Text>
          <Button label="Voltar ao início" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  if (finished) {
    const right = results.filter((r) => r.correct).length;
    const xp = results.reduce((s, r) => s + r.xp, 0) + XP_LESSON_COMPLETE;
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Text style={styles.big}>
            {right} de {results.length} certas
          </Text>
          <Text style={[styles.xp]}>+{xp} XP</Text>
          <Text style={styles.muted}>
            {right === results.length
              ? 'Lição perfeita.'
              : 'As questões erradas voltam amanhã na revisão.'}
          </Text>
          <Button label="Continuar" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  if (outOfHearts) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Text style={styles.big}>Suas vidas acabaram</Text>
          <Text style={styles.muted}>Elas voltam com o tempo (1 a cada 30 min). Enquanto isso, revise seus erros: a revisão não gasta vidas.</Text>
          <Button label="Voltar ao início" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const exam = app.packs.find((p) => p.questions.some((q) => q.id === question.id));
  const correct = selected === question.answer;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Sair da lição" hitSlop={12}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${((index + (revealed ? 1 : 0)) / lesson.length) * 100}%` }]} />
        </View>
        {useHearts && <Text style={styles.hearts}>♥ {hearts}</Text>}
        <Timer remaining={timer.remaining} total={seconds} />
      </View>

      <ScrollView ref={scroll} contentContainerStyle={{ padding: space(5), paddingBottom: space(8), gap: space(4) }}>
        <Text style={styles.source}>
          {exam?.title ?? ''}, questão {question.number}. {question.subject}
        </Text>
        <QuestionView question={question} selected={selected} revealed={revealed} onSelect={setSelected} />
      </ScrollView>

      <View style={[styles.footer, revealed && { backgroundColor: correct ? colors.rightBg : colors.wrongBg }]}>
        {revealed && (
          <Text style={[styles.feedback, { color: correct ? colors.right : colors.wrong }]}>
            {correct ? (timer.inTime ? 'Certa, e dentro do tempo.' : 'Certa.') : `Resposta: ${question.answer}`}
          </Text>
        )}
        {revealed ? <Button label="Continuar" onPress={next} /> : <Button label="Confirmar" onPress={confirm} disabled={!selected} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sheet },
  center: { flex: 1, justifyContent: 'center', padding: space(6), gap: space(4) },
  big: { fontFamily: fonts.display, fontSize: type.title + 6, color: colors.ink },
  xp: { fontFamily: fonts.display, fontSize: type.hero, color: colors.ink, backgroundColor: colors.highlight, alignSelf: 'flex-start', paddingHorizontal: 4 },
  muted: { fontFamily: fonts.body, fontSize: type.body, color: colors.inkSoft, lineHeight: type.body * 1.4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingHorizontal: space(5), paddingVertical: space(3) },
  close: { fontSize: type.lead, color: colors.inkSoft },
  progressTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.sheetLine, overflow: 'hidden' },
  progressBar: { height: 10, backgroundColor: colors.sheetInk },
  hearts: { fontFamily: fonts.bodyBold, fontSize: type.body, color: colors.wrong },
  source: { fontFamily: fonts.bodyBold, fontSize: type.small, color: colors.sheetInk },
  footer: { padding: space(5), gap: space(3), borderTopWidth: 1, borderTopColor: colors.sheetLine, backgroundColor: colors.sheet },
  feedback: { fontFamily: fonts.displayMedium, fontSize: type.lead },
});

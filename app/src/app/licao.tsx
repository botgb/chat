import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, ScrollViewInstance, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { PromoPlayer } from '../components/PromoPlayer';
import { Sheet } from '../components/Sheet';
import { QuestionView } from '../components/QuestionView';
import { Timer, useCountdown } from '../components/Timer';
import { Art } from '../illustrations/Art';
import { currentHearts, dayKey, HEART_REFILL_COST, XP_LESSON_COMPLETE } from '../lib/gamification';
import { buildLesson, filterQuestions, LessonMode } from '../lib/lesson';
import { Question } from '../lib/types';
import { hasPlus } from '../lib/plus';
import { feedback, TEXT_SCALE, TEXT_SIZES } from '../lib/settings';
import { useApp } from '../state/AppState';
import { Colors, fonts, space, type } from '../theme';
import { useColors, useStyles } from '../theme/ThemeContext';

type Params = { mode: LessonMode; vestibular: string; exam?: string; level?: string; ids?: string };

function BigStars({ count }: { count: number }) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const anims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  useEffect(() => {
    Animated.stagger(
      220,
      anims.map((a) => Animated.spring(a, { toValue: 1, friction: 4, useNativeDriver: true })),
    ).start();
  }, [anims]);
  return (
    <View style={styles.bigStars} accessibilityLabel={`${count} de 3 estrelas`}>
      {anims.map((a, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.bigStar,
            { color: i < count ? colors.gold : colors.locked, transform: [{ scale: a }, { translateY: i === 1 ? -14 : 0 }] },
          ]}
        >
          ★
        </Animated.Text>
      ))}
    </View>
  );
}

export default function Licao() {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const app = useApp();
  const params = useLocalSearchParams<Params>();
  const mode: LessonMode = params.mode ?? 'pratica';
  const useHearts = mode === 'pratica';

  // A lição é montada uma vez ao abrir a tela: a fase do mapa ou a revisão do dia.
  const lessonRef = useRef<Question[] | null>(null);
  if (!lessonRef.current) {
    const pool = filterQuestions(app.packs, { vestibular: params.vestibular, examId: params.exam || null, subjects: [] });
    if (params.ids) {
      const byId = new Map(pool.map((q) => [q.id, q]));
      lessonRef.current = params.ids.split('|').map((id) => byId.get(id)).filter((q): q is Question => !!q);
    } else {
      lessonRef.current = buildLesson(pool, app.progress, dayKey(new Date()), mode);
    }
  }
  const lesson = lessonRef.current;

  const seconds = useMemo(
    () => app.manifest?.vestibulares.find((x) => x.id === params.vestibular)?.secondsPerQuestion ?? 180,
    [app.manifest, params.vestibular],
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<{ correct: boolean; xp: number }[]>([]);
  const [finished, setFinished] = useState<{ stars: number } | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [promo, setPromo] = useState(false);
  const scroll = useRef<ScrollViewInstance>(null);

  const question = lesson[index];
  const timer = useCountdown(seconds, !revealed && !finished, index);
  const hearts = currentHearts(app.progress, Date.now());
  const outOfHearts = useHearts && hearts === 0 && !revealed && !finished;

  const confirm = () => {
    if (!selected || !question) return;
    const correct = selected === question.answer;
    const r = app.answer({ questionId: question.id, subject: question.subject, materia: question.materia, assunto: question.assunto, correct, inTime: timer.inTime, useHearts, review: mode === 'revisao' });
    setResults((rs) => [...rs, { correct, xp: r.xpGained }]);
    feedback(app.settings, correct ? 'right' : 'wrong');
    setRevealed(true);
  };

  const next = () => {
    if (index + 1 >= lesson.length) {
      const correct = results.filter((r) => r.correct).length;
      const stars = app.finishLesson(params.level ? { id: params.level, correct, total: lesson.length } : undefined);
      setFinished({ stars });
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
          <Text style={styles.big}>{mode === 'revisao' ? 'Nenhuma revisão pendente' : 'Sem questões nesta fase'}</Text>
          <Button label="Voltar" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  if (finished) {
    const right = results.filter((r) => r.correct).length;
    const xp = results.reduce((s, r) => s + r.xp, 0) + XP_LESSON_COMPLETE;
    const passed = !params.level || finished.stars > 0;
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          {params.level ? <BigStars count={finished.stars} /> : <View style={{ alignItems: 'center' }}>
              <Art name="revisar" size={88} />
            </View>}
          <Text style={[styles.big, { textAlign: 'center' }]}>
            {params.level ? (passed ? 'Fase concluída!' : 'Quase lá') : 'Revisão concluída!'}
          </Text>
          <View style={styles.summary}>
            <View style={[styles.summaryBox, { borderColor: colors.right }]}>
              <Text style={[styles.summaryLabel, { backgroundColor: colors.btnSuccess }]}>Acertos</Text>
              <Text style={[styles.summaryValue, { color: colors.rightDark }]}>
                {right}/{results.length}
              </Text>
            </View>
            <View style={[styles.summaryBox, { borderColor: colors.gold }]}>
              <Text style={[styles.summaryLabel, { backgroundColor: colors.gold, color: '#3D2C00' }]}>XP</Text>
              <Text style={[styles.summaryValue, { color: colors.goldDark }]}>+{xp}</Text>
            </View>
          </View>
          <Text style={[styles.muted, { textAlign: 'center' }]}>
            {passed
              ? right === results.length
                ? 'Tudo certo nesta fase.'
                : 'As erradas voltam amanhã para revisão.'
              : 'Acerte pelo menos 3 de 5 para liberar a próxima fase.'}
          </Text>
          <Button label="Continuar" variant="success" onPress={() => (hasPlus() ? router.back() : setPromo(true))} />
          <PromoPlayer visible={promo} onClose={() => router.back()} onCta={() => router.replace('/assinatura')} />
        </View>
      </SafeAreaView>
    );
  }

  if (outOfHearts) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <View style={{ alignItems: 'center' }}>
            <Art name="vidas" size={88} opacity={0.4} />
          </View>
          <Text style={styles.big}>Suas vidas acabaram</Text>
          <Text style={styles.muted}>Elas voltam com o tempo, 1 a cada 30 minutos. Revisar seus erros não gasta vidas.</Text>
          <Button
            label={`Recarregar por ${HEART_REFILL_COST} diamantes`}
            disabled={app.progress.diamonds < HEART_REFILL_COST}
            onPress={app.buyHeartRefill}
          />
          <Text style={[styles.muted, { textAlign: 'center' }]}>Você tem {app.progress.diamonds} diamantes</Text>
          <Button label="Voltar" variant="ghost" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const exam = app.packs.find((p) => p.questions.some((q) => q.id === question.id));
  const correct = selected === question.answer;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          // Sair no meio pede confirmação: a fase não é concluída e não ganha estrelas.
          onPress={() => (results.length > 0 || selected ? setConfirmExit(true) : router.back())}
          accessibilityRole="button"
          accessibilityLabel="Sair da lição"
          hitSlop={12}
        >
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${((index + (revealed ? 1 : 0)) / lesson.length) * 100}%` }]} />
        </View>
        <Pressable
          onPress={() => {
            const next = TEXT_SIZES[(TEXT_SIZES.indexOf(app.settings.textSize) + 1) % TEXT_SIZES.length];
            app.updateSettings({ ...app.settings, textSize: next });
          }}
          accessibilityRole="button"
          accessibilityLabel={`Tamanho do texto: ${app.settings.textSize}. Tocar para mudar`}
          hitSlop={8}
          style={styles.textSizeBtn}
        >
          <Text style={styles.textSizeSmall}>A</Text>
          <Text style={styles.textSizeBig}>A</Text>
        </Pressable>
        {useHearts && (
          <View style={styles.heartsRow}>
            <Art name="vidas" size={26} />
            <Text style={styles.hearts}>{hearts}</Text>
          </View>
        )}
      </View>

      <ScrollView ref={scroll} contentContainerStyle={{ padding: space(5), paddingBottom: space(8), gap: space(4) }}>
        <View style={styles.metaRow}>
          <Text style={styles.source}>
            {question.subject}
            {exam ? `, ${exam.title}, questão ${question.number}` : ''}
          </Text>
          <Timer remaining={timer.remaining} total={seconds} />
        </View>
        <QuestionView question={question} selected={selected} revealed={revealed} onSelect={setSelected} scale={TEXT_SCALE[app.settings.textSize]} />
        {exam?.source ? <Text style={styles.credit}>{exam.source}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, revealed && { backgroundColor: correct ? colors.rightBg : colors.wrongBg, borderTopColor: 'transparent' }]}>
        {revealed && (
          <View style={{ gap: 2 }}>
            <Text style={[styles.feedback, { color: correct ? colors.rightDark : colors.wrongDark }]}>
              {correct ? (timer.inTime ? 'Mandou bem, e no tempo!' : 'Correta!') : 'Resposta correta:'}
            </Text>
            {!correct && <Text style={[styles.feedbackSub, { color: colors.wrongDark }]}>Alternativa {question.answer}</Text>}
          </View>
        )}
        {revealed ? (
          <Button label="Continuar" variant={correct ? 'success' : 'danger'} onPress={next} />
        ) : (
          <Button label="Verificar" variant="success" onPress={confirm} disabled={!selected} />
        )}
      </View>
      <Sheet visible={confirmExit} title="Sair da fase?" onClose={() => setConfirmExit(false)}>
        <Text style={styles.muted}>As respostas já dadas ficam salvas, mas a fase não é concluída e não ganha estrelas.</Text>
        <Button label="Continuar estudando" variant="success" onPress={() => setConfirmExit(false)} />
        <Button label="Sair" variant="ghost" onPress={() => router.back()} />
      </Sheet>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', padding: space(6), gap: space(5) },
  big: { fontFamily: fonts.display, fontSize: type.title + 6, color: colors.ink },
  muted: { fontFamily: fonts.body, fontSize: type.body, color: colors.inkSoft, lineHeight: type.body * 1.4 },
  bigStars: { flexDirection: 'row', justifyContent: 'center', gap: space(2) },
  bigStar: { fontSize: 72 },
  summary: { flexDirection: 'row', gap: space(3) },
  summaryBox: { flex: 1, borderWidth: 2, borderRadius: 16, overflow: 'hidden', alignItems: 'center' },
  summaryLabel: { alignSelf: 'stretch', textAlign: 'center', fontFamily: fonts.display, fontSize: type.small + 1, color: colors.onColor, paddingVertical: space(1) },
  summaryValue: { fontFamily: fonts.display, fontSize: type.title, paddingVertical: space(3) },
  header: { flexDirection: 'row', alignItems: 'center', gap: space(4), paddingHorizontal: space(5), paddingVertical: space(3) },
  close: { fontSize: type.title, color: colors.lockedDark, fontFamily: fonts.display },
  progressTrack: { flex: 1, height: 16, borderRadius: 8, backgroundColor: colors.surface, overflow: 'hidden' },
  progressBar: { height: 16, borderRadius: 8, backgroundColor: colors.right },
  textSizeBtn: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: space(2), paddingVertical: space(1), borderRadius: 10, borderWidth: 2, borderColor: colors.line },
  textSizeSmall: { fontFamily: fonts.display, fontSize: 14, color: colors.inkSoft },
  textSizeBig: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  heartsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hearts: { fontFamily: fonts.display, fontSize: type.lead, color: colors.heart },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: space(3) },
  credit: { fontFamily: fonts.body, fontSize: type.small - 1, color: colors.inkSoft, marginTop: space(2) },
  source: { flex: 1, fontFamily: fonts.displayMedium, fontSize: type.small + 1, color: colors.primary },
  footer: { padding: space(5), gap: space(4), borderTopWidth: 2, borderTopColor: colors.line, backgroundColor: colors.bg },
  feedback: { fontFamily: fonts.display, fontSize: type.title - 2 },
  feedbackSub: { fontFamily: fonts.displayMedium, fontSize: type.body },
});

import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { LevelMap } from '../../components/LevelMap';
import { TopBar } from '../../components/TopBar';
import { dayKey, dueQuestionIds } from '../../lib/gamification';
import { useApp } from '../../state/AppState';
import { useStudy } from '../../state/useStudy';
import { colors, fonts, space, type } from '../../theme';

export default function Trilha() {
  const app = useApp();
  const study = useStudy();
  const { progress } = app;
  const today = dayKey(new Date());
  const doneToday = progress.dayCounts[today] ?? 0;
  const goalPct = Math.min(1, doneToday / progress.dailyGoal);
  const poolIds = new Set(study.pool.map((q) => q.id));
  const due = dueQuestionIds(progress, today).filter((id) => poolIds.has(id)).length;

  if (!app.ready) return null;

  if (app.packs.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.hero}>Escolha uma prova para começar</Text>
          <Text style={styles.lead}>Baixe as provas que você vai prestar. Depois de baixadas, funcionam sem internet.</Text>
          <Button label="Ver provas" onPress={() => router.push('/provas')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar />
      <ScrollView contentContainerStyle={{ paddingBottom: space(12) }}>
        <View style={styles.cards}>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>Meta de hoje</Text>
              <Text style={[styles.cardTitle, { color: colors.streak }]}>
                {Math.min(doneToday, progress.dailyGoal)}/{progress.dailyGoal}
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${goalPct * 100}%` }]} />
            </View>
          </View>

          {due > 0 && (
            <Pressable
              style={[styles.card, styles.review]}
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: '/licao', params: { mode: 'revisao', vestibular: study.vestibular ?? '', exam: study.examId ?? '' } })
              }
            >
              <Text style={styles.reviewIcon}>🔁</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Revisar {due} {due === 1 ? 'erro' : 'erros'}</Text>
                <Text style={styles.muted}>Não gasta vidas</Text>
              </View>
              <Text style={styles.go}>›</Text>
            </Pressable>
          )}
        </View>

        <View style={{ paddingHorizontal: space(4), paddingTop: space(6) }}>
          <LevelMap
            units={study.units}
            onPlay={(l) =>
              router.push({
                pathname: '/licao',
                params: { mode: 'pratica', vestibular: study.vestibular ?? '', level: l.id, ids: l.questionIds.join('|') },
              })
            }
          />
        </View>
        {app.offline && <Text style={styles.offline}>Sem internet: usando as provas já baixadas.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  empty: { flex: 1, justifyContent: 'center', padding: space(6), gap: space(4) },
  emptyEmoji: { fontSize: 64 },
  hero: { fontFamily: fonts.display, fontSize: type.hero, lineHeight: type.hero * 1.1, color: colors.ink },
  lead: { fontFamily: fonts.body, fontSize: type.lead - 2, lineHeight: (type.lead - 2) * 1.4, color: colors.inkSoft },
  cards: { paddingHorizontal: space(4), paddingTop: space(4), gap: space(3) },
  card: { padding: space(4), borderRadius: 16, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.line, gap: space(2) },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontFamily: fonts.display, fontSize: type.body, color: colors.ink },
  muted: { fontFamily: fonts.body, fontSize: type.small, color: colors.inkSoft },
  track: { height: 14, borderRadius: 7, backgroundColor: colors.surface, overflow: 'hidden' },
  fill: { height: 14, borderRadius: 7, backgroundColor: colors.streak },
  review: { flexDirection: 'row', alignItems: 'center', gap: space(3), borderColor: colors.right, backgroundColor: colors.rightBg },
  reviewIcon: { fontSize: 28 },
  go: { fontFamily: fonts.display, fontSize: 32, color: colors.rightDark },
  offline: { fontFamily: fonts.body, fontSize: type.small, color: colors.inkSoft, textAlign: 'center', marginTop: space(4) },
});

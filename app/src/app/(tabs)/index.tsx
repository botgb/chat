import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { LevelMap } from '../../components/LevelMap';
import { TopBar } from '../../components/TopBar';
import { dayKey } from '../../lib/gamification';
import { useApp } from '../../state/AppState';
import { useStudy } from '../../state/useStudy';
import { colors, fonts, space, type } from '../../theme';

export default function Trilha() {
  const app = useApp();
  const study = useStudy();
  const { progress, prefs } = app;
  const doneToday = progress.dayCounts[dayKey(new Date())] ?? 0;
  const goalPct = Math.min(1, doneToday / progress.dailyGoal);
  const vestName = study.vestibulares.find((v) => v.id === study.vestibular)?.name;

  if (!app.ready) return null;

  if (app.packs.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <TopBar />
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
      <TopBar left={<Text style={styles.vest}>{vestName}</Text>} />
      <ScrollView contentContainerStyle={{ paddingBottom: space(12) }}>
        <View style={styles.goal}>
          <View style={styles.goalRow}>
            <Text style={styles.goalTitle}>Meta de hoje</Text>
            <Text style={styles.goalCount}>
              {Math.min(doneToday, progress.dailyGoal)}/{progress.dailyGoal}
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${goalPct * 100}%` }]} />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="Todas" active={prefs.subjects.length === 0} onPress={() => app.setPrefs({ vestibular: study.vestibular, subjects: [] })} />
          {study.subjects.map((s) => (
            <Chip key={s} label={s} active={prefs.subjects.includes(s)} onPress={() => study.toggleSubject(s)} />
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: space(4), paddingTop: space(6) }}>
          <LevelMap
            units={study.units}
            onPlay={(l) =>
              router.push({ pathname: '/licao', params: { mode: 'pratica', vestibular: study.vestibular ?? '', level: l.id, ids: l.questionIds.join('|') } })
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
  vest: { fontFamily: fonts.display, fontSize: type.lead, color: colors.ink },
  goal: { margin: space(4), marginBottom: 0, padding: space(4), borderRadius: 16, borderWidth: 2, borderColor: colors.line, gap: space(2) },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  goalTitle: { fontFamily: fonts.display, fontSize: type.body, color: colors.ink },
  goalCount: { fontFamily: fonts.display, fontSize: type.body, color: colors.streak },
  track: { height: 14, borderRadius: 7, backgroundColor: colors.surface, overflow: 'hidden' },
  fill: { height: 14, borderRadius: 7, backgroundColor: colors.streak },
  chips: { gap: space(2), paddingHorizontal: space(4), paddingTop: space(4) },
  offline: { fontFamily: fonts.body, fontSize: type.small, color: colors.inkSoft, textAlign: 'center', marginTop: space(4) },
});

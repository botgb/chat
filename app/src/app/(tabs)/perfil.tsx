import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { TopBar } from '../../components/TopBar';
import { Art, ArtName } from '../../illustrations/Art';
import { dayKey, visibleStreak } from '../../lib/gamification';
import { useApp } from '../../state/AppState';
import { useStudy } from '../../state/useStudy';
import { colors, fonts, space, type } from '../../theme';

const GOALS = [
  { n: 5, label: 'Leve' },
  { n: 10, label: 'Regular' },
  { n: 20, label: 'Intenso' },
];

function Stat({ icon, value, label }: { icon: ArtName; value: string | number; label: string }) {
  return (
    <View style={styles.stat}>
      <Art name={icon} size={36} />
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.muted}>{label}</Text>
      </View>
    </View>
  );
}

export default function Perfil() {
  const app = useApp();
  const study = useStudy();
  const { progress } = app;
  const totalStars = Object.values(progress.levels).reduce((s, l) => s + l.stars, 0);
  const answered = Object.values(progress.subjectStats).reduce((s, x) => s + x.attempts, 0);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar />
      <ScrollView contentContainerStyle={{ padding: space(4), gap: space(6), paddingBottom: space(12) }}>
        <View style={styles.grid}>
          <Stat icon="ofensiva" value={visibleStreak(progress, dayKey(new Date()))} label="dias seguidos" />
          <Stat icon="raio" value={progress.xp} label="XP total" />
          <Stat icon="estrela" value={totalStars} label="estrelas" />
          <Stat icon="prova" value={answered} label="questões feitas" />
        </View>

        <View style={{ gap: space(3) }}>
          <Text style={styles.section}>Meta diária</Text>
          <View style={styles.wrap}>
            {GOALS.map((g) => (
              <Chip key={g.n} label={`${g.label}: ${g.n} questões`} active={progress.dailyGoal === g.n} onPress={() => app.setDailyGoal(g.n)} />
            ))}
          </View>
        </View>

        <Button label="Gerenciar provas baixadas" variant="ghost" onPress={() => router.push('/provas')} />

        <View style={{ gap: space(3) }}>
          <Text style={styles.section}>Acerto por matéria</Text>
          {study.subjects.map((s) => {
            const st = progress.subjectStats[s];
            const pct = st && st.attempts ? st.correct / st.attempts : 0;
            return (
              <View key={s} style={{ gap: space(1) }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.subject}>{s}</Text>
                  <Text style={styles.muted}>{st?.attempts ? `${Math.round(pct * 100)}% de ${st.attempts}` : 'sem respostas'}</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${pct * 100}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(3) },
  stat: { flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: space(3), padding: space(3), borderRadius: 16, borderWidth: 2, borderColor: colors.line },
  statValue: { fontFamily: fonts.display, fontSize: type.lead, color: colors.ink },
  section: { fontFamily: fonts.display, fontSize: type.lead, color: colors.ink },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  subject: { fontFamily: fonts.displayMedium, fontSize: type.body, color: colors.ink },
  muted: { fontFamily: fonts.body, fontSize: type.small, color: colors.inkSoft },
  track: { height: 12, borderRadius: 6, backgroundColor: colors.surface, overflow: 'hidden' },
  fill: { height: 12, borderRadius: 6, backgroundColor: colors.right },
});

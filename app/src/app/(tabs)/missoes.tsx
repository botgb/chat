import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar';
import { Art } from '../../illustrations/Art';
import { dayKey } from '../../lib/gamification';
import { CHEST_ID, CHEST_REWARD, missionStatus } from '../../lib/missions';
import { useApp } from '../../state/AppState';
import { Colors, fonts, space, type } from '../../theme';
import { useColors, useStyles } from '../../theme/ThemeContext';

function hoursLeft(): number {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.max(1, Math.ceil((end.getTime() - now.getTime()) / 3_600_000));
}

export default function Missoes() {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const app = useApp();
  const day = dayKey(new Date());
  const status = missionStatus(app.progress, day);
  const goal = app.progress.dailyGoal;
  const doneToday = Math.min(goal, app.progress.dayCounts[day] ?? 0);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar />
      <ScrollView contentContainerStyle={{ padding: space(4), gap: space(4), paddingBottom: space(12) }}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Missões do dia</Text>
          <Text style={styles.heroSub}>Novas missões em {hoursLeft()} h</Text>
        </View>

        <View style={[styles.card, styles.goalCard]}>
          <Art name="ofensiva" size={40} />
          <View style={{ flex: 1, gap: space(2) }}>
            <Text style={styles.title}>Meta diária: {goal} questões</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(doneToday / goal) * 100}%`, backgroundColor: colors.streak }]} />
              <Text style={styles.trackText}>
                {doneToday} / {goal}
              </Text>
            </View>
            <Text style={styles.muted}>{doneToday >= goal ? 'Cumprida! A ofensiva de hoje está garantida.' : 'Cumpra para manter a ofensiva.'}</Text>
          </View>
        </View>

        {status.missions.map(({ mission, value, done, claimed }) => (
          <View key={mission.id} style={styles.card}>
            <Art name={mission.icon} size={40} />
            <View style={{ flex: 1, gap: space(2) }}>
              <Text style={styles.title}>{mission.title}</Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${(value / mission.target) * 100}%` }, done && { backgroundColor: colors.right }]} />
                <Text style={styles.trackText}>
                  {value} / {mission.target}
                </Text>
              </View>
            </View>
            {claimed ? (
              <Text style={styles.claimed}>✓</Text>
            ) : (
              <Pressable
                disabled={!done}
                onPress={() => app.claimMission(mission.id)}
                accessibilityRole="button"
                accessibilityLabel={done ? `Resgatar ${mission.reward} diamantes` : `Recompensa: ${mission.reward} diamantes`}
                style={[styles.reward, done && styles.rewardReady]}
              >
                <View style={styles.rewardRow}>
                  <Text style={[styles.rewardText, done && { color: colors.onColor }]}>{mission.reward}</Text>
                  <Art name="diamantes" size={18} />
                </View>
              </Pressable>
            )}
          </View>
        ))}

        <View style={[styles.card, styles.chest]}>
          <Art name="bau" size={40} opacity={status.chestClaimed ? 0.4 : 1} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Baú do dia</Text>
            <Text style={styles.muted}>
              {status.chestClaimed ? 'Resgatado. Volte amanhã!' : `Resgate as 3 missões para abrir: +${CHEST_REWARD} diamantes`}
            </Text>
          </View>
          {!status.chestClaimed && (
            <Pressable
              disabled={!status.chestReady}
              onPress={() => app.claimMission(CHEST_ID)}
              accessibilityRole="button"
              style={[styles.reward, status.chestReady && styles.rewardReady]}
            >
              <Text style={[styles.rewardText, status.chestReady && { color: colors.onColor }]}>Abrir</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { backgroundColor: '#9B5CFF', borderRadius: 18, borderBottomWidth: 6, borderBottomColor: '#7438DB', padding: space(5), gap: space(1) },
  heroTitle: { fontFamily: fonts.display, fontSize: type.title, color: colors.onColor },
  heroSub: { fontFamily: fonts.ui, fontSize: type.body - 1, color: 'rgba(255,255,255,0.9)' },
  card: { flexDirection: 'row', alignItems: 'center', gap: space(3), padding: space(4), borderRadius: 16, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.line },
  chest: { borderColor: colors.gold, backgroundColor: colors.goldBg },
  goalCard: { borderColor: colors.streak, backgroundColor: colors.streakBg },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  title: { fontFamily: fonts.displayMedium, fontSize: type.body, color: colors.ink },
  muted: { fontFamily: fonts.body, fontSize: type.small, color: colors.inkSoft },
  track: { height: 20, borderRadius: 10, backgroundColor: colors.surface, overflow: 'hidden', justifyContent: 'center' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 10, backgroundColor: colors.gold },
  trackText: { fontFamily: fonts.display, fontSize: type.small, color: colors.ink, textAlign: 'center' },
  reward: { paddingHorizontal: space(3), paddingVertical: space(2), borderRadius: 12, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.line },
  rewardReady: { backgroundColor: colors.right, borderColor: colors.right, borderBottomColor: colors.rightDark },
  rewardText: { fontFamily: fonts.display, fontSize: type.body - 1, color: colors.inkSoft },
  claimed: { fontFamily: fonts.display, fontSize: type.title, color: colors.right, paddingHorizontal: space(2) },
});

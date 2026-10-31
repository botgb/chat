import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { TopBar } from '../../components/TopBar';
import { Art, ArtName } from '../../illustrations/Art';
import { dayKey, visibleStreak } from '../../lib/gamification';
import { useApp } from '../../state/AppState';
import { Colors, fonts, radius, space, type } from '../../theme';
import { useStyles } from '../../theme/ThemeContext';

const GOALS = [
  { n: 5, label: 'Leve' },
  { n: 10, label: 'Regular' },
  { n: 20, label: 'Intenso' },
];

function Stat({ icon, value, label }: { icon: ArtName; value: string | number; label: string }) {
  const styles = useStyles(createStyles);
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
  const styles = useStyles(createStyles);
  const app = useApp();
  const { progress } = app;
  const totalStars = Object.values(progress.levels).reduce((s, l) => s + l.stars, 0);
  const answered = Object.values(progress.questions).reduce((s, x) => s + x.attempts, 0);
  const profile = app.settings.profile;
  const fullName = `${profile.nome} ${profile.sobrenome}`.trim();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar />
      <View style={styles.header}>
        <Art name="perfil" size={52} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {fullName || 'Seu perfil'}
          </Text>
          <Text style={styles.muted} numberOfLines={1}>
            {profile.usuario ? `@${profile.usuario}` : 'Complete seus dados nas configurações'}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/configuracoes')}
          accessibilityRole="button"
          accessibilityLabel="Configurações"
          hitSlop={8}
          style={({ pressed }) => [styles.gear, pressed && { opacity: 0.6 }]}
        >
          <Art name="configuracoes" size={34} />
        </Pressable>
      </View>
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

      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingHorizontal: space(4), paddingTop: space(4) },
  name: { fontFamily: fonts.display, fontSize: type.title, color: colors.ink },
  gear: { padding: space(1) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(3) },
  stat: { flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: space(3), padding: space(3), backgroundColor: colors.card, borderRadius: radius.card, borderCurve: 'continuous', boxShadow: colors.cardShadow },
  statValue: { fontFamily: fonts.display, fontSize: type.lead, color: colors.ink },
  section: { fontFamily: fonts.display, fontSize: type.lead, color: colors.ink },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  muted: { fontFamily: fonts.body, fontSize: type.small, color: colors.inkSoft },
});

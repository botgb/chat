import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { TopBar } from '../../components/TopBar';
import { dayKey, dueQuestionIds } from '../../lib/gamification';
import { useApp } from '../../state/AppState';
import { useStudy } from '../../state/useStudy';
import { colors, fonts, space, type } from '../../theme';

export default function Revisar() {
  const { progress } = useApp();
  const study = useStudy();
  const ids = new Set(study.pool.map((q) => q.id));
  const due = dueQuestionIds(progress, dayKey(new Date())).filter((id) => ids.has(id));
  const wrongTotal = Object.entries(progress.questions).filter(([id, s]) => ids.has(id) && s.box < 0).length;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar />
      <View style={styles.body}>
        <Text style={styles.emoji}>{due.length ? '🔁' : '✅'}</Text>
        <Text style={styles.title}>{due.length ? `${due.length} questões para revisar` : 'Tudo revisado por hoje'}</Text>
        <Text style={styles.lead}>
          Questões que você errou voltam no dia seguinte. A cada acerto, a próxima revisão fica mais distante:
          1, 3, 7, 14 e 30 dias. Revisar não gasta vidas.
        </Text>
        {wrongTotal > 0 && <Text style={styles.lead}>Questões ainda não acertadas: {wrongTotal}</Text>}
        <Button
          label={due.length ? 'Revisar agora' : 'Nada para revisar'}
          variant="success"
          disabled={!due.length}
          onPress={() => router.push({ pathname: '/licao', params: { mode: 'revisao', vestibular: study.vestibular ?? '' } })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, justifyContent: 'center', padding: space(6), gap: space(4) },
  emoji: { fontSize: 64 },
  title: { fontFamily: fonts.display, fontSize: type.title + 4, color: colors.ink },
  lead: { fontFamily: fonts.body, fontSize: type.body, lineHeight: type.body * 1.45, color: colors.inkSoft },
});

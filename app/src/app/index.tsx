import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BubbleRow } from '../components/Bubble';
import { Button } from '../components/Button';
import { currentHearts, dayKey, dueQuestionIds, MAX_HEARTS, visibleStreak } from '../lib/gamification';
import { buildTrail, filterQuestions } from '../lib/lesson';
import { useApp } from '../state/AppState';
import { colors, fonts, space, type } from '../theme';

const GOALS = [5, 10, 20];

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: active }}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && { color: colors.paper }]}>{label}</Text>
    </Pressable>
  );
}

export default function Home() {
  const app = useApp();
  const { progress, prefs, packs } = app;
  const today = dayKey(new Date());

  const vestibulares = useMemo(() => {
    const ids = [...new Set(packs.map((p) => p.vestibular))];
    return ids.map((id) => app.manifest?.vestibulares.find((v) => v.id === id) ?? { id, name: id.toUpperCase(), secondsPerQuestion: 180 });
  }, [packs, app.manifest]);

  const vestibular = prefs.vestibular && vestibulares.some((v) => v.id === prefs.vestibular) ? prefs.vestibular : vestibulares[0]?.id ?? null;
  const allOfVestibular = useMemo(
    () => (vestibular ? filterQuestions(packs, { vestibular, subjects: [] }) : []),
    [packs, vestibular],
  );
  const subjects = useMemo(() => [...new Set(allOfVestibular.map((q) => q.subject))].sort(), [allOfVestibular]);
  const pool = allOfVestibular.filter((q) => prefs.subjects.length === 0 || prefs.subjects.includes(q.subject));
  const trail = buildTrail(pool, progress);
  const poolIds = new Set(pool.map((q) => q.id));
  const dueCount = dueQuestionIds(progress, today).filter((id) => poolIds.has(id)).length;
  const doneToday = progress.dayCounts[today] ?? 0;
  const hearts = currentHearts(progress, Date.now());
  const streak = visibleStreak(progress, today);

  const toggleSubject = (s: string) => {
    const next = prefs.subjects.includes(s) ? prefs.subjects.filter((x) => x !== s) : [...prefs.subjects, s];
    app.setPrefs({ ...prefs, vestibular, subjects: next });
  };

  const startLesson = (mode: string, subject?: string) =>
    router.push({
      pathname: '/licao',
      params: { mode, vestibular: vestibular ?? '', subjects: (subject ? [subject] : prefs.subjects).join('|') },
    });

  if (!app.ready) return null;

  if (packs.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={[styles.pad, { flex: 1, justifyContent: 'center', gap: space(5) }]}>
          <Text style={styles.hero}>Escolha uma prova para começar</Text>
          <Text style={styles.lead}>
            Baixe as provas que você vai prestar. Depois de baixadas, elas funcionam sem internet.
          </Text>
          <Button label="Ver provas disponíveis" onPress={() => router.push('/provas')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.pad, { gap: space(6), paddingBottom: space(10) }]}>
        <View style={styles.stats}>
          <Stat value={streak} label={streak === 1 ? 'dia seguido' : 'dias seguidos'} highlight={streak > 0} />
          <Stat value={progress.xp} label="XP" />
          <Stat value={`${hearts}/${MAX_HEARTS}`} label="vidas" />
        </View>

        <View style={{ gap: space(2) }}>
          <View style={styles.rowBetween}>
            <Text style={styles.section}>Meta de hoje</Text>
            <View style={{ flexDirection: 'row', gap: space(1) }}>
              {GOALS.map((g) => (
                <Chip key={g} label={String(g)} active={progress.dailyGoal === g} onPress={() => app.setDailyGoal(g)} />
              ))}
            </View>
          </View>
          <BubbleRow total={progress.dailyGoal} filled={Math.min(doneToday, progress.dailyGoal)} size={20} />
          <Text style={styles.muted}>
            {doneToday >= progress.dailyGoal
              ? 'Meta cumprida. A ofensiva de hoje está garantida.'
              : `Faltam ${progress.dailyGoal - doneToday} questões para manter a ofensiva.`}
          </Text>
        </View>

        {vestibulares.length > 1 && (
          <View style={{ gap: space(2) }}>
            <Text style={styles.section}>Vestibular</Text>
            <View style={styles.wrap}>
              {vestibulares.map((v) => (
                <Chip key={v.id} label={v.name} active={v.id === vestibular} onPress={() => app.setPrefs({ vestibular: v.id, subjects: [] })} />
              ))}
            </View>
          </View>
        )}

        <View style={{ gap: space(2) }}>
          <Text style={styles.section}>Matérias</Text>
          <View style={styles.wrap}>
            <Chip label="Todas" active={prefs.subjects.length === 0} onPress={() => app.setPrefs({ vestibular, subjects: [] })} />
            {subjects.map((s) => (
              <Chip key={s} label={s} active={prefs.subjects.includes(s)} onPress={() => toggleSubject(s)} />
            ))}
          </View>
        </View>

        <View style={{ gap: space(3) }}>
          <Button label="Começar lição" onPress={() => startLesson('pratica')} disabled={pool.length === 0} />
          <Button
            label={dueCount > 0 ? `Revisar erros (${dueCount})` : 'Nada para revisar hoje'}
            variant="secondary"
            onPress={() => startLesson('revisao')}
            disabled={dueCount === 0}
          />
        </View>

        <View style={{ gap: space(3) }}>
          <Text style={styles.section}>Sua trilha</Text>
          {trail.map((u) => {
            const st = progress.subjectStats[u.subject];
            const rate = st && st.attempts ? Math.round((st.correct / st.attempts) * 100) : null;
            return (
              <Pressable key={u.subject} style={styles.unit} onPress={() => startLesson('pratica', u.subject)} accessibilityRole="button">
                <View style={styles.rowBetween}>
                  <Text style={styles.unitTitle}>{u.subject}</Text>
                  <Text style={styles.muted}>{rate === null ? 'novo' : `${rate}% de acerto`}</Text>
                </View>
                <BubbleRow total={Math.min(u.total, 30)} filled={Math.round((u.done / u.total) * Math.min(u.total, 30))} size={10} />
                <Text style={styles.muted}>
                  {u.done} de {u.total} questões
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable onPress={() => router.push('/provas')} accessibilityRole="link">
          <Text style={styles.link}>Gerenciar provas baixadas</Text>
        </Pressable>
        {app.offline && <Text style={styles.muted}>Sem internet: usando as provas já baixadas.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label, highlight }: { value: string | number; label: string; highlight?: boolean }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.statValue, highlight && styles.highlight]}>{value}</Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sheet },
  pad: { paddingHorizontal: space(5), paddingTop: space(4) },
  hero: { fontFamily: fonts.display, fontSize: type.hero, lineHeight: type.hero * 1.05, color: colors.ink },
  lead: { fontFamily: fonts.body, fontSize: type.lead, lineHeight: type.lead * 1.4, color: colors.inkSoft },
  stats: { flexDirection: 'row', gap: space(4) },
  statValue: { fontFamily: fonts.display, fontSize: type.title + 6, color: colors.ink, alignSelf: 'flex-start', paddingHorizontal: 2 },
  highlight: { backgroundColor: colors.highlight },
  section: { fontFamily: fonts.displayMedium, fontSize: type.lead, color: colors.sheetInk },
  muted: { fontFamily: fonts.body, fontSize: type.small, color: colors.inkSoft },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  chip: { paddingVertical: space(2), paddingHorizontal: space(3), borderRadius: 999, borderWidth: 1.5, borderColor: colors.ink, backgroundColor: colors.paper },
  chipActive: { backgroundColor: colors.ink },
  chipText: { fontFamily: fonts.bodyBold, fontSize: type.small + 1, color: colors.ink },
  unit: { backgroundColor: colors.paper, borderRadius: 16, padding: space(4), gap: space(2), borderLeftWidth: 6, borderLeftColor: colors.sheetInk },
  unitTitle: { fontFamily: fonts.displayMedium, fontSize: type.lead, color: colors.ink },
  link: { fontFamily: fonts.bodyBold, fontSize: type.body, color: colors.ink, textDecorationLine: 'underline' },
});

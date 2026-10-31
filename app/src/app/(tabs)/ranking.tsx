import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar';
import { Art, ArtName } from '../../illustrations/Art';
import { Chip } from '../../components/Chip';
import { dayKey, xpHistory } from '../../lib/gamification';
import { hasUltra } from '../../lib/plus';
import { assuntoRows, materiaRows, pct, StatRow } from '../../lib/stats';
import { useApp } from '../../state/AppState';
import { Colors, fonts, space, type } from '../../theme';
import { useColors, useStyles } from '../../theme/ThemeContext';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// Ranking pessoal: o aluno compara a própria evolução, sem servidor.
export default function Ranking() {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const { progress, packs } = useApp();
  const questions = useMemo(() => packs.flatMap((p) => p.questions), [packs]);
  const materias = materiaRows(progress, questions);
  const [materia, setMateria] = useState<string | null>(null);
  const selected = materia ?? materias[0]?.name ?? null;
  const ultra = hasUltra();
  const today = dayKey(new Date());
  const week = xpHistory(progress, today, 7);
  const prevWeek = xpHistory(progress, today, 14).slice(0, 7);
  const weekXp = week.reduce((s, d) => s + d.xp, 0);
  const prevXp = prevWeek.reduce((s, d) => s + d.xp, 0);
  const max = Math.max(1, ...week.map((d) => d.xp));
  const bestDay = Math.max(0, ...Object.values(progress.daily).map((d) => d.xp));
  const stars = Object.values(progress.levels).reduce((s, l) => s + l.stars, 0);
  const diff = weekXp - prevXp;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar />
      <ScrollView contentContainerStyle={{ padding: space(4), gap: space(5), paddingBottom: space(12) }}>
        <View style={styles.hero}>
          <Text style={styles.heroSmall}>Seus últimos 7 dias</Text>
          <Text style={styles.heroValue}>{weekXp} XP</Text>
          <Text style={styles.heroSmall}>
            {prevXp === 0 && weekXp === 0
              ? 'Faça uma fase para começar seu histórico.'
              : diff >= 0
                ? `${diff} XP a mais que nos 7 dias anteriores`
                : `${-diff} XP a menos que nos 7 dias anteriores`}
          </Text>
        </View>

        <View style={styles.chart} accessibilityLabel={`XP por dia: ${week.map((d) => d.xp).join(', ')}`}>
          {week.map((d) => {
            const [y, m, dd] = d.day.split('-').map(Number);
            const wd = WEEKDAYS[new Date(y, m - 1, dd).getDay()];
            const isToday = d.day === today;
            return (
              <View key={d.day} style={styles.col}>
                <Text style={styles.colValue}>{d.xp || ''}</Text>
                <View style={styles.colTrack}>
                  <View style={[styles.colFill, { height: `${(d.xp / max) * 100}%` }, isToday && { backgroundColor: colors.streak }]} />
                </View>
                <Text style={[styles.colLabel, isToday && { color: colors.streak }]}>{wd}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.grid}>
          <Record icon="ofensiva" value={`${progress.bestStreak} dias`} label="Maior ofensiva" />
          <Record icon="raio" value={`${bestDay} XP`} label="Melhor dia" />
          <Record icon="ranking" value={`${progress.xp} XP`} label="XP total" />
          <Record icon="estrela" value={stars} label="Estrelas" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acertos por matéria</Text>
          {materias.length === 0 ? (
            <Text style={styles.muted}>Baixe uma prova e responda questões para ver seus acertos por matéria.</Text>
          ) : (
            materias.map((r) => <StatBar key={r.name} row={r} />)
          )}
        </View>

        {materias.length > 0 && selected && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Acertos por assunto</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space(2), paddingVertical: space(1) }}>
              {materias.map((r) => (
                <Chip key={r.name} label={r.name} active={r.name === selected} onPress={() => setMateria(r.name)} />
              ))}
            </ScrollView>
            {ultra ? (
              assuntoRows(progress, questions, selected).map((r) => <StatBar key={r.name} row={r} />)
            ) : (
              <View style={styles.locked}>
                {assuntoRows(progress, questions, selected).slice(0, 4).map((r) => (
                  <View key={r.name} style={styles.lockedRow} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                    <Text style={styles.lockedName} numberOfLines={1}>{r.name}</Text>
                    <View style={styles.lockedBar} />
                  </View>
                ))}
                <View style={styles.lockBox}>
                  <Art name="assinatura" size={36} />
                  <Text style={styles.lockTitle}>Veja onde você mais erra</Text>
                  <Text style={styles.lockText}>Acertos por assunto fazem parte do Ultra.</Text>
                  <Pressable onPress={() => router.push('/assinatura')} accessibilityRole="button" style={styles.lockBtn}>
                    <Text style={styles.lockBtnText}>Conhecer o Ultra</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function StatBar({ row }: { row: StatRow }) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const p = pct(row);
  const color = row.attempts === 0 ? colors.line : p >= 70 ? colors.right : p >= 50 ? colors.gold : colors.wrong;
  return (
    <View style={styles.statRow} accessibilityLabel={`${row.name}: ${row.correct} acertos em ${row.attempts} questões`}>
      <View style={styles.statHead}>
        <Text style={styles.statName} numberOfLines={1}>{row.name}</Text>
        <Text style={styles.statValue}>
          {row.correct}/{row.attempts}
          {row.attempts ? `  ·  ${p}%` : ''}
        </Text>
      </View>
      <View style={styles.statTrack}>
        <View style={[styles.statFill, { width: `${p}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function Record({ icon, value, label }: { icon: ArtName; value: string | number; label: string }) {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.record}>
      <Art name={icon} size={36} />
      <View>
        <Text style={styles.recordValue}>{value}</Text>
        <Text style={styles.muted}>{label}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { backgroundColor: colors.gold, borderRadius: 18, borderBottomWidth: 6, borderBottomColor: colors.goldDark, padding: space(5), gap: space(1) },
  heroSmall: { fontFamily: fonts.ui, fontSize: type.body - 1, color: '#5C4300' },
  heroValue: { fontFamily: fonts.display, fontSize: type.hero, color: '#3D2C00' },
  chart: { flexDirection: 'row', gap: space(2), height: 180, alignItems: 'flex-end' },
  col: { flex: 1, alignItems: 'center', gap: space(1), height: '100%' },
  colValue: { fontFamily: fonts.display, fontSize: type.small - 1, color: colors.inkSoft, height: 16 },
  colTrack: { flex: 1, width: '100%', justifyContent: 'flex-end', backgroundColor: colors.surface, borderRadius: 8, overflow: 'hidden' },
  colFill: { width: '100%', backgroundColor: colors.primary, borderRadius: 8 },
  colLabel: { fontFamily: fonts.display, fontSize: type.small, color: colors.inkSoft },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(3) },
  record: { flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: space(3), padding: space(3), borderRadius: 16, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.line },
  recordValue: { fontFamily: fonts.display, fontSize: type.body + 1, color: colors.ink },
  muted: { fontFamily: fonts.body, fontSize: type.small, color: colors.inkSoft, lineHeight: type.small * 1.4 },
  card: { gap: space(3), padding: space(4), borderRadius: 16, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.line },
  cardTitle: { fontFamily: fonts.display, fontSize: type.lead, color: colors.ink },
  statRow: { gap: space(1) },
  statHead: { flexDirection: 'row', justifyContent: 'space-between', gap: space(2) },
  statName: { flex: 1, fontFamily: fonts.displayMedium, fontSize: type.body - 1, color: colors.ink },
  statValue: { fontFamily: fonts.display, fontSize: type.small, color: colors.inkSoft },
  statTrack: { height: 10, borderRadius: 5, backgroundColor: colors.surface, overflow: 'hidden' },
  statFill: { height: 10, borderRadius: 5 },
  locked: { gap: space(2) },
  lockedRow: { gap: space(1), opacity: 0.35 },
  lockedName: { fontFamily: fonts.displayMedium, fontSize: type.body - 1, color: colors.inkSoft },
  lockedBar: { height: 10, borderRadius: 5, backgroundColor: colors.line, width: '60%' },
  lockBox: { alignItems: 'center', gap: space(1), paddingTop: space(2) },
  lockTitle: { fontFamily: fonts.display, fontSize: type.body, color: colors.ink },
  lockText: { fontFamily: fonts.body, fontSize: type.small, color: colors.inkSoft, textAlign: 'center' },
  lockBtn: { marginTop: space(2), backgroundColor: colors.btnPrimary, borderRadius: 12, borderBottomWidth: 4, borderBottomColor: colors.btnPrimaryEdge, paddingHorizontal: space(5), paddingVertical: space(2) },
  lockBtnText: { fontFamily: fonts.display, fontSize: type.body - 1, color: colors.onColor },
});

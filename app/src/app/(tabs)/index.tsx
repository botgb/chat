import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, ScrollViewInstance, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { LevelMap, unitColor } from '../../components/LevelMap';
import { Sheet } from '../../components/Sheet';
import { TopBar } from '../../components/TopBar';
import { Art } from '../../illustrations/Art';
import { dayKey, dueQuestionIds, PATH_CHEST_DIAMONDS } from '../../lib/gamification';
import { LEVEL_SIZE } from '../../lib/levels';
import { useApp } from '../../state/AppState';
import { useStudy } from '../../state/useStudy';
import { colors, fonts, space, type } from '../../theme';

export default function Trilha() {
  const app = useApp();
  const study = useStudy();
  const { progress } = app;
  const scroll = useRef<ScrollViewInstance>(null);
  const unitTops = useRef<number[]>([]);
  const currentY = useRef<number | null>(null);
  const [unitIndex, setUnitIndex] = useState(0);
  const [showJump, setShowJump] = useState(false);
  const [guide, setGuide] = useState(false);
  const [chestOpened, setChestOpened] = useState(false);

  const poolIds = new Set(study.pool.map((q) => q.id));
  const due = dueQuestionIds(progress, dayKey(new Date())).filter((id) => poolIds.has(id)).length;

  if (!app.ready) return null;

  if (app.packs.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.empty}>
          <Art name="materias" size={80} />
          <Text style={styles.hero}>Escolha uma prova para começar</Text>
          <Text style={styles.lead}>Baixe as provas que você vai prestar. Depois de baixadas, funcionam sem internet.</Text>
          <Button label="Ver provas" onPress={() => router.push('/provas')} />
        </View>
      </SafeAreaView>
    );
  }

  const units = study.units;
  const unit = units[Math.min(unitIndex, units.length - 1)];
  const color = unitColor(Math.min(unitIndex, units.length - 1));
  const unitDone = unit ? unit.levels.filter((l) => l.stars > 0).length : 0;
  const unitStars = unit ? unit.levels.reduce((s, l) => s + l.stars, 0) : 0;
  const st = unit ? progress.subjectStats[unit.subject] : undefined;

  const onScroll = (y: number) => {
    // A faixa mostra a unidade que está passando pelo topo da tela.
    let idx = 0;
    unitTops.current.forEach((top, i) => {
      if (top <= y + 40) idx = i;
    });
    if (idx !== unitIndex) setUnitIndex(idx);
    const cy = currentY.current;
    setShowJump(cy !== null && Math.abs(cy - y - 200) > 400);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar />
      {unit && (
        <View style={styles.bannerWrap}>
          <View style={[styles.banner, { backgroundColor: color.main, borderBottomColor: color.dark }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerSmall}>
                Unidade {unitIndex + 1}, {unitDone} de {unit.levels.length} fases
              </Text>
              <Text style={styles.bannerTitle} numberOfLines={1}>
                {unit.subject}
              </Text>
            </View>
            <View style={[styles.bannerSep, { backgroundColor: color.dark }]} />
            <Pressable onPress={() => setGuide(true)} accessibilityRole="button" accessibilityLabel="Guia da unidade" style={styles.guideBtn}>
              <Art name="guia" size={34} />
            </Pressable>
          </View>
        </View>
      )}

      <ScrollView
        ref={scroll}
        onScroll={(e) => onScroll(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingBottom: space(24) }}
      >
        <LevelMap
          units={units}
          openedChests={progress.chests}
          onUnitLayout={(i, y) => {
            unitTops.current[i] = y;
          }}
          onCurrentLayout={(y) => {
            currentY.current = y;
          }}
          onPlay={(l) =>
            router.push({
              pathname: '/licao',
              params: { mode: 'pratica', vestibular: study.vestibular ?? '', level: l.id, ids: l.questionIds.join('|') },
            })
          }
          onOpenChest={(id) => app.openChest(id) && setChestOpened(true)}
        />
        {app.offline && <Text style={styles.offline}>Sem internet: usando as provas já baixadas.</Text>}
      </ScrollView>

      {due > 0 && (
        <Pressable
          style={[styles.fab, styles.fabReview]}
          accessibilityRole="button"
          accessibilityLabel={`Revisar ${due} erros`}
          onPress={() => router.push({ pathname: '/licao', params: { mode: 'revisao', vestibular: study.vestibular ?? '', exam: study.examId ?? '' } })}
        >
          <Art name="revisar" size={26} />
          <Text style={styles.fabText}>Revisar {due}</Text>
        </Pressable>
      )}
      {showJump && (
        <Pressable
          style={[styles.fab, styles.fabJump]}
          accessibilityRole="button"
          accessibilityLabel="Ir para a fase atual"
          onPress={() => currentY.current !== null && scroll.current?.scrollTo({ y: Math.max(0, currentY.current - 200), animated: true })}
        >
          <Text style={styles.jump}>↑</Text>
        </Pressable>
      )}

      <Sheet visible={guide} title={unit ? `Guia: ${unit.subject}` : 'Guia'} onClose={() => setGuide(false)}>
        {unit && (
          <View style={{ gap: space(3) }}>
            <Text style={styles.info}>
              {unit.levels.length} fases de até {LEVEL_SIZE} questões. A última é o desafio da unidade, com o troféu.
            </Text>
            <Text style={styles.info}>
              Fases concluídas: {unitDone} de {unit.levels.length}. Estrelas: {unitStars} de {unit.levels.length * 3}.
            </Text>
            <Text style={styles.info}>
              Seu acerto em {unit.subject}: {st?.attempts ? `${Math.round((st.correct / st.attempts) * 100)}% em ${st.attempts} questões` : 'ainda sem respostas'}.
            </Text>
            <Text style={styles.info}>Acerte 3 de 5 para passar de fase, 4 para 2 estrelas e 5 para 3 estrelas. Os baús no caminho dão diamantes.</Text>
          </View>
        )}
      </Sheet>

      <Sheet visible={chestOpened} title="Baú aberto!" onClose={() => setChestOpened(false)}>
        <View style={styles.chestRow}>
          <Text style={styles.chestReward}>+{PATH_CHEST_DIAMONDS}</Text>
          <Art name="diamantes" size={52} />
        </View>
        <Button label="Continuar" variant="success" onPress={() => setChestOpened(false)} />
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  empty: { flex: 1, justifyContent: 'center', padding: space(6), gap: space(4) },
  hero: { fontFamily: fonts.display, fontSize: type.hero, lineHeight: type.hero * 1.1, color: colors.ink },
  lead: { fontFamily: fonts.body, fontSize: type.lead - 2, lineHeight: (type.lead - 2) * 1.4, color: colors.inkSoft },
  bannerWrap: { paddingHorizontal: space(4), paddingTop: space(3), paddingBottom: space(1), backgroundColor: colors.bg, zIndex: 2 },
  banner: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderBottomWidth: 5, paddingLeft: space(4), minHeight: 72 },
  bannerSmall: { fontFamily: fonts.ui, fontSize: type.small, color: 'rgba(255,255,255,0.85)' },
  bannerTitle: { fontFamily: fonts.display, fontSize: type.lead + 2, color: '#fff' },
  bannerSep: { width: 2, alignSelf: 'stretch', marginVertical: 0 },
  guideBtn: { width: 64, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  offline: { fontFamily: fonts.body, fontSize: type.small, color: colors.inkSoft, textAlign: 'center', marginTop: space(4) },
  fab: { position: 'absolute', bottom: space(4), borderRadius: 16, borderWidth: 2, borderBottomWidth: 5, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  fabJump: { right: space(4), width: 52, height: 52, borderColor: colors.line },
  jump: { fontFamily: fonts.display, fontSize: 26, color: colors.primary },
  fabReview: { left: space(4), height: 52, flexDirection: 'row', gap: space(2), paddingHorizontal: space(3), borderColor: colors.right, backgroundColor: colors.rightBg },
  fabText: { fontFamily: fonts.display, fontSize: type.body, color: colors.rightDark },
  info: { fontFamily: fonts.body, fontSize: type.body, lineHeight: type.body * 1.45, color: colors.inkSoft },
  chestRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space(2), paddingVertical: space(4) },
  chestReward: { fontFamily: fonts.display, fontSize: type.hero + 8, color: colors.gem },
});

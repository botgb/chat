import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { LevelMap, LevelMapHandle } from '../../components/LevelMap';
import { Sheet } from '../../components/Sheet';
import { ShootingStars } from '../../components/ShootingStars';
import { TopBar } from '../../components/TopBar';
import { Art } from '../../illustrations/Art';
import { dayKey, dueQuestionIds, PATH_CHEST_DIAMONDS } from '../../lib/gamification';
import { Level, LEVEL_SIZE } from '../../lib/levels';
import { useApp } from '../../state/AppState';
import { useStudy } from '../../state/useStudy';
import { Colors, fonts, space, type } from '../../theme';
import { useStyles } from '../../theme/ThemeContext';

const BANNER_H = 100; // altura da faixa da matéria, que fica por cima do céu

export default function Trilha() {
  const styles = useStyles(createStyles);
  const app = useApp();
  const study = useStudy();
  const { progress } = app;
  const map = useRef<LevelMapHandle>(null);
  const [unitIndex, setUnitIndex] = useState(0);
  const [locked, setLocked] = useState<string | null>(null);
  const [showJump, setShowJump] = useState(false);
  const [guide, setGuide] = useState(false);
  const [chestOpened, setChestOpened] = useState(false);
  const [picker, setPicker] = useState(false);
  const [pickMateria, setPickMateria] = useState<string | null>(null);

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
  // A faixa do topo usa o céu da matéria, para combinar com a constelação.
  const unitDone = unit ? unit.levels.filter((l) => l.stars > 0).length : 0;
  const unitStars = unit ? unit.levels.reduce((s, l) => s + l.stars, 0) : 0;
  const st = unit ? progress.subjectStats[unit.subject] : undefined;

  const play = (l: Level) => {
    if (!l.unlocked) {
      const u = units.find((x) => x.levels.some((y) => y.id === l.id));
      const prev = u?.levels[l.index - 1];
      setLocked(
        prev
          ? `Conclua a fase ${prev.index + 1} de ${u!.subject} com pelo menos 1 estrela (3 acertos de 5) para liberar esta.`
          : 'Esta fase ainda está bloqueada.',
      );
      return;
    }
    router.push({
      pathname: '/licao',
      params: { mode: 'pratica', vestibular: study.vestibular ?? '', level: l.id, ids: l.questionIds.join('|') },
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar />
      <View style={{ flex: 1 }}>
      <LevelMap
        ref={map}
        topInset={BANNER_H}
        units={units}
        openedChests={progress.chests}
        onUnitChange={setUnitIndex}
        onCurrentVisible={(v) => setShowJump(!v)}
        onPlay={play}
        onOpenChest={(id, unlocked) =>
          unlocked ? app.openChest(id) && setChestOpened(true) : setLocked('Conclua a fase anterior para abrir este baú.')
        }
        footer={app.offline ? <Text style={styles.offline}>Sem internet: usando as provas já baixadas.</Text> : null}
      />
      <ShootingStars />
      {unit && (
        <View style={styles.bannerWrap}>
          <View style={styles.banner}>
            <Pressable
              style={{ flex: 1, alignSelf: 'stretch', justifyContent: 'center' }}
              onPress={() => {
                setPickMateria(unit.subject);
                setPicker(true);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${unit.subject}, ${unitDone} de ${unit.levels.length} fases. Tocar para escolher matéria e assunto`}
            >
              <Text style={styles.bannerSmall}>
                {unitDone} de {unit.levels.length} fases
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
                <Text style={styles.bannerTitle} numberOfLines={1}>
                  {unit.subject}
                </Text>
                <Text style={styles.bannerChevron}>▾</Text>
              </View>
            </Pressable>
            <View style={styles.bannerSep} />
            <Pressable onPress={() => setGuide(true)} accessibilityRole="button" accessibilityLabel="Guia da unidade" style={styles.guideBtn}>
              <Art name="guia" size={34} />
            </Pressable>
          </View>
        </View>
      )}

      </View>

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
          onPress={() => map.current?.scrollToCurrent()}
        >
          <Text style={styles.jump}>↑</Text>
        </Pressable>
      )}

      <Sheet visible={guide} title={unit ? `Guia: ${unit.subject}` : 'Guia'} onClose={() => setGuide(false)}>
        {unit && (
          <View style={{ gap: space(3) }}>
            <Text style={styles.info}>
              {unit.levels.length} fases de até {LEVEL_SIZE} questões. A última é o desafio da matéria.
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

      <Sheet visible={picker} title="Escolha matéria e assunto" onClose={() => setPicker(false)}>
        <View style={styles.wrap}>
          {units.map((u) => (
            <Chip
              key={u.subject}
              label={u.subject}
              active={u.subject === pickMateria}
              onPress={() => {
                // Tocou na matéria: vai direto para onde parou nela.
                const l = u.levels.find((x) => x.current) ?? u.levels.find((x) => x.unlocked && x.stars === 0) ?? u.levels[0];
                setPicker(false);
                setTimeout(() => map.current?.scrollToLevel(l.id), 250);
              }}
            />
          ))}
        </View>
        {(() => {
          const u = units.find((x) => x.subject === pickMateria);
          if (!u) return null;
          // Assuntos da matéria nas provas baixadas, na ordem do caminho.
          const assuntos: { nome: string; levels: Level[] }[] = [];
          for (const l of u.levels) {
            const nome = l.assunto ?? 'Geral';
            const g = assuntos.find((a) => a.nome === nome);
            if (g) g.levels.push(l);
            else assuntos.push({ nome, levels: [l] });
          }
          const go = (l: Level) => {
            setPicker(false);
            setTimeout(() => map.current?.scrollToLevel(l.id), 250);
          };
          return (
            <View style={{ gap: space(2) }}>
              <Text style={styles.pickSub}>Assuntos de {u.subject}</Text>
              {assuntos.map((a) => {
                const done = a.levels.filter((l) => l.stars > 0).length;
                const target = a.levels.find((l) => l.unlocked && l.stars === 0) ?? a.levels.find((l) => l.stars === 0) ?? a.levels[0];
                return (
                  <Pressable key={a.nome} style={styles.pickRow} onPress={() => go(target)} accessibilityRole="button">
                    <Text style={styles.pickTitle} numberOfLines={1}>{a.nome}</Text>
                    <Text style={styles.pickSub}>
                      {done} de {a.levels.length} {a.levels.length === 1 ? 'fase' : 'fases'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })()}
      </Sheet>

      <Sheet visible={!!locked} title="Fase bloqueada" onClose={() => setLocked(null)}>
        <Text style={styles.info}>{locked}</Text>
        <Button label="Entendi" onPress={() => setLocked(null)} />
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

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  empty: { flex: 1, justifyContent: 'center', padding: space(6), gap: space(4) },
  hero: { fontFamily: fonts.display, fontSize: type.hero, lineHeight: type.hero * 1.1, color: colors.ink },
  lead: { fontFamily: fonts.body, fontSize: type.lead - 2, lineHeight: (type.lead - 2) * 1.4, color: colors.inkSoft },
  bannerWrap: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: space(4), paddingTop: space(3), paddingBottom: space(1), backgroundColor: 'transparent', zIndex: 2 },
  banner: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', backgroundColor: 'rgba(255,255,255,0.14)', paddingLeft: space(4), minHeight: 72 },
  bannerSmall: { fontFamily: fonts.ui, fontSize: type.small, color: 'rgba(255,255,255,0.85)' },
  bannerTitle: { fontFamily: fonts.display, fontSize: type.lead + 2, color: colors.onColor },
  bannerSep: { width: 1, alignSelf: 'stretch', marginVertical: space(3), backgroundColor: 'rgba(255,255,255,0.28)' },
  bannerChevron: { fontFamily: fonts.display, fontSize: type.body, color: 'rgba(255,255,255,0.8)' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  pickRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space(3), paddingVertical: space(3), paddingHorizontal: space(4), borderRadius: 14, borderCurve: 'continuous', backgroundColor: colors.surface },
  pickTitle: { flex: 1, fontFamily: fonts.displayMedium, fontSize: type.body, color: colors.ink },
  pickSub: { fontSize: type.small, color: colors.inkSoft },
  guideBtn: { width: 64, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  offline: { fontFamily: fonts.body, fontSize: type.small, color: colors.inkSoft, textAlign: 'center', marginTop: space(4) },
  fab: { position: 'absolute', bottom: space(4), borderRadius: 16, borderWidth: 2, borderBottomWidth: 5, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  fabJump: { right: space(4), width: 52, height: 52, borderColor: colors.line },
  jump: { fontFamily: fonts.display, fontSize: 26, color: colors.primary },
  fabReview: { left: space(4), height: 52, flexDirection: 'row', gap: space(2), paddingHorizontal: space(3), borderColor: colors.right, backgroundColor: colors.rightBg },
  fabText: { fontFamily: fonts.display, fontSize: type.body, color: colors.rightDark },
  info: { fontFamily: fonts.body, fontSize: type.body, lineHeight: type.body * 1.45, color: colors.inkSoft },
  chestRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space(2), paddingVertical: space(4) },
  chestReward: { fontFamily: fonts.display, fontSize: type.hero + 8, color: colors.gem },
});

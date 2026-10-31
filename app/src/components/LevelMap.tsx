import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { Animated, FlatList, ListViewToken, Pressable, StyleSheet, Text, View } from 'react-native';
import { buildPath, Level, PathItem, Unit } from '../lib/levels';
import { Art, ArtName, subjectArt } from '../illustrations/Art';
import { Colors, fonts, space, type, unitColors } from '../theme';
import { useColors, useStyles } from '../theme/ThemeContext';

const NODE = 72;
const ROW = 112; // distância vertical entre itens do caminho
const SWING = 74; // amplitude da curva

// Curva suave em S: centro, direita, centro, esquerda...
const offsetX = (i: number) => Math.round(Math.sin((i * Math.PI) / 4) * SWING);

export const unitColor = (i: number) => unitColors[i % unitColors.length];

function Stars({ count }: { count: number }) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  return (
    <View style={styles.stars} accessibilityLabel={`${count} de 3 estrelas`}>
      {[0, 1, 2].map((i) => (
        <Text key={i} style={[styles.star, { color: i < count ? colors.gold : colors.locked }, i === 1 && { marginTop: 4 }]}>
          ★
        </Text>
      ))}
    </View>
  );
}

function useLoop(duration: number) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [v, duration]);
  return v;
}

function PulseRing({ color }: { color: string }) {
  const styles = useStyles(createStyles);
  const v = useLoop(1400);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        {
          borderColor: color,
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }],
        },
      ]}
    />
  );
}

function Bounce({ children }: { children: React.ReactNode }) {
  const v = useLoop(1100);
  return (
    <Animated.View style={{ transform: [{ translateY: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -6, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

function LevelNode({
  level,
  color,
  highlight,
  onPress,
}: {
  level: Level;
  color: { main: string; dark: string };
  highlight: boolean; // a fase atual do mapa inteiro: balão e anel pulsante
  onPress: () => void;
}) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const done = level.stars > 0;
  const bg = !level.unlocked ? colors.locked : done ? colors.gold : color.main;
  const edge = !level.unlocked ? colors.lockedDark : done ? colors.goldDark : color.dark;
  return (
    <View style={{ alignItems: 'center' }}>
      {highlight && (
        <View pointerEvents="none" style={styles.tipWrap}>
          <Bounce>
            <View style={[styles.tip, { borderColor: color.main }]}>
              <Text style={[styles.tipText, { color: color.main }]}>Começar</Text>
            </View>
          </Bounce>
        </View>
      )}
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${level.last ? 'Desafio da unidade' : `Fase ${level.index + 1}`}${level.unlocked ? '' : ', bloqueada'}`}
      >
        {({ pressed }) => (
          <View style={{ paddingTop: pressed ? 6 : 0 }}>
            {highlight && <PulseRing color={color.main} />}
            <View style={[styles.node, { backgroundColor: bg, borderBottomColor: edge, borderBottomWidth: pressed ? 2 : 8 }]}>
              {level.last ? (
                <Art name="ranking" size={36} opacity={level.unlocked ? 1 : 0.45} />
              ) : (
                <Text style={[styles.nodeStar, !level.unlocked && { color: colors.lockedDark }]}>★</Text>
              )}
            </View>
          </View>
        )}
      </Pressable>
      {done && <Stars count={level.stars} />}
    </View>
  );
}

function ChestNode({ item, onOpen }: { item: Extract<PathItem, { kind: 'chest' }>; onOpen: () => void }) {
  const ready = item.unlocked && !item.opened;
  const chest = (
    <Pressable onPress={onOpen} disabled={item.opened} accessibilityRole="button" accessibilityLabel={item.opened ? 'Baú aberto' : ready ? 'Abrir baú' : 'Baú bloqueado'}>
      <Art name="bau" size={60} opacity={!item.unlocked ? 0.35 : item.opened ? 0.4 : 1} />
    </Pressable>
  );
  return ready ? <Bounce>{chest}</Bounce> : chest;
}

/** Ilustração da matéria ao lado do caminho, no lado oposto à curva. */
function Decoration({ art, side, color }: { art: ArtName; side: 'left' | 'right'; color: string }) {
  const styles = useStyles(createStyles);
  return (
    <View pointerEvents="none" style={[styles.decor, side === 'left' ? { left: space(2) } : { right: space(2) }]}>
      <View style={[styles.decorBlob, { backgroundColor: color }]} />
      <Art name={art} size={72} />
    </View>
  );
}

type Row =
  | { kind: 'start'; key: string; ui: number; subject: string }
  | { kind: 'item'; key: string; ui: number; i: number; item: PathItem };

const START_FIRST = 32; // espaço antes da primeira unidade
const START_NEXT = 120; // divisória com o nome da matéria entre unidades

const rowHeight = (r: Row) => (r.kind === 'item' ? ROW : r.ui === 0 ? START_FIRST : START_NEXT);

export type LevelMapHandle = { scrollToCurrent: () => void };

/**
 * Trilha como lista virtualizada: só as fases perto da tela são desenhadas,
 * para continuar leve com centenas de fases (várias provas baixadas).
 */
export const LevelMap = forwardRef<LevelMapHandle, {
  units: Unit[];
  openedChests: string[];
  onPlay: (level: Level) => void;
  onOpenChest: (id: string, unlocked: boolean) => void;
  onUnitChange?: (index: number) => void;
  onCurrentVisible?: (visible: boolean) => void;
  footer?: React.ReactElement | null;
}>(function LevelMap({ units, openedChests, onPlay, onOpenChest, onUnitChange, onCurrentVisible, footer }, ref) {
  const styles = useStyles(createStyles);
  const list = useRef<FlatList<Row>>(null);
  const firstCurrent = units.flatMap((u) => u.levels).find((l) => l.current)?.id;

  const { rows, offsets, currentIndex } = useMemo(() => {
    const rows: Row[] = [];
    units.forEach((u, ui) => {
      rows.push({ kind: 'start', key: `start:${u.subject}`, ui, subject: u.subject });
      buildPath(u, openedChests).forEach((item, i) =>
        rows.push({ kind: 'item', key: item.kind === 'level' ? item.level.id : item.id, ui, i, item }),
      );
    });
    const offsets: number[] = [];
    let y = 0;
    for (const r of rows) {
      offsets.push(y);
      y += rowHeight(r);
    }
    const currentIndex = rows.findIndex((r) => r.kind === 'item' && r.item.kind === 'level' && r.item.level.id === firstCurrent);
    return { rows, offsets, currentIndex };
  }, [units, openedChests, firstCurrent]);

  useImperativeHandle(ref, () => ({
    scrollToCurrent: () => {
      if (currentIndex >= 0) list.current?.scrollToIndex({ index: currentIndex, viewPosition: 0.4, animated: true });
    },
  }));

  // Os callbacks de visibilidade precisam ser estáveis para a FlatList.
  const cb = useRef({ onUnitChange, onCurrentVisible, currentIndex });
  cb.current = { onUnitChange, onCurrentVisible, currentIndex };
  const onViewable = useRef(({ viewableItems }: { viewableItems: ListViewToken[] }) => {
    const first = viewableItems[0]?.item;
    if (first) cb.current.onUnitChange?.(first.ui);
    cb.current.onCurrentVisible?.(viewableItems.some((v) => v.index === cb.current.currentIndex));
  }).current;

  const renderItem = ({ item: r }: { item: Row }) => {
    const color = unitColor(r.ui);
    if (r.kind === 'start') {
      return r.ui === 0 ? (
        <View style={{ height: START_FIRST }} />
      ) : (
        <View style={[styles.divider, { height: START_NEXT }]}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{r.subject}</Text>
          <View style={styles.dividerLine} />
        </View>
      );
    }
    const phase = r.i % 8;
    const art = subjectArt(units[r.ui].subject);
    const it = r.item;
    return (
      <View style={styles.row}>
        {phase === 2 && <Decoration art={art} side="left" color={color.main} />}
        {phase === 6 && <Decoration art={art} side="right" color={color.main} />}
        <View style={{ transform: [{ translateX: offsetX(r.i) }] }}>
          {it.kind === 'level' ? (
            <LevelNode level={it.level} color={color} highlight={it.level.id === firstCurrent} onPress={() => onPlay(it.level)} />
          ) : (
            <ChestNode item={it} onOpen={() => onOpenChest(it.id, it.unlocked)} />
          )}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      ref={list}
      style={{ flex: 1 }}
      data={rows}
      keyExtractor={(r) => r.key}
      renderItem={renderItem}
      getItemLayout={(_, index) => ({ length: rowHeight(rows[index]), offset: offsets[index], index })}
      onViewableItemsChanged={onViewable}
      viewabilityConfig={{ itemVisiblePercentThreshold: 30 }}
      initialNumToRender={12}
      windowSize={7}
      removeClippedSubviews
      ListFooterComponent={footer ?? undefined}
      contentContainerStyle={{ paddingBottom: space(24) }}
    />
  );
});

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  row: { height: ROW, alignItems: 'center', justifyContent: 'center' },
  node: { width: NODE, height: NODE - 6, borderRadius: NODE / 2, alignItems: 'center', justifyContent: 'center' },
  nodeStar: { fontSize: 34, color: colors.onColor, marginTop: -2 },
  ring: { position: 'absolute', top: -8, left: -8, width: NODE + 16, height: NODE + 8, borderRadius: (NODE + 16) / 2, borderWidth: 4 },
  stars: { position: 'absolute', bottom: -20, flexDirection: 'row', gap: 1 },
  star: { fontSize: 16 },
  tipWrap: { position: 'absolute', top: -44, left: '50%', marginLeft: -80, width: 160, alignItems: 'center', zIndex: 2 },
  tip: { backgroundColor: colors.bg, borderWidth: 2, borderBottomWidth: 4, borderRadius: 12, paddingHorizontal: space(3), paddingVertical: space(1) },
  tipText: { fontFamily: fonts.display, fontSize: type.body - 1 },
  decor: { position: 'absolute', top: -ROW / 2, width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  decorBlob: { position: 'absolute', width: 104, height: 104, borderRadius: 52, opacity: 0.12 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingHorizontal: space(4) },
  dividerLine: { flex: 1, height: 2, backgroundColor: colors.line },
  dividerText: { fontFamily: fonts.displayMedium, fontSize: type.body, color: colors.inkSoft },
});

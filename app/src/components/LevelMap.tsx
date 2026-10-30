import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { buildPath, Level, PathItem, Unit } from '../lib/levels';
import { subjectIcon } from '../state/useStudy';
import { colors, fonts, space, type, unitColors } from '../theme';

const NODE = 72;
const ROW = 112; // distância vertical entre itens do caminho
const SWING = 74; // amplitude da curva

// Curva suave em S: centro, direita, centro, esquerda...
const offsetX = (i: number) => Math.round(Math.sin((i * Math.PI) / 4) * SWING);

export const unitColor = (i: number) => unitColors[i % unitColors.length];

function Stars({ count }: { count: number }) {
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
  const done = level.stars > 0;
  const bg = !level.unlocked ? colors.locked : done ? colors.gold : color.main;
  const edge = !level.unlocked ? colors.lockedDark : done ? colors.goldDark : color.dark;
  const icon = level.last ? '🏆' : '★';
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
        disabled={!level.unlocked}
        accessibilityRole="button"
        accessibilityLabel={`${level.last ? 'Desafio da unidade' : `Fase ${level.index + 1}`}${level.unlocked ? '' : ', bloqueada'}`}
      >
        {({ pressed }) => (
          <View style={{ paddingTop: pressed ? 6 : 0 }}>
            {highlight && <PulseRing color={color.main} />}
            <View style={[styles.node, { backgroundColor: bg, borderBottomColor: edge, borderBottomWidth: pressed ? 2 : 8 }]}>
              <Text
                style={[
                  level.last ? styles.nodeEmoji : styles.nodeStar,
                  !level.unlocked && (level.last ? { opacity: 0.45 } : { color: colors.lockedDark }),
                ]}
              >
                {icon}
              </Text>
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
    <Pressable onPress={onOpen} disabled={!ready} accessibilityRole="button" accessibilityLabel={item.opened ? 'Baú aberto' : ready ? 'Abrir baú' : 'Baú bloqueado'}>
      <Text style={[styles.chest, !item.unlocked && { opacity: 0.35 }, item.opened && { opacity: 0.4 }]}>🎁</Text>
    </Pressable>
  );
  return ready ? <Bounce>{chest}</Bounce> : chest;
}

/** Ilustração da matéria ao lado do caminho, no lado oposto à curva. */
function Decoration({ emoji, side, color }: { emoji: string; side: 'left' | 'right'; color: string }) {
  return (
    <View pointerEvents="none" style={[styles.decor, side === 'left' ? { left: space(2) } : { right: space(2) }]}>
      <View style={[styles.decorBlob, { backgroundColor: color }]} />
      <Text style={styles.decorEmoji}>{emoji}</Text>
    </View>
  );
}

export function LevelMap({
  units,
  openedChests,
  onPlay,
  onOpenChest,
  onUnitLayout,
  onCurrentLayout,
}: {
  units: Unit[];
  openedChests: string[];
  onPlay: (level: Level) => void;
  onOpenChest: (id: string) => void;
  onUnitLayout?: (index: number, y: number) => void;
  onCurrentLayout?: (y: number) => void;
}) {
  const firstCurrent = units.flatMap((u) => u.levels).find((l) => l.current)?.id;
  return (
    <View>
      {units.map((u, ui) => {
        const color = unitColor(ui);
        const path = buildPath(u, openedChests);
        const emoji = subjectIcon(u.subject);
        return (
          <View key={u.subject} onLayout={(e) => onUnitLayout?.(ui, e.nativeEvent.layout.y)} style={{ paddingTop: space(6) }}>
            {ui > 0 && (
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{u.subject}</Text>
                <View style={styles.dividerLine} />
              </View>
            )}
            <View style={{ paddingTop: space(8) }}>
              {path.map((item, i) => {
                const x = offsetX(i);
                const phase = i % 8;
                const isCurrent = item.kind === 'level' && item.level.id === firstCurrent;
                return (
                  <View
                    key={item.kind === 'level' ? item.level.id : item.id}
                    style={styles.row}
                    onLayout={isCurrent ? (e) => onCurrentLayout?.(e.nativeEvent.layout.y) : undefined}
                  >
                    {phase === 2 && <Decoration emoji={emoji} side="left" color={color.main} />}
                    {phase === 6 && <Decoration emoji={emoji} side="right" color={color.main} />}
                    <View style={{ transform: [{ translateX: x }] }}>
                      {item.kind === 'level' ? (
                        <LevelNode level={item.level} color={color} highlight={isCurrent} onPress={() => onPlay(item.level)} />
                      ) : (
                        <ChestNode item={item} onOpen={() => onOpenChest(item.id)} />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: ROW, alignItems: 'center', justifyContent: 'center' },
  node: { width: NODE, height: NODE - 6, borderRadius: NODE / 2, alignItems: 'center', justifyContent: 'center' },
  nodeStar: { fontSize: 34, color: '#fff', marginTop: -2 },
  nodeEmoji: { fontSize: 30 },
  ring: { position: 'absolute', top: -8, left: -8, width: NODE + 16, height: NODE + 8, borderRadius: (NODE + 16) / 2, borderWidth: 4 },
  stars: { position: 'absolute', bottom: -20, flexDirection: 'row', gap: 1 },
  star: { fontSize: 16 },
  tipWrap: { position: 'absolute', top: -44, left: '50%', marginLeft: -80, width: 160, alignItems: 'center', zIndex: 2 },
  tip: { backgroundColor: '#fff', borderWidth: 2, borderBottomWidth: 4, borderRadius: 12, paddingHorizontal: space(3), paddingVertical: space(1) },
  tipText: { fontFamily: fonts.display, fontSize: type.body - 1 },
  chest: { fontSize: 56 },
  decor: { position: 'absolute', top: -ROW / 2, width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  decorBlob: { position: 'absolute', width: 104, height: 104, borderRadius: 52, opacity: 0.12 },
  decorEmoji: { fontSize: 64 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingHorizontal: space(4) },
  dividerLine: { flex: 1, height: 2, backgroundColor: colors.line },
  dividerText: { fontFamily: fonts.displayMedium, fontSize: type.body, color: colors.inkSoft },
});

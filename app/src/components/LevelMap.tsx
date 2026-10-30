import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Level, Unit } from '../lib/levels';
import { colors, fonts, space, type, unitColors } from '../theme';

const NODE = 76;
const ROW = 136; // distância vertical entre fases (inclui as estrelas)
const SWING = 72; // amplitude do zigue-zague
const DOTS_START = NODE + 34; // abaixo do botão e das estrelas

// Centro, direita, centro, esquerda... como uma trilha serpenteando.
const offsetX = (i: number) => Math.round(Math.sin((i * Math.PI) / 2) * SWING);

function Stars({ count }: { count: number }) {
  return (
    <View style={styles.stars} accessibilityLabel={`${count} de 3 estrelas`}>
      {[0, 1, 2].map((i) => (
        <Text key={i} style={[styles.star, { color: i < count ? colors.gold : colors.locked }, i === 1 && { marginTop: -6 }]}>
          ★
        </Text>
      ))}
    </View>
  );
}

function PulseRing({ color }: { color: string }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1400, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [v]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        {
          borderColor: color,
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) }],
        },
      ]}
    />
  );
}

function LevelNode({ level, color, onPress }: { level: Level; color: { main: string; dark: string }; onPress: () => void }) {
  const done = level.stars > 0;
  const bg = !level.unlocked ? colors.locked : done ? colors.gold : color.main;
  const edge = !level.unlocked ? colors.lockedDark : done ? colors.goldDark : color.dark;
  return (
    <View style={{ alignItems: 'center' }}>
      {level.current && (
        <View style={[styles.tip, { borderColor: color.main }]}>
          <Text style={[styles.tipText, { color: color.main }]}>Começar</Text>
        </View>
      )}
      <Pressable
        onPress={onPress}
        disabled={!level.unlocked}
        accessibilityRole="button"
        accessibilityLabel={`Fase ${level.index + 1}${level.unlocked ? '' : ', bloqueada'}`}
      >
        {({ pressed }) => (
          <View style={{ paddingTop: pressed ? 6 : 0 }}>
            {level.current && <PulseRing color={color.main} />}
            <View style={[styles.node, { backgroundColor: bg, borderBottomColor: edge, borderBottomWidth: pressed ? 2 : 8 }]}>
              <Text style={[styles.nodeText, !level.unlocked && { color: colors.lockedDark }]}>
                {level.unlocked ? level.index + 1 : '🔒'}
              </Text>
            </View>
          </View>
        )}
      </Pressable>
      {done && <Stars count={level.stars} />}
    </View>
  );
}

/** Pontinhos ligando duas fases, como uma trilha desenhada. */
function Dots({ from, to }: { from: number; to: number }) {
  const n = 3;
  return (
    <>
      {Array.from({ length: n }, (_, k) => {
        const t = (k + 1) / (n + 1);
        return (
          <View
            key={k}
            style={[
              styles.dot,
              { transform: [{ translateX: from + (to - from) * t }], top: DOTS_START + (ROW - DOTS_START) * t - 4 },
            ]}
          />
        );
      })}
    </>
  );
}

export function LevelMap({ units, onPlay }: { units: Unit[]; onPlay: (level: Level) => void }) {
  return (
    <View style={{ gap: space(8) }}>
      {units.map((u, ui) => {
        const color = unitColors[ui % unitColors.length];
        const done = u.levels.filter((l) => l.stars > 0).length;
        const stars = u.levels.reduce((s, l) => s + l.stars, 0);
        return (
          <View key={u.subject} style={{ gap: space(6) }}>
            <View style={[styles.banner, { backgroundColor: color.main, borderBottomColor: color.dark }]}>
              <Text style={styles.bannerSmall}>Unidade {ui + 1}</Text>
              <Text style={styles.bannerTitle}>{u.subject}</Text>
              <Text style={styles.bannerSmall}>
                {done} de {u.levels.length} fases, {stars} ★
              </Text>
            </View>
            <View>
              {u.levels.map((l, i) => (
                <View key={l.id} style={{ height: i < u.levels.length - 1 ? ROW : NODE + 40, alignItems: 'center' }}>
                  {i < u.levels.length - 1 && <Dots from={offsetX(i)} to={offsetX(i + 1)} />}
                  <View style={{ transform: [{ translateX: offsetX(i) }] }}>
                    <LevelNode level={l} color={color} onPress={() => onPlay(l)} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 18, padding: space(4), borderBottomWidth: 6, gap: 2 },
  bannerSmall: { fontFamily: fonts.ui, fontSize: type.small + 1, color: 'rgba(255,255,255,0.88)' },
  bannerTitle: { fontFamily: fonts.display, fontSize: type.title, color: '#fff' },
  node: { width: NODE, height: NODE - 6, borderRadius: NODE / 2, alignItems: 'center', justifyContent: 'center' },
  nodeText: { fontFamily: fonts.display, fontSize: type.title, color: '#fff' },
  ring: { position: 'absolute', top: -8, left: -8, width: NODE + 16, height: NODE + 10, borderRadius: (NODE + 16) / 2, borderWidth: 4 },
  stars: { flexDirection: 'row', gap: 2, marginTop: 2 },
  star: { fontSize: 20 },
  tip: { position: 'absolute', top: -38, backgroundColor: '#fff', borderWidth: 2, borderRadius: 12, paddingHorizontal: space(3), paddingVertical: space(1), zIndex: 2 },
  tipText: { fontFamily: fonts.display, fontSize: type.body },
  dot: { position: 'absolute', left: '50%', marginLeft: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lockedDark, opacity: 0.5 },
});

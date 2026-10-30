import { StyleSheet, Text, View } from 'react-native';
import { currentHearts, dayKey, MAX_HEARTS, visibleStreak } from '../lib/gamification';
import { useApp } from '../state/AppState';
import { colors, fonts, space, type } from '../theme';

function Counter({ icon, value, color, label }: { icon: string; value: string | number; color: string; label: string }) {
  return (
    <View style={styles.counter} accessibilityLabel={`${value} ${label}`}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

export function TopBar({ left }: { left?: React.ReactNode }) {
  const { progress } = useApp();
  const streak = visibleStreak(progress, dayKey(new Date()));
  const hearts = currentHearts(progress, Date.now());
  return (
    <View style={styles.bar}>
      <View style={{ flex: 1 }}>{left}</View>
      <Counter icon="🔥" value={streak} color={streak > 0 ? colors.streak : colors.lockedDark} label="dias seguidos" />
      <Counter icon="💎" value={progress.xp} color={colors.gem} label="XP" />
      <Counter icon="❤️" value={hearts} color={hearts === MAX_HEARTS ? colors.heart : colors.inkSoft} label="vidas" />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(4),
    paddingHorizontal: space(4),
    paddingVertical: space(3),
    borderBottomWidth: 2,
    borderBottomColor: colors.line,
    backgroundColor: colors.bg,
  },
  counter: { flexDirection: 'row', alignItems: 'center', gap: space(1) },
  icon: { fontSize: type.lead },
  value: { fontFamily: fonts.display, fontSize: type.lead },
});

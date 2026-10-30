import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, space, type } from '../theme';

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: active }}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingVertical: space(2), paddingHorizontal: space(4), borderRadius: 12, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.line, backgroundColor: colors.bg },
  chipActive: { borderColor: colors.primary, backgroundColor: '#EAF1FF' },
  chipText: { fontFamily: fonts.displayMedium, fontSize: type.small + 2, color: colors.inkSoft },
});

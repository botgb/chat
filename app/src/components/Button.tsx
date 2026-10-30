import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, space, type } from '../theme';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.secondary,
        disabled && { opacity: 0.35 },
        pressed && { transform: [{ translateY: 2 }] },
      ]}
    >
      <Text style={[styles.label, { color: primary ? colors.paper : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: space(4), paddingHorizontal: space(5), borderRadius: 14, alignItems: 'center' },
  primary: { backgroundColor: colors.ink },
  secondary: { backgroundColor: colors.paper, borderWidth: 2, borderColor: colors.ink },
  label: { fontFamily: fonts.displayMedium, fontSize: type.lead - 2 },
});

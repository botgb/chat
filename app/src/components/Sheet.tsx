import { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Art, ArtName } from '../illustrations/Art';
import { Colors, fonts, space, type } from '../theme';
import { useColors, useStyles } from '../theme/ThemeContext';

/** Painel que sobe da parte de baixo da tela. */
export function Sheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const styles = useStyles(createStyles);
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fechar" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + space(4) }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>
        <ScrollView style={{ maxHeight: 460 }} contentContainerStyle={{ gap: space(2) }}>
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}

/** Linha selecionável dentro de um Sheet. */
export function SheetOption({
  icon,
  label,
  detail,
  selected,
  onPress,
}: {
  icon?: ArtName;
  label: string;
  detail?: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.option, selected && styles.optionSelected]}
    >
      {icon ? <Art name={icon} size={30} /> : null}
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionLabel, selected && { color: colors.primary }]}>{label}</Text>
        {detail ? <Text style={styles.optionDetail}>{detail}</Text> : null}
      </View>
      {selected ? <Text style={styles.check}>✓</Text> : null}
    </Pressable>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,22,35,0.45)' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: space(4), paddingTop: space(2), gap: space(3) },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.line },
  title: { fontFamily: fonts.display, fontSize: type.lead + 2, color: colors.ink },
  option: { flexDirection: 'row', alignItems: 'center', gap: space(3), padding: space(3), borderRadius: 14, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.line },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.selectedBg },
  optionLabel: { fontFamily: fonts.displayMedium, fontSize: type.body, color: colors.ink },
  optionDetail: { fontFamily: fonts.body, fontSize: type.small, color: colors.inkSoft },
  check: { fontFamily: fonts.display, fontSize: type.lead, color: colors.primary },
});

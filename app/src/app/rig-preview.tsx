import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CHARACTERS } from '../rig/characters';
import { Pose } from '../rig/compose';
import { EYE_NAMES, HAND_NAMES, MOUTH_NAMES } from '../rig/library';
import { Puppet } from '../rig/Puppet';

// Folha de modelo dos bonecos de recorte, só para desenvolvimento.
// /rig-preview → vistas de todos; /rig-preview?id=gatematica → biblioteca de um personagem.
const VIEWS: [string, Partial<Pose>][] = [
  ['frente', { view: 'frente' }],
  ['3/4', { view: '3q' }],
  ['perfil', { view: 'perfil' }],
  ['costas', { view: 'costas' }],
  ['3/4 esq.', { view: '3q', facing: -1 }],
  ['perfil esq.', { view: 'perfil', facing: -1 }],
];
const GESTOS: [string, Partial<Pose>][] = [
  ['tchau', { handRTarget: [104, 56], handR: 'tchau', mouth: 'sorriso', eyes: 'feliz', prop: false }],
  ['aponta', { handRTarget: [124, 92], handR: 'aponta', eyes: 'semicerrado', mouth: 'repouso', prop: false }],
  ['joinha', { handRTarget: [96, 84], handR: 'joinha', mouth: 'sorrisao', prop: false }],
  ['pensando', { handRTarget: [70, 80], armRFront: true, handR: 'punho', eyes: 'olhaDireita', mouth: 'MBP', prop: false }],
  ['mãos na cintura', { handLTarget: [36, 116], handRTarget: [84, 116], armL: [0, 0], eyes: 'semicerrado', mouth: 'repouso', prop: false }],
  ['bravo', { armL: [30, 110], armR: [30, 110], handL: 'punho', handR: 'punho', eyes: 'raiva', mouth: 'grito' }],
  ['chorando', { eyes: 'choro', mouth: 'triste', armL: [4, 0], armR: [4, 0] }],
  ['andando', { view: 'perfil', legL: [25, -10], legR: [-25, 30], armL: [-25, 0], armR: [25, 0] }],
];

const PULO: [string, Partial<Pose>][] = [
  ['agacha', { sx: 1.12, sy: 0.86, legL: [-10, 30], legR: [-10, 30], eyes: 'semicerrado', mouth: 'MBP' }],
  ['estica', { sx: 0.9, sy: 1.14, handLTarget: [20, 60], handRTarget: [100, 60], eyes: 'arregalado', mouth: 'O' }],
  ['cai', { sx: 1.16, sy: 0.84, eyes: 'fechado', mouth: 'grito' }],
  ['assenta', { sx: 0.97, sy: 1.03, eyes: 'feliz', mouth: 'sorriso' }],
];

export default function RigPreview() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!__DEV__) return null;
  const one = CHARACTERS.find((c) => c.id === id);
  if (one) {
    return (
      <ScrollView style={s.page} contentContainerStyle={s.pad}>
        <Text style={s.h1}>{one.name} — biblioteca</Text>
        <Section title="Vistas" items={VIEWS.map(([n, p]) => [n, p])} id={one.id} />
        <Section title={`Olhos (${EYE_NAMES.length})`} items={EYE_NAMES.map((e) => [e, { eyes: e }])} id={one.id} size={84} face />
        <Section title={`Bocas (${MOUTH_NAMES.length})`} items={MOUTH_NAMES.map((m) => [m, { mouth: m }])} id={one.id} size={84} face />
        <Section title={`Mãos (${HAND_NAMES.length})`} items={HAND_NAMES.map((h) => [h, { handR: h, armR: [40, 50], prop: false }])} id={one.id} size={96} />
        <Section title="Gestos (mãos por alvo, cotovelo para fora)" items={GESTOS} id={one.id} />
        <Section title="Pulo: antecipação, esticar, cair, assentar" items={PULO} id={one.id} />
        <Section title="Traço fervendo (3 variações, trocadas a cada 2 quadros)" items={[0, 1, 2].map((b) => [`variação ${b + 1}`, { boil: b }])} id={one.id} face size={96} />
      </ScrollView>
    );
  }
  return (
    <ScrollView style={s.page} contentContainerStyle={s.pad}>
      <Text style={s.h1}>Bonecos de recorte — vistas</Text>
      {CHARACTERS.map((c) => (
        <Section key={c.id} title={`${c.name} · ${c.subject}`} items={VIEWS} id={c.id} size={72} />
      ))}
    </ScrollView>
  );
}

function Section({ title, items, id, size = 90, face = false }: { title: string; items: [string, Partial<Pose>][]; id: string; size?: number; face?: boolean }) {
  return (
    <View style={s.section}>
      <Text style={s.h2}>{title}</Text>
      <View style={s.row}>
        {items.map(([name, pose]) => (
          <View key={name} style={s.cell}>
            <Puppet id={id} pose={pose} size={size} face={face} />
            <Text style={s.label}>{name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FFFFFF' },
  pad: { padding: 12, gap: 8 },
  h1: { fontSize: 20, fontWeight: '700', color: '#22242F' },
  h2: { fontSize: 14, fontWeight: '700', color: '#2F6FE8', marginBottom: 2 },
  section: { backgroundColor: '#F5F6FA', borderRadius: 12, padding: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cell: { alignItems: 'center' },
  label: { fontSize: 10, color: '#6E7387' },
});

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { TopBar } from '../../components/TopBar';
import { Art, ArtName } from '../../illustrations/Art';
import { colors, fonts, space, type } from '../../theme';

// Só a apresentação do plano. A cobrança exige compras dentro do app (App Store / Google Play)
// e um build próprio do app; ainda não está ligada.
const BENEFITS: { icon: ArtName; title: string; text: string }[] = [
  { icon: 'vidas', title: 'Vidas ilimitadas', text: 'Erre à vontade nas fases da trilha.' },
  { icon: 'cronometro', title: 'Simulados completos', text: 'Provas inteiras no tempo oficial, com nota final.' },
  { icon: 'ranking', title: 'Estatísticas por assunto', text: 'Veja exatamente onde você mais erra.' },
  { icon: 'ofensiva', title: 'Congelamentos extras', text: 'Proteja sua ofensiva nos dias corridos.' },
];

export default function Assinatura() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar />
      <ScrollView contentContainerStyle={{ padding: space(4), gap: space(5), paddingBottom: space(12) }}>
        <View style={styles.hero}>
          <Art name="assinatura" size={72} />
          <Text style={styles.heroTitle}>Aprova Plus</Text>
          <Text style={styles.heroSub}>Estude sem limites até o dia da prova.</Text>
        </View>

        <View style={{ gap: space(3) }}>
          {BENEFITS.map((b) => (
            <View key={b.title} style={styles.benefit}>
              <Art name={b.icon} size={36} />
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.muted}>{b.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <Button label="Em breve" disabled onPress={() => {}} />
        <Text style={[styles.muted, { textAlign: 'center' }]}>
          A assinatura ainda não está disponível. Tudo o que existe hoje no app continua grátis.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { backgroundColor: '#2B2D42', borderRadius: 20, borderBottomWidth: 6, borderBottomColor: '#14151F', padding: space(6), alignItems: 'center', gap: space(1) },
  heroTitle: { fontFamily: fonts.display, fontSize: type.hero, color: colors.gold },
  heroSub: { fontFamily: fonts.ui, fontSize: type.body, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: space(3), padding: space(4), borderRadius: 16, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.line },
  benefitTitle: { fontFamily: fonts.displayMedium, fontSize: type.body, color: colors.ink },
  muted: { fontFamily: fonts.body, fontSize: type.small + 1, color: colors.inkSoft, lineHeight: (type.small + 1) * 1.4 },
});

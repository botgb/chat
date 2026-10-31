import { SvgXml } from 'react-native-svg';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ART, ArtName } from './data';
import { MASCOTS, MASCOTS_TALK, MascotName } from './mascots';

export type { ArtName, MascotName };

/** Ilustração vetorial do app (fonte em scripts/ilustracoes.py). */
export function Art({ name, size = 24, opacity }: { name: ArtName; size?: number; opacity?: number }) {
  return <SvgXml xml={ART[name]} width={size} height={size} opacity={opacity} />;
}

const SUBJECT_ART: Record<string, ArtName> = {
  Matemática: 'matematica',
  Biologia: 'biologia',
  Química: 'quimica',
  Física: 'fisica',
  História: 'historia',
  Geografia: 'geografia',
  Português: 'portugues',
  'Língua Portuguesa': 'portugues',
  Literatura: 'literatura',
  Inglês: 'idiomas',
  Espanhol: 'idiomas',
  'Língua Estrangeira': 'idiomas',
  Filosofia: 'filosofia',
  Sociologia: 'sociologia',
  Artes: 'artes',
  Redação: 'redacao',
  // Áreas do ENEM
  Linguagens: 'portugues',
  'Ciências Humanas': 'historia',
  'Ciências da Natureza': 'quimica',
};

export const subjectArt = (subject: string): ArtName => SUBJECT_ART[subject] ?? 'materias';

/** Mascote de corpo inteiro (proporção 3:4). Fonte em scripts/mascotes.py. */
export function Mascot({ name, size = 120 }: { name: MascotName; size?: number }) {
  return <SvgXml xml={MASCOTS[name]} width={size} height={(size * 4) / 3} />;
}

/** Mascote que mexe a boca enquanto `talking` for verdadeiro (dois quadros sobrepostos). */
export function TalkingMascot({ name, size = 120, talking }: { name: MascotName; size?: number; talking: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!talking) {
      setOpen(false);
      return;
    }
    const id = setInterval(() => setOpen((o) => !o), 130);
    return () => clearInterval(id);
  }, [talking]);
  const h = (size * 4) / 3;
  return (
    <View style={{ width: size, height: h }}>
      <SvgXml xml={MASCOTS[name]} width={size} height={h} style={{ position: 'absolute', opacity: open ? 0 : 1 }} />
      <SvgXml xml={MASCOTS_TALK[name]} width={size} height={h} style={{ position: 'absolute', opacity: open ? 1 : 0 }} />
    </View>
  );
}

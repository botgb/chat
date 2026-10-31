import { SvgXml } from 'react-native-svg';
import { ART, ArtName } from './data';

export type { ArtName };

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

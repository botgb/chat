// Separa as referências bibliográficas ("FURTADO, C. Formação econômica do Brasil. São Paulo:
// ..., 1997 (adaptado).") do texto do enunciado, para mostrá-las depois das alternativas e não
// atrapalharem a leitura.
import type { Block } from './types';

const AUTOR = /^[A-ZÁÉÍÓÚÂÊÔÃÕÇÀÜ][A-ZÁÉÍÓÚÂÊÔÃÕÇÀÜ'’-]+(?:\s+(?:[A-ZÁÉÍÓÚÂÊÔÃÕÇÀÜ'’-]+|DE|DA|DO|DOS|DAS|E))*,\s+[A-ZÁÉÍÓÚ]/;
const MARCAS = /Dispon[ií]vel em|Acesso em|Acessado em|\(adaptado\)|\(fragmento\)|Adaptado\.?\s*$|Fragmento\.?\s*$/i;

export function isSource(text: string): boolean {
  const t = text.trim();
  return t.length < 500 && (AUTOR.test(t) || MARCAS.test(t));
}

/** O comando final (a pergunta) nunca é tratado como fonte. */
export function splitSources(blocks: Block[]): { body: Block[]; sources: string[] } {
  const body: Block[] = [];
  const sources: string[] = [];
  blocks.forEach((b, i) => {
    if (b.type === 'text' && i < blocks.length - 1 && isSource(b.text)) sources.push(b.text.trim());
    else body.push(b);
  });
  return { body, sources };
}

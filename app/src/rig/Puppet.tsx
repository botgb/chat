import { memo, useMemo } from 'react';
import { SvgXml } from 'react-native-svg';
import { CHARACTER_BY_ID } from './characters';
import { composePuppet, DEFAULT_POSE, FACE_FRAME, FRAME, Pose } from './compose';

/**
 * Boneco de recorte. A pose é montada a partir das peças; poses repetidas reaproveitam o
 * desenho já montado, então trocar boca e olhos a 24 quadros por segundo fica leve.
 */
const cache = new Map<string, string>();
const MAX_CACHE = 400;

export function puppetXml(id: string, pose: Partial<Pose>, face = false): string {
  const full = { ...DEFAULT_POSE, ...pose };
  const key = id + (face ? ':rosto' : '') + JSON.stringify(full);
  let xml = cache.get(key);
  if (!xml) {
    if (cache.size > MAX_CACHE) cache.clear();
    xml = composePuppet(CHARACTER_BY_ID[id], full, face ? FACE_FRAME : FRAME);
    cache.set(key, xml);
  }
  return xml;
}

/** `size` é a largura do quadro; com `face`, mostra só o rosto (close). */
export const Puppet = memo(function Puppet({ id, pose, size = 120, face = false }: { id: string; pose: Partial<Pose>; size?: number; face?: boolean }) {
  const xml = useMemo(() => puppetXml(id, pose, face), [id, pose, face]);
  const f = face ? FACE_FRAME : FRAME;
  return <SvgXml xml={xml} width={size} height={(size * f.h) / f.w} />;
});

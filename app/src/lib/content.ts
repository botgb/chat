// Conteúdo remoto: apenas arquivos estáticos (manifest.json + pacotes + imagens).
// Não existe servidor de aplicação; qualquer hospedagem estática serve.
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { Platform } from 'react-native';
import { Block, ExamPack, Manifest } from './types';

// EXPO_PUBLIC_CONTENT_URL permite apontar para um servidor local durante o desenvolvimento.
export const CONTENT_BASE_URL: string =
  process.env.EXPO_PUBLIC_CONTENT_URL ??
  (Constants.expoConfig?.extra?.contentBaseUrl as string | undefined) ??
  '';

const MANIFEST_KEY = 'content:manifest';
const PACK_INDEX_KEY = 'content:packs'; // { [examId]: version }
const packKey = (id: string) => `content:pack:${id}`;

export function resolveUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${CONTENT_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Falha ao baixar ${url}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

/** Busca o manifest atualizado; sem internet, devolve o último salvo. */
export async function loadManifest(): Promise<{ manifest: Manifest | null; offline: boolean }> {
  try {
    const manifest = await fetchJson<Manifest>(resolveUrl('manifest.json'));
    await AsyncStorage.setItem(MANIFEST_KEY, JSON.stringify(manifest));
    return { manifest, offline: false };
  } catch {
    const cached = await AsyncStorage.getItem(MANIFEST_KEY);
    return { manifest: cached ? (JSON.parse(cached) as Manifest) : null, offline: true };
  }
}

// Pacotes ficam em arquivos no celular; na web (usada só em testes) no AsyncStorage.
async function writePack(pack: ExamPack): Promise<void> {
  const json = JSON.stringify(pack);
  if (Platform.OS === 'web') return AsyncStorage.setItem(packKey(pack.id), json);
  const { File, Directory, Paths } = await import('expo-file-system');
  const dir = new Directory(Paths.document, 'packs');
  if (!dir.exists) dir.create({ intermediates: true });
  const file = new File(dir, `${pack.id}.json`);
  if (file.exists) file.delete();
  file.create();
  await file.write(json);
}

async function readPack(id: string): Promise<ExamPack | null> {
  if (Platform.OS === 'web') {
    const raw = await AsyncStorage.getItem(packKey(id));
    return raw ? (JSON.parse(raw) as ExamPack) : null;
  }
  const { File, Paths } = await import('expo-file-system');
  const file = new File(Paths.document, 'packs', `${id}.json`);
  return file.exists ? (JSON.parse(await file.text()) as ExamPack) : null;
}

async function deletePackFile(id: string): Promise<void> {
  if (Platform.OS === 'web') return AsyncStorage.removeItem(packKey(id));
  const { File, Paths } = await import('expo-file-system');
  const file = new File(Paths.document, 'packs', `${id}.json`);
  if (file.exists) file.delete();
}

export async function getInstalledVersions(): Promise<Record<string, number>> {
  const raw = await AsyncStorage.getItem(PACK_INDEX_KEY);
  return raw ? JSON.parse(raw) : {};
}

function imageUrls(pack: ExamPack): string[] {
  const urls: string[] = [];
  const add = (b: Block) => b.type === 'image' && urls.push(resolveUrl(b.src));
  for (const q of pack.questions) {
    q.statement.forEach(add);
    q.alternatives.forEach((a) => a.image && urls.push(resolveUrl(a.image)));
  }
  return urls;
}

/** Baixa um pacote e deixa as imagens no cache de disco para uso offline. */
export async function installPack(packUrl: string): Promise<ExamPack> {
  const pack = await fetchJson<ExamPack>(resolveUrl(packUrl));
  const urls = imageUrls(pack);
  if (urls.length) await Image.prefetch(urls, 'disk');
  await writePack(pack);
  const index = await getInstalledVersions();
  index[pack.id] = pack.version;
  await AsyncStorage.setItem(PACK_INDEX_KEY, JSON.stringify(index));
  return pack;
}

export async function removePack(id: string): Promise<void> {
  await deletePackFile(id);
  const index = await getInstalledVersions();
  delete index[id];
  await AsyncStorage.setItem(PACK_INDEX_KEY, JSON.stringify(index));
}

export async function loadInstalledPacks(): Promise<ExamPack[]> {
  const index = await getInstalledVersions();
  const packs = await Promise.all(Object.keys(index).map(readPack));
  return packs.filter((p): p is ExamPack => !!p);
}

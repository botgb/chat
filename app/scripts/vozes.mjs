#!/usr/bin/env node
// Gera as vozes dos vídeos do Plus com o VoiceStudio rodando no seu computador
// (https://github.com/debpalash/VoiceStudio), pela API compatível com a da OpenAI.
//
// Passo a passo (dentro da pasta app/, com o VoiceStudio aberto):
//   1. node scripts/vozes.mjs elenco
//        3 vozes diferentes (A, B, C) para cada personagem em scripts/vozes/elenco/.
//   2. Ouça e escolha. Para a voz ficar igual em todas as falas, no VoiceStudio vá em
//      Voice Clone, envie o arquivo escolhido e salve o perfil com o nome do personagem
//      (Gabaritatu, Gabamico, Aprovaca, Radacao, Simulaguia, Passarinho).
//   3. node scripts/vozes.mjs falas --takes 3
//        Gera 3 versões de cada fala em scripts/vozes/takes/ e já usa a 1ª no app.
//        Sem perfil salvo, use a descrição escolhida: --voz gabamico=B --voz aprovaca=A ...
//   4. node scripts/vozes.mjs escolher vidas-03=2 anuncio-08=3
//        Troca a versão usada de uma fala pela que você preferiu.
// O passo "app" roda sozinho no fim de 3 e 4: mede as durações e atualiza src/promos/vozes.ts.
//
// Opções: --url http://localhost:3900  --motor voxcpm2  --video vidas  --sobrescrever
// Licença: o modelo padrão do VoiceStudio (OmniVoice) tem pesos só para uso NÃO comercial.
// Use um motor com pesos liberados para uso comercial (veja docs/roteiros-plus.md).
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const FALAS = JSON.parse(readFileSync(join(APP, 'src/promos/falas.json'), 'utf8'));
const OUT = join(APP, 'scripts/vozes');
const ASSETS = join(APP, 'assets/vozes');

const args = process.argv.slice(2);
const cmd = args[0];
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const many = (name) => args.flatMap((a, i) => (a === `--${name}` ? [args[i + 1]] : []));
const URL_BASE = opt('url', 'http://localhost:3900').replace(/\/$/, '');
const MOTOR = opt('motor', 'voxcpm2');
const NOMES = { gabaritatu: 'Gabaritatu', gabamico: 'Gabamico', aprovaca: 'Aprovaca', radacao: 'Radacao', simulaguia: 'Simulaguia', passarinho: 'Passarinho' };

async function speak({ input, voice = 'default', instructions }, file) {
  const res = await fetch(`${URL_BASE}/v1/audio/speech`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MOTOR, input, voice, instructions, response_format: 'wav', language: 'pt-BR' }),
  });
  if (!res.ok) throw new Error(`VoiceStudio respondeu ${res.status}: ${(await res.text()).slice(0, 300)}`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log('  ✓', file.replace(APP + '/', '').replace(APP + '\\', ''));
}

/** Duração de um WAV em ms, lendo o cabeçalho (fmt e data). */
function wavMs(file) {
  const b = readFileSync(file);
  let byteRate = 0;
  let pos = 12;
  while (pos + 8 <= b.length) {
    const id = b.toString('ascii', pos, pos + 4);
    const size = b.readUInt32LE(pos + 4);
    if (id === 'fmt ') byteRate = b.readUInt32LE(pos + 16);
    if (id === 'data' && byteRate) return Math.round((Math.min(size, b.length - pos - 8) / byteRate) * 1000);
    pos += 8 + size + (size % 2);
  }
  throw new Error(`não consegui ler a duração de ${file}`);
}

async function perfis() {
  try {
    const res = await fetch(`${URL_BASE}/v1/audio/voices`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.voices ?? data.data ?? [];
    return new Set(list.map((v) => String(v.name ?? '').toLowerCase()));
  } catch {
    return new Set();
  }
}

async function elenco() {
  const so = opt('personagem');
  for (const [p, info] of Object.entries(FALAS.personagens)) {
    if (so && so !== p) continue;
    console.log(NOMES[p]);
    for (const [v, desc] of Object.entries(info.vozes)) {
      await speak({ input: info.teste, instructions: desc }, join(OUT, 'elenco', `${p}-${v}.wav`));
    }
  }
  console.log('\nOuça scripts/vozes/elenco/ e escolha uma voz por personagem (veja o passo 2 no topo deste arquivo).');
}

async function falas() {
  const takes = Number(opt('takes', '1'));
  const video = opt('video');
  const escolha = Object.fromEntries(many('voz').map((s) => s.split('=')));
  const salvos = await perfis();
  mkdirSync(ASSETS, { recursive: true });
  for (const [vid, lines] of Object.entries(FALAS.videos)) {
    if (video && video !== vid) continue;
    console.log(`\n${vid}`);
    for (const l of lines) {
      const perfil = NOMES[l.quem];
      const usaPerfil = salvos.has(perfil.toLowerCase());
      const desc = FALAS.personagens[l.quem].vozes[escolha[l.quem] ?? 'A'];
      const req = usaPerfil
        ? { input: l.texto, voice: perfil, instructions: l.direcao }
        : { input: l.texto, instructions: `${desc} Delivery: ${l.direcao}.` };
      for (let n = 1; n <= takes; n++) await speak(req, join(OUT, 'takes', `${l.id}-${n}.wav`));
      const alvo = join(ASSETS, `${l.id}.wav`);
      if (!existsSync(alvo) || args.includes('--sobrescrever')) copyFileSync(join(OUT, 'takes', `${l.id}-1.wav`), alvo);
    }
  }
  app();
}

function escolher() {
  for (const par of args.slice(1).filter((a) => a.includes('='))) {
    const [id, n] = par.split('=');
    copyFileSync(join(OUT, 'takes', `${id}-${n}.wav`), join(ASSETS, `${id}.wav`));
    console.log(`  ${id}: versão ${n}`);
  }
  app();
}

/** Atualiza src/promos/vozes.ts com os arquivos de assets/vozes e suas durações. */
function app() {
  const files = existsSync(ASSETS) ? readdirSync(ASSETS).filter((f) => f.endsWith('.wav')).sort() : [];
  const ids = new Set(Object.values(FALAS.videos).flat().map((l) => l.id));
  const ok = files.filter((f) => ids.has(f.replace(/\.wav$/, '')));
  const lines = [
    '// Gerado por scripts/vozes.mjs (comando "app"). Não edite à mão.',
    '// Vozes gravadas por fala (id da fala → arquivo) e a duração de cada uma, em ms.',
    'export const VOICE_FILES: Record<string, number> = {',
    ...ok.map((f) => `  '${f.replace(/\.wav$/, '')}': require('../../assets/vozes/${f}'),`),
    '};',
    'export const VOICE_MS: Record<string, number> = {',
    ...ok.map((f) => `  '${f.replace(/\.wav$/, '')}': ${wavMs(join(ASSETS, f))},`),
    '};',
    '',
  ];
  writeFileSync(join(APP, 'src/promos/vozes.ts'), lines.join('\n'));
  console.log(`\n${ok.length} vozes ligadas ao app (src/promos/vozes.ts). Os vídeos se ajustam à duração de cada fala.`);
}

const run = { elenco, falas, escolher, app }[cmd];
if (!run) {
  console.log('Uso: node scripts/vozes.mjs elenco | falas [--takes 3] [--voz gabamico=B] | escolher id=n | app');
  process.exit(1);
}
Promise.resolve(run()).catch((e) => {
  console.error('\nErro:', e.message);
  if (/fetch failed|ECONNREFUSED/.test(String(e.message) + String(e.cause))) console.error(`O VoiceStudio está aberto em ${URL_BASE}?`);
  process.exit(1);
});

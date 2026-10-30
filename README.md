# Aprova (nome provisório)

App de celular para estudar para vestibulares com questões de provas reais, no estilo de
aprendizado gamificado: lições curtas, ofensiva diária, XP, vidas, meta do dia e revisão
espaçada dos erros.

## Estrutura

| Pasta | O que é |
|---|---|
| `app/` | App React Native (Expo SDK 58, TypeScript, Expo Router) |
| `content/` | Conteúdo publicado: `manifest.json` + um pacote por prova (JSON + imagens) |
| `pipeline/` | Leitor de provas: PDF → pacote JSON (em construção) |
| `docs/estrategias.md` | Estratégias de engajamento e as fontes públicas usadas |

## Sem servidor de aplicação

O único recurso remoto é **arquivos estáticos** em `content/` (GitHub Pages, Cloudflare R2 etc.).

- `manifest.json` lista vestibulares (com o tempo por questão) e provas (com versão).
- O app baixa só as provas que o aluno escolher, guarda no celular e funciona offline.
- Para corrigir uma prova: edite o pacote, aumente `version`/`packVersion` e publique.
  O app oferece "Atualizar prova".
- Progresso, XP, ofensiva e revisões ficam no aparelho.

A URL do conteúdo fica em `app/app.json` → `expo.extra.contentBaseUrl`.

## Abrir no celular (Expo Go)

1. Instale o **Expo Go** no celular (Play Store ou App Store).
2. No computador, com [Node.js](https://nodejs.org) 20 ou mais novo instalado:

   ```bash
   git clone https://github.com/botgb/chat.git
   cd chat/app
   npm install
   npx expo start
   ```

3. Aparece um QR code no terminal. **Android:** abra o Expo Go e toque em "Scan QR code".
   **iPhone:** aponte a câmera para o QR code.

Computador e celular precisam estar na mesma rede Wi-Fi. Se não estiverem (ou a rede bloquear),
use `npx expo start --tunnel`.

O conteúdo vem direto deste repositório no GitHub (`content/`), então não precisa de servidor.
Para testar conteúdo local: `cd content && python3 serve.py 8787` e rode o app com
`EXPO_PUBLIC_CONTENT_URL=http://IP-DO-COMPUTADOR:8787 npx expo start`.

## Testes

```bash
cd app && npm test && npm run typecheck
```

O pacote `content/demo` tem questões **inventadas** só para testar as telas; não é prova real.

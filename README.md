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

## Rodar localmente

```bash
cd content && python3 serve.py 8787        # serve o conteúdo de teste
cd app && npm install && npx expo start    # abra no Expo Go pelo QR code
```

No celular, troque `contentBaseUrl` pelo IP do computador na rede (ex.: `http://192.168.0.10:8787`).

## Testes

```bash
cd app && npm test && npm run typecheck
```

O pacote `content/demo` tem questões **inventadas** só para testar as telas; não é prova real.

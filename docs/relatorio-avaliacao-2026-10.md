# Relatório de avaliação do app — outubro de 2026

Avaliação do estado atual do app (código no `main`, commit `1eac4f9`), feita com as skills
instaladas: **review-ux-ui** (heurísticas de Nielsen e WCAG 2.1), **onboarding/retention-optimization**,
**expo-design-system / react-native-skills** (arquitetura e desempenho), **sharp-edges /
supply-chain-risk-auditor** (segurança) e **app-marketing-context / competitor-analysis** (mercado).

Base: leitura do código, telas testadas no navegador em tamanho de celular, medição de contraste
das cores do tema e `npm audit`. Não houve teste em celular físico nem com leitor de tela real.

## Resumo

O app tem uma base sólida: identidade visual consistente (claro e escuro), ciclo de jogo completo
(trilha, estrelas, vidas, ofensiva, missões, revisão espaçada), funciona offline e tem 21 testes
automáticos. **O que impede um lançamento hoje não é a interface, é o conteúdo**: o app só tem
7 questões inventadas de demonstração, e ao errar o aluno vê apenas a letra certa, sem explicação.
Há também problemas de contraste em botões e números, e o nome "Aprova" é próximo de uma marca
já conhecida do mesmo mercado.

## Prioridade 0 — resolver antes de lançar

| # | Problema | Onde | Por que importa | Recomendação |
|---|---|---|---|---|
| 1 | **Só 7 questões, inventadas** | `content/manifest.json` | Sem conteúdo real não há produto | Importar o ENEM 2009–2023 (ENEM API) e criar questões inéditas no estilo dos vestibulares |
| 2 | **Sem explicação ao errar** | `app/licao.tsx` | O aluno não aprende com o erro; é a maior reclamação em apps de questões | Campo `explanation` na questão e um painel "Por que é a C?" após responder |
| 3 | **Contraste insuficiente** (WCAG 1.4.3) | `theme.ts` | Difícil de ler no sol ou para quem tem baixa visão | Ver tabela de contraste abaixo |
| 4 | **Nome parecido com marca existente** | app inteiro | "Aprova Total" já é uma plataforma conhecida de preparação para vestibular | Escolher outro nome e consultar o INPI antes de investir em marca |
| 5 | **Dados pessoais sem política de privacidade** | `configuracoes.tsx` | As lojas exigem política de privacidade; a LGPD exige finalidade para cada dado | Pedir só o necessário (telefone não tem uso hoje), publicar a política e preencher os formulários de privacidade das lojas |

### Contraste das cores (mínimo 4,5:1 para texto comum; 3:1 para texto grande e ícones)

| Uso | Claro | Escuro |
|---|---|---|
| Texto principal | 13,5 ✅ | 16,1 ✅ |
| Texto secundário | 4,7 ✅ | 7,6 ✅ |
| **Texto branco em botão verde** ("Verificar", "Continuar") | **2,4 ❌** | **2,0 ❌** |
| Texto branco em botão azul | 3,8 ⚠️ | 3,1 ⚠️ |
| Texto branco em botão vermelho | 3,3 ⚠️ | 3,0 ⚠️ |
| **Números da ofensiva e dos diamantes** na barra | **2,4 / 2,3 ❌** | 8,4 / 8,9 ✅ |
| **Textos de exemplo nos campos** (placeholder) | **1,9 ❌** | **2,4 ❌** |
| Feedback "correta" / "errada" | 3,5 / 4,3 ⚠️ | 4,2 / 3,6 ⚠️ |

✅ passa · ⚠️ só passa para texto grande · ❌ reprova

Correção sugerida: verde mais escuro nos botões (ex.: `#1E9449` já existe como `rightDark`),
números da barra em tons mais fechados no modo claro, e placeholder com `inkSoft`.

## Prioridade 1 — próximas versões

### Experiência do usuário (heurísticas de Nielsen)

| Heurística | Gravidade (0–4) | Achado | Recomendação |
|---|---|---|---|
| 3. Controle e liberdade | 3 | O ✕ da lição sai sem confirmar; as respostas já dadas contam, mas a fase fica sem estrelas | Confirmar "Sair da fase? Seu progresso nesta fase será perdido" |
| 1. Visibilidade do estado | 2 | Tocar numa fase bloqueada não faz nada | Mostrar "Conclua a fase 2 com pelo menos 1 estrela para liberar" |
| 9. Recuperação de erros | 2 | Erro ao baixar prova mostra texto técnico ("HTTP 404") | Mensagem humana: "Não conseguimos baixar a prova. Confira a internet e tente de novo." |
| 6. Reconhecer em vez de lembrar | 2 | "23 D2" na barra é enigmático para quem chega | Mostrar "2023 · dia 2" no painel e explicar a sigla na primeira vez |
| 2. Linguagem do mundo real | 2 | "Sair da conta" e "Senha" sem existir conta; "Efeitos sonoros" sem sons | Esconder até existirem, ou marcar "em breve" |
| 8. Design minimalista | 1 | A aba Assinatura ocupa 1 dos 5 espaços da barra com um plano que ainda não existe | Mover a assinatura para dentro do Perfil até ela funcionar |
| 10. Ajuda | 1 | Não há explicação das regras (vidas, estrelas, diamantes) fora dos painéis | Um "Como funciona" no guia da unidade e na primeira abertura |

### Primeira experiência (onboarding)

Hoje, na primeira abertura, o aluno vê "Escolha uma prova para começar" e cai numa lista técnica.
Sugestão de fluxo curto (3 telas, todas puláveis):
1. "Qual vestibular você vai prestar?" (ENEM, Fuvest, Unicamp…)
2. "Quando é a sua prova?" → contagem regressiva no topo ("faltam 23 dias"), que é um
   motivador forte de retorno.
3. Meta diária (5/10/20) e, **depois da primeira fase concluída**, o pedido para ativar lembretes
   (pedir permissão no momento de valor converte bem mais).

A prova escolhida é baixada sozinha, sem passar pela lista.

### Retenção

O ciclo atual (ofensiva, missões, baús, revisão) é bom. Faltam: **contagem regressiva até a
prova**, **resumo semanal** ("você acertou 72% em Biologia, +8% que na semana passada") e
**revisão dos erros com explicação**, que transforma o erro em motivo para voltar.

### Acessibilidade (além do contraste)

- Imagens das questões têm a descrição genérica "Imagem da questão"; o conteúdo precisa de um
  texto alternativo por imagem (WCAG 1.1.1).
- O resultado "correta/errada" não é anunciado ao leitor de tela; usar `accessibilityLiveRegion`
  no rodapé da lição (WCAG 4.1.3).
- Com fonte do sistema muito grande, a barra de cima pode estourar; limitar a escala nos números
  ou quebrar em duas linhas.
- Pontos positivos: botões, abas, fases, alternativas e campos já têm rótulos para leitor de tela,
  e a cor nunca é a única pista (letra, texto e cor juntos).

### Desempenho (react-native-skills)

| Achado | Impacto | Recomendação |
|---|---|---|
| A trilha desenha **todas as fases de uma vez** num `ScrollView` | Com o ENEM completo serão centenas de fases e animações; o app fica lento em celulares simples | Lista virtualizada (`FlatList`/`FlashList`) por unidade |
| O cronômetro atualiza a tela da lição **a cada segundo**, redesenhando enunciado e imagens | Gasto de bateria e engasgos | Isolar o cronômetro num componente próprio e memorizar a questão (`React.memo`) |
| O estado global (`AppState`) recria o objeto a cada mudança | Qualquer resposta redesenha todas as abas | `useMemo` no valor do contexto e separar progresso de configurações |
| Todas as provas baixadas ficam na memória | Com 15 anos de ENEM (~2.700 questões) ainda é aceitável, mas cresce | Carregar só a prova escolhida |

### Sistema de design (expo-design-system)

- Ainda há cores fixas fora do tema: faixas de Missões (`#9B5CFF`), Assinatura (`#2B2D42`) e
  Ranking (`#5C4300`). Levar para `theme.ts`.
- O cabeçalho "‹ Título" está repetido em Provas e Configurações, e os cartões com borda grossa
  se repetem em várias telas. Extrair componentes `ScreenHeader` e `Card`.

## Segurança (sharp-edges e supply-chain-risk-auditor)

| Achado | Gravidade | Recomendação |
|---|---|---|
| **Conteúdo baixado não é validado**: o app confia em qualquer JSON vindo do GitHub; um arquivo malformado derruba o app | Média | Validar o formato ao baixar e incluir um hash de cada pacote no `manifest.json` |
| Quem tiver permissão de escrita no repositório altera as provas de todos os alunos na hora | Média | Proteger o branch `main` (revisão obrigatória) e publicar o conteúdo a partir de um branch próprio |
| Nome, e-mail e telefone ficam salvos sem criptografia no celular | Baixa | Guardar só o necessário; se continuar, usar `expo-secure-store` |
| XP, diamantes e estrelas ficam no celular e podem ser editados | Baixa hoje | Só importa se houver ranking online; aí a pontuação precisa ser validada num servidor |
| `npm audit`: 13 alertas (2 altos) em bibliotecas de produção | Baixa | Todos estão nas **ferramentas de build do Expo** (`@expo/cli`, `zod`, `glob`, `minimatch`), não no código que vai para o celular. A "correção" sugerida rebaixaria o Expo para a versão 51, o que quebraria o app: o certo é atualizar o Expo quando sair a versão corrigida |
| Segredos no código | Nenhum | Nenhuma chave, token ou senha encontrada no repositório |

## Mercado (app-marketing-context / competitor-analysis)

- **Concorrentes diretos** no Brasil: plataformas de preparação para o ENEM e vestibulares com
  bancos de questões e videoaulas. O diferencial do app é o formato de **jogo curto e diário**,
  que quase nenhuma delas tem. Vale reforçar isso no nome, ícone e nas imagens da loja.
- Palavras-chave óbvias para a loja: "ENEM", "vestibular", "questões", "simulado", "Fuvest".
  O próximo passo é rodar `keyword-research` e `competitor-analysis` com o nome definitivo.
- Antes de publicar: política de privacidade, ícone próprio, capturas de tela da loja e
  classificação etária. A skill `eas-app-stores` cobre a publicação.

## O que já funciona bem

1. Identidade visual própria e consistente, com ilustrações vetoriais e modo escuro completo.
2. Ciclo de jogo completo e testado (21 testes): fases, estrelas, vidas, ofensiva com
   congelamento, missões, baús, diamantes e revisão espaçada.
3. Funciona offline e não depende de servidor próprio.
4. Questão na vertical com cronômetro no tempo real da prova, que é o diferencial pedido.
5. Exclusão de conta com confirmação dupla e lembretes que só pedem permissão quando ativados.

## Ordem sugerida

1. Corrigir o contraste (rápido, baixo risco).
2. Importar o ENEM e adicionar explicações às questões.
3. Confirmação ao sair da lição, aviso em fase bloqueada e mensagens de erro claras.
4. Onboarding com escolha do vestibular, data da prova e contagem regressiva.
5. Desempenho da trilha e do cronômetro, antes de ter centenas de fases.
6. Validação do conteúdo baixado e proteção do branch.
7. Nome definitivo, política de privacidade e preparação para as lojas.

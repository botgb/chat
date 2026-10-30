# Estratégias de engajamento e aprendizado

Baseado em fontes públicas sobre o Duolingo (blog oficial, artigo acadêmico e análises de terceiros).
Não copiamos código, visual, marca ou mascote: usamos apenas ideias gerais de gamificação e
técnicas de estudo, adaptadas ao vestibular.

## 1. Repetição espaçada (o "quando revisar")

O Duolingo usa *half-life regression* (Settles & Meeder, ACL 2016): estima a "meia-vida" de cada
item na memória e agenda a revisão para quando a chance de lembrar cai. Segundo o blog deles, o
modelo errou cerca de metade do que o sistema Leitner usado na primeira versão.

**No nosso app:** cada questão errada (e cada *assunto*) entra numa fila de revisão.
Versão 1: caixas de Leitner simples (1, 3, 7, 14, 30 dias), que funcionam offline e sem servidor.
Versão futura: estimar meia-vida por assunto com o histórico do próprio aparelho.

## 2. Escolha do conteúdo (o "o que mostrar")

O Duolingo tem um modelo ("Birdbrain") que ajusta a dificuldade ao aluno.

**No nosso app:** priorizar matérias/assuntos com mais erros e questões de dificuldade
próxima ao nível do aluno; misturar revisão com questões novas em cada lição.

## 3. Mecânicas de hábito

| Mecânica | Ideia | Adaptação ao vestibular |
|---|---|---|
| Ofensiva (streak) | Dias seguidos estudando | Conta dia se cumprir a meta diária; "congelamento" para 1 dia perdido |
| XP | Pontos por atividade | XP por acerto, bônus por responder dentro do tempo da prova |
| Meta diária | Pequena e alcançável | Ex.: 5, 10 ou 20 questões por dia |
| Vidas | Limitam erros por sessão | Opcional; desligável no "modo simulado" |
| Trilha | Lições desbloqueadas em sequência | Trilha por vestibular → matéria → assunto |
| Ligas | Ranking semanal (~30 pessoas) | Fica para depois (precisa de servidor) |

## 4. Cuidados (críticas conhecidas)

- XP e ofensiva podem virar "fim em si" e incentivar responder rápido sem aprender.
  → XP de acerto vale mais que XP de velocidade; mostrar resolução/explicação após o erro.
- Recompensas externas podem reduzir motivação intrínseca.
  → Mostrar progresso real: % de acerto por matéria e evolução ao longo do tempo.
- Vidas punem quem está aprendendo. → Modo prática sem vidas; vidas só no modo desafio.

## 5. Específico de vestibular

- Cronômetro por questão no tempo médio da prova (ENEM ≈ 3 min por questão).
- Modo simulado: prova inteira ou bloco, no tempo oficial, sem dicas.
- Filtros por vestibular, ano, matéria e assunto.

## Fontes

- Blog Duolingo: https://blog.duolingo.com/how-we-learn-how-you-learn
- Settles & Meeder (2016), A Trainable Spaced Repetition Model for Language Learning: https://preview.aclanthology.org/fix_video/P16-1174.pdf
- Ilídio et al. (2026), Revisiting Half-Life Regression: https://proceedings.mlr.press/v339/ilidio26a.html
- Críticas à gamificação: https://dev.to/pocket_linguist/why-duolingos-gamification-works-and-when-it-doesnt-1d4
- Ligas e vidas (secundário): https://nogood.io/blog/duolingo-case-study/

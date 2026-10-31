# Roteiros dos vídeos do Plus

Vídeos curtos exibidos ao fim de cada lição para quem não tem o Plus, sorteados sem repetir o
anterior. São animações feitas no próprio app (não arquivos de vídeo): funcionam offline e não
pesam no download. Os personagens conversam em balões de fala, mexem a boca enquanto falam,
pulam ao começar cada fala e se inclinam para quem está falando.

**Formato comum (10 s):**

| Tempo | O que acontece | Som |
|---|---|---|
| 0–0,6 s | Os personagens entram pelos lados (diálogo) ou de baixo (monólogo) | pop |
| 0,8–3,8 s | **Fala 1, o problema** | boing + voz 1 |
| 3,85 s | Troca de cena | whoosh |
| 4–7 s | **Fala 2, a solução no Plus** | boing + voz 2 |
| 7–10 s | **Fechamento**: selo "Plus", benefício e botão "Conhecer o Plus" | vinheta, ding |
| 0–5 s | Botão no canto mostra "Pular em 5… 4…" | |
| 5 s em diante | "Pular" liberado | |

A trilha de fundo toca baixinho o vídeo inteiro (mais baixa ainda quando há voz gravada).
Os sons respeitam a opção **Efeitos sonoros** das configurações e a chave de silencioso do
celular, e não interrompem a música que a pessoa estiver ouvindo. Efeitos e trilha foram
sintetizados do zero por `app/scripts/sons.py` (sem direitos de terceiros).

## 1. Vidas — Gabamico e Gabaritatu (azul)
- **Gabamico:** "Acabaram suas vidas de novo, Gabaritatu?" Cinco corações se apagam.
- **Gabaritatu:** "Que nada. No Plus, minhas vidas não acabam." Um coração volta com ∞.
- **Fechamento:** "Vidas ilimitadas".

## 2. Simulado — Simuláguia, sozinha (vermelho)
- **Simuláguia:** "Questão solta é aquecimento." Cartões de questão espalhados.
- **Simuláguia:** "Quer passar? Treine a prova inteira, no tempo oficial." Cronômetro de 5h30.
- **Fechamento:** "Simulados completos".

## 3. Estatísticas — Rãdação e Aprovaca (roxo)
- **Rãdação:** "Eu acho que vou bem em tudo."
- **Aprovaca:** "Acha? No Plus eu sei: Física, 38%." As barras sobem; Física fica vermelha.
- **Fechamento:** "Estatísticas por assunto".

## 4. Ofensiva — Gabaritatu e Passarinho (verde-azulado)
- **Gabaritatu:** "120 dias de ofensiva! Mas amanhã eu viajo…" A chama balança.
- **Passarinho:** "Relaxa. No Plus, o congelamento segura pra você." Um escudo de gelo envolve a chama.
- **Fechamento:** "Ofensiva protegida".

## 5. Sem anúncios — Gabamico, sozinho (laranja)
- **Gabamico:** "Sim, eu sou um anúncio." Um cartão "Anúncio" aparece.
- **Gabamico:** "No Plus, eu sumo. Nada de interrupção." Um X cobre o cartão, que sai da tela.
- **Fechamento:** "Estude sem anúncios".

## 6. Elenco — Rãdação e Gabaritatu, com o time (azul-escuro)
- **Rãdação:** "E aí, time? Bora estudar?" Os outros quatro mascotes entram um por um.
- **Gabaritatu:** "Bora gabaritar! Com o Plus, tudo liberado!" O time inteiro pula junto.
- **Fechamento:** "Plus: tudo liberado".

## Vozes para gravar

Cada fala tem cerca de 2,5 s. Grave em MP3, sem silêncio no começo, e salve com o nome
indicado em `app/assets/vozes/`. Depois, registre os arquivos em `VOICES`, no arquivo
`app/src/lib/promoAudio.ts` (o comentário ali mostra como). Enquanto não houver voz, o vídeo
toca só os efeitos e a trilha.

| Personagem | Voz sugerida | Arquivos |
|---|---|---|
| Gabaritatu | jovem, confiante, tranquilo | vidas-2, ofensiva-1, elenco-2 |
| Gabamico | jovem, zoeiro, rápido e debochado | vidas-1, sem-anuncios-1, sem-anuncios-2 |
| Aprovaca | jovem adulta, segura, levemente irônica | estatisticas-2 |
| Rãdação | jovem, descontraído, um pouco sonhador | estatisticas-1, elenco-1 |
| Simuláguia | adulta, firme, tom de treinadora | simulado-1, simulado-2 |
| Passarinho | jovem, calmo, voz macia | ofensiva-2 |

| Arquivo | Personagem | Fala | Direção |
|---|---|---|---|
| vidas-1.mp3 | Gabamico | Acabaram suas vidas de novo, Gabaritatu? | provocando, rindo |
| vidas-2.mp3 | Gabaritatu | Que nada. No Plus, minhas vidas não acabam. | despreocupado, convencido |
| simulado-1.mp3 | Simuláguia | Questão solta é aquecimento. | seca, firme |
| simulado-2.mp3 | Simuláguia | Quer passar? Treine a prova inteira, no tempo oficial. | motivando, ritmo de treino |
| estatisticas-1.mp3 | Rãdação | Eu acho que vou bem em tudo. | otimista, distraído |
| estatisticas-2.mp3 | Aprovaca | Acha? No Plus eu sei: Física, 38%. | irônica, depois objetiva |
| ofensiva-1.mp3 | Gabaritatu | 120 dias de ofensiva! Mas amanhã eu viajo… | orgulhoso, depois preocupado |
| ofensiva-2.mp3 | Passarinho | Relaxa. No Plus, o congelamento segura pra você. | calmo, acolhedor |
| sem-anuncios-1.mp3 | Gabamico | Sim, eu sou um anúncio. | quebrando a quarta parede, cínico |
| sem-anuncios-2.mp3 | Gabamico | No Plus, eu sumo. Nada de interrupção. | brincalhão |
| elenco-1.mp3 | Rãdação | E aí, time? Bora estudar? | animado, chamando a galera |
| elenco-2.mp3 | Gabaritatu | Bora gabaritar! Com o Plus, tudo liberado! | empolgado, fechando com energia |

**Licença:** use apenas vozes sintéticas cujo plano permita uso comercial em app publicado, e
guarde o comprovante (print da página de termos e do plano). Não imite a voz de pessoas reais.

## Regras de exibição
- Aparece ao tocar em "Continuar" no fim de uma lição, para quem não tem o Plus.
- Sorteio aleatório, sem repetir o vídeo anterior.
- "Conhecer o Plus" abre a aba Assinatura; "Pular" e o fim do vídeo voltam para a trilha.
- Prévia para desenvolvimento: `/promo-preview?id=vidas` (ou simulado, estatisticas, ofensiva,
  sem-anuncios, elenco).

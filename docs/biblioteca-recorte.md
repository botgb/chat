# Biblioteca de recorte (cutout) dos personagens

Os personagens por matéria são bonecos de papel digitais: cada parte é uma peça separada,
trocada ou girada a cada quadro, como na animação de recorte. Tudo é vetorial e montado no
próprio app, então não pesa no download.

Arquivos: `app/src/rig/` (peças, bibliotecas, montagem e sincronia labial).
Prévia em desenvolvimento: `/rig-preview` (vistas de todos) e `/rig-preview?id=histopotamo`
(biblioteca completa de um personagem).

## Por personagem (13)
- **Cabeça em camadas**: formato da cabeça, orelhas e chapéu (fixos); focinho, nariz e
  bigodes (deslizam quando o personagem vira); óculos e bicos (por cima dos olhos).
- **Pontos de encaixe** dos olhos e da boca.
- **Roupa**: cores do tronco, mangas e calça, estampa da frente.
- **Objeto na mão** (frasco, lupa, livro, megafone, caneta, pena, xícara).

## Vistas (6)
Frente, 3/4, perfil e costas, mais 3/4 e perfil espelhados. Ao virar, o rosto desliza para
o lado, o olho de longe estreita (3/4) ou some (perfil), o tronco afina e os tênis apontam
para a frente.

## Bibliotecas compartilhadas
- **Olhos (13)**: neutro, aberto, arregalado, fechado, semicerrado, feliz, triste, raiva,
  surpreso, olhando para a esquerda, olhando para a direita, sono, choro. Pálpebra, pupila
  e sobrancelha são peças separadas e inclinam para o lado certo de cada olho.
- **Bocas (17)**: repouso, sorriso, sorrisão, A, E, I, O, U, M/B/P, F/V, L, S, grito, nojo,
  língua de fora, triste, "ohh".
- **Mãos (7)**: aberta, punho, apontando, joinha, segurando, tchau, paz.
- **Membros segmentados**: braço e antebraço (ombro e cotovelo), coxa e canela (quadril e
  joelho), cada um girando de forma independente; o objeto segue a mão sem girar.

## Estilo do traço (técnicas da skill animation-studio)
- **Contorno de tinta** (#2A2320) em todas as peças: mais grosso no corpo, mais fino no rosto.
- **Hachura** diagonal clara nas roupas e calças, como lápis sobre papel.
- **Traço "fervendo"**: cada camada (pernas, braços, tronco, cabeça) tem 3 variações com um
  desvio mínimo, trocadas a cada 2 quadros, o que dá vida mesmo com o boneco parado.
- **Sombra no chão**, que encolhe quando o boneco estica ou pula.
- **Estica e achata** a partir dos pés (`sx`, `sy`): agachar antes de pular (antecipação),
  esticar no ar, achatar ao cair e assentar.
- **Mãos por alvo** (`handLTarget`, `handRTarget`): cinemática inversa calcula ombro e
  cotovelo, sempre com o cotovelo para fora do corpo.
- Desenho de trás para a frente: casco, pernas, braço de longe, tronco, braço da frente,
  pescoço, cabeça, rosto, objeto.

## Animação a 24 quadros por segundo
- O motor dos vídeos roda a 24 fps.
- **Sincronia labial**: cada fala vira uma sequência de bocas pelo texto (vogais, M/B/P,
  F/V, L, S…), dividindo o tempo da fala; com voz gravada, usa a duração real. Cada boca fica
  pelo menos 2 quadros, e ao juntar sons curtos a vogal tem prioridade. Falas em maiúsculas
  usam a boca de grito.
- Balanço do corpo ao falar, tremida e respiração mudam a cada 2, 4 e 12 quadros, para
  manter o jeito de papel.

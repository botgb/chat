# Vídeos do Plus

Vídeos exibidos ao fim de cada lição para quem não tem o Plus, sorteados sem repetir o
anterior. Podem ser pulados depois de 5 s. São animações feitas no próprio app (não arquivos
de vídeo): funcionam offline e quase não pesam no download.

## Estilo: animação de recorte (cutout)
- **Cenários desenhados** em papel recortado: quarto à noite, biblioteca e sala de aula
  (`app/scripts/cenarios.py`). Bordas cortadas à mão e sombra de papel em cada peça.
- **12 quadros por segundo**, de propósito: o movimento anda em degraus, como recorte.
- Personagens se movem como peças rígidas: deslizam, pulam, tremem e balançam o corpo
  inteiro enquanto falam; a boca abre e fecha a cada quadro.
- **Câmera com cortes secos**: closes, cortes rápidos e pausas dramáticas.
- Os personagens e cenários são todos originais do app.

Arquivos: falas em `app/src/promos/falas.json`, roteiros (câmera, movimentos e sons) em
`app/src/promos/roteiros.ts`, motor em `app/src/promos/timeline.ts`. Prévia para
desenvolvimento: `/promo-preview?id=vidas` (ou `anuncio`, `assinatura`).

## 1. Vidas (quarto) — Gabamico e Gabaritatu
1. Gabamico resolve uma questão: "Essa eu sei! É a letra C!" Buzina, um coração some.
2. "Tá... letra B?" Outro coração some.
3. Cortes rápidos: mais três questões erradas, os cinco corações acabam.
4. Close: "EU SÓ QUERIA ESTUDAR!"
5. O Gabaritatu surge devagar, de olhos arregalados e sorrisão: "Já pensou em... errar infinitamente?"
6. Gabamico: "...Quê?"  Gabaritatu: "Com o Aprova Plus, você tem VIDAS INFINITAS!"
7. Chuva de corações; Gabamico comemora: "ENTÃO POSSO ERRAR O QUANTO QUISER?!"  "Pode!"
8. Pausa dramática, close: "Só não recomendo fazer isso no ENEM."
9. Final: **APROVA PLUS** — Vidas infinitas. Zero anúncios.

## 2. Anúncio (biblioteca) — Rãdação e Aprovaca
1. Rãdação termina uma fase com três estrelas: "Finalmente! Agora vou estudar mais uma!"
2. Aprovaca entra na frente da câmera com a placa ANÚNCIO. "Sai da frente!" / "Não posso. Sou um anúncio."
3. "MAS EU QUERO ESTUDAR!" / "Então assina o Plus."
4. Silêncio, close no Rãdação: "Você tá fazendo propaganda... dentro de uma propaganda?"
5. "Sim." Pausa. Close olhando para a câmera: "E tá funcionando?"
6. Final: **APROVA PLUS** — Estude sem anúncios e com vidas infinitas.

## 3. Assinatura (sala de aula) — Passarinho e Simuláguia
1. Passarinho, suando, diante do calendário: "FALTAM 30 DIAS PRO VESTIBULAR!"
2. Simuláguia chega de óculos escuros: "E quantas questões você resolveu hoje?" / "Duas." / "DUAS?!"
3. "Acabaram minhas vidas..." Close: ela tira os óculos devagar. "Isso é um problema."
4. Pausa dramática. "Que eu posso resolver por uma pequena quantia mensal."
5. "VOCÊ TÁ ME VENDENDO UMA ASSINATURA?!" / "E você tá perdendo tempo discutindo comigo."
6. Final: **APROVA PLUS** — Vidas infinitas. Sem anúncios. Mais tempo estudando.

## Sons
Efeitos sintetizados do zero (`app/scripts/sons.py`): pop, whoosh, boing, ding, vinheta,
buzina de erro, coração perdido, "tchan" dramático e festa, mais uma trilha de fundo em loop
que fica mais baixa quando há voz. Tudo respeita a opção **Efeitos sonoros**, a chave de
silencioso do celular e a música que a pessoa estiver ouvindo.

## Vozes (VoiceStudio)
As vozes são geradas no seu computador pelo [VoiceStudio](https://github.com/debpalash/VoiceStudio),
com o script `app/scripts/vozes.mjs`. A duração de cada fala gravada ajusta o vídeo sozinha.

**Licença, leia antes:** o VoiceStudio é livre (AGPL), mas cada modelo de voz tem a própria
licença. O modelo padrão (OmniVoice) tem pesos **CC-BY-NC, só para uso não comercial**, então
não serve para um app pago. Use um motor com pesos liberados para uso comercial e que fale
português, por exemplo:
- **VoxCPM2** (padrão do script): cria vozes a partir de uma descrição. Confirme a licença dos
  pesos na página do modelo antes de publicar.
- **dots.tts**: Apache-2.0 (código e pesos), 24 idiomas.
- **MOSS-TTS-Nano**: Apache-2.0, fala português, clona a partir de um áudio de referência.

Guarde um print da licença do modelo usado. Não clone a voz de pessoas reais sem autorização.

**Passo a passo** (na pasta `app/`, com o VoiceStudio aberto e o motor instalado):
1. `node scripts/vozes.mjs elenco` gera 3 vozes diferentes (A, B, C) por personagem em
   `scripts/vozes/elenco/`, todas lendo uma frase de teste.
2. Ouça e escolha. Para a voz ficar idêntica em todas as falas, no VoiceStudio abra Voice
   Clone, envie o arquivo escolhido e salve o perfil com o nome do personagem: Gabaritatu,
   Gabamico, Aprovaca, Radacao, Simulaguia ou Passarinho.
3. `node scripts/vozes.mjs falas --takes 3` gera 3 versões de cada fala em
   `scripts/vozes/takes/` e já liga a 1ª ao app. Quem não tiver perfil salvo usa a descrição
   escolhida: `--voz gabamico=B --voz aprovaca=A`. Para gerar um vídeo só: `--video vidas`.
4. `node scripts/vozes.mjs escolher vidas-03=2 anuncio-08=3` troca a versão de uma fala.
5. Reinicie o Expo e assista. Para gerar com outro motor: `--motor dots-tts`.

As descrições das vozes e a direção de cada fala (o tom) estão em `app/src/promos/falas.json`.

| Personagem | Voz A | Voz B | Voz C |
|---|---|---|---|
| Gabaritatu | jovem confiante, voz quente | adolescente convencido | locutor calmo e meio assustador |
| Gabamico | adolescente elétrico e anasalado | voz rouca de comediante | agudo, de desenho animado |
| Aprovaca | jovem seca e sarcástica | jovem articulada e mandona | voz grave, irônica |
| Rãdação | artista sonhador | tranquilo e rouco | dramático e teatral |
| Simuláguia | treinadora firme | vendedora esperta, voz grave | locutora esportiva |
| Passarinho | adolescente ansioso | suave e nervoso | agudo e em pânico |

## Regras de exibição
- Aparece ao tocar em "Continuar" no fim de uma lição, para quem não tem o Plus.
- Sorteio aleatório, sem repetir o vídeo anterior.
- "Pular" liberado depois de 5 s. "Conhecer o Plus" abre a aba Assinatura.

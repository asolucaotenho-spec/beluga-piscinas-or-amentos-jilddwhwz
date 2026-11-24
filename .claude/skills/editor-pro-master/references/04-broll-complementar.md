# 04 — B-roll e vídeos complementares pela temática da fala

Princípio Pro Master: **o espectador VÊ o que a pessoa DIZ, no momento em que diz.** Cada
substantivo concreto, número, ferramenta ou metáfora vira imagem. Isso é o que torna o vídeo
"caro".

## 1. Mapa fala → tipo de complemento

| Quando a fala tem… | Complemento | Exemplo nas refs |
|---|---|---|
| Preço / número | Número gigante 3D ou keyword em ouro; moeda/dinheiro 3D | V1 "R$200", "R$1000", moeda |
| Lista ("3 motivos") | Objeto-capítulo (jornal "MOTIVOS 1 2 3") + número 3D em cada tópico | V1 10, 12, 29, 45 s |
| Ferramenta / app / marca | Logo 3D glossy flutuando ao lado da cabeça | V1 CapCut, DaVinci; V4/V5 Premiere, CapCut, DaVinci |
| Plataforma / rede social | Fila de ícones passando com blur | V1 57–59 s |
| Objeto concreto | Insert real do objeto (close, macro, overhead) | V2 telefone, caderno, caneta; V3 caixas de mudança |
| Lugar / mudança | Plano do lugar, caixas, aeroporto, placa | V3 "Brasília", aeroporto |
| Conceito abstrato | Metáfora visual gerada por IA no mesmo grade | V3 "salto evolutivo" (pessoa caindo no fogo), "escada", "cérebro" |
| Passagem de tempo | Contador de anos sobre b-roll em card | V3 1990→2024 |
| Prova / bastidor | Card arredondado com gravação de tela/bastidor; "split" pessoa+tela | V1 80–85 s, V3 24–36 s |
| Produto digital | Tela gravada em perspectiva 3D com DOF; grade de templates | V4 16–20, 26–28 s; V5 26–29, 44–49 s |
| Pergunta retórica / dúvida | P&B + pose pensativa + texto com "?" grande | V5 2–3, 13–17 s |
| Emoção / memória | Close extremo (boca, olhos, mãos), luz dura, desfoque | V2 47–48 s; V3 47 s P&B |
| Prova social | Print/Reels de outra pessoa dentro do vídeo | V3 66–68 s |

## 2. Densidade

- Vídeo de 60 s: **8–15 inserts** (b-roll, 3D, tela). Nenhum trecho > 6 s só com a cara falando
  sem um elemento novo (título não conta como elemento novo se for o mesmo cartão).
- Inserts curtos: 0,6–2 s. Montagens de bastidor: 0,5–0,9 s por plano, no tempo da trilha.
- Voz continua por cima do b-roll (b-roll geralmente **mudo** ou com som ambiente baixo + SFX).

## 3. Fontes de b-roll (ordem de preferência)

1. **Material do próprio cliente** (bruto da gravação, fotos, bastidores, produto, equipe).
2. **Gravação de tela** (site, app, sistema, planilha, orçamento) — em perspectiva 3D.
3. **Geração por IA** (imagem→vídeo) para metáforas — prompt sempre incluindo o grade:
   "cinematic, warm tungsten light, teal shadows, shallow depth of field, film grain, 35mm,
   <cor accent do cliente> highlights, vertical 9:16".
4. **Banco de imagens** (Pexels/Pixabay/Storyblocks/Artgrid) — passar pelo mesmo `pm_grade.sh`.
5. **Elementos 3D/ícones** recoloridos na paleta do cliente.

## 4. Coerência

- Todo b-roll passa pelo **mesmo look** do vídeo principal (`pm_grade.sh` com o mesmo `--accent`).
- B-roll de baixa qualidade (celular, bastidor) → assumir estética "câmera na mão": card com
  cantos arredondados, leve vinheta, grão maior. Nunca tentar esconder; transformar em estilo.
- Recorte de pessoa + cena nova (V3 estádio/escada) só com máscara limpa (Magic Mask/Remove BG).

## 5. Exemplo de adaptação de tema (cliente de piscinas, ilustrativo)

| Fala | Complemento |
|---|---|
| "orçamento em 24 horas" | relógio/ampulheta 3D na cor accent + keyword "24 HORAS" |
| "piscina de fibra ou vinil?" | split card: fibra à esquerda / vinil à direita, whip entre eles |
| "água cristalina" | macro de água com cáusticas de luz, slow motion, halation |
| "obra limpa" | timelapse da obra em card arredondado + contador de dias |
| "manutenção" | close de mãos/equipamento, P&B → cor quando fica pronto |

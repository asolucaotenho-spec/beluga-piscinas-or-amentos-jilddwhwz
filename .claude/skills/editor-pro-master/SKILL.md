---
name: editor-pro-master
description: Estilo de edição "Pro Master" para vídeos verticais/horizontais de redes sociais (Reels, TikTok, Shorts) — color grade cinematográfico, títulos cinéticos hierárquicos com glow, transições com blur/whip/glitch, elementos 3D, b-roll temático e mix a -14 LUFS. Use SEMPRE que o usuário pedir para "editar no estilo pro master", "pro master", "editor pro master", "edição pro master" ou mencionar esse padrão de edição para qualquer cliente. Só a paleta de cor, a trilha e o "sabor" dos efeitos mudam por cliente; todo o resto do sistema é fixo.
---

# Editor Pro Master

Sistema de edição extraído de 5 vídeos de referência (ver `references/06-breakdown-referencias.md`
e `assets/moodboard/`). Quando o usuário pedir **"edita no estilo pro master"**, aplique este
sistema inteiro. **A única coisa que muda por cliente é: paleta de cor, trilha/SFX e o tom dos
efeitos** (mais sóbrio ou mais explosivo). Ritmo, hierarquia de texto, estrutura de grade,
transições e regras de b-roll são sempre os mesmos.

## O DNA em 12 regras (decore isso)

1. **Nada de frame parado sem informação.** A cada 0,7–1,5 s algo muda: um título, um zoom, um
   b-roll, um elemento 3D. Corte de câmera real a cada 2–5 s; em montagens, 0,5–0,9 s por plano.
2. **Hierarquia de texto em 3 níveis:** linha de apoio pequena → PALAVRA-CHAVE gigante → cauda
   pequena. Nunca legenda "corrida" de bloco inteiro. Só a palavra que carrega a ideia é grande.
3. **Palavra-chave = cor de destaque do cliente + glow.** Todo o resto em branco-creme
   (`#F4EFE6`), nunca branco puro.
4. **Duas tipografias, contraste máximo:** (a) sans condensada/pesada + (b) serif itálica de alto
   contraste. Mistura das duas na mesma frase é a assinatura ("talking *head*").
5. **Texto vive no espaço do sujeito**: atrás/ao lado do corpo, nunca no rodapé "de TV". Centro
   ótico na altura do peito (55% da tela). Às vezes o texto passa **atrás** da pessoa (recorte).
6. **Tudo entra e sai com desfoque.** Entrada: blur→foco + escala 104–130% → 100% em 6–10 frames.
   Saída: blur + fade em 4–5 frames. Corte seco de texto é proibido.
7. **Grade cinematográfico quente**: pele quente, highlights cremosos, pretos ricos (nunca
   lavados), sombras levemente frias/esverdeadas, halation nos pontos de luz, grão fino.
8. **Luz motivada e prática à vista**: abajur, luminária, janela, letreiro. Fundo sempre com
   profundidade (bokeh, f/1.8–2.8). Sujeito separado do fundo por luz.
9. **P&B de ênfase**: 1–3 s em preto e branco quando a fala é uma "verdade dura" ou contraste
   (antes/depois, erro/acerto). A palavra-chave continua colorida no P&B.
10. **B-roll literal e imediato**: se a pessoa fala "telefone", "cérebro", "R$1000", "DaVinci" —
    aparece na hora (objeto 3D, ícone, cena gerada, tela gravada). Ver `references/04`.
11. **Transições com movimento, não com "efeito de template"**: blur-cut, whip com motion blur,
    zoom-punch, flash, glitch/estática, cartão arredondado que encolhe. SFX em todas.
12. **Áudio**: voz na frente, trilha sempre presente por baixo (~ -20 dB, ducking), SFX em cada
    título/transição, master a **-14 LUFS**, true peak -1 dB.

## Fluxo de trabalho (siga na ordem)

1. **Perfil do cliente** — procure `clients/<slug-do-cliente>.json`. Se não existir, copie
   `clients/_template.json`, preencha com o que o usuário informou e **pergunte só o que faltar**
   (cores da marca em HEX, tom: sóbrio/equilibrado/explosivo, gênero de trilha). Nunca invente a
   paleta de um cliente real.
2. **Escolha a família visual** (ver `references/01-dna-visual.md`):
   - **IMPACTO** (V1) — externa/dia, CAIXA-ALTA condensada, números 3D, gradiente metálico. Para
     vendas, autoridade, listas ("3 motivos"), preço, comparação.
   - **EDITORIAL** (V2/V3/V4) — noite/interior, serif itálica, clima de cinema. Para storytelling,
     bastidores, emoção, marca premium.
   - **CLEAN** (V5) — interior aconchegante, sans pesada com tracking negativo, UI/telas. Para
     produto, tutorial, SaaS, "como funciona".
   Pode misturar: base de uma família + palavras-chave de outra.
3. **Beat sheet** — transcreva a fala (com tempos por palavra) e, frase a frase, decida:
   título (qual linha é keyword?), b-roll/elemento, transição, SFX, grade (cor ou P&B), zoom.
   Use o modelo em `references/07-adaptacao-cliente.md` → "Beat sheet".
4. **Execute** — com os scripts (ffmpeg) ou gere o plano para o NLE do usuário:
   - `scripts/pm_fonts.sh` — instala as fontes (Anton, Inter, Instrument Serif, Playfair, Bebas).
   - `scripts/pm_cut.py` — monta a timeline com transições de assinatura, zoom-punch e P&B.
   - `scripts/pm_grade.sh` — color grade por look (`golden` / `tungsten` / `cozy` / `mono`)
     com `--accent`/`--shadow` do cliente, halation, grão e vinheta.
   - `scripts/pm_titles.py` — títulos cinéticos e legendas (ASS/libass) a partir de cartões JSON,
     já com a paleta do cliente (presets `impacto`, `editorial`, `clean`, `legenda`).
   - `scripts/pm_mix.sh` — voz tratada + trilha com ducking + SFX nos tempos + -14 LUFS.
   Ordem: cortar → grade → títulos → mix. Detalhes e equivalentes em DaVinci/Premiere/CapCut:
   `references/08-pipeline.md`.
5. **QA** (checklist no fim de `references/07-adaptacao-cliente.md`): ritmo, legibilidade em
   celular, safe zones (topo 12%, base 20%, lateral direita 15% livres de texto), acentos, -14 LUFS.

## Mapa de referências

| Arquivo | Conteúdo |
|---|---|
| `references/01-dna-visual.md` | Cor, iluminação, blur, gradientes, grão, halation, VFX por família |
| `references/02-titulos-legendas.md` | Tipografia, tamanhos, layouts, animações de texto (com tempos em frames) |
| `references/03-transicoes-motion-3d.md` | Catálogo de transições, motions de câmera, elementos 3D |
| `references/04-broll-complementar.md` | Como escolher/gerar b-roll e vídeos complementares pelo tema da fala |
| `references/05-audio-trilha-sfx.md` | Loudness medido, trilha por clima, mapa de SFX |
| `references/06-breakdown-referencias.md` | Análise dos 5 vídeos com timestamps |
| `references/07-adaptacao-cliente.md` | Como trocar paleta/trilha/efeitos por cliente + beat sheet + QA |
| `references/08-pipeline.md` | Comandos completos + receitas para DaVinci, Premiere, CapCut, After Effects |
| `assets/moodboard/` | Contact sheets e tiras de transição quadro a quadro das referências |
| `clients/` | Perfis de cliente (paleta, fontes, trilha, intensidade) |

Ao abrir esta skill para uma edição, leia no mínimo `01`, `02`, `03` e o perfil do cliente.
Olhe as imagens do `assets/moodboard/` quando precisar lembrar a estética exata.

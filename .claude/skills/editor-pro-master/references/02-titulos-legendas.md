# 02 — Títulos cinéticos e legendas

Os vídeos Pro Master **não usam legenda tradicional**. Usam *cartões de título* que mudam a cada
frase (0,7–1,5 s) com hierarquia. Só V2/V3 têm uma "legenda corrida" pequena, e mesmo ela tem
palavras de ênfase em serif itálica.

## 1. Sistema tipográfico

| Papel | Família IMPACTO (V1) | Família EDITORIAL (V2/V3/V4) | Família CLEAN (V5) |
|---|---|---|---|
| Apoio (pequeno) | Anton / Bebas Neue, CAIXA-ALTA, creme | Inter SemiBold minúscula, branco-creme | Inter Bold minúscula, tracking -2 |
| Keyword (grande) | Anton CAIXA-ALTA, gradiente ouro + glow + sombra 3D | Instrument Serif *Itálico* (ou Playfair Display Italic), cor de destaque + glow | Inter ExtraBold, tracking -5, cor de destaque + glow |
| Keyword secundária | Anton branco-creme com glow branco | Serif itálico **branco** ("talking *head*") | Serif itálico branco |
| Eco/contraponto | Contorno/outline vazado ("EU QUERO" vazado em V1 0 s) | palavra cinza translúcida | palavra cinza ("se você ~sempre~") |

Substitutos aceitos: condensadas → Bebas Neue, Oswald Bold, Barlow Condensed ExtraBold,
Druk/Tungsten (pagas). Serif itálica → Playfair Display Italic, DM Serif Display Italic,
Gloock, Editorial New Italic/PP Editorial (pagas). Sans → Inter, Helvetica Neue, SF Pro, Manrope.

**Fontes da marca do cliente**: se o cliente tem fonte própria, ela substitui a *sans* de apoio;
a serif itálica de contraste continua (é parte do estilo), a menos que o cliente proíba.

## 2. Tamanhos (em % da ALTURA do quadro 9:16 de 1920 px)

| Elemento | IMPACTO | EDITORIAL | CLEAN | Legenda corrida |
|---|---|---|---|---|
| Apoio | 3.4% (≈65 px) | 2.8% (≈54 px) | 3.2% (≈60 px) | 1.9% (≈36 px) |
| Keyword | 11% (≈210 px) — ocupa 60–90% da largura | 10.5% (≈200 px) | 8.5% (≈165 px) | 4% (≈77 px) |
| Entrelinha | 0.82 × corpo (linhas quase se tocam) | 0.82 | 0.82 | 1.0 |

- Linhas empilhadas **coladas**: apoio quase encostando na keyword (V1 "VOCÊ NÃO É UM /
  ESPECIALISTA / NO SEU ESTILO DE EDIÇÃO").
- Alinhamento central na maioria; às vezes à esquerda grudado na lateral do corpo
  (V1 32–33 s "CLIENTE NÃO SABE EXATAMENTE" à esquerda em 3 linhas gigantes).
- Máximo de 3–4 linhas por cartão. Máximo de **1 keyword por cartão** (2 se for par contrastante).

## 3. Posição / layout

- **Centro ótico** ≈ 55% da altura (peito/cintura do sujeito em plano americano, V1).
- Close (V4/V5): texto sobre o peito/mãos, ~60–65% da altura.
- **Texto atrás do sujeito** em momentos de abertura (V1 0–5 s, V3 1–3 s) — recorte da pessoa.
- **Texto em curva/arco** em volta da cabeça ou seguindo um objeto (V2 3 s "é que pra mim o doc
  tem valor", V2 32 s "pro momento que eu escrevi", V5 6–7 s "você com certeza"): usar texto em
  caminho circular, rotacionando levemente.
- **Texto gigante em perspectiva 3D** atravessando o quadro (V2 11–14 s "roteiro" espelhado
  passando por trás; V2 35 s "estava sentindo" em perspectiva sobre a parede).
- **Texto lateral em coluna** (V1 54–56 s: "E NÃO AQUILO QUE O" esquerda + "CLIENTE DO SEU
  CLIENTE" direita, emoldurando o rosto em close).
- Safe zones (Reels/TikTok): nada importante nos 12% de cima, 20% de baixo e 15% da direita.

## 4. Animações de texto (30 fps)

| Nome | Ref | Entrada | Saída |
|---|---|---|---|
| `flip` | V1 | rotação X -75° → 0°, escala 112→100, blur 6→0, 6 frames, ease-out com leve overshoot | blur 12 + fade, 5 frames |
| `pop` | V1/V5 | escala 130→100 + blur 10→0, 5 frames | idem |
| `blur` | V2/V3/V4 | blur 14→0 + escala 104→100 + fade, 7 frames | idem |
| `rise` | V5 | sobe 30 px + blur 8→0, 5–6 frames | idem |
| `type` | V2/V3 legenda | palavra a palavra, cada uma com fade de 2 frames no tempo exato da fala | idem |
| Stagger | todas | linhas seguintes entram 2 frames (≈70 ms) depois | — |
| Troca de keyword no mesmo cartão | V1 "R$200 → R$1000" | a keyword antiga sai com blur e a nova entra com flip enquanto o apoio fica | — |
| Tracking in | V1 "EXCELENTES" 42 s | letras entram espaçadas + motion blur e fecham | — |
| Moeda/objeto atravessando | V1 2–3 s | moeda dourada 3D gira e passa pela frente revelando "R$200" | — |

Regras de timing:
- O cartão aparece **2–3 frames ANTES** da palavra ser dita (o olho lê antes de ouvir).
- Keyword entra **exatamente** na sílaba tônica da palavra-chave.
- Cartão fica no ar até a próxima frase começar; nunca tela vazia > 1,5 s durante fala
  (exceto respiros intencionais com b-roll forte).

## 5. Cores do texto (com paleta do cliente)

- `text` = branco-creme `#F4EFE6` (troque por um off-white da marca se houver).
- `accent` = cor principal do cliente → **só na keyword**.
- `accent_2` = topo do gradiente (accent + 45% branco), automático.
- Glow da keyword = própria cor do accent, 40% de opacidade, blur ~18 px.
- Sombra = quase-preto do cliente (ou `#0B0B0C`), 30–50% de opacidade, deslocada (4,7) px.
- Contraste mínimo: se a cor do cliente for escura (ex. azul-marinho), use ela no *glow/sombra*
  e uma versão clara (tint 40–60%) no preenchimento da keyword. Teste em celular.

## 6. Como gerar com o script

```bash
python3 scripts/pm_titles.py cards.json titulos.ass --client clients/<cliente>.json
ffmpeg -i graded.mp4 -vf "ass=titulos.ass:fontsdir=$HOME/.fonts/pro-master" -c:a copy titled.mp4
```

Exemplo de `cards.json` (marcação: `*keyword*`, `_keyword secundária_`, `~eco~`, `|` quebra):

```json
[
  {"start": 0.95, "end": 2.40, "preset": "impacto", "text": "que cliente não|paga mais de|*R$200*"},
  {"start": 2.40, "end": 3.60, "preset": "impacto", "text": "numa|*EDIÇÃO*", "anim": "pop"},
  {"start": 10.6, "end": 12.0, "preset": "editorial", "text": "salto|*evolutivo*|consciente"},
  {"start": 2.10, "end": 3.30, "preset": "editorial", "text": "*talking*|_head_", "pos": "center"},
  {"start": 6.00, "end": 8.20, "preset": "clean", "text": "sem perder o|*controle*|criativo"},
  {"start": 30.1, "end": 32.0, "preset": "legenda", "text": "mas ter a|*sensação*|de ser teletransportado"}
]
```

Obs.: no preset `legenda`, uma linha inteira com `*...*` vira ênfase serif itálica.
Para palavra a palavra sincronizada passe `"words": [[0.00,"mas"],[0.18,"ter"],...]` (tempos
relativos ao início do cartão, vindos da transcrição).

Para efeitos que o ASS não faz (texto em arco, perspectiva 3D, recorte atrás do sujeito, moeda
3D), use o NLE — receitas em `08-pipeline.md`.

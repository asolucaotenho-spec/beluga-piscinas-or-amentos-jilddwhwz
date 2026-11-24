# 01 — DNA visual: cor, iluminação, blur, gradientes, efeitos

Valores medidos por amostragem de 1 frame/s em cada referência (k-means de cor, percentis de luma).

## 1. Paletas medidas nas referências

| Ref | Família | Luma média | Pretos (p5) | Altas (p95) | Saturação | Sombras | Médios | Altas | Destaques vivos |
|---|---|---|---|---|---|---|---|---|---|
| V1 | IMPACTO (dia urbano) | 0.47 | 0.02 | 0.81 | 0.37 | `#181715` | `#928164` | `#EBD6A5` | `#F6B404` `#EFD268` `#D77A05` |
| V2 | EDITORIAL (noite tungstênio) | 0.16 | 0.00 | 0.57 | 0.55 | `#181010` | `#98734F` | `#F9E89E` | `#E1803B` `#E5461A` `#FABB5D` |
| V3 | EDITORIAL (noite + fogo) | 0.22 | 0.03 | 0.64 | 0.43 | `#211914` | `#9B7054` | `#E2DECC` | `#E94F17` `#E69634` |
| V4 | EDITORIAL/CLEAN (cozy) | 0.28 | 0.04 | 0.74 | 0.44 | `#1B1A16` | `#9C7758` | `#F3DCA4` | `#F4990E` `#E49954` |
| V5 | CLEAN (cozy verde) | 0.25 | 0.04 | 0.57 | 0.44 | `#261816` | `#83724F` | `#F0EED0` | `#F78C0A` `#E16D0E` |

**Leituras-chave**
- Altas **nunca** chegam no branco puro: p95 entre 0.57 e 0.81 → highlights cremosos/amarelados
  (`#EBD6A5`, `#F3DCA4`, `#F0EED0`). Roll-off suave.
- Pretos densos (p5 0.00–0.04) mas com leve cor (sombras `#181715`, `#261816` — quentes/neutras,
  nunca azul-elétrico).
- Só **2–6% dos pixels** são "cor viva": a cor de destaque é rara e por isso chama atenção.
  Regra: **a cor do cliente aparece em ≤ 6% da tela** (palavra-chave, um objeto, um ícone).
- Esquema de cor recorrente: **complementar quente × frio** — laranja/âmbar (pele, abajur,
  títulos) contra verde-petróleo/azul (parede verde V4/V5, prédios azuis V1, sombras V2).

## 2. Looks de grade (implementados em `scripts/pm_grade.sh`)

### `golden` — V1 (externa diurna, céu nublado)
- Contraste baixo-médio (0.95), saturação contida (0.95). Curva com pretos levantados ~3%.
- Highlights puxados para âmbar/creme; sombras levemente frias (azul +3%).
- Pele dourada, roupas claras viram creme. Prédios azuis/vermelhos saturados mas não berrantes.
- Halation leve (0.25). Grão fino.
- Profundidade: lente tele (85–135 mm equiv.), fundo desfocado, o prédio vira "textura gráfica".

### `tungsten` — V2/V3 (noite, interior, luz prática)
- Low-key: luma média 0.16–0.22. Contraste alto (1.12), gamma 0.92.
- Uma fonte prática quente no quadro (abajur `#E1803B`) + rim/contraluz âmbar.
- Sombras verde-petróleo/oliva (`#242726`, `#4C503D`), pretos profundos.
- Halation forte (0.55) nos abajures, flare quente, "glow" de lâmpada que vaza no ar.
- Fumaça/atmosfera (haze) em alguns planos (V2 49 s, V3 8–12 s).

### `cozy` — V4/V5 (interior aconchegante, talking head)
- Parede verde-escura + abajures laranja → complementar perfeito.
- Pele rosada/quente, roupa com cores sólidas (vermelho, creme, azul petróleo).
- Contraste médio (1.05), saturação 1.10, highlights creme. Halation 0.4.
- Foreground desfocado (almofada, notebook, braço) para profundidade (V5 36–43 s).

### `mono` — ênfase
- P&B com contraste 1.18, pretos esmagados de leve. Dura 1–3 s.
- Usado em: V1 24–25 s ("você tá competindo com template"), V4 6–8 s ("meio vazio"),
  V5 2–3 s e 11–12 s (pergunta/crítica), V3 47 s (lembrança).
- **A palavra-chave continua colorida** no P&B (V4 "vazio" laranja sobre P&B) → efeito
  "color splash" tipográfico.

## 3. Iluminação (para orientar gravação ou gerar cenas por IA)

| Situação | Setup observado |
|---|---|
| Talking head interior | Key suave 45° quente (3200–4000 K), abajur prático no quadro como "motivo", fundo 2–3 stops abaixo, rim quente atrás do cabelo |
| Externa (V1) | Céu nublado = softbox gigante; sujeito de frente para a luz; fundo urbano com cores fortes e repetição geométrica |
| Drama (V2/V3) | Uma única fonte lateral dura + muito negativo; silhueta contra disco/sol laranja (V3 8–9 s) |
| Overhead (V2 51 s) | Mesa de madeira vista de cima, luz quente lateral, objetos "hero" (caderno, caneta) |

## 4. Blur — o efeito mais usado do sistema

1. **Rack focus / foco seletivo** sempre: fundo com bokeh grande.
2. **Blur de entrada/saída de texto** (todas as refs): texto nasce desfocado (σ≈14) e foca em
   6–7 frames; sai desfocando em 4–5 frames.
3. **Blur-cut** (V3 12 s → 13 s, V4 11–12 s, V5 22 s, 30 s): o plano desfoca total por 4–6
   frames e o próximo nasce desfocado → foco. Substitui o corte seco nas mudanças de assunto.
4. **Blur de fundo atrás de card** (V1 10 s): quando um elemento gráfico grande entra (jornal
   "MOTIVOS"), o vídeo de fundo desfoca (σ≈20) para dar profundidade.
5. **Motion blur direcional** em whips e em títulos que entram rápido (V1 "MUDAM" saindo, V2
   letras gigantes passando pela tela).
6. **Blur de foreground** (V5 36 s): objeto desfocado na frente da câmera em primeiro plano.

## 5. Gradientes

- **Gradiente metálico vertical nas palavras-chave do IMPACTO**: topo claro (`#FFE27A` ≈ accent
  + 45% branco) → base saturada (`#F6B404` → `#D77A05`). Feito no script com 2 camadas + clip.
- **Gradiente de luz ambiente**: vinheta quente (cantos escurecendo para marrom, não para preto
  puro). `--vignette 0.35`.
- **Glow radial** atrás de silhuetas (V3 disco laranja 8–9 s) e atrás de ícones 3D (V4 29–32 s).
- **Gradiente de fogo/nuvem** (V3 10–12 s): fundo inteiro laranja→vermelho com textura de fumaça.
- **Fundos gráficos**: cinza-concreto texturizado com setas 3D (V1 26–27 s); papel/kraft com
  ruído e sombra (V1 80–85 s). Nunca cor chapada lisa.

## 6. Efeitos de vídeo recorrentes

| Efeito | Onde | Como fazer |
|---|---|---|
| Halation/glow em luzes | V2, V3, V4, V5 | `pm_grade.sh --halation 0.4–0.6` / DaVinci "Glow"/"Halation" |
| Grão de película fino | todas | `--grain 6` (DaVinci Film Grain 35mm, fino) |
| Glow em texto | todas | camada duplicada da keyword, desfocada 18 px, opacidade 40% |
| Sombra 3D do texto | V1 | cópia escura deslocada (4, 7) px |
| Text-behind-subject | V1 4 s ("NUMA EDIÇÃO" atrás do corpo), V3 1–3 s ("TIME" atrás da pessoa) | máscara/rotoscopia (DaVinci Magic Mask, CapCut "Remover fundo") |
| Recorte da pessoa sobre fundo novo | V3 2–3 s (estádio), 15–19 s (escada em chamas) | remover fundo + compor em cena gerada por IA |
| Chiado de TV + barras de cor | V3 4 s | `pm_cut.py` transição `static` |
| Tela/UI flutuando em 3D | V4 16–20 s, V5 44–49 s | gravação de tela em plano 3D inclinado com DOF |
| Moldura de cartão arredondado | V1 80–85 s, V3 23–36 s | vídeo encolhe para card com cantos ~4% e sombra suave sobre fundo texturizado |
| Selfie/print de rede social | V3 66–68 s | print de Reels com o vídeo dentro |
| Highlight de botão + cursor | V5 22–24 s | caixa laranja com glow + cursor animado clicando |
| Caixa de seleção (bounding box) | V5 2–3 s | retângulo fino com alças, como "selecionando" o texto |

## 7. Intensidade por cliente (o "sabor" dos efeitos)

| Nível | Uso | O que muda |
|---|---|---|
| `sobrio` | médico, advocacia, imobiliário premium | menos SFX, sem glitch/estática, glow 25%, mais blur-cut e dip, P&B raro |
| `equilibrado` (padrão) | maioria | tudo do sistema em dose normal |
| `explosivo` | infoproduto, varejo, fitness, entretenimento | números 3D, flash, whip, estática, zoom-punch a cada 2–3 s, glow 60% |

# 03 — Transições, motions e elementos 3D

Tiras quadro a quadro de cada uma estão em `assets/moodboard/trans-*.jpg`.

## 1. Catálogo de transições (com duração a 30 fps)

| Transição | Ref (tempo) | Anatomia | Duração | Quando usar | Script |
|---|---|---|---|---|---|
| **Blur-cut** | V3 12→13 s, V4 11→12 s, V5 30 s | A desfoca até ficar irreconhecível → B nasce desfocado e foca | 6 + 6 fr | mudança de assunto/tópico, saída de cena gráfica | `pm_cut.py "tr":"blur"` |
| **Whip / motion-blur pan** | V5 22 s, V4 21 s | movimento rápido lateral com blur direcional dos dois lados | 3–4 + 3–4 fr | energia, "mas olha isso", entrada de produto | `"tr":"whip"` |
| **Zoom-punch** | V1 12–13 s, 35 s, 44 s, V4 21 s | corte para enquadramento 115–135% maior (ou entra a 135% e assenta) | 0–7 fr | ênfase numa frase, jump cut do mesmo plano | `"zoom":1.2` / `"tr":"zoom"` |
| **Flash branco** | V1 25→26 s (P&B estoura em branco e revela fundo gráfico) | A superexpõe em 2–3 fr → B | 3 + 3 fr | revelação, virada de tom | `"tr":"flash"` |
| **Estática de TV + barras** | V3 4 s | chiado P&B 0,25 s + barras SMPTE 0,15 s + som de estática | 12 fr | quebra de expectativa, "mas…", flashback | `"tr":"static"` |
| **Dip to black** | V3 47 s, V5 fim | fade rápido ao preto | 8 fr | fim de capítulo, antes do CTA | `"tr":"dip"` |
| **Card shrink** | V1 80–85 s, V3 23–36 s | o vídeo encolhe virando cartão arredondado com sombra sobre fundo texturizado; novos cards entram/empilham | 10–15 fr | bastidores, prova, "deixa eu te mostrar", comparação | NLE (ver 08) |
| **Objeto que cobre a tela** | V1 10 s (jornal "MOTIVOS" voa e cobre), V1 2 s (moeda) | objeto 3D/2D passa na frente da câmera e serve de "wipe" | 8–12 fr | listas, introduzir número, tópico | NLE |
| **Match cut por forma/ação** | V2 20 s (telefone desligado → porta), V3 9→10 s (silhueta → silhueta caindo) | movimento termina em A e continua em B | — | storytelling | edição |
| **Texto gigante como wipe** | V2 11–14 s ("roteiro" atravessando) | letras enormes passam por trás/na frente e trocam o plano | 10–20 fr | palavras-tema | NLE |
| **Linha do tempo / contador** | V3 23–24 s (1990→2024 trocando a cada 4 fr) | números mudam rápido sobre b-roll em card | 4 fr por número | passagem de tempo, "desde 2015" | `pm_titles` + cortes |
| **Grade de telas/templates em 3D** | V4 26–28 s, V5 44–49 s | parede de thumbnails inclinada com DOF, câmera deslizando | 1–2 s | "+80 templates", portfólio, catálogo | NLE |

**Regra de proporção num vídeo de 60 s (nível equilibrado):** ~50% cortes secos + zoom-punch
(jump cuts), ~25% blur-cut, ~15% whip/flash, ≤ 2 efeitos "grandes" (estática, card, objeto 3D).
Toda transição não-seca leva **SFX** (whoosh, swish, impact, static, click).

## 2. Motion de câmera (digital, em pós)

- **Jump cut alternando enquadramento**: aberto (plano americano) ↔ fechado (meio-primeiro plano
  ~130%) a cada 1–3 frases. É o "motor" de ritmo do V1 e V4/V5.
- **Push-in lento contínuo**: 100% → 106% ao longo de uma frase (5–8 s) em falas emocionais.
- **Shake sutil** em impacto (2–4 frames, 6–10 px) quando entra número 3D ou keyword explosiva.
- **Speed ramp** em b-roll de ação (V3 montagem): 100% → 40% no momento-chave → 100%.
- **Câmera na mão** em bastidores/montagem (V3 24–36 s, 58–72 s): granulação maior, cantos
  arredondados, enquadramento torto proposital (dutch 5–10°).

## 3. Elementos 3D e gráficos

| Elemento | Ref | Estilo |
|---|---|---|
| Números grandes 3D ("1", "2", "3") | V1 12, 29, 45 s | extrusão laranja-ouro, iluminação de estúdio, entram girando com motion blur, ficam ao lado da cabeça e giram devagar |
| Moeda/dinheiro 3D | V1 2 s | moeda dourada atravessando a tela |
| Jornal/papel com título | V1 10 s | papel envelhecido com "MOTIVOS 1 2 3", voa até a câmera |
| Logos de apps em 3D (glossy) | V1 16 s (CapCut), 76 s (DaVinci), V4 29–32 s, V5 52–56 s | ícone com espessura, reflexo, borda luminosa, flutuando com leve rotação Y |
| Ícones de redes sociais | V1 57–59 s | cards de ícones (FB, IG, YT, TikTok) passando em fila com motion blur |
| Setas 3D | V1 26–27 s | setas cinza-metálicas apontando para o título, fundo concreto com códigos de barras/HUD |
| Silhuetas | V3 8–12 s | pessoa em silhueta contra disco laranja; silhueta caindo dentro de redemoinho de fogo |
| Cenas geradas por IA | V3 2–3 s (estádio), 15–19 s (escada flutuante em chamas), 40–43 s (cérebro raio-X) | metáfora visual literal da fala, mesmo grade do vídeo |
| UI/tela gravada em perspectiva | V4 16–20 s, V5 26–29 s | timeline do editor inclinada com DOF, playhead vermelho correndo |
| Despertadores 3D | V5 29 s | objetos que "pulam" na tela quando fala de tempo |
| Botão + cursor | V5 22–24 s | botão laranja com glow, cursor clicando, leve escala no clique |

Fontes de elementos 3D: render próprio (Blender/Spline), packs de ícones 3D, geração por IA
(imagem → recorte → animar com rotação/escala no NLE). **Sempre** aplicar o mesmo grade, glow e
grão do vídeo para "colar" o elemento na cena. **Recolorir para a paleta do cliente** (números
3D na cor accent).

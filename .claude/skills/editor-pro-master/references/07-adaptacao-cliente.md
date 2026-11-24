# 07 — Adaptação por cliente, beat sheet e QA

## 1. O que muda e o que NÃO muda

| MUDA por cliente | NÃO muda (é o Pro Master) |
|---|---|
| `accent` (cor da keyword, números 3D, botões, glow) | Hierarquia apoio → KEYWORD → cauda |
| `accent_2` / `shadow` (gradiente, sombra, tint de sombras do grade) | Entrada/saída com blur, stagger de 2 frames |
| `text` (off-white da marca, se houver) | Ritmo: algo novo a cada 0,7–1,5 s |
| Família base (IMPACTO / EDITORIAL / CLEAN) conforme tom | Estrutura do grade (pele quente, altas cremosas, pretos ricos, halation, grão) |
| Intensidade (sóbrio / equilibrado / explosivo) | Catálogo de transições + SFX em todas |
| Trilha (gênero, BPM) e banco de SFX | Regra do b-roll literal |
| Fonte sans de apoio (se a marca tiver) | Serif itálica de contraste nas keywords secundárias |
| Elementos 3D temáticos do nicho | -14 LUFS, voz na frente |

## 2. Como aplicar a paleta do cliente

1. Pegue as cores oficiais (manual de marca, site, logo). **Não invente** — pergunte se faltar.
2. Defina:
   - `accent` = cor mais vibrante/quente da marca. Se a marca só tem cores frias/escuras,
     use a mais clara/saturada como accent e verifique legibilidade sobre pele/fundo.
   - `accent_2` = accent clareado 40–50% (topo do gradiente) — ou a 2ª cor da marca.
   - `shadow` = cor mais escura da marca (ou `#0B0B0C`).
   - `text` = off-white (`#F4EFE6` padrão) — puxe levemente para o tom da marca.
3. No grade: `pm_grade.sh … --accent <accent> --shadow <cor secundária fria>` puxa ~6% das
   altas/sombras para a marca **sem** destruir a pele.
4. Se o accent for **frio** (azul, ciano, verde), troque o look base para manter o contraste
   complementar: `golden`/`cozy` continuam quentes na pele, e a keyword fria "salta" sobre eles.
   Se o accent for **quente** (laranja, amarelo, vermelho), use sombras levemente frias.
5. Elementos 3D, botões, barras e ícones: recolorir para o accent.
6. Regra dos 6%: a cor do cliente não ocupa mais de ~6% da tela em média.

## 3. Perfil do cliente (`clients/<slug>.json`)

Copie `clients/_template.json`. Campos:

```json
{
  "name": "Nome do Cliente",
  "slug": "nome-do-cliente",
  "nicho": "ex.: construção de piscinas",
  "palette": { "accent": "#HEX", "accent_2": "#HEX", "text": "#F4EFE6", "shadow": "#HEX", "ghost": "#BFBFBF" },
  "familia": "impacto | editorial | clean",
  "intensidade": "sobrio | equilibrado | explosivo",
  "look": "golden | tungsten | cozy",
  "fontes": { "sans": "Inter", "serif_italic": "Instrument Serif", "condensada": "Anton" },
  "trilha": { "genero": "…", "bpm": "…", "fonte_licenca": "…", "nivel_db": -20 },
  "sfx": "padrão | suave | pesado",
  "cta_padrao": "comenta ORÇAMENTO",
  "elementos_tematicos": ["…"],
  "proibido": ["…"]
}
```

## 4. Beat sheet (preencha antes de editar)

| # | Tempo | Fala | Cartão de título (`*keyword*`) | Preset/anim | Visual/b-roll/3D | Transição antes | Zoom | Cor/P&B | SFX |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0.00–1.80 | "Se você quer uma piscina…" | `se você quer uma\|*PISCINA*` | impacto/flip | texto atrás do sujeito | — | 1.0 | cor | whoosh+hit |
| 2 | 1.80–3.10 | "…sem dor de cabeça" | `sem\|*DOR DE CABEÇA*` | impacto/pop | — | cut | 1.25 | cor | pop |
| … | | | | | | | | | |

Regras ao preencher:
- Gancho (0–3 s): maior keyword do vídeo + elemento visual forte + SFX de impacto.
- A cada 2–3 frases: zoom-punch alternado (1.0 ↔ 1.2–1.3).
- A cada 10–15 s: um elemento "grande" (3D, card, cena gerada, tela).
- 1–2 momentos P&B nas frases de contraste/erro.
- Clímax: riser + corte seco + keyword mais forte.
- CTA: keyword gigante com a palavra a comentar.

## 5. Checklist de QA (antes de entregar)

- [ ] Nenhum trecho > 1,5 s de tela "vazia" durante fala; nenhum > 6 s sem elemento novo.
- [ ] Toda keyword na cor accent do cliente; resto off-white; ≤ 1 keyword por cartão.
- [ ] Texto legível no celular (testar a 25% de zoom); contraste ok sobre pele/fundo.
- [ ] Safe zones: topo 12%, base 20%, direita 15% livres de texto importante.
- [ ] Acentos e cedilha corretos (fontes latin + latin-ext).
- [ ] Todo título entra/sai com blur (sem cortes secos de texto).
- [ ] Toda transição não-seca tem SFX; SFX 1–2 frames antes do visual.
- [ ] Grade consistente em todos os planos e b-rolls (mesmo look + accent).
- [ ] Pele natural (não alaranjada demais, não esverdeada).
- [ ] -14 LUFS integrado, true peak ≤ -1 dBTP, voz clara sobre a trilha.
- [ ] Trilha licenciada para uso comercial.
- [ ] CTA claro nos últimos 3–5 s.
- [ ] Export: 1080×1920, 30 fps (ou fps da câmera), H.264 CRF 16–18 / ~15–20 Mbps, AAC 256k.

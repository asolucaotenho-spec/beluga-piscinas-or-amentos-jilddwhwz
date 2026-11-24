# 05 — Áudio: trilha, SFX e mix

## 1. Medições das referências

| Ref | Loudness integrado | LRA | Andamento estimado | Nível da trilha sob a voz |
|---|---|---|---|---|
| V1 | -14.2 LUFS | 1.1 LU | ~123 BPM (pulso marcado) | ~ -18 dB |
| V2 | -14.5 LUFS | 2.0 LU | ~129 BPM (pulso fraco, ambiente) | ~ -22 dB |
| V3 | -14.4 LUFS | 3.4 LU | ~144 BPM | ~ -20 dB |
| V4 | -14.7 LUFS | 5.2 LU | ~92 BPM (lo-fi/hip-hop) | ~ -17 dB |
| V5 | -14.1 LUFS | 2.7 LU | ~92 BPM | ~ -20 dB |

- **Alvo de master: -14 LUFS integrado, true peak -1 dBTP**, LRA baixo (1–5 LU) → voz sempre
  inteligível no celular.
- Trilha **sempre presente** (nunca silêncio total sob a voz), ducking automático.
- Picos transientes (SFX) concentrados em entradas de título e transições: V1 tem ~24 hits em
  90 s (1 a cada ~3,7 s); V3 tem rajada de hits na montagem (30–34 s, a cada 0,4–1 s).

## 2. Trilha por clima (escolha conforme o cliente)

| Família/clima | Gênero | BPM | Referência |
|---|---|---|---|
| IMPACTO / venda / autoridade | trap leve, hip-hop moderno, "corporate hype" com 808 | 120–140 | V1 |
| EDITORIAL / storytelling | cinematic ambient, piano + pads, pulso grave, cresce no clímax | 70–100 (ou 128–144 meio-tempo) | V2, V3 |
| CLEAN / produto / tutorial | lo-fi hip-hop, chill beat, groove suave | 85–100 | V4, V5 |

Estrutura: intro curta (gancho com a trilha já tocando) → groove constante → **drop/subida
no clímax** (virada do argumento) → resolução no CTA. Cortes de b-roll de montagem **no tempo
da trilha** (beat ou 1/2 beat).

**Licença**: use biblioteca licenciada do cliente/agência (Artlist, Epidemic, Musicbed,
YouTube Audio Library) ou música gerada com direitos comerciais. **Nunca** música em alta/do
TikTok em vídeo de marca sem licença.

## 3. Mapa de SFX (todo movimento tem som)

| Evento visual | SFX | Volume relativo |
|---|---|---|
| Keyword entra (flip/pop) | "pop"/"swoosh" curto, ou "click" sutil | -10 dB |
| Número 3D entra | whoosh + impacto grave (boom/hit) | -6 dB |
| Whip | whoosh rápido (swish) | -8 dB |
| Blur-cut | whoosh suave/"air" reverso | -12 dB |
| Flash | "camera flash"/riser curto + hit | -8 dB |
| Estática | chiado de TV + bipe (o script já gera) | -12 dB |
| Card shrink/empilhar | "paper"/"swipe UI" | -12 dB |
| Logo/ícone aparece | "ding"/"glass" | -12 dB |
| Cursor/botão | click de mouse | -10 dB |
| Objeto real (telefone, caneta) | foley do objeto | -14 dB |
| Antes do clímax | riser 1–2 s + corte seco (silêncio de 3–6 frames) | -10 dB |

Use `scripts/pm_mix.sh edit.mp4 trilha.mp3 final.mp4 whoosh.wav@3.2 hit.wav@7.85 …`.
Os tempos dos SFX vêm do beat sheet (início de cada transição/keyword, 1–2 frames antes).

## 4. Voz

Cadeia (já no `pm_mix.sh`): passa-alta 80 Hz → corte -2 dB em 250 Hz (embolado) → +3 dB em
3,2 kHz (presença) → de-esser → compressor 3:1. Remover respirações longas e silêncios
(jump cuts). Se houver ruído: `afftdn`/`arnndn` antes da cadeia.

## 5. Adaptação por cliente

| Intensidade | Trilha | SFX |
|---|---|---|
| sobrio | piano/ambient, -22 dB | só whoosh suaves e foley, ~1 a cada 6–8 s |
| equilibrado | conforme família, -20 dB | mapa completo, ~1 a cada 3–5 s |
| explosivo | trap/hype com drops, -17 dB | mapa completo + impactos graves + risers, ~1 a cada 2–3 s |

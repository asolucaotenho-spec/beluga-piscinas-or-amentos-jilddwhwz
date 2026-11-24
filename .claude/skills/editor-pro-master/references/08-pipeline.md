# 08 — Pipeline de execução

## A. Pipeline automatizado (ffmpeg — roda aqui no ambiente)

Pré-requisitos: `ffmpeg` com libass, `python3`, `npm` (para baixar fontes).

```bash
SK=.claude/skills/editor-pro-master
CL=$SK/clients/<cliente>.json

# 0) fontes (uma vez por máquina)
$SK/scripts/pm_fonts.sh ~/.fonts/pro-master

# 1) transcrição com tempos por palavra (qualquer fonte: Whisper, CapCut, DaVinci, Premiere
#    "Speech to Text", ElevenLabs). Salve como words.json / .srt para montar o beat sheet.

# 2) montagem: cortes, jump cuts com zoom, b-roll, P&B, transições de assinatura
python3 $SK/scripts/pm_cut.py edl.json 01_cut.mp4 --w 1080 --h 1920 --fps 30

# 3) color grade (look da família + puxada leve para a marca)
ACC=$(python3 -c "import json;print(json.load(open('$CL'))['palette']['accent'])")
$SK/scripts/pm_grade.sh 01_cut.mp4 02_grade.mp4 cozy --accent "$ACC" --grain 6
#    teste rápido: acrescente --preview (renderiza 6 s)

# 4) títulos cinéticos (cartões do beat sheet) — tempos na timeline JÁ montada
python3 $SK/scripts/pm_titles.py cards.json titulos.ass --client $CL
ffmpeg -i 02_grade.mp4 -vf "ass=titulos.ass:fontsdir=$HOME/.fonts/pro-master" \
       -c:v libx264 -crf 17 -c:a copy 03_titled.mp4

# 5) mix: voz tratada + trilha com ducking + SFX + -14 LUFS
$SK/scripts/pm_mix.sh 03_titled.mp4 trilha.mp3 FINAL.mp4 whoosh.wav@1.75 hit.wav@12.40

# 6) QA visual: contact sheet 2 fps
ffmpeg -i FINAL.mp4 -vf "fps=2,scale=180:-2,tile=10x6" -frames:v 1 qa_sheet.jpg
ffmpeg -i FINAL.mp4 -af ebur128 -f null - 2>&1 | grep -E "I:|Peak"
```

Ordem importa: **cortar → gradear → titular → mixar** (títulos depois do grade para não
"sujar" a cor da marca; SFX depois de tudo para casar com os tempos finais).

Limitações do pipeline ffmpeg (fazer no NLE/After Effects quando o roteiro pedir): texto em
arco, texto em perspectiva 3D, texto atrás do sujeito (precisa máscara), números/logos 3D
animados, card shrink com empilhamento, telas em perspectiva com DOF. Para esses, gere o
elemento à parte (PNG/MOV com alfa) e sobreponha com `overlay` ou entregue o plano ao editor.

Sobrepor um elemento com alfa (ex.: número 3D em .mov ProRes 4444 / .webm VP9 alpha):
```bash
ffmpeg -i base.mp4 -c:v libvpx-vp9 -i numero3d.webm -filter_complex \
 "[1:v]setpts=PTS+12.0/TB[el];[0:v][el]overlay=x=W*0.55:y=H*0.18:eof_action=pass" -c:a copy out.mp4
```

## B. DaVinci Resolve (recomendado para o estilo)

- **Projeto**: 1080×1920, 30 fps (ou 23.976 para o look cinema, como as referências).
- **Color (nós)**: 1) balanço/exposição → 2) curva (pretos +3%, altas -4%) → 3) "Color Warper"
  pele quente/sombras frias → 4) **Glow/Halation** (OFX) só nos highlights → 5) **Film Grain**
  35mm fino → 6) vinheta leve. Salve como PowerGrade "PM golden/tungsten/cozy".
  Nó extra por cliente: qualifier na cor accent da marca +5% sat.
- **Títulos**: Fusion Text+ com 3 camadas (glow, sombra, preenchimento) — ou plugin de títulos
  com presets "blur in/out". Entrada: Transform (escala 112→100) + Directional/Gaussian Blur
  (14→0) em 6–7 frames, curva ease-out. Stagger de 2 frames.
- **Texto atrás do sujeito**: Magic Mask (Person) → nó de alfa → Text+ entre o fundo e a pessoa.
- **Texto em arco**: Text+ → "Layout: Circle".
- **Transições**: Blur-cut = Gaussian Blur keyframado no fim/começo (0→60→0) + corte;
  Whip = Directional Blur + Transform X; Flash = Dip to Color branco 3+3 frames.
- **Card shrink**: Transform (zoom 100→62%) + Fusion "Rectangle" com corner radius + Drop Shadow
  sobre fundo de textura (papel/concreto).
- **3D**: Fusion 3D (Text3D com extrusão, Shape3D) com Spot Light quente; ou importar Blender.
- **Fairlight**: Dialogue Leveler + EQ (−2 dB 250 Hz, +3 dB 3 kHz), música com ducking
  (sidechain), Loudness -14 LUFS no master.

## C. Premiere Pro / After Effects

- Lumetri: Creative "Kodak 5218"-like, Faded Film 5–10, Vibrance +10, HSL Secondary na pele.
  Halation: duplicar, Luma Key nas altas, Gaussian Blur 40, modo Screen 30–50%, tingir laranja.
- Títulos em AE (Essential Graphics): animadores de escala/blur/opacidade por linha com
  offset de 2 frames; "Text on Path" para arco; camada 3D + câmera para perspectiva.
- Rotoscope Brush / "Roto Brush 3" para texto atrás do sujeito.
- Transições: "Gaussian Blur" keyframado, "Transform" com motion blur (shutter 360°) p/ whip.
- Áudio: Essential Sound (Dialogue/Music com Ducking), Loudness Radar -14 LUFS.

## D. CapCut (desktop/mobile)

- Ajuste: Temperatura +8, Matiz +3, Destaques -15, Sombras +5, Saturação -5, Vinheta 10,
  Grão 8–12. Filtros-base: "Filme"/"Cine" a 30–40%.
- Texto: fonte condensada + serif itálica; animação de entrada "Desfocar"/"Zoom in desfocado",
  saída "Desfocar". Brilho (glow) no texto da keyword na cor accent.
- Recorte: "Remover fundo" para texto atrás da pessoa.
- Transições: "Desfoque", "Puxar"/"Whip", "Flash branco", "Zoom", "Falha (glitch)".
- Áudio: "Redução de ruído", "Aprimorar voz", trilha com volume -20 dB e "duck".

## E. Entregáveis

1. `FINAL.mp4` 1080×1920 (+ versão 1080×1350/1920×1080 se pedido — reenquadrar, não esticar).
2. Capa/thumbnail: frame do gancho com a keyword principal (mesmo estilo de título).
3. Beat sheet preenchido (para revisão do cliente).
4. Opcional: projeto/EDL para o editor humano finalizar elementos 3D.

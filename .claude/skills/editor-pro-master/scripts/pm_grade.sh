#!/usr/bin/env bash
# Pro Master — color grade por LOOK, via ffmpeg.
#
# Uso:
#   pm_grade.sh <entrada> <saida> <look> [opções]
#
# Looks (extraídos das 5 referências):
#   golden    -> V1  dia nublado/urbano: highlights cremosos, sombras levemente frias,
#                    contraste suave, saturação contida, pele quente (golden-hour falso)
#   tungsten  -> V2/V3 noite low-key: pretos profundos, praticais laranja (abajur),
#                    sombras verde-petróleo, alto contraste, halation forte
#   cozy      -> V4/V5 interior aconchegante: verde x laranja complementares,
#                    luz de abajur quente, sombras esverdeadas, pele rosada
#   mono      -> P&B de ênfase (momentos de "verdade dura"/contraste) — usar 1–3 s
#
# Opções:
#   --accent "#RRGGBB"   puxa levemente os highlights para a cor do cliente (10–15%)
#   --shadow "#RRGGBB"   puxa levemente as sombras para a 2ª cor do cliente
#   --grain 0..30        granulação de película (padrão 6)
#   --halation 0..1      brilho difuso nos highlights (padrão depende do look)
#   --vignette 0..1      vinheta (padrão 0.35)
#   --preview            renderiza só 6 s a partir de 0 para conferir
set -euo pipefail
IN="$1"; OUT="$2"; LOOK="${3:-golden}"; shift 3 || true
ACCENT=""; SHADOW=""; GRAIN=6; HAL=""; VIG=0.35; PREVIEW=""
while [[ $# -gt 0 ]]; do case "$1" in
  --accent) ACCENT="$2"; shift 2;; --shadow) SHADOW="$2"; shift 2;;
  --grain) GRAIN="$2"; shift 2;; --halation) HAL="$2"; shift 2;;
  --vignette) VIG="$2"; shift 2;; --preview) PREVIEW="-t 6"; shift;;
  *) echo "opção desconhecida: $1" >&2; exit 1;; esac; done

case "$LOOK" in
  golden)
    BASE="eq=contrast=0.95:saturation=0.95:gamma=1.0,\
curves=r='0/0.035 0.5/0.52 1/0.98':g='0/0.03 0.5/0.5 1/0.95':b='0/0.04 0.5/0.47 1/0.88',\
colorbalance=rs=-0.02:bs=0.03:rm=0.03:gm=0.0:bm=-0.03:rh=0.05:gh=0.02:bh=-0.06"
    HAL="${HAL:-0.25}";;
  tungsten)
    BASE="eq=contrast=1.12:saturation=1.08:gamma=0.92,\
curves=all='0/0 0.12/0.05 0.5/0.47 0.85/0.88 1/0.96',\
colorbalance=rs=-0.05:gs=0.01:bs=0.04:rm=0.06:bm=-0.06:rh=0.07:bh=-0.09"
    HAL="${HAL:-0.55}";;
  cozy)
    BASE="eq=contrast=1.05:saturation=1.1:gamma=0.96,\
curves=r='0/0.02 0.5/0.53 1/0.98':g='0/0.04 0.5/0.5 1/0.94':b='0/0.03 0.5/0.45 1/0.85',\
colorbalance=rs=-0.03:gs=0.03:bs=0.0:rm=0.05:bm=-0.04:rh=0.05:bh=-0.06"
    HAL="${HAL:-0.4}";;
  mono)
    BASE="hue=s=0,eq=contrast=1.18:gamma=0.95,curves=all='0/0 0.15/0.08 0.85/0.92 1/1'"
    HAL="${HAL:-0.15}";;
  *) echo "look inválido: $LOOK (golden|tungsten|cozy|mono)" >&2; exit 1;;
esac

tint() { # hex -> "r g b" deslocamentos pequenos (-0.12..0.12) relativos a cinza
  local h="${1#\#}"; local r=$((16#${h:0:2})) g=$((16#${h:2:2})) b=$((16#${h:4:2}))
  python3 -c "r,g,b=$r/255,$g/255,$b/255;m=(r+g+b)/3;k=0.06;print(f'{(r-m)*k*2:.3f} {(g-m)*k*2:.3f} {(b-m)*k*2:.3f}')"; }
EXTRA=""
if [[ -n "$ACCENT" ]]; then read -r ar ag ab <<<"$(tint "$ACCENT")"; EXTRA+=",colorbalance=rh=$ar:gh=$ag:bh=$ab"; fi
if [[ -n "$SHADOW" ]]; then read -r sr sg sb <<<"$(tint "$SHADOW")"; EXTRA+=",colorbalance=rs=$sr:gs=$sg:bs=$sb"; fi

# Halation: isola highlights, desfoca, tinge de laranja quente e soma em "screen"
FC="[0:v]${BASE}${EXTRA},format=gbrp,split=2[base][hl];\
[hl]curves=all='0/0 0.7/0 1/1',gblur=sigma=28,colorchannelmixer=rr=1:gg=0.62:bb=0.32[glow];\
[base][glow]blend=all_mode=screen:all_opacity=${HAL},format=yuv420p,\
vignette=angle=PI/4*${VIG}:mode=forward,noise=alls=${GRAIN}:allf=t[v]"

ffmpeg -v error -y $PREVIEW -i "$IN" -filter_complex "$FC" -map "[v]" -map 0:a? \
  -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k "$OUT"
echo "OK -> $OUT ($LOOK)"

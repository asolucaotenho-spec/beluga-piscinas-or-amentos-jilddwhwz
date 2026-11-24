#!/usr/bin/env bash
# Pro Master — mixagem final: voz na frente, trilha com ducking, SFX por cima, -14 LUFS.
# (As 5 referências medem -14.1 a -14.7 LUFS integrados, LRA 1–5 LU, trilha sempre presente
#  por baixo da voz ~ -18 a -22 dB.)
#
# Uso:
#   pm_mix.sh <video_com_voz> <trilha.mp3|none> <saida.mp4> [sfx.wav@segundos ...]
# Ex.:
#   pm_mix.sh edit.mp4 trilha.mp3 final.mp4 whoosh.wav@3.20 impact.wav@7.85 riser.wav@21.0
#
# Variáveis opcionais: MUSIC_DB (padrão -20), SFX_DB (padrão -8)
set -euo pipefail
IN="$1"; MUSIC="$2"; OUT="$3"; shift 3
MUSIC_DB="${MUSIC_DB:--20}"; SFX_DB="${SFX_DB:--8}"
INPUTS=(-i "$IN"); FC=""; n=1
# voz: limpeza + presença (corta grave embolado, realça 3 kHz, de-esser leve)
FC+="[0:a]highpass=f=80,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3200:t=q:w=1.2:g=3,deesser=i=0.4,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,asplit=2[voz][sc];"
MIXIN="[voz]"; COUNT=1
if [[ "$MUSIC" != "none" ]]; then
  INPUTS+=(-stream_loop -1 -i "$MUSIC")
  FC+="[$n:a]volume=${MUSIC_DB}dB,aformat=channel_layouts=stereo[mus];[mus][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[duck];"
  MIXIN+="[duck]"; COUNT=$((COUNT+1)); n=$((n+1))
else
  FC+="[sc]anullsink;"
fi
for s in "$@"; do
  f="${s%@*}"; t="${s##*@}"; ms=$(python3 -c "print(int(float('$t')*1000))")
  INPUTS+=(-i "$f")
  FC+="[$n:a]volume=${SFX_DB}dB,aformat=channel_layouts=stereo,adelay=${ms}|${ms}[s$n];"
  MIXIN+="[s$n]"; COUNT=$((COUNT+1)); n=$((n+1))
done
FC+="${MIXIN}amix=inputs=${COUNT}:duration=first:normalize=0,loudnorm=I=-14:TP=-1.0:LRA=7[a]"
ffmpeg -v error -y "${INPUTS[@]}" -filter_complex "$FC" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 256k -shortest "$OUT"
echo "OK -> $OUT"

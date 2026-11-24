#!/usr/bin/env bash
# Baixa as fontes do sistema Pro Master (todas OFL, via npm/fontsource) para uma pasta.
# Uso: pm_fonts.sh [pasta_destino]   (padrão: ~/.fonts/pro-master)
set -euo pipefail
DEST="${1:-$HOME/.fonts/pro-master}"
mkdir -p "$DEST"; TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
cd "$TMP"
for pkg in anton bebas-neue inter instrument-serif playfair-display barlow-condensed; do
  npm pack -q "@fontsource/$pkg" >/dev/null 2>&1 || { echo "falhou: $pkg" >&2; continue; }
  mkdir -p "x-$pkg"; tar xzf fontsource-$pkg-*.tgz -C "x-$pkg"
  # latin + latin-ext cobrem todos os acentos do português
  find "x-$pkg/package/files" -name "*-latin-*.woff" ! -name "*.woff2" -exec cp {} "$DEST/" \;
  find "x-$pkg/package/files" -name "*-latin-ext-*.woff" ! -name "*.woff2" -exec cp {} "$DEST/" \;
done
command -v fc-cache >/dev/null && fc-cache -f "$DEST" >/dev/null 2>&1 || true
echo "Fontes em: $DEST"; ls "$DEST" | wc -l

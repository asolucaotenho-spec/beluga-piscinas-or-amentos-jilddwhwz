#!/usr/bin/env python3
"""
Pro Master — gerador de títulos cinéticos e legendas em ASS (renderiza com ffmpeg/libass).

Uso:
  python3 pm_titles.py cards.json saida.ass --client ../clients/cliente.json [--w 1080 --h 1920]
  ffmpeg -i video.mp4 -vf "ass=saida.ass:fontsdir=$HOME/.fonts/pro-master" -c:a copy out.mp4

cards.json = lista de cartões. Cada cartão:
  {
    "start": 1.20, "end": 2.90,
    "preset": "impacto" | "editorial" | "clean" | "legenda",
    "text": "que cliente não|paga mais de|*R$200*",   # "|" quebra linha
    "pos": "center" | "low" | "high" | [x, y],         # opcional (padrão por preset)
    "anim": "pop" | "flip" | "blur" | "rise" | "type",  # opcional (padrão por preset)
    "words": [[0.00, "que"], [0.18, "cliente"], ...]   # opcional: tempos relativos p/ "type"
  }

Marcação dentro do texto:
  *palavra*  -> PALAVRA-CHAVE: grande, cor de destaque do cliente, glow (+ gradiente no "impacto")
  _palavra_  -> palavra-chave secundária: grande, cor do texto (branco/creme), serifada itálica
  ~palavra~  -> palavra apagada (cinza translúcido) — usada para "eco"/contraponto
  linhas sem marcação -> linha de apoio pequena

Presets (extraídos das referências):
  impacto   (V1)  condensada bold CAIXA-ALTA (Anton), keyword gradiente ouro + glow + sombra 3D
  editorial (V2/V3/V4) apoio em sans (Inter SemiBold) minúscula + keyword serif itálica (Instrument Serif)
  clean     (V5)  sans pesada com tracking negativo (Inter ExtraBold), branco + destaque com glow
  legenda   (V2/V3) legenda pequena centralizada, palavra a palavra, ênfase serif itálica laranja
"""
import json, sys, argparse, re

def hex2ass(h, alpha=0):
    h = h.lstrip('#'); r, g, b = h[0:2], h[2:4], h[4:6]
    return f"&H{alpha:02X}{b}{g}{r}&".upper()

def mix(h1, h2, t):
    a = [int(h1.lstrip('#')[i:i+2], 16) for i in (0, 2, 4)]
    b = [int(h2.lstrip('#')[i:i+2], 16) for i in (0, 2, 4)]
    return '#' + ''.join(f"{round(x + (y - x) * t):02X}" for x, y in zip(a, b))

def ts(t):
    t = max(0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"

PRESETS = {
    # font, bold, italic, size_small, size_big, uppercase, spacing, default pos, default anim
    "impacto":   dict(small=("Anton", 0, 0, .034), big=("Anton", 0, 0, .110), alt=("Anton", 0, 0, .085),
                      upper=True, sp_small=1, sp_big=0, pos="center", anim="flip", gradient=True),
    "editorial": dict(small=("Inter", 1, 0, .028), big=("Instrument Serif", 0, 1, .105), alt=("Instrument Serif", 0, 1, .095),
                      upper=False, sp_small=-1, sp_big=-2, pos="center", anim="blur", gradient=False),
    "clean":     dict(small=("Inter", 1, 0, .032), big=("Inter", 1, 0, .085), alt=("Instrument Serif", 0, 1, .085),
                      upper=False, sp_small=-2, sp_big=-5, pos="center", anim="rise", gradient=False),
    "legenda":   dict(small=("Inter", 1, 0, .019), big=("Instrument Serif", 0, 1, .040), alt=("Instrument Serif", 0, 1, .036),
                      upper=False, sp_small=0, sp_big=-1, pos="low", anim="type", gradient=False),
}

def parse_line(line):
    """retorna (tipo, texto) — tipo: key | alt | ghost | small"""
    line = line.strip()
    for mark, kind in (("*", "key"), ("_", "alt"), ("~", "ghost")):
        if len(line) > 2 and line.startswith(mark) and line.endswith(mark):
            return kind, line[1:-1]
    return "small", line

def build(cards, pal, W, H):
    acc = pal.get("accent", "#F6B404")            # destaque principal (V1 ouro / V3-V5 laranja)
    acc2 = pal.get("accent_2", mix(acc, "#FFFFFF", .45))  # topo do gradiente
    txt = pal.get("text", "#F4EFE6")              # branco-creme (nunca branco puro)
    shd = pal.get("shadow", "#0B0B0C")
    ghost = pal.get("ghost", "#BFBFBF")
    out = [f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: PM,Inter,60,{hex2ass(txt)},{hex2ass(txt)},{hex2ass(shd)},{hex2ass(shd, 0x60)},0,0,0,0,100,100,0,0,1,0,0,5,40,40,40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"""]

    for c in cards:
        P = PRESETS[c.get("preset", "impacto")]
        st, en = float(c["start"]), float(c["end"]); dur = int((en - st) * 1000)
        anim = c.get("anim", P["anim"])
        lines = [parse_line(l) for l in c["text"].split("|")]
        # tamanhos e alturas
        spec = []
        for kind, t in lines:
            f = P["big"] if kind == "key" else P["alt"] if kind in ("alt", "ghost") else P["small"]
            size = round(f[3] * H); t2 = t.upper() if P["upper"] else t
            spec.append((kind, t2, f, size))
        lh = [s[3] * (0.82 if s[0] != "small" else 1.0) for s in spec]  # empilhamento apertado, como nas refs
        total = sum(lh)
        pos = c.get("pos", P["pos"])
        if isinstance(pos, list): cx, cy = pos
        else: cx, cy = W / 2, {"center": H * .55, "low": H * .70, "high": H * .30}[pos]
        y = cy - total / 2
        for i, ((kind, t, f, size), h) in enumerate(zip(spec, lh)):
            yc = y + h / 2; y += h
            font, bold, ital, _ = f
            sp = P["sp_big"] if kind != "small" else P["sp_small"]
            delay = i * 70                      # stagger entre linhas (≈2 frames)
            col = acc if kind == "key" else ghost if kind == "ghost" else txt
            alpha_main = "&H70&" if kind == "ghost" else "&H00&"
            base = (f"\\an5\\pos({cx:.0f},{yc:.0f})\\fn{font}\\fs{size}\\b{bold}\\i{ital}\\fsp{sp}"
                    f"\\bord0\\1c{hex2ass(col)}")
            # ---------- animação de entrada ----------
            if anim == "flip":   # V1: virada 3D no eixo X + leve overshoot
                a_in = (f"\\alpha&HFF&\\frx-75\\fscx112\\fscy112\\blur6\\t({delay},{delay+60},\\alpha{alpha_main})"
                        f"\\t({delay},{delay+180},0.6,\\frx0\\fscx100\\fscy100\\blur0)")
            elif anim == "pop":  # escala 130% -> 100% com blur
                a_in = (f"\\alpha&HFF&\\fscx130\\fscy130\\blur10\\t({delay},{delay+50},\\alpha{alpha_main})"
                        f"\\t({delay},{delay+160},0.5,\\fscx100\\fscy100\\blur0)")
            elif anim == "rise": # V5: sobe 30px + desfoque -> nítido
                a_in = (f"\\alpha&HFF&\\blur8\\t({delay},{delay+140},\\alpha{alpha_main}\\blur0)")
                base = base.replace(f"\\pos({cx:.0f},{yc:.0f})", f"\\move({cx:.0f},{yc+30:.0f},{cx:.0f},{yc:.0f},{delay},{delay+180})")
            elif anim == "type":
                a_in = ""
            else:                # blur: V2/V3/V4 desfoque -> foco
                a_in = (f"\\alpha&HFF&\\blur14\\fscx104\\fscy104\\t({delay},{delay+220},\\alpha{alpha_main}\\blur0\\fscx100\\fscy100)")
            # saída: desfoque + fade nos últimos 160 ms (assinatura das 5 refs)
            a_out = f"\\t({max(dur-160,0)},{dur},\\blur12\\alpha&HFF&)"

            if anim == "type":
                words = t.split(" ")
                wt = c.get("words")
                n = len(words); step = (dur * 0.6) / max(n, 1)
                parts = []
                for k, w in enumerate(words):
                    t0 = int(wt[k][0] * 1000) if wt and k < len(wt) else int(delay + k * step)
                    parts.append(f"{{\\alpha&HFF&\\t({t0},{t0+70},\\alpha{alpha_main})}}{w}")
                text = " ".join(parts)
            else:
                text = t

            if kind == "key":
                # camada 0: glow (mesmo texto, cor de destaque, muito desfocado)
                glow = base.replace(f"\\1c{hex2ass(col)}", f"\\1c{hex2ass(acc)}") + "\\blur18\\3c" + hex2ass(acc) + "\\bord6"
                out.append(f"Dialogue: 0,{ts(st)},{ts(en)},PM,,0,0,0,,{{{glow}{a_in.replace(chr(92)+'alpha'+alpha_main, chr(92)+'alpha&H90&')}{a_out}}}{text}")
                # camada 1: sombra 3D (deslocada, escura)
                sh = base.replace(f"\\1c{hex2ass(col)}", f"\\1c{hex2ass(mix(acc, shd, .75))}")
                sh = sh.replace(f"\\pos({cx:.0f},{yc:.0f})", f"\\pos({cx+4:.0f},{yc+7:.0f})")
                out.append(f"Dialogue: 1,{ts(st)},{ts(en)},PM,,0,0,0,,{{{sh}{a_in}{a_out}}}{text}")
                if P["gradient"]:
                    # gradiente vertical: metade de cima clara (acc2), metade de baixo = acc
                    top = int(yc - size * .55); mid = int(yc + size * .02); bot = int(yc + size * .6)
                    out.append(f"Dialogue: 2,{ts(st)},{ts(en)},PM,,0,0,0,,{{{base.replace(hex2ass(col), hex2ass(acc2))}\\clip(0,{top},{W},{mid}){a_in}{a_out}}}{text}")
                    out.append(f"Dialogue: 2,{ts(st)},{ts(en)},PM,,0,0,0,,{{{base}\\clip(0,{mid},{W},{bot+40}){a_in}{a_out}}}{text}")
                else:
                    out.append(f"Dialogue: 2,{ts(st)},{ts(en)},PM,,0,0,0,,{{{base}{a_in}{a_out}}}{text}")
            else:
                soft = f"\\shad2\\4c{hex2ass(shd, 0x50)}"
                out.append(f"Dialogue: 2,{ts(st)},{ts(en)},PM,,0,0,0,,{{{base}{soft}{a_in}{a_out}}}{text}")
    return "\n".join(out) + "\n"

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("cards"); ap.add_argument("out")
    ap.add_argument("--client", help="JSON do cliente (usa a chave 'palette')")
    ap.add_argument("--w", type=int, default=1080); ap.add_argument("--h", type=int, default=1920)
    a = ap.parse_args()
    pal = {}
    if a.client:
        pal = json.load(open(a.client)).get("palette", {})
    cards = json.load(open(a.cards))
    open(a.out, "w", encoding="utf-8").write(build(cards, pal, a.w, a.h))
    print(f"OK -> {a.out} ({len(cards)} cartões)")

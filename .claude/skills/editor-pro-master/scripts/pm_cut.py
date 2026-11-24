#!/usr/bin/env python3
"""
Pro Master — montagem com transições de assinatura (ffmpeg).

Todas as transições são "sem sobreposição": o efeito acontece no fim do clipe A e no
começo do clipe B, então o áudio continua 100% sincronizado (corte seco no áudio,
o SFX entra por cima depois).

Uso:
  python3 pm_cut.py edl.json saida.mp4 [--w 1080 --h 1920 --fps 30]

edl.json:
{
  "clips": [
    {"src": "bruto.mp4", "in": 12.4, "out": 15.1},
    {"src": "bruto.mp4", "in": 15.1, "out": 18.0, "zoom": 1.18, "tr": "blur"},
    {"src": "broll.mp4", "in": 0.0,  "out": 1.6,  "tr": "whip", "mute": true},
    {"src": "bruto.mp4", "in": 18.0, "out": 22.0, "tr": "static"},
    {"src": "bruto.mp4", "in": 22.0, "out": 25.0, "tr": "flash", "mono": true}
  ]
}
  "tr"   = transição ANTES deste clipe: cut | blur | whip | flash | zoom | static | dip
  "zoom" = punch-in (1.0–1.3) — alterna enquadramento aberto/fechado em jump cuts (V1)
  "mono" = P&B de ênfase (V1 "você tá competindo com template", V4, V5)
  "mute" = zera o áudio do clipe (b-roll sem som direto)
"""
import json, subprocess, sys, argparse

D = {"blur": 0.20, "whip": 0.12, "flash": 0.08, "zoom": 0.22, "dip": 0.25}

def build(edl, W, H, fps):
    clips = edl["clips"]; inputs = []; fc = []; vs = []; as_ = []
    for i, c in enumerate(clips):
        inputs += ["-ss", str(c["in"]), "-t", f"{c['out'] - c['in']:.3f}", "-i", c["src"]]
    seg = 0
    for i, c in enumerate(clips):
        L = c["out"] - c["in"]
        tr_in = c.get("tr", "cut")
        tr_out = clips[i + 1].get("tr", "cut") if i + 1 < len(clips) else "cut"
        z = float(c.get("zoom", 1.0))
        v = f"[{i}:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}"
        if z != 1.0:
            v += f",scale={int(W*z)//2*2}:{int(H*z)//2*2},crop={W}:{H}"
        if c.get("mono"):
            v += ",hue=s=0,eq=contrast=1.15"
        v += f",fps={fps},format=yuv420p,setsar=1,settb=1/{fps*1000}"
        fc.append(v + f"[c{i}]"); cur = f"c{i}"

        # ---------- efeito na SAÍDA do clipe (tail) ----------
        def tail(cur, blurf, d):
            fc.append(f"[{cur}]split[{cur}a][{cur}b];[{cur}b]{blurf},trim=start={L-d:.3f},setpts=PTS-STARTPTS[{cur}bt];"
                      f"[{cur}a][{cur}bt]xfade=transition=fade:duration={d}:offset={L-d:.3f}[{cur}t]")
            return f"{cur}t"
        def head(cur, blurf, d):
            fc.append(f"[{cur}]split[{cur}a][{cur}b];[{cur}b]{blurf},trim=end={d},setpts=PTS-STARTPTS[{cur}bh];"
                      f"[{cur}bh][{cur}a]xfade=transition=fade:duration={d}:offset=0[{cur}h]")
            return f"{cur}h"

        if tr_out == "blur":  cur = tail(cur, "gblur=sigma=35", D["blur"])
        if tr_out == "whip":  cur = tail(cur, "gblur=sigma=60:sigmaV=0.01", D["whip"])
        if tr_out == "flash": fc.append(f"[{cur}]fade=t=out:st={L-D['flash']:.3f}:d={D['flash']}:color=white[{cur}f]"); cur += "f"
        if tr_out == "dip":   fc.append(f"[{cur}]fade=t=out:st={L-D['dip']:.3f}:d={D['dip']}:color=black[{cur}f]"); cur += "f"
        # ---------- efeito na ENTRADA do clipe (head) ----------
        if tr_in == "blur":  cur = head(cur, "gblur=sigma=35", D["blur"])
        if tr_in == "whip":  cur = head(cur, "gblur=sigma=60:sigmaV=0.01", D["whip"])
        if tr_in == "flash": fc.append(f"[{cur}]fade=t=in:st=0:d={D['flash']}:color=white[{cur}g]"); cur += "g"
        if tr_in == "dip":   fc.append(f"[{cur}]fade=t=in:st=0:d={D['dip']}:color=black[{cur}g]"); cur += "g"
        if tr_in == "zoom":  # entra a 135% desfocado e assenta em 100% (punch-in de impacto)
            d = D["zoom"]
            fc.append(f"[{cur}]scale=w='trunc({W}*(1+0.35*max(0,1-t/{d}))/2)*2':h='trunc({H}*(1+0.35*max(0,1-t/{d}))/2)*2':eval=frame,"
                      f"crop={W}:{H},setsar=1[{cur}z]"); cur += "z"

        # áudio
        if c.get("mute"):
            fc.append(f"anullsrc=r=48000:cl=stereo,atrim=duration={L:.3f}[a{i}]")
        else:
            fc.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=duration={L:.3f},asetpts=PTS-STARTPTS[a{i}]")

        if tr_in == "static":  # V3: chiado de TV 0.25 s + barras de cor 0.15 s (+ som de estática)
            fc.append(f"color=c=gray:s={W//4}x{H//4}:r={fps}:d=0.25,format=gray,geq=lum='random(1)*255',scale={W}:{H}:flags=neighbor,format=yuv420p,setsar=1,settb=1/{fps*1000}[st{i}]")
            fc.append(f"smptehdbars=s={W}x{H}:r={fps}:d=0.15,format=yuv420p,setsar=1,settb=1/{fps*1000}[sb{i}]")
            fc.append(f"anoisesrc=d=0.25:c=white:a=0.25:r=48000,aformat=channel_layouts=stereo[sn{i}]")
            fc.append(f"sine=f=1000:d=0.15:r=48000,volume=0.15,aformat=channel_layouts=stereo[ss{i}]")
            vs += [f"[st{i}]", f"[sb{i}]"]; as_ += [f"[sn{i}]", f"[ss{i}]"]
        vs.append(f"[{cur}]"); as_.append(f"[a{i}]")
    n = len(vs)
    fc.append("".join(v + a for v, a in zip(vs, as_)) + f"concat=n={n}:v=1:a=1[v][a]")
    return inputs, ";".join(fc)

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("edl"); ap.add_argument("out")
    ap.add_argument("--w", type=int, default=1080); ap.add_argument("--h", type=int, default=1920)
    ap.add_argument("--fps", type=int, default=30)
    a = ap.parse_args()
    inputs, fc = build(json.load(open(a.edl)), a.w, a.h, a.fps)
    cmd = ["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
           "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", a.out]
    r = subprocess.run(cmd)
    if r.returncode: print("ERRO no ffmpeg. filter_complex:\n" + fc.replace(";", ";\n"), file=sys.stderr); sys.exit(1)
    print(f"OK -> {a.out}")

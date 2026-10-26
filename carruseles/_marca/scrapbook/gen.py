"""Plantilla 'scrapbook editorial' (Flor 26/10: nada de placas lisas; foto en cada placa).
Uso: python3 gen.py spec.json carpeta_destino
Tipos de placa: photo | note | polaroid. Campos: img, pos, title, text, hand, kick, list, flow."""
import json,sys,os,shutil,html,random
spec=json.load(open(sys.argv[1]));out=sys.argv[2];os.makedirs(out+'/img',exist_ok=True)
CSS='''
:root{--ink:#2B1A10;--terra:#B5704A;--cream:#FAF4EC;--brown:#3F1E0D}
*{box-sizing:border-box;margin:0;padding:0}body{background:#777}
.slide{width:1080px;height:1440px;margin:0 auto 40px;position:relative;overflow:hidden;background:#d9cbb8}
.bg{position:absolute;inset:0;background-size:cover;background-position:center}
.bg.blur{filter:blur(14px) brightness(.85) saturate(1.05);transform:scale(1.08)}
.shade:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0) 42%,rgba(0,0,0,.72) 74%,rgba(0,0,0,.86) 100%)}
.grain:before{content:"";position:absolute;inset:0;z-index:5;pointer-events:none;opacity:.10;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.paper{background:#EFE6D8;background-image:radial-gradient(circle at 20% 10%,rgba(255,255,255,.55),transparent 60%),radial-gradient(circle at 90% 90%,rgba(181,112,74,.12),transparent 55%)}
.top{position:absolute;top:56px;left:80px;right:80px;display:flex;justify-content:space-between;z-index:6;font:600 22px/1 'Inter',sans-serif;letter-spacing:.26em;color:#fff;text-transform:uppercase;text-shadow:0 1px 8px rgba(0,0,0,.4)}
.top .n{font:700 44px/1 'Caveat',cursive;letter-spacing:0;text-transform:none}
.paper .top{color:var(--brown);text-shadow:none}
.foot{position:absolute;left:80px;right:80px;bottom:96px;z-index:6;color:#fff}
.t{font:600 92px/1.02 'Crimson Pro',serif;letter-spacing:-.022em;text-shadow:0 2px 22px rgba(0,0,0,.45)}
.t.md{font-size:76px}.t.sm{font-size:64px;font-weight:500}
.x{font:500 60px/1.18 'Crimson Pro',serif;margin-top:22px;text-shadow:0 2px 16px rgba(0,0,0,.5)}
.x i,.t i{font-style:italic;color:#F2C9A8}
.hand{font:700 64px/1.05 'Caveat',cursive;color:#F7D9B8;margin-top:26px;transform:rotate(-2deg);display:inline-block}
.hl{background:linear-gradient(transparent 58%,rgba(181,112,74,.75) 58%,rgba(181,112,74,.75) 90%,transparent 90%);padding:0 6px}
.kick{font:600 24px/1 'Inter',sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#F2C9A8;margin-bottom:26px}
.list p{font:500 56px/1.12 'Crimson Pro',serif;opacity:.88;text-shadow:0 2px 14px rgba(0,0,0,.5)}
.note{position:absolute;z-index:6;left:110px;right:110px;top:50%;transform:translateY(-50%) rotate(-1.6deg);background:var(--cream);color:var(--ink);padding:86px 76px 80px;box-shadow:0 30px 60px rgba(0,0,0,.35),0 2px 0 rgba(0,0,0,.05)}
.note:before{content:"";position:absolute;top:-30px;left:50%;width:220px;height:62px;margin-left:-110px;background:rgba(214,190,160,.82);transform:rotate(3deg);box-shadow:0 2px 6px rgba(0,0,0,.12)}
.note .t{text-shadow:none;color:var(--ink)}.note .x{text-shadow:none;color:var(--ink)}.note .x i,.note .t i{color:var(--terra)}
.note .hand{color:var(--terra)}.note .kick{color:var(--terra)}
.flow p{font:600 74px/1.06 'Crimson Pro',serif}.flow .ar{font:700 60px/1 'Caveat',cursive;color:var(--terra);margin:2px 0 2px 8px}
.pola{position:absolute;z-index:4;background:#fff;padding:28px 28px 110px;box-shadow:0 26px 50px rgba(0,0,0,.28);transform:rotate(3.5deg)}
.pola .ph{width:500px;height:580px;background-size:cover;background-position:center}
.pola .cap{position:absolute;left:0;right:0;bottom:30px;text-align:center;font:700 52px/1 'Caveat',cursive;color:var(--brown)}
.tape{position:absolute;width:180px;height:54px;background:rgba(214,190,160,.85);z-index:5}
.ptext{position:absolute;z-index:6;left:80px;right:80px;bottom:100px;color:var(--ink)}
.ptext .x{text-shadow:none}.ptext .x i{color:var(--terra)}.ptext .t{text-shadow:none}
.arrow{position:absolute;z-index:6}
'''
def esc(s): return s
parts=[]
for i,s in enumerate(spec['slides']):
    n=f"{i+1:02d} / {len(spec['slides']):02d}"
    k=s['type'];img=s.get('img')
    if img: shutil.copy(img,f"{out}/img/{os.path.basename(img)}");src='img/'+os.path.basename(img)
    pos=s.get('pos','center')
    inner=''
    for key in s:
        v=s[key]
        if key=='kick': inner+=f"<p class='kick'>{v}</p>"
        elif key=='list': inner+="<div class='list'>"+''.join(f"<p>{l}</p>" for l in v)+"</div>"
        elif key=='title': inner+=f"<p class='t {s.get('size','')}'>{v}</p>"
        elif key=='flow': inner+="<div class='flow'>"+"<p class='ar'>↓</p>".join(f"<p>{l}</p>" for l in v)+"</div>"
        elif key=='text': inner+=f"<p class='x'>{v}</p>"
        elif key=='hand': inner+=f"<p class='hand'>{v}</p>"
    top=f"<div class='top'><span>AT WORK</span><span class='n'>{'desliza →' if i==0 else n}</span></div>"
    if k=='photo':
        parts.append(f"<section class='slide grain shade' id='s{i+1}'><div class='bg' style=\"background-image:url({src});background-position:{pos}\"></div>{top}<div class='foot'>{inner}</div></section>")
    elif k=='note':
        parts.append(f"<section class='slide grain' id='s{i+1}'><div class='bg blur' style=\"background-image:url({src});background-position:{pos}\"></div>{top}<div class='note'>{inner}</div></section>")
    elif k=='polaroid':
        cap=s.get('cap','')
        parts.append(f"<section class='slide grain paper' id='s{i+1}'>{top}<div class='pola' style='left:{s.get('px',300)}px;top:{s.get('py',150)}px'><div class='ph' style=\"background-image:url({src});background-position:{pos}\"></div><div class='cap'>{cap}</div></div><div class='tape' style='left:{s.get('px',300)+220}px;top:{s.get('py',150)-22}px;transform:rotate(-4deg)'></div><div class='ptext'>{inner}</div></section>")
h=f"<!doctype html><html lang='es'><head><meta charset='utf-8'><title>AT WORK · {spec['title']}</title><link rel='stylesheet' href='../../_marca/fonts/fonts.css'><link rel='stylesheet' href='../../_marca/fonts/caveat.css'><style>{CSS}</style></head><body>{''.join(parts)}</body></html>"
h=h.replace("../../_marca/fonts/caveat.css","../../_marca/fonts/caveat.css")
open(f"{out}/index.html",'w').write(h)
open(f"{out}/caption.txt",'w').write(spec['caption'])
print("ok",len(parts))

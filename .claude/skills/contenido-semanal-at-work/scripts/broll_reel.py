"""Reel de B-roll con texto en pantalla (formato AT WORK, aprobado 27/10 y 29/10).
Uso: python3 broll_reel.py spec.json   (corre dentro de la carpeta del reel)
spec = {"clips": {"A": "/ruta/clip.mov", ...},
        "segs": [["A", 0.0, 2.2, 0.6], ["IMG:/ruta/foto.jpg", 0, 3.3, 1], ...],   # fuente, inicio, fin, velocidad
        "texts": ["hook…", "placa 2…", ...],   # uno por segmento; el primero es el hook (recuadro crema)
        "end": [["Casi nunca", "big", "crema"], ["es el inglés.", "big", "terra"], ["Cuéntame…", "small", "muted"]],
        "out": "AT-WORK_reel_DD-MM_slug.mp4"}"""
import subprocess,json,sys
from PIL import Image,ImageDraw,ImageFont
S=json.load(open(sys.argv[1]))
FON="/home/user/brakingbarriersatwork/.claude/skills/editar-reels/fonts"
W,H=1080,1920
segs=[tuple(x) if not x[0].startswith("IMG:") else tuple(x) for x in S["segs"]]
segs=[(S["clips"].get(x[0],x[0]),)+tuple(x[1:]) for x in segs]
durs=[(e-s)/sp for _,s,e,sp in segs]; t0=[sum(durs[:i]) for i in range(len(durs))]; T=sum(durs)
bounds=t0+[T]
texts=[(bounds[i],bounds[i+1],t,"hook" if i==0 else "body") for i,t in enumerate(S["texts"])]
def wrap(d,t,f,mw):
    out=[];cur=""
    for w in t.split():
        x=(cur+" "+w).strip()
        if d.textlength(x,font=f)>mw and cur: out.append(cur);cur=w
        else: cur=x
    out.append(cur);return out
pngs=[]
for i,(a,b,t,k) in enumerate(texts):
    im=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(im)
    t=t.replace(" 🙃","")
    if k=="hook":
        f=ImageFont.truetype(f"{FON}/CrimsonPro-SemiBold.ttf",78);L=wrap(d,t,f,880);lh=88;top=1240;bg=(249,245,238,250);fg=(63,30,13)
    else:
        f=ImageFont.truetype(f"{FON}/CrimsonPro-SemiBold.ttf",74);L=wrap(d,t,f,860);lh=86;top=1300;bg=(63,30,13,238);fg=(250,244,236)
    mw=max(d.textlength(l,font=f) for l in L)
    d.rounded_rectangle(((W-mw)/2-44,top-32,(W+mw)/2+44,top+lh*len(L)+20),radius=28,fill=bg)
    for j,l in enumerate(L): d.text((W/2,top+j*lh+lh/2-4),l,font=f,fill=fg,anchor='mm')
    n=f"t{i}.png";im.save(n);pngs.append((n,a,b))
im=Image.new('RGB',(W,H),(63,30,13));d=ImageDraw.Draw(im)
F={"big":ImageFont.truetype(f"{FON}/CrimsonPro-SemiBold.ttf",92),"small":ImageFont.truetype(f"{FON}/CrimsonPro-Regular.ttf",64),"huge":ImageFont.truetype(f"{FON}/CrimsonPro-SemiBold.ttf",120)}
C={"crema":(250,244,236),"terra":(215,161,132),"muted":(196,150,120)}
y=560
for t,sz,col in S["end"]:
    d.text((W/2,y),t,font=F[sz],fill=C[col],anchor='mm'); y+=110 if sz!="small" else 90
im.save("end.png")
grade="hqdn3d=1:1:2:2,curves=master='0/0.02 0.25/0.29 0.5/0.56 0.75/0.80 1/1',eq=contrast=1.05:saturation=1.08,colortemperature=temperature=5600:mix=0.35,unsharp=5:5:0.35"
ins=[];fc=""
srcs=sorted({s for s,*_ in segs if not s.startswith("IMG:")})
for s in srcs: ins+=["-i",s]
imgs=[x[0][4:] for x in segs if isinstance(x[0],str) and x[0].startswith("IMG:")]
for p_ in imgs: ins+=["-loop","1","-framerate","30","-t","5","-i",p_]
for i,(src,s,e,sp) in enumerate(segs):
    if src.startswith("IMG:"):
        k=len(srcs)+imgs.index(src[4:]);d_=e-s;nf=int(d_*30)
        fc+=f"[{k}:v]scale=1350:2400:force_original_aspect_ratio=increase,crop=1350:2400,zoompan=z='1+0.0016*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={nf}:s=1080x1920:fps=30,trim=0:{d_},setpts=PTS-STARTPTS,format=yuv420p,setsar=1[s{i}];"
        continue
    k=srcs.index(src)
    fc+=f"[{k}:v]trim={s}:{e},setpts=(PTS-STARTPTS)/{sp},scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30,format=yuv420p,setsar=1[s{i}];"
fc+="".join(f"[s{i}]" for i in range(len(segs)))+f"concat=n={len(segs)}:v=1[cv];[cv]{grade}[g0];"
prev="g0"
for i,(n,a,b) in enumerate(pngs):
    ins+=["-loop","1","-t",str(T),"-i",n]; idx=len(srcs)+len(imgs)+i
    fc+=f"[{prev}][{idx}:v]overlay=0:0:enable='between(t,{a:.2f},{b:.2f})'[o{i}];";prev=f"o{i}"
ins+=["-loop","1","-t","3","-i","end.png"]; ei=len(srcs)+len(imgs)+len(pngs)
fc+=f"[{ei}:v]scale=1080:1920,fps=30,format=yuv420p,trim=0:3,setpts=PTS-STARTPTS[e];[{prev}]format=yuv420p,trim=0:{T:.2f}[m];[m][e]concat=n=2:v=1[ov];anullsrc=r=48000:cl=stereo,atrim=0:{T+3:.2f}[oa]"
subprocess.run(["ffmpeg","-v","error","-y"]+ins+["-filter_complex",fc,"-map","[ov]","-map","[oa]","-c:v","libx264","-preset","slow","-crf","18","-pix_fmt","yuv420p","-c:a","aac","-shortest",S["out"]],check=True)
print("T",T, [round(x,2) for x in t0])

import subprocess
from PIL import Image,ImageDraw,ImageFont
U="/root/.claude/uploads/72db8bf0-675f-5b43-beb4-57febd617e75/"
A=U+"8ecbd766-62EA15E3-0186-4731-BD28-5F5DEA14130B.mov"
B=U+"61eef6ec-39277FA7-6861-4B40-AABA-C6C0E78BF901.mov"
C=U+"da16f4b5-IMG_5537.mov"
FON="/home/user/brakingbarriersatwork/.claude/skills/editar-reels/fonts"
W,H=1080,1920
segs=[(A,0.0,3.6),(C,2.6,5.9),(B,2.0,5.6),(A,5.0,7.9),(A,7.9,9.9)]
# text per segment index range: (start,end,text,kind)
durs=[e-s for _,s,e in segs]; t0=[sum(durs[:i]) for i in range(len(durs))]; T=sum(durs)
texts=[(0,t0[1],"¿Sabías que explicar tu trabajo cambia por completo entre español e inglés?","hook"),
(t0[1],t0[2],"En español damos contexto primero… y la idea llega al final.","body"),
(t0[2],t0[3],"En inglés, quien te escucha espera la idea primero.","body"),
(t0[3],t0[4],"Si traduces tu orden del español, se pierden antes de que llegues.","body"),
(t0[4],T,"No te falta inglés. Te falta cambiar el orden.","body")]
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
f1=ImageFont.truetype(f"{FON}/CrimsonPro-SemiBold.ttf",92);f2=ImageFont.truetype(f"{FON}/CrimsonPro-Regular.ttf",64);f3=ImageFont.truetype(f"{FON}/CrimsonPro-SemiBold.ttf",120)
y=520
for t,f,c,g in [("1 idea.",f1,(250,244,236),110),("A",0,(196,150,120),90),("1 dato que la sostenga.",f1,(250,244,236),110),("A",0,(196,150,120),90),("El resto, si te lo preguntan.",f1,(215,161,132),220),("Comenta",f2,(196,150,120),120),("ORDEN",f3,(250,244,236),170),("AT WORK · Clear, not native.",ImageFont.truetype(f"{FON}/CrimsonPro-Regular.ttf",44),(196,150,120),0)]:
    if t=="A": d.line((W/2,y-28,W/2,y+22),fill=c,width=5);d.polygon([(W/2-16,y+10),(W/2+16,y+10),(W/2,y+34)],fill=c)
    else: d.text((W/2,y),t,font=f,fill=c,anchor='mm')
    y+=g
im.save("end.png")
grade="hqdn3d=1:1:2:2,curves=master='0/0.02 0.25/0.29 0.5/0.56 0.75/0.80 1/1',eq=contrast=1.05:saturation=1.08,colortemperature=temperature=5600:mix=0.35,unsharp=5:5:0.35"
ins=[];fc=""
srcs=[A,B,C]
for s in srcs: ins+=["-i",s]
for i,(src,s,e) in enumerate(segs):
    k=srcs.index(src)
    fc+=f"[{k}:v]trim={s}:{e},setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30,format=yuv420p[s{i}];"
fc+="".join(f"[s{i}]" for i in range(len(segs)))+f"concat=n={len(segs)}:v=1[cv];[cv]{grade}[g0];"
prev="g0"
for i,(n,a,b) in enumerate(pngs):
    ins+=["-loop","1","-t",str(T),"-i",n]; idx=3+i
    fc+=f"[{prev}][{idx}:v]overlay=0:0:enable='between(t,{a:.2f},{b:.2f})'[o{i}];";prev=f"o{i}"
ins+=["-loop","1","-t","3","-i","end.png"]; ei=3+len(pngs)
fc+=f"[{ei}:v]scale=1080:1920,fps=30,format=yuv420p,trim=0:3,setpts=PTS-STARTPTS[e];[{prev}]format=yuv420p,trim=0:{T:.2f}[m];[m][e]concat=n=2:v=1[ov];anullsrc=r=48000:cl=stereo,atrim=0:{T+3:.2f}[oa]"
subprocess.run(["ffmpeg","-v","error","-y"]+ins+["-filter_complex",fc,"-map","[ov]","-map","[oa]","-c:v","libx264","-preset","slow","-crf","18","-pix_fmt","yuv420p","-c:a","aac","-shortest","AT-WORK_reel_sabias-que_SIN-VOZ.mp4"],check=True)
print("T",T, [round(x,2) for x in t0])

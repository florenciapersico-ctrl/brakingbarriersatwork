import subprocess
from PIL import Image,ImageDraw,ImageFont
U="/root/.claude/uploads/72db8bf0-675f-5b43-beb4-57febd617e75/"
A=U+"8ecbd766-62EA15E3-0186-4731-BD28-5F5DEA14130B.mov"
B=U+"61eef6ec-39277FA7-6861-4B40-AABA-C6C0E78BF901.mov"
C=U+"da16f4b5-IMG_5537.mov"
FON="/home/user/brakingbarriersatwork/.claude/skills/editar-reels/fonts"
W,H=1080,1920
segs=[("IMG:/home/user/brakingbarriersatwork/carruseles/_marca/img/fotos-oct26b/flor-auto-sien.jpg",0,3.2,1),("IMG:/home/user/brakingbarriersatwork/carruseles/_marca/img/fotos-oct26b/laptop-microfono-sillon.jpg",0,3.4,1),(C,0.0,3.3,1),(C,3.3,6.6,1),(A,2.0,3.6,0.48),(A,8.5,9.9,0.42)]
# text per segment index range: (start,end,text,kind)
durs=[(e-s)/sp for _,s,e,sp in segs]; t0=[sum(durs[:i]) for i in range(len(durs))]; T=sum(durs)
texts=[(0,t0[1],"Deja de ensayar tu presentación en inglés 20 veces","hook"),
(t0[1],t0[2],"Muchas alumnas llegan a clase con su presentación memorizada.","body"),
(t0[2],t0[3],"Y su miedo no es el guion. Es: «¿y si me interrumpen?»","body"),
(t0[3],t0[4],"Porque una reunión no es una exposición del colegio. Es una conversación.","body"),
(t0[4],t0[5],"Así que no ensayamos el discurso. Ensayamos las preguntas que le pueden hacer.","body"),
(t0[5],T,"«I don't have that figure with me. I'll send it after the meeting.»","body")]
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
y=560
for t,f,c,g in [("Ensaya la conversación,",f1,(250,244,236),110),("no el discurso.",f1,(215,161,132),220),("Comenta",f2,(196,150,120),120),("PREGUNTAS",f3,(250,244,236),130),("y te mando las frases para",f2,(196,150,120),76),("cuando te interrumpen",f2,(196,150,120),150)]:
    if t=="A": d.line((W/2,y-28,W/2,y+22),fill=c,width=5);d.polygon([(W/2-16,y+10),(W/2+16,y+10),(W/2,y+34)],fill=c)
    else: d.text((W/2,y),t,font=f,fill=c,anchor='mm')
    y+=g
im.save("end.png")
grade="hqdn3d=1:1:2:2,curves=master='0/0.02 0.25/0.29 0.5/0.56 0.75/0.80 1/1',eq=contrast=1.05:saturation=1.08,colortemperature=temperature=5600:mix=0.35,unsharp=5:5:0.35"
ins=[];fc=""
srcs=[A,B,C]
for s in srcs: ins+=["-i",s]
imgs=[x[0][4:] for x in segs if isinstance(x[0],str) and x[0].startswith("IMG:")]
for p_ in imgs: ins+=["-loop","1","-framerate","30","-t","5","-i",p_]
for i,(src,s,e,sp) in enumerate(segs):
    if src.startswith("IMG:"):
        k=3+imgs.index(src[4:]);d_=e-s;nf=int(d_*30)
        fc+=f"[{k}:v]scale=1350:2400:force_original_aspect_ratio=increase,crop=1350:2400,zoompan=z='1+0.0016*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={nf}:s=1080x1920:fps=30,trim=0:{d_},setpts=PTS-STARTPTS,format=yuv420p,setsar=1[s{i}];"
        continue
    k=srcs.index(src)
    fc+=f"[{k}:v]trim={s}:{e},setpts=(PTS-STARTPTS)/{sp},scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30,format=yuv420p,setsar=1[s{i}];"
fc+="".join(f"[s{i}]" for i in range(len(segs)))+f"concat=n={len(segs)}:v=1[cv];[cv]{grade}[g0];"
prev="g0"
for i,(n,a,b) in enumerate(pngs):
    ins+=["-loop","1","-t",str(T),"-i",n]; idx=3+len(imgs)+i
    fc+=f"[{prev}][{idx}:v]overlay=0:0:enable='between(t,{a:.2f},{b:.2f})'[o{i}];";prev=f"o{i}"
ins+=["-loop","1","-t","3","-i","end.png"]; ei=3+len(imgs)+len(pngs)
fc+=f"[{ei}:v]scale=1080:1920,fps=30,format=yuv420p,trim=0:3,setpts=PTS-STARTPTS[e];[{prev}]format=yuv420p,trim=0:{T:.2f}[m];[m][e]concat=n=2:v=1[ov];anullsrc=r=48000:cl=stereo,atrim=0:{T+3:.2f}[oa]"
subprocess.run(["ffmpeg","-v","error","-y"]+ins+["-filter_complex",fc,"-map","[ov]","-map","[oa]","-c:v","libx264","-preset","slow","-crf","18","-pix_fmt","yuv420p","-c:a","aac","-shortest","AT-WORK_reel_29-10_deja-de-ensayar_SIN-VOZ.mp4"],check=True)
print("T",T, [round(x,2) for x in t0])

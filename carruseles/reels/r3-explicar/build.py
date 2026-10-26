import subprocess,os
from PIL import Image,ImageDraw,ImageFont
F="/root/.claude/uploads/72db8bf0-675f-5b43-beb4-57febd617e75/da16f4b5-IMG_5537.mov"
FON="/home/user/brakingbarriersatwork/.claude/skills/editar-reels/fonts"
W,H=1080,1920
def wrap(d,t,f,mw):
    out=[];cur=""
    for w in t.split():
        x=(cur+" "+w).strip()
        if d.textlength(x,font=f)>mw and cur: out.append(cur);cur=w
        else: cur=x
    out.append(cur);return out
def card(name,hook,body,foot=None):
    im=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(im)
    hf=ImageFont.truetype(f"{FON}/CrimsonPro-SemiBold.ttf",80)
    L=hook.split("|") if "|" in hook else wrap(d,hook,hf,880);lh=96;top=250
    mw=max(d.textlength(l,font=hf) for l in L)
    d.rounded_rectangle(((W-mw)/2-46,top-34,(W+mw)/2+46,top+lh*len(L)+22),radius=28,fill=(249,245,238,248))
    for i,l in enumerate(L): d.text((W/2,top+i*lh+lh/2-4),l,font=hf,fill=(63,30,13),anchor='mm')
    if body:
        bf=ImageFont.truetype(f"{FON}/CrimsonPro-Regular.ttf",70)
        B=wrap(d,body,bf,860);bl=82;bt=1300
        bw=max(d.textlength(l,font=bf) for l in B)
        d.rounded_rectangle(((W-bw)/2-40,bt-28,(W+bw)/2+40,bt+bl*len(B)+18),radius=24,fill=(63,30,13,240))
        for i,l in enumerate(B): d.text((W/2,bt+i*bl+bl/2-4),l,font=bf,fill=(250,244,236),anchor='mm')
    im.save(name)
HOOK="Saber inglés|y saber explicar lo que haces|NO es lo mismo"
cards=[("c1.png",HOOK,""),
("c2.png",HOOK,"Puedes saber todo el vocabulario de tu trabajo…"),
("c3.png",HOOK,"y aun así trabarte cuando alguien te pregunta qué haces."),
("c4.png",HOOK,"Porque explicar no es traducir: es elegir qué decir primero.")]
for c in cards: card(*c)
# end plate
im=Image.new('RGB',(W,H),(63,30,13));d=ImageDraw.Draw(im)
f1=ImageFont.truetype(f"{FON}/CrimsonPro-SemiBold.ttf",92);f2=ImageFont.truetype(f"{FON}/CrimsonPro-Regular.ttf",64);f3=ImageFont.truetype(f"{FON}/CrimsonPro-SemiBold.ttf",110)
y=560
for t,f,c,g in [("1 idea.",f1,(250,244,236),110),("ARROW",f2,(196,150,120),90),("1 dato que la sostenga.",f1,(250,244,236),110),("ARROW",f2,(196,150,120),90),("El resto, si te lo preguntan.",f1,(215,161,132),200),("Comenta",f2,(196,150,120),110),("ORDEN",f3,(250,244,236),160),("AT WORK · Clear, not native.",ImageFont.truetype(f"{FON}/CrimsonPro-Regular.ttf",44),(196,150,120),0)]:
    (d.line((W/2,y-28,W/2,y+22),fill=c,width=5),d.polygon([(W/2-16,y+10),(W/2+16,y+10),(W/2,y+34)],fill=c)) if t=='ARROW' else d.text((W/2,y),t,font=f,fill=c,anchor='mm');y+=g
im.save("end.png")
grade="hqdn3d=1:1:2:2,curves=master='0/0.02 0.25/0.29 0.5/0.56 0.75/0.80 1/1',eq=contrast=1.05:saturation=1.08,colortemperature=temperature=5600:mix=0.35,unsharp=5:5:0.3"
# segments: coffee 0-8.4 slowed 0.8x (=10.5s), walk 8.6-11.8 (3.2s) -> 13.7s ; cards: c1 0-3, c2 3-6.5, c3 6.5-10, c4 10-13.7
fc=(f"[0:v]trim=0:8.4,setpts=(PTS-STARTPTS)/0.8[a];[0:v]trim=8.6:11.8,setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1[v0];"
    f"[v0]scale=1080:1920,{grade},fps=30,format=yuv420p[g];"
    "[g][1:v]overlay=0:0:enable='between(t,0,3)'[x1];[x1][2:v]overlay=0:0:enable='between(t,3,6.5)'[x2];"
    "[x2][3:v]overlay=0:0:enable='between(t,6.5,10)'[x3];[x3][4:v]overlay=0:0:enable='gte(t,10)'[x4];"
    "[5:v]scale=1080:1920,fps=30,format=yuv420p,trim=0:3,setpts=PTS-STARTPTS[e];[x4]format=yuv420p[x5];[x5][e]concat=n=2:v=1[ov];"
    "anullsrc=r=48000:cl=stereo,atrim=0:16.7[oa]")
cmd=["ffmpeg","-v","error","-y","-i",F]+sum([["-loop","1","-t","14","-i",c] for c in ["c1.png","c2.png","c3.png","c4.png"]],[])+["-loop","1","-t","3","-i","end.png","-filter_complex",fc,"-map","[ov]","-map","[oa]","-c:v","libx264","-preset","slow","-crf","18","-pix_fmt","yuv420p","-c:a","aac","-shortest","AT-WORK_reel_explicar_SIN-VOZ.mp4"]
subprocess.run(cmd,check=True)

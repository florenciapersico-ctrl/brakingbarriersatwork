import json,re
from PIL import Image,ImageDraw,ImageFont
k=json.load(open('keep.json')); keep=k['keep']; total=k['total']
def remap(x):
  out=0
  for a,b in keep:
    if x<=a: return out
    if x<=b: return out+(x-a)
    out+=b-a
  return out
W=json.load(open('words.json'))
words=[]
for s,e,t in W:
  t=t.strip()
  if t.lower()=='at' and words==[] : pass
  words.append([remap(s),remap(e),t])
for i,w in enumerate(words):
  if w[2].lower()=='at' and i+1<len(words) and words[i+1][2].lower().startswith('work'): w[2]='AT'; words[i+1][2]='WORK'
lines_txt=[l.split() for l in open('chunks_text.txt').read().strip().split('\n')]
chunks=[];i=0
inq=False
for L in lines_txt:
  c=[]
  for t in L:
    w=words[i]; i+=1
    if t.startswith('«'): inq=True
    c.append([w[0],w[1],t,inq])
    if t.endswith(('»','».','»,')): inq=False
  chunks.append(c)
F=ImageFont.truetype('fonts/CrimsonPro-Regular.ttf',66); FI=ImageFont.truetype('fonts/CrimsonPro-Italic.ttf',66)
BOX=(63,30,13,255); ON=(250,244,236); OFF=(196,150,120)
CY=1020
def render(chunk,j,path):
  im=Image.new('RGBA',(1080,1920),(0,0,0,0)); d=ImageDraw.Draw(im)
  parts=[]
  for w in chunk:
    parts.append((w[2],FI if w[3] else F))
  sp=d.textlength(' ',font=F)
  widths=[d.textlength(t,font=f) for t,f in parts]
  tw=sum(widths)+sp*(len(parts)-1)
  assert tw<980, (tw,[p[0] for p in parts])
  padx,h=26,92
  x0=(1080-tw)/2; d.rounded_rectangle((x0-padx,CY-h/2,x0+tw+padx,CY+h/2),radius=10,fill=BOX)
  x=x0
  for i,((t,f),wd) in enumerate(zip(parts,widths)):
    d.text((x,CY),t,font=f,fill=ON if i<=j else OFF,anchor='lm'); x+=wd+sp
  im.save(path)
lines=[];n=0;t=0.0
blank=Image.new('RGBA',(1080,1920),(0,0,0,0)); blank.save('caps/blank.png')
for ci,c in enumerate(chunks):
  end=chunks[ci+1][0][0] if ci+1<len(chunks) else total
  for j,w in enumerate(c):
    st=w[0]; nx=c[j+1][0] if j+1<len(c) else end
    if st>t+0.001: lines.append(("caps/blank.png",st-t)); t=st
    p=f"caps/c{n:04d}.png"; render(c,j,p); n+=1
    lines.append((p,nx-st)); t=nx
if total>t: lines.append(("caps/blank.png",total-t))
with open('caps.txt','w') as f:
  for p,d in lines: f.write(f"file '{p}'\nduration {d:.3f}\n")
  f.write(f"file '{lines[-1][0]}'\n")
# title
im=Image.new('RGBA',(1080,1920),(0,0,0,0));d=ImageDraw.Draw(im)
TF=ImageFont.truetype('fonts/CrimsonPro-SemiBold.ttf',92)
L=['¿Por qué tu inglés','suena robótico?']
lh=104; top=1170; ws=[d.textlength(t,font=TF) for t in L]; mw=max(ws)
d.rounded_rectangle(((1080-mw)/2-44,top-30,(1080+mw)/2+44,top+lh*len(L)+18),radius=26,fill=(249,245,238,250))
for i,t in enumerate(L): d.text((540,top+i*lh+lh/2-6),t,font=TF,fill=(63,30,13),anchor='mm')
im.save('title.png')
print(n,'states',round(total,2))

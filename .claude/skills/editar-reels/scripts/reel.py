#!/usr/bin/env python3
"""Editor de reels AT WORK (formato aprobado por Flor el 20/10/2026).

Pasos (cada uno se puede correr por separado):
  python3 reel.py transcribir <video> <carpeta>   -> words.json + borrador_subtitulos.txt + silencios
  python3 reel.py render <video> <carpeta> "<hook línea 1>|<hook línea 2>" "<cta placa final>"
El paso intermedio es MANUAL: revisar/puntuar <carpeta>/subtitulos.txt (una línea = un recuadro).
"""
import sys,os,json,re,subprocess
HERE=os.path.dirname(os.path.abspath(__file__)); FONTS=os.path.join(HERE,'..','fonts')
MULETILLAS={'eh','em','emm','mmm','eeh','ehh','este','o sea','bueno'}  # 'este'/'bueno' solo si están solos (ver SKILL.md)

def run(*a): subprocess.run(a,check=True)
def dur(v): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',v]).decode())

def transcribir(video,out):
  os.makedirs(out,exist_ok=True)
  raw=os.path.join(out,'a.raw')
  run('ffmpeg','-v','error','-y','-i',video,'-ac','1','-ar','16000','-f','f32le',raw)
  import numpy as np
  from faster_whisper import WhisperModel
  a=np.fromfile(raw,dtype=np.float32)
  m=WhisperModel('small',device='cpu',compute_type='int8')
  segs,_=m.transcribe(a,language='es',word_timestamps=True)
  words=[]
  for s in segs:
    for w in s.words: words.append([w.start,w.end,w.word.strip()])
  json.dump(words,open(os.path.join(out,'words.json'),'w'),ensure_ascii=False)
  # silencios
  log=subprocess.run(['ffmpeg','-hide_banner','-i',video,'-af','silencedetect=noise=-30dB:d=0.22','-f','null','-'],capture_output=True,text=True).stderr
  st=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',log)]; en=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',log)]
  sil=list(zip(st,en))
  # muletillas como silencios a cortar
  for s,e,t in words:
    if re.sub(r'[^\wáéíóúñ]','',t.lower()) in {'eh','em','emm','mmm','eeh','ehh'}: sil.append((s,e))
  json.dump(sorted(sil),open(os.path.join(out,'silencios.json'),'w'))
  # borrador: 3 palabras por línea
  lines=[];cur=[]
  for w in words:
    cur.append(w[2])
    if len(cur)>=3: lines.append(' '.join(cur));cur=[]
  if cur: lines.append(' '.join(cur))
  open(os.path.join(out,'subtitulos.txt'),'w').write('\n'.join(lines)+'\n')
  print(f'{len(words)} palabras. Revisá y puntuá {out}/subtitulos.txt (misma cantidad de palabras, en orden).')

def render(video,out,hook,cta):
  MARCO=os.environ.get('LAYOUT')=='marco'
  from PIL import Image,ImageDraw,ImageFont
  D=dur(video); words=json.load(open(os.path.join(out,'words.json')))
  sil=json.load(open(os.path.join(out,'silencios.json')))
  PAD=0.07;cuts=[]
  for a,b in sil:
    a2=a+PAD if a>0.01 else 0; b2=b-PAD if b<D-0.01 else D
    if b2-a2>0.12: cuts.append((a2,b2))
  keep=[];t=0
  for a,b in sorted(cuts):
    if a>t: keep.append((t,a))
    t=max(t,b)
  if t<D: keep.append((t,D))
  total=sum(b-a for a,b in keep)
  def remap(x):
    o=0
    for a,b in keep:
      if x<=a: return o
      if x<=b: return o+(x-a)
      o+=b-a
    return o
  W=[[remap(s),remap(e),t] for s,e,t in words]
  lines=[l.split() for l in open(os.path.join(out,'subtitulos.txt')).read().strip().split('\n') if l.strip()]
  ntok=sum(len(l) for l in lines)
  assert ntok==len(W), f'subtitulos.txt tiene {ntok} palabras y el audio {len(W)}: tienen que coincidir 1 a 1'
  chunks=[];i=0;inq=False
  for L in lines:
    c=[]
    for tok in L:
      if tok.startswith(('«','"','“')): inq=True
      c.append([W[i][0],W[i][1],tok,inq]); i+=1
      if re.search(r'[»"”][.,:;!?]*$',tok): inq=False
    chunks.append(c)
  F=ImageFont.truetype(f'{FONTS}/CrimsonPro-Regular.ttf',66); FI=ImageFont.truetype(f'{FONTS}/CrimsonPro-Italic.ttf',66)
  BOX=(63,30,13,255); ON=(250,244,236); OFF=(196,150,120); CY=1150 if MARCO else 1020
  cd=os.path.join(out,'caps'); os.makedirs(cd,exist_ok=True)
  def cap(c,j,p):
    im=Image.new('RGBA',(1080,1920),(0,0,0,0)); d=ImageDraw.Draw(im)
    parts=[(w[2],FI if w[3] else F) for w in c]; sp=d.textlength(' ',font=F)
    ws=[d.textlength(t,font=f) for t,f in parts]; tw=sum(ws)+sp*(len(parts)-1)
    assert tw<980, f'línea demasiado larga: {" ".join(p[0] for p in parts)}'
    x0=(1080-tw)/2; d.rounded_rectangle((x0-26,CY-46,x0+tw+26,CY+46),radius=10,fill=BOX); x=x0
    for k,((t,f),wd) in enumerate(zip(parts,ws)):
      d.text((x,CY),t,font=f,fill=ON if k<=j else OFF,anchor='lm'); x+=wd+sp
    im.save(p)
  blank=os.path.join(cd,'blank.png'); Image.new('RGBA',(1080,1920),(0,0,0,0)).save(blank)
  seq=[];n=0;t=0.0
  for ci,c in enumerate(chunks):
    end=chunks[ci+1][0][0] if ci+1<len(chunks) else total
    for j,w in enumerate(c):
      st=w[0]; nx=c[j+1][0] if j+1<len(c) else end
      if st>t+0.001: seq.append((blank,st-t)); t=st
      p=os.path.join(cd,f'c{n:04d}.png'); cap(c,j,p); n+=1; seq.append((p,max(nx-st,0.034))); t=nx
  if total>t: seq.append((blank,total-t))
  ct=os.path.join(out,'caps.txt')
  with open(ct,'w') as f:
    for p,dd in seq: f.write(f"file '{p}'\nduration {dd:.3f}\n")
    f.write(f"file '{seq[-1][0]}'\n")
  # hook visual
  im=Image.new('RGBA',(1080,1920),(0,0,0,0)); d=ImageDraw.Draw(im); L=hook.split('|')
  if MARCO:
    TF=ImageFont.truetype(f'{FONTS}/CrimsonPro-SemiBold.ttf',104); lh=112; top=215-lh*len(L)/2
    for k,x in enumerate(L): d.text((540,top+k*lh+lh/2),x,font=TF,fill=(63,30,13),anchor='mm')
  else:
    TF=ImageFont.truetype(f'{FONTS}/CrimsonPro-SemiBold.ttf',92); lh=104; top=1170
    mw=max(d.textlength(x,font=TF) for x in L)
    d.rounded_rectangle(((1080-mw)/2-44,top-30,(1080+mw)/2+44,top+lh*len(L)+18),radius=26,fill=(249,245,238,250))
    for k,x in enumerate(L): d.text((540,top+k*lh+lh/2-6),x,font=TF,fill=(63,30,13),anchor='mm')
  title=os.path.join(out,'hook.png'); im.save(title)
  if MARCO:
    mk=Image.new('L',(1000,1440),0); ImageDraw.Draw(mk).rounded_rectangle((0,0,999,1439),radius=40,fill=255)
    mask=os.path.join(out,'marco_mask.png'); mk.save(mask)
  # placa final
  im=Image.new('RGB',(1080,1920),(63,30,13)); d=ImageDraw.Draw(im)
  B=ImageFont.truetype(f'{FONTS}/CrimsonPro-SemiBold.ttf',96); I=ImageFont.truetype(f'{FONTS}/CrimsonPro-SemiBoldItalic.ttf',72); S=ImageFont.truetype(f'{FONTS}/CrimsonPro-SemiBold.ttf',44)
  def cc(y,t,f,col): d.text(((1080-d.textlength(t,font=f))/2,y),t,font=f,fill=col)
  cc(700,'No era el inglés.',B,(244,234,223)); cc(830,'Era la relación con el inglés.',I,(215,161,132))
  d.line((490,1010,590,1010),fill=(215,161,132),width=4)
  ctal=cta.split('|')
  if len(ctal)>1: cc(1080,ctal[0],S,(244,234,223)); cc(1150,ctal[1],B,(244,234,223))
  else: cc(1120,ctal[0],B,(244,234,223))
  cc(1700,'AT WORK · Clear, not native.',S,(215,161,132))
  card=os.path.join(out,'card.png'); im.save(card)
  grade=("hqdn3d=1:1:2:2,scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,format=yuv420p,"
   "curves=master='0/0.02 0.25/0.30 0.5/0.57 0.75/0.80 1/1',eq=contrast=1.04:saturation=1.08,"
   "colortemperature=temperature=5500:mix=0.4,unsharp=5:5:0.35:5:5:0.0")
  aud=("highpass=f=80,afftdn=nf=-25,equalizer=f=200:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1.2:g=3,"
   "acompressor=threshold=-20dB:ratio=3:attack=10:release=150:makeup=2,loudnorm=I=-14:TP=-1.5:LRA=9")
  fc=''
  for i,(a,b) in enumerate(keep):
    fc+=f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}];[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={max(0,b-a-0.03)}:d=0.03[a{i}];"
  fc+=''.join(f"[v{i}][a{i}]" for i in range(len(keep)))+f"concat=n={len(keep)}:v=1:a=1[cv][ca];[cv]{grade},fps=30[g0];"+(f"[g0]scale=1000:-2,crop=1000:1440:0:0,format=rgba[vv];[3:v]format=gray[mk];[vv][mk]alphamerge[vr];color=c=0xF4EADF:s=1080x1920:r=30[bgc];[bgc][vr]overlay=40:430:shortest=1[g];" if MARCO else "[g0]null[g];")+f"[1:v]format=rgba[t];[2:v]format=rgba,fps=30[c];[g][t]overlay=0:0[gt];[gt][c]overlay=0:0:eof_action=pass[ov];[ca]{aud}[oa]"
  main=os.path.join(out,'main.mp4')
  run('ffmpeg','-v','error','-y','-i',video,'-loop','1','-i',title,'-f','concat','-safe','0','-i',ct,*(['-loop','1','-i',mask] if MARCO else []),'-filter_complex',fc,'-map','[ov]','-map','[oa]','-t',str(total),'-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000',main)
  cardv=os.path.join(out,'card.mp4')
  run('ffmpeg','-v','error','-y','-loop','1','-t','2.8','-i',card,'-f','lavfi','-t','2.8','-i','anullsrc=r=48000:cl=stereo','-vf','fade=t=in:d=0.25,format=yuv420p','-r','30','-c:v','libx264','-crf','18','-c:a','aac','-b:a','192k',cardv)
  lst=os.path.join(out,'l.txt'); open(lst,'w').write(f"file '{main}'\nfile '{cardv}'\n")
  final=os.path.join(out,'REEL_FINAL.mp4')
  run('ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',lst,'-c:v','libx264','-crf','19','-preset','slow','-maxrate','12M','-bufsize','24M','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',final)
  print('listo:',final,f'({total:.1f}s + 2.8s placa, cortados {D-total:.1f}s)')

if __name__=='__main__':
  cmd=sys.argv[1]
  if cmd=='transcribir': transcribir(sys.argv[2],sys.argv[3])
  elif cmd=='render': render(sys.argv[2],sys.argv[3],sys.argv[4],sys.argv[5])

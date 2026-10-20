import json,subprocess,re
DUR=49.0
sil=[(0,0.456),(4.532,4.878),(8.297,8.889),(12.869,13.236),(15.424,15.696),(17.93,18.195),(22.288,22.554),(28.52,28.752),(30.49,31.193),(35.366,35.607),(38.41,38.881),(39.639,39.965),(44.045,44.471),(47.63,47.999),(48.497,49.0)]
PAD=0.07
cuts=[]
for a,b in sil:
  a2=a+PAD if a>0 else 0; b2=b-PAD if b<DUR else DUR
  if b2-a2>0.12: cuts.append((a2,b2))
keep=[];t=0
for a,b in cuts:
  if a>t: keep.append((t,a))
  t=b
if t<DUR: keep.append((t,DUR))
def remap(x):
  out=0
  for a,b in keep:
    if x<=a: return out
    if x<=b: return out+(x-a)
    out+=b-a
  return out
total=sum(b-a for a,b in keep)
json.dump({'keep':keep,'total':total},open('keep.json','w'))
W=json.load(open('words.json'))
fix={'at':'AT','work':'WORK'}
words=[]
for s,e,t in W:
  t=t.strip()
  if t.lower() in fix and len(words) and (t.lower()=='at' or words[-1][2]=='AT'): t=fix[t.lower()]
  words.append([remap(s),remap(e),t])
# english phrases -> highlight
eng=set('we accept the entrance to driver allow enter facility chunks'.split())
# chunk ~3 words, break at sentence-ish words
chunks=[];cur=[]
for w in words:
  cur.append(w)
  if len(cur)>=3 or (len(cur)>=2 and w[2].endswith(('.',',','?'))):
    chunks.append(cur);cur=[]
if cur: chunks.append(cur)
def ts(x):
  h=int(x//3600);m=int(x%3600//60);s=x%60
  return f"{h}:{m:02d}:{s:05.2f}"
ass='''[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Crimson Pro SemiBold,80,&H00DFEAF4,&H0084A1D7,&H000D1E3F,&H000D1E3F,0,0,0,0,100,100,0,0,3,16,0,5,40,40,0,1
Style: Top,Crimson Pro SemiBold,58,&H000D1E3F,&H000D1E3F,&H00EEF5F9,&H00EEF5F9,0,0,0,0,100,100,0,0,3,18,0,8,60,60,150,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
ass+=f"Dialogue: 0,{ts(0)},{ts(total)},Top,,0,0,0,,{{\\an5\\pos(540,1580)}}¿Por qué tu inglés suena a traducción?\n"
for i,c in enumerate(chunks):
  st=c[0][0]; en=chunks[i+1][0][0] if i+1<len(chunks) else total
  txt=''
  for j,w in enumerate(c):
    nxt=c[j+1][0] if j+1<len(c) else en
    d=max(1,round((nxt-w[0])*100))
    clean=re.sub(r'[^\wáéíóúñ]','',w[2].lower())
    it=clean in eng
    txt+=f"{{\\k{d}}}"+(r"{\i1}" if it else "")+w[2]+(r"{\i0}" if it else "")+" "
  ass+=f"Dialogue: 1,{ts(st)},{ts(en)},Cap,,0,0,0,,{{\\pos(540,880)}}{txt.strip()}\n"
open('subs.ass','w').write(ass)
print('total',round(total,2),'cut',round(DUR-total,2),'chunks',len(chunks))

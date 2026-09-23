#!/bin/bash
# uso: ./render.sh onb03  -> genera pptx en out/ y grilla de vista previa
set -e
cd "$(dirname "$0")"
mkdir -p out
node -e "
const {build}=require('./lib.js');const d=require('./decks/$1.js');
build(d,'out/'+d.file).then(()=>console.log('ok '+d.file)).catch(e=>{console.error(e);process.exit(1)});"
F=$(node -e "console.log(require('./decks/$1.js').file)")
SK=/root/.claude/skills/synced/7099b8f4-230c-401f-aa87-0485ea7c15e6_77d959a0-2ca7-46d2-9533-ee42797071a0/pptx
python $SK/scripts/office/validate.py out/$F | tail -1
python $SK/scripts/office/soffice.py --headless --convert-to pdf --outdir $PWD/out $PWD/out/$F >/dev/null 2>&1
python3 - "$F" <<'PY'
import sys,pymupdf
from PIL import Image
f=sys.argv[1];d=pymupdf.open('out/'+f.replace('.pptx','.pdf'))
ims=[]
for p in d:
  pm=p.get_pixmap(dpi=72);ims.append(Image.frombytes('RGB',(pm.width,pm.height),pm.samples))
w,h=ims[0].size;c=3;r=(len(ims)+c-1)//c
g=Image.new('RGB',(w*c+10*(c-1),h*r+10*(r-1)),'white')
for i,im in enumerate(ims): g.paste(im,((i%c)*(w+10),(i//c)*(h+10)))
g.save('out/'+f.replace('.pptx','_vista_previa.png'))
PY

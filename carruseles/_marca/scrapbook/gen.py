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
.winbg{background:#8A5A34}
.wbox{position:absolute;left:90px;right:90px;top:50%;transform:translateY(-50%);text-align:center}
.wk{font:600 26px/1 'Inter',sans-serif;letter-spacing:.3em;text-transform:uppercase;color:#F7EBDD;margin-bottom:26px}
.wpill{display:inline-block;background:#F4EADF;color:#3F1E0D;font:700 64px/1.12 'Crimson Pro',serif;padding:26px 40px;border-radius:30px;margin-bottom:40px}
.wcard{background:#23201D;border-radius:26px;padding:34px 40px 38px;text-align:left;box-shadow:0 18px 44px rgba(0,0,0,.35);margin:0 10px 26px;transform:rotate(-1deg)}
.wcard+.wcard{transform:rotate(1deg)}
.wh{font:600 22px/1 'Inter',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#C9A985;margin-bottom:18px}
.wt{font:400 44px/1.36 'Inter',sans-serif;color:#F2ECE6}
.wend{font:italic 500 50px/1.3 'Crimson Pro',serif;color:#F7EBDD;margin:6px 0 40px}
.cvtop{position:absolute;left:90px;right:90px;top:120px;text-align:center}
.cvt{font:700 92px/1.04 'Crimson Pro',serif;color:#F7EBDD;letter-spacing:-.01em}
.cvh{display:inline-block;margin-top:30px;background:#F4EADF;color:#3F1E0D;font:italic 600 50px/1.2 'Crimson Pro',serif;padding:16px 34px;border-radius:30px}
.fan{position:absolute;left:0;right:0;bottom:0;height:760px}
.fcard{position:absolute;left:190px;width:700px;bottom:110px;background:#23201D;border-radius:26px;padding:30px 36px 34px;text-align:left;box-shadow:0 22px 50px rgba(0,0,0,.4)}
.wcx{position:absolute;left:96px;right:96px;top:150px}
.wck{font:600 25px/1 'Inter',sans-serif;letter-spacing:.3em;text-transform:uppercase;color:#C98B62;margin-bottom:40px}
.wct{font:600 100px/1.02 'Crimson Pro',serif;color:#F7EBDD;letter-spacing:-.015em}
.wcs{font:italic 400 52px/1.2 'Crimson Pro',serif;color:#C98B62;margin-top:26px}
.wcl{height:2px;background:rgba(247,235,221,.25);margin:56px 0 50px;width:420px}
.ck{display:flex;align-items:flex-start;gap:28px;margin:0 0 34px}
.bx{flex:none;width:52px;height:52px;border-radius:12px;background:#F7EBDD;color:#3B2214;font:700 38px/52px 'Inter',sans-serif;text-align:center}
.ckt{font:400 42px/1.3 'Inter',sans-serif;color:#EBDDCD;padding-top:2px}
.wca{position:absolute;right:96px;bottom:80px;font:italic 400 40px/1 'Crimson Pro',serif;color:#C98B62}
.ftx{position:absolute;left:100px;right:100px;top:50%;transform:translateY(-55%)}
.ftt{font:600 156px/0.98 'Crimson Pro',serif;color:#2B1A10;letter-spacing:-.02em}
.ftt i{color:#6E8B63;font-weight:500}
.fts{font:italic 400 64px/1.2 'Crimson Pro',serif;color:#6E8B63;margin-top:40px}
.wabg{background-color:#E7DED3;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><g fill='none' stroke='%23d6cbbd' stroke-width='3' stroke-linecap='round'><circle cx='24' cy='26' r='9'/><path d='M70 20 q10 -12 20 0 t20 0'/><rect x='118' y='14' width='22' height='16' rx='4'/><path d='M20 92 l14 -14 l14 14'/><circle cx='88' cy='86' r='5'/><path d='M120 80 q14 8 0 22'/><path d='M30 138 h26'/><path d='M84 128 l8 16 l8 -16'/><circle cx='136' cy='140' r='8'/></g></svg>")}
.wahead{position:absolute;left:70px;right:70px;top:90px;background:#FAF7F2;border-radius:30px;padding:40px 46px 44px;box-shadow:0 10px 30px rgba(60,40,20,.10)}
.wahead .fk{margin-bottom:18px}
.wastack{position:absolute;left:60px;right:60px;top:470px;bottom:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px}
.wshot{display:block;max-width:860px;width:auto;height:auto;min-width:560px;object-fit:contain;border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.22)}
.wastack.wide .wshot{max-width:980px;min-width:0;border-radius:12px}
.wabg .fnote{bottom:90px;color:#4F6B45}
.futbg{background:#F5F0E9}
.fut{position:absolute;left:96px;right:96px;top:120px}
.fut.mid{top:50%;transform:translateY(-50%);text-align:center}
.fk{font:600 25px/1 'Inter',sans-serif;letter-spacing:.3em;text-transform:uppercase;color:#7C9A6E;margin-bottom:30px}
.ft{font:600 104px/1.03 'Crimson Pro',serif;color:#2B1A10;letter-spacing:-.015em}
.ft.sm{font-size:74px}
.ft.sm i{color:#6E8B63}
.ft i{color:#7C9A6E}
.board{position:absolute;left:0;right:0;bottom:70px;height:800px}
.pit{position:absolute;width:470px;min-height:330px;padding:50px 42px;font:500 44px/1.28 'Inter',sans-serif;color:#2B1A10;box-shadow:0 14px 30px rgba(60,40,20,.16)}
.bignote{position:absolute;left:120px;right:120px;top:450px;padding:80px 64px 90px;transform:rotate(-2deg);box-shadow:0 20px 40px rgba(60,40,20,.18)}
.fut.mid .bignote{position:relative;left:auto;right:auto;top:auto;margin:56px 40px;background:#fff;border:3px dashed #B9CBAA;box-shadow:none;min-height:300px}
.fut.mid .bnt{border-bottom:2px solid #E4DDD2;height:70px;margin-top:20px}
.bnh{font:600 23px/1 'Inter',sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#6b5a4c;margin-bottom:26px}
.bnt{font:500 54px/1.32 'Inter',sans-serif;color:#2B1A10}
.fnote{position:absolute;left:96px;right:96px;bottom:120px;font:italic 500 52px/1.3 'Crimson Pro',serif;color:#7C9A6E;text-align:center}
.fsub{font:italic 400 50px/1.3 'Crimson Pro',serif;color:#5d4c40;margin-top:24px}
.fcta{font:600 46px/1.3 'Inter',sans-serif;color:#2B1A10}
.wcta{font:700 50px/1.3 'Inter',sans-serif;color:#F7EBDD}
.dim{position:absolute;inset:0;background:rgba(20,12,6,.52);z-index:2}
.boldbox{position:absolute;z-index:6;left:90px;right:90px;top:50%;transform:translateY(-50%);text-align:center;color:#FAF4EC}
.boldbox .t{font:700 112px/1.02 'Oswald',sans-serif;text-transform:uppercase;color:#F7E7A4;letter-spacing:.005em;text-shadow:0 4px 30px rgba(0,0,0,.5)}
.boldbox .x{font:500 46px/1.3 'Inter',sans-serif;color:#FAF4EC;margin-top:30px}
.boldbox .hand{font:italic 500 56px/1.15 'Crimson Pro',serif;color:#FAF4EC;transform:none}
.plainbg{background:#7B4A2C}
.bg.ghost{opacity:.17;filter:grayscale(.3) blur(1px)}
.plainbox{position:absolute;z-index:6;left:100px;right:100px;top:50%;transform:translateY(-50%);text-align:center;color:#FAF4EC}
.plainbox .kick{color:#F2C9A8;font-size:26px}
.plainbox .t{font:600 84px/1.06 'Crimson Pro',serif;text-shadow:none;color:#FAF4EC}
.plainbox .t i{color:#F7E7A4}
.plainbox .x{font:500 46px/1.34 'Inter',sans-serif;text-shadow:none;margin-top:30px;color:#F3E6D8}
.plainbox .x i{color:#F7E7A4}
.plainbox .hand{font:italic 500 60px/1.15 'Crimson Pro',serif;color:#F7E7A4;transform:none;margin-top:34px}
.plainbox .flow p{color:#FAF4EC}.plainbox .list p{font:500 52px/1.25 'Crimson Pro',serif;margin:10px 0}
.band{position:absolute;z-index:6;left:0;right:0;top:0;padding:70px 90px 46px;background:#7B4A2C;color:#FAF4EC;text-align:center;font:500 46px/1.3 'Inter',sans-serif}
.lbl{position:absolute;z-index:6;left:80px;right:80px;bottom:90px;text-align:center}
.lbl .t{display:inline;background:#7B4A2C;color:#FAF4EC;font:600 74px/1.32 'Crimson Pro',serif;padding:10px 26px;border-radius:26px;-webkit-box-decoration-break:clone;box-decoration-break:clone;text-shadow:none}
.lbl .t i{color:#F7E7A4}
.half{position:absolute;left:0;right:0;height:715px;overflow:hidden}.half.a{top:0}.half.b{bottom:0}
.half .bg{inset:0}.half.a .bg:after,.half.b .bg:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.55) 100%)}
.cut{position:absolute;left:0;right:0;top:715px;height:10px;background:var(--cream);z-index:6}
.lab{position:absolute;left:70px;right:70px;bottom:46px;z-index:6;color:#fff}
.lab .who{display:inline-block;font:700 24px/1 'Inter',sans-serif;letter-spacing:.24em;text-transform:uppercase;background:var(--cream);color:var(--brown);padding:12px 18px 10px;transform:rotate(-2deg);margin-bottom:14px}
.lab .say{font:700 76px/1.02 'Caveat',cursive;text-shadow:0 2px 18px rgba(0,0,0,.6)}
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
    top=""  # Flor 26/10: sin numeración ni «AT WORK» arriba (se ve IA)
    if k=='photo':
        parts.append(f"<section class='slide grain shade' id='s{i+1}'><div class='bg' style=\"background-image:url({src});background-position:{pos}\"></div>{top}<div class='foot'>{inner}</div></section>")
    elif k=='note':
        parts.append(f"<section class='slide grain' id='s{i+1}'><div class='bg blur' style=\"background-image:url({src});background-position:{pos}\"></div>{top}<div class='note'>{inner}</div></section>")
    elif k=='split':
        hs=''
        for side,c in (('top','a'),('bot','b')):
            im=s['img_'+side];shutil.copy(im,f"{out}/img/{os.path.basename(im)}")
            hs+=f"<div class='half {c}'><div class='bg' style=\"background-image:url(img/{os.path.basename(im)});background-position:{s.get('pos_'+side,'center')}\"></div><div class='lab'><span class='who'>{s['who_'+side]}</span><p class='say'>{s['say_'+side]}</p></div></div>"
        parts.append(f"<section class='slide grain' id='s{i+1}'>{hs}<div class='cut'></div>{top}</section>")
    elif k=='win':
        cards=''.join(f"<div class='wcard'><p class='wh'>Weekly report · my wins</p><p class='wt'>{c}</p></div>" for c in s['cards'])
        parts.append(f"<section class='slide winbg' id='s{i+1}'><div class='wbox'><p class='wk'>{s.get('kick','')}</p><p class='wpill'>{s['title']}</p>{cards}</div></section>")
    elif k=='wachat':
        imgs=''
        mh=int(((700 if s.get('source')=='report' else 770)-28*(len(s['shots'])-1))/len(s['shots']))
        for im in s['shots']:
            shutil.copy(im,f"{out}/img/{os.path.basename(im)}")
            imgs+=f"<img class='wshot' style='max-height:{mh}px' src='img/{os.path.basename(im)}'>"
        wa_style=" style='background:#F3EDE4'" if s.get('source')=='report' else ''
        wshot_w=' wide' if s.get('source')=='report' else ''
        parts.append(f"<section class='slide wabg' id='s{i+1}'{wa_style}><div class='wahead'><p class='fk'>{s.get('kick','')}</p><p class='ft sm'>{s['title']}</p></div><div class='wastack{wshot_w}'>{imgs}</div>{('<p class=fnote>'+s['note']+'</p>') if s.get('note') else ''}</section>")
    elif k=='futtitle':
        parts.append(f"<section class='slide' id='s{i+1}' style='background:#F3EDE4'><div class='ftx'><p class='fk'>{s.get('kick','')}</p><p class='ftt'>{s['title']}</p><p class='fts'>{s.get('sub','')}</p></div></section>")
    elif k=='futcover':
        cols=['#F7E7A4','#DCE6D2','#F2D4C7','#E3E0F2']
        rots=[(-4,50,0),(3,555,30),(2,70,380),(-3,560,400)]
        notes=''.join(f"<div class='pit' style='background:{cols[j%4]};left:{x}px;top:{y}px;transform:rotate({r}deg)'>{c}</div>" for j,(c,(r,x,y)) in enumerate(zip(s['notes'],rots)))
        parts.append(f"<section class='slide futbg' id='s{i+1}'><div class='fut'><p class='fk'>{s.get('kick','')}</p><p class='ft'>{s['title']}</p></div><div class='board'>{notes}</div></section>")
    elif k=='futwin':
        c=s.get('color','#F7E7A4')
        parts.append(f"<section class='slide futbg' id='s{i+1}'><div class='fut'><p class='fk'>{s.get('kick','')}</p><p class='ft sm'>{s['title']}</p></div><div class='bignote' style='background:{c}'><p class='bnh'>{s.get('label','Mi win de la semana')}</p><p class='bnt'>{s['text']}</p></div>{('<p class=fnote>'+s['note']+'</p>') if s.get('note') else ''}</section>")
    elif k=='futend':
        parts.append(f"<section class='slide futbg' id='s{i+1}'><div class='fut mid'><p class='ft'>{s['title']}</p><p class='fsub'>{s.get('text','')}</p><div class='bignote empty'><p class='bnh'>Mi win de la semana</p><p class='bnt'>{s.get('blank','________________')}</p></div><p class='fcta'>{s.get('cta','')}</p></div></section>")
    elif k=='wincheck':
        items=''.join(f"<div class='ck'><span class='bx'>✓</span><span class='ckt'>{c}</span></div>" for c in s['checks'])
        parts.append(f"<section class='slide' id='s{i+1}' style='background:#3B2214'><div class='wcx'><p class='wck'>{s.get('kick','')}</p><p class='wct'>{s['title']}</p><p class='wcs'>{s.get('sub','')}</p><div class='wcl'></div>{items}</div><p class='wca'>{s.get('arrow','desliza →')}</p></section>")
    elif k=='wincover':
        fan=''.join(f"<div class='fcard' style='transform:rotate({r}deg) translate({x}px,{y}px)'><p class='wh'>Weekly report · my wins</p><p class='wt'>{c}</p></div>" for c,(r,x,y) in zip(s['cards'],[(-6,-100,-330),(5,110,-170),(-2,0,10)]))
        parts.append(f"<section class='slide winbg' id='s{i+1}'><div class='cvtop'><p class='wk'>{s.get('kick','')}</p><p class='cvt'>{s['title']}</p><p class='cvh'>{s.get('hand','')}</p></div><div class='fan'>{fan}</div></section>")
    elif k=='winend':
        parts.append(f"<section class='slide winbg' id='s{i+1}'><div class='wbox'><p class='wpill'>{s['title']}</p><p class='wend'>{s.get('text','')}</p><p class='wcta'>{s.get('cta','')}</p></div></section>")
    elif k=='bold':
        parts.append(f"<section class='slide grain' id='s{i+1}'><div class='bg' style=\"background-image:url({src});background-position:{pos}\"></div><div class='dim'></div><div class='boldbox'>{inner}</div></section>")
    elif k=='plain':
        parts.append(f"<section class='slide grain plainbg' id='s{i+1}'><div class='bg ghost' style=\"background-image:url({src});background-position:{pos}\"></div><div class='plainbox'>{inner}</div></section>")
    elif k=='label':
        band=f"<div class='band'>{s.get('band','')}</div>" if s.get('band') else ''
        parts.append(f"<section class='slide grain' id='s{i+1}'><div class='bg' style=\"background-image:url({src});background-position:{pos}\"></div>{band}<div class='lbl'>{inner}</div></section>")
    elif k=='polaroid':
        cap=s.get('cap','')
        parts.append(f"<section class='slide grain paper' id='s{i+1}'>{top}<div class='pola' style='left:{s.get('px',300)}px;top:{s.get('py',150)}px'><div class='ph' style=\"background-image:url({src});background-position:{pos}\"></div><div class='cap'>{cap}</div></div><div class='tape' style='left:{s.get('px',300)+220}px;top:{s.get('py',150)-22}px;transform:rotate(-4deg)'></div><div class='ptext'>{inner}</div></section>")
IG='''
.slide.ig .shade:after{display:none}
.ig .foot{text-align:center;bottom:120px}
.ig .box{display:inline-block;background:#fff;color:#111;font:600 58px/1.22 'Inter',sans-serif;letter-spacing:-.01em;padding:18px 30px 20px;border-radius:22px;box-shadow:0 6px 24px rgba(0,0,0,.18);margin:6px 0;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.ig .box.over{background:none;color:#fff;box-shadow:none;text-shadow:0 2px 14px rgba(0,0,0,.65),0 0 2px rgba(0,0,0,.5);font-size:56px;position:static}
.ig .lab{left:50px;right:50px;bottom:40px;text-align:center}
.ig .lab .box{font-size:50px;padding:14px 26px 16px}
.ig .lab .box b{font-weight:800}
'''
MAG='''
.slide.mag{background:#F4EDE3}
.mag .bg{inset:0 0 560px 0}
.mag.shade:after{display:none}
.mag .foot{bottom:0;left:0;right:0;height:560px;padding:56px 84px 70px;display:flex;flex-direction:column;justify-content:center;color:#2B1A10;border-top:10px solid #B5704A}
.mag .t{text-shadow:none;color:#2B1A10;font-size:84px;line-height:1.03}
.mag .t i{color:#B5704A}
.mag .x{text-shadow:none;color:#5a4636;font:500 46px/1.32 'Inter',sans-serif;margin-top:24px}
.mag .x i{color:#B5704A}
.mag .hand,.mag0 .hand{font:italic 500 58px/1.15 'Crimson Pro',serif;color:#B5704A;transform:none;margin-top:20px}
.mag0 .hand{color:#F2C9A8}
.mag .kick{color:#B5704A;margin-bottom:20px;font-size:27px;line-height:1.3}
.mag0 .t{font-size:96px}
'''
if spec.get('theme')=='mag':
    CSS+=MAG
    for _i,_p in enumerate(parts):
        parts[_i]=_p.replace("class='slide","class='slide "+("mag0" if _i==0 else "mag"),1)
if spec.get('theme')=='ig':
    CSS+=IG
    import re as _re
    for _i,_p in enumerate(parts):
        _p=_p.replace("class='slide","class='slide ig",1)
        _p=_re.sub(r"<div class='lab'><span class='who'>(.*?)</span><p class='say'>(.*?)</p></div>",lambda m:f"<div class='lab'><span class='box'><b>{m.group(1)}:</b> {m.group(2)}</span></div>",_p)
        _p=_re.sub(r"<p class='t [^']*'>(.*?)</p>",lambda m:f"<p><span class='box'>{m.group(1)}</span></p>",_p)
        _p=_re.sub(r"<p class='hand'>(.*?)</p>",lambda m:f"<p><span class='box over'>{m.group(1)}</span></p>",_p)
        _p=_re.sub(r"<p class='x'>(.*?)</p>",lambda m:f"<p><span class='box' style='font-weight:500;font-size:46px'>{m.group(1)}</span></p>",_p)
        parts[_i]=_p
h=f"<!doctype html><html lang='es'><head><meta charset='utf-8'><title>AT WORK · {spec['title']}</title><link rel='stylesheet' href='../../_marca/fonts/fonts.css'><link rel='stylesheet' href='../../_marca/fonts/caveat.css'><link rel='stylesheet' href='../../_marca/fonts/oswald.css'><style>{CSS}</style></head><body>{''.join(parts)}</body></html>"
h=h.replace("../../_marca/fonts/caveat.css","../../_marca/fonts/caveat.css")
open(f"{out}/index.html",'w').write(h)
open(f"{out}/caption.txt",'w').write(spec['caption'])
print("ok",len(parts))

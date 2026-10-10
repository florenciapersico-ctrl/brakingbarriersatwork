"""Motor de carruseles de Flor Pérsico (formato fijo de marca).

Uso:
    python3 .claude/skills/carrusel/motor/render.py carruseles/<carpeta>

Lee <carpeta>/contenido.txt, genera lamina-01.png … lamina-NN.png (1080x1440)
y vista-general.png (todas las láminas juntas) dentro de la misma carpeta.
La sintaxis de contenido.txt está en ../SKILL.md.
"""
import html
import pathlib
import re
import subprocess
import sys

MOTOR = pathlib.Path(__file__).resolve().parent
CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
W, H = 1080, 1440

YELLOW = '%23F1E08F'
BRUSH = ("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 44' preserveAspectRatio='none'>"
         f"<path d='M4 30 C120 16 330 6 596 8 C600 9 598 12 594 12 C380 18 170 30 12 40 C4 37 0 33 4 30 Z' fill='{YELLOW}'/>"
         f"<path d='M60 30 C200 22 380 18 520 19' stroke='{YELLOW}' stroke-width='2' fill='none' opacity='.6'/></svg>")
CIRCLE = ("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 220' preserveAspectRatio='none'>"
          "<path d='M300 14 C150 2 20 40 12 108 C4 176 140 212 270 208 C410 204 494 162 488 100 C482 40 380 6 210 20' "
          f"stroke='{YELLOW}' stroke-width='6' fill='none' stroke-linecap='round'/>"
          "<path d='M250 24 C120 20 30 56 26 112 C22 168 150 200 280 196' "
          f"stroke='{YELLOW}' stroke-width='3' fill='none' opacity='.55' stroke-linecap='round'/></svg>")

CSS = f"""
@font-face{{font-family:Display;src:url({MOTOR.as_uri()}/fonts/playfair-display-latin-700-normal.woff2);font-weight:700}}
@font-face{{font-family:Body;src:url({MOTOR.as_uri()}/fonts/tinos-latin-400-normal.woff2);font-weight:400}}
:root{{--bg:#2B1F18;--yellow:#F1E08F;--ivory:#F4EEE3;--f:1}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:{W}px;height:{H}px;overflow:hidden;background:var(--bg)}}
.page{{position:absolute;inset:0;width:{W}px;height:{H}px;padding:150px 100px 70px;display:flex;flex-direction:column;
  justify-content:center;color:var(--ivory);font-family:Body,serif;letter-spacing:-0.025em}}
.content{{font-size:calc(76px * var(--f));display:flex;flex-direction:column}}
.num{{position:absolute;top:80px;left:100px;font-family:Body;font-size:34px;color:var(--yellow);letter-spacing:.01em;z-index:2}}
.num::after{{content:'';display:block;width:62px;height:3px;background:var(--yellow);margin-top:22px}}
p,h1,.pill{{white-space:nowrap}}
p{{font-size:1em;line-height:1.1}}
.xs{{font-size:.78em}}
.k{{font-family:Display;font-weight:700;color:var(--yellow);letter-spacing:-0.03em;line-height:1.08;font-size:1.13em}}
.k.big{{font-size:1.27em}}
h1{{font-family:Display;font-weight:700;color:var(--yellow);font-size:1.75em;line-height:.98;letter-spacing:-0.035em}}
.g1{{height:.29em}}.g2{{height:.6em}}.g3{{height:1.2em}}
.rule{{width:84px;height:3px;background:var(--yellow)}}
.u{{position:relative}}
.u::after{{content:'';position:absolute;left:-14%;right:-4%;bottom:-.42em;height:.36em;
  background:url("{BRUSH}") no-repeat center/100% 100%}}
.circle-wrap{{padding:1.15em 0 1.3em 74px}}
.circle{{position:relative;display:inline-block}}
.circle::before{{content:'';position:absolute;inset:-84px -150px -96px -128px;background:url("{CIRCLE}") no-repeat center/100% 100%}}
.bars{{border-left:3px solid var(--yellow);padding:4px 0 4px 40px;margin-left:16px}}
.bars p{{font-size:.84em}}
.bars p+p{{margin-top:.22em}}
.pill{{align-self:center;background:var(--yellow);color:var(--bg);font-family:Display;font-weight:700;font-size:.76em;
  padding:.34em 1.14em .45em;border-radius:999px;letter-spacing:-0.02em}}
.foto{{padding:0 70px 110px;justify-content:flex-end}}
.foto .content{{font-size:calc(80px * var(--f))}}
.foto img{{position:absolute;top:0;left:0;width:{W}px;object-fit:cover}}
.foto .fade{{position:absolute;left:0;right:0}}
.foto .content,.foto .num{{position:relative}}
.foto .num{{position:absolute}}
.foto p:not(.k){{line-height:1.05}}
.foto h1+.g1{{height:.28em}}
"""

FIT_JS = """
document.fonts.ready.then(() => {
  const c = document.querySelector('.content'), page = document.querySelector('.page');
  const limit = () => page.clientHeight - parseFloat(getComputedStyle(page).paddingTop)
                     - parseFloat(getComputedStyle(page).paddingBottom);
  let f = 1;
  while ((c.scrollHeight > limit() || c.scrollWidth > c.clientWidth + 2) && f > 0.6) {
    f -= 0.02; document.documentElement.style.setProperty('--f', f);
  }
  const over = c.scrollHeight > limit() || c.scrollWidth > c.clientWidth + 2;
  document.body.setAttribute('data-fit', f.toFixed(2) + (over ? ' over' : ''));
});
"""


def inline(text):
    """Escapa HTML y convierte [texto] en pincelada."""
    text = html.escape(text, quote=False)
    return re.sub(r'\[(.+?)\]', r'<span class="u">\1</span>', text, flags=re.S)


def keep_indent(line):
    stripped = line.lstrip(' ')
    return '&nbsp;' * (len(line) - len(stripped)) + stripped


KINDS = [('#o ', 'circle'), ('#+ ', 'kbig'), ('## ', 'h1'), ('# ', 'k'), ('~ ', 'xs'), ('- ', 'bar')]


def parse_slide(block):
    meta, items = {}, []
    lines = block.split('\n')
    while lines and re.match(r'^(foto|foto-alto|foto-pos|boton):', lines[0]):
        k, v = lines.pop(0).split(':', 1)
        meta[k.strip()] = v.strip()
    blanks = 0
    for raw in lines:
        line = raw.rstrip()
        if not line.strip():
            blanks += 1
            continue
        if line.strip() == '--':
            items.append(('rule', None, blanks)); blanks = 0; continue
        m = re.match(r'^boton:\s*(.+)$', line)
        if m:
            items.append(('pill', m.group(1), blanks)); blanks = 0; continue
        kind, text = 'p', line
        for prefix, k in KINDS:
            if line.startswith(prefix) or line == prefix.strip():
                kind, text = k, line[len(prefix):]
                break
        prev = items[-1] if items else None
        if prev and prev[0] == kind and blanks == 0 and kind not in ('rule', 'pill'):
            items[-1] = (kind, prev[1] + '\n' + text, prev[2])
        else:
            items.append((kind, text, blanks))
        blanks = 0
    if 'boton' in meta:
        items.append(('pill', meta['boton'], 1))
    return meta, items


def render_items(items):
    out = []
    for i, (kind, text, blanks) in enumerate(items):
        if i:
            out.append('<div class="%s"></div>' % ('g1' if blanks == 0 else 'g2' if blanks == 1 else 'g3'))
        if kind == 'rule':
            out.append('<div class="rule"></div>'); continue
        body = '<br>'.join(keep_indent(l) for l in inline(text).split('\n'))
        if kind == 'pill':
            out.append(f'<div class="pill">{body}</div>')
        elif kind == 'bar':
            out.append('<div class="bars">' + ''.join(f'<p>{inline(l)}</p>' for l in text.split('\n')) + '</div>')
        elif kind == 'circle':
            out.append(f'<div class="circle-wrap"><p class="k circle">{body}</p></div>')
        elif kind == 'h1':
            out.append(f'<h1>{body}</h1>')
        elif kind == 'kbig':
            out.append(f'<p class="k big">{body}</p>')
        else:
            out.append(f'<p class="{ "" if kind == "p" else kind}">{body}</p>')
    return ''.join(out)


def slide_html(folder, meta, items, n, total):
    extra, cls = '', ''
    if 'foto' in meta:
        cls = 'foto'
        foto = (folder / meta['foto']).resolve()
        if not foto.exists():
            sys.exit(f'No encuentro la foto {foto}')
        alto = int(meta.get('foto-alto', H))
        pos = meta.get('foto-pos', 'center top')
        fade_top = min(int(alto * 0.5), alto - 420)
        extra = (f'<img src="{foto.as_uri()}" style="height:{alto}px;object-position:{pos}">'
                 f'<div class="fade" style="top:{fade_top}px;height:{H - fade_top}px;background:linear-gradient(to bottom,'
                 f'rgba(43,31,24,0),rgba(43,31,24,.55) {int((alto - fade_top) * 0.55)}px,var(--bg) {alto - fade_top}px)"></div>')
    return (f'<!doctype html><meta charset="utf-8"><style>{CSS}</style><body>'
            f'<div class="page {cls}">{extra}<div class="num">{n:02d}/{total:02d}</div>'
            f'<div class="content">{render_items(items)}</div></div><script>{FIT_JS}</script></body>')


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    folder = pathlib.Path(sys.argv[1]).resolve()
    src = (folder / 'contenido.txt').read_text(encoding='utf-8')
    src = '\n'.join(l for l in src.split('\n') if not l.startswith('//'))
    blocks = [b.strip('\n') for b in re.split(r'^===+\s*$', src, flags=re.M) if b.strip()]
    for old in folder.glob('lamina-*.png'):
        old.unlink()
    total = len(blocks)
    warnings = []
    for n, block in enumerate(blocks, 1):
        meta, items = parse_slide(block)
        tmp = folder / f'_lamina-{n:02d}.html'
        tmp.write_text(slide_html(folder, meta, items, n, total), encoding='utf-8')
        base = [CHROME, '--headless', '--no-sandbox', '--hide-scrollbars', '--allow-file-access-from-files',
                '--virtual-time-budget=4000', f'--window-size={W},{H}']
        subprocess.run(base + [f'--screenshot={folder}/lamina-{n:02d}.png', tmp.as_uri()], check=True, capture_output=True)
        dom = subprocess.run(base + ['--dump-dom', tmp.as_uri()], check=True, capture_output=True, text=True).stdout
        tmp.unlink()
        fit = re.search(r'data-fit="([^"]+)"', dom)
        fit = fit.group(1) if fit else '?'
        if 'over' in fit:
            warnings.append(f'Lámina {n}: el texto NO entra ni achicado. Acortá líneas o dividí la lámina.')
        elif fit != '?' and float(fit) < 0.86:
            warnings.append(f'Lámina {n}: se achicó al {float(fit):.0%} para entrar. Revisá si conviene recortar texto.')
    make_overview(folder, total)
    print(f'{total} láminas listas en {folder}')
    for w in warnings:
        print('AVISO ·', w)


def make_overview(folder, total):
    from PIL import Image
    cols = min(total, 4)
    rows = (total + cols - 1) // cols
    tw, th, gap = 360, 480, 10
    sheet = Image.new('RGB', (cols * tw + (cols - 1) * gap, rows * th + (rows - 1) * gap), 'white')
    for i in range(total):
        im = Image.open(folder / f'lamina-{i + 1:02d}.png').convert('RGB').resize((tw, th), Image.LANCZOS)
        sheet.paste(im, ((i % cols) * (tw + gap), (i // cols) * (th + gap)))
    sheet.save(folder / 'vista-general.png')


if __name__ == '__main__':
    main()

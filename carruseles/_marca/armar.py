"""Uso: python3 armar.py <carpeta>  → vista-general.png y PDF a partir de png/."""
import sys, pathlib
from PIL import Image
d = pathlib.Path(sys.argv[1]); slug = d.resolve().name
ims = [Image.open(f).convert('RGB') for f in sorted((d / 'png').glob('*.png'))]
cols = 3 if len(ims) == 9 else 4
rows = -(-len(ims) // cols); w, h, g = 405, 540, 26
sheet = Image.new('RGB', (cols * w + (cols + 1) * g, rows * h + (rows + 1) * g), (200, 192, 180))
for i, im in enumerate(ims):
    sheet.paste(im.resize((w, h), Image.LANCZOS), (g + (i % cols) * (w + g), g + (i // cols) * (h + g)))
sheet.save(d / f'AT-WORK_{slug}_vista-general.png')
ims[0].save(d / f'AT-WORK_{slug}.pdf', save_all=True, append_images=ims[1:], resolution=144)

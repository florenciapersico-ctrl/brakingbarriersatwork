// Uso: node exportar.mjs <carpeta-del-carrusel>
// Exporta cada placa de index.html a png/AT-WORK_<carpeta>_NN.png y avisa si algo desborda.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'path'; import fs from 'fs';
const dir = path.resolve(process.argv[2]); const slug = path.basename(dir);
fs.mkdirSync(path.join(dir, 'png'), { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 1500 } });
await p.goto('file://' + path.join(dir, 'index.html')); await p.evaluate(() => document.fonts.ready);
const problemas = await p.evaluate(() => [...document.querySelectorAll('.slide')].flatMap(s =>
  [...s.querySelectorAll('.body')].filter(b => b.scrollHeight > b.clientHeight + 1).map(b => s.id + ' desborda ' + (b.scrollHeight - b.clientHeight) + 'px')));
const n = await p.locator('.slide').count();
for (let i = 1; i <= n; i++) await p.locator('#s' + i).screenshot({ path: path.join(dir, 'png', `AT-WORK_${slug}_${String(i).padStart(2, '0')}.png`) });
await b.close();
console.log(slug, n, 'placas', problemas.length ? problemas.join('; ') : 'OK');

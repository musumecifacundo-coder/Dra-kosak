import { cpSync, mkdirSync, rmSync } from 'node:fs';

const output = 'dist';
rmSync(output, { recursive: true, force: true });
mkdirSync(output);

for (const entry of [
  'index.html',
  'tratamientos.html', 'reprocann.html', 'sobre-mi.html', 'turnos.html',
  'tratamientos', 'reprocann', 'sobre-mi', 'turnos',
  'assets', 'robots.txt', 'sitemap.xml',
]) {
  cpSync(entry, `${output}/${entry}`, { recursive: true });
}

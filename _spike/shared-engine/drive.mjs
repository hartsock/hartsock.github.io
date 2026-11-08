import puppeteer from 'puppeteer-core';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const dir = new URL('.', import.meta.url).pathname;
const srv = http.createServer((q, r) => {
  const f = path.join(dir, q.url.split('?')[0] === '/' ? 'index.html' : q.url.split('?')[0]);
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); r.end(fs.readFileSync(f));
}).listen(8931);
const browser = await puppeteer.launch({ executablePath: process.env.CHROME,
  headless: 'new', args: ['--enable-unsafe-webgpu', '--no-first-run'], userDataDir: dir + '.profile' });
const url = 'http://localhost:8931/index.html';
const log = [];
async function tab(name) {
  const p = await browser.newPage();
  p.on('console', m => log.push(name + ' console: ' + m.text().slice(0, 200)));
  p.on('pageerror', e => log.push(name + ' pageerror: ' + String(e).slice(0, 300)));
  await p.goto(url); return p;
}
const out = {};
const A = await tab('A');
out.A_gpu = await A.evaluate(() => typeof navigator.gpu);
out.A = await A.evaluate(() => window.run());
const B = await tab('B');
out.B = await B.evaluate(() => window.run());
out.concurrent = await Promise.all([A.evaluate(() => window.ask(window.engine, 'Name a color')), B.evaluate(() => window.ask(window.engine, 'Name an animal'))]).catch(e => 'ERR ' + e.message.slice(0, 200));
out.startA = out.A.status.startedAt;
await A.reload();
out.A_reload_withB = await A.evaluate(() => window.run());
out.sameWorker_withB = out.A_reload_withB.status.startedAt === out.startA;
await A.close(); await B.close(); await new Promise(r => setTimeout(r, 1500));
const C = await tab('C');
out.C_afterAllClosed = await C.evaluate(() => window.run());
out.sameWorker_afterAllClosed = out.C_afterAllClosed.status.startedAt === out.startA;
console.log(JSON.stringify(out, null, 1)); console.log(log.slice(0, 12).join('\n'));
await new Promise(r => setTimeout(r, 300)); await browser.close(); srv.close();

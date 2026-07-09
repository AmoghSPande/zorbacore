// Screenshot helper: node shot.mjs <url> <outfile> [width] [height] [delayMs]
import { chromium } from 'playwright-core';

const [url, out, w = '390', h = '844', delay = '600'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text()); });
page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(+delay);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('saved', out);

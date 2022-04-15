import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

await page.goto('http://localhost:8080');

await page.setViewport({ width: 1000, height: 1000 });

const { width, height } = await page.evaluate(() => ({
  width: document.documentElement.clientWidth,
  height: document.documentElement.offsetHeight,
}));

console.table({ width, height });

await page.pdf({
  width,
  height,
  pageRanges: '1',
  printBackground: true,
  path: './resume.pdf',
});

await browser.close();

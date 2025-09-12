// backend/src/services/cvGenerator.ts
import path from 'path';
import fs from 'fs';
import { getUploadPath } from '../utils/paths';
import { buildRenderableCV } from './cvData';

function getPrintBaseUrl() {
  if (process.env.PRINT_BASE_URL) return process.env.PRINT_BASE_URL.replace(/\/$/, '');
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL.replace(/\/$/, '');
  const isProd = process.env.NODE_ENV === 'production';
  return isProd ? 'http://127.0.0.1:3001' : 'http://localhost:5173';
}

export async function generateCvPdfPlaywright() {
  // Build CV renderable and ensure there is some content (sanity check)
  const data = await buildRenderableCV();
  if (!data || (!data.cv?.personalInfo && !data.cv?.experiences?.length && !data.cv?.education?.length && !data.cv?.skills?.length)) {
    const err: any = new Error('No CV data available to render');
    err.code = 'EMPTY_CV';
    throw err;
  }

  // Resolve output path
  const outDir = path.join(getUploadPath(), 'cv');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const fileName = `cv-${Date.now()}.pdf`;
  const fileFsPath = path.join(outDir, fileName);

  // Compute print URL pointing to the frontend render page
  const base = getPrintBaseUrl();
  const url = `${base}/print/cv`;

  let browser: any;
  try {
    const { chromium } = await import('playwright');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ deviceScaleFactor: 2 });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });

    try {
      // @ts-ignore
      await page.evaluate(() => (document as any).fonts?.ready?.then(() => null));
    } catch {}

    await page.evaluate(async () => {
      const imgs = Array.from(document.images || []);
      await Promise.all(imgs.map((img) => (img.decode ? img.decode().catch(() => null) : Promise.resolve(null))));
    });

    await page.waitForTimeout(200);

    await page.pdf({
      path: fileFsPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });

    await browser.close();
    browser = null;

    const stat = fs.statSync(fileFsPath);
    const publicPath = `/uploads/cv/${fileName}`;
    return { filePath: publicPath, fileSize: stat.size };
  } catch (error: any) {
    if (browser) { try { await browser.close(); } catch {} }
    if (error?.code === 'ERR_MODULE_NOT_FOUND' || /Cannot find module 'playwright'/.test(String(error))) {
      const err: any = new Error('Playwright is not installed. Please install it with: npm i -D playwright');
      err.code = 'PLAYWRIGHT_MISSING';
      throw err;
    }
    throw error;
  }
}

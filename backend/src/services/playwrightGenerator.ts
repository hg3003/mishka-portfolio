// backend/src/services/playwrightGenerator.ts
import path from 'path';
import fs from 'fs';
import { prisma } from '../utils/db';
import { getUploadPath } from '../utils/paths';
import { buildRenderablePortfolio } from './portfolioData';
import { buildRenderableCV } from './cvData';

function getPrintBaseUrl() {
  // Prefer explicit FRONTEND_URL (e.g., http://localhost:5173)
  if (process.env.PRINT_BASE_URL) return process.env.PRINT_BASE_URL.replace(/\/$/, '');
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL.replace(/\/$/, '');
  // In production/Electron the backend may serve the frontend
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) return 'http://127.0.0.1:3001';
  // Dev default to Vite
  return 'http://localhost:5173';
}

export async function generatePortfolioPdfPlaywright(id: string) {
  // Ensure portfolio exists and has at least one project
  const renderable = await buildRenderablePortfolio(id);
  if (!renderable) {
    const err: any = new Error('Portfolio not found or empty');
    err.code = 'EMPTY_PORTFOLIO';
    throw err;
  }

  // Resolve output path
  const outDir = path.join(getUploadPath(), 'portfolios');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const fileName = `${id}.pdf`;
  const fileFsPath = path.join(outDir, fileName);

  // Compute print URL pointing to the frontend render page
  const base = getPrintBaseUrl();
  const url = `${base}/print/portfolio/${encodeURIComponent(id)}`;

  let browser: any;
  try {
    // Dynamic import to avoid forcing dependency if not used
    const { chromium } = await import('playwright');

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      deviceScaleFactor: 2,
      // Ensure consistent media emulation for print
    });
    const page = await context.newPage();

    // Load the page and wait for network to be idle
    await page.goto(url, { waitUntil: 'networkidle' });

    // Ensure print media styles are applied
    await page.emulateMedia({ media: 'print' });

    // Wait for fonts and images to be ready
    try {
      // @ts-ignore
      await page.evaluate(() => (document as any).fonts?.ready?.then(() => null));
    } catch {}
    await page.evaluate(async () => {
      const imgs = Array.from(document.images || []);
      await Promise.all(
        imgs.map((img) => (img.decode ? img.decode().catch(() => null) : Promise.resolve(null)))
      );
    });

    // Give the page a beat to finish any client work (images/layout)
    await page.waitForTimeout(200);

    // Print to PDF
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
    const publicPath = `/uploads/portfolios/${fileName}`;

    await prisma.generatedPortfolio.update({
      where: { id },
      data: { filePath: publicPath, fileSize: stat.size },
    });

    return { filePath: publicPath, fileSize: stat.size };
  } catch (error: any) {
    if (browser) {
      try { await browser.close(); } catch {}
    }
    // Enhance error if playwright is missing
    if (error?.code === 'ERR_MODULE_NOT_FOUND' || /Cannot find module 'playwright'/.test(String(error))) {
      const err: any = new Error('Playwright is not installed. Please install it with: npm i -D playwright');
      err.code = 'PLAYWRIGHT_MISSING';
      throw err;
    }
    throw error;
  }
}

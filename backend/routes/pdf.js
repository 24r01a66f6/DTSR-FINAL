const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const { buildBlocksHtml } = require('../utils/resumeHtml');

// The local Vite dev server URL — update for production
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * POST /api/pdf/template
 * Body: { resumeData: ResumeData, filename?: string }
 * Puppeteer navigates to the React /resume-print route for pixel-perfect output.
 */
router.post('/template', async (req, res) => {
  const { resumeData, filename = 'resume.pdf' } = req.body;

  if (!resumeData) {
    return res.status(400).json({ error: 'resumeData is required' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Encode the full resumeData as base64 and pass it as a query param
    const { templateId = 'modern' } = req.body;
    const encoded = Buffer.from(JSON.stringify(resumeData)).toString('base64');
    const printUrl = `${FRONTEND_URL}/resume-print?d=${encoded}&t=${templateId}`;

    // Navigate to the actual React component — pixel-perfect match to the preview
    await page.goto(printUrl, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for the resume root element to be fully painted
    await page.waitForSelector('#resume-template-root', { timeout: 10000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error('PDF generation failed:', err);
    res.status(500).json({ error: 'Failed to generate PDF', details: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

/**
 * POST /api/pdf/custom
 * Body: { blocks: LayoutBlock[], filename?: string }
 * Returns: PDF buffer from Konva layout blocks rendered as positioned HTML
 */
router.post('/custom', async (req, res) => {
  const { blocks, filename = 'resume-custom.pdf' } = req.body;

  if (!blocks || !Array.isArray(blocks)) {
    return res.status(400).json({ error: 'blocks array is required' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

    const html = buildBlocksHtml(blocks);
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      width: '794px',
      height: '1123px',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error('PDF generation (custom) failed:', err);
    res.status(500).json({ error: 'Failed to generate PDF', details: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

module.exports = router;

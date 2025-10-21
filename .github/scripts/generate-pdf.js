#!/usr/bin/env node

/**
 * Simple PDF generator using Puppeteer.
 * Generates PDFs from HTML files with optional title metadata.
 * Intended to replace wkhtmltopdf for more stable PDF generation in GitHub Actions.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePDF(htmlFilePath, outputPath, title = '') {
  let browser;
  
  try {
    console.log(`🔄 Converting ${htmlFilePath} to PDF...`);
    
    // Check if HTML file exists
    if (!fs.existsSync(htmlFilePath)) {
      throw new Error(`HTML file not found: ${htmlFilePath}`);
    }
    
    // Launch browser with optimized settings for GitHub Actions
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });
    
    const page = await browser.newPage();
    
    // Convert to absolute path for file:// URL
    const absoluteHtmlPath = path.resolve(htmlFilePath);
    await page.goto(`file://${absoluteHtmlPath}`, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Inject PDF-specific styles
    const pdfCssPath = path.join(__dirname, '..', 'styles', 'pdf.css');
    if (fs.existsSync(pdfCssPath)) {
      await page.addStyleTag({ path: pdfCssPath });
      console.log('🎨 Applied PDF-specific styling');
    }
    
    // Set PDF metadata if title is provided (must be done before page.pdf())
    if (title) {
      await page.evaluate((t) => { document.title = t; }, title);
      console.log(`📄 Set PDF title metadata: "${title}"`);
    }
    
    // Generate PDF with professional settings
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      margin: {
        top: '0.75in',
        bottom: '1.0in',
        left: '0.75in',
        right: '0.75in'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>', // Empty header
      footerTemplate: `
        <div style="font-size: 10px; color: #666; width: 100%; margin: 0 auto; position: relative; padding: 0 0.75in; box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            ${title ? `<span style="max-width: 60%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title.replace(/"/g, '&quot;')}</span>` : '<span></span>'}
            <span style="white-space: nowrap;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
          </div>
        </div>
      `,
      preferCSSPageSize: false
    });
    
    // Write PDF to file
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`✅ Successfully generated PDF: ${outputPath}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error generating PDF for ${htmlFilePath}:`, error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node generate-pdf.js <input.html> <output.pdf> [title]');
    process.exit(1);
  }
  
  const [inputPath, outputPath, title] = args;
  
  generatePDF(inputPath, outputPath, title)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { generatePDF };
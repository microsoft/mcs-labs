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
        '--disable-renderer-backgrounding',
        '--font-render-hinting=none',
        '--disable-font-subpixel-positioning'
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
    
    // Wait for fonts to load (including emoji fonts)
    await page.evaluateHandle('document.fonts.ready');
    console.log('✅ Fonts loaded');
    
    // Check for Mermaid diagrams and render them if present
    const hasMermaid = await page.evaluate(() => {
      // Check for both HTML divs and Pandoc-generated code blocks
      const mermaidElements = document.querySelectorAll('.mermaid, div.mermaid, code.language-mermaid, pre.mermaid');
      console.log('Mermaid detection:', {
        found: mermaidElements.length,
        selectors: {
          '.mermaid': document.querySelectorAll('.mermaid').length,
          'div.mermaid': document.querySelectorAll('div.mermaid').length,
          'code.language-mermaid': document.querySelectorAll('code.language-mermaid').length,
          'pre.mermaid': document.querySelectorAll('pre.mermaid').length
        }
      });
      return mermaidElements.length > 0;
    });
    
    if (hasMermaid) {
      console.log('🎨 Mermaid diagrams detected - loading Mermaid.js...');
      
      // Load Mermaid.js from CDN - using v11 for better rendering
      await page.addScriptTag({
        url: 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js'
      });
      
      // Initialize and render Mermaid diagrams
      const renderResult = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Convert Pandoc code blocks to Mermaid divs
          const codeBlocks = document.querySelectorAll('code.language-mermaid, pre.mermaid > code');
          console.log(`Converting ${codeBlocks.length} code blocks to Mermaid divs`);
          codeBlocks.forEach(code => {
            const pre = code.closest('pre');
            if (pre) {
              const div = document.createElement('div');
              div.className = 'mermaid';
              div.textContent = code.textContent;
              pre.parentNode.replaceChild(div, pre);
            }
          });
          
          // Configure Mermaid for PDF rendering
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            logLevel: 'debug', // Enable debug logging
            themeVariables: {
              fontSize: '16px',
              fontFamily: 'Arial, sans-serif'
            },
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: 'basis'
            },
            sequence: {
              useMaxWidth: true,
              diagramMarginX: 50,
              diagramMarginY: 10,
              actorMargin: 50,
              width: 150,
              height: 65,
              boxMargin: 10,
              boxTextMargin: 5,
              noteMargin: 10,
              messageMargin: 35
            }
          });
          
          // Find all mermaid divs and render them
          const mermaidDivs = document.querySelectorAll('.mermaid, div.mermaid');
          console.log(`Found ${mermaidDivs.length} Mermaid diagram(s) to render`);
          
          if (mermaidDivs.length === 0) {
            resolve({ success: true, count: 0 });
            return;
          }
          
          // Log first diagram content for debugging
          if (mermaidDivs.length > 0) {
            console.log('First diagram content:', mermaidDivs[0].textContent.substring(0, 200));
          }
          
          // Render all diagrams
          mermaid.run({
            querySelector: '.mermaid, div.mermaid'
          }).then(() => {
            console.log('✅ All Mermaid diagrams rendered successfully');
            resolve({ success: true, count: mermaidDivs.length });
          }).catch((error) => {
            console.error('⚠️ Error rendering Mermaid diagrams:', error.message);
            resolve({ success: false, error: error.message, count: mermaidDivs.length });
          });
        });
      });
      
      console.log('Mermaid render result:', renderResult);
      
      // Wait a bit for rendering to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Mermaid diagram rendering complete');
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
      preferCSSPageSize: false,
      tagged: true,  // Create tagged PDF for better accessibility and structure
      outline: true  // Generate PDF outline/bookmarks from headings
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
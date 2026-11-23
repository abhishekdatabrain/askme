const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

/**
 * Find available Chrome or Edge binary path on Windows/Linux/Mac
 */
const getBrowserExecutablePath = () => {
  const candidates = [
    process.env.CHROME_BIN,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);

  for (const bin of candidates) {
    try {
      if (fs.existsSync(bin)) {
        return bin;
      }
    } catch (_) {}
  }
  return null;
};

/**
 * Format currency with 2 decimal places in Indian Rupee format
 */
const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return `₹${num.toFixed(2)}`;
};

/**
 * Format Date into readable Order/Invoice Date format
 */
const formatOrderDate = (date) => {
  const d = date ? new Date(date) : new Date();
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Generate sequential, deterministic invoice number
 * Format: ASKME/YYYY-YY/XXXXX (e.g. ASKME/2026-27/00042)
 */
const generateInvoiceNumber = (donationId, date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const nextYear = String(year + 1).slice(-2);
  const finYear = `${year}-${nextYear}`;
  const seq = String(donationId || 1).padStart(5, '0');
  return `ASKME/${finYear}/${seq}`;
};

/**
 * Calculate dynamic GST (18%) and taxable values from inclusive total
 */
const calculateGstBreakdown = (totalAmount) => {
  const total = Number(totalAmount) || 0;
  // 18% GST reverse calculation
  const taxable = Math.round((total / 1.18) * 100) / 100;
  const gst = Math.round((total - taxable) * 100) / 100;

  return {
    amountTotal: total,
    taxableValue: taxable,
    gstAmount: gst,
    gstLabel: '18% GST',
    amountTotalStr: formatCurrency(total),
    taxableValueStr: formatCurrency(taxable),
    gstAmountStr: formatCurrency(gst),
  };
};

/**
 * Compile HTML with merge tags
 */
const compileTemplate = (htmlTemplate, mergeData) => {
  let result = htmlTemplate;
  for (const [key, value] of Object.entries(mergeData)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value != null ? String(value) : '');
  }
  return result;
};

/**
 * Get AskMe Logo as Base64 Data URI for reliable local PDF rendering
 */
const getLogoDataUri = () => {
  try {
    const logoPath = path.join(__dirname, '../assets/logo.png');
    if (fs.existsSync(logoPath)) {
      const buf = fs.readFileSync(logoPath);
      return `data:image/png;base64,${buf.toString('base64')}`;
    }
  } catch (err) {
    console.warn('[PDF Service] Logo read warning:', err.message);
  }
  return '';
};

/**
 * Generate A4 GST Tax Invoice PDF from template
 */
const generateInvoicePdf = async (data) => {
  const browserPath = getBrowserExecutablePath();
  if (!browserPath) {
    console.warn('[PDF Service] No Chrome or Edge executable found. Skipping PDF generation.');
    return null;
  }

  const templatePath = path.join(__dirname, '../templates/askme-invoice-pdf.html');
  if (!fs.existsSync(templatePath)) {
    console.warn('[PDF Service] Invoice HTML template not found at:', templatePath);
    return null;
  }

  const outputDir = path.join(__dirname, '../../uploads/invoices');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const safeInvoiceNo = String(data.invoice_no || 'INV').replace(/[\/\\]/g, '_');
  const pdfFileName = `Invoice_${safeInvoiceNo}.pdf`;
  const pdfOutputPath = path.join(outputDir, pdfFileName);

  // Return existing PDF if already generated (Idempotency)
  if (fs.existsSync(pdfOutputPath)) {
    return pdfOutputPath;
  }

  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const logoSrc = getLogoDataUri();

  const renderedHtml = compileTemplate(templateContent, {
    ...data,
    logo_src: logoSrc,
  });

  const tempHtmlPath = path.join(outputDir, `temp_${Date.now()}_${Math.random().toString(36).substring(7)}.html`);
  fs.writeFileSync(tempHtmlPath, renderedHtml, 'utf8');

  return new Promise((resolve) => {
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--log-level=3',
      '--no-pdf-header-footer',
      `--print-to-pdf=${pdfOutputPath}`,
      tempHtmlPath,
    ];

    execFile(browserPath, args, { timeout: 15000 }, (error) => {
      // Clean up temp HTML file
      try {
        if (fs.existsSync(tempHtmlPath)) {
          fs.unlinkSync(tempHtmlPath);
        }
      } catch (_) {}

      // If PDF file was successfully created and has size, consider it a success
      if (fs.existsSync(pdfOutputPath) && fs.statSync(pdfOutputPath).size > 0) {
        console.log(`[PDF Service] Successfully generated Tax Invoice PDF: ${pdfFileName} (${fs.statSync(pdfOutputPath).size} bytes)`);
        resolve(pdfOutputPath);
      } else if (error) {
        console.error('[PDF Service] PDF generation error:', error.message);
        resolve(null);
      } else {
        console.warn('[PDF Service] PDF file not found after generation command.');
        resolve(null);
      }
    });
  });
};

module.exports = {
  formatCurrency,
  formatOrderDate,
  generateInvoiceNumber,
  calculateGstBreakdown,
  compileTemplate,
  generateInvoicePdf,
};

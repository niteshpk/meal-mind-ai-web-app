import puppeteer from "puppeteer";

export interface Recipe {
  name: string;
  description: string;
  cuisine: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  ingredients: { amount: string; item: string }[];
  instructions: string[];
  tips: string[];
}

export class PDFService {
  /**
   * Generate PDF from recipe data
   */
  static async generateRecipePDF(recipe: Recipe): Promise<Buffer> {
    let browser;

    try {
      // Try to launch browser with standard configuration
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-software-rasterizer",
          "--disable-extensions",
        ],
        timeout: 30000, // 30 second timeout
      });
    } catch (error: any) {
      // If launch fails, try to clear cache and retry once
      if (
        error.message?.includes("Failed to launch") ||
        error.message?.includes("dlopen")
      ) {
        console.warn(
          "⚠ Browser launch failed, attempting to use system Chrome..."
        );

        // Try with system Chrome if available (common on macOS)
        const systemChromePaths = [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
          "/Applications/Chromium.app/Contents/MacOS/Chromium",
        ];

        let executablePath: string | undefined;
        for (const path of systemChromePaths) {
          try {
            const fs = await import("fs/promises");
            await fs.access(path);
            executablePath = path;
            console.log(`✓ Found system Chrome at: ${path}`);
            break;
          } catch {
            // Path doesn't exist, try next
          }
        }

        if (executablePath) {
          browser = await puppeteer.launch({
            headless: true,
            executablePath,
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
              "--disable-gpu",
            ],
            timeout: 30000,
          });
        } else {
          // Re-throw original error with helpful message
          throw new Error(
            `Failed to launch browser: ${error.message}\n\n` +
              `Troubleshooting steps:\n` +
              `1. Clear Puppeteer cache: rm -rf ~/.cache/puppeteer\n` +
              `2. Reinstall Chrome: pnpm run install-chrome\n` +
              `3. Or install Google Chrome manually from https://www.google.com/chrome/`
          );
        }
      } else {
        throw error;
      }
    }

    // Ensure browser was successfully launched
    if (!browser) {
      throw new Error("Browser failed to launch");
    }

    try {
      const page = await browser.newPage();

      // Generate HTML content for the recipe
      const htmlContent = this.generateRecipeHTML(recipe);

      await page.setContent(htmlContent, {
        waitUntil: "networkidle0",
      });

      // Generate PDF with branding
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "90px", // Increased to provide adequate space for header (header ~50px + spacing)
          bottom: "90px", // Increased to provide adequate space for footer (footer ~50px + spacing)
          left: "50px",
          right: "50px",
        },
        displayHeaderFooter: true,
        headerTemplate: this.getHeaderTemplate(),
        footerTemplate: this.getFooterTemplate(),
      });

      // Convert Uint8Array to Buffer
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  /**
   * Generate HTML content for recipe
   */
  private static generateRecipeHTML(recipe: Recipe): string {
    const ingredientsList = recipe.ingredients
      .map(
        (ing) =>
          `<li><span class="ingredient-amount">${this.escapeHtml(
            ing.amount
          )}</span> ${this.escapeHtml(ing.item)}</li>`
      )
      .join("");

    const instructionsList = recipe.instructions
      .map((inst) => `<li>${this.escapeHtml(inst)}</li>`)
      .join("");

    const tipsList = recipe.tips
      .map((tip) => `<li>${this.escapeHtml(tip)}</li>`)
      .join("");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(recipe.name)} - MealMind AI</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fdfcfb;
      padding: 0;
      margin: 0;
      font-size: 14px;
      /* Add top padding to push content below header on ALL pages */
      /* Header is ~52px tall, margin is 90px, so we add 40px padding to ensure content starts at 130px */
      padding-top: 40px;
      /* Add bottom padding to keep content above footer on ALL pages */
      padding-bottom: 40px;
    }
    
    .container {
      background: white;
      padding: 40px 45px;
      max-width: 100%;
      position: relative;
    }
    
    /* Spacer to ensure proper spacing from header on all pages */
    .page-spacer {
      height: 0;
      page-break-after: avoid;
      page-break-inside: avoid;
    }
    
    /* Ensure first element has top margin on all pages */
    .container > *:first-child {
      margin-top: 0;
    }
    
    /* Ensure sections have proper spacing when they appear at page breaks */
    .section {
      margin: 32px 0;
      page-break-inside: avoid;
    }
    
    /* Ensure header section doesn't have extra padding on first page */
    .header {
      margin-top: 0;
      padding-top: 0;
    }
    
    /* Header Section */
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 3px solid #2d7a3e;
    }
    
    .site-logo {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .logo-icon {
      width: 32px;
      height: 32px;
      background: #2d7a3e;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 18px;
    }
    
    .site-title {
      font-size: 20px;
      color: #2d7a3e;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    
    .recipe-title {
      font-size: 32px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 16px 0 12px 0;
      line-height: 1.3;
    }
    
    .recipe-description {
      font-size: 15px;
      color: #6b7280;
      font-style: italic;
      margin: 12px auto 0;
      max-width: 700px;
      line-height: 1.5;
    }
    
    /* Badges */
    .badges {
      display: flex;
      gap: 8px;
      justify-content: center;
      align-items: center;
      margin-top: 16px;
      flex-wrap: wrap;
    }
    
    .badge {
      display: inline-block;
      background: #2d7a3e;
      color: white;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: capitalize;
    }
    
    .badge.badge-cuisine {
      background: #2d7a3e;
    }
    
    .badge.badge-difficulty {
      background: #ff8b3d;
    }
    
    .badge.badge-ai {
      background: #e8f5e9;
      color: #2d7a3e;
      border: 1.5px solid #2d7a3e;
    }
    
    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin: 28px 0;
      padding: 20px;
      background: #f5f5f0;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    
    .info-item {
      text-align: center;
      padding: 8px;
    }
    
    .info-label {
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
      font-weight: 500;
    }
    
    .info-value {
      font-size: 20px;
      font-weight: 600;
      color: #2d7a3e;
      margin-top: 4px;
    }
    
    /* Sections */
    .section {
      margin: 32px 0;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 22px;
      font-weight: 600;
      color: #2d7a3e;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e8f5e9;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .section-icon {
      width: 6px;
      height: 6px;
      background: #ff8b3d;
      border-radius: 50%;
    }
    
    /* Ingredients */
    .ingredients-list {
      list-style: none;
      columns: 2;
      column-gap: 32px;
      column-fill: balance;
      padding: 0;
      margin: 0;
    }
    
    .ingredients-list li {
      margin-bottom: 10px;
      padding-left: 20px;
      position: relative;
      break-inside: avoid;
      line-height: 1.6;
    }
    
    .ingredients-list li::before {
      content: "";
      position: absolute;
      left: 0;
      top: 9px;
      width: 6px;
      height: 6px;
      background: #2d7a3e;
      border-radius: 50%;
    }
    
    .ingredient-amount {
      color: #ff8b3d;
      font-weight: 600;
      margin-right: 4px;
    }
    
    /* Instructions */
    .instructions-list {
      list-style: none;
      counter-reset: step-counter;
      padding: 0;
      margin: 0;
    }
    
    .instructions-list li {
      counter-increment: step-counter;
      margin-bottom: 20px;
      padding-left: 52px;
      position: relative;
      line-height: 1.7;
      page-break-inside: avoid;
    }
    
    .instructions-list li::before {
      content: counter(step-counter);
      position: absolute;
      left: 0;
      top: 0;
      background: linear-gradient(135deg, #2d7a3e 0%, #4a9d5a 100%);
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 15px;
      box-shadow: 0 2px 6px rgba(45, 122, 62, 0.2);
    }
    
    /* Tips Box */
    .tips-box {
      background: #fff3e0;
      border-left: 4px solid #ff8b3d;
      border-radius: 12px;
      padding: 20px 24px;
      margin-top: 32px;
      page-break-inside: avoid;
    }
    
    .tips-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
    }
    
    .tips-icon {
      font-size: 20px;
    }
    
    .tips-title {
      font-size: 18px;
      font-weight: 600;
      color: #ff8b3d;
    }
    
    .tips-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .tips-list li {
      margin-bottom: 10px;
      padding-left: 28px;
      position: relative;
      line-height: 1.6;
    }
    
    .tips-list li::before {
      content: "💡";
      position: absolute;
      left: 0;
      top: 0;
    }
    
    /* Print Optimizations */
    @media print {
      body {
        background: white;
        /* Ensure padding applies on all pages to prevent header/footer overlap */
        padding-top: 40px;
        padding-bottom: 40px;
      }
      
      .container {
        padding: 40px 45px;
      }
      
      .section {
        page-break-inside: avoid;
      }
      
      .info-grid {
        page-break-inside: avoid;
      }
      
      .tips-box {
        page-break-inside: avoid;
      }
      
      .page-spacer {
        height: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="page-spacer"></div>
    <div class="header">
      <div class="site-logo">
        <div class="logo-icon">👨‍🍳</div>
        <div class="site-title">MealMind AI</div>
      </div>
      <h1 class="recipe-title">${this.escapeHtml(recipe.name)}</h1>
      <p class="recipe-description">${this.escapeHtml(recipe.description)}</p>
      <div class="badges">
        <span class="badge badge-cuisine">${this.escapeHtml(
          recipe.cuisine
        )}</span>
        <span class="badge badge-difficulty">${this.escapeHtml(
          recipe.difficulty
        )}</span>
        <span class="badge badge-ai">AI Generated</span>
      </div>
    </div>
    
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Prep Time</div>
        <div class="info-value">${this.escapeHtml(
          recipe.prepTime
        )}<span style="font-size: 14px; font-weight: 500;"> min</span></div>
      </div>
      <div class="info-item">
        <div class="info-label">Cook Time</div>
        <div class="info-value">${this.escapeHtml(
          recipe.cookTime
        )}<span style="font-size: 14px; font-weight: 500;"> min</span></div>
      </div>
      <div class="info-item">
        <div class="info-label">Total Time</div>
        <div class="info-value">${this.calculateTotalTime(
          recipe.prepTime,
          recipe.cookTime
        )}<span style="font-size: 14px; font-weight: 500;"> min</span></div>
      </div>
      <div class="info-item">
        <div class="info-label">Servings</div>
        <div class="info-value">${recipe.servings}</div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">
        <span class="section-icon"></span>
        Ingredients
      </h2>
      <ul class="ingredients-list">
        ${ingredientsList}
      </ul>
    </div>
    
    <div class="section">
      <h2 class="section-title">
        <span class="section-icon"></span>
        Instructions
      </h2>
      <ol class="instructions-list">
        ${instructionsList}
      </ol>
    </div>
    
    ${
      recipe.tips.length > 0
        ? `
    <div class="tips-box">
      <div class="tips-header">
        <span class="tips-icon">👨‍🍳</span>
        <h3 class="tips-title">Chef's Tips</h3>
      </div>
      <ul class="tips-list">
        ${tipsList}
      </ul>
    </div>
    `
        : ""
    }
  </div>
</body>
</html>
    `;
  }

  /**
   * Get header template for PDF
   */
  private static getHeaderTemplate(): string {
    return `
    <div style="
      font-size: 10px; 
      padding: 15px 50px; 
      width: 100%; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      border-bottom: 2px solid #e8f5e9;
      background: white;
    ">
      <div style="display: flex; align-items: center; gap: 6px;">
        <div style="
          width: 16px; 
          height: 16px; 
          background: #2d7a3e; 
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
        ">👨‍🍳</div>
        <span style="color: #2d7a3e; font-weight: 600; letter-spacing: 0.5px;">MEALMIND AI</span>
      </div>
      <span style="color: #6b7280; font-size: 9px;">Your AI Recipe Generator</span>
    </div>
    `;
  }

  /**
   * Get footer template for PDF
   */
  private static getFooterTemplate(): string {
    return `
    <div style="
      font-size: 9px; 
      padding: 15px 50px; 
      width: 100%; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      border-top: 2px solid #e8f5e9;
      background: white;
    ">
      <span style="color: #6b7280;">© 2025 MealMind AI</span>
      <span style="color: #6b7280; display: flex; align-items: center; gap: 4px;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </span>
      <span style="color: #2d7a3e; font-weight: 500;">mealmind.ai</span>
    </div>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   */
  private static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      "&": "&",
      "<": "<",
      ">": ">",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Calculate total time from prep and cook time
   */
  private static calculateTotalTime(
    prepTime: string,
    cookTime: string
  ): number {
    const prep = parseInt(prepTime) || 0;
    const cook = parseInt(cookTime) || 0;
    return prep + cook;
  }
}

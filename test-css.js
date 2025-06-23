const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  try {
    // First try port 3000, then 3001
    let url = 'http://localhost:3000';
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 5000 });
    } catch (e) {
      console.log('Port 3000 failed, trying 3001...');
      url = 'http://localhost:3001';
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 5000 });
    }
    
    // Check if Tailwind CSS is loaded
    const hasTailwind = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      const hasTailwindClasses = document.body.className.includes('bg-') || 
                                document.querySelector('[class*="bg-"]') !== null ||
                                document.querySelector('[class*="text-"]') !== null;
      
      const computedStyle = window.getComputedStyle(document.body);
      const hasBackgroundColor = computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';
      
      return {
        hasTailwindClasses,
        hasBackgroundColor,
        bodyClasses: document.body.className,
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        fontFamily: computedStyle.fontFamily
      };
    });
    
    console.log('Tailwind CSS Check:', hasTailwind);
    
    // Take a screenshot
    await page.screenshot({ path: 'tailwind-test.png', fullPage: true });
    console.log('Screenshot saved as tailwind-test.png');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
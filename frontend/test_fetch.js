import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Check if the backend is reachable via the frontend proxy correctly by making a fetch call inside the browser context
    await page.goto('http://localhost:5173');
    
    const result = await page.evaluate(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/destinations/Paris');
            const data = await response.json();
            return { success: true, data };
        } catch (e) {
            return { success: false, error: e.toString() };
        }
    });

    console.log(JSON.stringify(result, null, 2));
    await browser.close();
})();

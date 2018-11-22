const puppeteer = require('puppeteer');
const cred = require('./config.json');

(async function() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto('https://amplify.fortinet.com');

  // click login button
  await page.waitFor('button.adv-btn');
  await page.click('button.adv-btn');

  // new page opened
  const newTarget = await browser.waitForTarget(target => {
    return target.url().includes('fac.corp.fortinet.com');
  });
  const loginPage = await newTarget.page();

  console.log('logging in...');
  // login
  await loginPage.waitFor('input.submit');
  await loginPage.type('#id_username', cred.username);
  await loginPage.type('#id_password', cred.password);
  await loginPage.click('input.submit');

  await page.waitFor(5000);
  browser.close();
})();

const puppeteer = require('puppeteer');
const cred = require('./config.json');

(async function() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto('https://amplify.fortinet.com');

  // click let's go button
  const letGoBtnSelector = 'button.adv-btn';
  await page.waitFor(letGoBtnSelector);
  await page.click(letGoBtnSelector);

  // new page opened
  const newTarget = await browser.waitForTarget(target => {
    return target.url().includes('fac.corp.fortinet.com');
  });
  const loginPage = await newTarget.page();

  console.log('logging in...');
  // login
  const loginBtnSelector = 'input.submit';
  await loginPage.waitFor(loginBtnSelector);
  await loginPage.type('#id_username', cred.username);
  await loginPage.type('#id_password', cred.password);
  await loginPage.click(loginBtnSelector);


  // Seems like there's a max. for this
  const likeBtnSelector = '.action-bar__like-icon';
  await page.waitFor(likeBtnSelector);
  for (let i = 1; i <= 3; i++) {
    await page.click(likeBtnSelector);
    await page.waitFor(2000);
    await page.click(likeBtnSelector);
    await page.waitFor(2000);
  }

  // Don't want to reshare...
  // const shareBtnXpath = '.content-card__action-bar .action-bar__share__icon:not(.action-bar__share__icon--shared)';
  // await page.waitFor(shareIconSelector);
  // const allShareBtns = await page.$$(shareIconSelector);


  await page.waitFor(5000);


  browser.close();
})();

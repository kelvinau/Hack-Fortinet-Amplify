const puppeteer = require('puppeteer');
const cred = require('./config.json');

(async function() {
  const browser = await puppeteer.launch({
    // headless: false,
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
    console.log(`clicked ${i}`);
  }

  // Don't want to reshare...
  try {
    const shareBtnSelector = '.action-bar__share';
    const linkSelector = '.modal-wrapper .nav-link';
    const loaderSelector = '.loader-ctn';
    const modalShareSelector = '.modal-wrapper .share__actions__button';

    await page.waitFor(shareBtnSelector);
    const shareBtn = await page.$(shareBtnSelector);
    // only check one post
    await shareBtn.click();
    await page.waitFor(linkSelector);
    const links = await page.$$(linkSelector);

    await page.waitFor(5000);

    await Promise.all([
      page.click('.modal-wrapper .nav-link:not(.active)'),
      // page.waitFor(loaderSelector),
    ])

    // await page.waitFor('.loader-ctn', {
    // hidden: true,
    // });

    await page.waitFor(5000);

    const notShared = await page.$('.loader-no-content');
    if (notShared) {
      console.log('sharing...');
      await page.click('.modal-wrapper .nav-link:not(.active)');
      await page.waitFor(modalShareSelector);
      await page.click(modalShareSelector);
    }
    else {
      console.log('shared already');
      await page.click('.modal-wrapper svg.panel__header__close__icon');
    }
  }
  catch(e) {}

  await page.waitFor(5000);

  browser.close();
})();

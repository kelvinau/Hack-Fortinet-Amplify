const puppeteer = require('puppeteer');
const cred = require('./config.json');
const DEBUG = false;

(async function() {
  const browser = await puppeteer.launch({
    headless: !DEBUG,
  });
  const page = await browser.newPage();

  await page.goto('https://amplify.fortinet.com');

  try {
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

    // because it's small screen, only top nav bar is shown
    const tabBtnSelector =
      '.nav.top-nav div.nav-item__child-ctn:not(.hidden-tab) li.nav-item';
    await page.waitFor(tabBtnSelector);
    const tabBtn = await page.$$(tabBtnSelector);
    const tabIndex = [0, 1, 2, 3];
    // go into each tab
    for (let i = 0; i < tabIndex.length; i++) {
      console.log(`going to tab ${tabIndex[i]}...`);
      await tabBtn[tabIndex[i]].click();
      await browseEachTab(i);
    }

    async function browseEachTab(index) {
      // only for the first tab
      if (!index) {
        // Seems like there's a max. for this
        const likeBtnSelector = '.action-bar__like-icon';
        await page.waitFor(likeBtnSelector);

        for (let i = 1; i <= 9; i++) {
          await page.click(likeBtnSelector);
          await page.waitFor(2000);
          await page.click(likeBtnSelector);
          await page.waitFor(2000);
          console.log(`clicked ${i}`);
        }
      }

      // Don't want to reshare...
      const allShareBtnSelector = '//div[contains(@class, "tab-pane active")]// *[name()="svg" and contains(@class, "action-bar__share__icon")]/..';
      const shareBtnSelector = '//div[contains(@class, "tab-pane active")]// *[name()="svg" and contains(@class, "action-bar__share__icon") and not(contains(@class, "action-bar__share__icon--shared"))]/..';

      const modalShareSelector =
        '.tab-pane.active .modal-wrapper .share__actions__button';

      await page.waitFor(allShareBtnSelector);
      const shareBtn = await page.$x(shareBtnSelector);

      for (let btn of shareBtn) {
        // only check one post
        await btn.click();
        await page.waitFor(5000);

        console.log('sharing...');
        await page.waitFor(modalShareSelector);
        await page.click(modalShareSelector);
        // wait for notification to go away
        await page.waitFor(8000);

        await page.waitFor(DEBUG ? 10000 : 2000);
      }
    }
  } catch (e) {
    console.log(e);
  }

  await page.waitFor(5000);

  !DEBUG && browser.close();

  console.log('ended');
})();

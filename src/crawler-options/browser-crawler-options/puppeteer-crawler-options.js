const vanillaPuppeteer = require("puppeteer");
const BrowserCrawlerOptions = require("./browser-crawler-options");
const { PuppeteerExtra } = require("puppeteer-extra");
const { PuppeteerPlugin } = require("browser-pool");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

class PuppeteerCrawlerOptions extends BrowserCrawlerOptions {
  constructor(options = {}) {
    super(options);
  }

  getOptions(_options = {}) {
    const puppeteer = new PuppeteerExtra(vanillaPuppeteer);
    puppeteer.use(StealthPlugin());

    let options = super.getOptions(_options);

    options = {
      ...options,
      launchContext: {
        ...options.launchContext,
        launcher: puppeteer,
      },
      preNavigationHooks: [
        ...options.preNavigationHooks,
        async ({ page, proxyInfo }) => {
          if (proxyInfo) {
            const { username, password } = proxyInfo;
            await page.authenticate({ username, password });
          }
        },
      ],
    };

    return options;
  }
}

module.exports = PuppeteerCrawlerOptions;

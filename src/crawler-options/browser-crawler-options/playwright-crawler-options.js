const playwright = require("playwright");
const BrowserCrawlerOptions = require("./browser-crawler-options");
const { PlaywrightPlugin } = require("browser-pool");

class PlaywrightCrawlerOptions extends BrowserCrawlerOptions {
  constructor(options = {}) {
    super(options);
  }

  getOptions(_options = {}) {
    let options = super.getOptions(_options);

    options = {
      ...options,
      launchContext: {
        ...options.launchContext,
        launcher: playwright.chromium,
      },
      preNavigationHooks: [...options.preNavigationHooks],
    };

    return options;
  }
}

module.exports = PlaywrightCrawlerOptions;

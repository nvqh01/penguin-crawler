const BasicCrawlerOptions = require("../basic-crawler-options");

const MINIMAL_ARGS = [
  "--autoplay-policy=user-gesture-required",
  "--disable-background-networking",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-breakpad",
  "--disable-client-side-phishing-detection",
  "--disable-component-update",
  "--disable-default-apps",
  "--disable-dev-shm-usage",
  "--disable-domain-reliability",
  "--disable-extensions",
  "--disable-features=AudioServiceOutOfProcess",
  "--disable-hang-monitor",
  "--disable-ipc-flooding-protection",
  "--disable-notifications",
  "--disable-offer-store-unmasked-wallet-cards",
  "--disable-popup-blocking",
  "--disable-print-preview",
  "--disable-prompt-on-repost",
  "--disable-renderer-backgrounding",
  "--disable-setuid-sandbox",
  "--disable-speech-api",
  "--disable-sync",
  "--hide-scrollbars",
  "--ignore-gpu-blacklist",
  "--metrics-recording-only",
  "--mute-audio",
  "--no-default-browser-check",
  "--no-first-run",
  "--no-pings",
  "--no-sandbox",
  "--no-zygote",
  "--password-store=basic",
  "--use-gl=swiftshader",
  "--use-mock-keychain",
];

class BrowserCrawlerOptions extends BasicCrawlerOptions {
  constructor(options = {}) {
    super(options);
  }

  getOptions(_options = {}) {
    let options = super.getOptions(_options);

    options = {
      ...options,
      browserPoolOptions: {
        closeInactiveBrowserAfterSecs: 180,
        fingerprintOptions: {
          fingerprintGeneratorOptions: {
            devices: ["desktop", "mobile"],
            locales: ["en-GB", "en-US", "en-SG", "th-Th", "vi-VN"],
            operatingSystems: ["windows", "macos", "android", "ios"],
            browsers: ["edge", "firefox", "chrome", "safari"],
          },
          useFingerprintCache: true,
        },
        maxOpenPagesPerBrowser: 20,
        operationTimeoutSecs: 20,
        retireBrowserAfterPageCount: 100,
        useFingerprints: true,
        ...(this.options?.browserPoolOptions || {}),
      },
      headless: this.options?.headless || false,
      launchContext: {
        experimentalContainers: false,
        launchOptions: {
          args: MINIMAL_ARGS,
          handleSIGINT: false,
          ignoreHTTPSErrors: true,
          useDataDir: "./cache",
        },
        useChrome: false,
        useIncognitoPages: false,
        ...(this.options?.launchContext || {}),
      },
      navigationTimeoutSecs: this.options?.navigationTimeoutSecs || 60,
      persistCookiesPerSession: this.options?.persistCookiesPerSession || false,
      postNavigationHooks: [
        async ({ log, request }) => {
          const timeToStartGoingToUrl = request.userData.timeToStartGoingToUrl;
          const timeToFinishGoingToUrl = new Date().getTime();
          const timeToGoToUrl = timeToFinishGoingToUrl - timeToStartGoingToUrl;
          request.userData.timeToGoToUrl = timeToGoToUrl;
          log.info(
            `Time to go to url ${request.url} is ${(
              (timeToGoToUrl % 60000) /
              1000
            ).toFixed(2)} second(s).`
          );
        },
        ...(this.options?.postNavigationHooks || []),
      ],
      preNavigationHooks: [
        async ({ blockRequests, page, request }, gotoOptions) => {
          await blockRequests();
          await page.setExtraHTTPHeaders({
            "accept-encoding": "gzip, deflate, br",
          });
          request.userData.timeToStartGoingToUrl = new Date().getTime();
          gotoOptions.waitUntil = "domcontentloaded";
        },
        ...(this.options?.preNavigationHooks || []),
      ],
    };

    if (this.options?.proxyConfiguration) {
      options.persistCookiesPerSession = true;
      options.proxyConfiguration = this.options.proxyConfiguration;
      options.useSessionPool = true;
      const numOfProxyUrls = this.options.proxyConfiguration.proxyUrls.length;
      numOfProxyUrls > 1000 &&
        (options.sessionPoolOptions.maxPoolSize = numOfProxyUrls);
    }

    return options;
  }
}

module.exports = BrowserCrawlerOptions;

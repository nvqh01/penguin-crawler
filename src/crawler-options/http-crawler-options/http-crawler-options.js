const BasicCrawlerOptions = require("../basic-crawler-options");

const ADDITIONAL_MIME_TYPES = [
  "text/html",
  "application/json",
  "application/ld+json",
];

class HttpCrawlerOptions extends BasicCrawlerOptions {
  constructor(options = {}) {
    super(options);
  }

  getOptions(_options = {}) {
    const additionalMimeTypes = new Set([
      ...ADDITIONAL_MIME_TYPES,
      ...(this.options?.additionalMimeTypes || []),
    ]);

    let options = super.getOptions(_options);

    options = {
      ...options,
      additionalMimeTypes: [...additionalMimeTypes],
      ignoreSslErrors: this.options?.ignoreSslErrors || false,
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
        async ({ request }, gotoOptions) => {
          request.userData.timeToStartGoingToUrl = new Date().getTime();
          gotoOptions.useHeaderGenerator = true;
          gotoOptions.headerGeneratorOptions = {
            devices: ["desktop", "mobile"],
            locales: ["en-GB", "en-US", "en-SG", "th-Th", "vi-VN"],
            operatingSystems: ["windows", "macos", "android", "ios"],
            browsers: ["edge", "firefox", "chrome", "safari"],
          };
        },
        ...(this.options?.preNavigationHooks || []),
      ],
    };

    if (this.options?.forceResponseEncoding)
      options.forceResponseEncoding = this.options.forceResponseEncoding;

    if (this.options?.suggestResponseEncoding)
      options.suggestResponseEncoding = this.options.suggestResponseEncoding;

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

module.exports = HttpCrawlerOptions;

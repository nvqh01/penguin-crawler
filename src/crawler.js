const BaseCrawler = require("crawlee");
const {
  Log,
  LogLevel,
  ProxyConfiguration,
  Request,
  RequestQueue,
} = require("crawlee");
const CrawlerOptions = require("./crawler-options");

const TIME_TO_WAIT_FOR_ADDING_REQUESTS = 2_000;
const TIME_TO_WAIT_FOR_CHANGING_PROXIES = 90_000;
const TIME_TO_WAIT_FOR_RESTARTING_CRAWLER = 60_000;

class Crawler {
  static BASIC = "BasicCrawler";
  static CHEERIO = "CheerioCrawler";
  static JSDOM = "JSDOMCrawler";
  static PLAYWRIGHT = "PlaywrightCrawler";
  static PUPPETEER = "PuppeteerCrawler";

  constructor({ typeOfCrawler, proxies = [], crawlerOptions = {} }) {
    if (!typeOfCrawler)
      throw new Error(
        "Please select type of crawler before triggering crawler."
      );
    this.typeOfCrawler = typeOfCrawler;
    this.options = crawlerOptions;
    this.formatProxies(proxies);
    this.log = new Log({ prefix: "Crawler Service" });
    this.cycleOfCrawler = 0;
    setInterval(() => this.checkProxies(), TIME_TO_WAIT_FOR_CHANGING_PROXIES);
    process.stdin.resume();
    process.on("SIGINT", async () => {
      await this.release();
      this.log.info("Stop crawler successfully.");
      return process.exit(0);
    });
  }

  async addRequests(requests) {
    if (!this.isRequestQueueInitialized())
      return setTimeout(
        () => this.addRequests(requests),
        TIME_TO_WAIT_FOR_ADDING_REQUESTS
      );
    await this.requestQueue.addRequests(this.convertRequests(requests));
  }

  convertRequests(requests) {
    return Array.isArray(requests) ? requests : [requests];
  }

  async createCrawler(crawlerOptions) {
    this.crawler && (this.crawler = undefined);
    this.crawler ??= new BaseCrawler[this.typeOfCrawler](crawlerOptions);
    this.crawler &&
      (this.crawler.stats.log.setLevel(LogLevel.OFF),
      (this.crawler.log = this.log));
  }

  createCrawlerOptions() {
    this.crawlerOptions ??= new CrawlerOptions[`${this.typeOfCrawler}Options`](
      this.options
    );
  }

  createProxyConfiguration() {
    const proxies = this.getProxies();
    const proxyConfiguration = proxies.length
      ? new ProxyConfiguration({ proxyUrls: proxies })
      : null;
    proxyConfiguration &&
      (this.options.proxyConfiguration = proxyConfiguration);
  }

  async createRequestQueue() {
    this.requestQueue ??= await RequestQueue.open();
    !this.requestQueue?.reset &&
      (this.requestQueue.reset = function () {
        this.queueHeadDict?.clear();
        this.queryQueueHeadPromise = null;
        this.recentlyHandled?.clear();
        this.assumedTotalCount = 0;
        this.assumedHandledCount = 0;
        this.requestsCache?.clear();
        this.lastActivity = new Date();
      });
  }

  formatProxies(_proxies) {
    if (!_proxies.length && this.typeOfCrawler === Crawler.BASIC) {
      this.proxies = [];
      return;
    }
    // Shuffle proxies
    const proxies = _proxies.sort(() => Math.random() - 0.5);
    // Format proxies
    this.proxies = proxies.map((proxy) => {
      const protocol = "http";
      const [hostname, port, username, password] = proxy.split(":");
      return `${protocol}://${username}:${password}@${hostname}:${port}`;
    });
  }

  getProxies() {
    if (!this.proxies.length) {
      this.log.warning(`Get ${this.proxies.length} proxy for crawler.`);
      return [];
    }
    ++this.cycleOfCrawler;
    const proxies =
      this.proxies.length <= 1
        ? this.proxies
        : this.proxies.filter((_, index) => {
            if (this.cycleOfCrawler > 1)
              return this.cycleOfCrawler % 2 === 0
                ? index % 2 === 0
                : index % 2 !== 0;
            return index % 2 !== 0;
          });
    this.log.info(`Get ${proxies.length} proxies for crawler.`);
    return proxies;
  }

  async initialize(options = {}) {
    this.createProxyConfiguration();
    this.createCrawlerOptions();
    await this.createRequestQueue();
    const crawlerOptions = {
      ...this.crawlerOptions.getOptions(options),
      requestQueue: this.requestQueue,
    };
    await this.createCrawler(crawlerOptions);
  }

  isRequestQueueInitialized() {
    if (this?.requestQueue) return true;
    this.log.error("RequestQueue is not initialized.");
    return false;
  }

  isCrawlerInitialized() {
    if (this?.crawler) return true;
    this.log.error("Crawler is not initialized.");
    return false;
  }

  isWaitingToRestart() {
    return this?._isWaitingToRestart ?? false;
  }

  checkProxies() {
    if (!this.proxies.length) return;
    if (!this?.crawler || this.crawler?.sessionPool) return;
    const numOfSessions = this.crawler.sessionPool.getState().sessions.length;
    if (numOfSessions > 0 && this.crawler.sessionPool.usableSessionsCount <= 0)
      this.restart("Crawler ran out of proxies.");
  }

  async release() {
    this?.crawler && (await this.crawler.teardown().catch(() => {}));
    this?.requestQueue && this.requestQueue.reset();
    this._isWaitingToRestart = false;
  }

  async restart(message) {
    if (this.isWaitingToRestart()) return; // Will not restart crawler when it is restarting
    this._isWaitingToRestart = true;
    await this.release();
    this.log.error("Crawler is restarted because of: " + message);
    this.log.info(
      `Crawler will be restarted in ${
        TIME_TO_WAIT_FOR_RESTARTING_CRAWLER / 1000
      } second(s).`
    );
    return setTimeout(() => this.start(), TIME_TO_WAIT_FOR_RESTARTING_CRAWLER);
  }

  async start({ requests = [], options = {} } = {}) {
    if (this.isWaitingToRestart()) {
      this.log.info(
        `Waiting for crawler to finishing restarting in ${
          TIME_TO_WAIT_FOR_RESTARTING_CRAWLER / 2 / 1000
        } second(s).`
      );
      return setTimeout(
        () => this.start(),
        TIME_TO_WAIT_FOR_RESTARTING_CRAWLER / 2
      );
    }

    await this.initialize(options);

    if (!this.isCrawlerInitialized())
      return this.restart("Crawler is not initialized.");

    this.crawler
      .run(this.convertRequests(requests))
      .catch(async (err) => await this.restart(err));
  }
}

function createRequest({
  url,
  uniqueKey = null,
  headers = {},
  userData = {},
  label = null,
  noRetry = false,
  skipNavigation = false,
}) {
  const request = {
    url,
    headers,
    userData,
    noRetry,
    skipNavigation,
  };

  uniqueKey && (request.uniqueKey = uniqueKey);
  label && (request.label = label);

  return new Request(request);
}

module.exports = {
  Crawler,
  createRequest,
};

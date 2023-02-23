const config = require("config");
const { createPuppeteerRouter, sleep } = require("crawlee");
const { createRequest, Crawler } = require("../../src");
const fs = require("fs");

let domainsInQueueCount = 0;
let failedRequestCount = 0;
let successfulRequestCount = 0;

(async () => {
  const { puppeteerCrawlerOptions } = config.get("crawlerOptions");
  const domains = [...config.get("domains")];
  let proxies = config.get("proxies");

  const crawler = new Crawler({
    typeOfCrawler: Crawler.PUPPETEER,
    proxies: [...proxies],
    crawlerOptions: {
      ...puppeteerCrawlerOptions,
      headless: false,
      keepAlive: true,
      maxConcurrency: 20,
      maxRequestRetries: 0,
      maxRequestsPerCrawl: 0,
      maxRequestsPerMinute: 200,
      minConcurrency: 1,
      navigationTimeoutSecs: 60,
      requestHandlerTimeoutSecs: 60,
      sessionPoolOptions: {
        sessionOptions: {
          maxUsageCount: 5,
        },
      },
    },
  });

  setTimeout(
    async () =>
      await crawler.start({
        options: {
          failedRequestHandler: failedRequestHandler(),
          requestHandler: requestHandler(),
        },
      }),
    3_000
  );

  setInterval(async () => {
    const _domains = domains.splice(0, 100);
    console.log(
      `Domains in queue: ${(domainsInQueueCount += _domains.length)}`
    );
    await crawler.addRequests(
      _domains.map((domain) =>
        createRequest({ url: `https://www.similarweb.com/website/${domain}/` })
      )
    );
  }, 30_000);
})();

function failedRequestHandler() {
  return function ({ log, request }) {
    log.error(request.errorMessages[0]);
    log.info(`Failed request count: ${++failedRequestCount}`);
    fs.appendFileSync(
      "results/similarweb.com/failed_results.txt",
      `'${request.url}',\n`,
      {
        encoding: "utf-8",
      }
    );
  };
}

function requestHandler() {
  const router = createPuppeteerRouter();

  router.addDefaultHandler(async ({ log, page, parseWithCheerio, request }) => {
    const selector =
      "#overview > div > div > div > div.wa-overview__column.wa-overview__column--ranking > div > div.wa-rank-list__item.wa-rank-list__item--country > p.wa-rank-list__value";

    await page.waitForSelector(selector, { timeout: 50 * 1000 });

    const rank = await page.$eval(selector, (element) => {
      const _rank = element.textContent;
      if (_rank.includes("#")) return _rank.replace("#", "");
      if (_rank === "") return "-1";
      return "0";
    });

    let filePath = "results/similarweb.com/successful_results/";
    let content = `'${request.url}',`;

    if (rank === "-1") {
      filePath += "unexisted_domains.txt";
    } else if (rank === "0") {
      filePath += "unranked_domains.txt";
    } else {
      filePath += "ranked_domains.txt";
      content += rank;
    }

    fs.appendFileSync(filePath, `${content}\n`, {
      encoding: "utf-8",
    });
    log.info(`Successful request count: ${++successfulRequestCount}`);
  });

  return router;
}

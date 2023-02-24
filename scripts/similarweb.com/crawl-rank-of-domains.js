const config = require("config");
const { createCheerioRouter } = require("crawlee");
const { createRequest, Crawler } = require("../../src");
const fs = require("fs");

const cookies = `'name': 'sgID=6fdcc0ce-96e8-2837-d41b-61f7c5483a5f; __zlcmid=1DAlPSC01AYRCjD; locale=en-us; __q_state_9u7uiM39FyWVMWQF=eyJ1dWlkIjoiNDM5YTBlZGItY2Q4Ni00MjM1LWE2OWUtN2NjZTlmYTRiOGU5IiwiY29va2llRG9tYWluIjoic2ltaWxhcndlYi5jb20iLCJtZXNzZW5nZXJFeHBhbmRlZCI6ZmFsc2UsInByb21wdERpc21pc3NlZCI6ZmFsc2UsImNvbnZlcnNhdGlvbklkIjoiMTA2NTMzNTAzNTAyMDU1OTUxNyJ9; .DEVICETOKEN.SIMILARWEB.COM=KteDk0LAMXyVysjGven6FLEhqTUwdpJD; .SGTOKEN.SIMILARWEB.COM=gfvE5ZmePF1m-E6-UkXtip5lvU_RsNAyVvrIxtRMVmcKp2-zJm2hMwDhEcevDgoouPCh5O88YisThV2h6y-1rjCVOyEhkCqBXqA738pBfvk0rtGazYdDC28sPeI67qkb2tsEwk6Zfl63enKGnhjNROQz16ki4gIkJQyW07JdrWMhKtaF9CxZyIlohgWo7KLJBq1fCIjX-tLXKbv_9MJu4tJM2W3SPB_TIT28yRe2O9gPIVh_fQ92TNLWOHVVObpOm3ukhrE5flGfkCEllwi5fZJylUDHU9q_uNgsgLV8zqoxCdNUQaP8fTRkJuJY5wuCHEXmPBNhSzNzbQDVZBaWYZh-307Jmytx2cr7S3PZTLlx-19cqB1CVZf0bL2p_bpU370Rbh439KUEEOcScU-wqYiZpEgXKli0bnZ6jxmr1SWpnF1uzOKBnbR22gL2nm7I; _abck=9382E387B1B52431FA0EBA181167D460~-1~YAAQPFnKFyH3q3WGAQAAyAYdggmXZgMUgUF2l5r1o+YQhAY1k3BXHEhfd7I7fFq3yCW80U7i3awjVC1ZPcZ4XF/aYxi7/LDGwPwzCxBlijUueCekg4oAsf0bMBlcRko2+1syUq8OrwU+Uk2SpMn8j6kSyScIRMqmdYvO3uGkQlGEYl+4z5Ah2sBZMCWiIZdUK5iESeASWzn760TLMEnZEPSWUAkxzm0SaHuOd3c43xNJ/5av/dl7S4kOYO7InMRqSasdFPJjHk2fERDmXFzBCB++/HTsjH5aqnlmRdHaCXVkCzZrojc8BOobSTt+deO9aQXq1LfsZKV1PF0FBfs5B+ibya66nzYEB8OZjEQ5Php+EsZBcLRT8PPoBce+bOAUc3bd/k8n/r7i3n47hzzoUhGjBnGhOyGvIAAQqqdv~-1~-1~-1; ak_bmsc=11D16889FF35F94ED766A966ABA5450A~000000000000000000000000000000~YAAQPFnKFyL3q3WGAQAAyAYdghLaMtYmpaxAFvoD4ZlBdZiZESEJTl452J7ynfmVsf9jfzsNe/eFnaJ9QoMBVMtPbCUrnvTtSFeEQsIH/e2DklYHL2FeTlgwtcwBhm/NQ79y+zTQo3GiYrLsfI+imsL/r9l2txDkudJgG7DUTjWYvDpJ0gvfhr46jDCt+/v/xWj7PZ1Rp9uPZOgMuPNeZPSiNIt2qNVbas2q7N5vQEal15BBKwlBwBu7dENs4ivhTXiBc1TD2PEDvukfyF+Xc02xnfB7OC083w1Aya9kTrN8u7Z2QBD6ebScuJg19s8e/dXoaOzPibbUmIdhh4P7JH8EzEA1l3e976P1zZFZIwRokrY2IKyPXroFqVq7h6qhSuY7lOFL+8RWWcckcLU=; bm_sz=9D98100A591B6A6E6947C36BB5EB6384~YAAQPFnKFyP3q3WGAQAAyAYdghJ8AaRw5KTCj/DO8L2HS0Eulf/p2lG1WwNH/TRVxpqovOx8Qy6vqSZCygmGOwoqhsKB/2fYYot3kxm2uYvtTmaXRVOaYRg5Qro5nw+EhNkf5nVfE0LzvwQOpsFXNytGpIdOQartsGmo1lIt1bgkspbakdQSfjH3lp/mBPsM7RIm/ECPRkf6L4+lR2vAxS8DKFrFWDM3VamR+TydspbwJXVzLlzQqp6YhDQ6hn57PHboFIsPzk0bqXZM35hoxJel0cUYtKeWozhSMTPM33z64gaJxdK9~3228467~3552069; bm_sv=B37CB117C690C63AF1B281E3F1FB7936~YAAQV3FHG5ZaSTKGAQAAJeAfghJI7Zv+G3Nn7w+tDDx4bWhsOYDLKaMLoK3dgdLlc25M2ZJnDavQg0/3+TAgXxK03C3zuu87Guv5/2oFFvOcToAihw0V+Tiw3hu2lQhJ0xJLDitZMvoK9dXfhhKgeKfuU5rbMdOGKKTVcpj8t9u2cA/GOullxpy9e/VQNAeqW1+RbdvdRy9rpEkLZGZJeI0VWNDcXP4CsbVWRJYlzjY33nG5I/NNkRU1SMPhGRyhc2+nCw==~1'`;

let domainsInQueueCount = 0;
let failedRequestCount = 0;
let successfulRequestCount = 0;

(async () => {
  const { cheerioCrawlerOptions } = config.get("crawlerOptions");
  const domains = [...config.get("domains")];
  const handledDomains = [...config.get("handledDomains")];
  const unhandledDomains = domains.filter((domain) => {
    const url = `https://www.similarweb.com/website/${domain}/`;
    return !handledDomains.some((_domain) => _domain === url);
  });
  console.log(domains.length);
  console.log(handledDomains.length);
  console.log("Check:: " + unhandledDomains.length);
  let proxies = config.get("proxies");

  const crawler = new Crawler({
    typeOfCrawler: Crawler.CHEERIO,
    proxies: [...proxies],
    crawlerOptions: {
      ...cheerioCrawlerOptions,
      additionalMimeTypes: ["application/octet-stream", "text/plain"],
      keepAlive: true,
      maxConcurrency: 1,
      maxRequestRetries: 0,
      maxRequestsPerCrawl: 0,
      maxRequestsPerMinute: 50,
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
    const _domains = unhandledDomains.splice(0, 25);
    console.log(
      `Domains in queue: ${(domainsInQueueCount += _domains.length)}`
    );
    await crawler.addRequests(
      _domains.map((domain) =>
        createRequest({
          url: `https://pro.similarweb.com/api/WebsiteOverview/getheader?keys=${domain}&mainDomainOnly=true&includeCrossData=true`,
          headers: {
            Cookie: cookies,
          },
          userData: {
            domain,
          },
        })
      )
    );
  }, 30_000);
})();

function failedRequestHandler() {
  return function ({ log, request, proxyInfo }) {
    const error = `${request.errorMessages[0]}`;
    log.error(error);
    log.info(`Failed request count: ${++failedRequestCount}`);
    if (error.includes("Proxy")) {
      fs.appendFileSync(
        "results/similarweb.com/failed_proxies.txt",
        `'${proxyInfo.url}',\n`,
        {
          encoding: "utf-8",
        }
      );
    }
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
  const router = createCheerioRouter();

  router.addDefaultHandler(async ({ body, log, request, response, json }) => {
    const { domain } = request.userData;
    const rank = json[domain].highestTrafficCountryRanking;
    let filePath = "results/similarweb.com/successful_results/";
    let content = `'https://www.similarweb.com/website/${domain}/',`;
    if (rank > 0) {
      filePath += "ranked_domains.txt";
      content += rank;
    } else {
      filePath += "unranked_domains.txt";
    }
    fs.appendFileSync(filePath, `${content}\n`, {
      encoding: "utf-8",
    });
    log.info(`Successful request count: ${++successfulRequestCount}`);
  });

  return router;
}

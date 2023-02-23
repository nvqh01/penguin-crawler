const HttpCrawlerOptions = require("./http-crawler-options");

class CheerioCrawlerOptions extends HttpCrawlerOptions {
  constructor(options = {}) {
    super(options);
  }

  getOptions(_options = {}) {
    let options = super.getOptions(_options);

    return options;
  }
}

module.exports = CheerioCrawlerOptions;

const HttpCrawlerOptions = require("./http-crawler-options");

class JSDOMCrawlerOptions extends HttpCrawlerOptions {
  constructor(options = {}) {
    super(options);
  }

  getOptions(_options = {}) {
    let options = super.getOptions(_options);

    options = {
      ...this.options,
      hideInternalConsole: this.options?.hideInternalConsole || false,
      runScripts: this.options?.runScripts || false,
    };

    return options;
  }
}

module.exports = JSDOMCrawlerOptions;

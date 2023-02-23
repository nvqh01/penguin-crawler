class BasicCrawlerOptions {
  constructor(options = {}) {
    this.options = options;
  }

  getOptions(_options = {}) {
    this.options = { ...this.options, ..._options };

    if (!this.options?.failedRequestHandler)
      throw new Error(
        'Please supply method "failedRequestHandler" into crawler options.'
      );

    if (!this.options?.requestHandler)
      throw new Error(
        'Please supply method "requestHandler" into crawler options.'
      );

    const options = {
      autoscaledPoolOptions: { ...(this.options?.autoscaledPoolOptions || {}) },
      failedRequestHandler: this.options?.failedRequestHandler,
      keepAlive: this.options?.keepAlive || false,
      maxConcurrency: this.options?.maxConcurrency || 100,
      maxRequestRetries: this.options?.maxRequestRetries ?? 3,
      maxRequestsPerCrawl: this.options?.maxRequestsPerCrawl ?? 10_000,
      maxRequestsPerMinute: this.options?.maxRequestsPerMinute || 200,
      minConcurrency: this.options?.minConcurrency || 1,
      requestHandler: this.options?.requestHandler,
      requestHandlerTimeoutSecs: this.options?.requestHandlerTimeoutSecs || 60,
      sessionPoolOptions: {
        blockedStatusCodes: [401, 403, 429, 500],
        maxPoolSize: 1000,
        ...(this.options?.sessionPoolOptions || {}),
        sessionOptions: {
          maxAgeSecs: 3000,
          maxUsageCount: 25,
          ...(this.options?.sessionPoolOptions?.sessionOptions || {}),
        },
      },
      useSessionPool: this.options?.useSessionPool || false,
    };

    if (this.options?.errorHandler)
      options.errorHandler = this.options.errorHandler;

    return options;
  }
}

module.exports = BasicCrawlerOptions;

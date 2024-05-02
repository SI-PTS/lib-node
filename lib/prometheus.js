// https://community.tibco.com/wiki/monitoring-your-nodejs-apps-prometheus

const Register = require('prom-client').register,
      Counter = require('prom-client').Counter,
      Histogram = require('prom-client').Histogram,
      Summary = require('prom-client').Summary,
      ResponseTime = require('response-time');

var config;
try {
    /**
     * The lib-node git sub module must be located at my-project/lib-node;
     * otherwise, requiring ../../config will result in an error.
     */
    config = require('../../config')
} catch (e) {
    console.log(`Unable to include lib/config.js; make sure to clone lib-node as a git sub module at ROOT/lib-node.`)
    throw e
}

let _prefix = config.prometheus.prefix.replace(/_+$/,''),
    _metrics_path = config.prometheus.endpoint.replace(/\/\/+/,'/');

/**
 * A Prometheus counter that counts the invocations of the different HTTP verbs
 * e.g. a GET and a POST call will be counted as 2 different calls
 */
module.exports.requests_total = requests_total = new Counter({
    name: `${_prefix}_requests_total`,
    help: 'Number of requests made',
    labelNames: ['method']
});

/**
 * A Prometheus counter that counts the invocations with different paths
 * e.g. /foo and /bar will be counted as 2 different paths
 */
module.exports.paths_total = paths_total = new Counter({
    name: `${_prefix}_paths_total`,
    help: 'Paths taken in the app',
    labelNames: ['path']
});

/**
 * A Prometheus summary to record the HTTP method, path, response code and response time
 */
module.exports.request_duration_seconds = request_duration_seconds = new Summary({
    name: `${_prefix}_request_duration_seconds`,
    help: 'Request duration in seconds',
    labelNames: ['method', 'path', 'status']
});

/**
 * This funtion will start the collection of metrics and should be called from within in the main js file
 */
module.exports.startCollection = function () {
    require('prom-client').collectDefaultMetrics()
};

/**
 * This function increments the counters that are executed on the request side of an invocation
 * Currently it increments the counters for numOfPaths and pathsTaken
 */
module.exports.count_requests = function (req, res, next) {
    if (req.path() != _metrics_path) {
        requests_total.inc({ method: req.method });
        paths_total.inc({ path: req.path() });
    }
    next();
}

/**
 * This function increments the counters that are executed on the response side of an invocation
 * Currently it updates the responses summary
 */
module.exports.time_requests = ResponseTime(function (req, res, time) {
    if (req.path() != _metrics_path) {
        request_duration_seconds.labels(req.method, req.path(), res.statusCode).observe(time/1000);
    }
})

/**
 * In order to have Prometheus get the data from this app a specific URL is registered
 */
module.exports.injectMetricsRoute = function (app) {
    app.get(_metrics_path, (req, res, next) => {
        res.set('Content-Type', Register.contentType);
        res.end(Register.metrics());
    });
};

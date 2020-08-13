var express = require('express');
var exphbs  = require('express-handlebars');
var app = express();
var os = require("os");
var morgan  = require('morgan');

const Prometheus = require('prom-client')

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static('static'));
app.use(morgan('combined'));

// Prometheus configs taken from https://github.com/RisingStack/example-prometheus-nodejs/blob/master/src/server.js
const metricsInterval = Prometheus.collectDefaultMetrics()

const httpRequestDurationMicroseconds = new Prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500]  // buckets for response time from 0.1ms to 500ms
})

// Configuration
var port = process.env.PORT || 8080;
var message = process.env.MESSAGE || "Hello world!";

app.get('/', function (req, res) {
    res.render('home', {
      message: message,
      platform: os.type(),
      release: os.release(),
      hostName: os.hostname()
    });
});

// Set up listener
app.listen(port, function () {
  console.log("Listening on: http://%s:%s", os.hostname(), port);
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', Prometheus.register.contentType)
  res.end(Prometheus.register.metrics())
})
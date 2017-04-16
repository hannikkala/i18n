const express = require('express');
const path = require('path');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer();
const app = express();

const port = process.env.UI_PORT ? process.env.UI_PORT : 9000;
const publicPath = path.resolve(__dirname, 'dist');

app.use(express.static(publicPath));

  // Any requests to localhost:3000/api is proxied
// to webpack-dev-server
app.all('/api/*', function (req, res) {
  proxy.web(req, res, {
    target: 'http://localhost:3000'
  });
});

// It is important to catch any errors from the proxy or the
// server will crash. An example of this is connecting to the
// server when webpack is bundling
proxy.on('error', function(e) {
  console.log('Could not connect to proxy, please try again...');
});

app.listen(port, function () {
  console.log('Server running on port ' + port);
});
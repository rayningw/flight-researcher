var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/api/v1/airport_pairs', function(req, res) {
  var pairs = JSON.parse(fs.readFileSync('data/airport_pairs.json'));
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({
    rows: pairs
  }));
});

app.get('/api/v1/date_pairs', function(req, res) {
  var pairs = JSON.parse(fs.readFileSync('data/date_pairs.json'));
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({
    rows: pairs
  }));
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});


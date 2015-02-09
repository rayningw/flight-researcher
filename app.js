var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

function addPairHandlers(url, jsonFile) {
  app.get(url, function(req, res) {
    console.log('Reading: ' + jsonFile);
    var pairs = JSON.parse(fs.readFileSync(jsonFile));
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      rows: pairs
    }));
  });

  app.post(url, function(req, res) {
    console.log('Writing: ' + jsonFile);
    var pairs = req.body.rows;
    console.log('Body: ' + JSON.stringify(pairs));
    fs.writeFile(jsonFile, JSON.stringify(pairs));
    res.send();
  });
}

addPairHandlers('/api/v1/airport_pairs', 'data/airport_pairs.json');
addPairHandlers('/api/v1/date_pairs', 'data/date_pairs.json');

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});


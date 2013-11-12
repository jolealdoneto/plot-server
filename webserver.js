var express = require("express"),
    app = express(),
    plot = require('./plot-server.js'),
    tado = require('./tado');

/* serves main page */
app.get("/", function(req, res) {
   res.sendfile('index.htm')
});


app.all('*', function setAccessControl(req, res, next) {
    res.set( { 'Access-Control-Allow-Origin': '*' });
    next();
});
app.get("/mobile/1.3/getTemperaturePlotData", function(req, res) { 
    var query = req.query;
    plot.getCurve(query).then(function(json) {
        json['success'] = true;
        res.json(200, json);
        res.end();
    })
    .catch(function(e) {
        console.log(e.stack);
    });
});
app.get("/mobile/1.3/:connector", function(req, res) { 
    tado.get(req.params.connector, req.query).then(function(response) {
        var serverRes = response[0],
            d = JSON.parse(response[1]);

        res.json(serverRes.statusCode, d);
        return res.end();
    })
    .catch(function(e) {
        console.log(e.stack);
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

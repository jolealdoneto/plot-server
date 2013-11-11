var express = require("express"),
    app = express(),
    plot = require('./plot-server.js');
    
app.get("/mobile/1.3/getTemperaturePlotData", function(req, res) {
    console.log("KJHSAKJDHKJSAK");
    res.send('YES')
});

/* serves main page */
app.get("/", function(req, res) {
   res.sendfile('index.htm')
});

app.get("/pPlotData", function(req, res) { 
    var query = req.query;
    plot.getCurve(query).then(function(json) {
        console.log('DONE');
        res.send(json);
    })
    .catch(function(e) {
        console.log(e.stack);
    });
});

/* serves all the static files */
app.get(/^(.+)$/, function(req, res){ 
    console.log('static file request : ' + req.params);
    res.sendfile( __dirname + req.params[0]); 
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

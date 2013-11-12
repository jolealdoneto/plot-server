var Q = require('q'),
    querystring = require('querystring'),
    http = require('http');

http.globalAgent.maxSockets = 20;

function get(connector, params) {
    var defer = Q.defer();

    var get_params = querystring.stringify(params),
        options = {
      host: 'cidevelop.tado.com',
      port: 80,
      path: ('/mobile/1.3/' + connector + '?' + get_params),
      method: 'GET'
    };

    var req = http.request(options, function(res) {
        var responseString = '';
        res.on('data', function(d) {
            responseString += d;
        });
        res.on('end', function() {
            defer.resolve([res, responseString]);
        });
    });

    req.end();

    req.on('error', function(e) {
        console.log('error');
        defer.reject(e);
    });

    return defer.promise;
}

module.exports = {
    getTemperaturePlotData: function(fromDate, toDate, username, password) {
        return get('getTemperaturePlotData', {
            username: username,
            password: password,
            fromDate: fromDate,
            toDate: toDate,
            noCache: Math.random() * (new Date()).getTime()
        }).then(function(response) {
            var a = response[1].toString(),
                res = response[0];

            return JSON.parse(a);
        });
    },
    get: get
};

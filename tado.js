var Q = require('q'),
    querystring = require('querystring'),
    http = require('http');

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
        console.log(res.statusCode);
        res.on('data', function(d) {
            defer.resolve(d);
        });
    });

    req.end();

    req.on('error', function(e) {
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
        });
    }
};

var timezoneJS = require('./lib/timezone-js/src/date.js'),
    timezones = require('./lib/tz/major_cities.json');

var _tz = timezoneJS.timezone;
_tz.loadingScheme = _tz.loadingSchemes.MANUAL_LOAD;
_tz.loadZoneDataFromObject(timezones, true);
_tz.init();

module.exports = timezoneJS;

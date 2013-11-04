var timezoneJS = require('./date.js');

function normalizeDate(dateStringInRange) {
    //return new timezoneJS.Date(dateStringInRange);
    // 2013-03-12T09:16:54.432Z
    /*
    This code does not care about timezone and creates date in current browser timezone!
    */
    var isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d).*$/,
        date = new Date(NaN),
        parts = isoExp.exec(dateStringInRange);

    if(parts) {
      month = +parts[2];
      date = new Date(Date.UTC(parts[1], month - 1, parts[3], parts[4], parts[5], parts[6], 0));
    }
    else {
      date = new Date(dateStringInRange);
    }
    // ok, now I have a valid date parsed by this function.
    // I just feed it to the timezone JS lib
    return new timezoneJS.Date(date);
}
function convertGivenDateToHome(date) {
   var datetz = null;
   if(date instanceof timezoneJS.Date) {
      datetz = date;
   } else if(date instanceof Date) {
      datetz = new timezoneJS.Date(date);
   } else {
      // let's now work on the timestamp
      // 2012-09-19T19:20:30.45Z
      var tt = date.split("T");
      date = tt[0].split('-'); // split everything, because of the stupid US time way MM/dd/yyyy that I have to pass to the lib
      date = date[1]+"/"+date[2]+"/"+date[0]; // reconstruct, now I have MM/dd/yyyy
      var mtime = tt[1].substring(0, 5); // now I have 20:00
      // stich them together putting the date as UTC value
      datetz = new timezoneJS.Date(date + " " + mtime + ":00 +0000", "Etc/UTC");
   }

   // now set the date to the HOME timezone
   datetz.setTimezone('Europe/Berlin');
   return datetz;
}

// Convert the date to the current HOME timezone date
function convertDateToHome(date, format) {
   format =  format || "HH:mm";
   var datetz = convertGivenDateToHome(date);
   // and return the date in the correct form
   return datetz.toString(format);
}

module.exports = {
    normalizeDate: normalizeDate,
    convertGivenDateToHome: convertGivenDateToHome,
    convertDateToHome: convertDateToHome
};

var common = require('./common.js'),
    tado = require('./tado.js');

// TODO: TEST
(function(module, undefined) {
   function getAnchors(p1x, p1y, p2x, p2y, p3x, p3y) {
      var l1 = (p2x - p1x) / 2,
         l2 = (p3x - p2x) / 2,
         a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y)),
         b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));
      console.log(p2x);
      a = p1y < p2y ? Math.PI - a : a;
      b = p3y < p2y ? Math.PI - b : b;
      var alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2,
         dx1 = l1 * Math.sin(alpha + a),
         dy1 = l1 * Math.cos(alpha + a),
         dx2 = l2 * Math.sin(alpha + b),
         dy2 = l2 * Math.cos(alpha + b);
      return {
         x1: p2x - dx1,
         y1: p2y + dy1,
         x2: p2x + dx2,
         y2: p2y + dy2
      };
   }

   var HOUR_DAY_TRESHOLD = 36 * 60 * 60 * 1000, // 36h
       SUN_INTENSITY_TRESHOLD = 40,
       NOTIFICATION_BUTTON_SIZE = 40,
       GRAPH_OFFSET = function() {
           return { top: calcWithCoeficient(0.85), bottom: calcWithCoeficient(2), left: calcWithCoeficient(2.5), right: calcWithCoeficient(0.2), axisXLabel: calcWithCoeficient(0.7), axisYLabel: calcWithCoeficient(1), axisYLine: calcWithCoeficient(1.7)};
       },
       HEATING_OFF_STYLE = {opacity: 0.8, fill: 'rgba(195, 234, 250, 0.8)' },
       HEATING_ON_STYLE = {opacity: 0.9, fill: 'rgba(86,195,241, 0.8)' },
       MAX_NUM_YAXIS = 5;

   var defaultOptions = {
       events: {
          ICONS: {
             'tado-icon-away': "\e034",
             'tado-icon-home': "\e02e",
             'tado-icon-sleep': "\e01d",
             'tado-icon-coffee': "\e031",
             'tado-icon-sleep-scheduled': "\e04b",
             'tado-icon-away-scheduled': "\e04d",
             'tado-icon-home-scheduled': "\e04c",
             'tado-icon-hand': "\e02f",
             'tado-icon-manualoff': "\e028",
             'tado-icon-manualhome': "\e029",
             'tado-icon-settings': "\e01e",
             'tado-icon-leaf': "\e02c",
             'tado-icon-middle2': "\e026",
             'tado-icon-person': "\e023",
             'tado-icon-standby': "\e01b",
             "tado-icon-standby-off": "\e04a",
             'tado-icon-attention': "\e035",
             'tado-icon-reward': "\e01f",
             'tado-icon-info': "\e02d",
             'tado-icon-box-not-connected': "\e049",
             'tado-icon-protected': "\e03b",
             'tado-icon-sun': "\e01a",
             'tado-icon-thermometer': "\e042",
             'tado-icon-calendar': "\e033"
          },
          STYLE: {
             DEFAULT: {
                fill: 'gradient',
                iconColor: '#ffffff',
                lineWidth: 2,
                circle: true,
                topOffset: 0
             },
             HOME: {
                colorStops: {
                   1: '#ffa100',
                   0: '#f7cd00'
                }
             },
             'AWAY': {
                colorStops: {
                   1: '#408c05',
                   0: '#77c014'
                }
             },
             'SLEEP': {
                colorStops: {
                   1: '#024791',
                   0: '#0083c0'
                }
             },
             'MANUAL': {
                colorStops: {
                   1: '#656466',
                   0: '#c4c3c4'
                }
             },
             'NO_FREEZE': {
                colorStops: {
                   1: '#ffd908',
                   0: '#ffe358'
                }
             },
             'NO_INTERNET': {
                colorStops: {
                   1: '#767676',
                   0: '#767676'
                }
             },
             SETTINGS: {
                fill: '#f6f6f6',
                iconColor: '#787878',
                lineColor: '#c8c8c8',
                lineWidth: 1,
                topOffset: 70,
                message: { fill: "#fff", /*strokeWidth: 1, stroke: '#c5c5c5',*/ textColor: '#787878'}
             },
             NO_CONNECTION: {
                fill: '#ffffff',
                iconColor: '#767676',
                lineColor: '#767676',
                lineWidth: 1,
                circle: false
             },
             PRIVATE: {
                colorStops: {
                   1: '#656466',
                   0: '#c4c3c4'
                },
                iconColor: '#767676',
                lineColor: '#767676',
                lineWidth: 1,
                circle: false,
                message: { fill: "#656466", /*strokeWidth: 1, stroke: '#c5c5c5',*/ textColor: '#fff'}
             }
          }
       },
       width: 600,
       height: 300,
       labelStyle: {fontSize: 12, fontFamily: 'Helvetica', fill: "#CDCDCD"},
       axisStyle: {strokeWidth: 1, fill: '#E0E0E0', opacity: 1},
       eventLineStyle: {stroke: '#ff0000', "stroke-width": 3, opacity: 1},
       eventIconStyle: {font: '12px tadoicons', fill: "#ff0000"},
       lineStyle: {},
       backgroundStyle: {
          sun: {
             normal: {
                gradient: {
                   x1: 1,
                   y1: 0,
                   x2: 1,
                   y2: 100,
                   colorStops: {
                      0: 'rgba(255,255,255, 0.4)',
                      1: 'rgba(255,255,255, 0.1)'
                   }
                }
             },
             toggled: {
                gradient: {
                   x1: 1,
                   y1: 0,
                   x2: 1,
                   y2: 100,
                   colorStops: {
                      0: 'rgba(255,252, 194, 0.4)',
                      1: 'rgba(255,255,255, 0.1)'
                   }
                },
                rect: {
                   fill: '#f9e462',
                   stroke: null
                }
             }
          }
       },
       globalBackgroundStyle: [
          {stroke: "none", bgOpacity: 0.3, fill: '90-#fff-#f00:20-#000'}
       ],
       globalLineStyle: [
          {stroke: '#19B0F2', "stroke-width": 1, "stroke-linejoin": "round", opacity: 1}
       ],
       globalLineEasing: 'C', // L or C or T
       lineEasing: {},
       axisY: [],
       fromTop: {},
       dayLineStyle: {
          stroke: '#808080',
          fill: '#808080',
          strokeWidth: 1
       },
       showDayLine: true,
       globalOutline: false,
       page: 0,
       initialScale: 1,
       toggled: false,
       showWholeXAxis: false,
       offset: {top: 10, bottom: 20, left: 40, right: 10, axisXLabel: 10, axisYLabel: 20, axisYLine: 30},
       sunElementsToggled: false,
       circleOverlapFactor: 1,
       bindClick: true,
       bindMove: false,
       clipNotifications: false,
       loadingImage: 'css/images/spinner.png',
       notificationTextPadding: 15,
       notificationTextBoxGradient: false,
       notificationTextBoxStyle: {},
       notificationTextStyle: {}
   };
   function createToDateFromResolution(fromDate, resolution) {
      var result = fromDate.clone();
      result.setHours(result.getHours() + resolution);
      console.log(result);
      return result;
   };
   function extend(a, b){
       for(var key in b) {
           if(b.hasOwnProperty(key)) {
               a[key] = b[key];
           }
       }
       return a;
   }
   function truncate(x) {
       if (!isNaN(x)) {
           return trunc(x);
       }
       else if (typeof x === 'object') {
           var resObj = {};
           for (var key in x) {
               if (x.hasOwnProperty(key)) {
                   resObj[key] = trunc(x[key]);
               }
           }
           return resObj;
       }
       else {
           return trunc(parseFloat(x, 10));
       }
       ////////////
       function trunc(x) { return Math.floor(x*100)/100; };
   }
   function dateToZulu(date) {
       return date.toString('yyyy-MM-ddTHH:mm:ss.000')+'Z';
   }

   function preprocessData(data, options) {
       var model = getDataFromModel(data),
           plotData = preprocessPlotData(model.plotData),
           resObj = {};


       if (plotData != undefined) {
           // Predicates for line generating
           var noConnection = function (value) {
              for(var i = 0; i < model.noConnection.length; i++) {
                 var noConnection = model.noConnection[i];
                 if(value.timestamp <= noConnection.start && (!value.nextValue || value.nextValue.timestamp >= noConnection.end)) {
                    return true;
                 }
              }
              return false;
           };

           var noConnectionPeakFilter = function (value) {
              for(var i = 0; i < model.noConnection.length; i++) {
                 var noConnectionEnd = model.noConnection[i].end;
                 var noConnectionGap = noConnectionEnd + options.noConnectionPeakTime;
                 if(value.timestamp >= noConnectionEnd && value.timestamp < noConnectionGap) {
                    return false;
                 }
              }
              return true;
           };

           var privacyEnabled = function (value) {
              return value.thermostatOperation == 'UNDEFINED';
           };

           var temperatureLines = generateLines(plotData,
              function (value) {
                 return !privacyEnabled(value) && noConnectionPeakFilter(value);
              },
              function (value) {
                 return noConnection(value) || privacyEnabled(value);
              }
           );

           var heatingLines = generateLines(plotData,
              function (value) {
                 return !privacyEnabled(value) && noConnectionPeakFilter(value) && (value.heatingOn || (value.previousValue != null && value.previousValue.heatingOn));
              },
              function (value) {
                 return noConnection(value) || privacyEnabled(value) || !value.heatingOn;
              }
           );

           var sunLines = generateLines(plotData,
              function (value) {
                 return value.sunOn; // || (value.previousValue != null && value.previousValue.sunOn);
              },
              function (value) {
                 return !value.sunOn;
              }
           );

           var axisWidth = Math.max(1, options.width);
           var xScale = model.dataConstraints.maxTimestamp - model.dataConstraints.minTimestamp;
           var axisX = [];
           var time = common.normalizeDate(model.dataConstraints.minTimestamp);
           time.setMinutes(0);
           time.setSeconds(0);
           model.dataConstraints.minTimestamp = time.getTime();

           var maxTime = time.clone();
           maxTime.setHours(maxTime.getHours() + options.resolution);
           model.dataConstraints.maxTimestamp = maxTime.getTime();


           if (xScale < HOUR_DAY_TRESHOLD) {
              var labelHourOffset = 1;
              var xHourScale = xScale / (1000 * 60 * 60);
              var maxTries = 10;
              while (axisWidth / (xHourScale / labelHourOffset) < 20) {
                 labelHourOffset++;
                 if(maxTries-- < 0)
                    break;
              }
              time.setMinutes(30);
              while (time.getTime() < model.dataConstraints.maxTimestamp) {
                 var lastTime = time.getTime();
                 var t = {x: lastTime, label: common.convertDateToHome(time, 'H')};
                 axisX.push(t);
                 var addedHours = 0;
                 while(lastTime == time.getTime()) {
                    time.setHours(time.getHours() + labelHourOffset + addedHours++);
                 }
              }
           } else {
              time.setHours(12, 0, 0, 0);
              while (time.getTime() < model.dataConstraints.maxTimestamp) {
                 axisX.push({x: time.getTime(), label: common.convertDateToHome(time, 'd') +" " + i18n['weekday-'+(time.getDay()+1)]});
                 time.setHours(time.getHours() + 24);
              }
           }
           var axisY = [];
           var temperature = Math.floor(model.dataConstraints.minInsideTemperature),
               tempJump = (Math.floor(model.dataConstraints.maxInsideTemperature) - temperature) / (MAX_NUM_YAXIS-1);
           for (var i = 0; i < MAX_NUM_YAXIS; i++) {
               temperature = pushToAxis(temperature, tempJump, axisY);
           }

           resObj = { line: [], lineData: {}, fromTop: {}, axisY: axisY, axisX: axisX };
           addLinesToPlot(resObj, 'temperature', temperatureLines/*, settings.temperatureCurveStyle, settings.outlineStyle*/);
           addLinesToPlot(resObj, 'heating', heatingLines/*, settings.heatingOnStyle*/);
           addLinesToPlot(resObj, 'sun', sunLines, /*settings.sunStyle, null,*/ true);
       }

       resObj['minY'] = model.dataConstraints.minInsideTemperature;
       resObj['maxY'] = model.dataConstraints.maxInsideTemperature;
       resObj['minX'] = model.dataConstraints.minTimestamp;
       resObj['maxX'] = model.dataConstraints.maxTimestamp;

       return resObj;

       /////////////////////////

       // Add lines to plot
       function addLinesToPlot(plot, name, lines, /*backgroundStyle, lineStyle,*/ fromTop) {
          for (var i = 0; i < lines.length; i++) {
             var line = lines[i];
             if (line.length > 0) {
                var lineName = name + i;
                plot.line.push(lineName);
                plot.lineData[lineName] = line;
                //plot.backgroundStyle[lineName] = backgroundStyle;
                //if (angular.isDefined(lineStyle) && lineStyle != null)
                //   plot.lineStyle[lineName] = lineStyle;
                if (fromTop)
                   plot.fromTop[lineName] = fromTop;
             }
          }
       }
       function createToDate(fromDate) {
          return createToDateFromResolution(fromDate, options.resolution);
       };
       // transform data simply into a more readable model
       function getDataFromModel(data) {
          var temp = {};
          temp.plotdata = data.plotdata;
          temp.minInsideTemperature = data.minInsideTemperature;
          temp.maxInsideTemperature = data.maxInsideTemperature;
          temp.dayStatistics = data.dayStatistics;
          temp.noConnection = data.noConnection;
          temp.privacy = data.privacy;

          var modelValue = {};
          modelValue = {
             temperaturePlotData: temp.plotdata,
             //heatingIntervals: createHeatingIntervals(temp.plotdata),
             minInsideTemperature: Math.floor(temp.minInsideTemperature),
             maxInsideTemperature: Math.ceil(temp.maxInsideTemperature),
             dayStatistics: temp.dayStatistics,
             minTimestamp: options.fromDate.getTime(),
             maxTimestamp: createToDate(options.fromDate).getTime(),
             noConnection: temp.noConnection,
             privacy: temp.privacy
          };


          if (modelValue == undefined ||
             modelValue.temperaturePlotData == undefined) {
             return null;
          }

          var noConnection = [];
          for (var i = 0; i < modelValue.noConnection.length; i++) {
             var value = modelValue.noConnection[i];

             noConnection.push({
                start: common.normalizeDate(value.start).getTime(),
                end: common.normalizeDate(value.end).getTime()
             });
          };

          var privacy = [];
          for (var i = 0; i < modelValue.privacy.length; i++) {
             var value = modelValue.privacy[i];
             if (value != null) {
                 privacy.push({
                    start: common.normalizeDate(value.start).getTime(),
                    end: common.normalizeDate(value.end).getTime()
                 });
             }
          };

          return {
             resolution: modelValue.resolution,
             plotData: modelValue.temperaturePlotData,
             dataConstraints: {
                minInsideTemperature: modelValue.minInsideTemperature,
                maxInsideTemperature: modelValue.maxInsideTemperature,
                minTimestamp: modelValue.minTimestamp,
                maxTimestamp: modelValue.maxTimestamp
             },
             noConnection: noConnection,
             privacy: privacy
          };
       };


       // Generate the lines according to the function
       function generateLines(plotData, addPoint, newLine) {
          var data = [];
          var dataLines = [data];

          for (var i = 0; i < plotData.length; i++) {
             var value = plotData[i];

             if (addPoint(value)) {
                data.push(value.point);
             }
             if(data.length > 0 && newLine(value)) {
                data = [];
                dataLines.push(data);
             }
          }

          return dataLines;
       };

       // Process all the data before sending it to the real plotting
       function preprocessPlotData(plotData) {
           var result = [];
           var previousValue = null;
           for (var i = 0; i < plotData.length; i++) {
              var value = plotData[i];

              var timestamp = common.normalizeDate(value.timestamp).getTime();
              var processedValue = {
                 timestamp: timestamp,
                 insideTemperature: value.insideTemperature,
                 heatingOn: value.heatingOn,
                 sunOn: value.virtSolarIntensity > options.sunIntensityThreshold,
                 controlPhase: value.txControlPhase,
                 thermostatOperation: value.thermostatOperation,
                 point: {
                    x: timestamp,
                    y: value.insideTemperature
                 },
                 nextValue: null,
                 previousValue: previousValue
              };

              result.push(processedValue);

              if (previousValue != null)
                 previousValue.nextValue = processedValue;

              previousValue = processedValue;
           }
           return result;
       };
       function pushToAxis(temperature, tempJump, axisY) {
          axisY.push({y: temperature, label: Math.round(temperature * 10) / 10 + '°'});
          return temperature + tempJump;
       }
   }



   function scalePointGivenX(x, minX, dataXScale) {
       return (x - minX) * dataXScale;
   }
   function scalePointGivenY(y, minY, dataYScale, height) {
       return Math.floor(height - (y - minY) * dataYScale);
   }

   function mainTemperatureCurve(options) {
       var defaultOpt = {
           line : [],
           easing: 'C',
           height: 0,
           width: 0
       };
       options = extend(defaultOpt, options);

       options.dataXScale = options.width / (options.maxX - options.minX);
       options.dataYScale = options.height / (options.maxY - options.minY);

       // set starting point and the very initial common path
       var line = options.line,
           startingPoint = [scaleX(options.line[0].x, false), scaleY(line[0].y)],
           initialPath = ['M'].concat(startingPoint),
           path = [], linesArray = [],
           i = line.length,
           lastY;

       for (var i  = 0; i < line.length; i++) {
           var dataPoint = line[i],
               y = scaleY(line[i].y),
               x = scaleX(line[i].x),
               localPath = null;

           if (options.easing == 'C') {
               if (i && i < line.length - 1) {
                   var Y0 = scaleY(line[i - 1].y),
                      X0 = scaleX(line[i - 1].x),
                      Y2 = scaleY(line[i + 1].y),
                      X2 = scaleX(line[i + 1].x);
                   var a = truncate(getAnchors(X0, Y0, x, y, X2, Y2));
                   localPath = [a.x1, a.y1, x, y, a.x2, a.y2];
               } else if (i == line.length - 1) {
                   localPath = [x, y, x, y];
               }
           }
           else {
               localPath = [x, y];
           }

           if (localPath != null) {
              localPath = [options.easing].concat(localPath);
              path.push(localPath);
           }
       }
       lastY = scaleY(line[line.length - 1].y);
       path.push(['L', scaleX(line[line.length - 1].x), lastY]);
       var scaledMinY = scaleY(options.minY);
       var bg = [
           ['M', scaleX(line[0].x), scaledMinY],
           ['L'].concat(startingPoint)
       ].concat(path, [
           ['L', scaleX(line[line.length - 1].x), scaledMinY, 'Z']
       ]);

       return bg;
       ////////////////////////

       function scaleX(x) { return truncate(scalePointGivenX(x, options.minX, options.dataXScale)); }
       function scaleY(y) { return truncate(scalePointGivenY(y, options.minY, options.dataYScale, options.height)); }
   }


   //var opt = {};
   //opt.height = 515 - 101 + 42;
   //opt.width = 960 - 126 - 10;
   //var res = preprocessData(rawdata, { resolution: 24, width: opt.width, fromDate: common.normalizeDate("2013-11-10T23:00:00.000Z"), sunIntensityThreshold: 40, noConnectionPeakTime: (15 * 60 * 1000) });
   //opt.minY = res.minY;
   //opt.maxY = res.maxY;
   //opt.minX = res.minX;
   //opt.maxX = res.maxX;

   //opt.line = res.lineData['temperature0'];
   //console.log(mainTemperatureCurve(opt));
   //
   //
   module.exports = {
       /*
        * Params:
        *   height
        *   width
        *   resolution
        *   fromDate (zulu)
        *   username
        *   password
        * */
       getCurve: function(params) {
           // get toDate from resolution
           var fromDate = common.normalizeDate(params.fromDate),
               toDate = createToDateFromResolution(fromDate, 24);
           return tado.getTemperaturePlotData(fromDate.toISOString(), toDate.toISOString(), params.username, params.password)
           // Preprocess it before with the right data
           .then(function(rawdata) {
               var opt = {
                   height: params.height,
                   width: params.width,
               };
               console.log(opt);
               var res = preprocessData(rawdata, { resolution: 24, width: params.width, fromDate: common.normalizeDate(params.fromDate), sunIntensityThreshold: 40, noConnectionPeakTime: (15 * 60 * 1000) });
               opt.minY = res.minY;
               opt.maxY = res.maxY;
               opt.minX = res.minX;
               opt.maxX = res.maxX;

               for (var i = 0; i < res.line.length; i++) {
                   opt.line = res.lineData[res.line[i]];
                   res.lineData[res.line[i]] = mainTemperatureCurve(opt);
               }

               return res;
           });
       }
   };
})(module);

'use strict';

var ClickHandler = require(process.cwd() + '/app/controllers/clickHandler.server.js');
var AirFareHandler = require(process.cwd() + '/app/controllers/airfareHandler.server.js');

module.exports = function (app, db) {
   var clickHandler = new ClickHandler(db);
   var airfareHandler = new AirFareHandler(db);

   app.route('/')
      .get(function (req, res) {
         res.sendFile(process.cwd() + '/public/index.html');
      });

   app.route('/api/clicks')
      .get(clickHandler.getClicks)
      .post(clickHandler.addClick)
      .delete(clickHandler.resetClicks);

  app.route('/api/fares')
      .post(airfareHandler.getFare);
}
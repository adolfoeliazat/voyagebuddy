'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var mongo = require('mongodb');
var routes = require('./app/routes/index.js');


var app = express();

mongo.connect('mongodb://localhost:27017/clementinejs', function (err, db) {

   if (err) {
      throw new Error('Database failed to connect!');
   } else {
      console.log('Successfully connected to MongoDB on port 27017.');
   }

   app.use('/public', express.static(process.cwd() + '/public'));
   app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
   // parse application/json
   app.use(bodyParser.json())


   routes(app, db);

   app.listen(2000, function () {
      console.log('Node.js listening on port 2000...');
   });

});

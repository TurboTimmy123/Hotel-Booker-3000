var express = require('express');
var router = express.Router();
var fs = require('fs');
var hotels = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

fs.readFile('data/hotels.json', 'utf8', function(err, data) {
  console.log("Reading from database...");
  hotels = JSON.parse(data);
});

router.get('/hotels.json', function(req, res) {
  console.log("GET hotels.json");

  //yes im deliberately lagging the request hahaha xDDDDD
  setTimeout(function() {
    res.send(JSON.stringify(hotels));
  }, 500);
});

function donothing() {
  //woah
}

module.exports = router;
var express = require('express');
var router = express.Router();
var fs = require('fs');
var hotels = [];
accounts = [];

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

fs.readFile('data/accounts.json', 'utf8', function(err, data) {
  accounts = JSON.parse(data);
});

router.get('/hotels', function(req, res) {
  console.log("GET hotels.json");

  console.log("lat: " + req.param("lat"));
  console.log("lng: " + req.param("lng"));

  //yes im deliberately lagging the request hahaha xDDDDD
  setTimeout(function() {
    var temp = findHotelsInRadius(req.param("lat"), req.param("lng"));
    console.log("Length of hotel list: " + temp.length);
    res.send(JSON.stringify(temp));
  }, 500);
});

function donothing() {
  //woah
}

//given some coordinates, return an array containing hotels within this area
function findHotelsInRadius(lat, lng) {
  var hotelResponseArray = [];
  var maximumDistance = 100; //in km
  var temp; //unnecsary, just for debugging

  for (var i = 0; i < hotels.length; i++) {
    console.log("Centre: " + lat + " " + lng);
    console.log("Hotel: " + hotels[i].lat + " " + hotels[i].lng);

    temp = getDistanceFromLatLonInKm(lat, lng, hotels[i].lat, hotels[i].lng);
    console.log("Distance to hotel index: " + i + " is: " + temp);
    if (temp < maximumDistance) {
      hotelResponseArray.push(hotels[i]);
      console.log("Adding hotel: " + i);
    } else {
      console.log("Ommiting hotel: " + i);
    }
  }

  return hotelResponseArray;
}

router.post('/login', function(req, res) {
  console.log("Input Usename: " + req.param("username"));
  console.log("Input Password: " + req.param("password"));

  var index = -1;
  //please close your eyes for the next few lines thankx
  for (var i = 0; i < accounts.length; i++) {
    if (accounts[i].username == req.param("username")) {
      index = i;
    }
  }

  if (index == -1) {
    console.log("lol u fail no account found to login xD");
    //res.redirect('login.html');
    res.send("fail");
    return;
  } else {
    console.log("Found account at: " + index);
  }
  console.log("[DATABASE] Password: " + accounts[index].password);

  if (accounts[index].password == req.param("password")) {
    console.log("YAY! Creating session...");
    req.session.user = req.param("password");
    res.redirect('account.html');
  } else {
    console.log("lol u fail wrong password xD");
    res.redirect('login.html');
    return;
  }
});









//////////////////////////////////////////////////////////////
// THE FOLLOWING CODE IS NOT MINE, ALL CREDIT IS DUE HERE:
// https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
//////////////////////////////////////////////////////////////
//
// This simply given 2 coordinates will find the distance between them, so we can only return to the client the hotels within the area

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

////////////////// End of copy pasta

module.exports = router;

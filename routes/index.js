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

module.exports = router;
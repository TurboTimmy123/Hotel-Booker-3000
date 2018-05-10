var express = require('express');

var router = express.Router();
var fs = require('fs');
var handlebars = require('handlebars');

var CLIENT_ID = '739640612908-kagnds5o9pessmpuhbvui91h3j8cenj8.apps.googleusercontent.com';
var {
  OAuth2Client
} = require('google-auth-library');
var client = new OAuth2Client(CLIENT_ID);
var hotels = [];

// Handlebars templates
var navbar;
var listing;

// Accounts arrray, we load this from a file when the server starts
accounts = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express'
  });
  res.send("/public/index.html");
});

fs.readFile('data/hotels.json', 'utf8', function(err, data) {
  console.log("Reading from database...");
  hotels = JSON.parse(data);
});

fs.readFile('data/accounts.json', 'utf8', function(err, data) {
  accounts = JSON.parse(data);
});

// Handlebars template stuff
fs.readFile('public/includes/header.html', 'utf8', function(err, data) {
  navbar = data;
});

fs.readFile('public/includes/hotelListing.html', 'utf8', function(err, data) {
  listing = data;
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


router.get('/hotelListing', function(req, res) {
  console.log("HELLO?!??!?");
  var id = req.param("id");
  console.log("Generating hotel page for: " + id);
  console.log("Hotel name: " + hotels[id].name);
  console.log("listing html: " + listing);
  var template = handlebars.compile(listing);
  var data = {
    "name": hotels[id].name,
    "adress": hotels[id].Address,
    "price": hotels[id].price
  };

  var result = template(data);
  console.log("Done generating listing html, sending now yay!");
  res.send(result);
});

// Build the header account for guest/users
// For guests it gives them an option to login
// For signed in users, we show their name
// And instead have options to log out and stuff
router.get('/header', function(req, res) {
  console.log("Requested header");
  var template = handlebars.compile(navbar);

  if (req.session.user !== undefined) {
    console.log("Logged in user detected, generating html");
    var data = {
      "name": "Hi, " + req.session.user,
      "showWhenLogged": "block",
      "showWhenAnon": "none"
    };

    if (req.session.isGoogleSession == true) {
      data.logout = "googleSignOut()";
    } else {
      data.logout = "sendLogoutRequest()";
    }

    var result = template(data);
    res.send(result);
    return;
  } else {
    console.log("Guest user, sending standard header");
    var data = {
      "name": "Signin",
      "showWhenLogged": "none",
      "showWhenAnon": "block"
    };

    var result = template(data);
    res.send(result);
    return;
  }
});

// Very important function
function doNothing() {
  // woah
}

//given some coordinates, return an array containing hotels within that area of 50km
function findHotelsInRadius(lat, lng) {
  var hotelResponseArray = [];
  var maximumDistance = 50; //in km
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

// When the user registers for an account do this stuff
router.post('/register', function(req, res) {
  var newAccount;
  var theUsername = req.param("username");
  var thePassword = req.param("password");

  console.log("Creating new Account, Username: " + theUsername + " Password: " + thePassword);

  for (var i = 0; i < accounts.length; i++) {
    if (accounts[i].user == theUsername) {
      console.log("Username taken, try again");
      res.send("fail");
      return;
    }
  }

  // Much secure, very plaintext
  accounts.push({
    "username": theUsername,
    "password": thePassword
  });
  req.session.user = theUsername;
  console.log(accounts);
  console.log("Succesfuly created account! Yay!");
  res.send("success");
  //res.redirect("/login?username=" + theUsername + "&password=" + thePassword);
  return;
});

// Epic login stuff
router.post('/login', function(req, res) {
  console.log("Input Usename: " + req.param("username"));
  console.log("Input Password: " + req.param("password"));

  var index = -1;
  //please close your eyes for the next few lines thankx
  for (var i = 0; i < accounts.length; i++) {
    console.log("Trying: " + accounts[i].username);
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
    req.session.user = req.param("username");
    res.send("success");
  } else {
    console.log("lol u fail wrong password xD");
    res.send("fail");
    return;
  }
});

// Logs out and clears the current users session
router.post('/logout', function(req, res) {
  console.log("Logout requested");
  req.session.user = undefined;
  res.send("yea logged out m8, redirecting u to home");
  return;
});

// COpied from 17-18 Lecture
router.post('/user.json', function(req, res) {
  console.log("Request for user.json made");
  var user;
  if (req.param("idToken") != "NULL") {
    console.log("Google Token Recieved");
    //
    async function verify() {
      // Verify google ID token
      const ticket = await client.verifyIdToken({
        idToken: req.param("idToken"),
        audience: CLIENT_ID
      });
      // Get user data from token
      const payload = ticket.getPayload();
      console.log("Teh payload name: " + payload.name);
      // Get user's Google ID
      const userid = payload['sub'];
      accounts.push({
        "username": payload.name
      });

      user = payload.name;
      console.log("Using user: " + user);
      req.session.user = payload.name;
      req.session.isGoogleSession = true;
      res.json({
        "username": user
      });
      return;
    }
    verify().catch(console.error);
    return;
  }

  if (req.session.user !== undefined) {
    console.log("Already Valid session with user: " + req.session.user);
    user = req.session.user;
    req.session.isGoogleSession = false;
    res.json({
      "username": user
    });
    return;
  }

  req.session.isGoogleSession = false;
  console.log("Appears to be first visit, sending Anonymous");
  res.json({
    "username": "Anonymous"
  });
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
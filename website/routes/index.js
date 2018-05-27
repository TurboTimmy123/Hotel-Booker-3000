var express = require('express');
var mysql = require('mysql');

var router = express.Router();
var fs = require('fs');
var handlebars = require('handlebars');

var CLIENT_ID = '739640612908-kagnds5o9pessmpuhbvui91h3j8cenj8.apps.googleusercontent.com';
var {
  OAuth2Client
} = require('google-auth-library');
var client = new OAuth2Client(CLIENT_ID);

module.exports = router;

// Handlebars templates
var navbar;
var listing;
var accountPage;
var purchases;

////////////////////
// SQL STUFF HERE
////////////////////

// This is a bit of a different approach then what is on myuni
// This method creates and holds the same connection throughout
// The entire duration of the server running
// The examples on myuni recreate and close connection on *every query*
// which is just slow, here, we create one connection.
//
// Credit:
// https://www.w3schools.com/nodejs/nodejs_mysql.asp

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "asdfghjkl;\'",
  database: 'dogeotels'
});

// Perform initial connection
console.log("Connecting to SQL database...");
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");

  var query = "SELECT * from hotel;";
  con.query(query, function (err, result) {
      if (err) throw err;
      //console.log("Got: " + JSON.stringify(result));
      hotels = result;
  });

  query = "SELECT * from accounts;";
  con.query(query, function (err, result) {
      if (err) throw err;
      //console.log("Got: " + JSON.stringify(result));
      accounts = result;
  });
});

// Adds a new user to the database
function addNewAccountToSQL(username, password) {
  var query = "INSERT INTO accounts values(\"" + username + "\", \"" + password + "\");";
  con.query(query, function (err, result) {
      if (err) throw err;
      console.log("Added account...");
  });
}

// Add a review to the database
function addNewReviewToSQL(hotelID, theUser, theMsg) {
  temp = "INSERT INTO review values(" + hotelID + ", \"" + theUser + "\", \"" + theMsg + "\");";
  con.query(temp, function (err, result) {
      if (err) throw err;
      console.log("Updating database revew...: " + result);
  });
}

// The client will make a request for reviews to a particular page
// Eg: /getReviews?id=2
// This get request returns a JSON object containing the reviews for that page
router.get('/getReviews', function(req, res){
    var id = req.param("id");
		var sql = "SELECT * from review where ID=" + id;
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(result);
	});
});

router.get('/getPurchases', function(req, res){
    var sql = "SELECT * from booking where username=\"" + req.session.user + "\";";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("SQL purchases response: " + JSON.stringify(result));
        var temp = generateManageBookingsHTML(result);
        console.log("Sending purchases: " + JSON.stringify(temp));
        res.send(temp);
	});
});

function addPurchase(hotelID, username, checkIn, checkOut, adults, kids, doges) {

  // Wow this is so ugly lol
  bookingID = Math.floor((Math.random() * 10000000) + 1);

  var sql = "INSERT into booking values(" +
  bookingID + ", \"" +
  username + "\", \"" +
  hotelID + "\", \"" +
  checkIn + "\", \"" + // Check out this beautiful code!!!
  checkOut + "\", " +
  adults + "," +
  kids + "," +
  doges + ");";

  console.log("sql add booking command: " + sql);

  con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Purchase Succesful");
    });
  return 0;
}





///////////////////////////////////
// Handlebars template stuff
/////////////////////////////////
fs.readFile('public/includes/header.html', 'utf8', function(err, data) {
  navbar = data;
});

fs.readFile('public/includes/hotelListing.html', 'utf8', function(err, data) {
  listing = data;
});

fs.readFile('public/myAccount.html', 'utf8', function(err, data) {
  accountPage = data;
});

fs.readFile('public/includes/purchasesListing.html', 'utf8', function(err, data) {
  purchases = data;
});

////////////////////////////////////////
// End of handlebars templaye stuff
/////////////////////////////////////////



///////////////////////////
// GET REQUESTS BELOW
/////////////////////////

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express'
  });
  res.send("/public/index.html");
});


router.get('/hotels', function(req, res) {

  console.log("lat: " + req.param("lat"));
  console.log("lng: " + req.param("lng"));

  //yes im deliberately lagging the request hahaha xDDDDD
  setTimeout(function() {
    var temp = findHotelsInRadius(req.param("lat"), req.param("lng"));
    console.log("SEARCH RESPONSE: " + JSON.stringify(temp));
    res.send(JSON.stringify(temp));
  }, 500);
});

router.get('/hotelListing', function(req, res) {
  console.log("HELLO?!??!?");
  var id = req.param("id");
  console.log("Generating hotel page for: " + id);
  console.log("Hotel name: " + hotels[id].name);
  var template = handlebars.compile(listing);
  console.log("Description: " + hotels[id].description);
  var data = {
    "name": hotels[id].name,
    "adress": hotels[id].address,
    "description": hotels[id].description,
    "price": hotels[id].price,
    "lat": hotels[id].lat,
    "lng": hotels[id].lng
  };

  var result = template(data);
  console.log("Done generating listing html, sending now yay!");
  res.send(result);
});

// Will generate the logged in users page
// Redirect them if no valid session
router.get('/myAccount', function(req, res) {
  console.log("myAccount requested");
  if (req.session.user == undefined) {
    console.log("User is not logged in, redirecting");
    res.redirect('index.html');
  }

  console.log("Generating accounts page for: " + req.session.user + " index:" + req.session.index);
  var template = handlebars.compile(accountPage);

  var data = {
    "user": req.session.user
  };

  var result = template(data);
  res.send(result);
  return;
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

//////////////////////////
// END OF GET REQUESTS
/////////////////////////





/*

░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄░░░░░░░░░
░░░░░░░░▄▀░░░░░░░░░░░░▄░░░░░░░▀▄░░░░░░░
░░░░░░░░█░░▄░░░░▄░░░░░░░░░░░░░░█░░░░░░░
░░░░░░░░█░░░░░░░░░░░░▄█▄▄░░▄░░░█░▄▄▄░░░
░▄▄▄▄▄░░█░░░░░░▀░░░░▀█░░▀▄░░░░░█▀▀░██░░
░██▄▀██▄█░░░▄░░░░░░░██░░░░▀▀▀▀▀░░░░██░░
░░▀██▄▀██░░░░░░░░▀░██▀░░░░░░░░░░░░░▀██░
░░░░▀████░▀░░░░▄░░░██░░░▄█░░░░▄░▄█░░██░
░░░░░░░▀█░░░░▄░░░░░██░░░░▄░░░▄░░▄░░░██░
░░░░░░░▄█▄░░░░░░░░░░░▀▄░░▀▀▀▀▀▀▀▀░░▄▀░░
░░░░░░█▀▀█████████▀▀▀▀████████████▀░░░░
░░░░░░████▀░░███▀░░░░░░▀███░░▀██▀░░░░░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
*/







////////////////////////////
//  POST REQUESTS BELOW
////////////////////////////

//When the client sends a new review to add to the database
router.post('/newReview', function(req, res) {
  var theUser = req.param("user");
  var hotelID = req.param("id");
  var theMsg = req.param("msg");
  console.log("Adding review to hotel: " + hotelID + " By: " + theUser + " With: " + theMsg);
  addNewReviewToSQL(hotelID, theUser, theMsg);
  res.send("success");
});

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
    "password": thePassword,
    "bookings": []
  });

  req.session.user = theUsername;
  req.session.index = getUserIndex(req.session.user);
  console.log("New registered user will have index: " + req.session.index);

  // Add it to our database
  addNewAccountToSQL(theUsername, thePassword);

  //console.log(accounts);
  console.log("Succesfuly created account! Yay!");
  res.send("success");

  //res.redirect("/login?username=" + theUsername + "&password=" + thePassword);
  return;
});



// Epic login stuff
router.post('/login', function(req, res) {
  console.log("Input Usename: " + req.param("username"));
  console.log("Input Password: " + req.param("password"));

  var index = getUserIndex(req.param("username"));

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
    req.session.index = index;
    res.send("success");
    //res.redirect('account.html');
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

router.post('/confirm', function(req, res) {
  var checkInDate = req.param('checkIn');
  var checkOutDate = req.param('checkOut');
  var countAdults = req.param('adults');
  var countKids = req.param('kids');
  var countDoges = req.param('doges');
  var hotelID = req.param('hotelID');

  console.log("Using data: \nCheckin:\t" +
    checkInDate + "\nCheckOut:\t" +
    checkOutDate + "\nAdults:\t" +
    countAdults + "\nKids:\t" +
    countKids + "\nDoges:\t" +
    countDoges + "\nhotelID:\t" + hotelID);

  //var result = AddUserBookings(req.session.username, hotelID, checkInDate, checkOutDate, countAdults, countKids, countDoges, -1);
  console.log("Adding purchase to database...");
  var result = addPurchase(hotelID, req.session.user, checkInDate, checkOutDate, countAdults, countKids, countDoges);
  //var result = addPurchase(0, 0, 0, 0, 0, 0, 0);
  console.log("Done!");

  if (result != 0) {
    console.log("Whoops");
    res.send("Nah");
    return;
  }

  res.send("Yeah");
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

      var temp = getUserIndex(payload.name);
      if (temp == -1) {
        console.log("Registering Google accounts user...");
        accounts.push({
          "username": payload.name,
          "password": "memes",
          "bookings": []
        });
        req.session.index = getUserIndex(payload.name);
        console.log("Registered google user as: " + JSON.stringify(accounts[req.session.index]));
        console.log("Google users new index is: " + req.session.index);
        //res.redirect('register?referer=wdc.html');
      }


      // Get user's Google ID
      const userid = payload['sub'];

      user = payload.name;
      console.log("Using user: " + user);
      req.session.user = payload.name;
      req.session.isGoogleSession = true;
      res.json({
        "username": user,
        "bookings": []
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

//////////////////////////
// END OF POST REQUESTS
/////////////////////////







//////////////////////////////
// General functions below
////////////////////////////////


function AddUserBookings(username, hotelID, checkIn, checkOut, adults, kids, doges, bookingID) {
  // Now we also need to check if the user want to edit his booking
  // Or whether they just want to add a booking, adding a booking require a new bookingID
  // So we just call the function with -1 to create a new one, however, if the user is wanting
  // to edit a book, they will specify a bookingID which will overwrite that booking with new details

  if (bookingID != -1) {
    console.log("Overwriting exisiting booking data...");
    // of course first we need to check does such a booking exist,
    // so we can remove it
    var asdf = -1;
    for (var i = 0; i < accounts.length; i++) {
      if (accounts[userIndex].bookings[i].bookingID == bookingID) {
        // Delete this booking
        console.log("Removing bookingID: " + bookingID + " At index: " + i);
        accounts[userIndex].bookings.splice(i, 1);
      } else {
        console.log("Nothing found to overwrite, this shouldn't happen hmmmmm");
      }
    }

    return 0;
  }

  bookingID = Math.floor((Math.random() * 10000000) + 1);
  console.log("Created booking with ID: " + bookingID);

  return 0;
}

function getUserIndex(user) {
  var index = -1;
  //please close your eyes for the next few lines thankx
  for (var i = 0; i < accounts.length; i++) {
    console.log("Trying: " + accounts[i].username);
    if (accounts[i].username == user) {
      index = i;
    }
  }
  return index;
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

// This function will create purchases listings on the accounts page
function generateManageBookingsHTML(bookingData) {
  console.log("Generating purchased hotel list");

  //console.log("Generating bookings html with index: " + index);
  var amountOfPurchases = bookingData.length;
  var reallyBigString = handlebars.compile(purchases);
  var data;
  var response = '';
  console.log("Purchases: " + amountOfPurchases);
  for (var i = 0; i < amountOfPurchases; i++) {
    data = {
      "hotelName": getHotelNameById(bookingData[i].hotelID),
      "checkIn": bookingData[i].checkIn,
      "checkOut": bookingData[i].checkOut,
      "adults": bookingData[i].adults,
      "kids": bookingData[i].kids,
      "doges": bookingData[i].doges,
      "bookingID": bookingData[i].bookingID
    };
    response += reallyBigString(data);
  }
  console.log("Generating purchases: " + response);
  return response;
}

function getHotelNameById(id) {
  console.log("Finding hotel: " + id);
  var reply;
  for (var i = 0; i < hotels.length; i++) {
    if (hotels[i].id == id) {
      reply = hotels[i].name;
      console.log("Found hotel called: " + reply);
      return reply;
    }
  }
  console.log("Hotel not found, returning Unititled");
  return "Untitled";
}

// Very important function
function doNothing() {
  // woah
}






//////////////////////////////////////////////////////////////
// THE FOLLOWING CODE IS --> NOT <-- MINE, ALL CREDIT IS DUE HERE:
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
////////////////////////////
//// End of copy pasta
/////////////////////////////

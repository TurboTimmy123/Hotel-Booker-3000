//global variables used throughout the functions
var t = 1;
var k = 1;
var temp;
var lol;
var ourFloatingWindows;
var ourButtons;
var usingNecessaryEffects = false;
var usingDefaults = false;
var body;
var scroll = 0;
var showMap = false;
var theMap;
var markers = [];
var currentMarkerIndex = -1;
var currentMarkerDivRef;

var activeUsersName = "Anonymous";
var isGoogleSession = false;

var TEMPLATE;

// Google geocoder location service
var geocoder;

//when we have the map, disable it then
var allowFooter = true;

//to be called once when the page is loaded
function Start() {
  temp = document.getElementsByTagName("button");
  ourFloatingWindows = document.getElementsByClassName("floatingWindow");
  ourButtons = document.getElementsByClassName("button");
  body = document.getElementsByTagName("body")[0];

  //Call this function to loop asynchronously
  if (document.getElementById("fakeCounter") != null) {
    console.log("counter exists");
    setInterval(fakeCounterIncrementer, 10);
  } else {
    console.log("User counter not found on this page");
  }

  //check if the page has tiling doges to animate
  if (document.getElementById("tilingDoge") != null) {
    console.log("doges exists");
    setInterval(scrollingDoge, 10);
  } else {
    console.log("doges not found");
  }

  $.get("includes/listing.html", function(data) {
    TEMPLATE = data;
  });


  //INCLUDES STUFF, these are present on EVERY page that the user goes to
  $("#header").load("header");
  $("#footer").load("includes/footer.html");
  $("#login").load("includes/login.html");
  $("#searchForm").load("includes/searchForm.html");

  //update our current session status
  getSessionDetails();
}

// this function is run whenever the user scrolls through the page
// This simply creates a shadown under the banner that gets progressively strong
// as the user scrolls down
$(window).scroll(function() {
  //the maximum shadow strength cast from the banner
  var maxShadowStrength = 0.5;

  //how far we have to scroll until the shadow reaches maximum intensity
  var scrollDistanceToMaxShadow = 500;

  //get our scroll position in the page
  var scrollPosition = $(window).scrollTop();
  var temp = document.getElementById("banner");
  var shadowIntensity = clamp(scrollPosition / scrollDistanceToMaxShadow, 0, maxShadowStrength);
  $(temp).css("box-shadow", "0px 0px 20px rgba(0,0,0," + shadowIntensity + ")");
});

// Fake counter showing how many users are using the website
function fakeCounterIncrementer() {
  document.getElementById("fakeCounter").textContent++;
}

// The follosing simply switch whether certain content is visible in the page
// These use usually called from html buttons

function showLoginScreen(reg) {
  console.log("Open login");
  showRegisterOptions(reg);
  document.getElementById("loginPopup").style.display = 'block';
}

function openConfirmWindow() {
  console.log("Opening confirm Booking window");
  //hideLoginScreen();
  if (activeUsersName == "Anonymous") {
    alert("Plz login first");
  } else {
    document.getElementById("confirmBooking").style.display = 'block';
  }
}


// The following function is called when the user confirms their hotel choice
function confirmHotel() {
  var checkInDate = document.getElementById('checkIn').value;
  var checkOutDate = document.getElementById('checkOut').value;
  var countAdults = document.getElementById('numberOfAdults').value;
  var countKids = document.getElementById('numberOfChildren').value;
  var countDoges = document.getElementById('numberOfDoges').value;
  var hotelID = getParam("id");

  if (checkInDate == "" || checkOutDate == "") {
    alert("ERROR! Please specify the dates...");
    return;
  }

  console.log("Using data: \nCheckin:\t" +
    checkInDate + "\nCheckOut:\t" +
    checkOutDate + "\nAdults:\t" +
    countAdults + "\nKids:\t" +
    countKids + "\nDoges:\t" +
    countDoges + "\nhotelID:\t" + hotelID);

  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var response = xhttp.responseText;
      console.log("Got response: " + response);
      if (response == "Yeah") {
        alert("Booking Succesful!!! Yay!!!");
        hideConfirmScreen();
      } else {
        alert("Something went terrible wrong lol");
        hideConfirmScreen();
      }
    }
  };

  xhttp.open("POST", "/confirm?checkIn=" +
    checkInDate + "&checkOut=" +
    checkOutDate + "&adults=" +
    countAdults + "&kids=" +
    countKids + "&doges=" +
    countDoges + "&hotelID=" +
    hotelID, true);

  xhttp.send();
}

function hideLoginScreen() {
  console.log("close login");
  document.getElementById("loginPopup").style.display = 'none';
}

function hideConfirmScreen() {
  console.log("close confirm");
  document.getElementById("confirmBooking").style.display = 'none';
}

// Append a reivew to the hotel listings review section

function addReview() {
  console.log("Adding New Review...");
  var ourText = document.getElementById("msg").value;
  appendReview(activeUsersName, ourText);
  uploadNewReview(activeUsersName, ourText);
  closeReviewBox();
}

function uploadNewReview(user, msg) {
  console.log("Uploading new review... plz wait thanx m8 xD");
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var response = xhttp.responseText;
      console.log("Got response: " + response);
    }
  };
  xhttp.open("POST", "/newReview?id=" + getParam("id") + "&user=" + user + "&msg=" + msg, true);
  xhttp.send();
}

function appendReview(user, msg) {
  $("#reviews").append("<p><b>" + user + ":</b>  " + msg + "</div><hr>");
}

function userLogOut() {
  alert("User attempted to log out");
}

function userLogIn() {
  alert("User attempted to log in");
}

//the following function were copied from here:
//https://stackoverflow.com/questions/3898130/check-if-a-user-has-scrolled-to-the-bottom
window.onscroll = function(ev) {
  if ($(window).scrollTop() + $(window).height() >= getDocHeight()) {
    console.log("Reached bottom");
    if (allowFooter) {
      $("#foot").css("bottom", "0");
    }
  } else {
    console.log("not bottom");
    if (allowFooter) {
      $("#foot").css("bottom", "-10%");
    }
  }
};

function getDocHeight() {
  var D = document;
  return Math.max(
    D.body.scrollHeight, D.documentElement.scrollHeight,
    D.body.offsetHeight, D.documentElement.offsetHeight,
    D.body.clientHeight, D.documentElement.clientHeight
  );
}

//when we see the map, force hide the footer
function hideFooterNow() {
  $("#foot").css("bottom", "-20%");
}

// Give off a cool animation effect thing when we open/close the review box
function openReviewBox() {
  $("#reviewButton").css("width", "8%");
  $("#reviewButton").css("height", "100%");
  $("#reviewButton").css("font-size", "100%");

  $("#msg").css("width", "100%");
  $("#msg").css("height", "100px");
}

function closeReviewBox() {
  $("#reviewButton").css("width", "0px");
  $("#reviewButton").css("height", "0px");
  $("#reviewButton").css("font-size", "0px");

  $("#msg").css("width", "20%");
  $("#msg").css("height", "40px");

  //clear our review once it's posted
  document.getElementById("msg").value = "";
}

// Animate tiling doge image on the main home screen
function scrollingDoge() {
  scroll -= 1;
  $("#tilingDoge").css('background-position', -scroll + "px " + scroll + "px");
}

// Initializes our epic map
function myMap() {
  var mapOptions = {
    center: new google.maps.LatLng(-34.9, 138.6),
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.roadmap
  };

  theMap = new google.maps.Map(document.getElementById("map"), mapOptions);
  geocoder = new google.maps.Geocoder();

  id = getParam('id');

  console.log("id: " + id);
  if (id == "") {

    // The following is a listener element that when the user inputs a search, we will
    // Run google geocoder service and do epic stuff
    console.log("Adding searchbox listener");
    document.getElementById('epicButton').addEventListener('click', function() {
      var address = document.getElementById('theDestination').value;
      geocodeAddress(geocoder, theMap, address);
    });
  } else {
    // Omit the listener from listing pages
    console.log("Ommiting searchbox listener");
  }
}

// Google geocode service
// Based off:
// https://developers.google.com/maps/documentation/javascript/geocoding
function geocodeAddress(geocoder, resultsMap, address) {
  // A request for new results has been made
  // Show the loading screen
  $("#loading").css("display", "block");

  geocoder.geocode({
    'address': address
  }, function(results, status) {
    if (status === 'OK') {
      theMap.setZoom(10);
      resultsMap.setCenter(results[0].geometry.location);
      updateListings(results[0].geometry.location.lat(), results[0].geometry.location.lng());
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

// The user can switch to register from the login screen
// This simply toggles some elements in the window to switch to register mode
function showRegisterOptions(i) {
  var temp1 = "none";
  var temp2 = "block";

  document.getElementById("loginRegisterScreen").innerHTML = "Login";
  if (i) {
    temp1 = "block";
    temp2 = "none";
    document.getElementById("loginRegisterScreen").innerHTML = "Register";
  }

  //the folowing chunk will reveal all options that have a register class
  var hiddenOptions = document.getElementsByClassName("register");
  for (var b = 0; b < hiddenOptions.length; b++) {
    $(hiddenOptions[b]).css("display", temp1);
    $(hiddenOptions[b]).css("display", temp1);
  }

  //the following chunk will hide any options with this class
  var hideThis = document.getElementsByClassName("hideWhenRegistering");
  for (var q = 0; q < hideThis.length; q++) {
    $(hideThis[q]).css("display", temp2);
  }

}

// Given a color, will set this to the websites theme color
function applyThemeColor(col) {
  console.log("got: " + col);
  for (var q = 0; q < ourButtons.length; q++) {
    $(ourButtons[q]).css("background-color", col);
  }
  $('#banner').css("background", col);
  $('#foot').css("background", col);
}

// Toggle between results/map mode
function toggleMap() {
  showMap = !showMap;
  console.log("setting map to: " + showMap);
  var listOffset;
  var buttonOffset;
  if (showMap) {
    allowFooter = false;
    hideFooterNow();
    $('#toggleMapText').text('⬆  Show Results  ⬆');

    listOffset = -100;
    buttonOffset = 75;
  } else {

    $('#toggleMapText').text('⬇  Show Map  ⬇');

    allowFooter = true;
    listOffset = 0;
    buttonOffset = 0;
    hideHotel(currentMarkerDivRef);
  }

  $('#theList').css("left", listOffset + "%");
  $('#showMapButton').css("right", buttonOffset + "%");
}

// Given a hotel index, reveal a popup with information about it
function showHotel(index) {
  var divRef = document.getElementById(index);
  console.log("index: " + index + " | Div reference: " + divRef);
  theMap.setZoom(15);
  currentMarkerDivRef = divRef;

  // The information on the map is just fetching the divs from the results page
  // When we click "show on map", we need to finish our amazing animation
  // Before popping up the div, so we add a delay, else, show immedietaly
  if (showMap == true) {
    console.log("Map shown, no delay");
    revealHotelPopup(divRef, index);
  } else {
    console.log("Results shown, delay");
    setTimeout(function() {
      revealHotelPopup(divRef, index);
    }, 500);
  }

  if (!showMap) {
    toggleMap();
  }
}

// Takes the same div used in the search result and places it on top of the map
function revealHotelPopup(divRef, index) {
  console.log("Revealing: " + divRef);
  $(divRef).css("position", "fixed");
  $(divRef).css("bottom", "5%");
  $(divRef).css("left", "25%");
  $(divRef).css("width", "70%");

  //when showing the popup, we assume we want to go to it's position
  theMap.panTo(markers[index].position);
}

// Simply puts the popup div back to it's place
function hideHotel(divRef) {
  console.log("Hiding hotel: " + divRef);
  $(divRef).css("position", "static");
  $(divRef).css("bottom", "null");
  $(divRef).css("left", "null");
  $(divRef).css("width", "85%");
}

// Used on the accounts page to switch between tabs
function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

function cancelBooking(id) {
  alert("Sorry, not implemented yet :(");
}

function editBooking(id) {
  alert("Sorry, not implemented yet :(");
}







//Gmaps related stuff

function addMarker(dankCoordinate, epicLabel, i) {
  console.log("Adding dank marker...");
  var marker = new google.maps.Marker({
    position: dankCoordinate,
    label: epicLabel,
    map: theMap,
    optimized: false
    //icon: "https://i.pinimg.com/originals/3d/c0/e0/3dc0e094e7e634f271582f3254f8dea8.jpg"
  });

  marker.index = i;
  return marker;
}

//marker on click code from here:
//https://stackoverflow.com/questions/15299495/how-to-identify-a-google-map-marker-on-click
function markerClicked(e) {
  console.log("click");
  console.log("e is: " + e + " " + currentMarkerIndex);

  if (e.divId == currentMarkerIndex) {
    console.log("Reclicked same marker");
  } else {
    hideHotel(currentMarkerDivRef);
    currentMarkerIndex = e.divId;
    console.log('Marker ' + e.divId + ' has been clicked');
    showHotel(e.divId);
  }
}



//THE FOLLOWING IS AJAX RELATED STUFF
var hotels = [];

//the fromMain is just a true/false for whether we should redirect the user
//to the search page after coming from index.html, or simply relist the entries
//without actually reloading the page
function findHotels(fromMain) {
  console.log("Search request, from main: " + fromMain);
  if (fromMain) {
    window.location.replace("search.html");
  }
}

//this function updates the search results page
function updateListings(lat, long) {
  console.log("Requested search for: " + lat + " " + long);
  clearListings();

  // Create new AJAX request
  var xhttp = new XMLHttpRequest();

  // Define behaviour for a response
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // convert from string to JSON, populate hotels array
      hotels = JSON.parse(xhttp.responseText);

      // Populate map
      console.log("Got hotels of length: " + hotels.length);
      generateListingsAndMarkers();

      // After we've updated the page, hide loading stuff
      $("#loading").css("display", "none");
    }
  };

  // Initiate connection
  xhttp.open("GET", "hotels?lat=" + lat + "&lng=" + long, true);

  // Send request
  xhttp.send();
  $("#plzWait").css("display", "none");
}

function generateListingsAndMarkers() {
  if (hotels.length != 0) {
    // Loop over hotels array
    $('#NoResults').css("display", "none");

    for (var i = 0; i < hotels.length; i++) {
      console.log("Creating marker entry: " + i + " with ID: " + hotels[i].uniqueId);
      // Create new marker

      var temp = new google.maps.LatLng(hotels[i].lat, hotels[i].lng);
      var tempMarker = addMarker(temp, hotels[i].name, i);
      markers[i] = tempMarker;
      markers[i].divId = i;


      google.maps.event.addDomListener(markers[i], 'click', function() {
        markerClicked(this);
      });

      // Add to markers array
      createListingHtml(hotels[i].name, hotels[i].price, "NULL", hotels[i].uniqueId, hotels[i].Address, i);
    }
  } else {
    console.log("RIP no results :(");
    $('#NoResults').css("display", "block");
  }
}

function putMarkerOnListingPage() {
  console.log("Placing marker at: " + latCoord + " " + lngCoord);
  var temp = new google.maps.LatLng(latCoord, lngCoord);
  var asdf = document.getElementById("hotelName").innerHTML;
  var tempMarker = addMarker(temp, asdf, 0);
  theMap.panTo(tempMarker.position);
}

// Halp me idk html plz be a better way to do this lololol xDDDDDD
// So what im doing here, is inserting an external html file that is
// a simple template file for 1 listing, i then modify it a bit with
// the function parameters i got, and then we edit the ID's becuase
// html can't have duplicate ID's
function createListingHtml(hotelName, hotelPrice, hotelImage, hotelUniqueID, hotelAddress, index) {
  console.log("Generating html, ID: " + hotelUniqueID);


  ////////////////////////////////////////////////////
  // THIS IS NOT THE RIGHT WAY TO DO THIS
  // I did this before finding out about handlebars
  // And i will replace it when i get time
  ////////////////////////////////////////////////////


  $("#theResults").append(TEMPLATE);

  var blah = document.getElementById("TEMPLATE");
  $("#TEMPLATE").attr('id', index);

  $("#TEMPLATE_price").html(hotelPrice);
  $("#TEMPLATE_price").removeAttr("id");

  $("#TEMPLATE_hotelName").html(hotelName);
  $("#TEMPLATE_hotelName").removeAttr("id");

  $("#TEMPLATE_address").html("Address: " + hotelAddress);
  $("#TEMPLATE_address").removeAttr("id");

  $("#TEMPLATE_button").attr("onclick", "showHotel(" + index + ")");
  $("#TEMPLATE_button").removeAttr("id");

  $("#TEMPLATE_goto").attr("onclick", "location.href='hotelListing?id=" + hotelUniqueID + "'");
  $("#TEMPLATE_goto").removeAttr("id");


}

// the following function is run the first time the user access the search results
// It mostly just creates the first initial request to the server
function initSearchPage() {
  var destination = getParam('destination');
  var showDeals = getParam('showDeals');

  if (showDeals == "true" || destination == "") {
    console.log("Finding deals...");
    //no destination was specified, we just show deals, this should only happen if the user somehow manually types out this
    //page url, or if they search for an empty result
    return;
  } else {
    geocodeAddress(geocoder, theMap, destination);
  }
}


// FOLLOWING FUNCTION IS NOT MINE, CREDIT FROM HERE:
// For some reason i got stuck trying to get url parameters, dunno, looked easy, so we use fancy regex stuff
// https://stackoverflow.com/questions/9718634/how-to-get-the-parameter-value-from-the-url-in-javascript
function getParam(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if (results == null)
    return "";
  else
    return results[1];
}
// End of copy pasta

// clearListings... (get ready for it) clears your listings... WOAHHH!!!!!
function clearListings() {
  console.log("Clearing results...");
  //clear the results page
  $("#theResults").html("");
  //show the loading icon
  $("#plzWait").css("display", "block");
  //clear the map of it's current markers
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
  console.log("Done clearing");
}



// THE FOLLOWING IS USER LOGIN/REGISTRATION STUFF
function login() {
  // Create new AJAX request
  var xhttp = new XMLHttpRequest();
  // Define behaviour for a response
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // convert from string to JSON, populate hotels array
      var asdf = xhttp.responseText;
      // Populate map
      console.log("Reply: " + asdf);
      if (asdf == "fail") {
        alert("Wrong password m8 try again hahahahahaha");
      }
      if (asdf == "success") {
        alert("Succesful login, redirecting to accounts page");
        window.location.href = "/myAccount";
      }
    }
  };
  // Initiate connection
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  var postRequest = "/login?username=" + username + "&password=" + password;
  console.log("Post request: " + postRequest);
  xhttp.open("POST", postRequest, true);
  // Send request
  xhttp.send();
}


// Standard account registration stuff
function register() {
  // Create new AJAX request
  var xhttp = new XMLHttpRequest();
  // Define behaviour for a response
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // convert from string to JSON, populate hotels array
      var asdf = xhttp.responseText;
      // Populate map
      console.log("Reply: " + asdf);
      if (asdf == "fail") {
        alert("Fail xD");
      }
      if (asdf == "success") {
        alert("Registration Succesful, redirecting to accounts page");
        window.location.href = "/myAccount";
      }
    }
  };
  // Initiate connection
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  var postRequest = "/register?username=" + username + "&password=" + password;
  console.log("[Register] Post request: " + postRequest);

  xhttp.open("POST", postRequest, true);
  // Send request
  xhttp.send();
}

// Asks the server who am i, and get's some epic information on the current active
// users accounts, such as name and current bookings
function getSessionDetails(params) {
  console.log("Gettings user session details and stuff...");
  // Create new AJAX request
  var xhttp = new XMLHttpRequest();

  // Define behaviour for a response
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var temp = JSON.parse(xhttp.responseText);
      // Check is logged in
      console.log("Got name: " + temp.username);

      if (temp.username !== null) {
        activeUsersName = temp.username;
        console.log("Settings activeUsersName to: " + activeUsersName);
        // else prompt for login
      } else {
        console.log("Anonymous login");
      }
    }
  };

  // Initiate connection
  // Send request
  console.log("PARAMS IS: " + params);
  if (params !== undefined) {
    console.log("Passing token: " + params.idToken);
    xhttp.open("POST", "/user.json?idToken=" + params.idToken, true);
  } else {
    console.log("No Google session ID detected (yet)");
    xhttp.open("POST", "/user.json?idToken=NULL", true);
  }

  // NOTE: params only exist when there's a OpenID session
  xhttp.send();
}




// THE FOLLOWING IS OPENID STUFF
function onSignIn(googleUser) {
  console.log("(OpenID) onSignIn was called");
  var profile = googleUser.getBasicProfile();
  console.log('Google Name: ' + profile.getName());

  // The ID token you need to pass to your backend:
  var id_token = googleUser.getAuthResponse().id_token;
  //console.log("ID Token: " + id_token);
  // Pass the token to my getUserInfo
  getSessionDetails({
    "idToken": id_token
  });

  if (activeUsersName == "Anonymous") {
    isGoogleSession = true;
    activeUsersName = profile.getName();
    console.log("First time Google Login... Going to accounts page");
    window.location.href = "/myAccount";
  } else {
    console.log("Same session");
  }
}

// Signing out from google requires some extra steps
// Before we can actually ask the server to logout
function googleSignOut() {
  console.log("Attemping Google Sign out");
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function() {
    console.log("Google User signed out");
  });

  // Begin teh logout request
  sendLogoutRequest();
}

// Logout request, redirects back to home page when done
function sendLogoutRequest() {
  console.log("Sending logout request...");
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var response = xhttp.responseText;
      console.log("Got response: " + response);
      alert("Succesfully logged out");
      window.location.href = "/index.html";
    }
  };
  xhttp.open("POST", "/logout", true);
  xhttp.send();
}

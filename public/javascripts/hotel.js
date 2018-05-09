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
    console.log("counter not found");
  }

  if (document.getElementById("tilingDoge") != null) {
    console.log("doges exists");
    setInterval(scrollingDoge, 10);
  } else {
    console.log("doges not found");
  }

  $.get("includes/listing.html", function(data) {
    TEMPLATE = data;
  });

  getSessionDetails();
}

//this function is run whenever the user scrolls through the page
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

function fakeCounterIncrementer() {
  document.getElementById("fakeCounter").textContent++;
}

function showLoginScreen(reg) {
  console.log("Open login");
  showRegisterOptions(reg);
  //hideConfirmScreen();
  document.getElementById("loginPopup").style.display = 'block';
}

function confirmBooking() {
  console.log("Opening confirm Booking window");
  hideLoginScreen();
  document.getElementById("confirmBooking").style.display = 'block';
}

function hideLoginScreen() {
  console.log("close login");
  document.getElementById("loginPopup").style.display = 'none';
}

function hideConfirmScreen() {
  console.log("close confirm");
  document.getElementById("confirmBooking").style.display = 'none';
}

function addReview() {
  console.log("Adding Review...");
  var ourText = document.getElementById("msg");
  console.log(ourText.value);
  $("#reviews").append("<div class=\"reviews\">" + ourText.value + "</div><hr>");
  closeReviewBox();
}

function userLogOut() {
  alert("User attempted to log out");
}

function userLogIn() {
  alert("User attempted to log in");
}

//the following 2 function were copied from here:
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

//when we see the map, force hide the footer
function hideFooterNow() {
  $("#foot").css("bottom", "-10%");
}

function getDocHeight() {
  var D = document;
  return Math.max(
    D.body.scrollHeight, D.documentElement.scrollHeight,
    D.body.offsetHeight, D.documentElement.offsetHeight,
    D.body.clientHeight, D.documentElement.clientHeight
  );
}

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


function scrollingDoge() {
  scroll -= 1;
  $("#tilingDoge").css('background-position', -scroll + "px " + scroll + "px");
}

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
    console.log("Adding searchbox listener");
    document.getElementById('epicButton').addEventListener('click', function() {
      var address = document.getElementById('theDestination').value;
      geocodeAddress(geocoder, theMap, address);
    });
  } else {
    console.log("Ommiting searchbox listener");
  }
}

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
      /*
      var marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location
      });
      */
      updateListings(results[0].geometry.location.lat(), results[0].geometry.location.lng());

    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}


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

function applyThemeColor(col) {
  console.log("got: " + col);

  for (var q = 0; q < ourButtons.length; q++) {
    $(ourButtons[q]).css("background-color", col);
  }
  $('#banner').css("background", col);
  $('#foot').css("background", col);
}

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



function showHotel(index) {
  var divRef = document.getElementById(index);
  console.log("index: " + index + " | Div reference: " + divRef);
  theMap.setZoom(15);
  currentMarkerDivRef = divRef;
  if (!showMap) {
    toggleMap();
  }

  setTimeout(function() {
    revealHotelPopup(divRef, index)
  }, 500);
}

//takes the same div used in the search result and places
//it on top of the map
function revealHotelPopup(divRef, index) {
  console.log("Revealing: " + divRef);
  $(divRef).css("position", "fixed");
  $(divRef).css("bottom", "5%");
  $(divRef).css("left", "25%");
  $(divRef).css("width", "70%");

  //when showing the popup, we assume we want to go to it's position
  theMap.panTo(markers[index].position);
}

//simply puts the popup div back to it's place
function hideHotel(divRef) {
  console.log("Hiding hotel: " + divRef);
  $(divRef).css("position", "static");
  $(divRef).css("bottom", "null");
  $(divRef).css("left", "null");
  $(divRef).css("width", "85%");
}

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









//Gmaps related stuff

function addMarker(dankCoordinate, epicLabel, i) {
  console.log("Adding dank marker...");
  var marker = new google.maps.Marker({
    position: dankCoordinate,
    label: epicLabel,
    map: theMap
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
var i;

function generateListingsAndMarkers() {
  if (hotels.length != 0) {
    // Loop over hotels array
    $('#NoResults').css("display", "none");

    for (i = 0; i < hotels.length; i++) {
      console.log("Creating marker entry: " + i + " with ID: " + hotels[i].uniqueId);
      // Create new marker

      var temp = new google.maps.LatLng(hotels[i].lat, hotels[i].lng);
      var tempMarker = addMarker(temp, hotels[i].name, i);
      markers[i] = tempMarker;
      markers[i].divId = i;


      google.maps.event.addDomListener(markers[i], 'click', function() {
        markerClicked(this)
      });

      // Add to markers array
      createListingHtml(hotels[i].name, hotels[i].price, "NULL", hotels[i].uniqueId, hotels[i].Address, i);
    }
  } else {
    console.log("RIP no results :(");
    $('#NoResults').css("display", "block");
  }
}

// Halp me idk html plz be a better way to do this lololol xDDDDDD
// So what im doing here, is inserting an external html file that is
// a simple template file for 1 listing, i then modify it a bit with
// the function parameters i got, and then we edit the ID's becuase
// html can't have duplicate ID's
function createListingHtml(hotelName, hotelPrice, hotelImage, hotelUniqueID, hotelAddress, index) {
  console.log("Generating html, ID: " + hotelUniqueID);
  //now we have loaded in a template file, with lots of TEMPLATE id's
  //these give us access to modifying the listing


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

  $("#TEMPLATE_goto").attr("onclick", "location.href='listing.html?id=" + hotelUniqueID + "'");
  $("#TEMPLATE_goto").removeAttr("id");


}

// the following function is run the first time the user access the search results
// It mostly just creats the first initial request to the server
function initSearchPage() {
  //parse url somehow

  var destination = getParam('destination');
  var showDeals = getParam('showDeals');

  if (showDeals == "true") {
    console.log("Finding deals...");
    //no destination was specified, we just show deals, this should only happen if the user somehow manually types out this
    //page url, or if they search for an empty result

    return;
  } else {
    geocodeAddress(geocoder, theMap, destination);
  }
}


// FOLLOWING FUNCTION IS NOT MINE, CREDIT FROM HERE:
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
        window.location.href = "/myAccount.html";

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
        window.location.href = "/myAccount.html";
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







// THE FOLLOWING IS THE LISTING PAGE GENERATION STUFF
var id;

function filloutListing() {
  console.log("Fetching details for hotel ID: " + id);

  // Create new AJAX request
  var xhttp = new XMLHttpRequest();
  // Define behaviour for a response
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // convert from string to JSON, populate hotels array
      var response = xhttp.responseText;
      // Populate map
      console.log("Got response: " + response);

      //
    }
  };
  // Initiate connection
  xhttp.open("GET", "aHotel?id=" + id, true);
  // Send request
  xhttp.send();
}



function getSessionDetails(params) {
  console.log("Gettings user session details and stuff...");
  // Create new AJAX request
  var xhttp = new XMLHttpRequest();

  // Define behaviour for a response
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          var temp = JSON.parse(xhttp.responseText);
          // Check is logged in
          console.log("Got user: " + temp.user);

          if(temp.user !== null){
            activeUsersName = temp.user;
          // else prompt for login
          } else {
              // Nope
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
    xhttp.open("POST", "/user.json", true);
  }

  // NOTE: params only exist when there's a OpenID session
  xhttp.send();
}





// THE FOLLOWING IS OPENID STUFF
function onSignIn(googleUser) {
  console.log("(OpenID) onSignIn was called");
  var profile = googleUser.getBasicProfile();
  //console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  //console.log('Image URL: ' + profile.getImageUrl());
  //console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

  activeUsersName = profile.getName();
  isGoogleSession = true;

  // The ID token you need to pass to your backend:
  var id_token = googleUser.getAuthResponse().id_token;
  //console.log("ID Token: " + id_token);
  // Pass the token to my getUserInfo
  getSessionDetails({"idToken": id_token});
}


function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function() {
    console.log('User signed out.');
  });
}

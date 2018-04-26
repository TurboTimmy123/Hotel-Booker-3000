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
  document.getElementById("loginPopup").style.display = 'block';
}

function hideLoginScreen() {
  console.log("close login");
  document.getElementById("loginPopup").style.display = 'none';
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
  }
  theMap = new google.maps.Map(document.getElementById("map"), mapOptions);
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

    listOffset = -100;
    buttonOffset = 75;
  } else {
    allowFooter = true;
    listOffset = 0;
    buttonOffset = 0;
    hideHotel(currentMarkerDivRef);
  }

  $('#theList').css("left", listOffset + "%");
  $('#showMapButton').css("right", buttonOffset + "%");
}



function showHotel(index) {
  var meow = "list" + index;
  var divRef = document.getElementById(meow);
  console.log("index: " + index + " | Div reference: " + divRef);

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

//this function will load all the markers corresponding with the search results
function populateMapWithMarkers() {
  ////////////////////////////////////////////////////////////////////
  //THIS IS HARD CODED AND NOT THE RIGHT WAY TO DO THIS
  //UNTIL WE GET A DATABASE THIS IS JUST FOR DEMONSTRATION PURPOSES
  /////////////////////////////////////////////////////////////////////

  //marker 1
  temp = new google.maps.LatLng(-34.91, 138.68);
  markers[0] = addMarker(temp);
  markers[0].id = 0;
  console.log("me got: " + markers[0]);
  google.maps.event.addDomListener(markers[0], 'click', function() {
    markerClicked(markers[0])
  });

  //marker 2
  temp = new google.maps.LatLng(-34.92, 138.69);
  markers[1] = addMarker(temp);
  markers[1].id = 1;
  console.log("me got: " + markers[1]);
  google.maps.event.addDomListener(markers[1], 'click', function() {
    markerClicked(markers[1])
  });


}

function addMarker(dank) {
  console.log("Adding dank marker...");
  var marker = new google.maps.Marker({
    position: dank,
    map: theMap
  });

  return marker;
}

//marker on click code from here:
//https://stackoverflow.com/questions/15299495/how-to-identify-a-google-map-marker-on-click
function markerClicked(e) {
  console.log(e.id + " " + currentMarkerIndex);
  if (e.id == currentMarkerIndex) {
    console.log("Reclicked same marker");
  } else {
    hideHotel(currentMarkerDivRef);
    currentMarkerIndex = e.id;
    console.log('Marker ' + e.id + ' has been clicked');
    showHotel(e.id);
  }
}
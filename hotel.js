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
  getRainboxHex(scrollPosition);

  //console.log("shadowIntensity: " + shadowIntensity);
  //console.log("scrollPosition: " + scrollPosition);
  $(temp).css("box-shadow", "0px 0px 20px rgba(0,0,0," + shadowIntensity + ")");

});

var t = 1;
var temp;

var ourFloatingWindows;
var ourButtons;

function colorLoop() {
  temp = document.getElementsByTagName("button");
  console.log("got: " + temp);
  ourFloatingWindows = document.getElementsByClassName("floatingWindow");
  ourButtons = document.getElementsByClassName("button");
  setInterval(loop, 100);
}

function counterLoop() {
  setInterval(fakeCounterIncrementer, 10);
}

function fakeCounterIncrementer() {
  document.getElementById("fakeCounter").textContent++;
}

function loop() {
  t++;
  //temp.style.color = white;
  //$("#epicButton").css("background-color", getRainboxHex(t / 2));
  $("#theBackground").css("background-color", getRainboxHex(t / 2, 0.1));

  for (var i = 0; i < ourFloatingWindows.length; i++) {
    $(ourFloatingWindows[i]).css("border-color", getRainboxHex(t / 2, 1));
  }

  for (var j = 0; j < ourButtons.length; j++) {
    $(ourButtons[j]).css("background-color", getRainboxHex(t / 2, 1));
  }

  if ((Math.random() * 1000) > 999) {
    if (confirm("CONGRATULATIONS, You just won a free iPad, click OK to claim prize!!!")) {
      console.log("Pressed ok");
    } else {
      console.log("Pressed cancel");
    }

  }
}

//simple clamp function, yay!
function clamp(x, min, max) {
  if (x > max) {
    return max;
  }
  if (x < min) {
    return min;
  }

  return x;
}

var lol;

function getRainboxHex(t, opacity) {
  var red = Math.sin(t + 0) * 127 + 128;
  var green = Math.sin(t + 2) * 127 + 128;
  var blue = Math.sin(t + 4) * 127 + 128;

  lol = "rgba(" + red + "," + green + "," + blue + "," + opacity + ")";


  return lol;
}

function showLoginScreen() {
  console.log("Open login");
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
}

function userLogOut() {
  alert("User attempted to log out");
}
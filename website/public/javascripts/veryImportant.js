var t = 0;
var k = 1;
var temp;
var lol;
var ourWobblingWindows;
var ourButtons;
var usingNecessaryEffects = false;
var usingDefaults = false;
var body;

function initializeEffects() {
  temp = document.getElementsByTagName("button");
  ourWobblingWindows = document.getElementsByClassName("wobbleThis");
  ourRotatingWindows = document.getElementsByClassName("rotateThis");


  ourButtons = document.getElementsByClassName("button");
  body = document.getElementsByTagName("body")[0];
  setInterval(mainLoop, 20);
}

function toggleEffects() {
  usingNecessaryEffects = !usingNecessaryEffects;
  console.log("RGB is: " + usingNecessaryEffects);
}

function mainLoop() {
  if (usingNecessaryEffects) {
    dogePopup();
    usingDefaults = false;
    t++;
    $("#theBackground").css("background-color", getRainboxHex(t / 2, 0.05));
    $("#name").css("color", getSimpleRainbow(t));

    for (var i = 0; i < ourWobblingWindows.length; i++) {
      $(ourWobblingWindows[i]).css("border-color", getRainboxHex(t / 2, 1));
      $(ourWobblingWindows[i]).css("transform", "rotate(" + Math.sin(k * 1) * 10 + "deg)");
      k += 0.005;
      $(ourRotatingWindows[i]).css("transform", "rotate(" + (k) * 10 + "deg)");
      k += 0.005;

    }

    for (var j = 0; j < ourButtons.length; j++) {
      $(ourButtons[j]).css("background-color", getRainboxHex(t / 2, 1));
    }
    $("#banner").css("background", getRainboxHex(t / 5, 1));

    if ((Math.random() * 5000) < 2) {
      if (confirm("CONGRATULATIONS, You just won a free iPad, click OK to claim prize!!!")) {
        console.log("Pressed ok");
      } else {
        console.log("Pressed cancel");
      }
    }

    /* Annoying loading cursor haha
    if ((Math.random() * 10) > 5) {
      body.style.cursor = "wait";
    } else {
      body.style.cursor = "default";
    }
    */
  } else {
    if (!usingDefaults) {
      $("#theBackground").css("background-color", "rgba(0, 0, 0, 0)");
      for (var b = 0; b < ourWobblingWindows.length; b++) {
        $(ourWobblingWindows[b]).css("border-color", "black");
        $(ourWobblingWindows[b]).css("transform", "rotate(0deg)");
      }
      $('#dogePopup').css('display', "none");


      //we use this variable so we only apply these settings once
      usingDefaults = true;
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

function getRainboxHex(t, opacity) {
  var red = Math.sin(t + 0) * 127 + 128;
  var green = Math.sin(t + 2) * 127 + 128;
  var blue = Math.sin(t + 4) * 127 + 128;
  lol = "rgba(" + red + "," + green + "," + blue + "," + opacity + ")";

  return lol;
}

function getSimpleRainbow(t) {
  //console.log("trying: " + (t % 3));
  switch (t % 3) {
    case 0:
      return "rgb(255, 255, 0)";
    case 1:
      return "rgb(0, 255, 255)";
    case 2:
      return "rgb(255, 0, 255)";
  }
  console.log("hmmmm");
  return "rgb(0, 0, 0)";
}

//unused effect, creates a spinning mouse cursour of arrows
function dank() {
  t++;
  switch (t) {
    case 1:
      body.style.cursor = "n-resize";
      break;
    case 2:
      body.style.cursor = "ne-resize";
      break;
    case 3:
      body.style.cursor = "e-resize";
      break;
    case 4:
      body.style.cursor = "se-resize";
      break;
    case 5:
      body.style.cursor = "s-resize";
      break;
    case 6:
      body.style.cursor = "sw-resize";
      break;
    case 7:
      body.style.cursor = "w-resize";
      break;
    case 8:
      body.style.cursor = "nw-resize";
      t = 0;
      break;
  }
}



// The following slides in a doge popup
// that stares into your soul for a brief second
// Then hides again for a few more seconds

var allowPopup = true;

function dogePopup() {
  $('#dogePopup').show();
  console.log("Animating doge popup");
  if (((Math.random() * 200) < 1) && (allowPopup == true)) {
    $('#dogePopup').css('bottom', "-50%");
    setTimeout(hideDoge, 2000);
  }
}

function hideDoge() {
  allowPopup = false;
  $('#dogePopup').css('bottom', "-200%");
  setTimeout(allowPopupDelay, 3000);
}

function allowPopupDelay() {
  allowPopup = true;
}
var t = 0;
var k = 1;
var temp;
var lol;
var ourFloatingWindows;
var ourButtons;
var usingNecessaryEffects = false;
var usingDefaults = false;
var body;

function initializeEffects() {
  temp = document.getElementsByTagName("button");
  ourFloatingWindows = document.getElementsByClassName("floatingWindow");
  ourButtons = document.getElementsByClassName("button");
  body = document.getElementsByTagName("body")[0];
  setInterval(mainLoop, 50);
}

function toggleEffects() {
  usingNecessaryEffects = !usingNecessaryEffects;
  console.log("RGB is: " + usingNecessaryEffects);
}

function mainLoop() {
  if (usingNecessaryEffects) {
    usingDefaults = false;
    t++;
    $("#theBackground").css("background-color", getRainboxHex(t / 2, 0.05));
    $("#name").css("color", getSimpleRainbow(t));

    for (var i = 0; i < ourFloatingWindows.length; i++) {
      $(ourFloatingWindows[i]).css("border-color", getRainboxHex(t / 2, 1));
      $(ourFloatingWindows[i]).css("transform", "rotate(" + Math.sin(k * 2) * 10 + "deg)");
      k++;
    }

    for (var j = 0; j < ourButtons.length; j++) {
      $(ourButtons[j]).css("background-color", getRainboxHex(t / 2, 1));
    }
  } else {
    if (!usingDefaults) {
      $("#theBackground").css("background-color", "rgba(0, 0, 0, 0)");
      for (var b = 0; b < ourFloatingWindows.length; b++) {
        $(ourFloatingWindows[b]).css("border-color", "black");
        $(ourFloatingWindows[b]).css("transform", "rotate(0deg)");
      }

      //we use this variable so we only apply these settings once
      usingDefaults = true;
    }
  }

  if ((Math.random() * 100000) > 99999) {
    if (confirm("CONGRATULATIONS, You just won a free iPad, click OK to claim prize!!!")) {
      console.log("Pressed ok");
    } else {
      console.log("Pressed cancel");
    }
  }

  if ((Math.random() * 10) > 5) {
    body.style.cursor = "wait";
  } else {
    body.style.cursor = "default";
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
  console.log("trying: " + (t % 3));
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
  console.log(t);
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
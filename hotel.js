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

function colorLoop() {
  temp = document.getElementsByTagName("button");
  console.log("got: " + temp);
  setInterval(loop, 100);
}

function loop() {
  t++;
  document.getElementById("fakeCounter").textContent++;
  //temp.style.color = white;
  $("#epicButton").css("background-color", getRainboxHex(t));

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

function getRainboxHex(t) {
  var red = Math.sin(t + 0) * 127 + 128;
  var green = Math.sin(t + 2) * 127 + 128;
  var blue = Math.sin(t + 4) * 127 + 128;
  var lol = "RGB(" + red + "," + green + "," + blue + ")";
  return lol;
}
var state = {
    contentEditing: true,
    canvasFocused: false
};

/* ==========================================================================
    Canvas Elements
 ========================================================================== */

var canvas = document.getElementById('meme-gen__canvas-hidden');
var dummyCanvas = document.getElementById('meme-gen__canvas-dummy');
var photoButton = document.getElementById('meme-gen__photo-button');
var fileInput = document.getElementById('meme-gen__file-upload');
var downloadLink = document.getElementById('meme-gen__download-link');
var raster = null;

PointText.prototype.centerText = function() {
    this.point.x = view.center.x - (this.bounds.width/2);
};

PointText.prototype.setFontWidth = function(percent) {
    this.fontSize = 1;

    while (this.bounds.width < (percent/100) * canvas.offsetWidth) {
        this.fontSize += 1;
    }
};

var laLove = new PointText({
    point: view.center,
    content: 'LA ❤',
    fontFamily: 'FatFont',
    fontSize: 80,
    fillColor: 'black'
});

laLove.setFontWidth(70);
laLove.centerText();

var userText = new PointText({
    point: view.center,
    content: '',
    fontFamily: 'FatFont',
    fontSize: laLove.fontSize,
    fillColor: 'black'
});

userText.updatePosition = function() {
    this.position.y = laLove.bounds.bottom + userText.fontSize / 4;
};

userText.updatePosition();

var cursor = new Shape.Rectangle({
    fillColor: 'red'
});

cursor.update = function() {
    this.size = [userText.fontSize/8, userText.fontSize * .8];
    this.position.x = userText.bounds.right;
    this.position.y = userText.bounds.centerY - userText.fontSize / 15;
};

cursor.update();

cursor.blink = function(blinkRate) {
    if (this.opacity >= 1) {
        this.blinkOpacity = 'decreasing';
    }
    else if (this.opacity <= 0.1) {
        this.blinkOpacity = 'increasing';
    }

    if (this.blinkOpacity === 'decreasing') {
        this.opacity -= blinkRate;
    }
    else if (this.blinkOpacity === 'increasing') {
        this.opacity += blinkRate;
    }
};

userText.centerText();

/* ==========================================================================
    Event Listeners
 ========================================================================== */

document.addEventListener('click', function(e) {
    if (e.target !== dummyCanvas) {
        state.canvasFocused = false;
    }
});

document.addEventListener('keydown', function(e) {
    // console.log(e.which);
    if (!(e.which > 47 && e.which < 58) &&
        !(e.which > 64 && e.which < 91) &&
        !(e.which > 96 && e.which < 123) &&
        !([32, 8, 186, 187, 188, 189, 190, 222].includes(e.which))) {
        return false;
    }

    // Backspace navigates back in firefox, spacebar scrolls down. F that.
    if (['Backspace', 32].includes(e.which)) {
        e.preventDefault();
    }
    
    if (state.canvasFocused && state.contentEditing) {
        if (e.key === 'Backspace') {
            userText.content = userText.content.slice(0, -1);
        }
        else if (userText.content.length < 21) {
            userText.content = userText.content + e.key.toUpperCase();
        }

        if (userText.content.length >= 4) {
            userText.setFontWidth(70);
        }

        if (userText.content.length >= 1) {
            photoButton.classList.remove('meme-gen--hidden');
        }
        else {
            photoButton.classList.add('meme-gen--hidden');
        }

        userText.centerText();
        userText.updatePosition();
        cursor.update();
    }
});

dummyCanvas.addEventListener('click', function() {
    state.canvasFocused = true;
});

photoButton.addEventListener('click', function() {
    fileInput.click();
    state.contentEditing = false;
});

fileInput.addEventListener('change', function(e) {
    var file = e.target.files[0];
    var filter = /^image\//i;
    var image = document.getElementById('meme-gen__background-image');

    document.getElementById('meme-gen__controls').classList.remove('meme-gen--hidden');

    if (raster) {
        raster.remove();
    }

    if (!(filter.test(file.type))){
        alert("Please only upload image files.");
        return null;
    }

    var reader = new FileReader();

    reader.onload = function (event) {

        image.onload = function () {
            raster = new Raster(image).sendToBack();

            // Scale image if necessary
            var bounds = raster.bounds;
            var smallerDimension = Math.min(bounds.width, bounds.height);
            raster.scale(canvas.offsetWidth / smallerDimension);
            raster.position = view.center;
            raster.opacity = 0;
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

downloadLink.addEventListener('click', function() {
    var canvas = document.getElementById('meme-gen__canvas-hidden');
    this.href = canvas.toDataURL('image/jpeg');
    this.download = 'la-loves-' + userText.content.toLowerCase().replace(/ /g, '-') + '.png';
});

/* ==========================================================================
    Utiltiy Functions
 ========================================================================== */

/* ==========================================================================
    Animation
 ========================================================================== */

function onFrame(e) {
    if (state.contentEditing) {
        cursor.blink(0.02);
    }
    else {
        cursor.opacity = 0;
    }

    if (raster && raster.opacity < 1) {
        raster.opacity += 0.1;
    }

    var dest = document.getElementById('meme-gen__canvas-dummy');
    var ctx = dest.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(canvas, 0, 0, dest.width, dest.height);
}
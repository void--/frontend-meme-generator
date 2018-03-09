var state = {
    contentEditing: true,
    canvasFocused: false
};

var banned = new RegExp(memeGenBannedWords.join('|'), 'i');

/* ==========================================================================
    Canvas Elements
 ========================================================================== */

var canvas = document.getElementById('meme-gen__canvas-hidden');
var dummyCanvas = document.getElementById('meme-gen__canvas-dummy');
var dummyInput = document.getElementById('meme-gen__dummy-input');
var photoButton = document.getElementById('meme-gen__photo-button');
var doneButton = document.getElementById('meme-gen__done');
var colorToggle = document.getElementById('meme-gen__color-toggle');
var controlsOne = document.getElementById('meme-gen__controls-1');
var controlsTwo = document.getElementById('meme-gen__controls-2');
var fileInput = document.getElementById('meme-gen__file-upload');
var downloadLink = document.getElementById('meme-gen__download-link');
var reloadButton = document.getElementById('meme-gen__reload-button');
var defaultImages = document.querySelectorAll('.meme-gen__default-image');
var raster = null;
var textColor = 'white';

PointText.prototype.centerText = function() {
    this.point.x = view.center.x - (this.bounds.width/2);
};

PointText.prototype.setFontWidth = function(percent) {
    this.fontSize = 1;

    while (this.bounds.width < (percent/100) * canvas.offsetWidth) {
        this.fontSize += 1;

        if (this.fontSize >= 450) break;
    }
};

var defaultImage = new Raster('./assets/default_images/1.jpg', view.center).sendToBack();

var laLove = new PointText({
    point: [view.bounds.x + (view.bounds.width * 10/100) - 15, view.center.y],
    content: 'LA',
    fontFamily: 'FatFont',
    fontSize: 550,
    fillColor: textColor
});

var heart = project.importSVG('<path xmlns="http://www.w3.org/2000/svg" class="cls-1" d="M782.21,39.5c14.88,0,30.75.8,47.7,2.46C933.11,52,1052.44,146.52,1067,327.57v60.26c-13.53,173.29-144.37,387.05-526.71,655.22C158,774.88,27.15,561.12,13.61,387.83V327.57C28.14,146.52,147.47,52,250.66,42c17-1.66,32.83-2.46,47.71-2.46C417.61,39.5,474.82,91,540.29,169.07,605.78,91,663,39.5,782.21,39.5"/>');

heart.bounds.height = 400;
heart.bounds.width = 400;
heart.fillColor = textColor;
heart.position = [view.bounds.width - (view.bounds.width * 10/100) - (heart.bounds.width / 2), view.center.y - (heart.bounds.height / 2)];

var userText = new PointText({
    point: view.center,
    content: '',
    fontFamily: 'FatFont',
    fontSize: 450,
    leading: this.fontSize,
    fillColor: textColor
});

userText.updatePosition = function() {
    this.position.y = heart.bounds.bottom + this.fontSize * .41 + 80;
};

userText.updatePosition();

var cursor = new Shape.Rectangle({
    fillColor: textColor
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
    if ((e.target !== dummyCanvas) && (e.target !== dummyInput)) {
        state.canvasFocused = false;
    }
});

defaultImage.onLoad = function() {
    [2,3,4,5,6,7,8,9].forEach(function (el) {
        var img = new Image();
        img.src = "./assets/default_images/" + el + ".jpg";
        img.style.display = 'none';
        document.querySelector("body").appendChild(img);
    })
};

dummyInput.addEventListener('input', function(e) {
    if (state.canvasFocused && state.contentEditing) {
        if (e.target.value.match(banned)) {
            e.target.value = '';
            userText.content = '';
            userText.fontSize = laLove.fontSize;
        }

        if (e.target.value.length < 21) {
            userText.content = e.target.value.toUpperCase();
        }

        if (userText.content.length >= 4) {
            userText.setFontWidth(80);
        }

        userText.centerText();
        userText.updatePosition();

        // yes there are some magic numbers in here... There is some undisclosed distance between
        // the text "top" and the actual top of the letters. ¯\_(ツ)_/¯
        var realTop = laLove.bounds.top + 105;
        var realBottom = userText.bounds.bottom - 0.3*userText.bounds.height;
        var marginWidth = (view.bounds.height - (realBottom - realTop)) / 2;
        var delta = realTop - marginWidth;

        laLove.bounds.top = laLove.bounds.top - delta;
        heart.bounds.top = heart.bounds.top - delta;
        userText.bounds.top = userText.bounds.top - delta;

        cursor.update();
    }
});

dummyInput.addEventListener('keydown', function(e) {
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }

    if ((e.target.value.length >= 20) && (e.key !== 'Backspace')) {
        e.preventDefault();
    }
});

dummyInput.addEventListener('click', function(e) {
    state.canvasFocused = true;
});

photoButton.addEventListener('click', function() {
    fileInput.click();
});

colorToggle.addEventListener('click', function() {
    this.classList.toggle('meme-gen__color-toggle--white');

    if (this.classList.contains('meme-gen__color-toggle--white')) {
        textColor = 'white';
    }
    else {
        textColor = 'black';
    }

    laLove.fillColor = textColor;
    heart.fillColor = textColor;
    userText.fillColor = textColor;
    cursor.fillColor = textColor;
});

defaultImages.forEach(function(el, i) {
   el.addEventListener('click', function(e) {

       if (raster) {
           raster.remove();
       }

       if (defaultImage) {
           defaultImage.remove();
       }

       raster = new Raster(e.target.src.replace('/thumbnails', ''), view.center).sendToBack();
       raster.opacity = 0;
   });
});

doneButton.addEventListener('click', function() {
    controlsOne.classList.add('meme-gen--hidden');
    controlsTwo.classList.remove('meme-gen--hidden');
    state.contentEditing = false;
});

fileInput.addEventListener('change', function(e) {
    var file = e.target.files[0];
    var filter = /^image\//i;
    var image = new Image();

    if (raster) {
        raster.remove();
    }

    if (defaultImage) {
        defaultImage.remove();
    }

    if (!(filter.test(file.type))){
        alert("Please only upload image files.");
        return null;
    }

    var reader = new FileReader();

    reader.onload = function (event) {

        image.onload = function () {

            window.EXIF.getData(image, function() {
                var orientation = EXIF.getTag(this, 'Orientation');

                var tempCanvas = document.createElement("canvas");
                var tempCtx = tempCanvas.getContext("2d");
                var w = image.width;
                var h = image.height;

                tempCanvas.setAttribute('width', 1200);
                tempCanvas.setAttribute('height', 1200);

                // // Crop a square out of the middle
                if (image.width > image.height) {
                    tempCtx.drawImage(image,
                        // Height will be the final w & h, so (w-h) / 2 is the amount to crop off of each side.
                        ((w - h) / 2), 0,
                        h, h,
                        0, 0,
                        1200, 1200
                    );
                }
                // Same as above but swap width for height.
                else {
                    tempCtx.drawImage(image,
                        0, ((h - w) / 2),
                        w, w,
                        0, 0,
                        1200, 1200
                    );
                }

                dataurl = tempCanvas.toDataURL('image/jpeg');

                raster = new Raster(dataurl).sendToBack();

                switch (orientation) {
                    case 3:
                        raster.rotate(180);
                        break;
                    case 6:
                        raster.rotate(90);
                        break;
                    case 8:
                        raster.rotate(-90);
                        break;
                    default:
                        // do nothing.
                }

                raster.position = view.center;
                raster.opacity = 0;
            });
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

downloadLink.addEventListener('click', function() {
    var canvas = document.getElementById('meme-gen__canvas-hidden');
    this.href = canvas.toDataURL('image/jpeg');
    this.download = 'la-loves-' + userText.content.toLowerCase().replace(/ /g, '-') + '.jpeg';
});

reloadButton.addEventListener('click', function() {
    location.href = location.origin + location.pathname + '#meme-gen__container';
    location.reload();
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
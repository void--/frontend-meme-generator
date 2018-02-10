var state = {
    contentEditing: true,
    canvasFocused: false
};

/* ==========================================================================
    Canvas Elements
 ========================================================================== */

var canvas = document.getElementById('meme-gen__canvas');

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
    if (e.target !== canvas) {
        state.canvasFocused = false;
    }
});

document.addEventListener('keydown', function(e) {
    if (!(e.which > 47 && e.which < 58) &&
        !(e.which > 64 && e.which < 91) &&
        !(e.which > 96 && e.which < 123) &&
        !(e.which === 32 || e.which === 8)) {
        return false;
    }

    if (state.canvasFocused && state.contentEditing) {
        if (e.key === 'Backspace') {
            userText.content = userText.content.slice(0, -1);
        }
        else {
            if (userText.content.length === 12) {
                userText.content += '\n';
            }
            userText.content = userText.content + e.key.toUpperCase();
        }

        if (userText.content.length >= 4) {
            userText.setFontWidth(70);
        }

        userText.centerText();
        userText.updatePosition();
        cursor.update();
    }
});

canvas.addEventListener('click', function() {
    state.canvasFocused = true;
});

/* ==========================================================================
    Animation
 ========================================================================== */

function onFrame(e) {
    if (state.contentEditing) {
        cursor.blink(0.02);
    }
}
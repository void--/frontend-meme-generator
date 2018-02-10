var state = {
    contentEditing: true,
    canvasFocused: false
};

/* ==========================================================================
 Canvas Elements
 ========================================================================== */

var stage = new createjs.Stage("meme-gen__canvas");
var canvas = document.getElementById('meme-gen__canvas');

window.onload = function() {
    createjs.Text.prototype.centerText = function() {
        this.x = 600 - (this.getBounds().width/2);
    };

    createjs.Text.prototype.setFontWidth = function(percent) {
        var fontSize = 1;

        while (this.getBounds().width < (percent/100) * canvas.width) {
            fontSize += 1;
            this.font = fontSize + "px 'FatFont'";
        }
    };

    // "La ❤" text and positioning
    var laLove = new createjs.Text("LA ❤", "300px 'FatFont'", "black");

    laLove.setFontWidth(70);
    laLove.centerText();
    laLove.y = canvas.height/2 - (laLove.getBounds().height) - 50;

    stage.addChild(laLove);

    var userText = new createjs.Text("|", "300px 'FatFont'", "black");

    userText.updatePosition = function() {
        var bounds = laLove.getTransformedBounds();
        this.y = bounds.y + bounds.height;
        this.centerText();
    };

    userText.updatePosition();

    stage.addChild(userText);

    stage.update();
};



//
// var userText = new PointText({
//     point: view.center,
//     content: '',
//     fontFamily: 'FatFont',
//     fontSize: laLove.fontSize,
//     fillColor: 'black'
// });
//
// userText.updatePosition = function() {
//     this.position.y = laLove.bounds.bottom + userText.fontSize / 4;
// };
//
// userText.updatePosition();
//
// var cursor = new Shape.Rectangle({
//     fillColor: 'red'
// });
//
// cursor.update = function() {
//     this.size = [userText.fontSize/8, userText.fontSize * .8];
//     this.position.x = userText.bounds.right;
//     this.position.y = userText.bounds.centerY - userText.fontSize / 15;
// };
//
// cursor.update();
//
// cursor.blink = function(blinkRate) {
//     if (this.opacity >= 1) {
//         this.blinkOpacity = 'decreasing';
//     }
//     else if (this.opacity <= 0.1) {
//         this.blinkOpacity = 'increasing';
//     }
//
//     if (this.blinkOpacity === 'decreasing') {
//         this.opacity -= blinkRate;
//     }
//     else if (this.blinkOpacity === 'increasing') {
//         this.opacity += blinkRate;
//     }
// };
//
// userText.centerText();
//
// /* ==========================================================================
//  Event Listeners
//  ========================================================================== */
//
// document.addEventListener('click', function(e) {
//     if (e.target !== canvas) {
//         state.canvasFocused = false;
//     }
// });
//
// document.addEventListener('keydown', function(e) {
//     if (!(e.which > 47 && e.which < 58) &&
//         !(e.which > 64 && e.which < 91) &&
//         !(e.which > 96 && e.which < 123) &&
//         !(e.which === 32 || e.which === 8)) {
//         return false;
//     }
//
//     if (state.canvasFocused && state.contentEditing) {
//         if (e.key === 'Backspace') {
//             userText.content = userText.content.slice(0, -1);
//         }
//         else {
//             if (userText.content.length === 12) {
//                 userText.content += '\n';
//             }
//             userText.content = userText.content + e.key.toUpperCase();
//         }
//
//         if (userText.content.length >= 4) {
//             userText.setFontWidth(70);
//         }
//
//         userText.centerText();
//         userText.updatePosition();
//         cursor.update();
//     }
// });
//
// canvas.addEventListener('click', function() {
//     state.canvasFocused = true;
// });
//
// /* ==========================================================================
//  Animation
//  ========================================================================== */
//

window.setInterval(function() {
    // if (state.contentEditing) {
    //     cursor.blink(0.02);
    // }
}, 20);

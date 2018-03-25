var ledButtons = document.getElementsByClassName('btn led');
var colorButtons = document.getElementsByClassName('btn color');

window.onload = () => {
    for (ledButton of ledButtons) {
        ledButton.addEventListener('click', ledClicked);
    }
    for (colorButton of colorButtons) {
        colorButton.addEventListener('click', colorClicked);
    }
};

var activeColor = "color-1";

function ledClicked() {
    console.log(`${this.id} clicked!`);
    var color = colors[activeColor];
    this.style["background-color"] = color;
}

function colorClicked() {
    console.log(`${this.id} clicked!`);
    activeColor = this.id;
}

var colors = {
    "color-1": "red",
    "color-2": "green",
    "color-3": "blue"
};
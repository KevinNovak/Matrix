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
    "color-1": "#b21f35",
    "color-2": "#d82735",
    "color-3": "#ff7435",
    "color-4": "#ffa135",
    "color-5": "#ffcb35",
    "color-6": "#fff735",
    "color-7": "#00753a",
    "color-8": "#009e47",
    "color-9": "#16dd36",
    "color-10": "#0052a5",
    "color-11": "#0079e7",
    "color-12": "#06a9fc",
    "color-13": "#681e7e",
    "color-14": "#7d3cb5",
    "color-15": "#bd7af6",
    "color-16": "#dddddd"
};
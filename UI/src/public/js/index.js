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

function ledClicked() {
    alert(`${this.id} clicked!`);
}

function colorClicked() {
    alert(`${this.id} clicked!`);
}
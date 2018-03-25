var ledButtons = document.getElementsByClassName('btn led');

window.onload = () => {
    for (ledButton of ledButtons) {
        ledButton.addEventListener('click', ledClicked);
    }    
};

function ledClicked() {
    alert(`${this.id} clicked!`);
}
const app = document.getElementById("app");
function updateView() {
  app.innerHTML = `
        <div class="slider">
        <span id="rangeValue">3x3</span>
        <input type="range" min="1" max="50" value="3" onchange="initMaze(this.value); mazeView()" oninput="rangeValue.innerText = this.value + 'x' + this.value">
        </div>
        <span id="pathText"></span>
        <div class="grid-container"></div>
        
    `;
}

updateView();

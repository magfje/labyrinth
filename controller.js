let pathText = "";

mazeView();

function mazeView() {
  let gridContainer = document.querySelector(".grid-container");
  let size = mazeModel.size; // 3
  let gridSize = size * 2 + 1;

  gridContainer.innerHTML = "";
  gridContainer.style.setProperty(
    "grid-template-columns",
    "repeat(" + gridSize + ", auto)"
  );
  gridContainer.style.setProperty(
    "grid-template-rows",
    "repeat(" + gridSize + ", auto)"
  );

  mazeModel.rows.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      let gridItem = document.createElement("div");
      gridItem.classList.add("grid-item");

      if (col.isEdge == true) {
        gridItem.classList.add("grid-isEdge");
      } else if ((col.isTall || col.isWide) && col.isTall !== col.isWide) {
        gridItem.classList.add("pointer");
        gridItem.addEventListener("click", function () {
          gridItem.classList.toggle("grid-isClosed");
          if (col.isOpen == true) col.isOpen = false;
          else if (col.isOpen == false) col.isOpen = true;
          mazeView();
        });
      }

      if (col.isTall) gridItem.classList.add("grid-isTall");
      if (col.isWide) gridItem.classList.add("grid-isWide");
      if (col.isOpen == false) gridItem.classList.add("grid-isClosed");
      if (col.isStart == true) gridItem.classList.add("grid-isStart");
      if (col.isEnd == true) gridItem.classList.add("grid-isEnd");

      gridContainer.appendChild(gridItem);

      //draws path
      if (col.isPath == true) {
        let smallSquare = document.createElement("div");
        smallSquare.classList.add("small-square");
        gridItem.appendChild(smallSquare);
      }
    });
  });

  //pathing
  let { startRow, startCol, endRow, endCol } = findStartAndEnd();
  let shortestPath = findShortestPath(startRow, startCol, endRow, endCol);

  if (shortestPath < 0) pathText = "No path found!";
  else pathText = "Shortest Path: " + shortestPath / 2 + " Steps";

  document.getElementById("pathText").textContent = pathText;
  //console.log(shortestPath);
}

function initMaze(mSize) {
  let gridSizeIndex = mSize * 2 + 1;

  mazeObject = new Object();
  mazeObject.size = mSize;
  mazeObject.rows = [];

  // create an array to hold all the edges
  const edges = [];

  for (let row = 0; row < gridSizeIndex; row++) {
    // rows
    newRow = [];
    for (let column = 0; column < gridSizeIndex; column++) {
      // objects in rows
      newColumn = new Object();

      let randNo = Math.floor(Math.random() * 4);
      if (randNo > 1) newColumn.isOpen = true; // random if open or closed
      else newColumn.isOpen = false;

      if (row % 2 == 0) newColumn.isTall = false;
      else newColumn.isTall = true;
      if (column % 2 == 0) newColumn.isWide = false;
      else newColumn.isWide = true;

      if (row == 0 || row == mSize * 2) {
        // is top or bottom
        newColumn.isOpen = false;
        newColumn.isTall = false;
        newColumn.isEdge = true;

        if (newColumn.isWide == true) {
          newColumn.isOpen = true;
          edges.push({
            column: column,
            row: row,
          });
        }
      } else if (column == 0 || column == mSize * 2) {
        // is left or right
        newColumn.isOpen = false;
        newColumn.isWide = false;
        newColumn.isEdge = true;

        if (newColumn.isTall == true) {
          newColumn.isOpen = true;
          edges.push({
            column: column,
            row: row,
          });
        }
      }

      if (newColumn.isWide && newColumn.isTall) newColumn.isOpen = true;
      if (!newColumn.isWide && !newColumn.isTall) newColumn.isOpen = false;

      newRow.push(newColumn);
    }
    mazeObject.rows.push(newRow);
  }

  // randomly select two edges and set isStart/end
  const randomEdgeIndexes = getRandomIndexes(edges.length, 2);
  mazeObject.rows[edges[randomEdgeIndexes[0]].row][
    edges[randomEdgeIndexes[0]].column
  ].isStart = true;
  mazeObject.rows[edges[randomEdgeIndexes[1]].row][
    edges[randomEdgeIndexes[1]].column
  ].isEnd = true;
  //console.log(edges[randomEdgeIndexes[1]]);
  mazeModel = mazeObject;
}

// helper function to get `count` number of random indexes from an array of length `length`
function getRandomIndexes(length, count) {
  const indexes = [];
  while (indexes.length < count) {
    const randomIndex = Math.floor(Math.random() * length);
    if (!indexes.includes(randomIndex)) {
      indexes.push(randomIndex);
    }
  }
  return indexes;
}

function findStartAndEnd() {
  let startRow, startCol, endRow, endCol;
  mazeModel.rows.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col.isStart) {
        startRow = rowIndex;
        startCol = colIndex;
      }
      if (col.isEnd) {
        endRow = rowIndex;
        endCol = colIndex;
      }
    });
  });
  return { startRow, startCol, endRow, endCol };
}

function findShortestPath(startRow, startCol, endRow, endCol) {
  const queue = [{ row: startRow, col: startCol, steps: 0 }];
  const visited = new Set();
  const parent = {};

  while (queue.length > 0) {
    const { row, col, steps } = queue.shift();

    if (row === endRow && col === endCol) {
      let node = `${row},${col}`;
      while (node !== `${startRow},${startCol}`) {
        const [row, col] = node.split(",");
        mazeModel.rows[row][col].isPath = true;
        node = parent[node];
      }
      return steps;
    }

    const neighbors = getNeighbors(row, col);

    for (const { row: neighborRow, col: neighborCol } of neighbors) {
      const key = `${neighborRow},${neighborCol}`;
      if (!visited.has(key)) {
        visited.add(key);
        parent[key] = `${row},${col}`;
        queue.push({ row: neighborRow, col: neighborCol, steps: steps + 1 });
      }
    }
  }

  return -1;
}

function getNeighbors(row, col) {
  const neighbors = [];

  if (row > 0 && mazeModel.rows[row - 1][col].isOpen) {
    neighbors.push({ row: row - 1, col });
  }

  if (row < mazeModel.size * 2 && mazeModel.rows[row + 1][col].isOpen) {
    neighbors.push({ row: row + 1, col });
  }

  if (col > 0 && mazeModel.rows[row][col - 1].isOpen) {
    neighbors.push({ row, col: col - 1 });
  }

  if (col < mazeModel.size * 2 && mazeModel.rows[row][col + 1].isOpen) {
    neighbors.push({ row, col: col + 1 });
  }

  return neighbors;
}

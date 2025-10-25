const bfsCanvas = document.getElementById("bfsCanvas");
const dfsCanvas = document.getElementById("dfsCanvas");
const bfsCtx = bfsCanvas.getContext("2d");
const dfsCtx = dfsCanvas.getContext("2d");

let rows = 25;
let cols = 25;
let cellSize = 22;
let maze = [];
let start = { row: 1, col: 1 };
let end = { row: rows - 2, col: cols - 2 };
let animationSpeed = 20;
let isRunning = false;

function initMaze() {
  maze = [];
  for (let i = 0; i < rows; i++) {
    maze[i] = [];
    for (let j = 0; j < cols; j++) {
      maze[i][j] = 1;
    }
  }
}

function generateMaze() {
  initMaze();
  const stack = [];
  const startCell = { row: 1, col: 1 };
  maze[startCell.row][startCell.col] = 0;
  stack.push(startCell);

  const directions = [
    { dr: -2, dc: 0 },
    { dr: 2, dc: 0 },
    { dr: 0, dc: -2 },
    { dr: 0, dc: 2 },
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = [];

    for (const dir of directions) {
      const newRow = current.row + dir.dr;
      const newCol = current.col + dir.dc;

      if (
        newRow > 0 &&
        newRow < rows - 1 &&
        newCol > 0 &&
        newCol < cols - 1 &&
        maze[newRow][newCol] === 1
      ) {
        neighbors.push({
          row: newRow,
          col: newCol,
          dr: dir.dr,
          dc: dir.dc,
        });
      }
    }

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      maze[next.row][next.col] = 0;
      maze[current.row + next.dr / 2][current.col + next.dc / 2] = 0;
      stack.push({ row: next.row, col: next.col });
    } else {
      stack.pop();
    }
  }

  maze[start.row][start.col] = 0;
  maze[end.row][end.col] = 0;

  reset();
}

function drawMaze(ctx, explored = new Set(), path = []) {
  ctx.fillStyle = "#0f0f1e";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = j * cellSize;
      const y = i * cellSize;

      if (maze[i][j] === 1) {
        ctx.fillStyle = "#1a1a2e";
      } else {
        ctx.fillStyle = "white";
      }

      ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
    }
  }

  const color =
    ctx === bfsCtx ? "rgba(78, 204, 163, 0.4)" : "rgba(255, 107, 107, 0.4)";
  explored.forEach((key) => {
    const [row, col] = key.split(",").map(Number);
    ctx.fillStyle = color;
    ctx.fillRect(col * cellSize, row * cellSize, cellSize - 1, cellSize - 1);
  });

  path.forEach(({ row, col }) => {
    ctx.fillStyle = "#ffd93d";
    const padding = cellSize > 15 ? 3 : 1;
    const size = cellSize > 15 ? cellSize - 7 : cellSize - 2;
    ctx.fillRect(
      col * cellSize + padding,
      row * cellSize + padding,
      size,
      size
    );
  });

  ctx.fillStyle = "#4ecca3";
  const startPadding = cellSize > 15 ? 2 : 1;
  const startSize = cellSize > 15 ? cellSize - 5 : cellSize - 2;
  ctx.fillRect(
    start.col * cellSize + startPadding,
    start.row * cellSize + startPadding,
    startSize,
    startSize
  );

  ctx.fillStyle = "#ff6b6b";
  ctx.fillRect(
    end.col * cellSize + startPadding,
    end.row * cellSize + startPadding,
    startSize,
    startSize
  );
}

async function solveBFS(skipLock = false) {
  if (isRunning && !skipLock) return;
  if (!skipLock) {
    isRunning = true;
    disableButtons();
  }

  const startTime = performance.now();
  const explored = new Set();
  const queue = [[start]];
  const visited = new Set();
  visited.add(`${start.row},${start.col}`);

  document.getElementById("bfsStatus").textContent = "Solving...";

  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];
    explored.add(`${current.row},${current.col}`);

    document.getElementById("bfsExplored").textContent = explored.size;
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    document.getElementById("bfsTime").textContent = elapsed + "s";
    drawMaze(bfsCtx, explored, []);
    await sleep(animationSpeed);

    if (current.row === end.row && current.col === end.col) {
      drawMaze(bfsCtx, explored, path);
      document.getElementById("bfsPath").textContent = path.length;
      const finalTime = ((performance.now() - startTime) / 1000).toFixed(2);
      document.getElementById("bfsTime").textContent = finalTime + "s";
      document.getElementById("bfsStatus").textContent = "✓ Found!";
      if (!skipLock) {
        isRunning = false;
        enableButtons();
      }
      return;
    }

    for (const dir of directions) {
      const newRow = current.row + dir.dr;
      const newCol = current.col + dir.dc;
      const key = `${newRow},${newCol}`;

      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        maze[newRow][newCol] === 0 &&
        !visited.has(key)
      ) {
        visited.add(key);
        queue.push([...path, { row: newRow, col: newCol }]);
      }
    }
  }

  const finalTime = ((performance.now() - startTime) / 1000).toFixed(2);
  document.getElementById("bfsTime").textContent = finalTime + "s";
  document.getElementById("bfsStatus").textContent = "No path found";
  if (!skipLock) {
    isRunning = false;
    enableButtons();
  }
}

async function solveDFS(skipLock = false) {
  if (isRunning && !skipLock) return;
  if (!skipLock) {
    isRunning = true;
    disableButtons();
  }

  const startTime = performance.now();
  const explored = new Set();
  const visited = new Set();
  const path = [];
  let found = false;

  document.getElementById("dfsStatus").textContent = "Solving...";

  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  async function dfs(row, col) {
    if (found) return true;

    const key = `${row},${col}`;
    if (
      row < 0 ||
      row >= rows ||
      col < 0 ||
      col >= cols ||
      maze[row][col] === 1 ||
      visited.has(key)
    ) {
      return false;
    }

    visited.add(key);
    explored.add(key);
    path.push({ row, col });

    document.getElementById("dfsExplored").textContent = explored.size;
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    document.getElementById("dfsTime").textContent = elapsed + "s";
    drawMaze(dfsCtx, explored, path);
    await sleep(animationSpeed);

    if (row === end.row && col === end.col) {
      found = true;
      return true;
    }

    for (const dir of directions) {
      if (await dfs(row + dir.dr, col + dir.dc)) {
        return true;
      }
    }

    path.pop();
    drawMaze(dfsCtx, explored, path);
    return false;
  }

  await dfs(start.row, start.col);

  const finalTime = ((performance.now() - startTime) / 1000).toFixed(2);
  document.getElementById("dfsTime").textContent = finalTime + "s";

  if (found) {
    drawMaze(dfsCtx, explored, path);
    document.getElementById("dfsPath").textContent = path.length;
    document.getElementById("dfsStatus").textContent = "✓ Found!";
  } else {
    document.getElementById("dfsStatus").textContent = "No path found";
  }

  if (!skipLock) {
    isRunning = false;
    enableButtons();
  }
}

async function solveBoth() {
  if (isRunning) return;
  isRunning = true;
  disableButtons();
  await Promise.all([solveBFS(true), solveDFS(true)]);
  isRunning = false;
  enableButtons();
}

function reset() {
  document.getElementById("bfsExplored").textContent = "0";
  document.getElementById("bfsPath").textContent = "0";
  document.getElementById("bfsTime").textContent = "0.00s";
  document.getElementById("bfsStatus").textContent = "Ready";
  document.getElementById("dfsExplored").textContent = "0";
  document.getElementById("dfsPath").textContent = "0";
  document.getElementById("dfsTime").textContent = "0.00s";
  document.getElementById("dfsStatus").textContent = "Ready";

  drawMaze(bfsCtx);
  drawMaze(dfsCtx);
}

function changeSpeed(speed) {
  // Remove active class from all speed buttons
  document
    .querySelectorAll(".speed-btn")
    .forEach((btn) => btn.classList.remove("active"));

  if (speed === "slow") {
    animationSpeed = 50;
    event.target.classList.add("active");
  } else if (speed === "normal") {
    animationSpeed = 20;
    event.target.classList.add("active");
  } else if (speed === "fast") {
    animationSpeed = 5;
    event.target.classList.add("active");
  }
}

function changeMazeSize(size) {
  // Remove active class from all size buttons
  document
    .querySelectorAll(".size-btn")
    .forEach((btn) => btn.classList.remove("active"));

  if (size === "small") {
    rows = 25;
    cols = 25;
    cellSize = 22;
    document.getElementById("smallBtn").classList.add("active");
  } else if (size === "big") {
    rows = 55;
    cols = 55;
    cellSize = 10;
    document.getElementById("bigBtn").classList.add("active");
  }
  start = { row: 1, col: 1 };
  end = { row: rows - 2, col: cols - 2 };
  generateMaze();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function disableButtons() {
  document.getElementById("solveBtn").disabled = true;
  document.getElementById("bfsBtn").disabled = true;
  document.getElementById("dfsBtn").disabled = true;
  document.getElementById("generateBtn").disabled = true;
  document.getElementById("resetBtn").disabled = true;
  document.getElementById("smallBtn").disabled = true;
  document.getElementById("bigBtn").disabled = true;
}

function enableButtons() {
  document.getElementById("solveBtn").disabled = false;
  document.getElementById("bfsBtn").disabled = false;
  document.getElementById("dfsBtn").disabled = false;
  document.getElementById("generateBtn").disabled = false;
  document.getElementById("resetBtn").disabled = false;
  document.getElementById("smallBtn").disabled = false;
  document.getElementById("bigBtn").disabled = false;
}

function toggleInfo() {
  const overlay = document.getElementById("infoOverlay");
  overlay.classList.toggle("active");

  // Prevent body scroll when overlay is open
  if (overlay.classList.contains("active")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
}

// Close overlay when clicking outside the content
document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.getElementById("infoOverlay");
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      toggleInfo();
    }
  });

  // Close overlay with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      toggleInfo();
    }
  });
});

// Initialize the maze on page load
generateMaze();

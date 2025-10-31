import { dom, state } from "./config.js";
import { generateMaze } from "./maze.js";
import { playClickSound } from "./sounds.js";

// Draw the maze with optional explored cells and path
export function drawMaze(ctx, explored = new Set(), path = []) {
  // Fill background (black for pixel art)
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw walls and paths (monochrome)
  for (let i = 0; i < state.rows; i++) {
    for (let j = 0; j < state.cols; j++) {
      const x = j * state.cellSize;
      const y = i * state.cellSize;
      // Walls are dark gray, paths are white
      ctx.fillStyle = state.maze[i][j] === 1 ? "#2a2a2a" : "#ffffff";
      ctx.fillRect(x, y, state.cellSize - 1, state.cellSize - 1);
    }
  }

  // Draw explored cells (green for BFS, red for DFS - pixel art colors)
  const color = ctx === dom.bfsCtx ? "#4ade80" : "#ef4444";
  explored.forEach((key) => {
    const [row, col] = key.split(",").map(Number);
    ctx.fillStyle = color;
    ctx.fillRect(
      col * state.cellSize,
      row * state.cellSize,
      state.cellSize - 1,
      state.cellSize - 1
    );
  });

  // Draw final path (yellow/gold with black outline for visibility)
  path.forEach(({ row, col }) => {
    const padding = state.cellSize > 15 ? 3 : 1;
    const size = state.cellSize > 15 ? state.cellSize - 7 : state.cellSize - 2;

    // Black border
    ctx.fillStyle = "#000000";
    ctx.fillRect(
      col * state.cellSize + padding - 1,
      row * state.cellSize + padding - 1,
      size + 2,
      size + 2
    );

    // Yellow/gold fill
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(
      col * state.cellSize + padding,
      row * state.cellSize + padding,
      size,
      size
    );
  }); // Draw start point (white with black outline)
  const startPadding = state.cellSize > 15 ? 2 : 1;
  const startSize =
    state.cellSize > 15 ? state.cellSize - 5 : state.cellSize - 2;

  // Black border
  ctx.fillStyle = "#000000";
  ctx.fillRect(
    state.start.col * state.cellSize + startPadding - 1,
    state.start.row * state.cellSize + startPadding - 1,
    startSize + 2,
    startSize + 2
  );

  // Light gray fill for start
  ctx.fillStyle = "#e0e0e0";
  ctx.fillRect(
    state.start.col * state.cellSize + startPadding,
    state.start.row * state.cellSize + startPadding,
    startSize,
    startSize
  );

  // Draw end point (dark gray with black outline)
  ctx.fillStyle = "#000000";
  ctx.fillRect(
    state.end.col * state.cellSize + startPadding - 1,
    state.end.row * state.cellSize + startPadding - 1,
    startSize + 2,
    startSize + 2
  );

  ctx.fillStyle = "#555555";
  ctx.fillRect(
    state.end.col * state.cellSize + startPadding,
    state.end.row * state.cellSize + startPadding,
    startSize,
    startSize
  );
}

// Reset statistics and redraw clean maze
export function resetUI() {
  dom.bfsExplored.textContent = "0";
  dom.bfsPath.textContent = "0";
  dom.bfsTime.textContent = "0.00s";
  dom.bfsStatus.textContent = "Ready";
  dom.dfsExplored.textContent = "0";
  dom.dfsPath.textContent = "0";
  dom.dfsTime.textContent = "0.00s";
  dom.dfsStatus.textContent = "Ready";

  drawMaze(dom.bfsCtx);
  drawMaze(dom.dfsCtx);
}

// Change animation speed
export function handleSpeedChange(speed) {
  playClickSound(); // Pixel sound effect!

  document.querySelectorAll("#speedGroup .speed-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.speed === speed) {
      btn.classList.add("active");
    }
  });

  if (speed === "slow") state.animationSpeed = 50;
  else if (speed === "normal") state.animationSpeed = 20;
  else if (speed === "fast") state.animationSpeed = 5;
}

// Change maze size
export function handleSizeChange(size) {
  playClickSound(); // Pixel sound effect!

  document.querySelectorAll("#sizeGroup .size-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.size === size) {
      btn.classList.add("active");
    }
  });

  if (size === "small") {
    state.rows = 25;
    state.cols = 25;
    state.cellSize = 22;
  } else if (size === "big") {
    state.rows = 55;
    state.cols = 55;
    state.cellSize = 10;
  }
  state.start = { row: 1, col: 1 };
  state.end = { row: state.rows - 2, col: state.cols - 2 };

  generateMaze();
  resetUI();
}

// Disable buttons during solving
export function disableButtons() {
  state.isRunning = true;
  dom.solveBtn.disabled = true;
  dom.bfsBtn.disabled = true;
  dom.dfsBtn.disabled = true;
  dom.generateBtn.disabled = true;
  dom.resetBtn.disabled = true;
  document
    .querySelectorAll("#sizeGroup button")
    .forEach((b) => (b.disabled = true));
}

// Enable buttons after solving
export function enableButtons() {
  state.isRunning = false;
  dom.solveBtn.disabled = false;
  dom.bfsBtn.disabled = false;
  dom.dfsBtn.disabled = false;
  dom.generateBtn.disabled = false;
  dom.resetBtn.disabled = false;
  document
    .querySelectorAll("#sizeGroup button")
    .forEach((b) => (b.disabled = false));
}

// Toggle info overlay
export function toggleInfo() {
  dom.infoOverlay.classList.toggle("active");
  document.body.style.overflow = dom.infoOverlay.classList.contains("active")
    ? "hidden"
    : "auto";
}

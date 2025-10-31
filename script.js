// Get canvas elements and their 2D drawing contexts
const bfsCanvas = document.getElementById("bfsCanvas");
const dfsCanvas = document.getElementById("dfsCanvas");
const bfsCtx = bfsCanvas.getContext("2d");
const dfsCtx = dfsCanvas.getContext("2d");

// Maze configuration
let rows = 25;
let cols = 25;
let cellSize = 22; // Size of each cell in pixels
let maze = []; // 2D array: 0 = path, 1 = wall
let start = { row: 1, col: 1 };
let end = { row: rows - 2, col: cols - 2 };
let animationSpeed = 20; // Delay between animation frames (ms)
let isRunning = false; // Prevents multiple solvers running at once

// Audio context for music generation
let audioContext;
let backgroundMusic;
let isMusicPlaying = false;

// Initialize audio context and create pixel-style music
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Create a simple pixel-style background music loop
function createPixelMusic() {
  if (!audioContext) initAudio();

  // schedule notes slightly ahead of current time for precision
  const baseTime = audioContext.currentTime + 0.05;
  const loopLength = 3.0; // seconds (pattern length)

  // Melody notes (C major feel)
  const melody = [
    { freq: 523.25, time: 0, duration: 0.15 },
    { freq: 659.25, time: 0.2, duration: 0.15 },
    { freq: 783.99, time: 0.4, duration: 0.15 },
    { freq: 659.25, time: 0.6, duration: 0.15 },
    { freq: 698.46, time: 0.8, duration: 0.15 },
    { freq: 783.99, time: 1.0, duration: 0.15 },
    { freq: 880.0, time: 1.2, duration: 0.15 },
    { freq: 783.99, time: 1.4, duration: 0.3 },
  ];

  // Bass notes
  const bass = [
    { freq: 130.81, time: 0, duration: 0.4 },
    { freq: 164.81, time: 0.8, duration: 0.4 },
    { freq: 174.61, time: 1.6, duration: 0.4 },
    { freq: 196.0, time: 2.4, duration: 0.4 },
  ];

  // helper to schedule a single note
  function scheduleNote(freq, startOffset, dur, gainLevel) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, baseTime + startOffset);

    gain.gain.setValueAtTime(0.0, baseTime + startOffset);
    gain.gain.linearRampToValueAtTime(gainLevel, baseTime + startOffset + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, baseTime + startOffset + dur);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(baseTime + startOffset);
    osc.stop(baseTime + startOffset + dur + 0.02);
  }

  melody.forEach((n) => scheduleNote(n.freq, n.time, n.duration, 0.08));
  bass.forEach((n) => scheduleNote(n.freq, n.time, n.duration, 0.05));

  // Schedule next loop slightly before the end to avoid audible gaps
  if (backgroundMusic) {
    clearTimeout(backgroundMusic);
  }
  backgroundMusic = setTimeout(() => {
    if (isMusicPlaying) createPixelMusic();
  }, Math.max(0, (loopLength + 0.2) * 1000));
}

// Toggle music on/off
function toggleMusic() {
  const btn = document.getElementById("musicBtn");
  // simple icon-only toggle
  const SVG_ON = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path d="M11 5 L6 9 H3 v6 h3 l5 4 V5 z" fill="currentColor"></path>
      <path d="M16 8a4 4 0 0 1 0 8" stroke="currentColor" fill="none"></path>
      <path d="M19 5a7 7 0 0 1 0 14" stroke="currentColor" fill="none"></path>
    </svg>`;

  const SVG_OFF = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path d="M11 5 L6 9 H3 v6 h3 l5 4 V5 z" fill="currentColor"></path>
      <line x1="18" y1="6" x2="22" y2="10" stroke="currentColor"/>
      <line x1="22" y1="6" x2="18" y2="10" stroke="currentColor"/>
    </svg>`;

  if (!isMusicPlaying) {
    initAudio();
    isMusicPlaying = true;
    btn.classList.add("music-on");
    btn.innerHTML = SVG_ON;
    createPixelMusic();
  } else {
    isMusicPlaying = false;
    if (backgroundMusic) {
      clearTimeout(backgroundMusic);
      backgroundMusic = null;
    }
    btn.classList.remove("music-on");
    btn.innerHTML = SVG_OFF;
  }
}

// Initialize maze with all walls (1s)
function initMaze() {
  maze = [];
  for (let i = 0; i < rows; i++) {
    maze[i] = [];
    for (let j = 0; j < cols; j++) {
      maze[i][j] = 1;
    }
  }
}

// Generate a random maze using depth-first search algorithm
function generateMaze() {
  initMaze();
  const stack = [];
  const startCell = { row: 1, col: 1 };
  maze[startCell.row][startCell.col] = 0; // Carve out starting cell
  stack.push(startCell);

  // Move in steps of 2 to leave walls between paths
  const directions = [
    { dr: -2, dc: 0 }, // Up
    { dr: 2, dc: 0 }, // Down
    { dr: 0, dc: -2 }, // Left
    { dr: 0, dc: 2 }, // Right
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = [];

    // Find all valid unvisited neighbors
    for (const dir of directions) {
      const newRow = current.row + dir.dr;
      const newCol = current.col + dir.dc;

      if (
        newRow > 0 &&
        newRow < rows - 1 &&
        newCol > 0 &&
        newCol < cols - 1 &&
        maze[newRow][newCol] === 1 // Still a wall (unvisited)
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
      // Pick random neighbor and carve path to it
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      maze[next.row][next.col] = 0; // Carve destination
      maze[current.row + next.dr / 2][current.col + next.dc / 2] = 0; // Carve wall between
      stack.push({ row: next.row, col: next.col });
    } else {
      stack.pop(); // Backtrack if no neighbors
    }
  }

  // Ensure start and end are clear
  maze[start.row][start.col] = 0;
  maze[end.row][end.col] = 0;

  reset();
}

// Draw the maze with optional explored cells and path
function drawMaze(ctx, explored = new Set(), path = []) {
  // Fill background
  ctx.fillStyle = "#0f0f1e";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw walls and paths
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = j * cellSize;
      const y = i * cellSize;

      if (maze[i][j] === 1) {
        ctx.fillStyle = "#1a1a2e"; // Wall color
      } else {
        ctx.fillStyle = "white"; // Path color
      }

      ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
    }
  }

  // Draw explored cells (semi-transparent overlay)
  const color =
    ctx === bfsCtx ? "rgba(78, 204, 163, 0.4)" : "rgba(255, 107, 107, 0.4)";
  explored.forEach((key) => {
    const [row, col] = key.split(",").map(Number);
    ctx.fillStyle = color;
    ctx.fillRect(col * cellSize, row * cellSize, cellSize - 1, cellSize - 1);
  });

  // Draw final path (yellow squares)
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

  // Draw start point (green)
  ctx.fillStyle = "#4ecca3";
  const startPadding = cellSize > 15 ? 2 : 1;
  const startSize = cellSize > 15 ? cellSize - 5 : cellSize - 2;
  ctx.fillRect(
    start.col * cellSize + startPadding,
    start.row * cellSize + startPadding,
    startSize,
    startSize
  );

  // Draw end point (red)
  ctx.fillStyle = "#ff6b6b";
  ctx.fillRect(
    end.col * cellSize + startPadding,
    end.row * cellSize + startPadding,
    startSize,
    startSize
  );
}

// Breadth-First Search: explores layer by layer, guarantees shortest path
async function solveBFS(skipLock = false) {
  if (isRunning && !skipLock) return;
  if (!skipLock) {
    isRunning = true;
    disableButtons();
  }

  const startTime = performance.now();
  const explored = new Set(); // Cells we've checked
  const queue = [[start]]; // Queue of paths (each path is an array of cells)
  const visited = new Set(); // Prevent revisiting cells
  visited.add(`${start.row},${start.col}`);

  document.getElementById("bfsStatus").textContent = "Solving...";

  // Four directions: up, down, left, right
  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  while (queue.length > 0) {
    const path = queue.shift(); // Get next path from queue
    const current = path[path.length - 1]; // Last cell in path
    explored.add(`${current.row},${current.col}`);

    // Update UI
    document.getElementById("bfsExplored").textContent = explored.size;
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    document.getElementById("bfsTime").textContent = elapsed + "s";
    drawMaze(bfsCtx, explored, []);
    await sleep(animationSpeed);

    // Check if we reached the end
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

    // Explore all neighbors
    for (const dir of directions) {
      const newRow = current.row + dir.dr;
      const newCol = current.col + dir.dc;
      const key = `${newRow},${newCol}`;

      // Check if neighbor is valid and unvisited
      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        maze[newRow][newCol] === 0 &&
        !visited.has(key)
      ) {
        visited.add(key);
        queue.push([...path, { row: newRow, col: newCol }]); // Add new path to queue
      }
    }
  }

  // No path found
  const finalTime = ((performance.now() - startTime) / 1000).toFixed(2);
  document.getElementById("bfsTime").textContent = finalTime + "s";
  document.getElementById("bfsStatus").textContent = "No path found";
  if (!skipLock) {
    isRunning = false;
    enableButtons();
  }
}

// Depth-First Search: goes deep into one path before trying others
async function solveDFS(skipLock = false) {
  if (isRunning && !skipLock) return;
  if (!skipLock) {
    isRunning = true;
    disableButtons();
  }

  const startTime = performance.now();
  const explored = new Set(); // All cells we've checked
  const visited = new Set(); // Prevent revisiting
  const path = []; // Current path being explored
  let found = false;

  document.getElementById("dfsStatus").textContent = "Solving...";

  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  // Recursive DFS function
  async function dfs(row, col) {
    if (found) return true;

    const key = `${row},${col}`;
    // Check if cell is invalid or already visited
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
    path.push({ row, col }); // Add to current path

    // Update UI
    document.getElementById("dfsExplored").textContent = explored.size;
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    document.getElementById("dfsTime").textContent = elapsed + "s";
    drawMaze(dfsCtx, explored, path);
    await sleep(animationSpeed);

    // Check if we reached the end
    if (row === end.row && col === end.col) {
      found = true;
      return true;
    }

    // Try all four directions
    for (const dir of directions) {
      if (await dfs(row + dir.dr, col + dir.dc)) {
        return true;
      }
    }

    // Dead end: backtrack (remove from path)
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

// Run both algorithms simultaneously
async function solveBoth() {
  if (isRunning) return;
  isRunning = true;
  disableButtons();
  await Promise.all([solveBFS(true), solveDFS(true)]);
  isRunning = false;
  enableButtons();
}

// Reset statistics and redraw clean maze
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

// Change animation speed
function changeSpeed(speed) {
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

// Change maze size (small = 25x25, big = 55x55)
function changeMazeSize(size) {
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

// Async delay utility
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Disable buttons during solving
function disableButtons() {
  document.getElementById("solveBtn").disabled = true;
  document.getElementById("bfsBtn").disabled = true;
  document.getElementById("dfsBtn").disabled = true;
  document.getElementById("generateBtn").disabled = true;
  document.getElementById("resetBtn").disabled = true;
  document.getElementById("smallBtn").disabled = true;
  document.getElementById("bigBtn").disabled = true;
}

// Enable buttons after solving
function enableButtons() {
  document.getElementById("solveBtn").disabled = false;
  document.getElementById("bfsBtn").disabled = false;
  document.getElementById("dfsBtn").disabled = false;
  document.getElementById("generateBtn").disabled = false;
  document.getElementById("resetBtn").disabled = false;
  document.getElementById("smallBtn").disabled = false;
  document.getElementById("bigBtn").disabled = false;
}

// Toggle info overlay
function toggleInfo() {
  const overlay = document.getElementById("infoOverlay");
  overlay.classList.toggle("active");

  // Prevent scrolling when overlay is open
  if (overlay.classList.contains("active")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
}

// Event listeners for overlay
document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.getElementById("infoOverlay");

  // Close when clicking outside content
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      toggleInfo();
    }
  });

  // Close with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      toggleInfo();
    }
  });
});

// Start with a generated maze
generateMaze();

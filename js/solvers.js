import { dom, state } from "./config.js";
import { drawMaze, disableButtons, enableButtons } from "./ui.js";
import { sleep } from "./utils.js";
import { playSuccessSound } from "./sounds.js";

// Breadth-First Search
export async function solveBFS(skipLock = false) {
  if (state.isRunning && !skipLock) return;
  if (!skipLock) disableButtons();

  const startTime = performance.now();
  const explored = new Set();
  const queue = [[state.start]];
  const visited = new Set([`${state.start.row},${state.start.col}`]);
  dom.bfsStatus.textContent = "Solving...";
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

    // Update UI
    dom.bfsExplored.textContent = explored.size;
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    dom.bfsTime.textContent = elapsed + "s";
    drawMaze(dom.bfsCtx, explored, []);
    await sleep(state.animationSpeed);

    // Check if we reached the end
    if (current.row === state.end.row && current.col === state.end.col) {
      drawMaze(dom.bfsCtx, explored, path);
      dom.bfsPath.textContent = path.length;
      dom.bfsStatus.textContent = "✓ Found!";
      playSuccessSound(); // Victory sound!
      if (!skipLock) enableButtons();
      return;
    }

    // Explore neighbors
    for (const dir of directions) {
      const newRow = current.row + dir.dr;
      const newCol = current.col + dir.dc;
      const key = `${newRow},${newCol}`;

      if (
        newRow >= 0 &&
        newRow < state.rows &&
        newCol >= 0 &&
        newCol < state.cols &&
        state.maze[newRow][newCol] === 0 &&
        !visited.has(key)
      ) {
        visited.add(key);
        queue.push([...path, { row: newRow, col: newCol }]);
      }
    }
  }

  // No path found
  dom.bfsStatus.textContent = "No path found";
  if (!skipLock) enableButtons();
}

// Depth-First Search
export async function solveDFS(skipLock = false) {
  if (state.isRunning && !skipLock) return;
  if (!skipLock) disableButtons();

  const startTime = performance.now();
  const explored = new Set();
  const visited = new Set();
  const path = [];
  let found = false;
  dom.dfsStatus.textContent = "Solving...";
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
    if (
      row < 0 ||
      row >= state.rows ||
      col < 0 ||
      col >= state.cols ||
      state.maze[row][col] === 1 ||
      visited.has(key)
    ) {
      return false;
    }

    visited.add(key);
    explored.add(key);
    path.push({ row, col });

    // Update UI
    dom.dfsExplored.textContent = explored.size;
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    dom.dfsTime.textContent = elapsed + "s";
    drawMaze(dom.dfsCtx, explored, path);
    await sleep(state.animationSpeed);

    if (row === state.end.row && col === state.end.col) {
      found = true;
      return true;
    }
    for (const dir of directions) {
      if (await dfs(row + dir.dr, col + dir.dc)) return true;
    }
    path.pop(); // Backtrack
    drawMaze(dom.dfsCtx, explored, path);
    return false;
  }

  await dfs(state.start.row, state.start.col);
  const finalTime = ((performance.now() - startTime) / 1000).toFixed(2);
  dom.dfsTime.textContent = finalTime + "s";

  if (found) {
    drawMaze(dom.dfsCtx, explored, path);
    dom.dfsPath.textContent = path.length;
    dom.dfsStatus.textContent = "✓ Found!";
    playSuccessSound(); // Victory sound!
  } else {
    dom.dfsStatus.textContent = "No path found";
  }

  if (!skipLock) enableButtons();
}

// Run both algorithms simultaneously
export async function solveBoth() {
  if (state.isRunning) return;
  disableButtons();
  await Promise.all([solveBFS(true), solveDFS(true)]);
  enableButtons();
}

import { state } from "./config.js";

// Initialize maze with all walls (1s)
function initMaze() {
  state.maze = [];
  for (let i = 0; i < state.rows; i++) {
    state.maze[i] = [];
    for (let j = 0; j < state.cols; j++) {
      state.maze[i][j] = 1;
    }
  }
}

// Generate a random maze using depth-first search algorithm
export function generateMaze() {
  initMaze();
  const stack = [];
  const startCell = { row: 1, col: 1 };
  state.maze[startCell.row][startCell.col] = 0; // Carve out
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

    // Find all valid unvisited neighbors
    for (const dir of directions) {
      const newRow = current.row + dir.dr;
      const newCol = current.col + dir.dc;

      if (
        newRow > 0 &&
        newRow < state.rows - 1 &&
        newCol > 0 &&
        newCol < state.cols - 1 &&
        state.maze[newRow][newCol] === 1
      ) {
        neighbors.push({ row: newRow, col: newCol, dr: dir.dr, dc: dir.dc });
      }
    }

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      state.maze[next.row][next.col] = 0;
      state.maze[current.row + next.dr / 2][current.col + next.dc / 2] = 0;
      stack.push({ row: next.row, col: next.col });
    } else {
      stack.pop(); // Backtrack
    }
  }

  // Ensure start and end are clear
  state.maze[state.start.row][state.start.col] = 0;
  state.maze[state.end.row][state.end.col] = 0;
}

// Cache all DOM elements
export const dom = {
  bfsCanvas: document.getElementById("bfsCanvas"),
  dfsCanvas: document.getElementById("dfsCanvas"),
  bfsCtx: document.getElementById("bfsCanvas").getContext("2d"),
  dfsCtx: document.getElementById("dfsCanvas").getContext("2d"),

  // Buttons
  infoBtn: document.getElementById("infoBtn"),
  infoCloseBtn: document.getElementById("infoCloseBtn"),
  musicBtn: document.getElementById("musicBtn"),
  generateBtn: document.getElementById("generateBtn"),
  resetBtn: document.getElementById("resetBtn"),
  solveBtn: document.getElementById("solveBtn"),
  bfsBtn: document.getElementById("bfsBtn"),
  dfsBtn: document.getElementById("dfsBtn"),
  sizeGroup: document.getElementById("sizeGroup"),
  speedGroup: document.getElementById("speedGroup"),

  // Overlays
  infoOverlay: document.getElementById("infoOverlay"),

  // Stats
  bfsExplored: document.getElementById("bfsExplored"),
  bfsPath: document.getElementById("bfsPath"),
  bfsTime: document.getElementById("bfsTime"),
  bfsStatus: document.getElementById("bfsStatus"),
  dfsExplored: document.getElementById("dfsExplored"),
  dfsPath: document.getElementById("dfsPath"),
  dfsTime: document.getElementById("dfsTime"),
  dfsStatus: document.getElementById("dfsStatus"),
};

// Global application state and configuration
export const state = {
  rows: 25,
  cols: 25,
  cellSize: 22,
  maze: [],
  start: { row: 1, col: 1 },
  end: { row: 25 - 2, col: 25 - 2 },
  animationSpeed: 20,
  isRunning: false,
};

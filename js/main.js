import { dom } from "./config.js";
import { toggleMusic } from "./audio.js";
import { generateMaze } from "./maze.js";
import {
  resetUI,
  handleSizeChange,
  handleSpeedChange,
  toggleInfo,
} from "./ui.js";
import { solveBFS, solveDFS, solveBoth } from "./solvers.js";

// This runs once the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Setup all event listeners
  dom.musicBtn.addEventListener("click", () => toggleMusic(dom.musicBtn));
  dom.infoBtn.addEventListener("click", toggleInfo);
  dom.infoCloseBtn.addEventListener("click", toggleInfo);

  dom.generateBtn.addEventListener("click", () => {
    generateMaze();
    resetUI();
  });

  dom.resetBtn.addEventListener("click", resetUI);
  dom.solveBtn.addEventListener("click", solveBoth);
  dom.bfsBtn.addEventListener("click", () => solveBFS(false));
  dom.dfsBtn.addEventListener("click", () => solveDFS(false));

  // Event delegation for button groups
  dom.sizeGroup.addEventListener("click", (e) => {
    if (e.target.matches("button")) {
      handleSizeChange(e.target.dataset.size);
    }
  });

  dom.speedGroup.addEventListener("click", (e) => {
    if (e.target.matches("button")) {
      handleSpeedChange(e.target.dataset.speed);
    }
  });

  // Info overlay listeners
  dom.infoOverlay.addEventListener("click", (e) => {
    if (e.target === dom.infoOverlay) toggleInfo();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dom.infoOverlay.classList.contains("active")) {
      toggleInfo();
    }
  });

  // Initial setup
  generateMaze();
  resetUI();
});

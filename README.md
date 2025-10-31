# BFS & DFS Maze Solver

A pixel art maze visualizer that demonstrates Breadth-First Search (BFS) and Depth-First Search (DFS) pathfinding algorithms. Inspired by classic games like Undertale and Omori.

## How It Works

### 1. Maze Generation

The program generates a random maze using a recursive backtracking algorithm (a variation of DFS). Starting from a random cell, it carves paths through the grid by visiting unvisited neighbors randomly, creating a perfect maze with exactly one path between any two points.

### 2. Pathfinding Algorithms

**Breadth-First Search (BFS)**

- Explores the maze level by level, like ripples in water
- Uses a queue data structure (first-in, first-out)
- Guarantees the shortest path from start to finish
- Explores cells in green as it searches

**Depth-First Search (DFS)**

- Explores as far as possible down each path before backtracking
- Uses a stack data structure (last-in, first-out)
- Finds a path but not necessarily the shortest one
- Explores cells in red as it searches

### 3. Visualization Process

1. Click "Generate Maze" to create a new random maze
2. Choose a maze size (25x25 or 55x55)
3. Adjust animation speed (Slow, Medium, Fast, Instant)
4. Run algorithms:
   - "Solve BFS" - runs only Breadth-First Search
   - "Solve DFS" - runs only Depth-First Search
   - "Solve Both" - runs both algorithms simultaneously for comparison
5. Watch the algorithms explore:
   - Green cells = BFS explored areas
   - Red cells = DFS explored areas
   - Yellow cells = final path from start to finish
6. Statistics update in real-time showing:
   - Cells explored by each algorithm
   - Time taken to find the path

### 4. Controls

**Size Selection**

- 25x25: Smaller maze, faster solving
- 55x55: Larger maze, more complex paths

**Speed Control**

- Slow: 50ms delay between steps
- Medium: 20ms delay between steps
- Fast: 5ms delay between steps
- Instant: No delay, immediate result

## Technical Details

### Architecture

The project uses a modular JavaScript architecture:

- `main.js` - Entry point and event handling
- `config.js` - Configuration and state management
- `maze.js` - Maze generation logic
- `ui.js` - Canvas rendering and UI updates
- `solvers.js` - BFS and DFS algorithm implementations
- `audio.js` - Background music system
- `sounds.js` - Sound effects (click, hover, success)
- `utils.js` - Helper functions

### Visual Design

Pixel art aesthetic with:

- Monochrome base colors (black, white, grays)
- Color-coded paths (green for BFS, red for DFS, yellow for solution)
- Pixelated rendering with crisp edges
- Retro scanline background effect
- 3D button shadows with press-down animation

### Audio

- Background music using Web Audio API
- Pixel-style sound effects:
  - Click sound on button press (800Hz beep)
  - Hover sound on button mouseover (600Hz beep)
  - Success jingle when maze is solved (C-E-G chord progression)

## Algorithm Comparison

**BFS Advantages:**

- Always finds the shortest path
- Better for finding closest solutions
- Predictable, systematic exploration

**DFS Advantages:**

- Uses less memory in deep mazes
- Can be faster in some cases
- Good for exploring all possibilities

**Visual Difference:**
Run "Solve Both" to see how BFS explores uniformly outward (green) while DFS dives deep into corridors (red) before backtracking.

## Files Structure

```
bfs-dfs-maze/
├── index.html          # Main HTML structure
├── styles.css          # Pixel art styling
├── js/
│   ├── main.js         # Application entry point
│   ├── config.js       # Settings and state
│   ├── maze.js         # Maze generation
│   ├── ui.js           # Canvas drawing
│   ├── solvers.js      # BFS & DFS algorithms
│   ├── audio.js        # Background music
│   ├── sounds.js       # Sound effects
│   └── utils.js        # Utilities
└── README.md           # This file
```

## License

Feel free to use and modify for educational purposes.

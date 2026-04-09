// main script

const COLS = 18;
const ROWS = 18;
const CELL = 20;

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const hiEl = document.getElementById('hi');
const msgEl = document.getElementById('msg');
const spdEl = document.getElementById('spd');

let snake, dir, nextDir, food, score;
let hiScore = 0;
let running = false;
let paused = false;
let loop;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randCell(exclude) {
  let cell;
  do {
    cell = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (exclude.some(s => s.x === cell.x && s.y === cell.y));
  return cell;
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
  c.fill();
}

// ─── Drawing ──────────────────────────────────────────────────────────────────

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Snake
  snake.forEach((seg, i) => {
    const r = i === 0 ? 7 : 5;
    ctx.fillStyle = i === 0 ? '#1D9E75' : '#5DCAA5';
    roundRect(ctx, seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, r);
  });

  // Eyes on head
  if (snake[0]) {
    ctx.fillStyle = '#fffb02';
    const ex = dir.x === 1 ? 13 : dir.x === -1 ? 7 : 11;
    const ey = dir.y === 1 ? 13 : dir.y === -1 ? 7 : 11;
    const ox = dir.x === 0 ? -3 : 0;
    const oy = dir.y === 0 ? -3 : 0;
    const bx = snake[0].x * CELL + ex + ox;
    const by = snake[0].y * CELL + ey + oy;
    ctx.beginPath();
    ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      bx + (dir.y !== 0 ? 6 : 0),
      by + (dir.x !== 0 ? 6 : 0),
      2.5, 0, Math.PI * 2
    );
    ctx.fill();
  }

  // Food
  ctx.fillStyle = '#D85A30';
  roundRect(
    ctx,
    food.x * CELL + 2,
    food.y * CELL + 2,
    CELL - 4,
    CELL - 4,
    6
  );
}

// ─── Game logic ───────────────────────────────────────────────────────────────

function init() {
  snake = [{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  food = randCell(snake);
  score = 0;
  scoreEl.textContent = 0;
  draw();
}

function step() {
  dir = { ...nextDir };
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // Wall or self collision
  const hitWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS;
  const hitSelf = snake.some(s => s.x === head.x && s.y === head.y);
  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(head);

  // Ate food
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;
    if (score > hiScore) {
      hiScore = score;
      hiEl.textContent = hiScore;
    }
    food = randCell(snake);
  } else {
    snake.pop();
  }

  draw();
}

function startGame() {
  if (running) clearInterval(loop);
  init();
  running = true;
  paused = false;
  msgEl.textContent = 'Use arrow keys or D-pad';
  loop = setInterval(step, parseInt(spdEl.value));
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  if (paused) {
    clearInterval(loop);
    msgEl.textContent = 'Paused';
  } else {
    loop = setInterval(step, parseInt(spdEl.value));
    msgEl.textContent = 'Use arrow keys or D-pad';
  }
}

function endGame() {
  running = false;
  paused = false;
  clearInterval(loop);
  msgEl.textContent = `Game over! Score: ${score}`;
  draw();
}

// ─── Input handling ───────────────────────────────────────────────────────────

const DIRS = {
  ArrowUp:    { x:  0, y: -1 },
  ArrowDown:  { x:  0, y:  1 },
  ArrowLeft:  { x: -1, y:  0 },
  ArrowRight: { x:  1, y:  0 },
};

function setDir(d) {
  // Prevent reversing
  if (d.x !== 0 && d.x === -dir.x) return;
  if (d.y !== 0 && d.y === -dir.y) return;
  nextDir = d;
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (!running) startGame();
    else togglePause();
    return;
  }
  if (DIRS[e.code]) {
    e.preventDefault();
    setDir(DIRS[e.code]);
  }
});

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-pause').addEventListener('click', togglePause);

document.getElementById('du').addEventListener('click', () => setDir({ x: 0, y: -1 }));
document.getElementById('dd').addEventListener('click', () => setDir({ x: 0, y:  1 }));
document.getElementById('dl').addEventListener('click', () => setDir({ x: -1, y: 0 }));
document.getElementById('dr').addEventListener('click', () => setDir({ x:  1, y: 0 }));

// ─── Init ─────────────────────────────────────────────────────────────────────

init();
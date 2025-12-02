// Neon Runner — fully working HTML5 Canvas game

// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

// UI elements
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const livesDisplay = document.getElementById("lives");
const scoreDisplay = document.getElementById("score");
const message = document.getElementById("message");

// Game state
let keys = {};
let frame = 0;
let score = 0;
let lives = 3;
let running = false;
let loopId = null;
let gravity = 0.5;

// Game objects
let obstacles = [];
let spikes = [];
let coins = [];

const player = {
    x: 80,
    y: H - 100,
    w: 40,
    h: 50,
    speed: 4,
    vy: 0,
    jumpStrength: -10,
    onGround: true,
    color: "#00e6ff"
};

// Input
window.addEventListener("keydown", e => {
    keys[e.key] = true;
    if (e.key === " ") e.preventDefault();
});
window.addEventListener("keyup", e => keys[e.key] = false);

// Collision detection
function rectCollide(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
}

// Spawn objects
function spawnObstacle() {
    const h = 30;
    const w = 50;
    const y = H - 80 - Math.random() * 100;
    obstacles.push({ x: W + 40, y, w, h, vx: -3 - Math.random()*2 });
}
function spawnSpike() {
    const w = 30;
    const h = 30;
    spikes.push({ x: W + 40, y: H - 48 - h, w, h });
}
function spawnCoin() {
    const size = 10;
    const x = W + 40;
    const y = H - 150 - Math.random() * 100;
    coins.push({ x, y, size });
}

// Update UI
function updateUI() {
    livesDisplay.textContent = "Lives: " + lives;
    scoreDisplay.textContent = "Score: " + score;
}

// Show / hide message
function showMessage(text) {
    message.textContent = text;
    message.classList.remove("hidden");
}
function hideMessage() {
    message.classList.add("hidden");
}

// Game functions
function startGame() {
    if (running) return;
    running = true;
    hideMessage();
    loopId = requestAnimationFrame(loop);
}
function pauseGame() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(loopId);
}
function restartGame() {
    // Reset game state
    player.x = 80;
    player.y = H - 100;
    player.vy = 0;
    player.onGround = true;

    lives = 3;
    score = 0;
    frame = 0;

    obstacles = [];
    spikes = [];
    coins = [];

    updateUI();
    hideMessage();

    running = true;
    loopId = requestAnimationFrame(loop);
}

// Connect buttons
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
restartBtn.addEventListener("click", restartGame);

// Update game state
function update() {
    frame++;

    // Spawn objects periodically
    if (frame % 120 === 0) spawnObstacle();
    if (frame % 180 === 30) spawnSpike();
    if (frame % 100 === 20) spawnCoin();

    // Move obstacles
    obstacles.forEach((o, i) => {
        o.x += o.vx;
        if (o.x + o.w < 0) obstacles.splice(i,1);
        if (rectCollide(player,o)) {
            lives--;
            updateUI();
            obstacles.splice(i,1);
        }
    });

    // Move spikes
    spikes.forEach((s,i) => {
        s.x -= 3;
        if (s.x + s.w < 0) spikes.splice(i,1);
        if (rectCollide(player,s)) {
            lives--;
            updateUI();
            spikes.splice(i,1);
        }
    });

    // Move coins safely
    for (let i=coins.length-1;i>=0;i--) {
        let c = coins[i];
        c.x -= 3;
        if (c.x + c.size < 0) { coins.splice(i,1); continue; }
        if (rectCollide(player, {x:c.x-c.size, y:c.y-c.size, w:c.size*2, h:c.size*2})) {
            coins.splice(i,1);
            score += 5;
        }
    }

    // Player controls
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;
    if ((keys["ArrowUp"] || keys[" "]) && player.onGround) {
        player.vy = player.jumpStrength;
        player.onGround = false;
    }

    // Gravity
    player.vy += gravity;
    player.y += player.vy;

    // Ground collision
    if (player.y + player.h >= H - 48) {
        player.y = H - 48 - player.h;
        player.vy = 0;
        player.onGround = true;
    }

    // Screen bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > W) player.x = W - player.w;

    // Increase score over time
    if (frame % 40 === 0) score++;

    updateUI();

    // Game over
    if (lives <= 0) {
        running = false;
        showMessage("GAME OVER — Press Restart");
    }
}

// Draw everything
function draw() {
    // Background color change based on score
    if (score < 30) ctx.fillStyle = "#051426";
    else if (score < 60) ctx.fillStyle = "#0b1630";
    else ctx.fillStyle = "#020012";
    ctx.fillRect(0,0,W,H);

    // Ground
    ctx.fillStyle = "#071226";
    ctx.fillRect(0, H-48, W, 48);

    // Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Obstacles
    obstacles.forEach(o => {
        ctx.fillStyle = "#ff3cac";
        ctx.fillRect(o.x, o.y, o.w, o.h);
    });

    // Spikes
    spikes.forEach(s => {
        ctx.fillStyle = "#c0392b";
        ctx.fillRect(s.x, s.y, s.w, s.h);
    });

    // Coins
    coins.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, Math.PI*2);
        ctx.fillStyle = "#ffd600";
        ctx.fill();
    });
}

// Game loop
function loop() {
    if (!running) return;
    update();
    draw();
    loopId = requestAnimationFrame(loop);
}

// Initial UI
updateUI();
showMessage("Press Start to play");

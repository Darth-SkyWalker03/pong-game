// Game variables
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Paddle properties
const paddleWidth = 10;
const paddleHeight = 80;
const paddleSpeed = 6;

const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    move: function() {
        this.y += this.dy;
        // Collision detection with walls
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
    },
    draw: function() {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    move: function() {
        this.y += this.dy;
        // Collision detection with walls
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
    },
    draw: function() {
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    updateAI: function() {
        const computerCenter = this.y + this.height / 2;
        const ballCenter = ball.y;
        const difficulty = 4;

        if (ballCenter < computerCenter - 35) {
            this.dy = -difficulty;
        } else if (ballCenter > computerCenter + 35) {
            this.dy = difficulty;
        } else {
            this.dy = 0;
        }
    }
};

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 5,
    dy: 5,
    speed: 5,
    maxSpeed: 8,
    move: function() {
        this.x += this.dx;
        this.y += this.dy;
    },
    draw: function() {
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    },
    reset: function() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.dx = (Math.random() > 0.5 ? 1 : -1) * this.speed;
        this.dy = (Math.random() - 0.5) * this.speed;
    }
};

// Collision detection
function checkPaddleCollision(paddle) {
    if (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.y + ball.radius > paddle.y
    ) {
        // Bounce the ball
        ball.dx = -ball.dx;
        // Add spin based on where the ball hits the paddle
        const hitPos = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
        ball.dy = hitPos * ball.speed;
        // Increase speed slightly (cap it at maxSpeed)
        if (Math.abs(ball.dx) < ball.maxSpeed) {
            ball.dx *= 1.05;
        }
        // Move ball outside paddle to prevent overlap
        ball.x = paddle === player ? paddle.x + paddle.width + ball.radius : paddle.x - ball.radius;
    }
}

function checkWallCollision() {
    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        // Keep ball in bounds
        ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
    }
}

function checkScore() {
    // Ball out of bounds on left side (computer scores)
    if (ball.x - ball.radius < 0) {
        computerScore++;
        computerScoreDisplay.textContent = computerScore;
        ball.reset();
    }
    // Ball out of bounds on right side (player scores)
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        playerScoreDisplay.textContent = playerScore;
        ball.reset();
    }
}

// Keyboard and mouse controls
const keys = {};
let mouseY = canvas.height / 2;

window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

function handlePlayerInput() {
    // Mouse control
    player.y = mouseY - player.height / 2;

    // Arrow key control
    if (keys['arrowup']) {
        player.y -= paddleSpeed;
    }
    if (keys['arrowdown']) {
        player.y += paddleSpeed;
    }

    // Keep player paddle in bounds
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

// Game loop
function update() {
    if (!gameRunning) return;

    // Update positions
    handlePlayerInput();
    computer.updateAI();
    computer.move();
    ball.move();

    // Collision detection
    checkPaddleCollision(player);
    checkPaddleCollision(computer);
    checkWallCollision();
    checkScore();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw game objects
    player.draw();
    computer.draw();
    ball.draw();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Button event listeners
startBtn.addEventListener('click', () => {
    gameRunning = !gameRunning;
    startBtn.textContent = gameRunning ? 'Pause Game' : 'Resume Game';
});

resetBtn.addEventListener('click', () => {
    playerScore = 0;
    computerScore = 0;
    playerScoreDisplay.textContent = '0';
    computerScoreDisplay.textContent = '0';
    ball.reset();
    player.y = canvas.height / 2 - paddleHeight / 2;
    computer.y = canvas.height / 2 - paddleHeight / 2;
    gameRunning = false;
    startBtn.textContent = 'Start Game';
});

// Start the game loop
gameLoop();

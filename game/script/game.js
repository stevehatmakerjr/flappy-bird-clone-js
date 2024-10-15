const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Variables
let birdX, birdY, birdRadius;
let gravity, lift, velocity;
let score;
let pipes;
let pipeWidth, pipeGap;
let frameCount;
let gameOver;
let gameStarted = false;

// Set canvas dimensions based on device type
function resizeCanvas() {
    if (window.innerWidth <= 768) {
        // Mobile devices
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        // Desktop
        canvas.width = 400;
        canvas.height = 600;
    }
    // Re-initialize game variables if the game hasn't started
    if (!gameStarted) {
        init();
    }
}

resizeCanvas();
window.addEventListener('resize', () => {
    resizeCanvas();
    // Optionally adjust game elements here if necessary
});

// Initialize Game Variables
function init() {
    birdX = canvas.width * 0.1; // 10% from the left
    birdY = canvas.height / 2;
    birdRadius = canvas.width * 0.03; // 3% of canvas width
    gravity = canvas.height * 0.00015;
    lift = -canvas.height * 0.007;
    velocity = 0;
    score = 0;
    pipes = [];
    pipeWidth = canvas.width * 0.15;
    pipeGap = canvas.height * 0.35;
    frameCount = 0;
    gameOver = false;
}

// Event Listener for mouse click and touch
function handleInput() {
    if (!gameOver) {
        velocity = lift; // Set velocity directly to lift
    }
}

canvas.addEventListener('mousedown', handleInput);
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault(); // Prevent scrolling
    handleInput();
}, { passive: false });

// Pipe Class
class Pipe {
    constructor() {
        const minPipeHeight = canvas.height * 0.1;
        const maxPipeHeight = canvas.height * 0.6;
        this.top = Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight;
        this.bottom = canvas.height - (this.top + pipeGap);
        this.x = canvas.width;
        this.width = pipeWidth;
        this.speed = canvas.width * 0.002; // Adjust speed based on canvas width
        this.passed = false;
    }

    draw() {
        ctx.fillStyle = '#228B22';
        ctx.fillRect(this.x, 0, this.width, this.top);
        ctx.fillRect(this.x, canvas.height - this.bottom, this.width, this.bottom);
    }

    update() {
        this.x -= this.speed;
        this.draw();
    }
}

// Main Game Loop
function animate() {
    if (gameOver) return;
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bird
    velocity += gravity;
    birdY += velocity;
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(birdX, birdY, birdRadius, 0, Math.PI * 2);
    ctx.fill();

    // Pipes
    if (frameCount % Math.floor(canvas.width * 0.5) === 0) { // Adjust pipe frequency
        pipes.push(new Pipe());
    }
    pipes.forEach((pipe, index) => {
        pipe.update();

        // Collision Detection
        if (
            birdX + birdRadius > pipe.x &&
            birdX - birdRadius < pipe.x + pipe.width &&
            (birdY - birdRadius < pipe.top || birdY + birdRadius > canvas.height - pipe.bottom)
        ) {
            gameOver = true;
            endGame();
        }

        // Scoring
        if (pipe.x + pipe.width < birdX - birdRadius && !pipe.passed) {
            score++;
            pipe.passed = true;
        }

        // Remove off-screen pipes
        if (pipe.x + pipe.width < 0) {
            pipes.splice(index, 1);
        }
    });

    // Score Display
    ctx.fillStyle = '#000';
    ctx.font = `${canvas.width * 0.05}px Arial`; // Font size is 5% of canvas width
    ctx.fillText('Score: ' + score, canvas.width * 0.05, canvas.height * 0.1);

    // Prevent bird from falling off the canvas
    if (birdY + birdRadius > canvas.height || birdY - birdRadius < 0) {
        gameOver = true;
        endGame();
    }

    frameCount++;
}

// Start the game when the player clicks the start button
document.getElementById('startButton').addEventListener('click', () => {
    document.getElementById('startScreen').style.display = 'none';
    canvas.focus(); // Set focus to the canvas for mouse events
    gameStarted = true;
    init();
    animate();
});

// Restart the game when the player clicks the restart button
document.getElementById('restartButton').addEventListener('click', () => {
    document.getElementById('gameOverScreen').style.display = 'none';
    init();
    animate();
});

// End Game Function
function endGame() {
    // Display Game Over Screen
    document.getElementById('finalScore').innerText = score;
    document.getElementById('gameOverScreen').style.display = 'flex';
    gameStarted = false;
}

// Initialize the game variables (without starting the animation)
init();

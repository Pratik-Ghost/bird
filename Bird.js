const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreDisplay = document.getElementById('scoreDisplay');
const restartButton = document.getElementById('restartButton');

const bird = {
    x: 50,
    y: 150,
    width: 15,  // Smaller width
    height: 15, // Smaller height
    gravity: 0.3,  // Gravity for a balanced fall
    lift: -6,     // Reduced lift for lower jump height
    velocity: 0
};

const groundLevel = canvas.height - 50;  // Define ground level
let pipes = [];
let pipeWidth = 50;
let pipeGap = 150; // Increased gap between the pipes
let pipeSpacing = 120; // Space out the pipe pairs more
let pipeSpeed = 2; // Initial speed of pipes
let frameCount = 0;
let score = 0;
let gameOver = false;
let spikes = [];
let level = 1;
let spikesAdded = false; // Flag to track if spikes have been added

document.addEventListener('keydown', () => {
    if (!gameOver) {
        bird.velocity = bird.lift;
    }
});

startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    canvas.style.display = 'block';
    resetGame();
    gameLoop();
});

restartButton.addEventListener('click', () => {
    resetGame();
    gameOverScreen.style.display = 'none';
    canvas.style.display = 'block';
    startScreen.style.display = 'none';  // Ensure start screen is hidden on restart
});

function drawBird() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    ctx.fillStyle = 'green';
    pipes.forEach(pipe => {
        // Draw the vertical pipes
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom - 50, pipeWidth, pipe.bottom);

        // Draw the triangles at the top of the upper pipes
        ctx.fillStyle = 'darkgreen';
        ctx.beginPath();
        ctx.moveTo(pipe.x, 0);  // Start at the top-left corner of the upper pipe
        ctx.lineTo(pipe.x + pipeWidth / 2, -20);  // Peak of the triangle
        ctx.lineTo(pipe.x + pipeWidth, 0);  // Top-right corner of the upper pipe
        ctx.closePath();
        ctx.fill();

        // Draw the triangles at the bottom of the lower pipes
        ctx.beginPath();
        ctx.moveTo(pipe.x, canvas.height - pipe.bottom - 50);  // Start at the bottom-left corner of the lower pipe
        ctx.lineTo(pipe.x + pipeWidth / 2, canvas.height - pipe.bottom - 70);  // Peak of the triangle
        ctx.lineTo(pipe.x + pipeWidth, canvas.height - pipe.bottom - 50);  // Bottom-right corner of the lower pipe
        ctx.closePath();
        ctx.fill();
    });
}

function drawGround() {
    ctx.fillStyle = '#8B4513'; // Brown color for the ground
    ctx.fillRect(0, groundLevel, canvas.width, 50);

    // Draw spikes if the score is above 10
    if (score > 10) {
        ctx.fillStyle = 'darkred';
        spikes.forEach(spike => {
            ctx.beginPath();
            ctx.moveTo(spike.x, groundLevel);  // Start at the base of the spike
            ctx.lineTo(spike.x + 10, groundLevel - 20);  // Peak of the spike
            ctx.lineTo(spike.x + 20, groundLevel);  // Base of the next spike
            ctx.closePath();
            ctx.fill();
        });
    }
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 25);
    ctx.fillText(`Level: ${level}`, canvas.width - 80, 25);  // Display level
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Prevent the bird from going below the ground level
    if (bird.y + bird.height > groundLevel) {
        bird.y = groundLevel - bird.height;
        bird.velocity = 0;
    }
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

function updatePipes() {
    if (frameCount % pipeSpacing === 0) {  // Adjusted to create more space between pipe pairs
        const topPipeHeight = Math.random() * (canvas.height - pipeGap - 50);
        const bottomPipeHeight = canvas.height - pipeGap - topPipeHeight - 50;
        pipes.push({
            x: canvas.width,
            top: topPipeHeight,
            bottom: bottomPipeHeight,
            passed: false
        });
    }

    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;  // Increase speed of pipes as the level increases

        // Increase score if the bird successfully passes a pipe
        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            score++;
            pipe.passed = true;

            // Update level based on score
            if (score % 10 === 0) {
                level++;
                pipeSpeed += 0.5;  // Increase speed for higher levels
                if (score > 10 && !spikesAdded) {
                    generateSpikes();
                    spikesAdded = true;  // Set flag to true to prevent multiple spikes generation
                }
            }
        }
    });

    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

function generateSpikes() {
    const spikeSpacing = 60;  // Distance between spikes
    spikes = []; // Clear existing spikes
    for (let x = 0; x < canvas.width; x += spikeSpacing) {
        spikes.push({ x: x });
    }
}

function detectCollision() {
    for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];

        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > canvas.height - 50 - pipe.bottom)) {
            // Collision detected
            endGame();
        }
    }

    // Check collision with spikes
    if (score > 10) {
        spikes.forEach(spike => {
            if (bird.x + bird.width > spike.x &&
                bird.x < spike.x + 20 &&
                bird.y + bird.height > groundLevel - 20) {
                // Collision with spike
                endGame();
            }
        });
    }
}

function endGame() {
    gameOver = true;
    gameOverScreen.style.display = 'flex';
    scoreDisplay.textContent = `Your Score: ${score}`;
    canvas.style.display = 'none';
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    spikes = [];
    frameCount = 0;
    score = 0;
    level = 1;
    pipeSpeed = 2; // Reset pipe speed
    spikesAdded = false; // Reset spikesAdded flag
    gameOver = false;
}

function gameLoop() {
    if (!gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBird();
        drawPipes();
        drawGround();
        drawScore();
        updateBird();
        updatePipes();
        detectCollision();

        frameCount++;
    }
    requestAnimationFrame(gameLoop);
}

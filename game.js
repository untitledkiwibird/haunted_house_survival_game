const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let isIntroScreen = true; // Tracks whether the intro screen is active
let activeObjectIndex = -1; // Tracks the currently active object
let timer = 20; // Timer starts at 20 seconds
let round = 0; // Tracks the current round
let gameOver = false;
let intervalId;
let keys = {};

// Load the background music
const bgm = new Audio("sounds/Unseen-Horrors(chosic.com).mp3");
bgm.loop = true; // Ensure the music loops
bgm.volume = 0.5; // Set the volume level 

// Event listeners for movement and actions
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    // Play sound effect when 'Enter' is pressed
    if (e.key === "Enter") {
        enterSound.currentTime = 0; // Reset sound to the start
        enterSound.play().catch(error => console.error("Error playing sound:", error));
    }

    if (isIntroScreen && e.key === "Enter") {
        isIntroScreen = false;
        bgm.play().catch(error => console.error("Error playing BGM:", error)); // Start BGM
        startGameLoop();
    }

    if (!isIntroScreen && e.key === "Enter" && activeObjectIndex !== -1 && isColliding(player, borderObjects[activeObjectIndex])) {
        borderObjects[activeObjectIndex].opacity = 1; // Reset opacity to 100%
        activeObjectIndex = -1;
        timer = getRoundTime(); // Reset timer for the next round
        round++;
        adjustDifficulty();
        deactivateRandomObject(); // Start next round
    }
});

window.addEventListener("keyup", (e) => keys[e.key] = false);

// Load the sound effect
const enterSound = new Audio("sounds/salt-shaker_1-2-106581.mp3");

// Preload the PNG images
const objectImg = new Image();
objectImg.src = "images/salt.png";

const playerImg = new Image();
playerImg.src = "images/salt_shaker.png";

const borderObjects = [
    { x: 20, y: 20, size: 50, opacity: 1, active: true }, // Top-left
    { x: canvas.width / 2 - 25, y: 20, size: 50, opacity: 1, active: true }, // Top-center
    { x: canvas.width - 70, y: 20, size: 50, opacity: 1, active: true }, // Top-right
    { x: 20, y: canvas.height / 2 - 25, size: 50, opacity: 1, active: true }, // Mid-left
    { x: canvas.width - 70, y: canvas.height / 2 - 25, size: 50, opacity: 1, active: true }, // Mid-right
    { x: 20, y: canvas.height - 70, size: 50, opacity: 1, active: true }, // Bottom-left
    { x: canvas.width / 2 - 25, y: canvas.height - 70, size: 50, opacity: 1, active: true }, // Bottom-center
    { x: canvas.width - 70, y: canvas.height - 70, size: 50, opacity: 1, active: true } // Bottom-right
];

const player = { x: canvas.width / 2, y: canvas.height / 2, size: 50, speed: 5 };

// Event listeners for movement and actions
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    // Play sound effect when 'Enter' is pressed
    if (e.key === "Enter") {
        enterSound.currentTime = 0; // Reset sound to the start
        enterSound.play().catch(error => console.error("Error playing sound:", error));
    }

    
    if (isIntroScreen && e.key === "Enter") {
        isIntroScreen = false;
        startGameLoop();
    }

    if (!isIntroScreen && e.key === "Enter" && activeObjectIndex !== -1 && isColliding(player, borderObjects[activeObjectIndex])) {
        borderObjects[activeObjectIndex].opacity = 1; // Reset opacity to 100%
        activeObjectIndex = -1;
        timer = getRoundTime(); // Reset timer for the next round
        round++;
        adjustDifficulty();
        deactivateRandomObject(); // Start next round
    }
});

window.addEventListener("keyup", (e) => keys[e.key] = false);

// Game loop
function gameLoop() {
    if (gameOver) return;

    if (isIntroScreen) {
        drawIntroScreen();
    } else {
        update();
        draw();
    }

    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Player movement
    if (keys["ArrowUp"] && player.y > 0) player.y -= player.speed;
    if (keys["ArrowDown"] && player.y < canvas.height - player.size) player.y += player.speed;
    if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
    if (keys["ArrowRight"] && player.x < canvas.width - player.size) player.x += player.speed;

    // Gradually decrease opacity of the active object
    if (activeObjectIndex !== -1) {
        const obj = borderObjects[activeObjectIndex];
        obj.opacity -= 1 / (timer * 60); // Decrease opacity based on time
        if (obj.opacity <= 0) {
            gameOver = true;
            alert(`Game Over! The demons have entered.`);
            if (confirm("Do you want to restart?")) {
                restartGame();
            }
        }
    }
}

function drawIntroScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "18px Courier New"; // Slightly smaller font
    const introText = [
        "Your house is under siege by demons.",
        "To protect yourself, you've placed salt at every",
        "window to block their entry.",
        "But beware—the salt gets consumed over time.",
        "When a window runs out of salt, hurry to it and",
        "replenish the salt by pressing 'Enter'.",
        "If you fail to do so in time, the demons will",
        "break through, and you will perish.",
        "Survive as long as you can...",
        "Press 'Enter' to begin."
    ];
    
    const padding = 40; // Padding from the left side
    const lineHeight = 25; // Vertical spacing between lines
    const startY = 100; // Initial y position for the first line

    introText.forEach((line, index) => {
        ctx.fillText(line, padding, startY + index * lineHeight);
    });
}


// Draw game elements
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw border objects using PNG images
    borderObjects.forEach((obj, index) => {
        ctx.globalAlpha = obj.opacity; // Set opacity
        if (obj.active) {
            // Draw the PNG image
            ctx.drawImage(objectImg, obj.x, obj.y, obj.size, obj.size);
        } else {
            // Draw a red rectangle when not active
            ctx.fillStyle = "red";
            ctx.fillRect(obj.x, obj.y, obj.size, obj.size);
        }
        ctx.globalAlpha = 1; // Reset opacity
    });

    // Draw player
    ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);
}

// Randomly deactivate one object
function deactivateRandomObject() {
    activeObjectIndex = Math.floor(Math.random() * borderObjects.length);
    borderObjects[activeObjectIndex].opacity = 1; // Reset opacity
}

// Check collision
function isColliding(player, obj) {
    return (
        player.x < obj.x + obj.size &&
        player.x + player.size > obj.x &&
        player.y < obj.y + obj.size &&
        player.y + player.size > obj.y
    );
}

// Restart the game
function restartGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    activeObjectIndex = -1;
    timer = 20;
    round = 0;
    gameOver = false;

    borderObjects.forEach(obj => {
        obj.opacity = 1;
    });

    startGameLoop();
}

// Adjust difficulty
function adjustDifficulty() {
    if (round < 10) timer = 20; // First 10 rounds: 20 seconds
    else if (round < 20) timer = 15; // Next 10 rounds: 15 seconds
    else timer = 5; // Beyond 20 rounds: 5 seconds
}

// Get round time
function getRoundTime() {
    if (round < 10) return 20;
    if (round < 20) return 15;
    return 5;
}

// Timer countdown
function startTimer() {
    intervalId = setInterval(() => {
        if (!gameOver) timer -= 0.0167; // Decrease timer in seconds
    }, 16.7);
}

// Start game loop and timer
function startGameLoop() {
    deactivateRandomObject();
    startTimer();
    gameLoop();
}

// Start the game
gameLoop();

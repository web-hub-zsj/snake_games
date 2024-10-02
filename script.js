const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const levelElement = document.getElementById('level');
const restartButton = document.getElementById('restartButton');
const difficultySelect = document.getElementById('difficultySelect');
const startButton = document.getElementById('startButton');
const startMenu = document.getElementById('startMenu');
const gameInfo = document.getElementById('gameInfo');

const gridSize = 20; // 调整网格大小以适应新的画布尺寸
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = 0;
let gameOver = false;
let gameSpeed = 100; // 初始游戏速度
let moveCounter = 0;
let moveThreshold = 5; // 控制移动速度，数值越大移动越慢

let isAccelerating = false;
let normalSpeed;
let acceleratedSpeed;

function drawGame() {
    clearCanvas();
    drawSnake();
    drawFood();
    checkCollision();
    updateScore();
    
    if (!gameOver) {
        setTimeout(drawGame, gameSpeed);
    } else {
        showGameOver();
    }
}

// ... 其他函数保持不变 ...

function changeDirection(e) {
    const key = e.key.toLowerCase();
    if ((key === 'a' || key === 'arrowleft') && dx === 0) {
        dx = -1;
        dy = 0;
    } else if ((key === 'd' || key === 'arrowright') && dx === 0) {
        dx = 1;
        dy = 0;
    } else if ((key === 'w' || key === 'arrowup') && dy === 0) {
        dx = 0;
        dy = -1;
    } else if ((key === 's' || key === 'arrowdown') && dy === 0) {
        dx = 0;
        dy = 1;
    }
}

function setDifficulty() {
    const difficulty = parseInt(difficultySelect.value);
    normalSpeed = 500 - (difficulty * 100); // 简单: 400ms, 中等: 300ms, 困难: 200ms
    acceleratedSpeed = normalSpeed / 2; // 加速时的速度是正常速度的两倍
    gameSpeed = normalSpeed;
    moveThreshold = 7 - difficulty; // 简单: 6, 中等: 5, 困难: 4
    levelElement.textContent = `难度: ${difficulty}`;
}

function startAcceleration(e) {
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(key)) {
        isAccelerating = true;
        gameSpeed = acceleratedSpeed;
    }
}

function stopAcceleration(e) {
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(key)) {
        isAccelerating = false;
        gameSpeed = normalSpeed;
    }
}

function startGame() {
    console.log("开始游戏函数被调用");
    snake = [
        {x: Math.floor(tileCount / 4), y: Math.floor(canvas.height / gridSize / 2)},
        {x: Math.floor(tileCount / 4) - 1, y: Math.floor(canvas.height / gridSize / 2)},
        {x: Math.floor(tileCount / 4) - 2, y: Math.floor(canvas.height / gridSize / 2)}
    ];
    createFood(); // 确保在游戏开始时创建食物
    score = 0;
    dx = 1;
    dy = 0;
    gameOver = false;
    moveCounter = 0;
    isAccelerating = false;
    restartButton.style.display = 'none';
    setDifficulty();
    
    startMenu.style.display = 'none';
    canvas.style.display = 'block';
    gameInfo.style.display = 'block';
    
    // 确保画布可见
    canvas.style.visibility = 'visible';
    
    // 立即绘制一次游戏状态
    drawGame();
    
    // 开始游戏循环
    gameLoop();
}

function gameLoop() {
    if (!gameOver) {
        moveCounter++;
        if (moveCounter >= (isAccelerating ? moveThreshold / 2 : moveThreshold)) {
            moveCounter = 0;
            moveSnake();
        }
        clearCanvas();
        drawSnake();
        drawFood(); // 确保在每一帧都绘制食物
        checkCollision();
        updateScore();
        requestAnimationFrame(gameLoop);
    } else {
        showGameOver();
    }
}

function showGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '60px Arial';
    ctx.fillText('游戏结束!', canvas.width / 2 - 150, canvas.height / 2);
    restartButton.style.display = 'block';
}

// 确保有 clearCanvas 函数
function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 确保有 drawSnake 函数
function drawSnake() {
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 3; // 减小线宽
    ctx.beginPath();
    ctx.moveTo(snake[0].x * gridSize + gridSize / 2, snake[0].y * gridSize + gridSize / 2);
    for (let i = 1; i < snake.length; i++) {
        ctx.lineTo(snake[i].x * gridSize + gridSize / 2, snake[i].y * gridSize + gridSize / 2);
    }
    ctx.stroke();
    
    // 绘制蛇头
    ctx.fillStyle = 'darkgreen';
    ctx.beginPath();
    ctx.arc(snake[0].x * gridSize + gridSize / 2, snake[0].y * gridSize + gridSize / 2, gridSize / 4, 0, 2 * Math.PI); // 进一步减小蛇头大小
    ctx.fill();
}

// 确保有 drawFood 函数
function drawFood() {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 3, 0, 2 * Math.PI); // 进一步减小食物大小
    ctx.fill();
}

// 确保有 createFood 函数
function createFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
    // 确保食物不会出现在蛇身上
    for (let part of snake) {
        if (part.x === food.x && part.y === food.y) {
            return createFood();
        }
    }
}

// 加载最高分
highScore = localStorage.getItem('snakeHighScore') || 0;
highScoreElement.textContent = `最高分: ${highScore}`;

// 确保所有的事件监听器都正确绑定
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM加载完成");  // 添加日志
    document.addEventListener('keydown', changeDirection);
    document.addEventListener('keydown', startAcceleration);
    document.addEventListener('keyup', stopAcceleration);
    restartButton.addEventListener('click', showStartMenu);
    startButton.addEventListener('click', startGame);
    difficultySelect.addEventListener('change', setDifficulty);
    
    showStartMenu();
});

// 添加一些调试日志
console.log("脚本加载完成");

function showStartMenu() {
    startMenu.style.display = 'block';
    canvas.style.display = 'none';
    gameInfo.style.display = 'none';
    restartButton.style.display = 'none';
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score++;
        createFood();
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver = true;
    }
    
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            break;
        }
    }
}

function updateScore() {
    scoreElement.textContent = `分数: ${score}`;
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = `最高分: ${highScore}`;
        localStorage.setItem('snakeHighScore', highScore);
    }
}
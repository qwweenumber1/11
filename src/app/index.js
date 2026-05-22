const rulesBtn = document.getElementById("rules-btn");
const closeBtn = document.getElementById("close-btn");
const rules = document.getElementById("rules");

rulesBtn.addEventListener("click", () => rules.classList.add("show"));
closeBtn.addEventListener("click", () => rules.classList.remove("show"));

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Create ball props
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 4,
  dx: 4,
  dy: -4
};

// Create paddle props
const paddle = {
  x: canvas.width / 2 - 40,
  y: canvas.height - 20,
  w: 80,
  h: 10,
  speed: 8,
  dx: 0
};

// Create brick props
const brickInfo = {
  w: 70,
  h: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
  visible: true
};

const brickRowCount = 9;
const brickColumnCount = 5;

const bricks = [];
for (let i = 0; i < brickRowCount; i++) {
  bricks[i] = [];
  for (let j = 0; j < brickColumnCount; j++) {
    const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
    const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
    bricks[i][j] = { x, y, ...brickInfo };
  }
}

let score = 0;

// Draw score oon canvas
function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#000000";
  // Самостійно 3: Якщо набрали 25 очок, вивести «ІПЗ найкращі!!!»
  if (score >= 25) {
    ctx.fillText("ІПЗ найкращі!!!", canvas.width - 180, 30);
  } else {
    ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);
  }
}

// Draw ball on canvas
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = '#0095dd';
  ctx.fill();
  ctx.closePath();
}

// Draw paddle on canvas
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = '#0095dd';
  ctx.fill();
  ctx.closePath();
}

// Draw bricks on canvas
function drawBricks() {
  bricks.forEach(column => {
    column.forEach(brick => {
      if (brick.visible) {
        ctx.beginPath();
        // Самостійно 2: Змінити форму відображення блоків на заокруглені прямокутники
        const radius = 5;
        ctx.moveTo(brick.x + radius, brick.y);
        ctx.lineTo(brick.x + brick.w - radius, brick.y);
        ctx.quadraticCurveTo(brick.x + brick.w, brick.y, brick.x + brick.w, brick.y + radius);
        ctx.lineTo(brick.x + brick.w, brick.y + brick.h - radius);
        ctx.quadraticCurveTo(brick.x + brick.w, brick.y + brick.h, brick.x + brick.w - radius, brick.y + brick.h);
        ctx.lineTo(brick.x + radius, brick.y + brick.h);
        ctx.quadraticCurveTo(brick.x, brick.y + brick.h, brick.x, brick.y + brick.h - radius);
        ctx.lineTo(brick.x, brick.y + radius);
        ctx.quadraticCurveTo(brick.x, brick.y, brick.x + radius, brick.y);
        ctx.closePath();

        ctx.fillStyle = '#0095dd';
        ctx.fill();
      }
    });
  });
}

// Move paddle
function movePaddle() {
  paddle.x += paddle.dx;

  // Wall detection
  if (paddle.x + paddle.w > canvas.width) {
    paddle.x = canvas.width - paddle.w;
  }

  if (paddle.x < 0) {
    paddle.x = 0;
  }
}

// Keyboard event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// Keydown event
function keyDown(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    paddle.dx = paddle.speed;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    paddle.dx = -paddle.speed;
  }
}

// Keyup event
function keyUp(e) {
  if (
    e.key === "Right" ||
    e.key === "ArrowRight" ||
    e.key === "Left" ||
    e.key === "ArrowLeft"
  ) {
    paddle.dx = 0;
  }
}

// Move ball
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision (right/left)
  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
    ball.dx *= -1;
  }

  // Wall collision (top/bottom)
  if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
    ball.dy *= -1;
  }

  // Paddle collision
  if (
    ball.x - ball.size > paddle.x &&
    ball.x + ball.size < paddle.x + paddle.w &&
    ball.y + ball.size > paddle.y
  ) {
    ball.dy = -ball.speed;
  }

  // Brick collision
  bricks.forEach(column => {
    column.forEach(brick => {
      if (brick.visible) {
        if (
          ball.x - ball.size > brick.x && // left brick side check
          ball.x + ball.size < brick.x + brick.w && // right brick side check
          ball.y + ball.size > brick.y && // top brick side check
          ball.y - ball.size < brick.y + brick.h // bottom brick side check
        ) {
          ball.dy *= -1;
          brick.visible = false;

          increaseScore();
        }
      }
    });
  });

  // Hit bottom wall - Lose
  if (ball.y + ball.size > canvas.height) {
    showAllBricks();
    score = 0;
    // Скидання швидкості та положення м'яча при програші
    ball.speed = 4;
    ball.dx = 4;
    ball.dy = -4;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
  }
}

// Make all bricks appear
function showAllBricks() {
  bricks.forEach(column => {
    column.forEach(brick => (brick.visible = true));
  });
}

// Increase score
function increaseScore() {
  score++;

  // Самостійно 1: Збільшувати швидкість м'яча при попаданні в суммі 10 блоків на 1
  if (score > 0 && score % 10 === 0) {
    ball.speed += 1;
    // Оновлення вектора швидкості із збереженням напрямку
    ball.dx = (ball.dx > 0 ? 1 : -1) * ball.speed;
    ball.dy = (ball.dy > 0 ? 1 : -1) * ball.speed;
  }

  // Перевірка чи збиті всі блоки (9*5 = 45)
  const noBricksLeft = bricks.every(column => column.every(brick => !brick.visible));
  if (noBricksLeft || score % (brickRowCount * brickColumnCount) === 0) {
    showAllBricks();
  }
}

// Draw everything
function draw() {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawScore();
  drawBall();
  drawPaddle();
  drawBricks();
}

// Update canvas drawing and animation
function update() {
  // Draw everything
  movePaddle();
  moveBall();
  draw();
  requestAnimationFrame(update);
}

update();

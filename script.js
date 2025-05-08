const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const restartBtn = document.getElementById("restartBtn");
const soundToggle = document.getElementById("soundToggle");

const GRAVITY = 0.5;
const JUMP = -8;
const PIPE_WIDTH = 80;
const PIPE_GAP = 160;
const GROUND_HEIGHT = 100;

let bird, pipes, score, gameOver, soundOn, gameStarted, countdown;
resetGame();

const bg = new Image();
bg.src = "Images/background.jpg";

const ground = new Image();
ground.src = "Images/ground.png";

const birdImg = new Image();
birdImg.src = "Images/bird.png";

const pipeImg = new Image();
pipeImg.src = "Images/pipe.png";


const flapSound = new Audio("Sound/Flap.mp3");
const pointSound = new Audio("Sound/point.mp3");
const hitSound = new Audio("Sound/Hit.mp3");
const dieSound = new Audio("Sound/Die.mp3");

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && gameStarted && !gameOver) {
    bird.velocity = JUMP;
    if (soundOn) playSound(flapSound);
  }
});


document.addEventListener("touchstart", (e) => {
  if (gameStarted && !gameOver) {
    bird.velocity = JUMP;
    if (soundOn) playSound(flapSound);
  }
});

restartBtn.onclick = () => {
  resetGame();
  countdownStart();
};

soundToggle.onclick = () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? "🔊 Sound" : "🔇 Muted";
};

function resetGame() {
    bird = { x: 100, y: 200, width: 50, height: 40, velocity: 0 };
    pipes = [];
    score = 0;
    gameOver = false;
    gameStarted = false;
    soundOn = true;
    countdown = 3;
  
    restartBtn.style.display = "none"; 
  
    canvas.width = window.innerWidth;  
    canvas.height = window.innerHeight; 
  }
  

function countdownStart() {
  const countdownInterval = setInterval(() => {
    countdown--;
    if (countdown === 0) {
      gameStarted = true;
      clearInterval(countdownInterval);
    }
  }, 1000);
}

function createPipe() {
  const topHeight = Math.floor(Math.random() * 200) + 100;
  pipes.push({
    x: canvas.width,
    topHeight,
    bottomY: topHeight + PIPE_GAP,
    passed: false
  });
}

function drawPipes() {
  pipes.forEach(pipe => {
    ctx.save();
    ctx.translate(pipe.x + PIPE_WIDTH / 2, pipe.topHeight);
    ctx.scale(1, -1);
    ctx.drawImage(pipeImg, -PIPE_WIDTH / 2, 0, PIPE_WIDTH, 400);
    ctx.restore();

    ctx.drawImage(pipeImg, pipe.x, pipe.bottomY, PIPE_WIDTH, 400);
  });
}

function triggerGameOver() {
    if (!gameOver) {
      gameOver = true;
      if (soundOn) {
        playSound(hitSound);
        setTimeout(() => playSound(dieSound), 300);
      }
  
      restartBtn.style.display = "block";
    }
  }
  

function update() {
  if (gameOver || !gameStarted) return;

  bird.velocity += GRAVITY;
  bird.y += bird.velocity;

  if (bird.y + bird.height > canvas.height - GROUND_HEIGHT) {
    triggerGameOver();
  }

  pipes.forEach(pipe => {
    pipe.x -= 3;

    if (
      bird.x < pipe.x + PIPE_WIDTH &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY)
    ) {
      triggerGameOver();
    }

    if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
      pipe.passed = true;
      score++;
      if (soundOn) playSound(pointSound);
    }
  });

  pipes = pipes.filter(pipe => pipe.x > -PIPE_WIDTH);

  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
    createPipe();
  }
}

function draw() {
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  drawPipes();
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  ctx.drawImage(ground, 0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);

  ctx.fillStyle = "red";
  ctx.font = "30px Arial";
  ctx.fillText("Score: " + score, 80, 40);

  if (!gameStarted) {
    ctx.fillStyle = "black";
    ctx.font = "80px Arial";
    ctx.textAlign = "center";
    ctx.fillText(countdown > 0 ? countdown : "", canvas.width / 2, canvas.height / 2);
  }
  

  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
  }
  
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}


function goFullScreen() {
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.mozRequestFullScreen) {
    canvas.mozRequestFullScreen(); 
  } else if (canvas.webkitRequestFullscreen) {
    canvas.webkitRequestFullscreen(); 
  }
}

goFullScreen();

createPipe();
countdownStart();
gameLoop();

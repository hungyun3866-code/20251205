// --- 核心變數與常數 ---
let standSheet;      // 站立圖片精靈 (2 幀)
let walkSheet;       // 走路圖片精靈 (6 幀)
let jumpSheet;       // 跳躍圖片精靈 (3 幀)
let attackSheet;     // 攻擊圖片精靈 (新加入: 3 幀)

const STAND_FRAMES = 2; 
const WALK_FRAMES = 6;  
const JUMP_FRAMES = 3;   
const ATTACK_FRAMES = 3;   // 攻擊動畫總影格數
const ATTACK_HEIGHT = 48;  // 攻擊影格的高度

let standFrameWidth, standFrameHeight;
let walkFrameWidth, walkFrameHeight;
let jumpFrameWidth, jumpFrameHeight;
let attackFrameWidth, attackFrameHeight; // 攻擊尺寸

let posX;            // 角色 X 座標
let posY;            // 角色 Y 座標 (以中心點繪製)
let speed = 3;       // 橫向移動速度
let direction = 1;   // 角色面朝方向 (1: 右, -1: 左)
let state = 'stand'; // 角色狀態 ('stand', 'walk', 'jump', 或 'attack')
let animationSpeed = 8; // 動畫切換速度 (數字越大越慢)

// --- 跳躍與攻擊物理變數 ---
let velocityY = 0;     // 垂直速度
let gravity = 0.5;     // 重力加速度
let jumpStrength = -12; // 跳躍初始向上衝量
let onGround = false;  // 是否在地面上
let groundY;           // 地面高度
let attackAnimationStartTime = 0; // 紀錄攻擊開始的 frameCount (用於單次播放)


function preload() {
  // 載入所有精靈圖，使用大寫資料夾名稱 '20251124-MAIN'
  standSheet = loadImage('stand/1all.png');
  walkSheet = loadImage('walk/2all.png');
  jumpSheet = loadImage('jump/3all.png'); 
  // 載入攻擊動畫 (attack/4all.png)
  attackSheet = loadImage('attack/4all.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 計算所有動畫尺寸
  standFrameWidth = standSheet.width / STAND_FRAMES;
  standFrameHeight = standSheet.height; 
  walkFrameWidth = walkSheet.width / WALK_FRAMES; 
  walkFrameHeight = walkSheet.height; 
  jumpFrameWidth = jumpSheet.width / JUMP_FRAMES; 
  jumpFrameHeight = jumpSheet.height; 
  // 計算攻擊動畫尺寸
  attackFrameWidth = attackSheet.width / ATTACK_FRAMES; 
  attackFrameHeight = attackSheet.height; 

  // 設定地面高度和角色初始位置
  groundY = height * 0.75; 
  posX = width / 2;
  posY = groundY;
  onGround = true;
}

function draw() {
  background(255); 
  
  // 處理狀態切換與移動
  handleMovement(); 

  // 繪製角色
  drawCharacter();
}

// --- 攻擊輸入處理 (只在按下瞬間觸發) ---
function keyPressed() {
  // 空白鍵 (ASCII 32) 且角色不在跳躍狀態時，可以發動攻擊
  // 攻擊將中斷走路/站立，但在空中時不能發動
  if (key === ' ' && onGround) { 
    state = 'attack';
    attackAnimationStartTime = frameCount; // 紀錄開始時間
  }
}


// --- 輔助函式 ---

function handleMovement() {
  
  // --- 1. 處理攻擊動畫結束後的狀態切換 (優先執行) ---
  if (state === 'attack') {
    const attackDurationFrames = ATTACK_FRAMES * animationSpeed;
    if (frameCount >= attackAnimationStartTime + attackDurationFrames) {
      // 攻擊動畫結束。回到站立或走路狀態 (取決於是否有按左右鍵)
      if (keyIsDown(LEFT_ARROW) || keyIsDown(RIGHT_ARROW)) {
          state = 'walk';
      } else {
          state = 'stand';
      }
    }
    // 攻擊期間，不檢查其他按鍵 (但重力仍作用)
  }

  // --- 2. 跳躍物理處理 (優先於一般移動) ---
  
  // 套用重力 (垂直速度隨著時間增加)
  velocityY += gravity; 
  
  // 更新Y座標
  posY += velocityY; 

  // 檢查是否落地 (地面碰撞)
  if (posY >= groundY) {
    posY = groundY;
    velocityY = 0;
    onGround = true;
  } else {
    onGround = false;
  }

  // --- 3. 橫向移動與狀態設定 (非攻擊狀態時才允許改變) ---
  if (state !== 'attack') {
      
      // 偵測跳躍輸入 (只有在地面上時才能起跳)
      if (keyIsDown(UP_ARROW) && onGround) {
        velocityY = jumpStrength; 
        onGround = false;         
        state = 'jump';
      }
      
      // 偵測左右移動
      if (keyIsDown(RIGHT_ARROW)) {
        posX += speed;
        direction = 1; 
        if (onGround) {
          state = 'walk';
        }
      } else if (keyIsDown(LEFT_ARROW)) {
        posX -= speed;
        direction = -1;
        if (onGround) {
          state = 'walk';
        }
      } else if (onGround) {
        // 沒有按左右鍵時，保持站立
        state = 'stand';
      }
      
      // 確保在空中時狀態永遠是 'jump'
      if (!onGround && state !== 'jump') {
          state = 'jump';
      }
  }


  // 保持角色在畫面內
  posX = constrain(posX, 0, width);
}


function drawCharacter() {
  let currentSheet;
  let currentFrames;
  let currentFrameW;
  let currentFrameH;
  let currentFrameIndex;

  // 根據角色狀態選擇要使用的精靈圖和參數
  if (state === 'walk') {
    currentSheet = walkSheet;
    currentFrames = WALK_FRAMES;
    currentFrameW = walkFrameWidth;
    currentFrameH = walkFrameHeight;
    // 循環播放動畫
    currentFrameIndex = floor(frameCount / animationSpeed) % currentFrames;
  } else if (state === 'jump') {
    currentSheet = jumpSheet;
    currentFrames = JUMP_FRAMES;
    currentFrameW = jumpFrameWidth;
    currentFrameH = jumpFrameHeight;
    // 循環播放動畫
    currentFrameIndex = floor(frameCount / animationSpeed) % currentFrames;
  } else if (state === 'attack') {
    currentSheet = attackSheet;
    currentFrames = ATTACK_FRAMES;
    currentFrameW = attackFrameWidth;
    currentFrameH = attackFrameHeight;
    
    // 攻擊動畫只播放一次
    const elapsedFrames = frameCount - attackAnimationStartTime;
    currentFrameIndex = floor(elapsedFrames / animationSpeed);
    // 確保索引不會超過最後一幀，讓最後一幀定格直到狀態結束
    currentFrameIndex = min(currentFrameIndex, ATTACK_FRAMES - 1);
  } else { // 'stand' 狀態
    currentSheet = standSheet;
    currentFrames = STAND_FRAMES;
    currentFrameW = standFrameWidth;
    currentFrameH = standFrameHeight;
    // 循環播放動畫
    currentFrameIndex = floor(frameCount / animationSpeed) % currentFrames;
  }

  let sx = currentFrameIndex * currentFrameW;

  // --- 處理翻轉和位移 ---
  push(); 

  // 1. 將畫布原點移動到角色的繪製中心點 (posX, posY)
  translate(posX, posY); 

  // 2. 根據 direction 變數水平翻轉 (適用於所有動畫)
  if (direction === -1) {
    scale(-1, 1);
  }

  // 3. 繪製圖片 (以新的原點 (0, 0) 為中心繪製)
  image(
    currentSheet,
    -currentFrameW / 2, -currentFrameH / 2, // 繪製在 (0, 0) 的中心
    currentFrameW, currentFrameH,
    sx, 0, currentFrameW, currentFrameH
  );

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 重新計算地面位置
  let oldGroundY = groundY;
  groundY = height * 0.75;
  // 調整角色 Y 座標以保持在地面上
  posY += (groundY - oldGroundY);
  posX = width / 2;
}
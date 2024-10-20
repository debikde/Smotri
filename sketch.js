let points = [];
let cells = [];
let healthyImgs = [];
let cellSize;
let healthyImg;
let t = 0;
let offsetX, offsetY;

let scene = 0;
let lastSwitch = 0;
const sceneDuration = 7000; 
let rectWidth, rectHeight, rectX, rectY;

let customFont;

let randomPhrase;
let phraseColor;

const frmRate = 10;

function preload() {
  for (let i = 1; i <= 25; i++) {
    healthyImg = loadImage(`healthy${i}.jpg`);
    healthyImgs.push(healthyImg);
  }
  customFont = loadFont('Play-Regular.ttf'); // Replace with the path to your font file
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  rectWidth = width / 2;
  rectHeight = height / 2;
  rectX = (width - rectWidth) / 2;
  rectY = (height - rectHeight) / 2;

  setupScene1();
  setupScene2();
  setupScene3();
  setupScene4(); 
  
  
  frameRate(frmRate);
}

function draw() {
  let currentTime = millis();
  if (currentTime - lastSwitch > sceneDuration) {
    scene = (scene + 1) % 4; // Increase to 4 scenes
    lastSwitch = currentTime;
  }

  if (scene === 0) {
    drawScene1();
  } else if (scene === 1) {
    drawScene2();
  } else if (scene === 2) {
    drawScene3();
  } else if (scene === 3) {
    drawScene4(); // Draw the new scene
  }
}

function setupScene1() {
  points = [];
  for (let i = 0; i < 1000; i++) {
    let x = random(rectX, rectX + rectWidth);
    let y = random(rectY, rectY + rectHeight);
    let point = [x, y];
    points.push(point);
  }
}

function drawScene1() {
  background(0);
  fill(255, 200); // Semi-transparent white
  rect(rectX, rectY, rectWidth, rectHeight);  // Draw the white rectangle

  for (let i = 0; i < 50; i++) {
    fill(0);
    stroke(0);
    let point = points[i];
    let x = point[0];
    let y = point[1];

    // Only draw the circle if it is completely within the white rectangle
    let circleSize = floor(random(10, 30));
    if (x - circleSize / 2 >= rectX && x + circleSize / 2 <= rectX + rectWidth &&
        y - circleSize / 2 >= rectY && y + circleSize / 2 <= rectY + rectHeight) {
      circle(x, y, circleSize);
    }

    let windX = noise(x / 100, y / 100, 0) * -1;
    let windY = noise(x / 100, y / 100, 9) * 3;

    let Xline = random() * 5;
    let Yline = random();

    // Ensure lines are drawn within the white rectangle
    if (x + Xline * 30 <= rectX + rectWidth && y + Yline * 100 <= rectY + rectHeight) {
      line(x, y, x + Xline * 30, y + Yline * 100);
    }

    point[0] = constrain(point[0] + windX, rectX, rectX + rectWidth);
    point[1] = constrain(point[1] + windY, rectY, rectY + rectHeight);

    if (random() < 0.01) {
      point[0] = random(rectX, rectX + rectWidth);
      point[1] = random(rectY, rectY + rectHeight);
    }
  }
}

function setupScene2() {
  cells = [];
  let cols = floor(windowWidth / 100);
  let rows = floor(windowHeight / 100);
  cellSize = 200;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let cell = new Cell(i * cellSize, j * cellSize, cellSize, healthyImgs[floor(random(1, healthyImgs.length))]);
      cells.push(cell);
    }
  }
  
  startInfectionCycle();
}

function drawScene2() {
  background('black');
  for (let cell of cells) {
    cell.show();
  }
}

function startInfectionCycle() {
  setTimeout(() => {
    infectRandomCells();
    
    setTimeout(() => {
      treatCells();
      
      setTimeout(() => {
        updateCells();
        addNewCells();
        
        setTimeout(startInfectionCycle, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
}

function infectRandomCells() {
  let numInfected = floor(random(1, cells.length));
  let shuffledCells = shuffle(cells);
  for (let i = 0; i < numInfected; i++) {
    shuffledCells[i].startInfect();
  }
}

function treatCells() {
  let infectedCells = cells.filter(cell => cell.infected && !cell.dead);
  let numToTreat = floor(random(1, infectedCells.length + 1));
  let shuffledInfected = shuffle(infectedCells);
  for (let i = 0; i < numToTreat; i++) {
    shuffledInfected[i].startTreat();
  }
}

function updateCells() {
  for (let cell of cells) {
    cell.update();
  }
  cells = cells.filter(cell => !cell.dead);
}

function addNewCells() {
  let cols = floor(windowWidth / cellSize);
  let rows = floor(windowHeight / cellSize);

  while (cells.length < cols * rows) {
    let newCell = new Cell(floor(random(cols)) * cellSize, floor(random(rows)) * cellSize, cellSize, healthyImgs[floor(random(1, healthyImgs.length))]);
    cells.push(newCell);
  }
}

class Cell {
  constructor(x, y, size, img) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.img = img;
    this.alpha = 255;
    this.targetAlpha = 255;
    this.fadeSpeed = 5;
    this.infected = false;
    this.dead = false;
    this.treating = false;
    this.circleX = 0;
    this.circleY = 0;
    this.circleSize = 0;
  }

  show() {
    strokeWeight(1);
    tint(255, this.alpha);
    image(this.img, this.x, this.y, this.size, this.size);
    noTint();
    
    this.alpha = lerp(this.alpha, this.targetAlpha, 0.05);
  }

  startInfect() {
    this.infected = true;
    this.targetAlpha = 0;
  }

  startTreat() {
    this.infected = false;
    this.treating = true;
    this.targetAlpha = 0;
  }

  update() {
    if (this.alpha < 5 && this.targetAlpha === 0) {
      this.dead = true;
    } else if (this.alpha > 250) {
      this.targetAlpha = 255;
    } else if (this.targetAlpha === 0 && this.alpha < 255) {
      this.targetAlpha = 255;
    }
  }
}

function setupScene3() {
  offsetX = 0;
  offsetY = 0;
  background(color(102, 108, 111));
  textSize(32);
  fill(255);
}

function drawScene3() {
  phraseColor = color(random(50, 150), random(50, 150), random(50, 150)); 
  randomPhrase = generateRandomPhrase();
  noStroke();
  background(color(145, 145, 168));

  t += 0.1;

  let totalShapes = 35;

  for (let i = totalShapes; i >= 0; i--) {
    let c;
    if (i === 1) {
      c = color(255, 255, 255, 255);
    } else if (i === 2) {
      c = color(0, 0, 255, 255);
    } else {
      let shapePosition = i / totalShapes;
      let lerpValue = ((-t / 2 + shapePosition)) % 1;
      c = getColor(lerpValue);
    }

    let alpha = map(i, 0, totalShapes, 255, 50);
    c.setAlpha(alpha);

    fill(c);
    beginShape();
    for (let angle = 0; angle < 2 * PI; angle += PI / 20) {
      let r = map(noise(t + angle * 100), 0, 1, 0 * i / totalShapes, 100 * i / totalShapes) * 15;
      let x = cos(angle) * r + width / 2 + offsetX;
      let y = sin(angle) * r + height / 2 + offsetY;
      vertex(x, y);
    }
    endShape(CLOSE);
  }
  filter(BLUR, 3);
  fill(color(222, 213, 232));
  textSize(64);

  let randomNumber1 = int(random(10, 999));
  let randomNumber2 = int(random(10, 999));

  textAlign(RIGHT, TOP);
  text(randomNumber1, width - 100, 100);
  text(randomNumber2, width - 100, 200);
  
  textAlign(LEFT, BOTTOM);
  text(randomNumber1, 100, height - 100);
  text(randomNumber2, 100, height - 200);
}

function setupScene4() {
  background(255);
  
  
  textSize(64);
  textFont(customFont);
  textAlign(CENTER, CENTER);
}

function drawScene4() {
  background(0);
  textSize(50);
  textFont(customFont);
  fill(phraseColor);
  
  text(randomPhrase, width / 4, height / 2);

}

function generateRandomPhrase() {
  let phrases = [
    "Ты хорошо себя чувствуешь?",
    "У тебя все хорошо?",
    "Как ты себя ощущаешь?",
    "Что у тебя болит?",
    "Что ты чувствуешь?",
    "Как ты?",
    "Где начало и конец твоих переживаний?",
    "Я тебя пугаю?",
    "Все будет хорошо",
    "С каждым моментом он все больше развивается",
    "Он чувствует. Мне он неприятен",
    "Ты должен сказать мне что-то хорошее",
    "Успокой меня",
    "Я хорошо влияю на тебя?",
    "Тебе тревожно?",
    "Как мне тебе помочь?",
    "Ты помнишь что было?",
    "Когда ты чувствуешь печаль?"
  ];
  return phrases[floor(random(0,phrases.length))]
}

function getColor(lerpValue) {
  lerpValue = (lerpValue % 1 + 1) % 1;

  let blue = color(105, 154, 255);
  let green = color(63, 214, 58);
  let yellow = color(234, 250, 12);
  let orange = color(255, 105, 215);
  
  if (lerpValue < 0.25) {
    return lerpColor(blue, green, map(lerpValue, 0, 0.25, 0, 1));
  } else if (lerpValue < 0.5) {
    return lerpColor(green, yellow, map(lerpValue, 0.25, 0.5, 0, 1));
  } else if (lerpValue < 0.75) {
    return lerpColor(yellow, orange, map(lerpValue, 0.5, 0.75, 0, 1));
  } else {
    return lerpColor(orange, blue, map(lerpValue, 0.75, 1, 0, 1));
  }
}
function keyPressed() {
  if (key === 's') {
    saveGif('11.gif', 55); 
  }
}

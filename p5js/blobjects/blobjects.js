
let blobjects = [];
let windowSize = 1;

Array.prototype.getNextIndex = function (index) {
  return index + 1 < this.length ? index + 1 : 0;
};

Array.prototype.getPrevIndex = function (index) {
  return index > 0 ? index - 1 : this.length - 1;
};

function sign(x) {
  return x >= 0 ? 1 : -1;
}

function randomBetween(num1, num2, int) {
  let ret = num1 + (num2 - num1) * Math.random();
  if (int) {
    return Math.round(ret);
  }
  return ret;
}

function randomAngle() {
  return 2 * Math.PI * Math.random();
}

function dx(p1, p2) {
  return p2.x - p1.x;
}

function dy(p1, p2) {
  return p2.y - p1.y;
}

function dot(p1, p2, p3, p4) {
  return dx(p1, p2) * dx(p3, p4) + dy(p1, p2) * dy(p3, p4);
}

function distanceSquared(p1, p2) {
  return Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
}

function distance(p1, p2) {
  return Math.sqrt(distanceSquared(p1, p2));
}

function angleBetween(p1, p2, p3, p4) {
  return Math.acos(dot(p1, p2, p3, p4) / (distance(p1, p2) * distance(p3, p4)));
}

function createBeziers(points) {

  let angles = [];
  let lengths = [];
  let beziers = [];

  for (let i = 0; i < points.length; i++) {
    let start = points[i];
    let end = points[points.getNextIndex(i)];
    let prev = points[points.getPrevIndex(i)];
    angles[i] = angleBetween(start, prev, start, end);
    lengths[i] = distance(start, end);
  }

  for (let i = 0; i < points.length; i++) {
    let start = points[i];
    let endIndex = points.getNextIndex(i);
    let end = points[endIndex];
    let prev = points[points.getPrevIndex(i)];
    let afterEnd = points[points.getNextIndex(endIndex)];

    let len = distance(start, end);

    let tangentLen = distance(prev, end);
    let tangentDx = (end.x - prev.x) / tangentLen;
    let tangentDy = (end.y - prev.y) / tangentLen;

    let nextTangentLen = distance(start, afterEnd);
    let nextTangentDx = (afterEnd.x - start.x) / nextTangentLen;
    let nextTangentDy = (afterEnd.y - start.y) / nextTangentLen;

    let angle1Contribution = angles[i];
    let angle2Contribution = angles[endIndex];
    let denom = angle1Contribution + angle2Contribution;
    let angleFactor1 = angle1Contribution / denom;
    let angleFactor2 = angle2Contribution / denom

    let p2 = {
      x: start.x + len / 1.5 * tangentDx * angleFactor1,
      y: start.y + len / 1.5 * tangentDy * angleFactor1
    };

    let p3 = {
      x: end.x - len / 1.5 * nextTangentDx * angleFactor2,
      y: end.y - len / 1.5 * nextTangentDy * angleFactor2
    };

    beziers[i] = [start, p2, p3, end];
  }
  return beziers;
}

function Blobject() {
  this.numPiePieces = randomBetween(3, 10, true);
  this.radiusAngles = [];
  this.radiusSpeeds = [];
  this.sizeAngle = randomAngle();
  this.sizeSpeed = randomBetween(1, 5);

  for (let i = 0; i < this.numPiePieces; i++) {
    this.radiusAngles[i] = randomAngle();
    this.radiusSpeeds[i] = randomBetween(1, 5);
  }

  this.points = this.buildPoints();

  this.beziers = createBeziers(this.points);

  this.center = {
    x: Math.random() * width,
    y: Math.random() * height
  };

  this.speedX = randomBetween(1, 5);
  this.speedY = randomBetween(1, 5);

  this.hue = Math.random() * 100;
  this.hueSpeed = randomBetween(1, 5);
}

Blobject.prototype.buildPoints = function () {
  let points = [];

  let piSlice = 2 * Math.PI / this.numPiePieces;

  for (let i = 0; i < this.numPiePieces; i++) {
    let radius = 1 / 3 * (1 + Math.sin(this.radiusAngles[i]) / 2 / Math.sqrt(this.numPiePieces));
    let p = {
      x: radius * cos(i * piSlice),
      y: radius * sin(i * piSlice)
    };
    points[i] = p;
  }
  return points;
}

Blobject.prototype.getSize = function () {
  return windowSize / 6 * (.5 + 1.75 * (Math.sin(this.sizeAngle) + 1));
}

Blobject.prototype.permute = function () {
  if (deltaTime === undefined || deltaTime < 0 || deltaTime > 500)
  {
    return;
  }
  if (deltaTime < 0 || deltaTime )
  this.center.x += deltaTime / 100 * this.speedX;
  this.center.y += deltaTime / 100 * this.speedY;

  for (let i = 0; i < this.radiusAngles.length; i++) {
    this.radiusAngles[i] += deltaTime / 1000 * this.radiusSpeeds[i];
  }

  this.sizeAngle += deltaTime / 10000 * this.sizeSpeed;

  this.points = this.buildPoints();
  this.beziers = createBeziers(this.points);
  this.hue += deltaTime / 1000 * this.hueSpeed;
  this.hue = this.hue % 100;
}

function setup() {
  windowSize = (windowWidth + windowHeight) / 2;
  createCanvas(windowWidth, windowHeight);

  for (let i = 0; i < 10; i++) {
    blobjects[i] = new Blobject();
  }
}

function windowResized() {
  windowSize = (windowWidth + windowHeight) / 2;
  resizeCanvas(windowWidth, windowHeight);
}

function drawBlobject(blobject) {
  push();
  colorMode(HSB, 100);
  stroke(0);
  fill(blobject.hue, 100, 100, 50);
  translate(blobject.center.x, blobject.center.y);
  scale(blobject.getSize());
  strokeWeight(windowSize / 80 / blobject.getSize());
  beginShape();
  for (let i = 0; i < blobject.beziers.length; i++) {
    let bezier = blobject.beziers[i];
    if (i == 0) {
      vertex(bezier[0].x, bezier[0].y);
    }
    bezierVertex(bezier[1].x, bezier[1].y, bezier[2].x, bezier[2].y, bezier[3].x, bezier[3].y);
  }
  endShape(CLOSE);

  //stroke(0);
  //noFill();
  //beginShape();
  //for (let i = 0; i < blobject.beziers.length; i++) {
  //  let bezier = blobject.beziers[i];
  //  vertex(bezier[0].x, bezier[0].y);
  //}
  //endShape(CLOSE);
  pop();
}

function applyForces() {
  for (let i = 0; i < blobjects.length; i++) {
    let b1 = blobjects[i];
    let c1 = b1.center;
    if (c1.x < 1) {
      c1.x = 1;
      c1.speedX = 0;
    }
    if (c1.x >= width - 1) {
      c1.x = width - 1;
      c1.speedX = 0;
    }
    if (c1.y < 1) {
      c1.y = 1;
      c1.speedY = 0;
    }
    if (c1.y >= height - 1) {
      c1.y = height - 1;
      c1.speedY = 0;
    }

    for (let j = 0; j < blobjects.length; j++) {
      if (i == j) {
        continue;
      }
      let b2 = blobjects[j];
      let c2 = b2.center;
      let acc = b2.getSize() / distanceSquared(c1, c2);

      let denom = distance(c1, c2);
      b1.speedX -= acc * dx(c1, c2) / denom;
      b1.speedY -= acc * dy(c1, c2) / denom;
    }
    b1.speedX += width / Math.pow(c1.x, 2);
    b1.speedY += height / Math.pow(c1.y, 2);
    b1.speedX -= width / Math.pow(width - c1.x, 2);
    b1.speedY -= height / Math.pow(height - c1.y, 2);
    b1.speedX = sign(b1.speedX) * Math.min(Math.abs(b1.speedX), width / 30);
    b1.speedY = sign(b1.speedY) * Math.min(Math.abs(b1.speedY), height / 30);
  }
}

function draw() {
  if (width == 0 || height == 0) {
    return;
  }
  colorMode(RGB, 255);
  clear();

  strokeWeight(windowSize / 40);
  rect(0, 0, width, height);
  applyForces();

  for (let i = 0; i < blobjects.length; i++) {
    blobjects[i].permute();
  }

  for (let i = 0; i < blobjects.length; i++) {
    drawBlobject(blobjects[i]);
  }
}
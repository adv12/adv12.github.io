let speeds = [];
let count = 10;
let twoPi = 2 * Math.PI;
let speedFraction = twoPi;
let canvas;

function setup() {
  let size = .9 * min(windowWidth, windowHeight);
  canvas = createCanvas(size, size);
  canvas.position((windowWidth - size) / 2, (windowHeight - size) / 2);

  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      speeds[row * count + col] = 1 + (speedFraction * (row * count + col) / (count * count));
    }
  }
}

function windowResized()
{
  let size = .9 * min(windowWidth, windowHeight);
  resizeCanvas(size, size);
  canvas.position((windowWidth - size) / 2, (windowHeight - size) / 2);
}

function draw() {
  let date = new Date();
  let ms = date.getTime();
  background(255);
  fill(255, 255, 255, 0)
  stroke(0);
  rect(0, 0, width, height);
  let sz = width / count;
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      let idx = row * count + col;
      let idxFraction = 1 - idx / (count * count)
      fill(0, 255 * idxFraction, 255 * (1 - idxFraction), 100);
      let fraction = (1 + sin(speeds[idx] * twoPi * ms / 10000)) / 2;
      if ((row * count + col) % 2 == 0) {
        fraction = 1 - fraction;
      }
      let x = col * sz + sz * (1 - fraction) / 2;
      let y = row * sz + sz * (1 - fraction) / 2;
      square(x, y, sz * fraction);
    }
  }
}
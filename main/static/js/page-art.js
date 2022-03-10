const canvas = document.querySelector(".page-art");
const context = canvas.getContext("2d");
const container = document.querySelector(".page-banner");
canvas.width = container.getBoundingClientRect().width;
canvas.height = container.getBoundingClientRect().height;
const images = document.querySelectorAll("img");
const image1 = images[0];
const image2 = images[1];

addEventListener("resize", () => {
  canvas.width = container.getBoundingClientRect().width;
  canvas.height = container.getBoundingClientRect().height;
});

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawEllipse("#b1a7a6", 0.2, 300, 100);
  drawEllipse("#ba181b", 0.8, 400, 100);
  drawEllipse("#FFFF", 0, 400, 50);
  drawImage(image1, 170, 120, 250, 350, 10);
  drawImage(image2, 390, 150, 250, 350, 10);
  requestAnimationFrame(draw);
}

function drawImage(image, x, y, width, height, borderRadius) {
  // x and y are start coordinates
  context.save();
  roundedRect(x, y, width, height, borderRadius);
  context.clip();
  context.drawImage(image, x, y, width, height);
  context.restore();
}

function drawEllipse(color, rotation, width, height) {
  context.beginPath();
  context.ellipse(
    canvas.width * 0.5 + rotation,
    canvas.height * 0.5,
    width,
    height,
    Math.PI * rotation,
    0,
    Math.PI * 2
  );
  context.fillStyle = color;
  context.fill();
}

function roundedRect(x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height
  );
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

draw();

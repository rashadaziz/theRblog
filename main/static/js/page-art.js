const canvas = document.querySelector(".page-art");
const context = canvas.getContext("2d");
const container = document.querySelector(".page-banner");
canvas.width = container.getBoundingClientRect().width;
canvas.height = container.getBoundingClientRect().height;

const image1 = new Image();
image1.src = "../images/image1.jpg"
const image2 = new Image();
image2.src = "../images/image2.jpg"

addEventListener("resize", () => {
  canvas.width = container.getBoundingClientRect().width;
  canvas.height = container.getBoundingClientRect().height;
});

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height)
    drawEllipse("#b1a7a6", 0.2, 200, 100)
    drawEllipse("#ba181b", 0.8, 300, 100)
    drawEllipse("#FFFF", 0, 300, 50)
    requestAnimationFrame(draw)
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
    context.fillStyle = color
    context.fill();
}

draw();



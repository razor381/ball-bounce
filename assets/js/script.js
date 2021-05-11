const KNOTS = 20;
const DEFAULT_MIN_RADIUS = 10;
const DEFAULT_RADIUS = 50;
const DEFAULT_SHAPES_QTY = 40;
const DEFAULT_COLOR = 'rgba(255, 255, 255, 0.5)';
const COLORS = ['#46B39D', '#F0CA4D', '#E37B40', '#DE5B49'];

const canvas = document.querySelector('canvas');

// ---------------- classes ------------------------

function Shape(x, y, color) {
  this.x = x;
  this.y = y;
  this.dx = (Math.random() - 0.5) * KNOTS;
  this.dy = (Math.random() - 0.5) * KNOTS;
  this.color = color;
}

Shape.prototype.setColor = (color) => this.color = color;

Shape.prototype.move = function(xDistance = 1, yDistance = 1) {
  if (this.x - this.radius <= 0) {
    this.dx = Math.abs(this.dx);
  }

  if (this.y - this.radius <= 0) {
    this.dy = Math.abs(this.dy);
  }

  if (this.x + this.radius >= canvas.width) {
    this.dx = -1 * Math.abs(this.dx);
  }

  if (this.y + this.radius >= canvas.height) {
    this.dy = -1 * Math.abs(this.dy);
  }

  this.x += this.dx * xDistance;
  this.y += this.dy * yDistance;
}

function Circle(x, y, radius, color) {
  Shape.call(this, x, y, color);
  this.radius = radius;
}

Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;

Circle.prototype.draw = function(ctx) {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
  ctx.fillStyle = this.color;
  ctx.fill();
}


// ----------------- functions ------------------------


function animateShapes(ctx, shapes) {
  function animate() {
    moveShapes(shapes);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShapes(ctx,shapes);
    requestAnimationFrame(animate);
  }
  animate();
}

function getDistanceBetween(p1, p2) {
  const xDiff = p2.x - p1.x;
  const yDiff = p2.y - p1.y;

  return Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
}

function isColliding(shape1, shape2) {
  const combinedRadius = shape1.radius + shape2.radius;
  const displacement = getDistanceBetween(shape1, shape2);
  return (displacement - combinedRadius) <= 0;
}

function handleCollision(shape1, shape2) {
  [shape1.dx, shape1.dy, shape2.dx, shape2.dy] = [shape2.dx, shape2.dy, shape1.dx, shape1.dy];

  shape1.move();
  shape2.move();
}

function checkShapesCollision(shapes) {
  for (let i = 0; i < shapes.length; i++) {
    for (let j = 0; j < shapes.length; j++) {
      if (!(i === j)) {
        if (isColliding(shapes[i], shapes[j])) {
          handleCollision(shapes[i], shapes[j]);
        }
      }
    }
  }
}

function getRandomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateRandomShapes() {
  const shapes = [];

  for(let i = 0; i <DEFAULT_SHAPES_QTY; i++ ) {
    shapes.push(new Circle(
      getRandomBetween(DEFAULT_RADIUS, canvas.width - DEFAULT_RADIUS),
      getRandomBetween(DEFAULT_RADIUS, canvas.height - DEFAULT_RADIUS),
      getRandomBetween(DEFAULT_MIN_RADIUS, DEFAULT_RADIUS),
      COLORS[getRandomBetween(0, COLORS.length - 1)],
    ));
  }

  return shapes;
}

function drawShapes(ctx, shapes) {
  shapes.forEach((shape) => shape.draw(ctx));
}

function moveShapes(shapes) {
  shapes.forEach((shape) => shape.move());
  checkShapesCollision(shapes);
}


if (canvas) {
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const shapes = generateRandomShapes();

  animateShapes(ctx, shapes);
}



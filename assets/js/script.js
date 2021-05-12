const KNOTS = 30;

const ANT_RADIUS = 80;
const DEFAULT_ANTS_QTY = 20;

const DEFAULT_MIN_RADIUS = 5;
const DEFAULT_RADIUS = 30;
const DEFAULT_SHAPES_QTY = 100;
const DEFAULT_COLOR = 'rgba(255, 255, 255, 0.5)';
const WHITE_COLOR = 'white';

const COLORS = ['#46B39D', '#F0CA4D', '#E37B40', '#DE5B49'];
const ANT_IMAGE_SRC = '../assets/img/ant.png';

const canvas = document.querySelector('canvas');
const ballBtn = document.querySelector('.ball-btn');
const antBtn = document.querySelector('.ant-btn');


// --------------------- classes ----------------------


/*
*
*  Class Shape:
*    @params:
*      x: Number
*      y: Number
*      color: String
*
*    @props:
*      x: Number
*      y: Number
*      dx: Number
*      dy: Number
*      color: String
*      baseColor: String
*
*    @methods:
*      setColor: change color of shape
*      showClickResponse: flicker color of shape
*      move: update position of shape
*
*/
function Shape(x, y, color='black') {
  this.x = x;
  this.y = y;
  this.dx = (Math.random() - 0.5) * KNOTS;
  this.dy = (Math.random() - 0.5) * KNOTS;
  this.color = color;
  this.baseColor = color;
}

Shape.prototype.setColor = function (color) {
  this.color = color;
};

Shape.prototype.flash = function () {
  this.setColor(WHITE_COLOR);
  setTimeout(() => {
    this.setColor(this.baseColor)
  }, 50);
}

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


/*
*
*  Class Circle:
*    @params:
*      x: Number
*      y: Number
*      radius: Number
*      color: String
*
*    @props:
*      radius: Number
*
*    @methods:
*      draw: render element inside canvas
*
*/
function Circle(x, y, radius, color) {
  Shape.call(this, x, y, color);
  this.radius = radius;
}

// delegation Shape -> Circle
Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;

Circle.prototype.draw = function(ctx) {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
  ctx.fillStyle = this.color;
  ctx.fill();
}

/*
*
*  Class Ant:
*    @params:
*      x: Number
*      y: Number
*      radius: Number
*      color: String
*
*    @props:
*      radius: Number
*      image: hold image load promise
*
*    @methods:
*      draw: render element inside canvas
*
*/
function Ant(x, y, radius, color) {
  Shape.call(this, x, y, color);
  this.radius = radius;
  this.image = loadImage(ANT_IMAGE_SRC);
}

// delegation Shape -> Ant
Ant.prototype = Object.create(Shape.prototype);
Ant.prototype.constructor = Ant;

Ant.prototype.draw = async function(ctx) {
  const image = await this.image;
  const rotationAngle = getRotationAngle(this.dx, this.dy);

  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.rotate(rotationAngle);
  ctx.translate(-this.x, -this.y);
  ctx.drawImage(
    image,
    this.x,
    this.y,
    this.radius,
    this.radius,
  );
  ctx.restore();
}


// ----------------- functions ------------------------

function getRotationAngle(dx, dy) {
  return Math.atan2(dy, dx) * 180 / Math.PI;
}

function loadImage(src) {
  return new Promise(resolve => {
    let img = new Image();
    img.onload = (() => resolve(img));
    img.src = src;
  });
}

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

  shape1.flash();
  shape2.flash();

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

function generateRandomCircles() {
  const circles = [];

  for(let i = 0; i <DEFAULT_SHAPES_QTY; i++ ) {
    circles.push(new Circle(
      getRandomBetween(DEFAULT_RADIUS, canvas.width - DEFAULT_RADIUS),
      getRandomBetween(DEFAULT_RADIUS, canvas.height - DEFAULT_RADIUS),
      getRandomBetween(DEFAULT_MIN_RADIUS, DEFAULT_RADIUS),
      COLORS[getRandomBetween(0, COLORS.length - 1)],
    ));
  }

  return circles;
}

function generateRandomAnts() {
  const ants = [];

  for(let i = 0; i <DEFAULT_ANTS_QTY; i++ ) {
    ants.push(new Ant(
      getRandomBetween(ANT_RADIUS, canvas.width - ANT_RADIUS),
      getRandomBetween(ANT_RADIUS, canvas.height - ANT_RADIUS),
      ANT_RADIUS,
    ));
  }

  return ants;
}

function drawShapes(ctx, shapes) {
  shapes.forEach((shape) => shape.draw(ctx));
}

function moveShapes(shapes) {
  shapes.forEach((shape) => shape.move());
  checkShapesCollision(shapes);
}

function checkShapesClicked(e, shapes) {
  shapes.forEach((shape, i) => {
    const mousePos = {
      x: e.clientX,
      y: e.clientY,
    };
    const displacement = getDistanceBetween(mousePos, shape);
    if (displacement < shape.radius) {
      shape.flash();
      shapes.splice(i, 1);
    }
  });
}


// ---------------- logic ---------------


if (canvas) {
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (antBtn && ballBtn) {
    ballBtn.addEventListener('click', () => {
      const circles = generateRandomCircles();
      animateShapes(ctx, circles);
    });

    antBtn.addEventListener('click', () => {
      const ants = generateRandomAnts();
      animateShapes(ctx, ants);

      canvas.addEventListener('click', (e) => {
        checkShapesClicked(e, ants);
      })
    });
  }
}



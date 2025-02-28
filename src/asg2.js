// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position; 
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global variables
let canvas, gl, a_Position, u_FragColor, u_ModelMatrix, u_GlobalRotateMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer:true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityMatrix = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityMatrix.elements);
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global UI variables
let g_selectedSize = 5; // default point size
let g_selectedSegments = 10; // default number of segments for circle
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // white
let g_selectedType = POINT; // default shape type
let g_globalAngle = 0; // global rotation angle
let g_headAngle = -2; // head rotation angle
let g_rightArmAngle = 225; // right arm rotation angle
let g_leftArmAngle = 135; // left arm rotation angle
let anim = false; // animation flag

// Actions for HTML UI
function addActionsforHtmlUI(){

  // Animation Button Events
  document.getElementById('animationOn').onclick = function() {anim = true};
  document.getElementById('animationOff').onclick = function() {anim = false};

  // Angle Slider Events
  const angleSlider = document.getElementById('angleSlide');
  const angleDisplay = document.getElementById('angleValue');
  angleSlider.addEventListener('mousemove', function() {
    g_globalAngle = this.value;
    renderAllShapes();
    angleDisplay.textContent = this.value;
  });

  // Head Slider Events
  const headSlider = document.getElementById('headSlide');
  const headDisplay = document.getElementById('headValue');
  headSlider.addEventListener('mousemove', function() {
    g_headAngle = this.value;
    renderAllShapes();
    headDisplay.textContent = this.value;
  });

  // Right Arm Slider Events
  const rightArmSlider = document.getElementById('rightArmSlide');
  const rightArmDisplay = document.getElementById('rightArmValue');
  rightArmSlider.addEventListener('mousemove', function() {
    g_rightArmAngle = this.value;
    renderAllShapes();
    rightArmDisplay.textContent = this.value;
  });

  // Left Arm Slider Events
  const leftArmSlider = document.getElementById('leftArmSlide');
  const leftArmDisplay = document.getElementById('leftArmValue');
  leftArmSlider.addEventListener('mousemove', function() {
    g_leftArmAngle = this.value;
    renderAllShapes();
    leftArmDisplay.textContent = this.value;
  });

}

function main() {

  setupWebGL();
  connectVariablesToGLSL();

  addActionsforHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.65, 0.2, 0.65, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // renderAllShapes();
  requestAnimationFrame(tick);
}

var g_strartTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_strartTime;

function tick() {
  g_seconds = performance.now()/1000.0 - g_strartTime;
  console.log(g_seconds);

  if (anim){
    updateAnimationAngles();
  }

  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  
  // Animation for the head angle (-10 to 20 degrees)
  g_headAngle = -10 + 15 * Math.sin(g_seconds * 2); // Oscillates between -10 and 20

  // Animation for the right arm angle (220 to 245 degrees)
  g_rightArmAngle = 220 + 12.5 * Math.sin(g_seconds * 3); // Oscillates between 220 and 245

  // Animation for the left arm angle (110 to 130 degrees)
  g_leftArmAngle = 110 + 10 * Math.sin(g_seconds * 3); // Oscillates between 110 and 130

}


function convertCoordinatesEvenToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y]);
}

function renderAllShapes(){

  // Get start time
  var startTime = performance.now();

  // Pass the matric to the u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);


  var body = new Cube();
  body.color = [0.90, 0.90, 0.90, 1.0];
  body.matrix.setTranslate(0.0, -0.4, 0.0);
  var bodyCoordinates = new Matrix4(body.matrix);
  body.matrix.scale(0.5, 0.6, 0.75);
  body.matrix.translate(-0.5, 0.0, 0.0);
  body.render();

  var head = new Cube();
  head.color = [0.9, 0.9, 0.9, 1.0];
  head.matrix.setTranslate(-0.25, 0.2001, 0.2);
  head.matrix.rotate(g_headAngle, 1, 0, 0);
  head.matrix.translate(0.0, 0.0, -0.2);
  var headCoordinates = new Matrix4(head.matrix);
  head.matrix.scale(0.5, 0.5, 0.5);
  head.render();

  var bodyBack = new Cube();
  bodyBack.color = [0.85, 0.85, 0.85, 1.0];;
  bodyBack.matrix = new Matrix4(bodyCoordinates);
  bodyBack.matrix.scale(0.4, 0.55, 0.2);
  bodyBack.matrix.translate(-0.5, 0.05, 3.75);
  bodyBack.render();

  var rightEye = new Cube();
  rightEye.color = [0.2, 0.2, 0.2, 1.0];
  rightEye.matrix = new Matrix4(headCoordinates);
  rightEye.matrix.translate(0.5, 0.25, 0.1);
  rightEye.matrix.scale(0.05, 0.1, 0.1);
  rightEye.render();

  var leftEye = new Cube();
  leftEye.color = [0.2, 0.2, 0.2, 1.0];
  leftEye.matrix = new Matrix4(headCoordinates);
  leftEye.matrix.translate(-0.05, 0.25, 0.1);
  leftEye.matrix.scale(0.05, 0.1, 0.1);
  leftEye.render();

  var comb = new Cube();
  comb.color = [1.0, 0.0, 0.0, 1.0];
  comb.matrix = new Matrix4(headCoordinates);
  comb.matrix.scale(0.1, 0.18, 0.3);
  comb.matrix.translate(2.0, 2.8, 0.25);
  comb.render();

  var beakTop = new Cube();
  beakTop.color = [1.0, 0.64, 0.0, 1.0];
  beakTop.matrix = new Matrix4(headCoordinates);
  beakTop.matrix.scale(0.08, 0.1, 0.12);
  beakTop.matrix.translate(2.5, 1.5, -1.);
  beakTop.render();

  var beakBottom = new Cube();
  beakBottom.color = [0.9, 0.0, 0.0, 1.0];
  beakBottom.matrix = new Matrix4(headCoordinates);
  beakBottom.matrix.scale(0.08, 0.08, 0.08);
  beakBottom.matrix.translate(2.5, 0.85, -1.0);
  beakBottom.render();

  var rightArm = new Cube();
  rightArm.color = [0.9, 0.9, 0.9, 1.0];
  rightArm.matrix.setTranslate(0.25, 0.125, 0.1);
  rightArm.matrix.rotate(g_rightArmAngle, 0, 0, 1);
  rightArm.matrix.scale(0.2, 0.5, 0.5);
  rightArm.render();

  var leftArm = new Cube();
  leftArm.color = [0.9, 0.9, 0.9, 1.0];
  leftArm.matrix.rotate(180, 1, 0, 0);
  leftArm.matrix.setTranslate(-0.1, 0., 0.1);
  leftArm.matrix.rotate(g_leftArmAngle, 0, 0, 1);
  leftArm.matrix.scale(0.2, 0.5, 0.5);
  leftArm.render();

  var rightLegTop = new Cube();
  rightLegTop.color = [1.0, 0.64, 0.0, 1.0];
  rightLegTop.matrix.scale(0.05, 0.1, 0.05);
  rightLegTop.matrix.translate(1.0, -5.0, 5.0);
  var rightLegCoordinates = new Matrix4(rightLegTop.matrix);  
  rightLegTop.render();

  var rightLegBottom = new Cube();
  rightLegBottom.color = [1.0, 0.64, 0.0, 1.0];
  rightLegBottom.matrix = new Matrix4(rightLegCoordinates);
  rightLegBottom.matrix.scale(1.5, 0.4, 2.0);
  rightLegBottom.matrix.translate(-0.15, -1.0, -0.5);
  rightLegBottom.render();

  var leftLegTop = new Cube();
  leftLegTop.color = [1.0, 0.64, 0.0, 1.0];
  leftLegTop.matrix.scale(0.05, 0.1, 0.05);
  leftLegTop.matrix.translate(-2.5, -5.0, 5.0);
  leftLegCoordinates = new Matrix4(leftLegTop.matrix);
  leftLegTop.render();

  var leftLegBottom = new Cube();
  leftLegBottom.color = [1.0, 0.64, 0.0, 1.0];
  leftLegBottom.matrix = new Matrix4(leftLegCoordinates);
  leftLegBottom.matrix.scale(1.5, 0.4, 2.0);
  leftLegBottom.matrix.translate(-0.15, -1.0, -0.5);
  leftLegBottom.render();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

// Set text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log('Failed to retrieve the <' + htmlID + '> element');
    return;
  }
  htmlElm.innerHTML = text;
}

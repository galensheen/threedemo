/**
 * Created by galen on 2017/3/13.
 */

var scene, renderer, camera, width, height, len, snake = [];
var currentX = 0, currentY = 0;

function initSize() {
  width = window.innerWidth - 5;
  height = window.innerHeight - 5;
  len = width > height ? height / 50 >> 0 : width / 50 >> 0;
}

/**
 * initial scene
 */
function initScene() {
  scene = new THREE.Scene();
  var light = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( light );
}

/**
 * initial renderer
 */
function initRenderer() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  document.querySelector('#snake').appendChild(renderer.domElement);
}

/**
 * initial camera
 */
function initCamera() {
  camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 1000);
  camera.position.z = 2;
}

/**
 * create snake header
 * @param color
 * @returns {THREE.Mesh}
 */
function createHeader(color) {
  var x = 0, y = 0;
  var header = new THREE.Shape();
  header.moveTo(x - len / 2, y);
  header.bezierCurveTo(x - len / 2, y + len, x, y + len / 2, x + len / 2, y);
  header.bezierCurveTo(x, y - len / 2, x - len / 2, y - len, x - len / 2, y);
  var geometry = new THREE.ShapeGeometry(header);
  var material = new THREE.MeshBasicMaterial({color: color});
  return new THREE.Mesh(geometry, material);
}

/**
 * create snake node
 * @param color
 * @returns {THREE.Mesh}
 */
function createNode(color) {
  var geometry = new THREE.CircleGeometry(len / 2, 32);
  var material = new THREE.MeshBasicMaterial({color: color});
  return new THREE.Mesh(geometry, material);
}

/**
 * create snake tail
 * @param color
 * @returns {THREE.Mesh}
 */
function createTail(color) {
  var x = 0, y = 0;
  var tail = new THREE.Shape();
  tail.moveTo(x + len / 2, y);
  tail.bezierCurveTo(x + len / 2, y + len / 2, x, y + len / 2, x - len, y);
  tail.bezierCurveTo(x, y - len / 2, x + len / 2, y - len / 2, x + len / 2, y);
  var geometry = new THREE.ShapeGeometry(tail);
  var material = new THREE.MeshBasicMaterial({color: color});
  return new THREE.Mesh(geometry, material);
}

/**
 * initial snake
 */
function initSnake () {
  var header = createHeader('gold');
  var body = createNode('gold');
  var tail = createTail('gold');
  header.position.x = len;
  currentX = len;
  currentY = 0;
  tail.position.x = - len;
  snake.push(header);
  snake.push(body);
  snake.push(tail);
  scene.add(header, body, tail);
}

/**
 * render scene and camera
 */
function render() {
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  
  var tempX = 0, tempY = 0, lastX = 0, lastY = 0;
  for (var i = 0, len = snake.length; i < len; i++) {
  
    tempX = snake[i].position.x;
    tempY = snake[i].position.y;
    
    if (i === 0) {
      snake[i].position.x += 1;
      snake[i].position.y += 1;
      currentX = snake[i].position.x;
      currentY = snake[i].position.y;
    } else {
      snake[i].position.x = lastX - len;
      snake[i].position.y = lastY - len;
    }
    lastX = tempX;
    lastY = tempY;
  }
  snake.forEach(function (node) {
    node.position.x += 1;
  });
  render();
}

/**
 * listening on window resize
 */
function onWindowResize() {
  initSize();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function listenOnTap() {
  var canvasHammer = new Hammer(renderer.domElement);
  canvasHammer.on('tap', function (event) {
    console.log(event);
  });
}

/**
 * initial whole game
 */
function init() {
  initSize();
  initScene();
  initCamera();
  initSnake();
  initRenderer();
  listenOnTap();
  animate();
  
  window.addEventListener('resize', onWindowResize);
}

init();
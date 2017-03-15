/**
 * Created by galen on 2017/3/13.
 */

var scene, renderer, camera, width, height, raycaster, len, snake = [], barrier = [];
var vector = {x: 1, y: 0, arc: 0};
var tmpVector = {x: 1, y: 0};

var maxBarries = 5;

var growing = false;

function initSize() {
  width = window.innerWidth - 5;
  height = window.innerHeight - 5;
  len = width > height ? height / 35 >> 0 : width / 35 >> 0;
}

/**
 * initial scene
 */
function initScene() {
  scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0x404040));
  raycaster = new THREE.Raycaster();
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
  // camera = new THREE.PerspectiveCamera(45, width/height, 0, 1000);
  camera.position.z = 100;
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
  var geometry = new THREE.SphereGeometry(len / 2, 32, 32);
  var material = new THREE.MeshBasicMaterial({color: color});
  return new THREE.Mesh(geometry, material);
}

/**
 * initial snake
 */
function initSnake () {
  var header = createHeader('gold');
  var body = createNode('gold');
  var tail = createNode('gold');
  header.position.x = len;
  header.matrixWorldNeedsUpdate = true;
  tail.position.x = - len;
  snake.push({mesh: header, points: []});
  snake.push({mesh: body, points: []});
  snake.push({mesh: tail, points: []});
  scene.add(header, body, tail);
}

/**
 * 随机生成节点
 */
function randomNode() {
  var node = createNode('gold');
  node.position.x = Math.random() * width - width / 2;
  node.position.y = Math.random() * height - height / 2;
  node.position.z = 0;
  
  scene.add(node);
  
  // 防止position还没有生效就已经检测碰撞，此时node坐标为(0, 0, 0)
  setTimeout(function () {
    barrier.push(node);
  }, 100);
}

/**
 * 碰撞检测
 */
function collisionDetection() {
  
  var header = snake[0].mesh;
  var originPoint = header.position.clone();
  
  if (!barrier.length) return;
  
  for (var i = 0, lens = header.geometry.vertices.length; i < lens; i++) {
    
    var localVertex = header.geometry.vertices[i].clone();
    raycaster.set(originPoint, localVertex.clone().normalize());
    var collisionResults = raycaster.intersectObjects(barrier);
    
    if (collisionResults.length) {
      collisionResults.forEach(function (collision) {
        if (collision.distance <= localVertex.length()) {
          growing = true;
          // 如果检测到碰撞，则计算新添加节点的坐标
          var point1 = snake[snake.length - 1].mesh.position.clone();
          var point2 = snake[snake.length - 2].mesh.position.clone();
          var lastV = point1.clone().sub(point2.clone()).normalize();
          var mesh = barrier.splice(barrier.indexOf(collision.object), 1)[0];
          mesh.position.set(point1.x + lastV.x * len, point1.y + lastV.y * len, 0);
          snake.push({mesh: mesh, points: [].concat(snake[snake.length - 1].points)});
          growing = false;
        }
      });
      break;
    }
  }
}

/**
 * render scene and camera
 */
function render() {
  renderer.render(scene, camera);
}

/**
 * animate the game
 */
function animate() {
  
  if (!snake.length || growing) return;
  
  var point;
  if (vector.x != tmpVector.x || vector.y != tmpVector.y) {
    point = {x: snake[0].mesh.position.x, y: snake[0].mesh.position.y};
  }
  // console.log(snake.length);
  for (var i = 0, len = snake.length; i < len; i++) {
    var node = snake[i];

    // 如果不是header, 节点多一个拐点
    if (i > 0 && !!point) {
      node.points.push(point);
    }

    // If the node is header or the node hasn't a vector
    if (i === 0 || !node.points.length) {
      if (!!point) {
        node.mesh.rotation.z = vector.arc;
      } else {
        node.mesh.position.x += vector.x;
        node.mesh.position.y += vector.y;
      }
    } else {
      // The node is not the header and has vectors
      var firstPoint = node.points[0];
      var vectorX = firstPoint.x - node.mesh.position.x, vectorY = firstPoint.y - node.mesh.position.y;
      var distance = Math.sqrt(Math.pow(vectorX, 2) + Math.pow(vectorY, 2));

      // 如果当前node的坐标已经等于point, 则删除该point
      if (distance < 0.0000001) {
        distance = 1;
        node.points.shift();
      }

      var arc = Math.asin(vectorY / distance);
      if (arc >= 0 && vectorX < 0) {
        arc = (Math.PI - arc);
      } else if (arc < 0 && vectorX < 0) {
        arc = (-Math.PI - arc);
      }
      node.mesh.position.x += vectorX / distance;
      node.mesh.position.y += vectorY / distance;
    }
    
    if (node.mesh.position.x > width / 2) {
      node.mesh.position.x = -width / 2;
    }
    if (node.mesh.position.x < -width / 2) {
      node.mesh.position.x = width / 2;
    }
    if (node.mesh.position.y > height / 2) {
      node.mesh.position.y = -height / 2;
    }
    if (node.mesh.position.y < -height / 2) {
      node.mesh.position.y = height / 2;
    }
  }
  // save the vector to tmpVector
  tmpVector.x = vector.x;
  tmpVector.y = vector.y;
  
  // 检测碰撞
  collisionDetection();
  render();
  
  requestAnimationFrame(animate);
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

/**
 * listening on tap event and calculate the vector
 */
function listenOnTap() {
  
  var canvasHammer = new Hammer(renderer.domElement);
  canvasHammer.on('tap', function (event) {
    if (!snake.length) return;
    var headerX = snake[0].mesh.position.x, headerY = snake[0].mesh.position.y;
    var vectorX = (event.center.x - width / 2) - headerX, vectorY = (height / 2 - event.center.y) - headerY;
    var distance = Math.sqrt(Math.pow(vectorX, 2) + Math.pow(vectorY, 2));
    var arc = Math.asin(vectorY / distance);
    if (arc > 0 && vectorX < 0) {
      arc = (Math.PI - arc);
    } else if (arc < 0 && vectorX < 0) {
      arc = (-Math.PI - arc);
    }
    vector.x = vectorX / distance;
    vector.y = vectorY / distance;
    vector.arc = arc;
  });
}

var timeout;
function addBarries(time) {
  timeout = setTimeout(function () {
    if (barrier.length < maxBarries) {
      randomNode();
    }
    addBarries(time);
  }, time);
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
  addBarries(1000);
  animate();
  
  
  window.addEventListener('resize', onWindowResize);
}

init();
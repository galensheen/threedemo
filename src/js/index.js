/**
 * Created by galen on 2017/3/13.
 */

var container, scene, camera, renderer, maxOffset, acc = 0;
var movingCube;
var collideMeshList = [];
var cubes = [];
var crash = false;
var score = 0;
var scoreText = document.getElementById('score');
var id = 0;
var crashId = '';
var lastCrashId = '';
var screenWidth, screenHeight, cubeWidth;

initSize();
init();
controls();
animate();

// 初始化各个尺寸
function initSize() {
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;
  maxOffset = 250;
}

function init() {
  // scene
  scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight( 0x404040 ));
  var light = new THREE.DirectionalLight( 0xffffff );
  light.position.set(0, 170, 400);
  scene.add(light);
  
  camera = new THREE.PerspectiveCamera(85, screenWidth / screenWidth, 1, 20000);
  camera.position.set(0, 170, 400);
  
  // renderer
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(screenWidth, screenHeight);
  container = document.getElementById('ThreeJS');
  container.appendChild(renderer.domElement);
  
  // controls
  
  
  // 加入两条直线
  var geometry, material;
  geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3(-250, -1, -3000));
  geometry.vertices.push(new THREE.Vector3(-300, -1, 200));
  material = new THREE.LineBasicMaterial({
    color: 0x6699ff, linewidth: 5, fog: true
  });
  var line1 = new THREE.Line(geometry, material);
  scene.add(line1);
  geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3(250, -1, -3000));
  geometry.vertices.push(new THREE.Vector3(300, -1, 200));
  var line2 = new THREE.Line(geometry, material);
  scene.add(line2);
  
  // 加入控制的cube
  geometry = new THREE.BoxGeometry(50, 25, 25, 5, 5, 5);
  material = new THREE.MeshLambertMaterial({color: 0x00ff00});
  movingCube = new THREE.Mesh(geometry, material);
  movingCube.position.set(0, 0, 50);
  scene.add(movingCube);
}

function animate() {
  requestAnimationFrame(animate);
  update();
  renderer.render(scene, camera);
}

// 返回一个min和max之间的随机数
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

// 返回一个介于min和max之间的整形随机数
function getRandomInt(min, max) {
  return (Math.random() * (max - min + 1) + min) >> 0;
}

// 生成随机障碍物
function makeRandomCube() {
  var geometry = new THREE.CubeGeometry(50, 25, 25);
  var material = new THREE.MeshBasicMaterial({
    color: Math.random() * 0xffffff
  });
  
  var object = new THREE.Mesh(geometry, material);
  var box = new THREE.BoxHelper(object);
  box.material.color.set(0x0000ff);
  box.position.x = getRandomArbitrary(-250, 250);
  box.position.y =  0;
  box.position.z = getRandomArbitrary(-800, -1200);
  cubes.push(box);
  box.name = 'box_' + id;
  id++;
  collideMeshList.push(box);
  scene.add(box);
}

function update() {

  collisionChecker();
  
  var x = movingCube.position.x;
  if ((x < -250 && acc > 0) || (x > 250 && acc < 0)) return;
  movingCube.position.x -= acc;
  
  if (Math.random() < 0.02 && cubes.length < 30) {
    makeRandomCube();
  }
  
  for ( var i = 0, len = cubes.length; i < len; i++) {
    
    if (!cubes[i]) continue;
    
    if (cubes[i].position && cubes[i].position.z > camera.position.z) {
      scene.remove(cubes[i]);
      cubes.splice(i, 1);
      collideMeshList.splice(i, 1);
    } else {
      cubes[i].position.z += 10;
    }
  }
  
  score += 0.1;
  scoreText.innerText = score >> 0;
}

function collisionChecker () {
  var originPoint = movingCube.position.clone();

  for (var vertexIndex = 0, verticesLength = movingCube.geometry.vertices.length; vertexIndex < verticesLength; vertexIndex++) {
    // 顶点原始坐标
    var localVertex = movingCube.geometry.vertices[vertexIndex].clone();
    // 顶点经过变换过后的坐标
    var globalVertex = localVertex.applyMatrix4(movingCube.matrix);
    
    var directionVector = globalVertex.sub(movingCube.position);
    
    var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
    var collisionResults = ray.intersectObjects(collideMeshList, true);
    
    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
      crash = true;
      crashId = collisionResults[0].object.name;
      break;
    }
    crash = false;
  }
  
  if (crash) {
    movingCube.material.color.set(0xff0000);
    if (crashId !== lastCrashId) {
      score -= 100;
      lastCrashId = crashId;
    }
    document.getElementById('explode_sound').play();
  } else {
    movingCube.material.color.set(0x00ff00);
  }
}

function controls() {
  window.addEventListener('devicemotion', function(event){
    var acceleration = event.accelerationIncludingGravity;
    acc = acceleration.x || 0;
  }, false);
}

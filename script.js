// Scene, camera, renderer
const scene = new THREE.Scene();

// Set scene background to white
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Add a cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshNormalMaterial(); // colors will be colorful
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// Track mouse
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Current rotation for smooth lerp
let targetRotation = { x: 0, y: 0 };

// Animate
function animate() {
  requestAnimationFrame(animate);

  // Target rotation based on mouse
  targetRotation.y = mouse.x * Math.PI;
  targetRotation.x = mouse.y * Math.PI;

  // Smooth interpolation
  cube.rotation.x += (targetRotation.x - cube.rotation.x) * 0.05;
  cube.rotation.y += (targetRotation.y - cube.rotation.y) * 0.05;

  renderer.render(scene, camera);
}

// Start animation
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
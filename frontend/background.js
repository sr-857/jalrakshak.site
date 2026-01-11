import * as THREE from 'three';

/**
 * 3D Water Wave Background for JalRakshak
 * Lightweight, responsive, and performance-optimized
 */

const container = document.getElementById('bg-canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Geometry: High-density plane for fluid waves
const geometry = new THREE.PlaneGeometry(35, 35, 80, 80);

// Material: Subtle blue wireframe with depth
const material = new THREE.MeshPhongMaterial({
    color: 0x2563eb,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide
});

const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2.5;
plane.position.y = -2;
scene.add(plane);

// Lighting: Soft ambient and directional
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

camera.position.z = 8;
camera.position.y = 2;

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Wave Logic: Distort vertices based on time and position
    const positions = geometry.attributes.position.array;
    
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        
        // Simulating organic water ripple
        const z = Math.sin(x * 0.4 + elapsedTime * 0.5) * 0.5 + 
                  Math.sin(y * 0.5 + elapsedTime * 0.8) * 0.3;
        
        positions[i + 2] = z;
    }
    
    geometry.attributes.position.needsUpdate = true;
    
    // Subtle overall rotation
    plane.rotation.z = elapsedTime * 0.05;
    
    renderer.render(scene, camera);
}

// Responsive Handling
window.addEventListener('resize', () => {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Start Animation
animate();

console.log("3D Wave Background Scene Active.");

// ===============================================
// Lógica de Drag and Drop
// ===============================================

/**
 * Hace un elemento HTML arrastrable por la pantalla.
 * @param {HTMLElement} element - El elemento DOM a hacer arrastrable.
 */

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    element.onmousedown = function(e) {
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        e = e || window.event;
        e.preventDefault();

        pos3 = e.clientX;
        pos4 = e.clientY;
        
        element.style.zIndex = '1000';

        document.onmouseup = function() {
            document.onmouseup = null;
            document.onmousemove = null;
            element.style.cursor = 'grab';
        };

        document.onmousemove = function(e) {
            e = e || window.event;
            e.preventDefault();
            
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            let newTop = element.offsetTop - pos2;
            let newLeft = element.offsetLeft - pos1;

            if (newTop < 0) newTop = 0;

            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
            element.style.cursor = 'grabbing';
        };
    };
}

/**
 * Inicializa la posición inicial de los elementos arrastrables
 * y aplica la lógica de arrastre a cada uno.
 * * NOTA: Esta función ahora realiza el centrado horizontal.
 */
function setupDraggables() {
    const draggables = document.querySelectorAll('.draggable-element');
    let currentY = 20; // Margen superior inicial
    const SPACING = 40; // Espacio entre bloques

    draggables.forEach((el) => {
        // Centrado Horizontal
        const centeredLeft = (window.innerWidth - el.offsetWidth) / 2;
        el.style.left = centeredLeft + 'px';
        
        // Posicionamiento Vertical Automático
        el.style.top = currentY + 'px';
        
        // Actualizar Y para el próximo elemento
        currentY += el.offsetHeight + SPACING;

        if (!el.hasAttribute('data-draggable-init')) {
            makeDraggable(el);
            el.setAttribute('data-draggable-init', 'true');
        }
    });

    // Ajustar el alto total del body para permitir scroll
    document.body.style.height = (currentY + 10) + 'px';

    setTimeout(() => {
        AOS.refresh(); 
    }, 100);
}

// ===============================================
// Lógica de Three.js
// ===============================================
let scene, camera, renderer, initialsGroup, particles;
const canvas = document.getElementById('hero-3d-background');

function initThreeJS() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    initialsGroup = new THREE.Group();

    // Material de las iniciales (Punto medio)
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF4133, 
        metalness: 0.7,
        roughness: 0.2,
        transparent: true,
        opacity: 0.35, 
    });

    const wireMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFF4133, 
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });

    function createSolidLetter(geometry) {
        const group = new THREE.Group();
        const body = new THREE.Mesh(geometry, bodyMaterial);
        const wire = new THREE.Mesh(geometry, wireMaterial);
        group.add(body, wire);
        return group;
    }

    const verticalBarGeom = new THREE.BoxGeometry(0.25, 1.2, 0.25);
    const diagonalBarGeom = new THREE.BoxGeometry(0.25, 1.4, 0.26);

    // N
    const nGroup = new THREE.Group();
    const nLeft = createSolidLetter(verticalBarGeom);
    nLeft.position.x = -0.45;
    const nRight = createSolidLetter(verticalBarGeom);
    nRight.position.x = 0.45;
    const nDiagonal = createSolidLetter(diagonalBarGeom);
    nDiagonal.rotation.z = -0.68;
    
    nGroup.add(nLeft, nRight, nDiagonal);
    nGroup.position.x = -0.8;
    
    // Y
    const yGroup = new THREE.Group();
    const yStem = createSolidLetter(new THREE.BoxGeometry(0.25, 0.6, 0.25));
    yStem.position.y = -0.3;
    const yLeft = createSolidLetter(new THREE.BoxGeometry(0.25, 0.8, 0.25));
    yLeft.position.set(-0.3, 0.35, 0);
    yLeft.rotation.z = Math.PI / 4;
    const yRight = createSolidLetter(new THREE.BoxGeometry(0.25, 0.8, 0.25));
    yRight.position.set(0.3, 0.35, 0);
    yRight.rotation.z = -Math.PI / 4;
    yGroup.add(yStem, yLeft, yRight);
    yGroup.position.x = 0.8;

    initialsGroup.add(nGroup, yGroup);
    scene.add(initialsGroup);

    // Luces
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pointLight = new THREE.PointLight(0xFF4133, 2.5);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    // --- SISTEMA DE PARTÍCULAS INTENSIFICADO ---
    const particleCount = 2000; // Más cantidad
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const pColor = new THREE.Color(0xf5f5f5);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 15; 
        positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

        pColor.setHSL(0, 1, Math.random() * 0.4 + 0.4); 
        colors[i * 3] = pColor.r;
        colors[i * 3 + 1] = pColor.g;
        colors[i * 3 + 2] = pColor.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.07, // Un poco más grandes
        vertexColors: true,
        transparent: true,
        opacity: 0.5, // Más visibles
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
}

function animate() {
    requestAnimationFrame(animate);
    if (initialsGroup) {
        initialsGroup.rotation.x += 0.005;
        initialsGroup.rotation.y += 0.01;
    }
    if (particles) {
        particles.rotation.y += 0.001; // Rotación ligeramente más rápida
        particles.rotation.z += 0.0005;
    }
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (typeof setupDraggables === 'function') setupDraggables();
}

// Inicialización de la aplicación al cargar la ventana
window.onload = function () {
    // 1. Iniciamos ThreeJS y animaciones de fondo
    initThreeJS();
    animate();

    // 2. Inicializamos AOS *antes* de mover nada, pero pausado o esperando
    AOS.init({
        duration: 1000, 
        offset: 120,    // Se anima cuando el elemento está 120px dentro de la pantalla
        once: false,    // <--- IMPORTANTE: Poner en 'false' si quieres que se anime al subir y bajar
        mirror: true    // <--- IMPORTANTE: Esto hace que se anime al hacer scroll hacia arriba también
    });

    // 3. Acomodamos los elementos (esto moverá los divs a su lugar final)
    setupDraggables();
    
    // 4. Listeners
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        setupDraggables(); // Esto ahora incluye el AOS.refresh() interno
    });
};


//* Logica del servicios para mails*//
//* Logica del servicios para mails *//
const form = document.querySelector("form");

async function handleSubmit(event) {
    event.preventDefault(); // Evita que la página se recargue

    const status = document.createElement("p"); // Para mostrar mensaje de éxito
    status.style.textAlign = "center";
    status.style.marginTop = "20px";

    const data = new FormData(event.target);

    fetch(event.target.action, {
        method: form.method,
        body: data,
        headers: {
            Accept: "application/json",
        },
    })
        .then(response => {
            if (response.ok) {
                status.innerHTML = "¡Gracias! Tu mensaje ha sido enviado.";
                status.style.color = "#4ade80"; // Verde
                form.reset(); // Limpia los campos

                // Configuramos el temporizador para borrar el mensaje
                setTimeout(() => {
                    // 1. Añadimos clase para bajar opacidad y transición
                    status.classList.add(
                        "transition-opacity",
                        "duration-500",
                        "opacity-0"
                    );

                    // 2. Esperamos a que termine la animación (500ms) para borrarlo del DOM
                    setTimeout(() => {
                        status.remove();
                    }, 500);
                }, 3000); // Espera 3 seg antes de empezar a desvanecerse
            } else {
                response.json().then(data => {
                    if (Object.hasOwn(data, "errors")) {
                        status.innerHTML = data.errors
                            .map(error => error.message)
                            .join(", ");
                    } else {
                        status.innerHTML =
                            "Oops! Hubo un problema al enviar tu formulario";
                    }
                    status.style.color = "#FF4133"; // Tu rojo de error
                });
            }
        })
        .catch(error => {
            status.innerHTML =
                "Oops! Hubo un problema al enviar tu formulario";
            status.style.color = "#FF4133";
        });

    form.appendChild(status);
}

form.addEventListener("submit", handleSubmit);


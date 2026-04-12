// ═══════════════════════════════════════════════════════
// LegginX 3D Product Viewer
// Interactive fabric-draped cylinder with mouse/touch control
// ═══════════════════════════════════════════════════════

(function () {
  'use strict';

  window.LegginX3D = { init: initViewer };

  function initViewer(containerId, imageUrl, options = {}) {
    const container = document.getElementById(containerId);
    if (!container || typeof THREE === 'undefined') return;

    // Prevent double-init
    if (container.dataset.threeInit) return;
    container.dataset.threeInit = 'true';

    const opts = Object.assign({
      autoRotate: true,
      rotateSpeed: 0.004,
      bgColor: 0x09090b,
      segments: 96,
    }, options);

    // ── Scene ─────────────────────────────────
    const scene = new THREE.Scene();
    const W = container.clientWidth;
    const H = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(0, 0, 3.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // ── Lighting ──────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xaaaaff, 0.4);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xffffff, 0.3, 10);
    fillLight.position.set(0, -3, 2);
    scene.add(fillLight);

    // ── Geometry – tapered cylinder (like a garment) ──
    const geo = new THREE.CylinderGeometry(0.72, 0.88, 1.85, opts.segments, 64, true);

    // Add subtle wave displacement to simulate fabric folds
    const posAttr = geo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);
      const angle = Math.atan2(z, x);
      const fold = 0.018 * Math.sin(angle * 7 + y * 4.5) + 0.008 * Math.sin(angle * 13 + y * 9);
      const len = Math.sqrt(x * x + z * z);
      posAttr.setXYZ(i,
        x + (x / len) * fold,
        y + 0.006 * Math.sin(angle * 5),
        z + (z / len) * fold
      );
    }
    geo.computeVertexNormals();

    // ── Material ──────────────────────────────
    // Load product image as texture OR use procedural fabric
    const loader = new THREE.TextureLoader();

    function createMaterial(texture) {
      const mat = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        roughness: 0.82,
        metalness: 0.04,
        envMapIntensity: 0.6,
      });
      if (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        mat.map = texture;
      } else {
        // Fallback solid deep colour
        mat.color = new THREE.Color(0x111114);
      }
      return mat;
    }

    let mesh;
    if (imageUrl) {
      loader.load(imageUrl,
        (tex) => {
          mesh.material = createMaterial(tex);
          mesh.material.needsUpdate = true;
        },
        undefined,
        () => { /* texture failed – keep fallback */ }
      );
    }

    mesh = new THREE.Mesh(geo, createMaterial(null));
    mesh.rotation.x = 0.08;
    scene.add(mesh);

    // Edge highlight ring (waistband illusion)
    const ringGeo = new THREE.TorusGeometry(0.72, 0.018, 16, opts.segments);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x333336, roughness: 0.7, metalness: 0.1 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.93;
    scene.add(ring);

    // ── Mouse / Touch drag ─────────────────────
    let isDragging = false;
    let prevX = 0;
    let velX = 0;
    let targetRotY = mesh.rotation.y;
    let autoRotate = opts.autoRotate;

    function onPointerDown(e) {
      isDragging = true;
      autoRotate = false;
      prevX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      velX = 0;
    }
    function onPointerMove(e) {
      if (!isDragging) return;
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? prevX;
      const dx = clientX - prevX;
      velX = dx * 0.018;
      targetRotY += velX;
      prevX = clientX;
    }
    function onPointerUp() {
      isDragging = false;
      // resume auto-rotate after 2s idle
      setTimeout(() => { autoRotate = opts.autoRotate; }, 2000);
    }

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // ── Animation ─────────────────────────────
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (autoRotate && !isDragging) {
        targetRotY += opts.rotateSpeed;
      }
      // Inertia
      if (!isDragging) {
        velX *= 0.92;
        targetRotY += velX;
      }
      mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.12;
      ring.rotation.y = mesh.rotation.y;

      // Subtle breathing scale
      const breathe = 1 + 0.003 * Math.sin(t * 1.2);
      mesh.scale.set(breathe, 1 + 0.001 * Math.sin(t * 0.8), breathe);

      // Gentle key-light orbit
      keyLight.position.x = 3 * Math.cos(t * 0.3);
      keyLight.position.z = 3 * Math.sin(t * 0.3) + 3;

      renderer.render(scene, camera);
    }
    animate();

    // ── Resize ────────────────────────────────
    window.addEventListener('resize', () => {
      const nW = container.clientWidth;
      const nH = container.clientHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    });
  }
})();

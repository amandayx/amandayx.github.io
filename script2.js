(function () {
  const canvas = document.getElementById("three-canvas");
  if (!canvas || !window.THREE) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const palette = [0xff7bac, 0x6f9dff, 0xd8c25a, 0xffe6ec, 0xd6d5da];

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  // Lights: colored rim lights plus one that follows the pointer for glints
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const lights = [
    [0xff7bac, -6, 4, 4],
    [0x6f9dff, 6, -3, 4],
    [0xd8c25a, 0, 6, 2],
  ];
  lights.forEach(([c, x, y, z]) => {
    const l = new THREE.PointLight(c, 220, 30);
    l.position.set(x, y, z);
    scene.add(l);
  });
  const pointerLight = new THREE.PointLight(0xffffff, 260, 28);
  pointerLight.position.set(0, 0, 5);
  scene.add(pointerLight);

  // Brilliant-cut style gem: flat-shaded lathe with 8 facets
  const gemGeo = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0, -1.3),
      new THREE.Vector2(1.0, 0.1),
      new THREE.Vector2(0.62, 0.5),
      new THREE.Vector2(0, 0.5),
    ],
    8
  );

  // 4-point sparkle texture
  const sc = document.createElement("canvas");
  sc.width = sc.height = 128;
  const ctx = sc.getContext("2d");
  ctx.shadowColor = "white";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.moveTo(64, 6);
  ctx.quadraticCurveTo(67, 61, 122, 64);
  ctx.quadraticCurveTo(67, 67, 64, 122);
  ctx.quadraticCurveTo(61, 67, 6, 64);
  ctx.quadraticCurveTo(61, 61, 64, 6);
  ctx.fill();
  const sparkleTex = new THREE.CanvasTexture(sc);

  const gems = [];
  const COUNT = 30;
  let aspect = window.innerWidth / window.innerHeight;
  const xr = Math.max(5, 4.6 * aspect);

  for (let i = 0; i < COUNT; i++) {
    const color = palette[i % palette.length];
    const big = i < 4;
    const s = big ? 0.8 + Math.random() * 0.4 : 0.14 + Math.random() * 0.4;

    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.18,
      metalness: 0.45,
      roughness: 0.18,
      flatShading: true,
    });
    const mesh = new THREE.Mesh(gemGeo, mat);
    mesh.scale.setScalar(s);

    const sparkle = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: sparkleTex,
        color,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );

    const group = new THREE.Group();
    group.add(mesh, sparkle);
    group.position.set(
      (Math.random() * 2 - 1) * xr,
      (Math.random() * 2 - 1) * 5,
      -5 + Math.random() * 7
    );
    group.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    scene.add(group);

    gems.push({
      group,
      sparkle,
      s,
      baseY: group.position.y,
      spin: (Math.random() * 0.5 + 0.15) * (Math.random() < 0.5 ? -1 : 1),
      bob: Math.random() * 0.6 + 0.3,
      phase: Math.random() * 6.28,
      twinkle: Math.random() * 1.6 + 0.8,
    });
  }

  let mx = 0, my = 0;
  window.addEventListener("pointermove", (e) => {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = -((e.clientY / window.innerHeight) * 2 - 1);
  });

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (reduceMotion) renderer.render(scene, camera);
  }
  window.addEventListener("resize", resize);
  resize();

  const clock = new THREE.Clock();
  function frame() {
    const t = clock.getElapsedTime();
    gems.forEach((g) => {
      g.group.rotation.y += g.spin * 0.012;
      g.group.rotation.x += g.spin * 0.004;
      g.group.position.y = g.baseY + Math.sin(t * g.bob + g.phase) * 0.3;
      const pulse = Math.pow(Math.max(0, Math.sin(t * g.twinkle + g.phase)), 6);
      g.sparkle.scale.setScalar(g.s * (0.6 + pulse * 3.4));
      g.sparkle.material.opacity = 0.25 + pulse * 0.75;
    });
    camera.position.x += (mx * 0.9 - camera.position.x) * 0.04;
    camera.position.y += (my * 0.6 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    pointerLight.position.set(mx * 8, my * 5, 4);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  if (reduceMotion) renderer.render(scene, camera);
  else frame();
})();
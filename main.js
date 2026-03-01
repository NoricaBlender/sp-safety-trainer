// main.js
(() => {
  if (!window.THREE) { alert('Three.js failed to load. Put three.min.js beside index.html.'); return; }

  // ── Renderer ────────────────────────────────────────────────────────────────
  const canvas = document.getElementById('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  // ── Scene ────────────────────────────────────────────────────────────────────
  const obstacles = [];
  let spawn = { x: 0, z: 0 };
  SceneFactory.createBasicScene({
    scene,
    addCollider: (c) => obstacles.push(c),
    setSpawn:    (s) => (spawn = s),
  });

  // player
  const player = { x: spawn.x, y: 1.6, z: spawn.z, radius: 0.35, speed: 3.2 };

  function checkCollision(nx, nz) {
    const r = player.radius;
    for (const box of obstacles) {
      if (!box) continue;
      if (nx + r > box.minX && nx - r < box.maxX &&
          player.y > box.minY && player.y < box.maxY &&
          nz + r > box.minZ && nz - r < box.maxZ) return true;
    }
    return false;
  }

  // ── Joystick (left half) ────────────────────────────────────────────────────
  const joyBase  = document.getElementById('joyBase');
  const joyStick = document.getElementById('joyStick');
  const JOY_MAX = 55;

  const joy = { active:false, pid:null, ox:0, oy:0, sx:0, sy:0, dx:0, dy:0 };

  function joyStart(e){
    if (window.gamePaused) return;
    if (e.clientX > window.innerWidth * 0.5) return;
    joy.active = true;
    joy.pid = e.pointerId;
    joy.sx = e.clientX; joy.sy = e.clientY;
    joy.ox = e.clientX; joy.oy = e.clientY;
    joy.dx = joy.dy = 0;

    joyBase.style.left  = joy.ox + 'px';
    joyBase.style.top   = joy.oy + 'px';
    joyStick.style.left = joy.ox + 'px';
    joyStick.style.top  = joy.oy + 'px';
    joyBase.style.display = joyStick.style.display = 'block';
    try { canvas.setPointerCapture(e.pointerId); } catch(_){}
    try { e.preventDefault(); } catch(_){}
  }

  function joyMove(e){
    if(!joy.active || e.pointerId !== joy.pid) return;
    const dx = e.clientX - joy.sx;
    const dy = e.clientY - joy.sy;
    const len = Math.hypot(dx,dy);
    const s = len > JOY_MAX ? (JOY_MAX/len) : 1;
    joy.dx = (dx*s)/JOY_MAX;
    joy.dy = (dy*s)/JOY_MAX;
    joyStick.style.left = (joy.ox + dx*s) + 'px';
    joyStick.style.top  = (joy.oy + dy*s) + 'px';
    try { e.preventDefault(); } catch(_){}
  }

  function joyEnd(e){
    if(!joy.active || e.pointerId !== joy.pid) return;
    joy.active = false;
    joy.pid = null;
    joy.dx = joy.dy = 0;
    joyBase.style.display = joyStick.style.display = 'none';
    try { e.preventDefault(); } catch(_){}
  }

  canvas.addEventListener('pointerdown', joyStart, { passive:false });
  canvas.addEventListener('pointermove', joyMove,  { passive:false });
  canvas.addEventListener('pointerup',   joyEnd,   { passive:false });
  canvas.addEventListener('pointercancel', joyEnd, { passive:false });

  // ── Gyroscope ────────────────────────────────────────────────────────────────
  const Q_WORLD = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
  const qA=new THREE.Quaternion(), qB=new THREE.Quaternion();
  const qG=new THREE.Quaternion(), qD=new THREE.Quaternion();
  const ZAxis=new THREE.Vector3(0,0,1), XAxis=new THREE.Vector3(1,0,0), YAxis=new THREE.Vector3(0,1,0);
  let gyro = { alpha:0, beta:0, gamma:0, ok:false };

  window.addEventListener('deviceorientation', (e) => {
    if (e.alpha==null) return;
    gyro.alpha=e.alpha; gyro.beta=e.beta; gyro.gamma=e.gamma; gyro.ok=true;
  });

  function updateCamera() {
    if (!gyro.ok) return;
    qA.setFromAxisAngle(ZAxis, THREE.MathUtils.degToRad(gyro.alpha));
    qB.setFromAxisAngle(XAxis, THREE.MathUtils.degToRad(gyro.beta));
    qG.setFromAxisAngle(YAxis, THREE.MathUtils.degToRad(gyro.gamma));
    qD.copy(qA).multiply(qB).multiply(qG).premultiply(Q_WORLD);
    camera.quaternion.copy(qD);
  }

  // ── Crosshair (gameplay page only) ───────────────────────────────────────────
  const crosshair = document.createElement('div');
  crosshair.style.cssText =
    'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:28px;height:28px;pointer-events:none;z-index:3000;display:none;filter:drop-shadow(0 0 2px rgba(0,0,0,0.8));';
  crosshair.innerHTML =
    '<svg width="28" height="28" viewBox="0 0 28 28">' +
      '<circle cx="14" cy="14" r="2.5" fill="white" opacity="0.9"/>' +
      '<line x1="14" y1="3" x2="14" y2="9" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>' +
      '<line x1="14" y1="19" x2="14" y2="25" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>' +
      '<line x1="3" y1="14" x2="9" y2="14" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>' +
      '<line x1="19" y1="14" x2="25" y2="14" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>' +
    '</svg>';
  document.body.appendChild(crosshair);

  function setHUDPlaying(isPlaying){
    crosshair.style.display = isPlaying ? 'block' : 'none';
  }

  // ── Raycast interaction (centre of screen) ──────────────────────────────────
  const raycaster = new THREE.Raycaster();
  raycaster.far = 10;
  const pickupAnims = [];

  function endAssessment(){
    if (window.assessmentEnded) return;
    window.assessmentEnded = true;
    window.modalUIOpen = false;

    const fodGot = window.fodCollected || 0;
    const fodTotal = window.fodTarget || (window.fodMeshes ? window.fodMeshes.length + fodGot : fodGot);

    const ladderBroken = window.spyderFaults?.ladderBrokenTotal ?? 0;
    const ladderFixed = window.spyderFaults?.ladderFixedCount ?? 0;
    const ladderLine = (ladderBroken <= 0) ? 'ladder fixed (not tested)'
      : `ladder fixed ${Math.min(ladderFixed, ladderBroken)}/${ladderBroken}`;
    const flapBroken = window.spyderFaults?.flapUpTotal ?? 0;
    const flapFixed = window.spyderFaults?.flapFixedCount ?? 0;
    const flapLine = (flapBroken <= 0) ? 'rear access flaps fixed (not tested)'
      : `rear access flaps fixed ${Math.min(flapFixed, flapBroken)}/${flapBroken}`;

    const fireAnswered = (window.spyderQuiz && window.spyderQuiz.answered != null);
    const fireLine = (!fireAnswered) ? 'fire extinguisher 0/1'
      : `fire extinguisher ${window.spyderQuiz.wasCorrect ? 1 : 0}/1`;

    const ppeGot = window.ppeCollected || 0;
    const ppeTotal = window.ppeTarget || 2;

    const lines = [
      `PPE ${ppeGot}/${ppeTotal}`,
      `fod ${fodGot}/${fodTotal}`,
      ladderLine,
      flapLine,
            fireLine
    ];

    try {
      sessionStorage.setItem('assessmentResults', JSON.stringify({ lines, ts: Date.now() }));
    } catch(_) {}

    setHUDPlaying(false);
    window.location.href = 'results.html';
  }

  function tryInteract() {
    // Always try UI hits first (START / FINISH / quiz answers), but only block world interactions when a modal UI is open.
    if (window.uiMeshes && window.uiMeshes.length) {
      raycaster.setFromCamera({ x:0, y:0 }, camera);
      const hits = raycaster.intersectObjects(window.uiMeshes, true);
      if (hits.length) {
        const obj = hits[0].object;
        const action = obj.userData?.uiAction;
        const uiType = obj.userData?.uiType;

        // Quiz answers (modal)
        if (action === 'quiz_answer') {
          const ans = obj.userData.answer;
          if (window.spyderQuiz) {
            window.spyderQuiz.answered = ans;
            window.spyderQuiz.wasCorrect = (ans === window.spyderQuiz.correct);
          }
          const g = obj.userData.uiGroup;
          if (g) g.visible = false;
          window.modalUIOpen = false;
          return;
        }

        // Start assessment (close intro modal, show FINISH)
        if (action === 'start_assessment' || uiType === 'startAssessment') {
          const g = obj.userData.uiGroup;
          if (g) g.visible = false;
          window.assessmentStarted = true;
          window.modalUIOpen = false;
          if (window.finishUI) window.finishUI.visible = true;
          return;
        }

        // Finish assessment (allowed during gameplay)
        if (action === 'finish_assessment' || uiType === 'finishAssessment') {
          // Optional guard: ignore finish if they never started.
          if (!window.assessmentStarted) return;
          const g = obj.userData.uiGroup;
          if (g) g.visible = false;
          endAssessment();
          return;
        }
      }

      // If a modal UI is open (intro or quiz), block all other interactions.
      if (window.modalUIOpen) return;
    }

    // Priority 2: PPE pickup (simple meshes)
    if (window.ppeMeshes && window.ppeMeshes.length) {
      raycaster.setFromCamera({ x:0, y:0 }, camera);
      const hitsP = raycaster.intersectObjects(window.ppeMeshes, false);
      if (hitsP.length) {
        const mesh = hitsP[0].object;
        const idx = window.ppeMeshes.indexOf(mesh);
        if (idx !== -1) window.ppeMeshes.splice(idx, 1);
        window.ppeCollected = (window.ppeCollected || 0) + 1;
        pickupAnims.push({ mesh, t0: performance.now() });
        return;
      }
    }

    // Priority 3: FOD pickup
    if (window.fodMeshes && window.fodMeshes.length) {
      raycaster.setFromCamera({ x:0, y:0 }, camera);
      const hits = raycaster.intersectObjects(window.fodMeshes, false);
      if (hits.length) {
        const mesh = hits[0].object;
        const idx = window.fodMeshes.indexOf(mesh);
        if (idx !== -1) window.fodMeshes.splice(idx, 1);
        window.fodCollected = (window.fodCollected || 0) + 1;
        pickupAnims.push({ mesh, t0: performance.now() });
        return;
      }
    }

    // Priority 4: other interactables (ladders, flaps, extinguisher)
    if (!window.interactableMeshes || !window.interactableMeshes.length) return;
    raycaster.setFromCamera({ x:0, y:0 }, camera);
    const hits2 = raycaster.intersectObjects(window.interactableMeshes, false);
    if (!hits2.length) return;

    const obj = hits2[0].object;
    const type = obj.userData?.interactType;
    const payload = obj.userData?.payload || {};

    if (type === 'ladder') {
      if (payload.state === 'fixed') return;
      payload.state = 'fixed';
      if (window.spyderFaults) window.spyderFaults.ladderFixedCount++;
      if (payload.fixedRef) payload.fixedRef.visible = true;
      if (payload.brokenRef) payload.brokenRef.visible = false;
      return;
    }

    if (type === 'flap') {
      if (payload.state === 'down') return;
      payload.state = 'down';
      if (payload.hingeRef) payload.hingeRef.rotation.z = 0;
      if (window.spyderFaults) window.spyderFaults.flapFixedCount = (window.spyderFaults.flapFixedCount || 0) + 1;
      return;
    }

    if (type === 'extinguisher') {
      // Open quiz UI as modal
      if (window.spyderRoot && window.spyderRoot.userData && window.spyderRoot.userData.spyderUI) {
        window.spyderRoot.userData.spyderUI.visible = true;
        window.modalUIOpen = true;
      }
      return;
    }
  }

  // Right-half press: interact
  function onRightPress(e){
    if (window.gamePaused) return;
    if (joy.active && e.pointerId === joy.pid) return;
    if (e.clientX <= window.innerWidth * 0.5) return;
    try { e.preventDefault(); } catch(_) {}
    tryInteract();
  }

  // Capture at window level for reliability (some mobile browsers swallow canvas taps)
  window.addEventListener('pointerdown', onRightPress, { passive:false, capture:true });
  window.addEventListener('pointerup',   onRightPress, { passive:false, capture:true });

  // Touch fallback (some Android WebViews still behave better with touch events)
  let _lastInteract = 0;
  function _debouncedInteract(){
    const now = performance.now();
    if (now - _lastInteract < 140) return;
    _lastInteract = now;
    tryInteract();
  }

  window.addEventListener('touchstart', (e) => {
    if (window.gamePaused) return;
    try { e.preventDefault(); } catch(_) {}
    const half = window.innerWidth * 0.5;
    for (const t of Array.from(e.changedTouches || [])) {
      if (t.clientX > half) { _debouncedInteract(); break; }
    }
  }, { passive:false, capture:true });

  window.addEventListener('touchend', (e) => {
    if (window.gamePaused) return;
    const half = window.innerWidth * 0.5;
    for (const t of Array.from(e.changedTouches || [])) {
      if (t.clientX > half) { _debouncedInteract(); break; }
    }
  }, { passive:false, capture:true });

  function updatePickups() {
    const now = performance.now();
    for (let i = pickupAnims.length-1; i >= 0; i--) {
      const a = pickupAnims[i];
      const t = Math.min((now - a.t0) / 400, 1);
      const s = 1 + t * 1.5;
      a.mesh.scale.set(s, s, s);
      a.mesh.material.transparent = true;
      a.mesh.material.opacity = 1 - t;
      if (t >= 1) { a.mesh.parent && a.mesh.parent.remove(a.mesh); pickupAnims.splice(i,1); }
    }
  }

  // ── Game loop ────────────────────────────────────────────────────────────────
  const fwd = new THREE.Vector3(), rgt = new THREE.Vector3(), UP = new THREE.Vector3(0,1,0);
  let last = performance.now();

  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const dt  = Math.min((now - last) / 1000, 0.05);
    last = now;

    if (!window.gamePaused) updateCamera();

    if (!window.gamePaused && (joy.dx !== 0 || joy.dy !== 0)) {
      camera.getWorldDirection(fwd); fwd.y = 0;
      if (fwd.lengthSq() < 0.0001) fwd.set(0,0,-1);
      fwd.normalize();
      rgt.crossVectors(fwd, UP).normalize();

      const nx = player.x + (fwd.x*(-joy.dy) + rgt.x*joy.dx) * player.speed * dt;
      const nz = player.z + (fwd.z*(-joy.dy) + rgt.z*joy.dx) * player.speed * dt;

      if (!checkCollision(nx, player.z)) player.x = nx;
      if (!checkCollision(player.x, nz)) player.z = nz;
    }

    camera.position.set(player.x, player.y, player.z);
    updatePickups();
    renderer.render(scene, camera);
  }

  // ── Start overlay ────────────────────────────────────────────────────────────
  window.gamePaused = true;
  setHUDPlaying(false);

  const startOverlay = document.getElementById('startOverlay');
  startOverlay.addEventListener('pointerdown', async (e) => {
    try { e.preventDefault(); } catch(_) {}

    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try { await DeviceOrientationEvent.requestPermission(); } catch(_){}
    }

    startOverlay.classList.add('hidden');
    window.gamePaused = false;
    setHUDPlaying(true);
    animate();
  }, { passive:false });

})();
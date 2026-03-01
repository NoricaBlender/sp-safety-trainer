// spyder_model.js
// Creates a blocky "Spyder-like" truck with separate interactive parts.
// Interactive parts:
// - ladder_left / ladder_right: can be FIXED or BROKEN; pressing when broken fixes instantly.
// - flap_left / flap_right: can be UP or DOWN; pressing when up rotates down instantly and locks.
// - extinguisher: pressing shows a floating quiz UI above it with 2 buttons.

(() => {
  if (!window.THREE) return;

  const DEG = Math.PI / 180;

  function makeMat(col){ return new THREE.MeshStandardMaterial({ color: col, roughness: 0.85, metalness: 0.1 }); }

  function box(w,h,d, mat){
    return new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  }

  function cyl(r,h, mat){
    return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h, 16), mat);
  }

  function ensureGlobals(){
    window.interactableMeshes = window.interactableMeshes || [];
    window.uiMeshes = window.uiMeshes || [];
  }

  function addInteract(mesh, type, payload){
    ensureGlobals();
    mesh.userData.interactType = type;
    mesh.userData.payload = payload || {};
    window.interactableMeshes.push(mesh);
  }

  // ---------- 3D "UI" helpers ----------
  function makeLabelTexture(lines, w=512, h=256){
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    // background
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0,0,w,h);

    // border
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 6;
    ctx.strokeRect(10,10,w-20,h-20);

    // Text (with simple wrapping so longer lines don't overflow)
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const padX = 28;
    const maxW = w - padX*2;

    function wrapLine(str){
      const words = String(str).split(/\s+/).filter(Boolean);
      const out = [];
      let cur = '';
      for (const wd of words){
        const test = cur ? (cur + ' ' + wd) : wd;
        if (ctx.measureText(test).width <= maxW){
          cur = test;
        } else {
          if (cur) out.push(cur);
          cur = wd;
        }
      }
      if (cur) out.push(cur);
      return out.length ? out : [''];
    }

    // Try a few font sizes to make everything fit.
    const candidates = [34, 30, 26, 22, 18];
    let fontSize = candidates[candidates.length-1];
    let wrapped = [];
    for (const sz of candidates){
      ctx.font = `bold ${sz}px system-ui, Arial`;
      wrapped = [];
      for (const ln of lines) wrapped.push(...wrapLine(ln));
      const lineH = Math.round(sz * 1.25);
      const totalH = 24 + wrapped.length * lineH;
      if (totalH <= h - 18){
        fontSize = sz;
        break;
      }
    }

    ctx.font = `bold ${fontSize}px system-ui, Arial`;
    const lineH = Math.round(fontSize * 1.25);
    let y = 24;
    for (const ln of wrapped){
      ctx.fillText(ln, padX, y);
      y += lineH;
      if (y > h - lineH) break;
    }
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }
  function makeButtonTexture(text, active=true, w=512, h=192){
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    // background
    ctx.fillStyle = active ? 'rgba(255,255,255,0.92)' : 'rgba(180,180,180,0.92)';
    ctx.fillRect(0,0,w,h);

    // border
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 6;
    ctx.strokeRect(10,10,w-20,h-20);

    const padX = 28;
    const padY = 22;
    const maxW = w - padX*2;
    const maxH = h - padY*2;

    function wrapForFont(sz){
      ctx.font = `800 ${sz}px system-ui, Arial`;
      const words = String(text).split(/\s+/).filter(Boolean);
      const lines = [];
      let cur = '';
      for (const wd of words){
        const test = cur ? (cur + ' ' + wd) : wd;
        if (ctx.measureText(test).width <= maxW){
          cur = test;
        } else {
          if (cur) lines.push(cur);
          cur = wd;
        }
      }
      if (cur) lines.push(cur);

      const lineH = Math.round(sz * 1.15);
      return { sz, lines, lineH, totalH: lines.length * lineH };
    }

    // Try to fit into <= 2 lines without clipping.
    const candidates = [44, 40, 36, 32, 30, 28, 26, 24, 22, 20, 18, 16];
    let best = null;
    for (const sz of candidates){
      const r = wrapForFont(sz);
      if (r.lines.length <= 2 && r.totalH <= maxH){
        best = r; break;
      }
    }
    if (!best){
      best = wrapForFont(16);
      // If still too long, clamp to 2 lines (last resort)
      if (best.lines.length > 2){
        best.lines = [best.lines.slice(0, Math.ceil(best.lines.length/2)).join(' '),
                      best.lines.slice(Math.ceil(best.lines.length/2)).join(' ')];
      }
    }

    // Draw text
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `800 ${best.sz}px system-ui, Arial`;

    // If 2 lines, centre them vertically.
    const centreY = h/2;
    if (best.lines.length === 1){
      ctx.fillText(best.lines[0], w/2, centreY);
    } else {
      const total = best.lines.length * best.lineH;
      let y = centreY - (total/2) + best.lineH/2;
      for (const ln of best.lines){
        ctx.fillText(ln, w/2, y);
        y += best.lineH;
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }

  function makePlane(w,h, tex){
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w,h),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
    );
    return m;
  }

  function setBillboard(mesh){
    mesh.onBeforeRender = function(r,s,cam){
      const a = Math.atan2(cam.position.x - this.position.x, cam.position.z - this.position.z);
      this.rotation.set(0,a,0);
    };
  }

  

// Builds a simple in-world panel + one button, returns the group.
// opts: {position:{x,y,z}, title, lines[], buttonText, uiType}
function makeInWorldUI(scene, opts){
  ensureGlobals();
  const ui = new THREE.Group();
  ui.visible = false;
  ui.position.set(opts.position.x, opts.position.y, opts.position.z);
  setBillboard(ui);

  const panelTex = makeLabelTexture([opts.title, ...opts.lines], 900, 420);
  const panel = makePlane(2.75, 1.35, panelTex);
  panel.position.set(0, 0.35, 0);
  ui.add(panel);

  const btn = makePlane(1.95, 0.62, makeButtonTexture(opts.buttonText, true, 640, 220));
  btn.position.set(0, -0.45, 0.01);
  btn.userData.uiType = opts.uiType;
  // Normalise action names so main.js can handle both uiType & uiAction reliably.
  btn.userData.uiAction = (String(opts.uiType).toLowerCase().includes('finish')) ? 'finish_assessment' : 'start_assessment';
  btn.userData.uiGroup = ui;

  window.uiMeshes.push(btn);
  ui.add(btn);

  scene.add(ui);
  return ui;
}

// ---------- Date logic ----------
  function parseISO(iso){
    const [y,m,d] = iso.split('-').map(n=>parseInt(n,10));
    return new Date(y, m-1, d);
  }
  function addYears(date, years){
    return new Date(date.getFullYear()+years, date.getMonth(), date.getDate());
  }
  function fmtDate(d){
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = d.toLocaleString('en-GB', { month:'long' });
    const yy = d.getFullYear();
    return `${dd} ${mm} ${yy}`;
  }

  // ---------- Model factory ----------
  function createSpyder(scene, opts){
    ensureGlobals();
    window.spyderFaults = { ladderBrokenTotal: 0, ladderFixedCount: 0, flapUpTotal: 0, flapFixedCount: 0 };
    window.fireQuizAnswered = false;
    window.fireQuizCorrect = 0;
    const data = window.SPYDER_DATA;
    const pos = opts?.position || {x: 10, y:0, z:-10};

    const root = new THREE.Group();
    root.position.set(pos.x, pos.y, pos.z);

    // Materials
    const matBody  = makeMat(0x4b4f55);
    const matDark  = makeMat(0x2b2e33);
    const matMetal = makeMat(0x6c7178);
    const matRed   = makeMat(0xd23a2f);

    // --- Truck base ---
    const t = data.truck;
    const base = box(t.length, 0.55, t.width, matBody);
    base.position.set(0, 0.55/2 + 0.55, 0); // sit above wheels
    base.castShadow = base.receiveShadow = true;
    root.add(base);

    // Cab
    const cab = box(t.cabLength, t.height, t.width*0.95, matBody);
    cab.position.set(-t.length/2 + t.cabLength/2 + 0.15, 0.55 + t.height/2, 0);
    cab.castShadow = cab.receiveShadow = true;
    root.add(cab);

    // Cab windshield block
    const windshield = box(0.15, 1.0, t.width*0.85, makeMat(0x6aa6c8));
    windshield.position.set(cab.position.x - t.cabLength/2 + 0.25, cab.position.y + 0.2, 0);
    root.add(windshield);

    // Bed deck
    const bed = box(t.bedLength, 0.25, t.width*0.98, matDark);
    bed.position.set(t.length/2 - t.bedLength/2 - 0.1, 0.55 + 0.55/2 + 0.2, 0);
    bed.castShadow = bed.receiveShadow = true;
    root.add(bed);

    // Wheels (6x)
    const wheelZ = t.width/2 + t.wheelWidth/2 - 0.05;
    const wheelX = [-2.2, 0.0, 2.2];
    for (const x of wheelX){
      for (const side of [-1, 1]){
        const w = cyl(t.wheelRadius, t.wheelWidth, matDark);
        w.rotation.x = Math.PI/2;
        w.position.set(x, t.wheelRadius, side*wheelZ);
        w.castShadow = w.receiveShadow = true;
        root.add(w);
      }
    }

    // Side rails (simple)
    const rail = box(t.length*0.7, 0.25, 0.12, matMetal);
    rail.position.set(0.8, 0.55 + 1.05, t.width/2 - 0.06);
    root.add(rail);
    const rail2 = rail.clone();
    rail2.position.z *= -1;
    root.add(rail2);

    // --- Launcher assembly ---
    const L = data.launcher;

    const launcherBase = box(L.baseLength, L.baseHeight, L.baseWidth, matMetal);
    launcherBase.position.set(bed.position.x + 0.2, bed.position.y + 0.25, 0);
    launcherBase.castShadow = launcherBase.receiveShadow = true;
    root.add(launcherBase);

    // Launcher pack on a pivot (separate, but not yet interactive)
    const launcherPivot = new THREE.Group();
    launcherPivot.position.set(launcherBase.position.x + 0.2, launcherBase.position.y + L.baseHeight/2, 0);
    root.add(launcherPivot);

    const pack = box(L.packLength, L.packHeight, L.packWidth, matBody);
    pack.position.set(L.packLength/2 - 0.2, L.packHeight/2, 0);
    pack.castShadow = pack.receiveShadow = true;
    launcherPivot.add(pack);

    launcherPivot.rotation.z = L.elevationDeg * DEG;

    // Fake "missile tubes" on top face (little boxes)
    const tubes = new THREE.Group();
    const rows = 2;
    const cols = 4;
    const tubeW = 0.35, tubeH = 0.25, tubeD = 0.45;
    for (let r=0; r<rows; r++){
      for (let c=0; c<cols; c++){
        const tb = box(tubeD, tubeH, tubeW, matDark);
        const ox = -L.packLength/2 + 0.45 + c*(0.55);
        const oz = -L.packWidth/2 + 0.4 + r*(L.packWidth-0.8);
        tb.position.set(pack.position.x - L.packLength/2 + 0.55 + c*0.55, pack.position.y + L.packHeight/2 - 0.15, oz);
        tubes.add(tb);
      }
    }
    launcherPivot.add(tubes);

    // --- Ladders (separate parts, interactive) ---
    const lad = data.ladder;

    function makeLadderFixed(){
      const g = new THREE.Group();

      // Ladder plane is X-Y (width along X, height along Y), with a small depth in Z.
      const railThick = 0.06;
      const railDepth = 0.06;

      const xA = (-lad.width/2) + 0.02;
      const xB = (+lad.width/2) - 0.02;

      // Two vertical rails (left + right)
      const railA = box(railThick, lad.height, railDepth, matMetal);
      railA.position.set(xA, lad.height/2, 0);
      g.add(railA);

      const railB = railA.clone();
      railB.position.x = xB;
      g.add(railB);

      // Rungs spanning between rails
      for (let i=0; i<lad.rungCount; i++){
        const y = 0.25 + (i/(lad.rungCount-1))*(lad.height-0.5);
        const rung = box(lad.width-0.04, 0.05, 0.05, matMetal);
        rung.position.set(0, y, 0.01); // tiny offset to avoid z-fighting
        g.add(rung);
      }
      return g;
    }

    function makeLadderBroken(){
      const g = makeLadderFixed();

      // "broken": tilt the whole ladder + remove one rung
      g.rotation.x = 25 * DEG;

      // remove a middle rung if present
      const rungs = g.children.filter(ch => ch.geometry && ch.geometry.type === 'BoxGeometry' && ch.scale);
      if (g.children.length > 3) {
        // remove a rung that is not a rail (rungs have big Z span)
        for (let i=0; i<g.children.length; i++){
          const ch = g.children[i];
          if (ch.geometry && ch.geometry.type === 'BoxGeometry' && ch.scale) {}
        }
      }
      // safer: remove the 3rd child which is usually the first rung (after 2 rails)
      if (g.children.length > 3) g.remove(g.children[3]);

      return g;
    }

    function makeLadderPair(sideSign){
      const holder = new THREE.Group();
      holder.position.set(cab.position.x + 0.05, 0.55, sideSign*(t.width/2 + 0.28));
      holder.rotation.y = sideSign > 0 ? Math.PI : 0;

      const fixed = makeLadderFixed();
      const broken = makeLadderBroken();
      const startBroken = (Math.random() < 0.5);
      if (startBroken && window.spyderFaults) window.spyderFaults.ladderBrokenTotal++;
      fixed.visible = !startBroken;
      broken.visible = startBroken;

      holder.add(fixed);
      holder.add(broken);

      // clickable proxy (bigger invisible box)
      const proxy = box(0.6, lad.height+0.2, 0.6, new THREE.MeshBasicMaterial({ visible:false }));
      proxy.position.set(0.2, lad.height/2, 0);
      holder.add(proxy);

      addInteract(proxy, 'ladder', { fixedRef: fixed, brokenRef: broken, state: startBroken ? 'broken' : 'fixed', counted:false });

      root.add(holder);
    }

    makeLadderPair(+1); // right
    makeLadderPair(-1); // left

    // --- Rear flaps (separate, interactive) ---
    const fl = data.flaps;
    function makeFlap(xOffset, zOffset, name){
      const hinge = new THREE.Group();
      hinge.position.set(bed.position.x + t.bedLength/2 - 0.05, bed.position.y - 0.05, zOffset);
      // flap mesh
      const flap = box(fl.width, fl.height, fl.depth, matBody);
      flap.position.set(fl.width/2, -fl.height/2, 0);
      hinge.add(flap);

      // clickable proxy
      const proxy = box(fl.width+0.2, fl.height+0.4, 0.6, new THREE.MeshBasicMaterial({ visible:false }));
      proxy.position.set(fl.width/2, -fl.height/2, 0);
      hinge.add(proxy);

      // start state: randomly up or down (so you can test fixing)
      const startUp = (Math.random() < 0.5);
      hinge.rotation.z = startUp ? (-95*DEG) : 0; // up: rotate towards vertical-ish
      if (startUp && window.spyderFaults) window.spyderFaults.flapUpTotal++;
      addInteract(proxy, 'flap', { hingeRef: hinge, state: startUp ? 'up' : 'down' });

      root.add(hinge);
      return hinge;
    }

    makeFlap(0,  +0.65, 'flap_right');
    makeFlap(0,  -0.65, 'flap_left');

    // --- Fire extinguisher (interactive + quiz) ---
    const ex = data.extinguisher;
    const extGroup = new THREE.Group();
    extGroup.position.set(cab.position.x + 0.9, 0.55 + 0.85, t.width/2 - 0.15);

    const extBody = cyl(0.12, 0.45, matRed);
    extBody.rotation.z = Math.PI/2;
    extGroup.add(extBody);

    const extNozzle = box(0.12, 0.05, 0.05, matDark);
    extNozzle.position.set(0.25, 0.08, 0);
    extGroup.add(extNozzle);

    // Click proxy
    const extProxy = box(0.65, 0.55, 0.55, new THREE.MeshBasicMaterial({ visible:false }));
    extProxy.position.set(0.1, 0.0, 0);
    extGroup.add(extProxy);

    addInteract(extProxy, 'extinguisher', { rootRef: extGroup });

    root.add(extGroup);

    // --- Quiz UI (hidden until you click extinguisher) ---
    const ui = new THREE.Group();
    ui.visible = false;
    ui.position.copy(extGroup.position);
ui.position.y += 0.95;

// Push the UI outward (away from truck body) so it doesn't clip.
// Extinguisher sits on +Z side, so move further towards +Z and slightly forward in +X.
ui.position.z += 1.15;
ui.position.x += 0.35;
    setBillboard(ui);

    const serviceDate = parseISO(ex.serviceDateISO);
    const today = new Date();
    const due = addYears(serviceDate, 1);
    const correct = (today >= due) ? 'unserviceable' : 'serviceable';

    // store quiz state globally (hidden variables)
    window.spyderFaults = window.spyderFaults || { ladderBrokenTotal: 0, ladderFixedCount: 0, flapUpTotal: 0, flapFixedCount: 0 };

    window.spyderQuiz = {
      correct,
      answered: null,
      wasCorrect: null,
      serviceDateISO: ex.serviceDateISO
    };

    const panelTex = makeLabelTexture([
      'FIRE EXTINGUISHER',
      `Service date: ${fmtDate(serviceDate)}`,
      `Today: ${fmtDate(today)}`,
      'Choose status:',
    ], 640, 300);

    const panel = makePlane(2.2, 1.05, panelTex);
    panel.position.set(0, 0.4, 0);
    ui.add(panel);

    const btnSvc = makePlane(0.95, 0.42, makeButtonTexture('SERVICEABLE', true));
    btnSvc.position.set(-0.55, -0.35, 0.01);
    ui.add(btnSvc);

    const btnUn = makePlane(0.95, 0.42, makeButtonTexture('UNSERVICEABLE', true));
    btnUn.position.set(+0.55, -0.35, 0.01);
    ui.add(btnUn);

    // Make buttons clickable via raycast
    ensureGlobals();
    window.uiMeshes.push(btnSvc, btnUn);
    btnSvc.userData.uiType = 'quizButton';
    btnSvc.userData.uiAction = 'quiz_answer';
    btnSvc.userData.answer = 'serviceable';
    btnSvc.userData.uiGroup = ui;

    btnUn.userData.uiType = 'quizButton';
    btnUn.userData.uiAction = 'quiz_answer';
    btnUn.userData.answer = 'unserviceable';
    btnUn.userData.uiGroup = ui;

    root.add(ui);

    // attach references so main.js can show/hide
    root.userData.spyderUI = ui;

    scene.add(root);

    // Expose a handle for scene to use if needed
    return root;
  }

  window.SpyderModel = { create: createSpyder, makeInWorldUI };
})();

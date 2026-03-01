// scene_outdoor.js
(function(){
  if(!window.THREE){console.error("THREE not found");return;}

const TEX_GRASS = "data:image/png;base64,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";
const TEX_CONE  = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABaElEQVR4nO2auxHCQAxED4YCCCiBMiiBgBIojRIIKIEyKIGADiC6GcbY+D4r7d14N7a1svbJBkMIkiRJRD1O4c30XzPNWxB1ADF9JgUigGU8TJ1FgQhgmE6lzaBABHgbzqXsTYEIYDfAlusAUvH2XAMR4GWUm6oXBSLAw6Q0TQ8KRIC1QW2K1hSIAHYDbJkOAIWv5RqIAKvC6NSsKBABFkWt0rKoKwLQBa0/uKDriwB2A2xBB+D1HR7pIwJQhbxfZ6P8NogiY9pdXvCaz/MWXhNCAOuHTYSvyT3AIn2rutUDYP/FpdZfTwF2A2xVDWAMP6v9/1e/Zg1EQOmJ7JvfUKX9QAmwxt/Cp2gAraUfVdKX7gG5J7SaflRufzACvPYf7bf4FVjlHNw6/t/aX9OubfEEJA+gp/RDSO9XBKQc1Fv6USl9i4C5A3pNP2qu/8lHxe3Q94WP6Xj/vV6tALsBtjQAdgNsLX4AH5+WfHwcLkk8AAAAAElFTkSuQmCC";
const TEX_TREE  = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAACACAYAAAC7gW9qAAAC5ElEQVR4nO1ZsXHDMBBjcuc6TZo0brxBJvEG2SDDZINskEmygRvX2SGpeJfTWSL/iX9QPqC0qX88AMqyWIogUPFyfvll9n9kNp8BVAGq+8wUKAGsxkvXWSlQAhhN19xmpEAJyG7Ycjk7BUpAZrNedzNToARkNbK6mpUCJSCjidfNjBQoAdENRl2MToESEFkc5V5kCpSAqMJo16JSoAREFI1yK6KuEoAuGP27ja6vBCCLZf2DQ/ZRAlCFvK4cng6p/ZagJqAO7xUBAYgArFMdRF9aApaus1IwLAD7fH+0PyUBa24zUjAkgEf91pAeEUZSoOcA74UR7lvXjfIpJTEB1qGy7gcuAdh3/jV4eKUkwOtmRgrMAszqfoWVX3gCRl2MToFJAKu6KPLWOhaeeg7oXchy31uvl29IAqL2bUTdLgFmv/OvoYc3PAHRd210/aYAe3W/osX/Adns+HZME+v6eYVwh22BzOGR/fQcgCiS7T6yLz0BzDOBUgACjLiAOBgZTcGQAKzoLzHCQwcj3gsR0e/9PJKPS4BZor+Eh1f6Fog4GBmBWYCI6HvX3YKVH/05gA2TABnue9f/h4VntwCZw49eV0o/X70W71k0689eCz28mwIwoo+s0+IftgXYr8V7sSnAXqO/xNYcOhdY+8Lr/qyvxdfmgb4VLqWU0/spfNtcPi4w3tAtkDE8ug9MgKzh0f30ZwhRJNt9ZN9hAVjDo/prC4xczHa/YoSHW4BZhq/w8tEW8Fw0m/sVHl5mAWYdvsLKT1vAsnh29yssPLsF2MvwFb18uwTY2/AVPbx1D2gt2Kv7FS3+mwLsffiKrTm0Bda+uBf3K9bmuSnAvQ1fcWsubYHlB/fqfsVyPvi5QAvn1+emwF/fP2m8tAXYBNiQAGwCbEgANgE2JACbABsSgE2ADQnAJsCGBGATYEMCsAmwIQHYBNiQAGwCbEgANgE2JACbABsSgE2ADQnAJsCGBGATYOMP1I67jzA1SbUAAAAASUVORK5CYII=";

const TEX_FENCE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABwklEQVR4nO2bzY3DIBCFx2jr4LSHFJMiXAkHKqGIFOODT1SSEysv5tfWKPN2J6fI8D3QmPDsJ7J471/W2gdd/MQYN2TeWGsfMcbtzuDIPIUQ9hDC7r1/lTql9vx66o/Om3TBOfesiZRg59zzeA2VN8eGEZHS4Mi8yTu0RFqDo/KnAtRERgZH5IsFyEVijNvo4Gh8tQBJ5I7PIvDNAqSHpKs+i8BXC3D8zVhrH6MWg8YXCyDJp7n5UwGk+TQ3/6sAEn2am/8pgFSf5uYNkWyf5uaNdJ/m5m/lAQg+3+MNkWyf5uY1D5gVQfP5Hr+U4qLaxjK64SDxxUfh0sYys9si8V/py7qu33njcZetLbu0glB5zQNaAhJ8WvMAZl7zgBF4ZhJovOYBM3BrEqi85gHSfZqb1zyASLZPc/OaB8yKoPl8j9fzAaMiqD7f4/V8QE/k0z6teQAzXwxFic4Z2uydQOGLK6DUeeZOQPH5Scp89/zr7ZoHzMCtSaDymgdI92luXvMAIuz3+bu85gGzItLe5+/ymgeMiqD6fI/XPKAn8mmf1jxAzwfo+QBWXs8HjMIjk0Dk/30esIQQ9qtWc/z3Nir/BrERza6BupKaAAAAAElFTkSuQmCC";

const TEX_FOD_NEWSPAPER = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAtUlEQVR4nO3ZKxKDMBSFYdrpOtAsIouJrkAhsoSIqorqLCb7ah0DTEoKM7nJnf6f4yHOAY6i6wAA/+yyPRFe7l0jyBH27ufct9QNxhi5NAfFGFfHyQJL1k7FwvwqhMfXa1fBHEVQoLbsBoahl8hxmvo3oL5A9hNybpTIcVq2gPdPiRy79h6i+k9IfQE2IIENtIwNSGADLWMDEthAy9iABDbQMvUbUP8GKFCb+gLJEW9/IgBAMR/dYCRSp2ySwQAAAABJRU5ErkJggg==";
const TEX_FOD_FIRSTAID = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAzUlEQVR4nO3YsRGDMAwFUCWXyrU3SBN2YJiMwQiMkWGyA2mygWu3MABnbFm6E+L+aw02HxkdQAQAAAI36QRTCKt0jjnn7ut4SBcnInqF0H3uL2fR2nfR2SdQrMAnxqatIb2DnLXeKe22msoW0gjRqxpgjPF4XO1Syr4pFceu+wz0ei5L9Zj/MKit574CCGANAay5D8Buoy1tUjoHp826rwACWEMAa+4DsNtorcXhbZQJAawhgDX3AdQ/6jVbZIvrV+Dop9IZuK8AAACAaxtp5iWoFbnZ6wAAAABJRU5ErkJggg==";
const TEX_FOD_SCREWDRIVER = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAA5klEQVR4nO2ZOw6CQBiER8+wJ6HmMNYWVNYU1FYW1hyGmpNwBywMiQlZHmaWEZyv/cnufPtI+AEw5r85pRi0LkIfq10eHXVO6mBD8DwL0WeatgPAEzkzBvlkKvyS+lpoAnUR+qXh8ixMHrM10HdgayygxgJqLKDGAmosoMYCaiygZvcC9JZyaGoaVKN6jvJda7vfbSmHnvfb+lrSfZXInuNCe6V/lUhyB2Ih2eGBA1xiC6ixgBoLqLGAGguosYCa3QvQX2+r6j7766gsb7R56TswF44ZHjjAEUoiEFtl9uoDB9iB3fMCP5MzGlKOYyAAAAAASUVORK5CYII=";
const TEX_FOD_GARBAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABR0lEQVR4nO2ZQY7DIAxF3WqO4HVOkovNCeZiOUnWvkNnUySEAnwTAy3y20QqDfkvjtVAiRzHcWby6DHpvu+v3NhxHKbXfFpONgMXmI0LpJQaGBnXYiqAhrOUMBPQhrKS8B4gImLmprvZel7MrV/FEICZKT4iiEh6bMrSdFIaPBmrnh9CX32mFVELMPMrhNy27TcdP8/z7/29bMgSIqKSUAnUwgeCRCsaCbiJ0fDIOHAtuMEhAU34wCiJqkAcfjSIxNo/ZFd3H23Qu40cZShWoakCtXBW4RGyArVnPxeyR/hSFX7uTDzyTudYu4m/AReYzboCIvJAXn9HUHo7XbcCRJ9RhdraYO0KEM2tArIygyowQwJdVsKP0EiJLmvi98TdJbruSgRK+0KtDNsXirEQmbIzlxIvNrQ7c63BA+b/UiJbIXdDO44h/462wYnr4lBSAAAAAElFTkSuQmCC";
const TEX_FOD_CAN = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABZklEQVR4nO2ZoXKEMBCG9zpVp9GoCjSqIg+BquhDoFODwJQnqOoTVOUhIvoIEVVo9FkqenS4DHNz+yclzcx+CsRu/p9lw2wgEgRBEAQhHYdYibTuZ27MMHTB69+jgb7gpmmQNBc5EEPQE9C6n0HBVzHGsE3ccRf5K/FEP1Xkvoq7V6Asy5f1/TiOr8s1UgGoB86LxOgBMsb4eVnATUxEpJTaFHKNtm03c1hrIQ1BBraE7A27if8b2RuAv4RfqmJ/eYmIjh+fF7vQ6enxdxd6sI6tJ/sKiIHUwNtoURRQ3ClSnoXsKyAGUpO9AbiJp2mC4o6R8ixkXwExkBq4B97VMzQD1N69029EdB5obMfOl30FsjcQbaS8daata/8lCiPIwFp0VVXBORAgA1r3MyrYZ51H637mHq2wR7iY4rdwzrHOh9hNPAzdwTnHDbsJrniigKHeP8NEquI/iN1Op7dI9X9AEITM+QavcXHt8HBu5gAAAABJRU5ErkJggg==";

  const loader = new THREE.TextureLoader();

  function makeTex(dataURI, rx, ry, nearest) {
    const t = loader.load(dataURI);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx || 1, ry || 1);
    if (nearest) { t.magFilter = t.minFilter = THREE.NearestFilter; }
    return t;
  }

  function createBasicScene(options) {
    const scene       = options.scene;
    const addCollider = options.addCollider || function () {};
    const setSpawn    = options.setSpawn    || function () {};

    const BARRIER   = 40;
    const TREE_RING = 62;
    const LEN       = BARRIER * 2;

    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 50, 130);

    // Lighting
    scene.add(new THREE.HemisphereLight(0x87ceeb, 0x4a7c40, 0.7));
    const sun = new THREE.DirectionalLight(0xfffbe0, 1.1);
    sun.position.set(30, 50, 20);
    sun.castShadow = true;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -120;
    sun.shadow.camera.right = sun.shadow.camera.top = 120;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 250;
    sun.shadow.mapSize.width = sun.shadow.mapSize.height = 2048;
    sun.shadow.bias = -0.0003;
    scene.add(sun);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(250, 250),
      new THREE.MeshStandardMaterial({ map: makeTex(TEX_GRASS, 60, 60, true), roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Invisible walls
    function invisWall(cx, cz, sx, sz) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, 4, sz), new THREE.MeshBasicMaterial({ visible: false }));
      m.position.set(cx, 2, cz);
      scene.add(m);
      addCollider({ cx, cz, hw: sx/2, hd: sz/2 });
    }
    invisWall(0, BARRIER, LEN, 0.5);
    invisWall(0, -BARRIER, LEN, 0.5);
    invisWall(BARRIER, 0, 0.5, LEN);
    invisWall(-BARRIER, 0, 0.5, LEN);

    // Fence
    function addFence(cx, cz, rotY, len) {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(len, 2.0),
        new THREE.MeshStandardMaterial({ map: makeTex(TEX_FENCE, len/4, 1.5, false), alphaTest: 0.3, side: THREE.DoubleSide, depthWrite: true, roughness: 0.8, metalness: 0.2 })
      );
      m.position.set(cx, 1.0, cz);
      m.rotation.y = rotY;
      m.renderOrder = 0;
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
    }
    addFence(0, BARRIER, 0, LEN);
    addFence(0, -BARRIER, 0, LEN);
    addFence(BARRIER, 0, Math.PI/2, LEN);
    addFence(-BARRIER, 0, Math.PI/2, LEN);

    // Cones
    const C = BARRIER - 2;
    function placeCone(x, z) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.0),
        new THREE.MeshBasicMaterial({ map: makeTex(TEX_CONE,1,1,false), alphaTest:0.3, side:THREE.DoubleSide, depthWrite:true }));
      m.position.set(x, 0.5, z);
      m.renderOrder = 2;
      m.onBeforeRender = function(r,s,cam){ const a=Math.atan2(cam.position.x-this.position.x,cam.position.z-this.position.z); this.rotation.set(0,a,0); };
      scene.add(m);
    }
    for (let i = -C; i <= C; i += 5) { placeCone(i,C); placeCone(i,-C); placeCone(C,i); placeCone(-C,i); }

    // Trees
    const treeTex = makeTex(TEX_TREE,1,1,false);
    let seed=42;
    function rand(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }
    function jit(){ return (rand()-0.5)*5; }
    function placeTree(x,z,sc){
      const h=6*sc, w=3*sc;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w,h),
        new THREE.MeshBasicMaterial({map:treeTex,alphaTest:0.3,side:THREE.DoubleSide,depthWrite:true}));
      m.position.set(x,h/2,z);
      m.renderOrder=1;
      m.onBeforeRender=function(r,s,cam){ const a=Math.atan2(cam.position.x-this.position.x,cam.position.z-this.position.z); this.rotation.set(0,a,0); };
      scene.add(m);
    }
    for (let i=-TREE_RING; i<=TREE_RING; i+=7){
      placeTree(i+jit(), TREE_RING+jit(), 0.9+rand()*0.8);
      placeTree(i+jit(),-TREE_RING+jit(), 0.9+rand()*0.8);
      placeTree( TREE_RING+jit(),i+jit(), 0.9+rand()*0.8);
      placeTree(-TREE_RING+jit(),i+jit(), 0.9+rand()*0.8);
    }
// FOD items (unique + random count each load)
window.fodMeshes = [];
window.fodCollected = 0;
window.fodTarget = 0; // total number spawned this run (hidden variable)

const FOD_TYPES = [
  { id:'newspaper',   tex:TEX_FOD_NEWSPAPER,   w:0.7, h:0.5 },
  { id:'firstaid',    tex:TEX_FOD_FIRSTAID,    w:0.6, h:0.5 },
  { id:'screwdriver', tex:TEX_FOD_SCREWDRIVER, w:0.3, h:0.6 },
  { id:'garbage',     tex:TEX_FOD_GARBAGE,     w:0.6, h:0.6 },
  { id:'can',         tex:TEX_FOD_CAN,         w:0.3, h:0.5 },
];

// Better randomness when available (changes each reload)
function rand01(){
  try{
    if (window.crypto && crypto.getRandomValues) {
      const a = new Uint32Array(1);
      crypto.getRandomValues(a);
      return a[0] / 4294967296; // [0,1)
    }
  }catch(_){}
  return Math.random();
}
function randInt(min, max){
  return Math.floor(rand01() * (max - min + 1)) + min;
}
function shuffleInPlace(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(rand01() * (i + 1));
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

// Choose a random number of unique items: 1..all types
const spawnCount = randInt(1, FOD_TYPES.length);
window.fodTarget = spawnCount;

const chosen = shuffleInPlace(FOD_TYPES.slice()).slice(0, spawnCount);

for (const type of chosen){
  const t = loader.load(type.tex);
  t.magFilter = t.minFilter = THREE.NearestFilter;

  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(type.w, type.h),
    new THREE.MeshBasicMaterial({ map:t, alphaTest:0.3, side:THREE.DoubleSide, depthWrite:true })
  );

  // Place in an annulus, avoid spawn centre
  let px, pz;
  do {
    px = (rand01() - 0.5) * 72;
    pz = (rand01() - 0.5) * 72;
  } while (Math.sqrt(px*px + pz*pz) < 5 || Math.sqrt(px*px + pz*pz) > 36);

  m.position.set(px, type.h / 2, pz);
  m.renderOrder = 3;
  m.userData.fodId = type.id; // extra safety/debug if you ever need it

  // Billboard towards camera
  m.onBeforeRender = function(r, s, cam){
    const a = Math.atan2(cam.position.x - this.position.x, cam.position.z - this.position.z);
    this.rotation.set(0, a, 0);
  };

  scene.add(m);
  window.fodMeshes.push(m);
}

    

// ── Spyder-like training asset (blocky cubes, separate interactive parts) ──
if (window.SpyderModel && window.SPYDER_DATA) {
  // Place it somewhere near the play area
  const spyder = window.SpyderModel.create(scene, { position: { x: 12, y: 0, z: -8 } });
  window.spyderRoot = spyder; // optional handle


// ── PPE table (collect 2 items) ──
window.ppeMeshes = [];
window.ppeCollected = 0;
window.ppeTarget = 2;

const table = new THREE.Mesh(
  new THREE.BoxGeometry(1.6, 0.08, 0.9),
  new THREE.MeshStandardMaterial({ color: 0x6b4f2a, roughness: 0.9, metalness: 0.0 })
);
table.position.set(1.2, 0.9, -1.0);
table.castShadow = true; table.receiveShadow = true;
scene.add(table);

const tableLegMat = new THREE.MeshStandardMaterial({ color: 0x4a3720, roughness: 0.95 });
for (const sx of [-0.7, 0.7]){
  for (const sz of [-0.35, 0.35]){
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 0.08), tableLegMat);
    leg.position.set(table.position.x + sx, 0.425, table.position.z + sz);
    leg.castShadow = true;
    scene.add(leg);
  }
}

// PPE billboards (collectibles) — low-res textured planes (helmet + gloves)
const TEX_PPE_HELMET_DELETEME = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA50lEQVR42mNgGAWjYKQDRnI0iRiJ3MEm/ubcGxVSzWIhx2IpSyllHErukOoQRlIsl7KUUlbSVupFl7t39V4xMv/Z8Wd3iXUEE6WWMzAwMKCLS1lKKeOKJpIdQMhySh1BVAgQshxbNBALmAj53ibFZgO5lhMTCoyEgp5QSBDjc3yJkqRsiGyZkrZSL7nBTnQIULPEIykERIxE7ghpCSlTudS9g80RTAwDDAbcAYy4Uv+Pjz9QxL+9+kaSwVxiXCh8Dn4OrLkBZy7g4OegyAHo+gdtFBBdDgipCg3PRDjgDhgFo2AUDDgAAPzQWdqBBAC8AAAAAElFTkSuQmCC";
const TEX_PPE_GLOVES = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA70lEQVR42u2WMQ6DIBSGf5tOLswuLngCF6/hwmF6Ag/jwjVYnBnKwuL8Fla7aJOapj4brGnCP0EC7/9C+B8ASUlJTCmlJqXUxB1zlXHN9wL3fc+qfTn7ZBPA6QDXvRuMMW5rTdM08hAAY4zjFOdAsmLYtu0EAFrrrCzLe13XMoQAIQSklLdlnXOuIyIIIQAARARrrfPeV1/fgcV8rTzPX8wBPOdEBCJKKTgeYBiG7tP80BjGMGWdgNb6bUJCCL9rRGuI2OYpBf8F4L2vrLWsHs9tw+wv2fzCTQAwjuMmRFEUcn6Usuh9YCmeLmFSLD0AmAVpWn/f6wgAAAAASUVORK5CYII=";
const TEX_PPE_HELMET = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA70lEQVR42mN0M2IYUMDEwDDqgFEHDCxgIUeTlQXDHWzix04wqNDUATCLnRwZlHEouUOqQ1hIsdzJkUHZxoqhF13uyDGGYjSH3SHWEUyUWs7AwMCALu7kyKCMK5pIdgAhyyl1BFEhQMhy5Gigaja0smC4U1fNsIFcy4kJBUZclREs6AmFBDE+37ef4S6uRElSNkS2zMaKoZfcYCfaAfv2M9zFIxfAwIBbniIHWFkw3DHQx1nYkAuwlg2jlRELrtT/7h2q+LPnpBksJYmZJbFFA85EKCREmQPQ9Q/99oCO9miTjDaAcbRjMuqAUQcMtAMAOpRJ9cpPZJYAAAAASUVORK5CYII=";

function loadNearestTexture(dataUri) {
  const t = new THREE.TextureLoader().load(dataUri);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return t;
}

function makeBillboard(map, w, h) {
  const mat = new THREE.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.4 });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.castShadow = false;
  m.renderOrder = 3;

  // Billboard towards camera (yaw only, so it stays upright)
  m.onBeforeRender = function(r, s, cam){
    const a = Math.atan2(cam.position.x - this.position.x, cam.position.z - this.position.z);
    this.rotation.set(0, a, 0);
  };
  return m;
}

const helmetTex = loadNearestTexture(TEX_PPE_HELMET);
const glovesTex = loadNearestTexture(TEX_PPE_GLOVES);

// Helmet (collectible)
const helmet = makeBillboard(helmetTex, 0.45, 0.32);
helmet.position.set(table.position.x - 0.35, table.position.y + 0.23, table.position.z);
helmet.userData.ppeType = 'helmet';
scene.add(helmet);
window.ppeMeshes.push(helmet);

// Gloves (collectible)
const gloves = makeBillboard(glovesTex, 0.42, 0.30);
gloves.position.set(table.position.x + 0.35, table.position.y + 0.20, table.position.z + 0.05);
gloves.userData.ppeType = 'gloves';
scene.add(gloves);
window.ppeMeshes.push(gloves);

// ── In-world instruction UI (3D) ──
// Uses the same 3D UI system as the extinguisher quiz.
if (window.SpyderModel && window.SpyderModel.makeInWorldUI) {
  window.introUI = window.SpyderModel.makeInWorldUI(scene, {
    position: { x: 0.8, y: 1.55, z: -2.0 },
    title: "INSTRUCTIONS",
    lines: [
      "Pick up your PPEs, remove FODs,",
      "check fire extinguishers, and fix",
      "faults by looking at it and pressing",
      "your right screen."
    ],
    buttonText: "START ASSESSMENT",
    uiType: "startAssessment"
  });

  window.finishUI = window.SpyderModel.makeInWorldUI(scene, {
    position: { x: 18.0, y: 1.55, z: -10.0 },
    title: "ASSESSMENT",
    lines: ["Finish assessment?"],
    buttonText: "FINISH",
    uiType: "finishAssessment"
  });

  // Start with intro open (modal UI). Gameplay interactions are blocked until START is pressed.
  window.modalUIOpen = true;
  window.introUI.visible = true;
  // Hide FINISH until the assessment starts (avoids confusion at the beginning).
  window.finishUI.visible = false;
}

}

setSpawn({ x:0, z:0 });
}

  window.SceneFactory = { createBasicScene };
})();

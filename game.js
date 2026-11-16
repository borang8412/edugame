// ==========================================
// 1. Web Audio API 배경음악 & Web Speech API(TTS) 음성 안내
// ==========================================
class SoundManager {
  constructor() {
    this.ctx = null;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.noteIndex = 0;
    this.melody = [
      523.25, 659.25, 783.99, 659.25,
      587.33, 698.46, 880.00, 698.46,
      783.99, 659.25, 523.25, 587.33,
      659.25, 587.33, 523.25, 392.00
    ];
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ko-KR';
    utter.rate = 1.0;
    utter.pitch = 1.15;
    utter.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const korVoice = voices.find((v) => v.lang.includes('ko') || v.lang.includes('KR'));
    if (korVoice) utter.voice = korVoice;

    window.speechSynthesis.speak(utter);
  }

  startBGM() {
    this.init();
    if (this.isPlayingBGM) return;
    this.isPlayingBGM = true;
    this.noteIndex = 0;
    const loop = () => {
      if (!this.isPlayingBGM) return;
      const freq = this.melody[this.noteIndex % this.melody.length];
      this.playTone(freq, 0.15, 'triangle', 0.055);
      this.noteIndex++;
      this.bgmTimer = setTimeout(loop, 230);
    };
    loop();
  }

  stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmTimer) clearTimeout(this.bgmTimer);
  }

  playTone(freq, duration, type = 'sine', volume = 0.12) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playPencil() {
    this.playTone(783.99, 0.09, 'square', 0.11);
    setTimeout(() => this.playTone(1046.50, 0.18, 'square', 0.11), 85);
  }

  playSlip() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(240, this.ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.38);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.38);
  }

  playWarning() {
    this.playTone(440, 0.07, 'sawtooth', 0.05);
  }

  playFall() {
    this.playTone(190, 0.3, 'sawtooth', 0.22);
    setTimeout(() => this.playTone(125, 0.38, 'sawtooth', 0.22), 110);
  }

  playFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50, 1318.51];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 0.24, 'square', 0.13), i * 140);
    });
  }
}

const sound = new SoundManager();
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

// ==========================================
// 2. 픽셀아트 프로시저럴 텍스처 생성기
// ==========================================
function createPixelTexture(drawFn, repeatX = 1, repeatY = 1, size = 16) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  return tex;
}

const textures = {
  woodCorridor: createPixelTexture((ctx, s) => {
    ctx.fillStyle = '#d5a770';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#c1915a';
    ctx.fillRect(0, 0, s, 2);
    ctx.fillRect(0, 8, s, 2);
    ctx.fillStyle = '#e2b882';
    ctx.fillRect(2, 3, 5, 2);
    ctx.fillRect(9, 11, 5, 2);
    ctx.fillStyle = '#9e703f';
    ctx.fillRect(7, 0, 1, 8);
    ctx.fillRect(14, 8, 1, 8);
  }, 24, 3),

  classTile: createPixelTexture((ctx, s) => {
    ctx.fillStyle = '#c89652';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#b58340';
    ctx.fillRect(0, 0, 8, 8);
    ctx.fillRect(8, 8, 8, 8);
    ctx.fillStyle = '#d9a968';
    ctx.fillRect(2, 2, 4, 4);
    ctx.fillRect(10, 10, 4, 4);
  }, 8, 4),

  wallPlaster: createPixelTexture((ctx, s) => {
    ctx.fillStyle = '#f5f1e4';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#e6e0cc';
    ctx.fillRect(0, 7, s, 1);
    ctx.fillRect(0, 15, s, 1);
    ctx.fillRect(7, 0, 1, 7);
    ctx.fillRect(15, 8, 1, 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, 2, 2, 2);
    ctx.fillRect(10, 10, 2, 2);
  }, 16, 2),

  ceilingTile: createPixelTexture((ctx, s) => {
    ctx.fillStyle = '#ececec';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#d0d0d0';
    ctx.fillRect(0, 0, s, 1);
    ctx.fillRect(0, 0, 1, s);
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(3, 3, 2, 2);
    ctx.fillRect(10, 9, 2, 2);
  }, 12, 4),

  roofShingle: createPixelTexture((ctx, s) => {
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#962d22';
    ctx.fillRect(0, 7, s, 2);
    ctx.fillRect(0, 15, s, 1);
    ctx.fillRect(7, 0, 1, 8);
    ctx.fillRect(15, 8, 1, 8);
    ctx.fillStyle = '#d9534f';
    ctx.fillRect(2, 2, 4, 2);
    ctx.fillRect(10, 10, 4, 2);
  }, 18, 6),

  wainscot: createPixelTexture((ctx, s) => {
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#6e441d';
    ctx.fillRect(0, 0, s, 2);
    ctx.fillRect(0, s - 2, s, 2);
    ctx.fillRect(0, 0, 2, s);
    ctx.fillRect(7, 2, 2, s - 4);
    ctx.fillStyle = '#a06b38';
    ctx.fillRect(3, 3, 3, s - 6);
    ctx.fillRect(10, 3, 3, s - 6);
  }, 20, 1),

  stairsStone: createPixelTexture((ctx, s) => {
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#7f8c8d';
    for (let i = 0; i < 12; i++) ctx.fillRect((i * 5) % s, (i * 7) % s, 2, 2);
    ctx.fillStyle = '#bdc3c7';
    for (let i = 0; i < 8; i++) ctx.fillRect((i * 3 + 2) % s, (i * 9 + 1) % s, 2, 2);
  }, 2, 2),

  sand: createPixelTexture((ctx, s) => {
    ctx.fillStyle = '#e0c097';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#d1ae82';
    ctx.fillRect(2, 3, 2, 2);
    ctx.fillRect(11, 7, 2, 2);
    ctx.fillRect(6, 13, 2, 2);
    ctx.fillStyle = '#edd0aa';
    ctx.fillRect(8, 2, 2, 2);
    ctx.fillRect(3, 10, 2, 2);
  }, 35, 20),

  grass: createPixelTexture((ctx, s) => {
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(1, 2, 2, 3);
    ctx.fillRect(9, 6, 2, 3);
    ctx.fillRect(5, 11, 2, 3);
    ctx.fillStyle = '#58d68d';
    ctx.fillRect(12, 1, 2, 2);
    ctx.fillRect(3, 8, 2, 2);
  }, 30, 3),

  leaves: createPixelTexture((ctx, s) => {
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#1e8449';
    ctx.fillRect(0, 0, 6, 6);
    ctx.fillRect(8, 8, 6, 6);
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(4, 4, 5, 5);
    ctx.fillRect(11, 2, 4, 4);
  }, 2, 2)
};

// ==========================================
// 3. Three.js 씬 & 렌더러 설정
// ==========================================
const container = document.getElementById('game-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88dcff);
scene.fog = new THREE.Fog(0x88dcff, 55, 155);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 175);
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.78);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff7e6, 0.72);
sunLight.position.set(25, 52, 35);
sunLight.castShadow = true;
scene.add(sunLight);

// ==========================================
// 4. 벽 투명화(Occlusion) 및 시점별 천장/지붕 표시 관리
// ==========================================
const occludableMeshes = [];
const fadedMeshes = new Set();
const ceilingAndRoofMeshes = [];

function addWallMesh(parent, geo, baseMat, x, y, z, occludable = true) {
  const mat = occludable ? baseMat.clone() : baseMat;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  if (occludable) {
    mesh.userData.baseOpacity = mat.opacity !== undefined ? mat.opacity : 1.0;
    mesh.userData.wasTransparent = mat.transparent || false;
    occludableMeshes.push(mesh);
  }
  return mesh;
}

function addCeilingOrRoofMesh(parent, geo, baseMat, x, y, z) {
  const mesh = new THREE.Mesh(geo, baseMat);
  mesh.position.set(x, y, z);
  mesh.visible = false;
  parent.add(mesh);
  ceilingAndRoofMeshes.push(mesh);
  return mesh;
}

const mats = {
  floor2F: new THREE.MeshLambertMaterial({ map: textures.woodCorridor }),
  floor1F: new THREE.MeshLambertMaterial({ map: textures.woodCorridor }),
  classFloor: new THREE.MeshLambertMaterial({ map: textures.classTile }),
  wall: new THREE.MeshLambertMaterial({ map: textures.wallPlaster }),
  ceiling: new THREE.MeshLambertMaterial({ map: textures.ceilingTile }),
  roof: new THREE.MeshLambertMaterial({ map: textures.roofShingle }),
  wainscot: new THREE.MeshLambertMaterial({ map: textures.wainscot }),
  woodFrame: new THREE.MeshLambertMaterial({ color: 0x5c3a21 }),
  railingWood: new THREE.MeshLambertMaterial({ color: 0x6e472b }),
  railingBar: new THREE.MeshLambertMaterial({ color: 0xd35400 }),
  door: new THREE.MeshLambertMaterial({ color: 0xa0522d }),
  glass: new THREE.MeshLambertMaterial({ color: 0x87cefa, transparent: true, opacity: 0.26, depthWrite: false }),
  chalkboard: new THREE.MeshLambertMaterial({ color: 0x1e5631 }),
  deskTop: new THREE.MeshLambertMaterial({ color: 0xdeb887 }),
  locker: new THREE.MeshLambertMaterial({ color: 0x85c1e9 }),
  stairs: new THREE.MeshLambertMaterial({ map: textures.stairsStone }),
  playground: new THREE.MeshLambertMaterial({ map: textures.sand }),
  whiteLine: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  grass: new THREE.MeshLambertMaterial({ map: textures.grass }),
  treeLeaf: new THREE.MeshLambertMaterial({ map: textures.leaves }),
  goalZone: new THREE.MeshLambertMaterial({ color: 0x2ecc71, transparent: true, opacity: 0.48, depthWrite: false })
};

// ==========================================
// 5. 3D 복셀 연필(Pencil) 모델 생성기
// ==========================================
function createPencilMesh(scale = 1.0) {
  const pencil = new THREE.Group();
  pencil.scale.set(scale, scale, scale);

  const shaft = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.9, 0.22),
    new THREE.MeshLambertMaterial({ color: 0xf1c40f })
  );
  pencil.add(shaft);

  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.9, 0.08),
    new THREE.MeshLambertMaterial({ color: 0xe67e22 })
  );
  pencil.add(stripe);

  const ferrule = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.14, 0.24),
    new THREE.MeshLambertMaterial({ color: 0xbdc3c7 })
  );
  ferrule.position.y = 0.52;
  pencil.add(ferrule);

  const eraser = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.18, 0.22),
    new THREE.MeshLambertMaterial({ color: 0xff9ff3 })
  );
  eraser.position.y = 0.68;
  pencil.add(eraser);

  const woodCone = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.18, 0.16),
    new THREE.MeshLambertMaterial({ color: 0xdeb887 })
  );
  woodCone.position.y = -0.54;
  pencil.add(woodCone);

  const leadTip = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.12, 0.08),
    new THREE.MeshLambertMaterial({ color: 0x222222 })
  );
  leadTip.position.y = -0.69;
  pencil.add(leadTip);

  return pencil;
}

// ==========================================
// 6. 학교 건물, 1인칭 전용 지붕, 2층 계단 안전 난간
// ==========================================
let teacherCharacter = null;

function createClassroom(group, xStart, yFloor, labelText, isGoalRoom = false) {
  const roomWidth = 20;
  const roomDepth = 9;
  const xCenter = xStart + roomWidth / 2;

  const floor = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, 0.4, roomDepth), mats.classFloor);
  floor.position.set(xCenter, yFloor - 0.2, -3 - roomDepth / 2);
  floor.receiveShadow = true;
  group.add(floor);

  addCeilingOrRoofMesh(group, new THREE.BoxGeometry(roomWidth, 0.3, roomDepth), mats.ceiling, xCenter, yFloor + 4.5, -3 - roomDepth / 2);

  addWallMesh(group, new THREE.BoxGeometry(roomWidth, 4.5, 0.4), mats.wall, xCenter, yFloor + 2.25, -12, true);
  addWallMesh(group, new THREE.BoxGeometry(0.4, 4.5, roomDepth), mats.wall, xStart, yFloor + 2.25, -3 - roomDepth / 2, true);
  addWallMesh(group, new THREE.BoxGeometry(0.4, 4.5, roomDepth), mats.wall, xStart + roomWidth, yFloor + 2.25, -3 - roomDepth / 2, true);

  const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.0, 5.2), mats.woodFrame);
  boardFrame.position.set(xStart + 0.28, yFloor + 2.1, -7.5);
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.8, 4.9), mats.chalkboard);
  board.position.set(xStart + 0.32, yFloor + 2.1, -7.5);
  const clock = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.55, 0.55), mats.whiteLine);
  clock.position.set(xStart + 0.32, yFloor + 3.45, -7.5);

  // 교탁 위치를 칠판 앞(xStart + 1.8)으로 배치하여 선생님과 겹치지 않게 공간 확보
  const teacherDesk = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.05, 1.8), mats.woodFrame);
  teacherDesk.position.set(xStart + 1.8, yFloor + 0.52, -7.5);
  group.add(boardFrame, board, clock, teacherDesk);

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      const dx = xStart + 6.2 + row * 3.5;
      const dz = -5.6 - col * 3.1;
      const desk = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.76, 1.45), mats.deskTop);
      desk.position.set(dx, yFloor + 0.38, dz);
      const chair = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.46, 0.68), mats.woodFrame);
      chair.position.set(dx + 0.82, yFloor + 0.23, dz);
      group.add(desk, chair);
    }
  }

  const locker = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.85, 6.6), mats.locker);
  locker.position.set(xStart + roomWidth - 0.75, yFloor + 0.92, -7.5);
  group.add(locker);

  addWallMesh(group, new THREE.BoxGeometry(11.6, 1.2, 0.35), mats.wainscot, xStart + 10, yFloor + 0.6, -3, true);
  addWallMesh(group, new THREE.BoxGeometry(roomWidth, 1.1, 0.35), mats.wall, xCenter, yFloor + 3.95, -3, true);

  const glassPane = new THREE.Mesh(new THREE.BoxGeometry(11.4, 2.2, 0.12), mats.glass);
  glassPane.position.set(xStart + 10, yFloor + 2.3, -3);
  glassPane.renderOrder = 2;
  group.add(glassPane);

  for (let i = 0; i <= 3; i++) {
    addWallMesh(group, new THREE.BoxGeometry(0.24, 2.3, 0.4), mats.woodFrame, xStart + 4.2 + i * 3.86, yFloor + 2.3, -3, true);
  }

  if (isGoalRoom) {
    addWallMesh(group, new THREE.BoxGeometry(2.1, 3.3, 0.18), mats.door, xStart + 4.2, yFloor + 1.65, -2.76, true);
    const welcomeMat = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.06, 4.2), mats.goalZone);
    welcomeMat.position.set(xStart + 2.2, yFloor + 0.04, -4.5);
    welcomeMat.renderOrder = 1;
    group.add(welcomeMat);
  } else {
    addWallMesh(group, new THREE.BoxGeometry(2.2, 3.3, 0.22), mats.door, xStart + 2.1, yFloor + 1.65, -3, true);
  }

  addWallMesh(group, new THREE.BoxGeometry(2.2, 3.3, 0.22), mats.door, xStart + 17.9, yFloor + 1.65, -3, true);
  addWallMesh(group, new THREE.BoxGeometry(1.0, 3.4, 0.35), mats.wall, xStart + 0.5, yFloor + 1.7, -3, true);
  addWallMesh(group, new THREE.BoxGeometry(1.0, 3.4, 0.35), mats.wall, xStart + 19.5, yFloor + 1.7, -3, true);

  const signPlate = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.52, 0.45),
    new THREE.MeshLambertMaterial({ color: isGoalRoom ? 0x2ecc71 : 0x2c3e50 })
  );
  signPlate.position.set(xStart + 2.1, yFloor + 3.6, -2.85);
  group.add(signPlate);
}

// 외벽을 20m 단위로 분할하여 카메라 가림 시 필요한 구간만 깔끔하게 투명화
function createExteriorWindowWall(group, yFloor) {
  for (let xStart = 0; xStart < 60; xStart += 20) {
    const cx = xStart + 10;
    addWallMesh(group, new THREE.BoxGeometry(20, 1.2, 0.35), mats.wainscot, cx, yFloor + 0.6, 3, true);
    addWallMesh(group, new THREE.BoxGeometry(20, 1.0, 0.35), mats.wall, cx, yFloor + 4.0, 3, true);

    const glass = new THREE.Mesh(new THREE.BoxGeometry(19.8, 2.3, 0.1), mats.glass);
    glass.position.set(cx, yFloor + 2.35, 3);
    glass.renderOrder = 2;
    group.add(glass);
  }

  for (let x = 0; x <= 60; x += 5) {
    addWallMesh(group, new THREE.BoxGeometry(0.45, 4.5, 0.45), mats.wall, x, yFloor + 2.25, 3, true);
  }
}

function createCorridorCeilingsAndRoof(group) {
  for (let x = 0; x < 60; x += 15) {
    const cx = x + 7.5;
    addCeilingOrRoofMesh(group, new THREE.BoxGeometry(15, 0.3, 6.2), mats.ceiling, cx, 4.45, 0);
    addCeilingOrRoofMesh(group, new THREE.BoxGeometry(15, 0.3, 6.2), mats.ceiling, cx, 12.45, 0);
    addCeilingOrRoofMesh(group, new THREE.BoxGeometry(15, 0.45, 16.0), mats.roof, cx, 12.8, -4.5);
  }
  addCeilingOrRoofMesh(group, new THREE.BoxGeometry(11.4, 0.45, 6.6), mats.roof, 65.5, 12.6, 0);
}

function createPlayground(group) {
  const ground = new THREE.Mesh(new THREE.BoxGeometry(115, 0.4, 58), mats.playground);
  ground.position.set(32, -0.3, 30);
  ground.receiveShadow = true;
  group.add(ground);

  const grassStrip = new THREE.Mesh(new THREE.BoxGeometry(88, 0.32, 4.2), mats.grass);
  grassStrip.position.set(32, -0.1, 5.1);
  group.add(grassStrip);

  const t1 = new THREE.Mesh(new THREE.BoxGeometry(44, 0.05, 0.35), mats.whiteLine);
  t1.position.set(30, -0.05, 16);
  const t2 = new THREE.Mesh(new THREE.BoxGeometry(44, 0.05, 0.35), mats.whiteLine);
  t2.position.set(30, -0.05, 36);
  group.add(t1, t2);

  [6, 54].forEach((gx) => {
    const postL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.8, 0.25), mats.whiteLine);
    postL.position.set(gx, 1.4, 23);
    const postR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.8, 0.25), mats.whiteLine);
    postR.position.set(gx, 1.4, 29);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 6.25), mats.whiteLine);
    bar.position.set(gx, 2.8, 26);
    group.add(postL, postR, bar);
  });

  for (let x = -4; x <= 68; x += 9) {
    const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.5, 0.85), mats.woodFrame);
    trunk.position.set(x, 1.2, 46);
    const leaves1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.4, 3.2), mats.treeLeaf);
    leaves1.position.set(x, 3.4, 46);
    const leaves2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.6, 2.2), mats.treeLeaf);
    leaves2.position.set(x, 5.0, 46);
    group.add(trunk, leaves1, leaves2);
  }
}

// ==========================================
// 7. 픽셀 복셀 캐릭터 생성 (안전거리 링 렌더링 우선순위 보장)
// ==========================================
function createVoxelPerson({
  shirtColor = 0x3498db,
  pantsColor = 0x2c3e50,
  hairColor = 0x221a15,
  bagColor = 0xe74c3c,
  shoeColor = 0xffffff,
  scale = 1.0,
  isPlayer = false,
  isTeacher = false
}) {
  const group = new THREE.Group();
  group.scale.set(scale, scale, scale);

  const skinMat = new THREE.MeshLambertMaterial({ color: 0xffdfc4 });
  const hairMat = new THREE.MeshLambertMaterial({ color: hairColor });
  const shirtMat = new THREE.MeshLambertMaterial({ color: shirtColor });
  const collarMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const pantsMat = new THREE.MeshLambertMaterial({ color: pantsColor });
  const shoeMat = new THREE.MeshLambertMaterial({ color: shoeColor });
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const blushMat = new THREE.MeshBasicMaterial({ color: 0xff9494 });

  const headGroup = new THREE.Group();
  headGroup.position.y = 1.95;

  const headCube = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.74, 0.74), skinMat);
  headGroup.add(headCube);

  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.8), hairMat);
  hairTop.position.y = 0.31;
  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.62, 0.22), hairMat);
  hairBack.position.set(0, 0.06, -0.32);
  const bangs = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.17, 0.12), hairMat);
  bangs.position.set(0, 0.21, 0.35);
  const sideHairL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.36, 0.24), hairMat);
  sideHairL.position.set(-0.36, 0.08, 0.18);
  const sideHairR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.36, 0.24), hairMat);
  sideHairR.position.set(0.36, 0.08, 0.18);
  headGroup.add(hairTop, hairBack, bangs, sideHairL, sideHairR);

  [-0.16, 0.16].forEach((ex) => {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.05), hairMat);
    brow.position.set(ex, 0.11, 0.36);
    const eyeW = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.05), eyeWhiteMat);
    eyeW.position.set(ex, 0.01, 0.36);
    const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.06), pupilMat);
    pupil.position.set(ex, 0.01, 0.37);
    const blush = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.06, 0.05), blushMat);
    blush.position.set(ex * 1.35, -0.1, 0.36);
    headGroup.add(brow, eyeW, pupil, blush);
  });

  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.05), pupilMat);
  mouth.position.set(0, -0.19, 0.36);
  headGroup.add(mouth);
  group.add(headGroup);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.88, 0.45), shirtMat);
  torso.position.y = 1.16;
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.48), collarMat);
  collar.position.set(0, 1.55, 0);
  group.add(torso, collar);

  if (!isTeacher) {
    const bagMat = new THREE.MeshLambertMaterial({ color: bagColor });
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.68, 0.34), bagMat);
    backpack.position.set(0, 1.18, -0.35);
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.32, 0.1), collarMat);
    pocket.position.set(0, 1.08, -0.53);
    group.add(backpack, pocket);
  }

  function createLeg() {
    const legPivot = new THREE.Group();
    const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.58, 0.33), pantsMat);
    legMesh.position.y = -0.29;
    const shoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.18, 0.42), shoeMat);
    shoeMesh.position.set(0, -0.64, 0.04);
    legPivot.add(legMesh, shoeMesh);
    return legPivot;
  }

  const leftLeg = createLeg();
  leftLeg.position.set(-0.19, 0.72, 0);
  const rightLeg = createLeg();
  rightLeg.position.set(0.19, 0.72, 0);
  group.add(leftLeg, rightLeg);

  function createArm() {
    const armPivot = new THREE.Group();
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.28), shirtMat);
    sleeve.position.y = -0.12;
    const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.42, 0.24), skinMat);
    forearm.position.y = -0.42;
    armPivot.add(sleeve, forearm);
    return armPivot;
  }

  const leftArm = createArm();
  leftArm.position.set(-0.53, 1.52, 0);
  const rightArm = createArm();
  rightArm.position.set(0.53, 1.52, 0);
  group.add(leftArm, rightArm);

  group.userData = { headGroup, leftLeg, rightLeg, leftArm, rightArm, animPhase: Math.random() * 10 };

  if (isPlayer) {
    leftArm.rotation.x = -0.7;
    rightArm.rotation.x = -0.7;

    const crateGroup = new THREE.Group();
    const crateBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, 0.32, 0.56),
      new THREE.MeshLambertMaterial({ color: 0x54a0ff })
    );
    crateGroup.add(crateBox);
    crateGroup.position.set(0, 1.0, 0.56);
    group.add(crateGroup);

    const miniPencils = [];
    for (let i = 0; i < 7; i++) {
      const mini = createPencilMesh(0.38);
      const row = Math.floor(i / 4);
      const col = i % 4;
      mini.position.set(-0.27 + col * 0.18, 0.26, -0.1 + row * 0.2);
      mini.visible = false;
      crateGroup.add(mini);
      miniPencils.push(mini);
    }
    group.userData.miniPencils = miniPencils;
  } else if (!isTeacher) {
    const ringGeo = new THREE.RingGeometry(1.25, 2.15, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2ecc71,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    });
    const safetyRing = new THREE.Mesh(ringGeo, ringMat);
    safetyRing.rotation.x = -Math.PI / 2;
    safetyRing.position.y = 0.06;
    safetyRing.renderOrder = 1;
    group.add(safetyRing);
    group.userData.safetyRing = safetyRing;
  }

  scene.add(group);
  return group;
}

function buildFullSchool() {
  const school = new THREE.Group();

  // 2층 복도 바닥 & 서쪽 끝 벽
  const corr2F = new THREE.Mesh(new THREE.BoxGeometry(60, 0.4, 6), mats.floor2F);
  corr2F.position.set(30, 7.8, 0);
  corr2F.receiveShadow = true;
  school.add(corr2F);
  addWallMesh(school, new THREE.BoxGeometry(0.4, 4.5, 6), mats.wall, 0, 10.25, 0, true);

  // 1층 복도 바닥
  const corr1F = new THREE.Mesh(new THREE.BoxGeometry(71.2, 0.4, 6.2), mats.floor1F);
  corr1F.position.set(35.6, -0.2, 0);
  corr1F.receiveShadow = true;
  school.add(corr1F);
  addWallMesh(school, new THREE.BoxGeometry(0.4, 4.5, 6), mats.wall, 0, 2.25, 0, true);

  // 1층 계단 하부 지지 벽체
  addWallMesh(school, new THREE.BoxGeometry(7.0, 4.0, 2.8), mats.wall, 63.5, 2.0, -1.5, true);
  addWallMesh(school, new THREE.BoxGeometry(4.0, 3.8, 6.0), mats.wall, 69.0, 1.9, 0, true);

  // 교실 6칸 생성
  createClassroom(school, 0, 8, '2-1', false);
  createClassroom(school, 20, 8, '2-2', false);
  createClassroom(school, 40, 8, '2-3', false);

  createClassroom(school, 0, 0, '1-1', true);
  createClassroom(school, 20, 0, '1-2', false);
  createClassroom(school, 40, 0, '1-3', false);

  // 바깥쪽 운동장 창문 벽
  createExteriorWindowWall(school, 8);
  createExteriorWindowWall(school, 0);

  // 복도 천장 및 지붕 생성 (1인칭 전용 표시)
  createCorridorCeilingsAndRoof(school);

  // 동쪽 U자형 계단실 (X = 60 ~ 71)
  for (let i = 0; i < 10; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.4, 2.8), mats.stairs);
    step.position.set(60.35 + i * 0.7, 8.0 - (i + 0.5) * 0.4 - 0.2, -1.5);
    school.add(step);
  }

  const landing = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.4, 6.0), mats.stairs);
  landing.position.set(69.0, 3.8, 0);
  school.add(landing);

  for (let i = 0; i < 10; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.4, 2.8), mats.stairs);
    step.position.set(66.65 - i * 0.7, 4.0 - (i + 0.5) * 0.4 - 0.2, 1.5);
    school.add(step);
  }

  // 2층 계단 안전 난간
  addWallMesh(school, new THREE.BoxGeometry(0.32, 1.35, 3.1), mats.wainscot, 59.95, 8.68, 1.5, true);
  const topRailGuard = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 3.15), mats.railingBar);
  topRailGuard.position.set(59.95, 9.4, 1.5);
  school.add(topRailGuard);

  addWallMesh(school, new THREE.BoxGeometry(7.2, 5.4, 0.32), mats.wainscot, 63.5, 6.4, 0, true);

  for (let i = 0; i <= 4; i++) {
    const px = 60.2 + i * 1.65;
    const py = 8.0 - (i / 4) * 4.0;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.6, 0.38), mats.railingWood);
    post.position.set(px, py + 0.8, 0);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.2, 0.44), mats.railingBar);
    cap.position.set(px, py + 1.65, 0);
    school.add(post, cap);
  }

  // 계단실 외벽
  addWallMesh(school, new THREE.BoxGeometry(0.4, 12.8, 6.4), mats.wall, 71.1, 6.2, 0, true);
  addWallMesh(school, new THREE.BoxGeometry(11.2, 12.8, 0.4), mats.wall, 65.5, 6.2, -3.1, true);
  addWallMesh(school, new THREE.BoxGeometry(11.2, 5.2, 0.4), mats.wainscot, 65.5, 2.4, 3.1, true);

  createPlayground(school);
  scene.add(school);

  // 1-1반 담임 선생님 배치 (교탁 X: 1.8과 겹치지 않는 X: 3.5에 배치)
  teacherCharacter = createVoxelPerson({
    shirtColor: 0xff7675,
    pantsColor: 0x2d3436,
    hairColor: 0x3b2219,
    shoeColor: 0xdfe6e9,
    scale: 1.22,
    isPlayer: false,
    isTeacher: true
  });
  teacherCharacter.position.set(3.5, 0, -6.6);
  teacherCharacter.rotation.y = 0;
}

buildFullSchool();

// 목표 교실 문 앞 회전 화살표 마커
const goalMarkerGroup = new THREE.Group();
const cone = new THREE.Mesh(
  new THREE.ConeGeometry(0.65, 1.15, 4),
  new THREE.MeshBasicMaterial({ color: 0x2ecc71 })
);
cone.rotation.x = Math.PI;
goalMarkerGroup.add(cone);
goalMarkerGroup.position.set(2.1, 2.5, -3.5);
scene.add(goalMarkerGroup);

// 플레이어 생성
const player = createVoxelPerson({
  shirtColor: 0x3498db,
  pantsColor: 0x2c3e50,
  hairColor: 0x1a1110,
  bagColor: 0xe67e22,
  shoeColor: 0xffffff,
  scale: 1.0,
  isPlayer: true
});

// ==========================================
// 8. 엔딩 컷씬 축하 파티클
// ==========================================
const praiseParticles = [];
function spawnPraiseParticles() {
  praiseParticles.forEach((p) => scene.remove(p.mesh));
  praiseParticles.length = 0;

  const colors = [0xff4d4d, 0xf1c40f, 0xff9ff3, 0x2ecc71, 0x54a0ff];
  for (let i = 0; i < 24; i++) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.22, 0.22),
      new THREE.MeshBasicMaterial({ color: colors[i % colors.length] })
    );
    mesh.position.set(
      3.5 + (Math.random() - 0.5) * 3.0,
      1.8 + Math.random() * 1.5,
      -5.7 + (Math.random() - 0.5) * 2.0
    );
    scene.add(mesh);
    praiseParticles.push({
      mesh,
      vy: 1.2 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.8
    });
  }
}

// ==========================================
// 9. 층 높이, 2층 계단 안전 난간 충돌, 정밀 문 통과 판정
// ==========================================
let currentZone = '2F';

function updatePlayerFloorAndBounds(prevPos, pos) {
  if (currentZone === '2F') {
    pos.z = Math.max(-2.35, Math.min(2.35, pos.z));
    pos.x = Math.max(1.0, pos.x);

    if (pos.z >= -0.4) {
      pos.x = Math.min(59.4, pos.x);
    } else if (pos.x >= 60.0) {
      currentZone = 'STAIRS_UPPER';
    }
    pos.y = 8.0;
  } else if (currentZone === 'STAIRS_UPPER') {
    pos.z = Math.max(-2.4, Math.min(-0.48, pos.z));
    if (pos.x < 60.0) {
      currentZone = '2F';
      pos.y = 8.0;
      return;
    }
    if (pos.x >= 67.0) {
      currentZone = 'STAIRS_LANDING';
      pos.y = 4.0;
      return;
    }
    const ratio = Math.max(0, Math.min(1, (pos.x - 60.0) / 7.0));
    pos.y = 8.0 - ratio * 4.0;
  } else if (currentZone === 'STAIRS_LANDING') {
    pos.x = Math.min(70.2, pos.x);
    pos.z = Math.max(-2.4, Math.min(2.4, pos.z));
    pos.y = 4.0;

    if (pos.x < 67.0) {
      if (pos.z < -0.35) {
        currentZone = 'STAIRS_UPPER';
      } else if (pos.z > 0.35) {
        currentZone = 'STAIRS_LOWER';
      } else {
        pos.x = 67.0;
      }
    }
  } else if (currentZone === 'STAIRS_LOWER') {
    pos.z = Math.max(0.48, Math.min(2.4, pos.z));
    if (pos.x >= 67.0) {
      currentZone = 'STAIRS_LANDING';
      pos.y = 4.0;
      return;
    }
    if (pos.x < 60.0) {
      currentZone = '1F';
      pos.y = 0.0;
      return;
    }
    const ratio = Math.max(0, Math.min(1, (pos.x - 60.0) / 7.0));
    pos.y = ratio * 4.0;
  } else if (currentZone === '1F') {
    if (pos.x >= 60.0 && pos.z > 0.4) {
      currentZone = 'STAIRS_LOWER';
      return;
    }
    pos.x = Math.max(1.0, Math.min(60.0, pos.x));
    pos.z = Math.min(2.35, pos.z);

    const inDoorwayX = pos.x >= 1.25 && pos.x <= 3.05;

    if (prevPos.z >= -2.35) {
      if (!inDoorwayX && pos.z < -2.35) {
        pos.z = -2.35;
      }
    } else {
      pos.x = Math.max(1.2, Math.min(5.2, pos.x));
      pos.z = Math.max(-8.5, pos.z);
      if (!inDoorwayX && pos.z > -2.55) {
        pos.z = -2.55;
      }
    }
    pos.y = 0.0;
  }
}

// ==========================================
// 10. 연필 7자루, 친구들, 물웅덩이 배치
// ==========================================
let friends = [];
let pencils = [];
let puddles = [];

function clearEntities() {
  friends.forEach((f) => scene.remove(f.mesh));
  pencils.forEach((p) => scene.remove(p.mesh));
  puddles.forEach((p) => scene.remove(p.mesh));
  friends = [];
  pencils = [];
  puddles = [];
}

function initEntities() {
  clearEntities();

  const pencilCoords = [
    { x: 14, y: 8, z: -1.0 },
    { x: 30, y: 8, z: 1.2 },
    { x: 48, y: 8, z: -0.8 },
    { x: 69, y: 4, z: 0.0 },
    { x: 46, y: 0, z: 1.0 },
    { x: 28, y: 0, z: -1.1 },
    { x: 11, y: 0, z: 0.8 }
  ];

  pencilCoords.forEach((c) => {
    const holder = new THREE.Group();
    const pencilMesh = createPencilMesh(1.1);
    pencilMesh.rotation.z = 0.35;
    holder.add(pencilMesh);
    holder.position.set(c.x, c.y + 1.05, c.z);
    scene.add(holder);
    pencils.push({ mesh: holder, baseY: c.y + 1.05, collected: false });
  });

  const friendConfigs = [
    { x: 18, minX: 15, maxX: 21, y: 8, vx: 1.4, vz: 2.1, shirt: 0xe67e22, bag: 0x3498db },
    { x: 35, minX: 32, maxX: 38, y: 8, vx: -1.5, vz: -2.3, shirt: 0x9b59b6, bag: 0xf1c40f },
    { x: 52, minX: 49, maxX: 55, y: 8, vx: 1.3, vz: 2.0, shirt: 0xe74c3c, bag: 0x2ecc71 },
    { x: 50, minX: 47, maxX: 53, y: 0, vx: -1.4, vz: -2.2, shirt: 0x1abc9c, bag: 0xe67e22 },
    { x: 36, minX: 33, maxX: 39, y: 0, vx: 1.6, vz: 2.4, shirt: 0xf1c40f, bag: 0x9b59b6 },
    { x: 22, minX: 19, maxX: 25, y: 0, vx: -1.3, vz: -2.1, shirt: 0xe84393, bag: 0x3498db },
    { x: 9,  minX: 7,  maxX: 12, y: 0, vx: 1.2, vz: 1.9, shirt: 0x2ecc71, bag: 0xe74c3c }
  ];

  friendConfigs.forEach((fc, idx) => {
    const mesh = createVoxelPerson({
      shirtColor: fc.shirt,
      pantsColor: 0x34495e,
      hairColor: idx % 2 === 0 ? 0x2c1b18 : 0x4a3222,
      bagColor: fc.bag,
      shoeColor: 0xecf0f1,
      isPlayer: false
    });
    mesh.position.set(fc.x, fc.y, idx % 2 === 0 ? -1.1 : 1.1);
    friends.push({
      mesh,
      minX: fc.minX,
      maxX: fc.maxX,
      vx: fc.vx,
      vz: fc.vz,
      cooldown: 0
    });
  });

  const puddleCoords = [
    { x: 24, y: 8, z: 0.9 },
    { x: 43, y: 8, z: -1.0 },
    { x: 41, y: 0, z: -0.9 },
    { x: 16, y: 0, z: 1.1 }
  ];
  const puddleMat = new THREE.MeshLambertMaterial({
    color: 0x00a8ff,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });
  puddleCoords.forEach((pc) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.05, 16), puddleMat);
    mesh.position.set(pc.x, pc.y + 0.04, pc.z);
    mesh.renderOrder = 1;
    scene.add(mesh);
    puddles.push({ mesh, cooldown: 0 });
  });
}

// ==========================================
// 11. 키보드(WASD/방향키 공통 + Shift 빠른 걸음) & 조이스틱(최대 바깥 빠른 걸음)
// ==========================================
const keys = {
  ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
  KeyW: false, KeyS: false, KeyA: false, KeyD: false,
  ShiftLeft: false, ShiftRight: false,
  KeyQ: false, KeyE: false
};
window.addEventListener('keydown', (e) => { if (keys.hasOwnProperty(e.code)) keys[e.code] = true; });
window.addEventListener('keyup', (e) => { if (keys.hasOwnProperty(e.code)) keys[e.code] = false; });

const joystickZone = document.getElementById('joystick-zone');
const joystickKnob = document.getElementById('joystick-knob');
let joyState = { active: false, id: null, dx: 0, dy: 0, mag: 0 };

function updateJoystick(clientX, clientY) {
  const rect = joystickZone.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const maxR = rect.width / 2 - 20;

  let dx = clientX - cx;
  let dy = clientY - cy;
  const dist = Math.hypot(dx, dy);
  if (dist > maxR) {
    dx = (dx / dist) * maxR;
    dy = (dy / dist) * maxR;
  }
  joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  joyState.dx = dx / maxR;
  joyState.dy = dy / maxR;
  joyState.mag = Math.min(1.0, dist / maxR);

  if (joyState.mag >= 0.85) {
    joystickKnob.style.background = 'rgba(255, 118, 40, 0.95)';
  } else {
    joystickKnob.style.background = 'rgba(241, 196, 15, 0.92)';
  }
}

function resetJoystick() {
  joyState.active = false;
  joyState.id = null;
  joyState.dx = 0;
  joyState.dy = 0;
  joyState.mag = 0;
  joystickKnob.style.transform = 'translate(-50%, -50%)';
  joystickKnob.style.background = 'rgba(241, 196, 15, 0.92)';
}

joystickZone.addEventListener('pointerdown', (e) => {
  joyState.active = true;
  joyState.id = e.pointerId;
  joystickZone.setPointerCapture(e.pointerId);
  updateJoystick(e.clientX, e.clientY);
});
joystickZone.addEventListener('pointermove', (e) => {
  if (joyState.active && e.pointerId === joyState.id) {
    updateJoystick(e.clientX, e.clientY);
  }
});
joystickZone.addEventListener('pointerup', resetJoystick);
joystickZone.addEventListener('pointercancel', resetJoystick);

const camTouchZone = document.getElementById('camera-touch-zone');
let lookDrag = { active: false, id: null, lastX: 0, lastY: 0 };

camTouchZone.addEventListener('pointerdown', (e) => {
  lookDrag.active = true;
  lookDrag.id = e.pointerId;
  lookDrag.lastX = e.clientX;
  lookDrag.lastY = e.clientY;
  camTouchZone.setPointerCapture(e.pointerId);
});
camTouchZone.addEventListener('pointermove', (e) => {
  if (lookDrag.active && e.pointerId === lookDrag.id) {
    const deltaX = e.clientX - lookDrag.lastX;
    const deltaY = e.clientY - lookDrag.lastY;
    lookDrag.lastX = e.clientX;
    lookDrag.lastY = e.clientY;
    gameState.cameraYaw -= deltaX * 0.0075;
    gameState.cameraPitch = Math.max(0.15, Math.min(1.15, gameState.cameraPitch + deltaY * 0.005));
  }
});
camTouchZone.addEventListener('pointerup', () => { lookDrag.active = false; });
camTouchZone.addEventListener('pointercancel', () => { lookDrag.active = false; });

const camModes = [
  { name: '기본', dist: 6.2, height: 3.3 },
  { name: '멀리', dist: 9.2, height: 5.5 },
  { name: '1인칭', dist: 0.1, height: 2.1 }
];
let camModeIdx = 0;
const camModeBtn = document.getElementById('cam-mode-btn');
camModeBtn.addEventListener('click', () => {
  camModeIdx = (camModeIdx + 1) % camModes.length;
  camModeBtn.textContent = `📷 시점: ${camModes[camModeIdx].name}`;
});

// ==========================================
// 12. 게임 상태, 음성 안내, 넘어짐 모션, 엔딩 컷씬 연출
// ==========================================
let gameState = {
  phase: 'TITLE',
  lives: 3,
  pencilCount: 0,
  startTime: 0,
  clearTime: '0.0',
  stunTimer: 0,
  slipTimer: 0,
  cutsceneTimer: 0,
  warnSoundCooldown: 0,
  cameraYaw: Math.PI / 2,
  cameraPitch: 0.42
};

const livesDisplay = document.getElementById('lives-display');
const floorDisplay = document.getElementById('floor-display');
const walkModeDisplay = document.getElementById('walk-mode-display');
const pencilDisplay = document.getElementById('pencil-display');
const timeDisplay = document.getElementById('time-display');
const alertBanner = document.getElementById('distance-alert');
const damageFlash = document.getElementById('damage-flash');
const cutsceneDialogue = document.getElementById('cutscene-dialogue');

function updateHUD() {
  livesDisplay.textContent = '❤️'.repeat(Math.max(0, gameState.lives)) + '🖤'.repeat(Math.max(0, 3 - gameState.lives));
  pencilDisplay.textContent = `${gameState.pencilCount} / 7`;

  if (currentZone === '2F') floorDisplay.textContent = '2층 복도';
  else if (currentZone.startsWith('STAIRS')) floorDisplay.textContent = '계단 이동 중';
  else if (player.position.z < -2.4) floorDisplay.textContent = '1-1반 교실 안!';
  else floorDisplay.textContent = '1층 복도';

  if (player.userData.miniPencils) {
    player.userData.miniPencils.forEach((p, idx) => {
      p.visible = idx < gameState.pencilCount;
    });
  }
}

function triggerFall(reason) {
  gameState.lives--;
  gameState.stunTimer = 1.35;
  sound.playFall();
  updateHUD();

  damageFlash.style.opacity = '1';
  setTimeout(() => { damageFlash.style.opacity = '0'; }, 320);

  alertBanner.style.background = 'rgba(231, 76, 60, 0.95)';
  alertBanner.textContent = `💥 앗! ${reason} (남은 하트: ${gameState.lives}개)`;

  if (gameState.lives <= 0) {
    gameState.phase = 'GAMEOVER_FALL';
    sound.stopBGM();
    sound.speak('앗, 친구와 세 번 부딪혀서 넘어졌어요. 다음에는 안전거리를 지키며 천천히 걸어봐요!');
  }
}

function startEndingCutscene() {
  gameState.phase = 'CUTSCENE';
  gameState.cutsceneTimer = 5.2;
  gameState.clearTime = ((performance.now() - gameState.startTime) / 1000).toFixed(1);
  sound.stopBGM();
  sound.playFanfare();
  sound.speak('와아! 친구들과 안전거리를 잘 유지했어요! 연필 일곱 자루를 모두 안전하게 배달했구나, 정말 칭찬해요!');

  // 교탁(X: 1.8, Z: -7.5)과 겹치지 않는 교실 중앙 빈 공간(X: 3.5)에서 선생님과 마주 보도록 배치
  player.visible = true;
  player.position.set(3.5, 0, -4.8);
  player.rotation.set(0, Math.PI, 0);

  teacherCharacter.position.set(3.5, 0, -6.6);
  teacherCharacter.rotation.set(0, 0, 0);

  cutsceneDialogue.classList.remove('hidden');
  alertBanner.style.background = 'rgba(46, 204, 113, 0.95)';
  alertBanner.textContent = '🎉 1-1반 연필 배달 완료! 선생님께서 칭찬해 주십니다!';
  spawnPraiseParticles();
}

document.getElementById('title-next-btn').addEventListener('click', () => {
  sound.init();
  document.getElementById('title-screen').classList.add('hidden');
  document.getElementById('guide-screen').classList.remove('hidden');
  gameState.phase = 'GUIDE';
  sound.speak('안전거리 지킴이 게임에 오신 것을 환영해요! 게임 방법과 조작법을 확인한 뒤 배달 출발하기 버튼을 눌러주세요.');
});

function startGame() {
  initEntities();
  praiseParticles.forEach((p) => scene.remove(p.mesh));
  praiseParticles.length = 0;

  currentZone = '2F';
  player.position.set(4, 8, 0);
  player.rotation.set(0, Math.PI / 2, 0);
  player.visible = true;

  teacherCharacter.position.set(3.5, 0, -6.6);
  teacherCharacter.rotation.set(0, 0, 0);

  gameState.phase = 'PLAYING';
  gameState.lives = 3;
  gameState.pencilCount = 0;
  gameState.startTime = performance.now();
  gameState.stunTimer = 0;
  gameState.slipTimer = 0;
  gameState.cameraYaw = Math.PI / 2;
  gameState.cameraPitch = 0.42;

  cutsceneDialogue.classList.add('hidden');
  document.getElementById('title-screen').classList.add('hidden');
  document.getElementById('guide-screen').classList.add('hidden');
  document.getElementById('end-screen').classList.add('hidden');
  updateHUD();
  sound.startBGM();

  sound.speak('출발! 친구들과 안전거리를 유지하며 복도에 있는 연필 일곱 자루를 모아 일층 교실로 배달해 주세요!');
}

function showEndModal(isWin, message) {
  gameState.phase = 'ENDED';
  cutsceneDialogue.classList.add('hidden');

  const endScreen = document.getElementById('end-screen');
  const endTitle = document.getElementById('end-title');
  const endMessage = document.getElementById('end-message');

  endScreen.classList.remove('hidden');
  if (isWin) {
    endTitle.textContent = '🎉 연필 안전 배달 성공! 🎉';
    endTitle.style.color = '#2ecc71';
    endMessage.innerHTML = `${message}<br>기록: ${gameState.clearTime}초 (남은 하트: ${gameState.lives}개)`;
  } else {
    endTitle.textContent = '😢 넘어져서 연필을 떨어뜨렸어요!';
    endTitle.style.color = '#e74c3c';
    endMessage.textContent = message;
  }
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

// ==========================================
// 13. 캐릭터 애니메이션 (기본 걸음 WALK / 빠른 걸음 FAST_WALK 구분)
// ==========================================
function animateCharacter(charMesh, dt, mode, isPlayer = false) {
  const data = charMesh.userData;

  if (mode === 'FALL') {
    charMesh.rotation.x = THREE.MathUtils.lerp(charMesh.rotation.x, -Math.PI / 2.1, dt * 10);
    data.animPhase += dt * 18;
    data.leftLeg.rotation.x = Math.sin(data.animPhase) * 0.5;
    data.rightLeg.rotation.x = -Math.sin(data.animPhase) * 0.5;
    return;
  }

  if (mode === 'SLIP') {
    data.animPhase += dt * 26;
    charMesh.rotation.x = 0.42 * Math.sin(data.animPhase * 0.7);
    charMesh.rotation.z = 0.35 * Math.cos(data.animPhase);
    data.leftLeg.rotation.x = Math.sin(data.animPhase) * 1.1;
    data.rightLeg.rotation.x = -Math.sin(data.animPhase) * 1.1;
    data.leftArm.rotation.z = 0.7 + Math.sin(data.animPhase) * 0.5;
    data.rightArm.rotation.z = -0.7 - Math.sin(data.animPhase) * 0.5;
    return;
  }

  charMesh.rotation.x = THREE.MathUtils.lerp(charMesh.rotation.x, 0, dt * 12);
  charMesh.rotation.z = THREE.MathUtils.lerp(charMesh.rotation.z, 0, dt * 12);
  data.leftArm.rotation.z = 0;
  data.rightArm.rotation.z = 0;

  if (mode === 'CLAP') {
    data.animPhase += dt * 14;
    data.leftArm.rotation.x = -1.2;
    data.rightArm.rotation.x = -1.2;
    data.leftArm.rotation.y = 0.35 + Math.sin(data.animPhase) * 0.35;
    data.rightArm.rotation.y = -0.35 - Math.sin(data.animPhase) * 0.35;
    data.headGroup.rotation.z = Math.sin(data.animPhase * 0.5) * 0.12;
    return;
  }

  if (mode === 'CHEER') {
    data.animPhase += dt * 12;
    charMesh.position.y = Math.abs(Math.sin(data.animPhase)) * 0.35;
    data.leftLeg.rotation.x = 0;
    data.rightLeg.rotation.x = 0;
    return;
  }

  if (mode === 'IDLE') {
    data.leftLeg.rotation.x = 0;
    data.rightLeg.rotation.x = 0;
    if (!isPlayer) {
      data.leftArm.rotation.x = 0;
      data.rightArm.rotation.x = 0;
    } else {
      data.leftArm.rotation.x = -0.7;
      data.rightArm.rotation.x = -0.7;
    }
    return;
  }

  if (mode === 'WALK' || mode === 'FAST_WALK') {
    const isFast = mode === 'FAST_WALK';
    data.animPhase += dt * (isFast ? 14.5 : 9.5);
    const swing = Math.sin(data.animPhase) * (isFast ? 0.72 : 0.48);
    data.leftLeg.rotation.x = swing;
    data.rightLeg.rotation.x = -swing;
    if (!isPlayer) {
      data.leftArm.rotation.x = -swing * 0.7;
      data.rightArm.rotation.x = swing * 0.7;
    } else {
      data.leftArm.rotation.x = -0.7 + swing * 0.18;
      data.rightArm.rotation.x = -0.7 - swing * 0.18;
    }
  }
}

// ==========================================
// 14. 시점별 지붕/천장 투명 처리 및 벽 가림 투명화 (depthWrite 제어 포함)
// ==========================================
const raycaster = new THREE.Raycaster();

function updateVisibilityAndWallTransparency() {
  fadedMeshes.forEach((mesh) => {
    mesh.material.opacity = mesh.userData.baseOpacity;
    mesh.material.transparent = mesh.userData.wasTransparent;
    mesh.material.depthWrite = !mesh.userData.wasTransparent;
    mesh.renderOrder = mesh.userData.wasTransparent ? 2 : 0;
  });
  fadedMeshes.clear();

  const isFirstPerson = camModes[camModeIdx].name === '1인칭' && gameState.phase === 'PLAYING';
  player.visible = !isFirstPerson;

  ceilingAndRoofMeshes.forEach((mesh) => {
    mesh.visible = isFirstPerson;
  });

  if (isFirstPerson) return;

  const targetPoints = [
    new THREE.Vector3(player.position.x, player.position.y + 0.9, player.position.z),
    new THREE.Vector3(player.position.x, player.position.y + 1.9, player.position.z)
  ];

  targetPoints.forEach((pt) => {
    const dir = pt.clone().sub(camera.position);
    const dist = dir.length();
    if (dist < 0.2) return;
    dir.normalize();

    raycaster.set(camera.position, dir);
    raycaster.far = dist - 0.3;

    const hits = raycaster.intersectObjects(occludableMeshes, false);
    hits.forEach((hit) => {
      const m = hit.object;
      m.material.transparent = true;
      m.material.opacity = 0.18;
      m.material.depthWrite = false;
      m.renderOrder = 2;
      fadedMeshes.add(m);
    });
  });
}

// ==========================================
// 15. 메인 게임 루프
// ==========================================
let lastTime = performance.now();

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  goalMarkerGroup.rotation.y += 2.2 * dt;
  goalMarkerGroup.position.y = 2.4 + Math.sin(now * 0.005) * 0.22;

  if (keys.KeyQ) gameState.cameraYaw += 2.0 * dt;
  if (keys.KeyE) gameState.cameraYaw -= 2.0 * dt;

  if (gameState.phase === 'PLAYING') {
    timeDisplay.textContent = ((now - gameState.startTime) / 1000).toFixed(1);
    if (gameState.warnSoundCooldown > 0) gameState.warnSoundCooldown -= dt;

    const prevPos = player.position.clone();

    if (gameState.stunTimer > 0) {
      gameState.stunTimer -= dt;
      animateCharacter(player, dt, 'FALL', true);
    } else if (gameState.slipTimer > 0) {
      gameState.slipTimer -= dt;
      const slipFwdX = Math.sin(player.rotation.y);
      const slipFwdZ = Math.cos(player.rotation.y);
      player.position.x += slipFwdX * 8.8 * dt;
      player.position.z += slipFwdZ * 8.8 * dt;
      updatePlayerFloorAndBounds(prevPos, player.position);
      animateCharacter(player, dt, 'SLIP', true);
    } else {
      let kbFwd = 0;
      let kbRight = 0;

      if (keys.ArrowUp || keys.KeyW) kbFwd += 1;
      if (keys.ArrowDown || keys.KeyS) kbFwd -= 1;
      if (keys.ArrowRight || keys.KeyD) kbRight += 1;
      if (keys.ArrowLeft || keys.KeyA) kbRight -= 1;

      const kbActive = Math.hypot(kbFwd, kbRight) > 0.01;
      const joyActive = joyState.active && joyState.mag > 0.1;

      const isShiftHeld = keys.ShiftLeft || keys.ShiftRight;
      const isJoyMaxOuter = joyState.active && joyState.mag >= 0.85;
      const isFastWalk = (kbActive && isShiftHeld) || isJoyMaxOuter;

      if (isFastWalk) {
        walkModeDisplay.textContent = '🏃 빠른 걸음!';
        walkModeDisplay.className = 'speed-fast';
      } else {
        walkModeDisplay.textContent = '🚶 기본 걸음';
        walkModeDisplay.className = 'speed-normal';
      }

      const normalSpeed = 5.6;
      const fastSpeed = 9.2;
      const moveSpeed = isFastWalk ? fastSpeed : normalSpeed;

      let dirF = 0;
      let dirR = 0;

      if (kbActive) {
        dirF = kbFwd;
        dirR = kbRight;
      } else if (joyActive) {
        dirF = -joyState.dy;
        dirR = joyState.dx;
      }

      const dirLen = Math.hypot(dirF, dirR);
      if (dirLen > 0.01) {
        const normF = dirF / dirLen;
        const normR = dirR / dirLen;

        const fwdX = Math.sin(gameState.cameraYaw);
        const fwdZ = Math.cos(gameState.cameraYaw);
        const rightX = -fwdZ;
        const rightZ = fwdX;

        const moveX = (fwdX * normF + rightX * normR) * moveSpeed * dt;
        const moveZ = (fwdZ * normF + rightZ * normR) * moveSpeed * dt;

        player.position.x += moveX;
        player.position.z += moveZ;
        player.rotation.y = Math.atan2(moveX, moveZ);

        updatePlayerFloorAndBounds(prevPos, player.position);
        animateCharacter(player, dt, isFastWalk ? 'FAST_WALK' : 'WALK', true);
      } else {
        updatePlayerFloorAndBounds(prevPos, player.position);
        animateCharacter(player, dt, 'IDLE', true);
      }
    }

    // 연필 획득 체크
    pencils.forEach((p, idx) => {
      if (!p.collected) {
        p.mesh.rotation.y += 2.6 * dt;
        p.mesh.position.y = p.baseY + Math.sin(now * 0.005 + idx) * 0.12;
        if (player.position.distanceTo(p.mesh.position) < 1.4) {
          p.collected = true;
          p.mesh.visible = false;
          gameState.pencilCount++;
          sound.playPencil();
          updateHUD();
        }
      }
    });

    // 물웅덩이 미끄러짐 체크
    puddles.forEach((p) => {
      if (p.cooldown > 0) p.cooldown -= dt;
      if (Math.abs(player.position.y - p.mesh.position.y) < 1.5) {
        const dist = Math.hypot(player.position.x - p.mesh.position.x, player.position.z - p.mesh.position.z);
        if (dist < 1.15 && p.cooldown <= 0 && gameState.stunTimer <= 0 && gameState.slipTimer <= 0) {
          p.cooldown = 2.2;
          gameState.slipTimer = 0.68;
          sound.playSlip();
          alertBanner.style.background = 'rgba(52, 152, 219, 0.94)';
          alertBanner.textContent = '💧 미끄덩~! 물웅덩이를 밟아 휘청거렸어요!';
        }
      }
    });

    // 친구 이동 및 안전거리 링 판정
    let closestState = 'safe';
    friends.forEach((f) => {
      if (f.cooldown > 0) f.cooldown -= dt;

      f.mesh.position.x += f.vx * dt;
      f.mesh.position.z += f.vz * dt;

      if (f.mesh.position.x >= f.maxX) {
        f.mesh.position.x = f.maxX;
        f.vx = -Math.abs(f.vx);
      } else if (f.mesh.position.x <= f.minX) {
        f.mesh.position.x = f.minX;
        f.vx = Math.abs(f.vx);
      }

      if (f.mesh.position.z >= 1.8) {
        f.mesh.position.z = 1.8;
        f.vz = -Math.abs(f.vz);
      } else if (f.mesh.position.z <= -1.8) {
        f.mesh.position.z = -1.8;
        f.vz = Math.abs(f.vz);
      }

      f.mesh.rotation.y = Math.atan2(f.vx, f.vz);
      animateCharacter(f.mesh, dt, 'WALK', false);

      const ring = f.mesh.userData.safetyRing;
      if (Math.abs(player.position.y - f.mesh.position.y) < 2.0) {
        const dist = Math.hypot(player.position.x - f.mesh.position.x, player.position.z - f.mesh.position.z);
        if (dist < 1.05 && f.cooldown <= 0 && gameState.stunTimer <= 0) {
          f.cooldown = 2.0;
          ring.material.color.setHex(0xe74c3c);
          closestState = 'danger';
          triggerFall('친구와 안전거리를 지키지 못해 부딪혔어요!');
        } else if (dist < 2.65) {
          ring.material.color.setHex(0xf1c40f);
          if (closestState !== 'danger') closestState = 'caution';
        } else {
          ring.material.color.setHex(0x2ecc71);
        }
      } else {
        ring.material.color.setHex(0x2ecc71);
      }
    });

    if (gameState.stunTimer <= 0 && gameState.slipTimer <= 0 && gameState.phase === 'PLAYING') {
      if (closestState === 'caution') {
        alertBanner.style.background = 'rgba(243, 156, 18, 0.94)';
        alertBanner.textContent = '🟡 주의! 친구와 가까워졌어요. 노란색 링 밖으로 비켜 걸어요!';
        if (gameState.warnSoundCooldown <= 0) {
          sound.playWarning();
          gameState.warnSoundCooldown = 0.6;
        }
      } else if (closestState === 'safe') {
        alertBanner.style.background = 'rgba(46, 204, 113, 0.88)';
        alertBanner.textContent = '🟢 안전거리 유지 중 (초록 링 밖으로 걸어요)';
      }
    }

    updateHUD();

    // 1층 1-1반 교실 안쪽(Z < -3.8) 도착 시 엔딩 컷씬 트리거
    if (currentZone === '1F' && player.position.z < -3.8) {
      if (gameState.pencilCount >= 7) {
        startEndingCutscene();
      } else {
        player.position.z = -2.6;
        alertBanner.style.background = 'rgba(231, 76, 60, 0.95)';
        alertBanner.textContent = `✏️ 연필이 아직 ${7 - gameState.pencilCount}자루 부족해요! 복도에서 남은 연필을 찾아오세요!`;
        sound.speak(`연필이 아직 ${7 - gameState.pencilCount}자루 부족해요!`);
      }
    }
  } else if (gameState.phase === 'GAMEOVER_FALL') {
    gameState.stunTimer -= dt;
    animateCharacter(player, dt, 'FALL', true);
    if (gameState.stunTimer <= 0) {
      showEndModal(false, '친구와 3번 부딪혀 넘어졌어요. 다음에는 노란 링이 보일 때 미리 안전거리를 두고 비켜 걸어봐요!');
    }
  } else if (gameState.phase === 'CUTSCENE') {
    gameState.cutsceneTimer -= dt;
    animateCharacter(teacherCharacter, dt, 'CLAP', false);
    animateCharacter(player, dt, 'CHEER', true);

    praiseParticles.forEach((p) => {
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.x += p.vx * dt;
      p.mesh.rotation.y += 4 * dt;
      p.mesh.rotation.x += 3 * dt;
      if (p.mesh.position.y > 4.2) p.mesh.position.y = 1.6;
    });

    if (gameState.cutsceneTimer <= 0) {
      showEndModal(true, '연필 7자루를 모두 모아 선생님께 칭찬받으며 1-1반 교실까지 안전하게 배달했어요!');
    }
  }

  // 카메라 위치 업데이트
  if (gameState.phase === 'CUTSCENE') {
    const cutCamPos = new THREE.Vector3(5.6, 2.3, -3.9);
    camera.position.lerp(cutCamPos, dt * 5);
    camera.lookAt(3.2, 1.4, -5.9);
  } else {
    const mode = camModes[camModeIdx];
    if (mode.name === '1인칭') {
      camera.position.set(player.position.x, player.position.y + 2.05, player.position.z);
      const lookX = player.position.x + Math.sin(gameState.cameraYaw) * 5.0;
      const lookY = player.position.y + 2.0 - (gameState.cameraPitch - 0.42) * 3.0;
      const lookZ = player.position.z + Math.cos(gameState.cameraYaw) * 5.0;
      camera.lookAt(lookX, lookY, lookZ);
    } else {
      const horizDist = mode.dist * Math.cos(gameState.cameraPitch * 0.5);
      const vertHeight = mode.height + mode.dist * Math.sin(gameState.cameraPitch * 0.6);

      const targetCamX = player.position.x - Math.sin(gameState.cameraYaw) * horizDist;
      const targetCamY = player.position.y + vertHeight;
      const targetCamZ = player.position.z - Math.cos(gameState.cameraYaw) * horizDist;

      camera.position.x += (targetCamX - camera.position.x) * 0.18;
      camera.position.y += (targetCamY - camera.position.y) * 0.18;
      camera.position.z += (targetCamZ - camera.position.z) * 0.18;

      camera.lookAt(player.position.x, player.position.y + 1.35, player.position.z);
    }
  }

  updateVisibilityAndWallTransparency();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

requestAnimationFrame(animate);
/**
 * Shared ISS Deep Space Intro & Real 3D Globe Launcher for IPAS Games.
 * Provides animated 3D starfield warp, cosmic Web Audio effects, and NASA Blue Marble 3D Earth.
 */
(function (global) {
  'use strict';

  let introAudioCtx = null;
  function getCtx() {
    if (!introAudioCtx && (global.AudioContext || global.webkitAudioContext)) {
      introAudioCtx = new (global.AudioContext || global.webkitAudioContext)();
    }
    if (introAudioCtx && introAudioCtx.state === 'suspended') {
      introAudioCtx.resume().catch(() => {});
    }
    return introAudioCtx;
  }

  function makeFallbackEarthCanvas() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#E0F2FE');
    grad.addColorStop(0.18, '#0369A1');
    grad.addColorStop(0.5, '#0284C7');
    grad.addColorStop(0.82, '#0369A1');
    grad.addColorStop(1, '#F8FAFC');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = '#22C55E';
    [[120, 90, 42, 36], [150, 165, 28, 48], [280, 75, 32, 22], [285, 145, 38, 45], [380, 95, 62, 38], [418, 175, 28, 20]]
      .forEach(([x, y, rx, ry]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0.12, 0, Math.PI * 2);
        ctx.fill();
      });
    return new THREE.CanvasTexture(c);
  }

  /**
   * Mounts a real rotating NASA Blue Marble 3D Earth inside any circular space container.
   */
  function mountRealGlobe(container, options = {}) {
    if (!container || typeof THREE === 'undefined' || !global.PKBM_EARTH) return null;

    container.innerHTML = '';
    const size = Math.max(200, container.clientWidth || options.size || 320);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      return null;
    }

    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    renderer.setSize(size, size);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    camera.position.set(0, 0.25, 9.4);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xE0F2FE, 0.85));
    scene.add(new THREE.HemisphereLight(0xF0F9FF, 0x090D16, 0.52));
    const sun = new THREE.DirectionalLight(0xFFFBEB, 1.45);
    sun.position.set(8, 5, 9);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x38BDF8, 0.5);
    rim.position.set(-9, -4, -8);
    scene.add(rim);

    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = THREE.MathUtils.degToRad(23.5);
    scene.add(tiltGroup);

    const bundle = global.PKBM_EARTH.createRealisticEarthGroup({
      radius: 2.38,
      renderer,
      textureBasePath: options.textureBasePath || '../assets/textures/',
      fallbackTexture: makeFallbackEarthCanvas()
    });
    bundle.earthMesh.rotation.y = options.initialRotY !== undefined ? options.initialRotY : 3.05;
    tiltGroup.add(bundle.group);

    let destroyed = false;
    function loop() {
      if (destroyed) return;
      requestAnimationFrame(loop);

      const visible = container.offsetParent !== null && (!options.isActiveFn || options.isActiveFn());
      if (!visible) return;

      const warping = options.isWarpingFn ? options.isWarpingFn() : false;
      bundle.earthMesh.rotation.y += warping ? 0.032 : 0.0032;
      if (bundle.cloudMesh) bundle.cloudMesh.rotation.y += warping ? 0.015 : 0.001;
      renderer.render(scene, camera);
    }
    loop();

    function handleResize() {
      if (destroyed) return;
      const w = container.clientWidth;
      if (w > 40) renderer.setSize(w, w);
    }
    global.addEventListener('resize', handleResize);

    return {
      renderer,
      earthMesh: bundle.earthMesh,
      resize: handleResize,
      destroy() {
        destroyed = true;
        global.removeEventListener('resize', handleResize);
        renderer.dispose();
      }
    };
  }

  function injectStyles() {
    if (document.getElementById('pkbm-space-intro-css')) return;
    const style = document.createElement('style');
    style.id = 'pkbm-space-intro-css';
    style.textContent = `
      body.pkbm-space-lock { overflow: hidden !important; }
      #pkbm-space-overlay {
        position: fixed; inset: 0; z-index: 9999; background: #0B0F19; color: #F8FAFC;
        display: flex; flex-direction: column; justify-content: space-between;
        overflow-y: auto; overflow-x: hidden; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      }
      #pkbm-space-canvas {
        position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;
      }
      #pkbm-warp-overlay {
        position: fixed; inset: 0; z-index: 10020; pointer-events: none; opacity: 0;
        background: radial-gradient(circle, transparent 20%, rgba(56, 189, 248, 0.85) 70%, #FFFFFF 100%);
        transition: opacity 0.5s ease;
      }
      #pkbm-warp-overlay.warp-active { opacity: 1; }
      .pkbm-space-topbar {
        position: relative; z-index: 2; padding: 16px 24px;
        display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;
        background: rgba(11, 15, 25, 0.72); backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .pkbm-space-nav-btn {
        background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.22);
        color: #FFFFFF; padding: 8px 16px; border-radius: 12px; font-weight: 700;
        font-size: 0.88rem; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
        transition: all 0.2s;
      }
      .pkbm-space-nav-btn:hover { background: rgba(56, 189, 248, 0.25); border-color: #38BDF8; transform: translateY(-1px); }
      .pkbm-space-badge {
        background: linear-gradient(135deg, #4F46E5, #EC4899);
        padding: 7px 16px; border-radius: 20px; font-weight: 800; font-size: 0.84rem;
        color: #FFFFFF; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4); text-align: center;
      }
      .pkbm-space-stage {
        position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; text-align: center;
        padding: 20px 18px 34px; max-width: 920px; width: 100%; margin: 0 auto;
        transition: opacity 0.8s ease, transform 1s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .pkbm-space-kicker {
        font-size: 1rem; color: #38BDF8; font-weight: 800; letter-spacing: 0.8px; margin-bottom: 6px;
      }
      .pkbm-space-title {
        font-size: clamp(1.75rem, 4.4vw, 2.65rem); font-weight: 900; margin-bottom: 10px;
        background: linear-gradient(135deg, #FFFFFF 0%, #BAE6FD 50%, #DDD6FE 100%);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      }
      .pkbm-space-desc {
        font-size: clamp(0.95rem, 2.1vw, 1.12rem); color: #CBD5E1; max-width: 650px;
        margin: 0 auto; line-height: 1.6;
      }
      .pkbm-earth-orbit-wrapper {
        position: relative; width: 310px; height: 310px; margin: 20px auto 30px; cursor: pointer;
        transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .pkbm-earth-orbit-wrapper:hover { transform: scale(1.06); }
      .pkbm-earth-glow-aura {
        position: absolute; inset: -20px; border-radius: 50%; pointer-events: none;
        background: radial-gradient(circle, rgba(56, 189, 248, 0.36) 0%, rgba(99, 102, 241, 0.16) 52%, transparent 72%);
        animation: pkbmPulseAura 4s ease-in-out infinite alternate;
      }
      @keyframes pkbmPulseAura {
        0% { transform: scale(0.96); opacity: 0.72; }
        100% { transform: scale(1.08); opacity: 1; }
      }
      .pkbm-real-earth-holder {
        position: relative; width: 100%; height: 100%; z-index: 2;
      }
      .pkbm-satellite-orbit {
        position: absolute; inset: -26px; border-radius: 50%;
        border: 1px dashed rgba(255, 255, 255, 0.22); pointer-events: none; z-index: 3;
        animation: pkbmSpinOrbit 14s linear infinite;
      }
      .pkbm-satellite-dot {
        position: absolute; top: 14px; left: 42px; font-size: 1.4rem;
        filter: drop-shadow(0 0 8px #F59E0B);
      }
      @keyframes pkbmSpinOrbit { to { transform: rotate(360deg); } }
      .pkbm-btn-zoom-launch {
        background: linear-gradient(135deg, #0284C7 0%, #4F46E5 50%, #E11D48 100%);
        color: #FFFFFF; border: 2px solid rgba(255, 255, 255, 0.42);
        padding: 15px 34px; border-radius: 40px; font-size: 1.12rem; font-weight: 900;
        cursor: pointer; box-shadow: 0 10px 30px rgba(79, 70, 229, 0.5);
        display: inline-flex; align-items: center; gap: 10px;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        animation: pkbmBounceBtn 2.5s infinite;
      }
      .pkbm-btn-zoom-launch:hover {
        transform: scale(1.07) translateY(-3px);
        box-shadow: 0 15px 40px rgba(225, 29, 72, 0.6); border-color: #FFFFFF;
      }
      @keyframes pkbmBounceBtn {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-7px); }
        60% { transform: translateY(-3px); }
      }
      .pkbm-orbit-return-btn {
        background: linear-gradient(135deg, #0F172A, #1E3A8A);
        color: #E0F2FE; border: 1.5px solid #38BDF8;
        padding: 7px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 800; cursor: pointer;
        display: inline-flex; align-items: center; gap: 5px;
      }
      .pkbm-orbit-return-btn:hover { background: #1E40AF; color: #FFFFFF; }
      @media (max-width: 640px) {
        .pkbm-space-topbar { padding: 12px 14px; justify-content: center; }
        .pkbm-earth-orbit-wrapper { width: 230px; height: 230px; margin: 16px auto 24px; }
        .pkbm-btn-zoom-launch { padding: 13px 20px; font-size: 0.94rem; }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Attaches the ISS Deep Space Welcome Screen over any IPAS lab page.
   */
  function mount(config = {}) {
    injectStyles();
    if (document.getElementById('pkbm-space-overlay')) return;

    let audioEnabled = true;
    let isWarping = false;
    let overlayOpen = true;

    function playCosmicSound(type) {
      if (!audioEnabled) return;
      const ctx = getCtx();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        const now = ctx.currentTime;
        if (type === 'warp') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(660, now + 0.9);
          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.95);
          osc.start(now); osc.stop(now + 0.95);
        } else if (type === 'success') {
          osc.type = 'sine';
          [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => osc.frequency.setValueAtTime(f, now + idx * 0.11));
          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
          osc.start(now); osc.stop(now + 0.7);
        } else {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(620, now);
          osc.frequency.exponentialRampToValueAtTime(920, now + 0.15);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
          osc.start(now); osc.stop(now + 0.18);
        }
      } catch (e) {}
    }

    const overlay = document.createElement('div');
    overlay.id = 'pkbm-space-overlay';
    overlay.innerHTML = `
      <canvas id="pkbm-space-canvas"></canvas>
      <div id="pkbm-warp-overlay"></div>
      <div class="pkbm-space-topbar">
        <a href="${config.backHref || 'index.html'}" class="pkbm-space-nav-btn">← Kembali ke Lab IPAS</a>
        <div class="pkbm-space-badge">${config.badge || '🪐 EXPLORER IPAS • PKBM PENERUS BANGSA'}</div>
        <button class="pkbm-space-nav-btn" id="pkbm-space-audio-btn" type="button">🔊 Efek Kosmis: Nyala</button>
      </div>
      <div class="pkbm-space-stage" id="pkbm-space-stage">
        <div>
          <div class="pkbm-space-kicker">✨ STASIUN LUAR ANGKASA INTERNASIONAL • KETINGGIAN 400 KM</div>
          <h1 class="pkbm-space-title">${config.title || 'Ayo Berkenalan dengan Bumi Kita'}</h1>
          <p class="pkbm-space-desc">${config.description || 'Dari heningnya kosmos, bumi tampak seperti permata biru yang damai. Tataplah selimut awan dan keajaiban yang melindungi kita sebelum memulai penyelidikan!'}</p>
        </div>
        <div class="pkbm-earth-orbit-wrapper" id="pkbm-space-earth-trigger" role="button" tabindex="0" aria-label="Klik bola bumi untuk zoom in ke lab">
          <div class="pkbm-earth-glow-aura"></div>
          <div class="pkbm-real-earth-holder" id="pkbm-real-earth-holder"></div>
          <div class="pkbm-satellite-orbit"><div class="pkbm-satellite-dot">🛰️</div></div>
        </div>
        <div>
          <button class="pkbm-btn-zoom-launch" id="pkbm-btn-zoom-launch" type="button">
            <span>🚀 LUNCURKAN TEROPONG &amp; ZOOM-IN KE BUMI</span>
            <span>→</span>
          </button>
        </div>
        <div style="font-size:0.86rem; color:#94A3B8; margin-top:12px;">
          💡 Klik bola bumi atau tombol di atas untuk menembus atmosfer!
        </div>
      </div>
    `;

    document.body.classList.add('pkbm-space-lock');
    document.body.prepend(overlay);

    // 2D Warp Starfield inside overlay
    const starCanvas = document.getElementById('pkbm-space-canvas');
    const starCtx = starCanvas.getContext('2d');
    const stars = [];
    const palette = ['#BAE6FD', '#E0E7FF', '#DDD6FE', '#FED7AA', '#FFFFFF'];

    function resizeStarCanvas() {
      starCanvas.width = global.innerWidth;
      starCanvas.height = global.innerHeight;
    }
    resizeStarCanvas();
    global.addEventListener('resize', resizeStarCanvas);

    for (let i = 0; i < 220; i++) {
      stars.push({
        x: (Math.random() - 0.5) * starCanvas.width * 2,
        y: (Math.random() - 0.5) * starCanvas.height * 2,
        z: Math.random() * starCanvas.width || 400,
        pz: starCanvas.width || 400,
        color: palette[i % palette.length],
        size: Math.random() * 1.8 + 0.5
      });
    }

    function animateStarfield() {
      requestAnimationFrame(animateStarfield);
      if (!overlayOpen) return;

      starCtx.fillStyle = isWarping ? 'rgba(11, 15, 25, 0.34)' : 'rgba(11, 15, 25, 0.9)';
      starCtx.fillRect(0, 0, starCanvas.width, starCanvas.height);
      const cx = starCanvas.width / 2;
      const cy = starCanvas.height / 2;
      const speed = isWarping ? 45 : 1.5;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.pz = s.z;
        s.z -= speed;
        if (s.z <= 1) {
          s.x = (Math.random() - 0.5) * starCanvas.width * 2;
          s.y = (Math.random() - 0.5) * starCanvas.height * 2;
          s.z = starCanvas.width || 800;
          s.pz = s.z;
        }
        const sx = (s.x / s.z) * starCanvas.width * 0.5 + cx;
        const sy = (s.y / s.z) * starCanvas.height * 0.5 + cy;
        if (sx < 0 || sx >= starCanvas.width || sy < 0 || sy >= starCanvas.height) continue;
        const r = Math.max(0.6, (1 - s.z / (starCanvas.width || 800)) * s.size * (isWarping ? 2.8 : 1));
        starCtx.beginPath();
        starCtx.arc(sx, sy, r, 0, Math.PI * 2);
        starCtx.fillStyle = s.color;
        starCtx.fill();

        if (isWarping) {
          const px = (s.x / s.pz) * starCanvas.width * 0.5 + cx;
          const py = (s.y / s.pz) * starCanvas.height * 0.5 + cy;
          starCtx.beginPath();
          starCtx.moveTo(px, py);
          starCtx.lineTo(sx, sy);
          starCtx.strokeStyle = s.color;
          starCtx.lineWidth = r * 1.4;
          starCtx.stroke();
        }
      }
    }
    animateStarfield();

    // Real Rotating NASA Earth Globe
    const earthHolder = document.getElementById('pkbm-real-earth-holder');
    const globeCtrl = mountRealGlobe(earthHolder, {
      textureBasePath: config.textureBasePath || '../assets/textures/',
      initialRotY: config.initialRotY !== undefined ? config.initialRotY : 3.05,
      isActiveFn: () => overlayOpen,
      isWarpingFn: () => isWarping
    });

    function startZoomIn() {
      if (isWarping || !overlayOpen) return;
      isWarping = true;
      playCosmicSound('warp');

      const warp = document.getElementById('pkbm-warp-overlay');
      const stage = document.getElementById('pkbm-space-stage');
      warp.classList.add('warp-active');
      stage.style.transform = 'scale(2.2)';
      stage.style.opacity = '0';

      setTimeout(() => {
        overlayOpen = false;
        isWarping = false;
        overlay.style.display = 'none';
        warp.classList.remove('warp-active');
        document.body.classList.remove('pkbm-space-lock');
        playCosmicSound('success');
        global.dispatchEvent(new Event('resize'));
        if (typeof config.onEnter === 'function') config.onEnter();
      }, 1050);
    }

    function zoomOutToSpace() {
      playCosmicSound('chime');
      overlayOpen = true;
      isWarping = false;
      const stage = document.getElementById('pkbm-space-stage');
      overlay.style.display = 'flex';
      stage.style.transform = 'scale(1)';
      stage.style.opacity = '1';
      document.body.classList.add('pkbm-space-lock');
      if (globeCtrl && globeCtrl.resize) globeCtrl.resize();
    }

    document.getElementById('pkbm-space-earth-trigger').addEventListener('click', startZoomIn);
    document.getElementById('pkbm-btn-zoom-launch').addEventListener('click', startZoomIn);
    document.getElementById('pkbm-space-audio-btn').addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      document.getElementById('pkbm-space-audio-btn').innerText = audioEnabled ? '🔊 Efek Kosmis: Nyala' : '🔇 Efek Kosmis: Bisu';
      if (audioEnabled) playCosmicSound('chime');
    });

    // Optional Return-to-Orbit button inside the underlying Lab header
    if (config.addZoomOutButton !== false) {
      const targetBar = document.querySelector('.topbar-right') || document.querySelector('.nav-links');
      if (targetBar && !document.getElementById('pkbm-orbit-return-btn')) {
        const retBtn = document.createElement('button');
        retBtn.id = 'pkbm-orbit-return-btn';
        retBtn.type = 'button';
        retBtn.className = 'pkbm-orbit-return-btn';
        retBtn.innerText = '🪐 Orbit ISS';
        retBtn.onclick = zoomOutToSpace;
        targetBar.appendChild(retBtn);
      }
    }

    return { startZoomIn, zoomOutToSpace };
  }

  global.PKBM_SPACE_INTRO = { mountRealGlobe, mount };
})(window);

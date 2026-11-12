/**
 * Shared Three.js Earth Globe & Cosmic Backdrop Helper
 * Loads local NASA Blue Marble equirectangular textures with fallback canvas support.
 */
(function (global) {
  'use strict';

  function latLonToVec3(latDeg, lonDeg, radius) {
    const u = (lonDeg + 180) / 360;
    const v = (90 - latDeg) / 180;
    const phi = u * Math.PI * 2;
    const theta = v * Math.PI;
    return new THREE.Vector3(
      -radius * Math.cos(phi) * Math.sin(theta),
       radius * Math.cos(theta),
       radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  function createStarfield(count = 360, innerR = 26, outerR = 46) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color(0xFFFFFF),
      new THREE.Color(0xBAE6FD),
      new THREE.Color(0xFDE68A),
      new THREE.Color(0xE0E7FF)
    ];

    for (let i = 0; i < count; i++) {
      const r = innerR + Math.random() * (outerR - innerR);
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      depthWrite: false
    });
    return new THREE.Points(geo, mat);
  }

  function createRealisticEarthGroup(options = {}) {
    const R = options.radius || 2.85;
    const basePath = options.textureBasePath || '../assets/textures/';
    const maxAniso = options.renderer
      ? Math.min(8, options.renderer.capabilities.getMaxAnisotropy() || 4)
      : 4;

    const group = new THREE.Group();
    const loader = new THREE.TextureLoader();

    const mat = new THREE.MeshPhongMaterial({
      map: options.fallbackTexture || null,
      color: 0xffffff,
      specular: new THREE.Color(0x60A5FA),
      shininess: 20,
      normalScale: new THREE.Vector2(0.75, 0.75)
    });

    const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 64), mat);
    group.add(earthMesh);

    loader.load(basePath + 'earth_day.jpg', (tex) => {
      tex.anisotropy = maxAniso;
      mat.map = tex;
      mat.needsUpdate = true;
      if (typeof options.onTextureReady === 'function') options.onTextureReady();
    });

    loader.load(basePath + 'earth_specular.jpg', (specTex) => {
      specTex.anisotropy = maxAniso;
      mat.specularMap = specTex;
      mat.needsUpdate = true;
    });

    loader.load(basePath + 'earth_normal.jpg', (normTex) => {
      normTex.anisotropy = maxAniso;
      mat.normalMap = normTex;
      mat.needsUpdate = true;
    });

    // Subtle drifting cloud veil
    const cloudMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.42,
      depthWrite: false
    });
    const cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(R + 0.045, 56, 56), cloudMat);
    cloudMesh.visible = false;
    earthMesh.add(cloudMesh);

    loader.load(basePath + 'earth_clouds.png', (cloudTex) => {
      cloudTex.anisotropy = maxAniso;
      cloudMat.map = cloudTex;
      cloudMat.needsUpdate = true;
      cloudMesh.visible = true;
    });

    // Outer atmospheric rim halo (two soft shells for depth)
    const innerRim = new THREE.Mesh(
      new THREE.SphereGeometry(R + 0.09, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0x38BDF8,
        transparent: true,
        opacity: 0.14,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    group.add(innerRim);

    const outerRim = new THREE.Mesh(
      new THREE.SphereGeometry(R + 0.24, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0x0284C7,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    group.add(outerRim);

    return { group, earthMesh, cloudMesh, innerRim, outerRim };
  }

  function isObjectVisible(obj) {
    let cur = obj;
    while (cur) {
      if (!cur.visible) return false;
      cur = cur.parent;
    }
    return true;
  }

  global.PKBM_EARTH = {
    latLonToVec3,
    createStarfield,
    createRealisticEarthGroup,
    isObjectVisible
  };
})(window);

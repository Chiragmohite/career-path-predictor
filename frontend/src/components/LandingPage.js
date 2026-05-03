import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

const LandingPage = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x04070d, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04070d, 0.025);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 7);

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    scene.add(new THREE.AmbientLight(0x0a1520, 1));
    const cyanLight = new THREE.PointLight(0x00e5ff, 6, 20);
    cyanLight.position.set(3, 2, 3);
    scene.add(cyanLight);
    const blueLight = new THREE.PointLight(0x0044ff, 4, 18);
    blueLight.position.set(-4, -2, 2);
    scene.add(blueLight);
    const purpleLight = new THREE.PointLight(0x8800ff, 2, 14);
    purpleLight.position.set(2, -3, 1);
    scene.add(purpleLight);

    const icoGeo = new THREE.IcosahedronGeometry(1.6, 0);
    const ico = new THREE.Mesh(icoGeo, new THREE.MeshStandardMaterial({
      color: 0x060e1a, emissive: 0x001830, metalness: 1.0, roughness: 0.04,
    }));
    ico.position.set(3.2, 0, 0);
    scene.add(ico);

    const wIco = new THREE.Mesh(icoGeo, new THREE.MeshBasicMaterial({
      color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.15,
    }));
    wIco.scale.setScalar(1.02);
    wIco.position.copy(ico.position);
    scene.add(wIco);

    const ico2Geo = new THREE.IcosahedronGeometry(0.5, 0);
    const ico2 = new THREE.Mesh(ico2Geo, new THREE.MeshStandardMaterial({
      color: 0x001122, emissive: 0x002244, metalness: 1.0, roughness: 0.0,
    }));
    scene.add(ico2);
    const wIco2 = new THREE.Mesh(ico2Geo, new THREE.MeshBasicMaterial({
      color: 0x8800ff, wireframe: true, transparent: true, opacity: 0.4,
    }));
    wIco2.scale.setScalar(1.02);
    scene.add(wIco2);

    const makeRing = (r, tube, col, op) => {
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(r, tube, 8, 128),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op })
      );
      return m;
    };
    const r1 = makeRing(2.5, 0.008, 0x00e5ff, 0.5);  r1.position.copy(ico.position); r1.rotation.x = 1.1; scene.add(r1);
    const r2 = makeRing(3.2, 0.004, 0x0066ff, 0.25); r2.position.copy(ico.position); r2.rotation.x = 0.4; r2.rotation.z = 0.8; scene.add(r2);
    const r3 = makeRing(2.0, 0.006, 0x8800ff, 0.2);  r3.position.copy(ico.position); r3.rotation.y = 0.5; r3.rotation.z = 1.2; scene.add(r3);
    const r4 = makeRing(3.8, 0.003, 0x00ffcc, 0.12); r4.position.copy(ico.position); r4.rotation.x = 1.8; r4.rotation.y = 0.3; scene.add(r4);

    const shards = [];
    const sGeos = [
      new THREE.OctahedronGeometry(0.08, 0),
      new THREE.TetrahedronGeometry(0.10, 0),
      new THREE.BoxGeometry(0.08, 0.08, 0.08),
      new THREE.IcosahedronGeometry(0.07, 0),
    ];
    for (let i = 0; i < 30; i++) {
      const mesh = new THREE.Mesh(sGeos[i % 4], new THREE.MeshStandardMaterial({
        color: [0x00e5ff, 0x0055ff, 0x00ffcc, 0xffffff, 0x8800ff][i % 5],
        emissive: [0x003344, 0x001133, 0x003322, 0x111111, 0x220044][i % 5],
        metalness: 0.95, roughness: 0.05,
      }));
      mesh.position.set(
        ico.position.x + (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      );
      mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      mesh.userData = {
        rs: (Math.random() - 0.5) * 0.018,
        ry: (Math.random() - 0.5) * 0.014,
        oy: mesh.position.y,
        fa: 0.05 + Math.random() * 0.08,
        fo: Math.random() * Math.PI * 2,
      };
      shards.push(mesh);
      scene.add(mesh);
    }

    const pN = 2500;
    const pPos = new Float32Array(pN * 3);
    const pCol = new Float32Array(pN * 3);
    const palettes = [[0, 0.9, 1], [0, 0.33, 1], [0, 1, 0.8], [0.53, 0, 1], [0.6, 0.8, 1]];
    for (let i = 0; i < pN; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 40;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      const p = palettes[Math.floor(Math.random() * palettes.length)];
      pCol[i * 3] = p[0]; pCol[i * 3 + 1] = p[1]; pCol[i * 3 + 2] = p[2];
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.045, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true,
    }));
    scene.add(pts);

    const grid = new THREE.GridHelper(50, 60, 0x00e5ff, 0x060e1a);
    grid.position.y = -5;
    grid.material.transparent = true;
    grid.material.opacity = 0.2;
    scene.add(grid);

    let mx = 0, my = 0;
    const onMove = e => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; };
    document.addEventListener('mousemove', onMove);

    const clock = new THREE.Clock();
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      camera.position.x += (mx * 1.5 - camera.position.x) * 0.03;
      camera.position.y += (-my * 1.0 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      ico.rotation.x  = t * 0.09;  ico.rotation.y  = t * 0.13;
      wIco.rotation.x = -t * 0.06; wIco.rotation.y = t * 0.17;

      ico2.position.set(
        ico.position.x + Math.sin(t * 0.6) * 2.8,
        Math.cos(t * 0.4) * 1.5,
        Math.sin(t * 0.4) * 2.0
      );
      wIco2.position.copy(ico2.position);
      ico2.rotation.x = t * 0.3; ico2.rotation.y = t * 0.4;
      wIco2.rotation.copy(ico2.rotation);

      r1.rotation.z = t * 0.08;
      r2.rotation.x = t * 0.05 + 0.4;
      r3.rotation.y = t * 0.10;
      r4.rotation.z = -t * 0.04;

      cyanLight.position.x   = 3 + Math.sin(t * 0.5) * 3;
      cyanLight.position.z   = Math.cos(t * 0.5) * 3;
      cyanLight.intensity     = 5 + Math.sin(t * 1.2) * 2;
      blueLight.position.x   = -4 + Math.cos(t * 0.4) * 2;
      blueLight.position.z   = Math.sin(t * 0.4) * 3;
      purpleLight.position.x = 2 + Math.sin(t * 0.7) * 2;
      purpleLight.position.y = -3 + Math.cos(t * 0.5) * 1;

      shards.forEach(s => {
        s.rotation.x += s.userData.rs;
        s.rotation.y += s.userData.ry;
        s.position.y = s.userData.oy + Math.sin(t * 1.1 + s.userData.fo) * s.userData.fa;
      });

      pts.rotation.y = t * 0.010;
      pts.rotation.x = t * 0.004;
      grid.material.opacity = 0.15 + Math.sin(t * 0.3) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', onMove);
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#04070d', position: 'relative' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap" rel="stylesheet" />

      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />

      {/* Vignette */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 40%, rgba(4,7,13,0.75) 100%)' }} />

      {/* Corners */}
      {[
        { top: 20, left: 20,     borderTop: '1px solid rgba(0,229,255,0.4)', borderLeft:   '1px solid rgba(0,229,255,0.4)' },
        { top: 20, right: 20,    borderTop: '1px solid rgba(0,229,255,0.4)', borderRight:  '1px solid rgba(0,229,255,0.4)' },
        { bottom: 20, left: 20,  borderBottom: '1px solid rgba(0,229,255,0.4)', borderLeft:  '1px solid rgba(0,229,255,0.4)' },
        { bottom: 20, right: 20, borderBottom: '1px solid rgba(0,229,255,0.4)', borderRight: '1px solid rgba(0,229,255,0.4)' },
      ].map((s, i) => <div key={i} style={{ position: 'fixed', width: 50, height: 50, zIndex: 11, ...s }} />)}

      {/* Top bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, border: '1.5px solid #00e5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#00e5ff' }}>&gt;_</div>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 4, color: 'rgba(0,229,255,0.5)', textTransform: 'uppercase' }}>Career Path Predictor</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5ff', animation: 'pulse 2s infinite' }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 3, color: 'rgba(0,229,255,0.4)', textTransform: 'uppercase' }}>ML Engine Active</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '50vw', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', paddingLeft: 'clamp(36px, 8vw, 120px)', paddingBottom: '60px' }}>

        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 6, color: 'rgba(0,229,255,0.6)', textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 1, background: '#00e5ff', opacity: 0.5 }} />
          AI-Powered · ML Intelligence · Precision Career Mapping
          <div style={{ width: 24, height: 1, background: '#00e5ff', opacity: 0.5 }} />
        </div>

        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(44px, 6vw, 80px)', fontWeight: 800, lineHeight: 0.88, letterSpacing: -3, color: '#ffffff', margin: 0, marginBottom: 8, textShadow: '0 0 80px rgba(0,229,255,0.15)' }}>
          CAREER<br />
          <span style={{ color: '#00e5ff', textShadow: '0 0 40px rgba(0,229,255,0.5)' }}>PATH</span>
          <br />PREDICTOR
        </h1>

        <div style={{ width: 'clamp(280px, 35vw, 480px)', height: 1, background: 'linear-gradient(90deg, #00e5ff, transparent)', margin: '24px 0', opacity: 0.4 }} />

        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 'clamp(11px, 1.2vw, 13px)', lineHeight: 1.8, color: 'rgba(200,220,240,0.5)', letterSpacing: 1, maxWidth: 420, marginBottom: 44 }}>
          5 ensemble ML models · Groq LLaMA insights<br />
          SHAP explainability · Instant career roadmaps
        </p>

        <button
          onClick={() => navigate('/login')}
          style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', padding: '18px 52px', background: 'transparent', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.6)', cursor: 'pointer', clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)', transition: 'all 0.3s', fontWeight: 700, boxShadow: '0 0 30px rgba(0,229,255,0.1), inset 0 0 30px rgba(0,229,255,0.03)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#00e5ff'; e.currentTarget.style.color = '#000'; e.currentTarget.style.boxShadow = '0 0 60px rgba(0,229,255,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#00e5ff'; e.currentTarget.style.boxShadow = '0 0 30px rgba(0,229,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Initialize System →
        </button>

        <div style={{ marginTop: 28, fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 3, color: 'rgba(0,229,255,0.2)', textTransform: 'uppercase' }}>
          v2.0 · Ensemble Model · 5 Algorithms · LLaMA-3 Powered
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: 5, color: 'rgba(0,229,255,0.25)', zIndex: 11, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap' }}>
        <div style={{ width: 1, height: 12, background: 'rgba(0,229,255,0.2)' }} />
        System Online
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00e5ff', opacity: 0.4, animation: 'pulse 2s infinite' }} />
        All Models Loaded
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00e5ff', opacity: 0.4, animation: 'pulse 2s infinite' }} />
        Secure Connection
        <div style={{ width: 1, height: 12, background: 'rgba(0,229,255,0.2)' }} />
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.8)}}`}</style>
    </div>
  );
};

export default LandingPage;
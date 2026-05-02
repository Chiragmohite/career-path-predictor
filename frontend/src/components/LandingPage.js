import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

const LandingPage = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;

    // ── RENDERER ──
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x080b10, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080b10, 0.028);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 7);

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    // ── LIGHTS ──
    scene.add(new THREE.AmbientLight(0x0a1520, 1));
    const cyanLight = new THREE.PointLight(0x00e5ff, 5, 18);
    cyanLight.position.set(3, 2, 3);
    scene.add(cyanLight);
    const blueLight = new THREE.PointLight(0x0055ff, 3, 15);
    blueLight.position.set(-4, -2, 2);
    scene.add(blueLight);
    const whiteLight = new THREE.PointLight(0xffffff, 1.5, 10);
    whiteLight.position.set(0, 4, -2);
    scene.add(whiteLight);

    // ── CENTRAL ICOSAHEDRON ──
    const icoGeo = new THREE.IcosahedronGeometry(1.5, 0);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x0a1a2a, emissive: 0x002233,
      metalness: 1.0, roughness: 0.05,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    ico.position.set(3.5, 0, 0);
    scene.add(ico);

    // Wireframe overlay
    const wMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.18 });
    const wIco = new THREE.Mesh(icoGeo, wMat);
    wIco.scale.setScalar(1.015);
    wIco.position.copy(ico.position);
    scene.add(wIco);

    // ── RINGS ──
    const makeRing = (r, tube, col, opacity) => {
      const g = new THREE.TorusGeometry(r, tube, 8, 128);
      const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity });
      return new THREE.Mesh(g, m);
    };
    const r1 = makeRing(2.4, 0.009, 0x00e5ff, 0.55); r1.position.copy(ico.position); r1.rotation.x = 1.1; scene.add(r1);
    const r2 = makeRing(3.0, 0.005, 0x0088ff, 0.3);  r2.position.copy(ico.position); r2.rotation.x = 0.4; r2.rotation.z = 0.8; scene.add(r2);
    const r3 = makeRing(1.9, 0.007, 0x00ffcc, 0.2);  r3.position.copy(ico.position); r3.rotation.y = 0.5; r3.rotation.z = 1.2; scene.add(r3);

    // ── FLOATING SHARDS ──
    const shards = [];
    const sGeos = [new THREE.OctahedronGeometry(0.1, 0), new THREE.TetrahedronGeometry(0.12, 0), new THREE.BoxGeometry(0.1, 0.1, 0.1)];
    for (let i = 0; i < 22; i++) {
      const g = sGeos[i % 3];
      const m = new THREE.MeshStandardMaterial({
        color: [0x00e5ff, 0x0055ff, 0x00ffcc, 0xffffff][i % 4],
        emissive: [0x003344, 0x001133, 0x003322, 0x111111][i % 4],
        metalness: 0.9, roughness: 0.1,
      });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(
        ico.position.x + (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3
      );
      mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      mesh.userData = { rs: (Math.random() - 0.5) * 0.015, ry: (Math.random() - 0.5) * 0.012, oy: mesh.position.y, fa: 0.04 + Math.random() * 0.06, fo: Math.random() * Math.PI * 2 };
      shards.push(mesh); scene.add(mesh);
    }

    // ── PARTICLES ──
    const pN = 1800, pPos = new Float32Array(pN * 3), pCol = new Float32Array(pN * 3);
    const palettes = [[0, 0.9, 1], [0, 0.33, 1], [0, 1, 0.8], [0.6, 0.8, 1]];
    for (let i = 0; i < pN; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 35;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 25;
      const p = palettes[Math.floor(Math.random() * palettes.length)];
      pCol[i * 3] = p[0]; pCol[i * 3 + 1] = p[1]; pCol[i * 3 + 2] = p[2];
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.65, sizeAttenuation: true }));
    scene.add(pts);

    // ── GRID ──
    const grid = new THREE.GridHelper(40, 50, 0x00e5ff, 0x0d2233);
    grid.position.y = -4.5;
    grid.material.transparent = true; grid.material.opacity = 0.25;
    scene.add(grid);

    // ── MOUSE PARALLAX ──
    let mx = 0, my = 0;
    const onMouseMove = (e) => {
      mx = (e.clientX / window.innerWidth - 0.5);
      my = (e.clientY / window.innerHeight - 0.5);
    };
    document.addEventListener('mousemove', onMouseMove);

    // ── ANIMATE ──
    const clock = new THREE.Clock();
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      camera.position.x += (mx * 1.2 - camera.position.x) * 0.04;
      camera.position.y += (-my * 0.8 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      ico.rotation.x  = t * 0.10; ico.rotation.y  = t * 0.14;
      wIco.rotation.x = -t * 0.07; wIco.rotation.y = t * 0.18;

      r1.rotation.z = t * 0.09;
      r2.rotation.x = t * 0.06 + 0.4;
      r3.rotation.y = t * 0.11;

      cyanLight.position.x = 3 + Math.sin(t * 0.5) * 3;
      cyanLight.position.z = Math.cos(t * 0.5) * 3;
      cyanLight.intensity  = 4 + Math.sin(t * 1.3) * 1.5;
      blueLight.position.x = -4 + Math.cos(t * 0.4) * 2;
      blueLight.position.z = Math.sin(t * 0.4) * 3;

      shards.forEach(s => {
        s.rotation.x += s.userData.rs;
        s.rotation.y += s.userData.ry;
        s.position.y  = s.userData.oy + Math.sin(t * 1.2 + s.userData.fo) * s.userData.fa;
      });

      pts.rotation.y = t * 0.012;
      pts.rotation.x = t * 0.005;
      grid.material.opacity = 0.18 + Math.sin(t * 0.4) * 0.06;

      renderer.render(scene, camera);
    };
    animate();

    // ── CLEANUP ──
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#080b10', fontFamily: "'Syne', sans-serif", color: '#e8eaf0' }}>

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* 3D Canvas */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />

      {/* Corner decorations */}
      {[['tl','top:24px;left:24px;borderTop','borderLeft'],
        ['tr','top:24px;right:24px;borderTop','borderRight'],
        ['bl','bottom:24px;left:24px;borderBottom','borderLeft'],
        ['br','bottom:24px;right:24px;borderBottom','borderRight']
      ].map(([key, pos]) => (
        <div key={key} style={{
          position: 'fixed', width: 60, height: 60, zIndex: 11,
          ...(key === 'tl' && { top: 24, left: 24,   borderTop: '1px solid rgba(0,229,255,0.18)', borderLeft:  '1px solid rgba(0,229,255,0.18)' }),
          ...(key === 'tr' && { top: 24, right: 24,  borderTop: '1px solid rgba(0,229,255,0.18)', borderRight: '1px solid rgba(0,229,255,0.18)' }),
          ...(key === 'bl' && { bottom: 24, left: 24,  borderBottom: '1px solid rgba(0,229,255,0.18)', borderLeft:  '1px solid rgba(0,229,255,0.18)' }),
          ...(key === 'br' && { bottom: 24, right: 24, borderBottom: '1px solid rgba(0,229,255,0.18)', borderRight: '1px solid rgba(0,229,255,0.18)' }),
        }} />
      ))}

      {/* Status bar */}
      <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 4, color: 'rgba(0,229,255,0.3)', zIndex: 11, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 5, height: 5, background: '#00e5ff', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
        System Online · ML Engine Active
      </div>

      {/* Landing content */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', paddingLeft: 'clamp(32px, 8vw, 120px)' }}>

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <div style={{ width: 38, height: 38, border: '2px solid #00e5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Mono', monospace", fontSize: 14, color: '#00e5ff' }}>
            &gt;_
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 4, color: 'rgba(200,210,230,0.45)', textTransform: 'uppercase' }}>
            ML-Powered Career Intelligence
          </div>
        </div>

        {/* Hero text */}
        <h1 style={{ fontSize: 'clamp(52px, 8vw, 90px)', fontWeight: 800, lineHeight: 0.92, letterSpacing: -3, margin: 0 }}>
          CAREER<br /><span style={{ color: '#00e5ff' }}>PATH</span><br />PREDICTOR
        </h1>

        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 5, color: 'rgba(200,210,230,0.45)', margin: '18px 0 48px', textTransform: 'uppercase' }}>
          Decode your future · Data-driven · Precise
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            onClick={() => navigate('/login')}
            style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', padding: '16px 36px', background: '#00e5ff', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 700, clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)', transition: 'all 0.2s' }}
            onMouseEnter={e => e.target.style.background = '#fff'}
            onMouseLeave={e => e.target.style.background = '#00e5ff'}
          >
            Let's Get Started →
          </button>
          <button
            onClick={() => document.getElementById('about-cards').scrollIntoView({ behavior: 'smooth' })}
            style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', padding: '16px 36px', background: 'transparent', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.18)', cursor: 'pointer', clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.target.style.background = 'rgba(0,229,255,0.15)'; e.target.style.borderColor = '#00e5ff'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(0,229,255,0.18)'; }}
          >
            About
          </button>
        </div>

        {/* Stat cards */}
        <div id="about-cards" style={{ display: 'flex', gap: 16, marginTop: 52 }}>
          {[
            { num: '95%', lbl: 'Accuracy',   desc: 'ML model trained on 50K+ career trajectories' },
            { num: '12+', lbl: 'Domains',    desc: 'Tech, Finance, Design, Research & more' },
            { num: '3s',  lbl: 'Prediction', desc: 'Get your personalized roadmap instantly' },
          ].map(({ num, lbl, desc }) => (
            <div
              key={lbl}
              style={{ width: 180, padding: 20, border: '1px solid rgba(0,229,255,0.18)', background: 'rgba(13,17,23,0.8)', backdropFilter: 'blur(12px)', transition: 'border-color 0.3s, transform 0.3s', cursor: 'default', position: 'relative' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#00e5ff'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.18)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 28, fontWeight: 700, color: '#00e5ff', lineHeight: 1 }}>{num}</div>
              <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(200,210,230,0.45)', textTransform: 'uppercase', marginTop: 6 }}>{lbl}</div>
              <div style={{ fontSize: 12, color: 'rgba(200,210,230,0.6)', marginTop: 8, lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Inline keyframe for pulse */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
      `}</style>
    </div>
  );
};

export default LandingPage;
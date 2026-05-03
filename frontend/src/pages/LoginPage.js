import { useState, useEffect, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/App";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Terminal, Eye, EyeOff, ArrowRight, UserPlus, LogIn } from "lucide-react";
import * as THREE from "three";

function NeuralCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.set(0, 0, 10);

    // Lights
    scene.add(new THREE.AmbientLight(0x0a1520, 2));
    const cL = new THREE.PointLight(0x00e5ff, 8, 20);
    cL.position.set(2, 2, 4);
    scene.add(cL);
    const pL = new THREE.PointLight(0x8800ff, 5, 15);
    pL.position.set(-2, -2, 3);
    scene.add(pL);

    // Neural network nodes — 3 layers
    const layers = [
      { x: -4, count: 3 },
      { x: -1, count: 5 },
      { x:  2, count: 4 },
      { x:  4.5, count: 2 },
    ];
    const nodeColors = [0x00e5ff, 0x0088ff, 0x8800ff, 0x00ffcc];
    const nodes = [];

    layers.forEach((layer, li) => {
      const spacing = 8 / (layer.count + 1);
      for (let i = 0; i < layer.count; i++) {
        const y = -4 + spacing * (i + 1);
        const geo = new THREE.SphereGeometry(0.18, 16, 16);
        const mat = new THREE.MeshStandardMaterial({
          color: nodeColors[li],
          emissive: nodeColors[li],
          emissiveIntensity: 0.6,
          metalness: 0.8,
          roughness: 0.2,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(layer.x, y, (Math.random() - 0.5) * 0.5);
        mesh.userData = { baseY: y, phase: Math.random() * Math.PI * 2, li, i };
        scene.add(mesh);
        nodes.push(mesh);

        // Glow ring around node
        const ringGeo = new THREE.TorusGeometry(0.28, 0.02, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: nodeColors[li], transparent: true, opacity: 0.4 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(mesh.position);
        ring.userData = { phase: Math.random() * Math.PI * 2 };
        scene.add(ring);
      }
    });

    // Connections between layers
    const connections = [];
    let ni = 0;
    const layerNodes = [];
    layers.forEach((layer) => {
      layerNodes.push(nodes.slice(ni, ni + layer.count));
      ni += layer.count;
    });

    for (let li = 0; li < layerNodes.length - 1; li++) {
      layerNodes[li].forEach(src => {
        layerNodes[li + 1].forEach(dst => {
          const points = [src.position.clone(), dst.position.clone()];
          const geo = new THREE.BufferGeometry().setFromPoints(points);
          const mat = new THREE.LineBasicMaterial({
            color: nodeColors[li],
            transparent: true,
            opacity: 0.12,
          });
          const line = new THREE.Line(geo, mat);
          scene.add(line);
          connections.push({ line, src, dst, mat });
        });
      });
    }

    // Flowing particles along connections
    const flowParticles = [];
    connections.forEach(conn => {
      if (Math.random() > 0.4) {
        const geo = new THREE.SphereGeometry(0.05, 8, 8);
        const mat = new THREE.MeshBasicMaterial({
          color: 0x00e5ff,
          transparent: true,
          opacity: 0.9,
        });
        const p = new THREE.Mesh(geo, mat);
        p.userData = { t: Math.random(), speed: 0.003 + Math.random() * 0.004, conn };
        scene.add(p);
        flowParticles.push(p);
      }
    });

    // Background particles
    const pN = 400;
    const pPos = new Float32Array(pN * 3);
    for (let i = 0; i < pN; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 20;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.04, color: 0x00e5ff, transparent: true, opacity: 0.3, sizeAttenuation: true,
    }));
    scene.add(pts);

    // Mouse parallax
    let mx = 0, my = 0;
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mx = ((e.clientX - r.left) / W - 0.5);
      my = ((e.clientY - r.top)  / H - 0.5);
    };
    window.addEventListener("mousemove", onMove);

    const clock = new THREE.Clock();
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      camera.position.x += (mx * 1.5 - camera.position.x) * 0.04;
      camera.position.y += (-my * 1.0 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // Float nodes
      nodes.forEach(n => {
        n.position.y = n.userData.baseY + Math.sin(t * 0.8 + n.userData.phase) * 0.12;
        n.material.emissiveIntensity = 0.5 + Math.sin(t * 1.5 + n.userData.phase) * 0.3;
      });

      // Pulse connections
      connections.forEach((c, i) => {
        c.mat.opacity = 0.08 + Math.sin(t * 1.2 + i * 0.3) * 0.06;
        const pts2 = [c.src.position.clone(), c.dst.position.clone()];
        c.line.geometry.setFromPoints(pts2);
      });

      // Move flow particles
      flowParticles.forEach(p => {
        p.userData.t += p.userData.speed;
        if (p.userData.t > 1) p.userData.t = 0;
        const { src, dst } = p.userData.conn;
        p.position.lerpVectors(src.position, dst.position, p.userData.t);
        p.material.opacity = Math.sin(p.userData.t * Math.PI) * 0.9;
      });

      cL.position.x = 2 + Math.sin(t * 0.4) * 1.5;
      cL.position.y = 2 + Math.cos(t * 0.3) * 1;
      pL.position.x = -2 + Math.cos(t * 0.5) * 1.5;
      pts.rotation.y = t * 0.008;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMove);
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await login(email, password);
        localStorage.setItem("token", res.data.token);
      } else {
        await register(name, email, password);
      }
      toast.success("Access granted");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] flex relative overflow-hidden" data-testid="login-page">

      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(0,229,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.4) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* ── LEFT PANEL — Three.js Neural Network ── */}
      <div className="hidden lg:flex flex-col w-[48%] relative border-r border-white/[0.06] overflow-hidden">

        {/* Three.js canvas */}
        <NeuralCanvas />

        {/* Overlay content on top of canvas */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10 pointer-events-none">

          {/* Top label */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, border: "1.5px solid rgba(0,229,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 10, color: "#00e5ff" }}>
              &gt;_
            </div>
            <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 4, color: "rgba(0,229,255,0.45)", textTransform: "uppercase" }}>
              Neural Prediction Engine
            </span>
          </div>

          {/* Center text */}
          <div>
            <p style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 5, color: "rgba(0,229,255,0.4)", textTransform: "uppercase", marginBottom: 12 }}>
              ── Live Model Architecture ──
            </p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 800, color: "#ffffff", lineHeight: 1.1, letterSpacing: -1, textShadow: "0 0 40px rgba(0,229,255,0.2)" }}>
              5-Layer<br />
              <span style={{ color: "#00e5ff" }}>Ensemble</span><br />
              Intelligence
            </h2>
            <div style={{ width: 180, height: 1, background: "linear-gradient(90deg, #00e5ff, transparent)", marginTop: 16, opacity: 0.4 }} />
          </div>

          {/* Bottom stats */}
          <div style={{ display: "flex", gap: 28 }}>
            {[
              ["XGBoost", "Primary"],
              ["Random Forest", "Ensemble"],
              ["LLaMA-3", "Insights"],
            ].map(([name, role]) => (
              <div key={name}>
                <div style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, color: "#00e5ff", letterSpacing: 1 }}>{name}</div>
                <div style={{ fontFamily: "monospace", fontSize: 8, color: "rgba(200,220,240,0.35)", textTransform: "uppercase", letterSpacing: 2, marginTop: 3 }}>{role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Corner decorations */}
        <div style={{ position: "absolute", top: 20, left: 20, width: 36, height: 36, borderTop: "1px solid rgba(0,229,255,0.35)", borderLeft: "1px solid rgba(0,229,255,0.35)", zIndex: 20 }} />
        <div style={{ position: "absolute", bottom: 20, left: 20, width: 36, height: 36, borderBottom: "1px solid rgba(0,229,255,0.35)", borderLeft: "1px solid rgba(0,229,255,0.35)", zIndex: 20 }} />
        <div style={{ position: "absolute", bottom: 20, right: 20, width: 36, height: 36, borderBottom: "1px solid rgba(0,229,255,0.35)", borderRight: "1px solid rgba(0,229,255,0.35)", zIndex: 20 }} />
      </div>

      {/* ── RIGHT PANEL — Login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="relative w-full max-w-md">

          <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
            <Terminal className="w-8 h-8 text-[#00E5FF]" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase" style={{ fontFamily: "'Unbounded', sans-serif" }}>
                CAREER<span className="text-[#00E5FF]">_PATH</span>
              </h1>
              <p className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-bold mt-1">
                ML-Powered Career Intelligence
              </p>
            </div>
          </div>

          <div className="bg-[#0D0D12] border border-white/10 rounded-sm p-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex mb-8 border-b border-white/10">
              <button data-testid="login-tab" onClick={() => setIsLogin(true)} className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-all ${isLogin ? "text-[#00E5FF] border-b-2 border-[#00E5FF]" : "text-[#A1A1AA] hover:text-white"}`}>
                <LogIn className="w-4 h-4" /> Login
              </button>
              <button data-testid="register-tab" onClick={() => setIsLogin(false)} className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-all ${!isLogin ? "text-[#00E5FF] border-b-2 border-[#00E5FF]" : "text-[#A1A1AA] hover:text-white"}`}>
                <UserPlus className="w-4 h-4" /> Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-bold">Operative Name</Label>
                  <Input data-testid="register-name-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" required={!isLogin} className="bg-[#030305] border-white/10 text-white rounded-sm focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] placeholder:text-white/30 font-mono h-11" />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-bold">Email Address</Label>
                <Input data-testid="email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="agent@career.ai" required className="bg-[#030305] border-white/10 text-white rounded-sm focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] placeholder:text-white/30 font-mono h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-bold">Access Key</Label>
                <div className="relative">
                  <Input data-testid="password-input" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required className="bg-[#030305] border-white/10 text-white rounded-sm focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] placeholder:text-white/30 font-mono h-11 pr-10" />
                  <button type="button" data-testid="toggle-password-visibility" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#00E5FF] transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button data-testid="auth-submit-button" type="submit" disabled={loading} className="w-full bg-[#00E5FF] text-[#030305] font-bold uppercase tracking-widest hover:bg-[#33EEFF] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all rounded-sm px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <span className="animate-pulse">PROCESSING...</span> : <>{isLogin ? "Authenticate" : "Initialize Account"}<ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-[#A1A1AA]/50 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <span className="w-8 h-px bg-white/10" />
            <span className="uppercase tracking-widest">Secure Connection Established</span>
            <span className="w-8 h-px bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
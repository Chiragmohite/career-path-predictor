import { useState, useEffect, useRef, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ModelLabPage from "@/pages/ModelLabPage";
import DatasetPage from "@/pages/DatasetPage";
import HistoryPage from "@/pages/HistoryPage";
import SkillTestPage from "@/pages/SkillTestPage";
import { Toaster } from "sonner";
import { Terminal, Activity, LogOut, FlaskConical, Database, Clock, Crosshair, Zap } from "lucide-react";

// ─────────────────────────────────────────────────────────────
//  ANIMATED BACKGROUND — career graph + data packets + stats
// ─────────────────────────────────────────────────────────────
function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let W, H, t = 0;

    // Career node definitions (fractional screen coords)
    const NODE_DEFS = [
      { px: 0.10, py: 0.78, label: "ENTRY",      tier: 0 },
      { px: 0.20, py: 0.85, label: "JUNIOR",     tier: 0 },
      { px: 0.34, py: 0.62, label: "MID",        tier: 1 },
      { px: 0.26, py: 0.52, label: "ANALYST",    tier: 1 },
      { px: 0.44, py: 0.70, label: "SPECIALIST", tier: 1 },
      { px: 0.58, py: 0.42, label: "SENIOR",     tier: 2 },
      { px: 0.51, py: 0.30, label: "LEAD",       tier: 2 },
      { px: 0.68, py: 0.56, label: "MANAGER",    tier: 2 },
      { px: 0.78, py: 0.22, label: "PRINCIPAL",  tier: 3 },
      { px: 0.88, py: 0.36, label: "DIRECTOR",   tier: 3 },
      { px: 0.72, py: 0.10, label: "ARCHITECT",  tier: 3 },
    ];

    const EDGES = [
      [0,2],[0,3],[1,2],[1,4],
      [2,5],[2,6],[3,6],[4,7],
      [5,8],[5,9],[6,8],[6,10],[7,9],
    ];

    // tier 0 = gray, 1 = violet, 2 = cyan, 3 = bright cyan
    const TIER_RGB = [
      [161,161,170],
      [123, 97,255],
      [  0,229,255],
      [  0,229,255],
    ];

    let nodes = [];
    const PACKETS    = [];
    const BURSTS     = [];
    const STAT_FLOATS = [];

    const KEYWORDS = [
      "Python","SQL","ML","AWS","React","Docker",
      "TensorFlow","Spark","Kafka","Kubernetes","PyTorch",
      "NLP","CV","BI","ETL","API","CI/CD",
    ];
    let floatingWords = [];

    const STAT_TEXTS = [
      "+12% YoY","p=0.94","→ ML Eng","↑ $32k",
      "Conf: 87%","Top 8%","→ Lead","AUC: 0.91",
    ];

    // ── helpers ───────────────────────────────────────────
    function bezierPt(a, b, tt) {
      const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.12;
      const my = (a.y + b.y) / 2 - (b.x - a.x) * 0.12;
      const u  = 1 - tt;
      return {
        x:  u*u*a.x + 2*u*tt*mx + tt*tt*b.x,
        y:  u*u*a.y + 2*u*tt*my + tt*tt*b.y,
        mx, my,
      };
    }

    // ── init ──────────────────────────────────────────────
    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      nodes = NODE_DEFS.map(n => ({
        ...n,
        x: n.px * W,
        y: n.py * H,
        pulseOffset: Math.random() * Math.PI * 2,
      }));
    }

    function initWords() {
      floatingWords = KEYWORDS.map(kw => ({
        text: kw,
        x:  0.05 + Math.random() * 0.90,
        y:  0.05 + Math.random() * 0.90,
        vx: (Math.random() - 0.5) * 0.00014,
        vy: (Math.random() - 0.5) * 0.00011,
        alpha: Math.random() * 0.10 + 0.04,
        size:  Math.random() * 3 + 9,
      }));
    }

    // ── spawners ──────────────────────────────────────────
    function spawnPacket() {
      if (PACKETS.length >= 18) return;
      const [fi, ti] = EDGES[Math.floor(Math.random() * EDGES.length)];
      PACKETS.push({
        fromIdx: fi, toIdx: ti,
        progress: 0,
        speed: 0.003 + Math.random() * 0.004,
        size:  Math.random() * 2 + 1.5,
        cyan:  Math.random() > 0.45,
        trail: [],
      });
    }

    function maybeSpawnBurst() {
      if (Math.random() < 0.004 && BURSTS.length < 3) {
        const n = nodes[EDGES[Math.floor(Math.random() * EDGES.length)][0]];
        BURSTS.push({ x: n.x, y: n.y, r: 0, alpha: 0.55 });
      }
    }

    function maybeSpawnStat() {
      if (Math.random() < 0.008 && STAT_FLOATS.length < 6) {
        const n = nodes[Math.floor(Math.random() * nodes.length)];
        STAT_FLOATS.push({
          x:    n.x + (Math.random() - 0.5) * 40,
          y:    n.y,
          text: STAT_TEXTS[Math.floor(Math.random() * STAT_TEXTS.length)],
          alpha: 0, life: 0, vy: -0.35,
        });
      }
    }

    // ── draw helpers ──────────────────────────────────────
    function drawGrid() {
      const pulse = 0.011 + 0.004 * Math.sin(t * 0.003);
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate(0.26);
      ctx.translate(-W * 0.7, -H * 0.7);
      ctx.strokeStyle = `rgba(0,229,255,${pulse})`;
      ctx.lineWidth = 0.4;
      for (let x = -W; x < W * 2; x += 55) {
        ctx.beginPath(); ctx.moveTo(x, -H); ctx.lineTo(x, H * 2); ctx.stroke();
      }
      for (let y = -H; y < H * 2; y += 55) {
        ctx.beginPath(); ctx.moveTo(-W, y); ctx.lineTo(W * 2, y); ctx.stroke();
      }
      ctx.restore();
    }

    function drawEdges() {
      for (const [fi, ti] of EDGES) {
        const a = nodes[fi], b = nodes[ti];
        const { mx, my } = bezierPt(a, b, 0.5);
        const alpha = 0.06 + 0.025 * Math.sin(t * 0.008 + fi);
        ctx.save();
        ctx.strokeStyle = `rgba(0,229,255,${alpha})`;
        ctx.lineWidth   = 0.8;
        ctx.setLineDash([6, 10]);
        ctx.lineDashOffset = -(t * 0.3) % 16;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(mx, my, b.x, b.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    function drawNodes() {
      for (const n of nodes) {
        n.pulseOffset += 0.012;
        const pulse  = Math.sin(n.pulseOffset);
        const baseR  = [5, 7, 9, 11][n.tier];
        const r      = baseR + pulse * 1.5;
        const ringR  = baseR + 7 + pulse * 3;
        const [cr, cg, cb] = TIER_RGB[n.tier];

        // Outer ring
        ctx.save();
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.15 + 0.08 * Math.abs(pulse)})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.arc(n.x, n.y, ringR, 0, Math.PI * 2); ctx.stroke();

        // Core dot
        ctx.fillStyle   = `rgba(${cr},${cg},${cb},0.9)`;
        ctx.shadowColor = `rgba(${cr},${cg},${cb},0.8)`;
        ctx.shadowBlur  = 8 + pulse * 4;
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Label
        const la = [0.09, 0.13, 0.19, 0.27][n.tier];
        ctx.save();
        ctx.fillStyle = `rgba(255,255,255,${la})`;
        ctx.font      = `bold ${8 + n.tier * 1.5}px 'JetBrains Mono', monospace`;
        ctx.textAlign = "center";
        ctx.fillText(n.label, n.x, n.y - baseR - 8);
        ctx.restore();
      }
    }

    function drawPackets() {
      for (let i = PACKETS.length - 1; i >= 0; i--) {
        const p = PACKETS[i];
        p.progress += p.speed;
        const a  = nodes[p.fromIdx], b = nodes[p.toIdx];
        const { x: px, y: py } = bezierPt(a, b, p.progress);
        p.trail.push({ x: px, y: py });
        if (p.trail.length > 14) p.trail.shift();

        const [cr, cg, cb] = p.cyan ? [0, 229, 255] : [123, 97, 255];

        // Trail
        for (let j = 0; j < p.trail.length - 1; j++) {
          const ta2 = (j / p.trail.length) * 0.45;
          ctx.save();
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},${ta2})`;
          ctx.lineWidth   = p.size * (j / p.trail.length);
          ctx.beginPath();
          ctx.moveTo(p.trail[j].x, p.trail[j].y);
          ctx.lineTo(p.trail[j+1].x, p.trail[j+1].y);
          ctx.stroke();
          ctx.restore();
        }

        // Head
        ctx.save();
        ctx.fillStyle   = `rgb(${cr},${cg},${cb})`;
        ctx.shadowColor = `rgb(${cr},${cg},${cb})`;
        ctx.shadowBlur  = 8;
        ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        if (p.progress >= 1) PACKETS.splice(i, 1);
      }
    }

    function drawWords() {
      for (const w of floatingWords) {
        w.x += w.vx; w.y += w.vy;
        if (w.x < 0) w.x = 1; if (w.x > 1) w.x = 0;
        if (w.y < 0) w.y = 1; if (w.y > 1) w.y = 0;
        ctx.save();
        ctx.fillStyle = `rgba(0,229,255,${w.alpha})`;
        ctx.font      = `${w.size}px 'JetBrains Mono', monospace`;
        ctx.fillText(w.text, w.x * W, w.y * H);
        ctx.restore();
      }
    }

    function drawBursts() {
      for (let i = BURSTS.length - 1; i >= 0; i--) {
        const b = BURSTS[i];
        b.r += 0.8; b.alpha -= 0.014;
        if (b.alpha <= 0) { BURSTS.splice(i, 1); continue; }
        ctx.save();
        ctx.strokeStyle = `rgba(0,229,255,${b.alpha})`;
        ctx.lineWidth   = 0.8;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
    }

    function drawStatFloats() {
      for (let i = STAT_FLOATS.length - 1; i >= 0; i--) {
        const s = STAT_FLOATS[i];
        s.life++; s.y += s.vy;
        if (s.life < 20)      s.alpha = (s.life / 20) * 0.50;
        else if (s.life > 80) s.alpha -= 0.012;
        if (s.alpha <= 0) { STAT_FLOATS.splice(i, 1); continue; }
        ctx.save();
        ctx.fillStyle = `rgba(0,229,255,${s.alpha})`;
        ctx.font      = `9px 'JetBrains Mono', monospace`;
        ctx.textAlign = "center";
        ctx.fillText(s.text, s.x, s.y);
        ctx.restore();
      }
    }

    // ── main loop ─────────────────────────────────────────
    function draw() {
      ctx.clearRect(0, 0, W, H);

      // 1. Base dark gradient
      const base = ctx.createRadialGradient(W*0.4, H*0.5, 0, W*0.5, H*0.5, W*0.9);
      base.addColorStop(0, "#05080F");
      base.addColorStop(1, "#010204");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, W, H);

      // 2. Ambient glow on senior+ nodes
      for (const n of nodes) {
        if (n.tier >= 2) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 130);
          g.addColorStop(0, "rgba(0,229,255,0.04)");
          g.addColorStop(1, "transparent");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(n.x, n.y, 130, 0, Math.PI * 2); ctx.fill();
        }
      }

      // 3. Tilted grid
      drawGrid();

      // 4. Floating skill keywords
      drawWords();

      // 5. Career graph edges
      drawEdges();

      // 6. Data packets
      if (Math.random() < 0.06) spawnPacket();
      drawPackets();

      // 7. Career graph nodes
      drawNodes();

      // 8. Burst rings + stat floats
      maybeSpawnBurst();  drawBursts();
      maybeSpawnStat();   drawStatFloats();

      // 9. Scanlines
      for (let y = 0; y < H; y += 3) {
        ctx.fillStyle = "rgba(0,0,0,0.032)";
        ctx.fillRect(0, y, W, 1);
      }

      // 10. Vignette
      const vig = ctx.createRadialGradient(W/2, H/2, H*0.25, W/2, H/2, H*0.85);
      vig.addColorStop(0, "transparent");
      vig.addColorStop(1, "rgba(0,0,0,0.60)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      t++;
      animId = requestAnimationFrame(draw);
    }

    resize();
    initWords();
    // Stagger initial packets so they don't all spawn at once
    for (let i = 0; i < 6; i++) setTimeout(spawnPacket, i * 400);
    draw();

    const onResize = () => { resize(); initWords(); };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────────────────
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export { API };

function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios
        .get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => { setUser(res.data); setLoading(false); })
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null); setUser(null); setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${API}/auth/register`, { name, email, password });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
//  PROTECTED ROUTE
// ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="text-[#00E5FF] font-mono text-lg animate-pulse"
        data-testid="loading-indicator"
      >
        INITIALIZING SYSTEM...
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

// ─────────────────────────────────────────────────────────────
//  NAV
// ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: "/",           icon: Crosshair,    label: "Predict"    },
  { path: "/skill-test", icon: Zap,          label: "Skill Test" },
  { path: "/model-lab",  icon: FlaskConical, label: "Model Lab"  },
  { path: "/dataset",    icon: Database,     label: "Dataset"    },
  { path: "/history",    icon: Clock,        label: "History"    },
];

// ─────────────────────────────────────────────────────────────
//  APP LAYOUT
// ─────────────────────────────────────────────────────────────
function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0D0D12]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-[#00E5FF]" />
            <h1
              className="text-base font-bold tracking-tighter text-white uppercase"
              style={{ fontFamily: "'Unbounded', sans-serif" }}
            >
              CAREER<span className="text-[#00E5FF]">_PATH</span>
            </h1>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] text-[10px] rounded-sm font-mono">
              <Activity className="w-3 h-3" /> ONLINE
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" data-testid="main-navigation">
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                data-testid={`nav-${label.toLowerCase().replace(" ", "-")}`}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-sm transition-all ${
                    isActive
                      ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30"
                      : "text-[#A1A1AA] hover:text-white border border-transparent"
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </NavLink>
            ))}
          </nav>

          {/* User + logout */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#A1A1AA] font-mono hidden sm:block" data-testid="user-name">
              {user?.name}
            </span>
            <button
              data-testid="logout-button"
              onClick={() => { logout(); navigate("/login"); }}
              className="flex items-center gap-1.5 px-2.5 py-1 border border-white/10 text-[#A1A1AA] hover:text-[#FF0055] hover:border-[#FF0055]/30 transition-all rounded-sm text-xs font-bold uppercase tracking-widest"
            >
              <LogOut className="w-3 h-3" /> Exit
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div
          className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto"
          data-testid="mobile-navigation"
        >
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-sm whitespace-nowrap transition-all ${
                  isActive ? "bg-[#00E5FF]/10 text-[#00E5FF]" : "text-[#A1A1AA]"
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Page content — z-10 so it always sits above the canvas */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 relative z-10">
        <Routes>
          <Route path="/"           element={<DashboardPage />} />
          <Route path="/skill-test" element={<SkillTestPage />} />
          <Route path="/model-lab"  element={<ModelLabPage />} />
          <Route path="/dataset"    element={<DatasetPage />} />
          <Route path="/history"    element={<HistoryPage />} />
        </Routes>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ROOT APP
// ─────────────────────────────────────────────────────────────
function App() {

  useEffect(() => {
    const badge = document.getElementById('emergent-badge');
    if (badge) badge.remove();
  }, []);

  return (

/*
      .grain-overlay already defined in App.css — keep it.
      position:relative + minHeight ensure the canvas anchor works on short pages.
    */
    <div className="grain-overlay" style={{ position: "relative", minHeight: "100vh" }}>

      {/* ① Canvas — fixed, full-screen, behind everything (z-index 0) */}
      <AnimatedBackground />

      {/* ② All UI — sits above canvas via z-index 1 */}
      <BrowserRouter>
        <AuthProvider>
          <div style={{ position: "relative", zIndex: 1 }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background:  "#0D0D12",
                border:      "1px solid rgba(0, 229, 255, 0.3)",
                color:       "#fff",
                fontFamily:  "'JetBrains Mono', monospace",
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
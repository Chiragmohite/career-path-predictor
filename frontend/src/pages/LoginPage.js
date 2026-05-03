import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/App";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Terminal, Eye, EyeOff, ArrowRight, UserPlus, LogIn } from "lucide-react";

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
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col items-center justify-center w-[45%] relative border-r border-white/5 overflow-hidden">

        {/* Subtle bg glow */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 60% 50%, rgba(0,229,255,0.06) 0%, transparent 70%)" }} />

        {/* Animated SVG illustration */}
        <div className="relative z-10 flex flex-col items-center gap-10 px-12">
          <svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              @keyframes spin-rev  { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
              @keyframes pulse-glow { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
              @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
              .ring1 { transform-origin:160px 160px; animation: spin-slow 18s linear infinite; }
              .ring2 { transform-origin:160px 160px; animation: spin-rev 12s linear infinite; }
              .ring3 { transform-origin:160px 160px; animation: spin-slow 25s linear infinite; }
              .core  { transform-origin:160px 160px; animation: pulse-glow 3s ease-in-out infinite; }
              .floater { animation: float 4s ease-in-out infinite; }
              .floater2 { animation: float 5s ease-in-out infinite 1s; }
              .floater3 { animation: float 3.5s ease-in-out infinite 0.5s; }
            `}</style>

            {/* Outer ring */}
            <g className="ring1">
              <circle cx="160" cy="160" r="130" stroke="rgba(0,229,255,0.15)" strokeWidth="1" strokeDasharray="6 4" fill="none"/>
              <circle cx="160" cy="30" r="5" fill="#00e5ff" opacity="0.8"/>
              <circle cx="290" cy="160" r="4" fill="#0088ff" opacity="0.7"/>
              <circle cx="160" cy="290" r="3" fill="#00ffcc" opacity="0.6"/>
            </g>

            {/* Mid ring */}
            <g className="ring2">
              <circle cx="160" cy="160" r="95" stroke="rgba(0,136,255,0.2)" strokeWidth="1" strokeDasharray="3 6" fill="none"/>
              <circle cx="160" cy="65" r="4" fill="#8800ff" opacity="0.7"/>
              <circle cx="255" cy="160" r="3" fill="#00e5ff" opacity="0.5"/>
              <circle cx="65"  cy="160" r="5" fill="#0088ff" opacity="0.6"/>
            </g>

            {/* Inner ring */}
            <g className="ring3">
              <circle cx="160" cy="160" r="60" stroke="rgba(0,229,255,0.25)" strokeWidth="1" fill="none"/>
              <circle cx="160" cy="100" r="3" fill="#00ffcc" opacity="0.9"/>
              <circle cx="220" cy="160" r="3" fill="#00e5ff" opacity="0.9"/>
              <circle cx="100" cy="160" r="3" fill="#8800ff" opacity="0.9"/>
            </g>

            {/* Core hexagon */}
            <g className="core">
              <polygon points="160,120 194,140 194,180 160,200 126,180 126,140" fill="rgba(0,229,255,0.08)" stroke="#00e5ff" strokeWidth="1.5"/>
              <polygon points="160,130 188,146 188,174 160,190 132,174 132,146" fill="rgba(0,229,255,0.05)" stroke="rgba(0,229,255,0.4)" strokeWidth="0.5"/>
              <circle cx="160" cy="160" r="18" fill="rgba(0,229,255,0.12)" stroke="#00e5ff" strokeWidth="1"/>
              <circle cx="160" cy="160" r="8" fill="#00e5ff" opacity="0.9"/>
            </g>

            {/* Connection lines */}
            <line x1="160" y1="142" x2="160" y2="30"  stroke="rgba(0,229,255,0.12)" strokeWidth="0.5"/>
            <line x1="160" y1="178" x2="160" y2="290" stroke="rgba(0,229,255,0.08)" strokeWidth="0.5"/>
            <line x1="142" y1="160" x2="65"  y2="160" stroke="rgba(0,136,255,0.1)"  strokeWidth="0.5"/>
            <line x1="178" y1="160" x2="290" y2="160" stroke="rgba(0,136,255,0.1)"  strokeWidth="0.5"/>

            {/* Floating data nodes */}
            <g className="floater">
              <rect x="42" y="70" width="44" height="22" rx="3" fill="rgba(0,229,255,0.08)" stroke="rgba(0,229,255,0.3)" strokeWidth="0.5"/>
              <text x="64" y="85" textAnchor="middle" fill="#00e5ff" fontSize="8" fontFamily="monospace">ML MODEL</text>
            </g>
            <g className="floater2">
              <rect x="234" y="58" width="52" height="22" rx="3" fill="rgba(136,0,255,0.08)" stroke="rgba(136,0,255,0.3)" strokeWidth="0.5"/>
              <text x="260" y="73" textAnchor="middle" fill="#8800ff" fontSize="8" fontFamily="monospace">GROQ LLM</text>
            </g>
            <g className="floater3">
              <rect x="234" y="234" width="44" height="22" rx="3" fill="rgba(0,255,204,0.08)" stroke="rgba(0,255,204,0.3)" strokeWidth="0.5"/>
              <text x="256" y="249" textAnchor="middle" fill="#00ffcc" fontSize="8" fontFamily="monospace">SHAP XAI</text>
            </g>
            <g className="floater">
              <rect x="42" y="234" width="52" height="22" rx="3" fill="rgba(0,136,255,0.08)" stroke="rgba(0,136,255,0.3)" strokeWidth="0.5"/>
              <text x="68" y="249" textAnchor="middle" fill="#0088ff" fontSize="8" fontFamily="monospace">ROADMAP</text>
            </g>
          </svg>

          {/* Stats below illustration */}
          <div style={{ display: "flex", gap: 32 }}>
            {[["5", "ML Models"], ["95%", "Accuracy"], ["3s", "Prediction"]].map(([num, lbl]) => (
              <div key={lbl} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 22, fontWeight: 700, color: "#00e5ff", lineHeight: 1 }}>{num}</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2, color: "rgba(200,220,240,0.4)", textTransform: "uppercase", marginTop: 4 }}>{lbl}</div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(0,229,255,0.35)", letterSpacing: 2, textTransform: "uppercase", textAlign: "center", lineHeight: 1.8 }}>
            Decode your future<br />with data-driven precision
          </p>
        </div>

        {/* Corner decorations */}
        <div style={{ position: "absolute", top: 24, left: 24, width: 36, height: 36, borderTop: "1px solid rgba(0,229,255,0.3)", borderLeft: "1px solid rgba(0,229,255,0.3)" }} />
        <div style={{ position: "absolute", bottom: 24, left: 24, width: 36, height: 36, borderBottom: "1px solid rgba(0,229,255,0.3)", borderLeft: "1px solid rgba(0,229,255,0.3)" }} />
      </div>

      {/* ── RIGHT PANEL — existing login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="relative w-full max-w-md">

          {/* Terminal header */}
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

          {/* Auth card */}
          <div className="bg-[#0D0D12] border border-white/10 rounded-sm p-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex mb-8 border-b border-white/10">
              <button
                data-testid="login-tab"
                onClick={() => setIsLogin(true)}
                className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-all ${isLogin ? "text-[#00E5FF] border-b-2 border-[#00E5FF]" : "text-[#A1A1AA] hover:text-white"}`}
              >
                <LogIn className="w-4 h-4" /> Login
              </button>
              <button
                data-testid="register-tab"
                onClick={() => setIsLogin(false)}
                className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-all ${!isLogin ? "text-[#00E5FF] border-b-2 border-[#00E5FF]" : "text-[#A1A1AA] hover:text-white"}`}
              >
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
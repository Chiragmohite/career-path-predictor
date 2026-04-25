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

  // Redirect if already logged in - use useEffect to avoid setState during render
  if (user) {
    return <Navigate to="/" replace />;
  }

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
    <div className="min-h-screen bg-[#030305] flex items-center justify-center p-6 relative overflow-hidden" data-testid="login-page">
      {/* Background image overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1645839078449-124db8a049fd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMGRhcmslMjBuZW9uJTIwbmV0d29yayUyMG5vZGVzfGVufDB8fHx8MTc3NDU4MTE4OXww&ixlib=rb-4.1.0&q=85')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Grid lines decorative */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

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
          {/* Tab switcher */}
          <div className="flex mb-8 border-b border-white/10">
            <button
              data-testid="login-tab"
              onClick={() => setIsLogin(true)}
              className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-all ${
                isLogin
                  ? "text-[#00E5FF] border-b-2 border-[#00E5FF]"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
            <button
              data-testid="register-tab"
              onClick={() => setIsLogin(false)}
              className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-all ${
                !isLogin
                  ? "text-[#00E5FF] border-b-2 border-[#00E5FF]"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-bold">
                  Operative Name
                </Label>
                <Input
                  data-testid="register-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required={!isLogin}
                  className="bg-[#030305] border-white/10 text-white rounded-sm focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] placeholder:text-white/30 font-mono h-11"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-bold">
                Email Address
              </Label>
              <Input
                data-testid="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@career.ai"
                required
                className="bg-[#030305] border-white/10 text-white rounded-sm focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] placeholder:text-white/30 font-mono h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-bold">
                Access Key
              </Label>
              <div className="relative">
                <Input
                  data-testid="password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="bg-[#030305] border-white/10 text-white rounded-sm focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] placeholder:text-white/30 font-mono h-11 pr-10"
                />
                <button
                  type="button"
                  data-testid="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#00E5FF] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              data-testid="auth-submit-button"
              type="submit"
              disabled={loading}
              className="w-full bg-[#00E5FF] text-[#030305] font-bold uppercase tracking-widest hover:bg-[#33EEFF] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all rounded-sm px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">PROCESSING...</span>
              ) : (
                <>
                  {isLogin ? "Authenticate" : "Initialize Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom decoration */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-[#A1A1AA]/50 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <span className="w-8 h-px bg-white/10" />
          <span className="uppercase tracking-widest">Secure Connection Established</span>
          <span className="w-8 h-px bg-white/10" />
        </div>
      </div>
    </div>
  );
}

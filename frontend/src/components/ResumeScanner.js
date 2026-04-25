import { useState } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { FileText, Loader2, CheckCircle2, XCircle, Zap, AlertCircle } from "lucide-react";

export default function ResumeScanner({ predictedCareer }) {
  const { token } = useAuth();
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const scan = async () => {
    if (!text.trim() || !predictedCareer) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await axios.post(`${API}/resume-scan`,
        { resume_text: text, predicted_career: predictedCareer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Scan failed. Check AI service.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = result
    ? result.match_score >= 70 ? "#00FF88"
    : result.match_score >= 45 ? "#FFD700"
    : "#FF6B35"
    : "#00E5FF";

  return (
    <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
        <FileText className="w-4 h-4 text-[#00E5FF]" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
          Resume Scanner
        </h3>
        {predictedCareer && (
          <span className="ml-auto text-[10px] font-mono text-[#A1A1AA]">
            Scoring for: <span className="text-[#00E5FF]">{predictedCareer}</span>
          </span>
        )}
      </div>

      <div className="p-6 space-y-4">
        {!predictedCareer && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-sm">
            <AlertCircle className="w-3.5 h-3.5 text-[#FFD700] flex-shrink-0" />
            <span className="text-[10px] font-mono text-[#FFD700]">Run a prediction first to enable resume scanning.</span>
          </div>
        )}

        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold font-mono text-[#A1A1AA] mb-2 block">
            Paste Your Resume
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your resume text here (work experience, skills, education)..."
            rows={8}
            className="w-full bg-[#030305] border border-white/10 text-white rounded-sm px-4 py-3 text-xs font-mono focus:outline-none focus:border-[#00E5FF]/50 resize-none placeholder:text-[#A1A1AA]/30"
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] font-mono text-[#A1A1AA]/50">{text.length} chars</span>
            <button
              onClick={scan}
              disabled={loading || !text.trim() || !predictedCareer}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00E5FF] text-[#030305] hover:bg-[#33EEFF] hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all rounded-sm text-[10px] font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
              {loading ? "Scanning..." : "Scan Resume"}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#FF6B35]/5 border border-[#FF6B35]/20 rounded-sm">
            <XCircle className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span className="text-[10px] font-mono text-[#FF6B35]">{error}</span>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-6 gap-2">
            <Loader2 className="w-5 h-5 text-[#00E5FF] animate-spin" />
            <span className="text-[#A1A1AA] font-mono text-xs">AI analyzing your resume...</span>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-5 pt-2 border-t border-white/5">
            {/* Score */}
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-full flex flex-col items-center justify-center flex-shrink-0"
                style={{ border: `2px solid ${scoreColor}`, background: `${scoreColor}10` }}
              >
                <span className="text-2xl font-bold font-mono" style={{ color: scoreColor }}>
                  {result.match_score}
                </span>
                <span className="text-[8px] uppercase tracking-widest font-mono" style={{ color: scoreColor }}>
                  match
                </span>
              </div>
              <div>
                <p className="text-white text-sm font-mono leading-relaxed">{result.overall_verdict}</p>
              </div>
            </div>

            {/* Strengths */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold font-mono text-[#00FF88] mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Strengths
              </p>
              <div className="space-y-1.5">
                {result.strengths?.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs font-mono text-[#A1A1AA]">
                    <span className="text-[#00FF88] mt-0.5">✓</span> {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Missing skills */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold font-mono text-[#FF6B35] mb-2 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Missing Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills?.map((s, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-1 rounded-sm"
                    style={{ background: "#FF6B3510", border: "1px solid #FF6B3530", color: "#FF6B35" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick wins */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold font-mono text-[#FFD700] mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Quick Wins
              </p>
              <div className="space-y-1.5">
                {result.quick_wins?.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs font-mono text-[#A1A1AA]">
                    <span className="text-[#FFD700] mt-0.5">→</span> {w}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

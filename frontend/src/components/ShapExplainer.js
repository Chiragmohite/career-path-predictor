import { useState } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { FlaskConical, Loader2, ArrowUp, ArrowDown } from "lucide-react";

export default function ShapExplainer({ lastFormData }) {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!lastFormData) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/shap-explain`, lastFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.explanation);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const maxMag = data ? Math.max(...data.map(d => d.magnitude)) : 1;

  return (
    <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-[#7B61FF]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
            Why This Career? <span className="text-[#7B61FF] text-[10px] font-mono normal-case tracking-normal">SHAP Explainability</span>
          </h3>
        </div>
        <button
          onClick={run}
          disabled={loading || !lastFormData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7B61FF] text-white hover:bg-[#9B81FF] transition-all rounded-sm text-[10px] font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FlaskConical className="w-3 h-3" />}
          {loading ? "Explaining..." : "Explain Prediction"}
        </button>
      </div>

      <div className="p-6">
        {!data && !loading && (
          <p className="text-[#A1A1AA] text-xs font-mono text-center py-4">
            SHAP values show exactly <em>why</em> the model predicted your career — which features pushed the decision and how much.
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8 gap-2">
            <Loader2 className="w-5 h-5 text-[#7B61FF] animate-spin" />
            <span className="text-[#A1A1AA] font-mono text-xs">Computing SHAP values...</span>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-widest font-mono text-[#A1A1AA] mb-4">
              Feature impact on prediction (sorted by importance)
            </p>
            {data.map((item, i) => {
              const isPos = item.direction === "positive";
              const color = isPos ? "#00FF88" : "#FF6B35";
              const barW = `${(item.magnitude / maxMag) * 100}%`;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {isPos
                        ? <ArrowUp className="w-3 h-3" style={{ color }} />
                        : <ArrowDown className="w-3 h-3" style={{ color }} />
                      }
                      <span className="text-xs font-mono text-white">{item.feature}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono" style={{ color }}>
                        {isPos ? "+" : ""}{item.shap_value.toFixed(3)}
                      </span>
                      <span className="text-[10px] font-mono text-[#A1A1AA]">
                        {isPos ? "pushes toward" : "pushes away"}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: barW, background: color, opacity: 0.8 }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="text-[10px] font-mono text-[#A1A1AA]/60 pt-2 border-t border-white/5">
              Green = feature supports this career prediction · Orange = feature pulls away from it
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


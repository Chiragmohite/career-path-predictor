import { useState } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { Sliders, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";

const SKILL_LABELS = {
  math_score: "Math Score",
  programming_skill: "Programming",
  communication_skill: "Communication",
  logical_reasoning: "Logic",
};

export default function WhatIfSimulator({ lastFormData }) {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!lastFormData) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/what-if`, lastFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Group simulations by +10 / -10
  const plusSims = data?.simulations.filter(s => s.delta === 10) || [];
  const minusSims = data?.simulations.filter(s => s.delta === -10) || [];

  return (
    <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
            What-If Simulator
          </h3>
        </div>
        <button
          onClick={run}
          disabled={loading || !lastFormData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00E5FF] text-[#030305] hover:bg-[#33EEFF] transition-all rounded-sm text-[10px] font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sliders className="w-3 h-3" />}
          {loading ? "Simulating..." : "Run Simulation"}
        </button>
      </div>

      <div className="p-6">
        {!data && !loading && (
          <p className="text-[#A1A1AA] text-xs font-mono text-center py-4">
            See how improving or lowering each skill by 10 points changes your predicted career.
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8 gap-2">
            <Loader2 className="w-5 h-5 text-[#00E5FF] animate-spin" />
            <span className="text-[#A1A1AA] font-mono text-xs">Running simulations...</span>
          </div>
        )}

        {data && !loading && (
          <>
            <div className="flex items-center gap-3 mb-5 px-3 py-2 bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-sm">
              <span className="text-[10px] uppercase tracking-widest font-mono text-[#A1A1AA]">Base prediction:</span>
              <span className="text-sm font-bold text-[#00E5FF] font-mono">{data.base_career}</span>
              <span className="text-[10px] text-[#A1A1AA] font-mono ml-auto">{data.base_confidence}% confidence</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* +10 column */}
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold font-mono text-[#00FF88] mb-3 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> If you improve by +10
                </p>
                <div className="space-y-2">
                  {plusSims.map((s, i) => (
                    <SimRow key={i} sim={s} base={data.base_career} color="#00FF88" />
                  ))}
                </div>
              </div>

              {/* -10 column */}
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold font-mono text-[#FF6B35] mb-3 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> If you drop by -10
                </p>
                <div className="space-y-2">
                  {minusSims.map((s, i) => (
                    <SimRow key={i} sim={s} base={data.base_career} color="#FF6B35" />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SimRow({ sim, base, color }) {
  const changed = sim.career_changed;
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-sm border transition-all"
      style={{
        borderColor: changed ? `${color}40` : "rgba(255,255,255,0.06)",
        background: changed ? `${color}08` : "transparent",
      }}
    >
      <span className="text-[10px] font-mono text-[#A1A1AA] w-24 flex-shrink-0">
        {SKILL_LABELS[sim.skill]}
      </span>
      {changed ? (
        <>
          <span className="text-xs font-bold font-mono" style={{ color }}>{sim.new_career}</span>
          <span className="text-[10px] font-mono text-[#A1A1AA] ml-auto">{sim.new_confidence}%</span>
        </>
      ) : (
        <>
          <Minus className="w-3 h-3 text-[#A1A1AA]/40" />
          <span className="text-[10px] font-mono text-[#A1A1AA]/50">No change</span>
          <span className="text-[10px] font-mono ml-auto" style={{ color: sim.confidence_change >= 0 ? "#00FF88" : "#FF6B35" }}>
            {sim.confidence_change >= 0 ? "+" : ""}{sim.confidence_change}%
          </span>
        </>
      )}
    </div>
  );
}

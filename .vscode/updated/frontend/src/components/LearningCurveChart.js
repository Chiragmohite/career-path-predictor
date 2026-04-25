import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0D0D12] border border-[#00E5FF]/30 rounded-sm px-3 py-2 font-mono text-xs">
        <p className="text-[#A1A1AA] mb-1">Samples: {label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {(p.value * 100).toFixed(1)}%</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function LearningCurveChart({ data, loading, modelName }) {
  if (loading || !data) {
    return (
      <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden" data-testid="learning-curve-loading">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
            Learning Curve
          </h3>
        </div>
        <div className="p-6 h-60 flex items-center justify-center text-[#A1A1AA]/50 text-xs animate-pulse font-mono">Loading...</div>
      </div>
    );
  }

  const chartData = data.train_sizes.map((size, i) => ({
    samples: size,
    training: data.train_mean[i],
    validation: data.val_mean[i],
  }));

  return (
    <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden" data-testid="learning-curve-chart">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
            Learning Curve
          </h3>
        </div>
        <span className="text-[10px] text-[#A1A1AA] font-mono">{modelName}</span>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="samples"
              tick={{ fill: "#A1A1AA", fontSize: 10, fontFamily: "'JetBrains Mono'" }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
            <YAxis domain={[0.5, 1]}
              tick={{ fill: "#A1A1AA", fontSize: 10, fontFamily: "'JetBrains Mono'" }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="training" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.1}
              strokeWidth={2} name="Training Score" dot={{ r: 3, fill: "#00E5FF" }} />
            <Area type="monotone" dataKey="validation" stroke="#FF0055" fill="#FF0055" fillOpacity={0.1}
              strokeWidth={2} name="Validation Score" dot={{ r: 3, fill: "#FF0055" }} />
            <Legend wrapperStyle={{ fontFamily: "'JetBrains Mono'", fontSize: "10px" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

const COLORS = ["#00E5FF", "#FF0055", "#FFB800", "#33EEFF"];

export default function RocCurveChart({ data, loading, modelName }) {
  if (loading || !data) {
    return (
      <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">ROC Curve</h3>
        </div>
        <div className="p-6 h-60 flex items-center justify-center text-[#A1A1AA]/50 text-xs animate-pulse font-mono">Loading...</div>
      </div>
    );
  }

  const curves = data.curves || [];

  return (
    <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">ROC Curve</h3>
        </div>
        <span className="text-[10px] text-[#A1A1AA] font-mono">{modelName}</span>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" dataKey="x" domain={[0, 1]} tick={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
            <YAxis domain={[0, 1]} tick={{ fill: "#A1A1AA", fontSize: 10 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
            {curves.map((c, i) => (
              <Line key={c.class}
                data={c.fpr.map((fpr, j) => ({ x: fpr, y: c.tpr[j] }))}
                dataKey="y" stroke={COLORS[i % COLORS.length]}
                strokeWidth={2} dot={false}
                name={`${c.class} (AUC: ${c.auc})`} />
            ))}
            <Line data={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} dataKey="y"
              stroke="rgba(255,255,255,0.2)" strokeDasharray="5 5"
              strokeWidth={1} dot={false} name="Random" />
            <Legend wrapperStyle={{ fontSize: "10px" }} />
          </LineChart>
        </ResponsiveContainer>

        <div className="flex flex-wrap gap-3 mt-2 justify-center">
          {curves.map((c, i) => (
            <div key={c.class} className="text-[10px] font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-[#A1A1AA]">{c.class}:</span>
              <span className="text-white font-bold">{c.auc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0D0D12] border border-[#00E5FF]/30 rounded-sm px-3 py-2 font-mono text-xs">
        <p className="text-white">{payload[0].payload.name}</p>
        <p className="text-[#00E5FF] font-bold">{(payload[0].value * 100).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

export default function FeatureImportanceChart({ prediction }) {
  
  const data = Object.entries(prediction.feature_importance).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value,
    shortName: name.split(" ").map(w => w[0]).join(""),
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden" data-testid="feature-importance-chart">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-[#00E5FF]" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
          Feature Importance
        </h3>
      </div>

      <div className="p-4">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "#A1A1AA", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              tick={{ fill: "#A1A1AA", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,229,255,0.05)" }} />
            <Bar dataKey="value" radius={0} maxBarSize={20}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={index === 0 ? "#00E5FF" : index === data.length - 1 ? "#FF0055" : "#00E5FF"}
                  fillOpacity={1 - index * 0.15}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

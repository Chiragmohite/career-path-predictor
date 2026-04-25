import { Grid3x3 } from "lucide-react";

const CELL_COLORS = [
  "rgba(0, 229, 255, 0.05)",
  "rgba(0, 229, 255, 0.15)",
  "rgba(0, 229, 255, 0.3)",
  "rgba(0, 229, 255, 0.5)",
  "rgba(0, 229, 255, 0.7)",
];

export default function ConfusionMatrixChart({ data, loading, modelName }) {
  if (loading || !data) {
    return (
      <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden" data-testid="confusion-matrix-loading">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <Grid3x3 className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
            Confusion Matrix
          </h3>
        </div>
        <div className="p-6 h-60 flex items-center justify-center text-[#A1A1AA]/50 text-xs animate-pulse font-mono">Loading...</div>
      </div>
    );
  }

  const { matrix, labels } = data;
  const maxVal = Math.max(...matrix.flat());
  const shortLabels = labels.map((l) => l.split(" ").map((w) => w[0]).join(""));

  const getColor = (val) => {
    const ratio = maxVal > 0 ? val / maxVal : 0;
    const idx = Math.min(Math.floor(ratio * CELL_COLORS.length), CELL_COLORS.length - 1);
    return CELL_COLORS[idx];
  };

  return (
    <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden" data-testid="confusion-matrix-chart">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3x3 className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
            Confusion Matrix
          </h3>
        </div>
        <span className="text-[10px] text-[#A1A1AA] font-mono">{modelName}</span>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto">
          <div style={{ minWidth: "fit-content" }}>
            {/* Column headers */}
            <div className="flex ml-8">
              {shortLabels.map((label, i) => (
                <div key={i} className="w-10 text-center text-[9px] text-[#A1A1AA] font-mono font-bold pb-2 truncate">
                  {label}
                </div>
              ))}
            </div>
            {/* Matrix rows */}
            {matrix.map((row, i) => (
              <div key={i} className="flex items-center">
                <div className="w-8 text-right pr-1 text-[9px] text-[#A1A1AA] font-mono font-bold flex-shrink-0">
                  {shortLabels[i]}
                </div>
                {row.map((val, j) => (
                  <div key={j}
                    className="w-10 h-9 flex items-center justify-center border border-white/5 text-[10px] font-mono font-bold"
                    style={{ backgroundColor: getColor(val), color: val > maxVal * 0.5 ? "#030305" : "#fff" }}
                    data-testid={`cm-cell-${i}-${j}`}>
                    {val}
                  </div>
                ))}
              </div>
            ))}
            <div className="flex justify-center mt-2">
              <span className="text-[10px] text-[#A1A1AA] font-mono">Predicted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

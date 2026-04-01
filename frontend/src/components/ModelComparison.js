import { GitCompare, Trophy, Target, BarChart3, Percent } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const METRIC_COLORS = {
  accuracy: "#00E5FF",
  precision: "#33EEFF",
  recall: "#FF0055",
  f1_score: "#FFB800",
};

export default function ModelComparison({ models }) {
  const best = models.reduce((best, m) => (m.accuracy > best.accuracy ? m : best), models[0]);

  return (
    <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden" data-testid="model-comparison">
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
        <GitCompare className="w-4 h-4 text-[#00E5FF]" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
          Model Comparison
        </h3>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-[#00E5FF] text-xs uppercase tracking-widest font-bold font-mono">Model</TableHead>
              <TableHead className="text-[#00E5FF] text-xs uppercase tracking-widest font-bold font-mono text-center">Accuracy</TableHead>
              <TableHead className="text-[#00E5FF] text-xs uppercase tracking-widest font-bold font-mono text-center">Precision</TableHead>
              <TableHead className="text-[#00E5FF] text-xs uppercase tracking-widest font-bold font-mono text-center">Recall</TableHead>
              <TableHead className="text-[#00E5FF] text-xs uppercase tracking-widest font-bold font-mono text-center">F1 Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((m) => (
              <TableRow key={m.model_key}
                className={`border-white/5 hover:bg-[#00E5FF]/5 ${m.model_key === best.model_key ? "bg-[#00E5FF]/5" : ""}`}
                data-testid={`model-row-${m.model_key}`}>
                <TableCell className="font-mono text-xs">
                  <div className="flex items-center gap-2">
                    {m.model_key === best.model_key && <Trophy className="w-3.5 h-3.5 text-[#FFB800]" />}
                    <span className="text-white">{m.name}</span>
                  </div>
                  <span className="text-[10px] text-[#A1A1AA]/60">{m.description}</span>
                </TableCell>
                {["accuracy", "precision", "recall", "f1_score"].map((metric) => (
                  <TableCell key={metric} className="text-center">
                    <span className="text-sm font-bold font-mono" style={{ color: METRIC_COLORS[metric] }}>
                      {(m[metric] * 100).toFixed(1)}%
                    </span>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

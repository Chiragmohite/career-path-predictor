import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Zap } from "lucide-react";

const CAREER_ICONS = {
  "Data Scientist": "DS",
  "Developer": "DEV",
  "Manager": "MGR",
  "Designer": "DES",
};

const CAREER_COLORS = {
  "Data Scientist": "#00E5FF",
  "Developer": "#33EEFF",
  "Manager": "#FF0055",
  "Designer": "#FFB800",
};

export default function PredictionResult({ prediction }) {
  const [animatedConfidence, setAnimatedConfidence] = useState(0);

  useEffect(() => {
    setAnimatedConfidence(0);
    const timer = setTimeout(() => {
      setAnimatedConfidence(prediction.confidence);
    }, 100);
    return () => clearTimeout(timer);
  }, [prediction.confidence]);

  const sortedProbabilities = Object.entries(prediction.all_probabilities)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="tracing-border" data-testid="prediction-result">
      <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <Target className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
            Prediction Result
          </h3>
        </div>

        <div className="p-6">
          {/* Main prediction */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-[#00E5FF] rounded-sm mb-4 neon-pulse">
              <span className="text-2xl font-black text-[#00E5FF]" style={{ fontFamily: "'Unbounded', sans-serif" }}>
                {CAREER_ICONS[prediction.predicted_career] || "?"}
              </span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase mb-2"
              style={{ fontFamily: "'Unbounded', sans-serif" }}
              data-testid="predicted-career"
            >
              {prediction.predicted_career}
            </h2>
            <div className="flex items-center justify-center gap-2 text-[#00E5FF]">
              <Zap className="w-4 h-4" />
              <span className="text-3xl font-black font-mono tabular-nums animate-count-up" data-testid="confidence-score">
                {animatedConfidence}%
              </span>
              <span className="text-xs uppercase tracking-widest text-[#A1A1AA]">confidence</span>
            </div>
          </div>

          {/* All probabilities */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#A1A1AA]" />
              <span className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-bold">
                All Career Probabilities
              </span>
            </div>
            {sortedProbabilities.map(([career, prob]) => (
              <div key={career} className="space-y-1" data-testid={`probability-${career.replace(/\s+/g, '-').toLowerCase()}`}>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#A1A1AA]">{career}</span>
                  <span className="text-white font-bold tabular-nums">{prob}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${prob}%`,
                      backgroundColor: CAREER_COLORS[career] || "#00E5FF",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

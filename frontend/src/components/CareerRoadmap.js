import { CheckCircle2, Circle, Flag } from "lucide-react";

const PHASE_COLORS = ["#00E5FF", "#7B61FF", "#00FF88"];

export default function CareerRoadmap({ roadmap, career }) {
  if (!roadmap || roadmap.length === 0) return null;

  return (
    <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
        <Flag className="w-4 h-4 text-[#00E5FF]" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
          Career Roadmap — {career}
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {roadmap.map((phase, idx) => (
          <div key={idx} className="relative">
            {/* Connector line */}
            {idx < roadmap.length - 1 && (
              <div
                className="absolute left-4 top-10 w-px h-full"
                style={{ background: `linear-gradient(${PHASE_COLORS[idx]}, ${PHASE_COLORS[idx + 1]})`, opacity: 0.2 }}
              />
            )}

            <div className="flex gap-4">
              {/* Phase dot */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${PHASE_COLORS[idx]}15`, border: `1px solid ${PHASE_COLORS[idx]}40` }}
              >
                <span className="text-xs font-bold font-mono" style={{ color: PHASE_COLORS[idx] }}>
                  {idx + 1}
                </span>
              </div>

              <div className="flex-1">
                {/* Phase header */}
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-sm font-bold text-white font-mono">{phase.phase}</h4>
                </div>

                {/* Tasks */}
                <ul className="space-y-2 mb-3">
                  {phase.tasks.map((task, ti) => (
                    <li key={ti} className="flex items-start gap-2 text-sm text-[#A1A1AA] font-mono">
                      <Circle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: PHASE_COLORS[idx], opacity: 0.6 }} />
                      {task}
                    </li>
                  ))}
                </ul>

                {/* Milestone */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-sm"
                  style={{ background: `${PHASE_COLORS[idx]}08`, border: `1px solid ${PHASE_COLORS[idx]}20` }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: PHASE_COLORS[idx] }} />
                  <span className="text-xs font-mono" style={{ color: PHASE_COLORS[idx] }}>
                    Milestone: {phase.milestone}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

>>>>>>> d6cbf5fa183ecb04664172c29753bee2aed8bc04

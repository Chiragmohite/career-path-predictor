import { BookOpen, ArrowUpRight, AlertTriangle } from "lucide-react";

export default function SkillRecommendations({ prediction }) {
  const { recommendations, skill_gaps } = prediction;
  const hasGaps = Object.values(skill_gaps).some((v) => v > 0);

  const SKILL_LABELS = {
    math_score: "Math",
    programming_skill: "Programming",
    communication_skill: "Communication",
    logical_reasoning: "Logic",
  };

  return (
    <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden" data-testid="skill-recommendations">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-[#00E5FF]" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
          Recommendations
        </h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Skill Gaps */}
          {hasGaps && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#FF0055]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-xs uppercase tracking-[0.2em] font-bold">Skill Gaps</span>
              </div>
              <div className="space-y-2">
                {Object.entries(skill_gaps)
                  .filter(([, v]) => v > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([skill, gap]) => (
                    <div key={skill} className="flex items-center justify-between py-1.5 border-b border-white/5">
                      <span className="text-xs text-[#A1A1AA] font-mono">
                        {SKILL_LABELS[skill] || skill}
                      </span>
                      <span className="text-xs text-[#FF0055] font-bold font-mono">
                        +{gap} needed
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Skills to improve */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#00E5FF]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="text-xs uppercase tracking-[0.2em] font-bold">Focus Areas</span>
            </div>
            <div className="space-y-2">
              {recommendations.skills_to_improve.map((skill, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b border-white/5">
                  <span className="text-[#00E5FF] text-xs mt-0.5 font-bold">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-xs text-[#A1A1AA] font-mono">{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#00E5FF]">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-xs uppercase tracking-[0.2em] font-bold">Resources</span>
            </div>
            <div className="space-y-2">
              {recommendations.resources.map((resource, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b border-white/5">
                  <span className="text-[#FF0055] text-xs mt-0.5 font-bold">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-xs text-[#A1A1AA] font-mono">{resource}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

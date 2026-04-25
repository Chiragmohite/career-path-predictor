import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { Hexagon } from "lucide-react";

const SKILL_LABELS = {
  math_score: "Math",
  programming_skill: "Programming",
  communication_skill: "Communication",
  logical_reasoning: "Logic",
};

export default function SkillRadarChart({ prediction }) {
  const data = Object.entries(SKILL_LABELS).map(([key, label]) => ({
    skill: label,
    yours: prediction.user_skills[key] || 0,
    target: prediction.target_skills[key] || 0,
  }));

  return (
    <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden" data-testid="skill-radar-chart">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
        <Hexagon className="w-4 h-4 text-[#00E5FF]" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
          Skill Gap Analysis
        </h3>
      </div>

      <div className="p-4">
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: "#A1A1AA", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: "#A1A1AA", fontSize: 9 }}
              axisLine={false}
            />
            <Radar
              name="Your Skills"
              dataKey="yours"
              stroke="#00E5FF"
              fill="#00E5FF"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Radar
              name="Target Profile"
              dataKey="target"
              stroke="#FF0055"
              fill="#FF0055"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="4 4"
            />
            <Legend
              wrapperStyle={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

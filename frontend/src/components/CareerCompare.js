import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, API } from "@/App";
import { GitCompareArrows, Brain, Code, MessageSquare, Lightbulb } from "lucide-react";

const CAREERS = [
  "Data Scientist", "Developer", "Manager", "Designer",
  "DevOps Engineer", "ML Engineer", "Cybersecurity Analyst",
  "Product Manager", "UX Designer", "Business Analyst",
  "Cloud Architect", "Game Developer"
];

const SKILL_ICONS = {
  math_score: Brain,
  programming_skill: Code,
  communication_skill: MessageSquare,
  logical_reasoning: Lightbulb,
};
const SKILL_LABELS = {
  math_score: "Math", programming_skill: "Programming",
  communication_skill: "Communication", logical_reasoning: "Logic",
};

export default function CareerCompare() {
  const { token } = useAuth();
  const [careerA, setCareerA] = useState("Developer");
  const [careerB, setCareerB] = useState("Data Scientist");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchComparison = async () => {
    if (careerA === careerB) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/career-comparison`, {
        params: { career_a: careerA, career_b: careerB },
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComparison(); }, [careerA, careerB]);

  const skills = ["math_score", "programming_skill", "communication_skill", "logical_reasoning"];
  const maxVal = 100;

  return (
    <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
        <GitCompareArrows className="w-4 h-4 text-[#00E5FF]" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
          Compare Careers
        </h3>
      </div>

      <div className="p-6">
        {/* Selectors */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[{ val: careerA, set: setCareerA, color: "#00E5FF" }, { val: careerB, set: setCareerB, color: "#7B61FF" }].map(({ val, set, color }, i) => (
            <div key={i}>
              <label className="text-[10px] uppercase tracking-widest font-bold font-mono mb-1.5 block" style={{ color }}>
                Career {i === 0 ? "A" : "B"}
              </label>
              <select
                value={val}
                onChange={e => set(e.target.value)}
                className="w-full bg-[#030305] border border-white/10 text-white rounded-sm px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#00E5FF]/50"
              >
                {CAREERS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {loading && (
          <div className="text-center text-[#A1A1AA] font-mono text-xs py-4 animate-pulse">Loading comparison...</div>
        )}

        {data && !loading && (
          <>
            {/* Skill bars */}
            <div className="space-y-4 mb-6">
              {skills.map(skill => {
                const Icon = SKILL_ICONS[skill];
                const a = data.career_a.target_profile[skill] || 0;
                const b = data.career_b.target_profile[skill] || 0;
                return (
                  <div key={skill}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon className="w-3 h-3 text-[#A1A1AA]" />
                      <span className="text-[10px] uppercase tracking-widest text-[#A1A1AA] font-mono font-bold">
                        {SKILL_LABELS[skill]}
                      </span>
                    </div>
                    {/* Career A bar */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-[#00E5FF] w-4">A</span>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${(a / maxVal) * 100}%`, background: "#00E5FF" }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-[#00E5FF] w-6 text-right">{a}</span>
                    </div>
                    {/* Career B bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#7B61FF] w-4">B</span>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${(b / maxVal) * 100}%`, background: "#7B61FF" }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-[#7B61FF] w-6 text-right">{b}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Skills to improve */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { career: data.career_a, color: "#00E5FF" },
                { career: data.career_b, color: "#7B61FF" },
              ].map(({ career, color }, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest font-bold font-mono" style={{ color }}>
                    {career.name}
                  </p>
                  {career.skills.map((s, j) => (
                    <div
                      key={j}
                      className="text-[10px] font-mono px-2 py-1.5 rounded-sm"
                      style={{ background: `${color}08`, border: `1px solid ${color}20`, color: "#A1A1AA" }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

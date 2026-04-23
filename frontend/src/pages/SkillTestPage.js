import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Brain, CheckCircle2, Loader2, Zap } from "lucide-react";

// ─── Questions ───────────────────────────────────────────────
const QUESTIONS = [
  // Math
  {
    id: 1, category: "math",
    text: "How comfortable are you solving equations or working with numbers?",
    options: [
      { label: "I avoid math whenever possible", score: 10 },
      { label: "I can handle basic arithmetic", score: 30 },
      { label: "I'm comfortable with algebra & statistics", score: 65 },
      { label: "I love advanced math — calculus, linear algebra", score: 90 },
    ],
  },
  {
    id: 2, category: "math",
    text: "You're given a dataset. Your first instinct is to…",
    options: [
      { label: "Ask someone else to analyze it", score: 10 },
      { label: "Make a simple chart in Excel", score: 35 },
      { label: "Calculate averages, distributions & correlations", score: 70 },
      { label: "Run statistical tests and build models", score: 92 },
    ],
  },
  {
    id: 3, category: "math",
    text: "How do you feel about probability and statistics?",
    options: [
      { label: "Confusing — I struggle with them", score: 15 },
      { label: "I understand the basics", score: 40 },
      { label: "Pretty comfortable — I use them regularly", score: 72 },
      { label: "It's my strong suit", score: 93 },
    ],
  },
  // Programming
  {
    id: 4, category: "programming",
    text: "How much coding experience do you have?",
    options: [
      { label: "None — I've never written code", score: 5 },
      { label: "A little — basic scripts or tutorials", score: 28 },
      { label: "Intermediate — I build projects independently", score: 68 },
      { label: "Advanced — I architect and ship production systems", score: 95 },
    ],
  },
  {
    id: 5, category: "programming",
    text: "When you encounter a bug, you typically…",
    options: [
      { label: "Give up or ask a developer to fix it", score: 8 },
      { label: "Google the error and try copy-paste fixes", score: 30 },
      { label: "Debug systematically and usually find the issue", score: 70 },
      { label: "Love debugging — I trace through logic and fix it fast", score: 95 },
    ],
  },
  {
    id: 6, category: "programming",
    text: "Which best describes your relationship with technology?",
    options: [
      { label: "I use apps but don't care how they work", score: 10 },
      { label: "I'm curious but not hands-on with code", score: 35 },
      { label: "I build tools or automate tasks regularly", score: 72 },
      { label: "I contribute to open source or build side projects constantly", score: 95 },
    ],
  },
  // Communication
  {
    id: 7, category: "communication",
    text: "In a team meeting, you're most likely to…",
    options: [
      { label: "Listen quietly and let others lead", score: 25 },
      { label: "Share ideas when asked", score: 48 },
      { label: "Actively contribute and drive discussion", score: 78 },
      { label: "Facilitate the meeting and align everyone", score: 95 },
    ],
  },
  {
    id: 8, category: "communication",
    text: "How do you feel about presenting to an audience?",
    options: [
      { label: "I dread it — it makes me very anxious", score: 20 },
      { label: "I can do it but it's not my strength", score: 45 },
      { label: "I'm comfortable and get good feedback", score: 78 },
      { label: "I thrive — presenting is one of my best skills", score: 95 },
    ],
  },
  {
    id: 9, category: "communication",
    text: "When explaining a complex idea to a non-technical person, you…",
    options: [
      { label: "Struggle to simplify it", score: 22 },
      { label: "Can get the main point across with some effort", score: 50 },
      { label: "Break it down clearly with good analogies", score: 80 },
      { label: "Excel at this — it's a superpower of mine", score: 95 },
    ],
  },
  // Logic
  {
    id: 10, category: "logic",
    text: "You enjoy solving puzzles, brainteasers, or strategic games.",
    options: [
      { label: "Not really — I find them frustrating", score: 20 },
      { label: "Occasionally, if they're not too hard", score: 45 },
      { label: "Yes — I regularly seek them out", score: 78 },
      { label: "Absolutely — I live for logical challenges", score: 95 },
    ],
  },
  {
    id: 11, category: "logic",
    text: "When making a big decision, you…",
    options: [
      { label: "Go with your gut feeling", score: 28 },
      { label: "Weigh pros and cons informally", score: 50 },
      { label: "Systematically analyze options with data", score: 80 },
      { label: "Build a structured framework or decision matrix", score: 95 },
    ],
  },
  {
    id: 12, category: "logic",
    text: "How well do you spot flaws in an argument or system?",
    options: [
      { label: "I often miss logical gaps", score: 22 },
      { label: "I catch obvious issues eventually", score: 48 },
      { label: "I'm good at critical thinking and finding edge cases", score: 80 },
      { label: "I immediately spot inconsistencies — it's a habit", score: 95 },
    ],
  },
  // Interest / Domain
  {
    id: 13, category: "interest",
    text: "Which of these work environments excites you most?",
    options: [
      { label: "Building and shipping software products", value: "coding" },
      { label: "Analyzing data and extracting insights", value: "data" },
      { label: "Leading teams and shaping strategy", value: "management" },
      { label: "Designing beautiful user experiences", value: "design" },
    ],
  },
  {
    id: 14, category: "interest",
    text: "What type of problems do you find most satisfying to solve?",
    options: [
      { label: "Security, infrastructure & system reliability", value: "infrastructure" },
      { label: "Building and deploying intelligent AI systems", value: "ai_ml" },
      { label: "Protecting systems from cyber threats", value: "security" },
      { label: "Defining products users love", value: "product" },
    ],
  },
  {
    id: 15, category: "interest",
    text: "In 5 years, which title sounds most like you?",
    options: [
      { label: "Senior Engineer / Tech Lead", value: "coding" },
      { label: "Data Scientist / ML Engineer", value: "ai_ml" },
      { label: "Product Manager / Director", value: "product" },
      { label: "Security Researcher / Cloud Architect", value: "infrastructure" },
    ],
  },
];

const INTEREST_QUESTIONS = QUESTIONS.filter(q => q.category === "interest");
const SKILL_QUESTIONS = QUESTIONS.filter(q => q.category !== "interest");

const CATEGORY_COLORS = {
  math: "#00E5FF",
  programming: "#7B61FF",
  communication: "#00FF88",
  logic: "#FF6B35",
  interest: "#FFD700",
};

const CATEGORY_LABELS = {
  math: "Math",
  programming: "Programming",
  communication: "Communication",
  logic: "Logic",
  interest: "Domain Interest",
};

// ─── Component ───────────────────────────────────────────────
export default function SkillTestPage({ onTestComplete }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const q = QUESTIONS[current];
  const total = QUESTIONS.length;
  const progress = ((current) / total) * 100;

  const handleSelect = (option) => {
    setSelected(option);
  };

  const handleNext = () => {
    if (selected === null) return;
    setAnswers(prev => ({ ...prev, [q.id]: selected }));

    if (current + 1 >= total) {
      handleFinish({ ...answers, [q.id]: selected });
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  };

  const handleBack = () => {
    if (current === 0) return;
    setCurrent(c => c - 1);
    setSelected(answers[QUESTIONS[current - 1].id] || null);
  };

  const handleFinish = (finalAnswers) => {
    setSubmitting(true);

    // Aggregate skill scores per category
    const sums = { math: [], programming: [], communication: [], logic: [] };
    const interestVotes = {};

    QUESTIONS.forEach(q => {
      const ans = finalAnswers[q.id];
      if (!ans) return;
      if (q.category === "interest") {
        const v = ans.value;
        interestVotes[v] = (interestVotes[v] || 0) + 1;
      } else {
        sums[q.category].push(ans.score);
      }
    });

    const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 50;

    const profile = {
      math_score: avg(sums.math),
      programming_skill: avg(sums.programming),
      communication_skill: avg(sums.communication),
      logical_reasoning: avg(sums.logic),
      interest: Object.entries(interestVotes).sort((a, b) => b[1] - a[1])[0]?.[0] || "coding",
    };

    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      // Pass to parent or navigate
      if (onTestComplete) {
        onTestComplete(profile);
      } else {
        // Store in sessionStorage so DashboardPage can pick it up
        sessionStorage.setItem("skillTestProfile", JSON.stringify(profile));
        navigate("/", { state: { fromTest: true, profile } });
      }
    }, 1200);
  };

  if (done || submitting) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center">
          {submitting ? (
            <Loader2 className="w-8 h-8 text-[#00E5FF] animate-spin" />
          ) : (
            <CheckCircle2 className="w-8 h-8 text-[#00E5FF]" />
          )}
        </div>
        <p className="text-white font-mono text-lg uppercase tracking-widest animate-pulse">
          {submitting ? "Analyzing your profile..." : "Profile complete!"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-[#00E5FF]" />
          <span className="text-xs uppercase tracking-widest text-[#A1A1AA] font-mono">Skill Assessment</span>
        </div>
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: "'Unbounded', sans-serif" }}>
          DISCOVER YOUR <span className="text-[#00E5FF]">CAREER PATH</span>
        </h2>
        <p className="text-[#A1A1AA] text-sm mt-1 font-mono">
          Answer {total} questions — we'll auto-generate your skill profile & predict your best career.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-mono text-[#A1A1AA] mb-2">
          <span>Question {current + 1} of {total}</span>
          <span className="text-[#00E5FF]">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00E5FF] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden mb-4">
        {/* Category badge */}
        <div className="px-6 py-3 border-b border-white/10 flex items-center gap-2">
          <span
            className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm font-mono"
            style={{
              color: CATEGORY_COLORS[q.category],
              background: `${CATEGORY_COLORS[q.category]}15`,
              border: `1px solid ${CATEGORY_COLORS[q.category]}30`,
            }}
          >
            {CATEGORY_LABELS[q.category]}
          </span>
        </div>

        {/* Question text */}
        <div className="px-6 py-6">
          <p className="text-white text-lg font-medium leading-relaxed mb-6">{q.text}</p>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const isSelected = selected && (
                q.category === "interest"
                  ? selected.value === opt.value
                  : selected.score === opt.score && selected.label === opt.label
              );
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-4 py-3 rounded-sm border transition-all font-mono text-sm ${
                    isSelected
                      ? "border-[#00E5FF] bg-[#00E5FF]/10 text-[#00E5FF]"
                      : "border-white/10 bg-white/3 text-[#A1A1AA] hover:border-white/25 hover:text-white"
                  }`}
                >
                  <span className="mr-3 opacity-50">{String.fromCharCode(65 + i)}.</span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleBack}
          disabled={current === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-white/10 text-[#A1A1AA] hover:text-white hover:border-white/30 transition-all rounded-sm text-xs font-bold uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button
          onClick={handleNext}
          disabled={selected === null}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#00E5FF] text-[#030305] hover:bg-[#33EEFF] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all rounded-sm text-xs font-bold uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {current + 1 === total ? (
            <><Brain className="w-3.5 h-3.5" /> Generate My Profile</>
          ) : (
            <>Next <ChevronRight className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>
    </div>
  );
}

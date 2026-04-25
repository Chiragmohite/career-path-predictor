import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Crosshair, Brain, Code, MessageSquare, Lightbulb, Sparkles, Cpu } from "lucide-react";

const MODEL_OPTIONS = [
  { key: "random_forest",     label: "Random Forest" },
  { key: "knn",               label: "K-Nearest Neighbors" },
  { key: "svm",               label: "Support Vector Machine" },
  { key: "gradient_boosting", label: "Gradient Boosting" },
  { key: "mlp",               label: "Neural Network (MLP)" },
];

const SKILL_CONFIG = [
  { key: "math_score",           label: "Math Score",    icon: Brain,         color: "#00E5FF" },
  { key: "programming_skill",    label: "Programming",   icon: Code,          color: "#00E5FF" },
  { key: "communication_skill",  label: "Communication", icon: MessageSquare, color: "#00E5FF" },
  { key: "logical_reasoning",    label: "Logic",         icon: Lightbulb,     color: "#00E5FF" },
];

const INTERESTS = [
  { value: "data",           label: "Data & Analytics" },
  { value: "coding",         label: "Software Development" },
  { value: "management",     label: "Leadership & Management" },
  { value: "design",         label: "Design & Creative" },
  { value: "infrastructure", label: "Infrastructure & DevOps" },
  { value: "ai_ml",          label: "AI & Machine Learning" },
  { value: "security",       label: "Cybersecurity" },
  { value: "product",        label: "Product Management" },
];

export default function PredictionForm({ onSubmit, loading, prefillProfile }) {
  const [skills, setSkills] = useState({
    math_score: 50,
    programming_skill: 50,
    communication_skill: 50,
    logical_reasoning: 50,
  });
  const [interest, setInterest] = useState("");
  const [modelKey, setModelKey] = useState("random_forest");

  // Apply prefill from skill test
  useEffect(() => {
    if (prefillProfile) {
      setSkills({
        math_score: prefillProfile.math_score ?? 50,
        programming_skill: prefillProfile.programming_skill ?? 50,
        communication_skill: prefillProfile.communication_skill ?? 50,
        logical_reasoning: prefillProfile.logical_reasoning ?? 50,
      });
      if (prefillProfile.interest) setInterest(prefillProfile.interest);
    }
  }, [prefillProfile]);

  const handleSliderChange = (key, value) => {
    setSkills((prev) => ({ ...prev, [key]: value[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!interest) return;
    onSubmit({ ...skills, interest, model_key: modelKey });
  };

  return (
    <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden" data-testid="prediction-form-card">
      {/* Card header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
        <Crosshair className="w-4 h-4 text-[#00E5FF]" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
          Skill Profile
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {SKILL_CONFIG.map(({ key, label, icon: Icon }) => (
          <div key={key} className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-bold flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-[#00E5FF]" />
                {label}
              </Label>
              <span className="text-sm font-bold text-[#00E5FF] font-mono tabular-nums" data-testid={`skill-value-${key}`}>
                {skills[key]}
              </span>
            </div>
            <Slider
              data-testid={`skill-slider-${key}`}
              value={[skills[key]]}
              onValueChange={(v) => handleSliderChange(key, v)}
              min={0}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>
        ))}

        {/* Interest select */}
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-bold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
            Primary Interest
          </Label>
          <Select value={interest} onValueChange={setInterest}>
            <SelectTrigger
              data-testid="interest-select-trigger"
              className="bg-[#030305] border-white/10 text-white rounded-sm focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] font-mono h-11"
            >
              <SelectValue placeholder="Select your interest" />
            </SelectTrigger>
            <SelectContent className="bg-[#0D0D12] border-white/10">
              {INTERESTS.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  data-testid={`interest-option-${item.value}`}
                  className="text-white hover:bg-[#00E5FF]/10 font-mono focus:bg-[#00E5FF]/10 focus:text-[#00E5FF]"
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model select */}
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-bold flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#00E5FF]" />
            ML Model
          </Label>
          <Select value={modelKey} onValueChange={setModelKey}>
            <SelectTrigger
              data-testid="model-select-trigger"
              className="bg-[#030305] border-white/10 text-white rounded-sm focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] font-mono h-11"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0D0D12] border-white/10">
              {MODEL_OPTIONS.map((item) => (
                <SelectItem
                  key={item.key}
                  value={item.key}
                  data-testid={`model-option-${item.key}`}
                  className="text-white hover:bg-[#00E5FF]/10 font-mono focus:bg-[#00E5FF]/10 focus:text-[#00E5FF]"
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          data-testid="predict-submit-button"
          type="submit"
          disabled={loading || !interest}
          className="w-full bg-[#00E5FF] text-[#030305] font-bold uppercase tracking-widest hover:bg-[#33EEFF] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all rounded-sm px-6 py-3 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-pulse">ANALYZING...</span>
          ) : (
            <>
              <Crosshair className="w-4 h-4" />
              Run Prediction
            </>
          )}
        </button>
      </form>
    </div>
  );
}
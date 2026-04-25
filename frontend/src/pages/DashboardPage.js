import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import PredictionForm from "@/components/PredictionForm";
import PredictionResult from "@/components/PredictionResult";
import SkillRadarChart from "@/components/SkillRadarChart";
import FeatureImportanceChart from "@/components/FeatureImportanceChart";
import SkillRecommendations from "@/components/SkillRecommendations";
import AiInsights from "@/components/AiInsights";
import CareerRoadmap from "@/components/CareerRoadmap";
import CareerCompare from "@/components/CareerCompare";
<<<<<<< HEAD
import { Cpu, Zap } from "lucide-react";
=======
import WhatIfSimulator from "@/components/WhatIfSimulator";
import ShapExplainer from "@/components/ShapExplainer";
import ResumeScanner from "@/components/ResumeScanner";
import { Cpu } from "lucide-react";
>>>>>>> d6cbf5fa183ecb04664172c29753bee2aed8bc04

export default function DashboardPage() {
  const { token } = useAuth();
  const location = useLocation();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [lastFormData, setLastFormData] = useState(null);
  const [prefillProfile, setPrefillProfile] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  // Pick up profile passed from SkillTestPage
  useEffect(() => {
    if (location.state?.fromTest && location.state?.profile) {
      setPrefillProfile(location.state.profile);
      toast.success("Skill profile loaded from your test!");
    } else {
      // Also check sessionStorage fallback
      const stored = sessionStorage.getItem("skillTestProfile");
      if (stored) {
        try {
          setPrefillProfile(JSON.parse(stored));
          sessionStorage.removeItem("skillTestProfile");
          toast.success("Skill profile loaded from your test!");
        } catch {}
      }
    }
  }, [location.state]);

  const handlePredict = async (formData) => {
    setLoading(true);
    setPrediction(null);
    setAiInsights(null);
    setLastFormData(formData);
    try {
      const res = await axios.post(`${API}/predict`, formData, { headers });
      setPrediction(res.data);
      axios.post(`${API}/predictions/save`, formData, { headers }).catch(() => {});
      toast.success("Analysis complete");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGetInsights = async () => {
    if (!lastFormData) return;
    setAiLoading(true);
    try {
      const res = await axios.post(`${API}/ai-insights`, lastFormData, { headers });
      setAiInsights(res.data.ai_insights);
      toast.success("AI analysis complete");
    } catch (err) {
      toast.error("AI insights unavailable");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div data-testid="dashboard-page">
      <div className="flex items-center gap-3 mb-6 text-xs text-[#A1A1AA] font-mono">
        <Cpu className="w-4 h-4 text-[#00E5FF]" />
        <span className="uppercase tracking-widest">5 Models Active // Random Forest + KNN + SVM + Gradient Boosting + MLP</span>
        <span className="w-2 h-2 bg-[#00E5FF] rounded-full animate-pulse" />
      </div>

      {prefillProfile && !prediction && (
        <div className="mb-4 px-4 py-3 bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#00E5FF]" />
          <span className="text-xs font-mono text-[#00E5FF]">
            Skill profile pre-filled from your test. Hit <strong>Run Prediction</strong> to see your career match!
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PredictionForm onSubmit={handlePredict} loading={loading} prefillProfile={prefillProfile} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          {prediction ? (
            <>
              <PredictionResult prediction={prediction} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkillRadarChart prediction={prediction} />
                <FeatureImportanceChart prediction={prediction} />
              </div>
              <SkillRecommendations prediction={prediction} />
              <AiInsights insights={aiInsights} loading={aiLoading} onGenerate={handleGetInsights} />
<<<<<<< HEAD
              {prediction.roadmap && prediction.roadmap.length > 0 && (
                <CareerRoadmap roadmap={prediction.roadmap} career={prediction.predicted_career} />
              )}
=======
              {prediction.roadmap?.length > 0 && (
                <CareerRoadmap roadmap={prediction.roadmap} career={prediction.predicted_career} />
              )}
              <ShapExplainer lastFormData={lastFormData} />
              <WhatIfSimulator lastFormData={lastFormData} />
              <ResumeScanner predictedCareer={prediction.predicted_career} />
>>>>>>> d6cbf5fa183ecb04664172c29753bee2aed8bc04
              <CareerCompare />
            </>
          ) : (
            <div className="bg-[#0D0D12] border border-white/10 rounded-sm p-12 flex flex-col items-center justify-center min-h-[400px]" data-testid="empty-state">
              <div className="w-16 h-16 border border-white/10 rounded-sm flex items-center justify-center mb-6">
                <Cpu className="w-8 h-8 text-[#A1A1AA]/30" />
              </div>
              <p className="text-[#A1A1AA] text-sm font-mono text-center uppercase tracking-widest">Awaiting input parameters</p>
              <p className="text-[#A1A1AA]/50 text-xs font-mono mt-2 text-center">Configure your skill profile to begin analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}

>>>>>>> d6cbf5fa183ecb04664172c29753bee2aed8bc04

import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import ModelComparison from "@/components/ModelComparison";
import ConfusionMatrixChart from "@/components/ConfusionMatrixChart";
import RocCurveChart from "@/components/RocCurveChart";
import LearningCurveChart from "@/components/LearningCurveChart";
import { FlaskConical, GitCompare, Grid3x3, TrendingUp, GraduationCap, Settings, RefreshCw } from "lucide-react";

const MODEL_OPTIONS = [
  { key: "random_forest", label: "Random Forest" },
  { key: "knn", label: "K-Nearest Neighbors" },
  { key: "svm", label: "Support Vector Machine" },
  { key: "gradient_boosting", label: "Gradient Boosting" },
  { key: "mlp", label: "Neural Network (MLP)" },
];

export default function ModelLabPage() {
  const { token } = useAuth();
  const [comparison, setComparison] = useState(null);
  const [selectedModel, setSelectedModel] = useState("random_forest");
  const [confusionData, setConfusionData] = useState(null);
  const [rocData, setRocData] = useState(null);
  const [learningData, setLearningData] = useState(null);
  const [crossValData, setCrossValData] = useState(null);
  const [loadingSection, setLoadingSection] = useState({});

  // Custom training state
  const [customParams, setCustomParams] = useState({
    n_estimators: 100, max_depth: 10, n_neighbors: 5,
  });
  const [trainLoading, setTrainLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (token) fetchComparison();
  }, [token]);
  useEffect(() => { if (token) fetchComparison(); }, [token]);


  useEffect(() => {
    if (token) fetchModelData(selectedModel);
  }, [selectedModel, token]);
  useEffect(() => { if (token) fetchModelData(selectedModel); }, [selectedModel, token]);

  const fetchComparison = async () => {
    try {
      const res = await axios.get(`${API}/models/compare`, { headers });
      setComparison(res.data.models);
    } catch { toast.error("Failed to load model comparison"); }
  };

  const fetchModelData = async (model) => {
    setLoadingSection({ confusion: true, roc: true, learning: true, cv: true });
    
    // Load each independently for faster rendering
    axios.get(`${API}/models/confusion-matrix?model_key=${model}`, { headers })
      .then(res => { setConfusionData(res.data); setLoadingSection(prev => ({...prev, confusion: false})); })
      .catch(() => setLoadingSection(prev => ({...prev, confusion: false})));
    
    axios.get(`${API}/models/roc-curve?model_key=${model}`, { headers })
      .then(res => { setRocData(res.data); setLoadingSection(prev => ({...prev, roc: false})); })
      .catch(() => setLoadingSection(prev => ({...prev, roc: false})));
    
    axios.get(`${API}/models/learning-curve?model_key=${model}`, { headers })
      .then(res => { setLearningData(res.data); setLoadingSection(prev => ({...prev, learning: false})); })
      .catch(() => setLoadingSection(prev => ({...prev, learning: false})));
    
    axios.get(`${API}/models/cross-validation?model_key=${model}`, { headers })
      .then(res => { setCrossValData(res.data); setLoadingSection(prev => ({...prev, cv: false})); })
      .catch(() => setLoadingSection(prev => ({...prev, cv: false})));
  };

  const handleCustomTrain = async () => {
    setTrainLoading(true);
    let params = {};
    if (selectedModel === "random_forest") {
      params = { n_estimators: customParams.n_estimators, max_depth: customParams.max_depth, random_state: 42 };
    } else if (selectedModel === "knn") {
      params = { n_neighbors: customParams.n_neighbors };
    } else if (selectedModel === "svm") {
      params = { kernel: "rbf", probability: true, random_state: 42 };
    } else if (selectedModel === "gradient_boosting") {
      params = { n_estimators: customParams.n_estimators, max_depth: customParams.max_depth, random_state: 42 };
    } else if (selectedModel === "mlp") {
      params = { hidden_layer_sizes: [64, 32], max_iter: 500, random_state: 42 };
    }
    try {
      await axios.post(`${API}/models/train-custom`, { model_key: selectedModel, params }, { headers });
      toast.success("Model retrained successfully");
      fetchComparison();
      fetchModelData(selectedModel);
    } catch (err) { toast.error(err.response?.data?.detail || "Training failed"); }
    setTrainLoading(false);
  };

  return (
    <div data-testid="model-lab-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-5 h-5 text-[#00E5FF]" />
          <h2 className="text-xl font-bold tracking-tighter text-white uppercase" style={{ fontFamily: "'Unbounded', sans-serif" }}>
            Model Laboratory
          </h2>
        </div>
        <div className="w-56">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger data-testid="model-select-trigger" className="bg-[#030305] border-white/10 text-white rounded-sm font-mono h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0D0D12] border-white/10">
              {MODEL_OPTIONS.map((m) => (
                <SelectItem key={m.key} value={m.key} data-testid={`model-option-${m.key}`}
                  className="text-white hover:bg-[#00E5FF]/10 font-mono text-xs focus:bg-[#00E5FF]/10 focus:text-[#00E5FF]">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Model Comparison Table */}
      {comparison && <ModelComparison models={comparison} />}

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ConfusionMatrixChart data={confusionData} loading={loadingSection.confusion} modelName={MODEL_OPTIONS.find(m=>m.key===selectedModel)?.label} />
        <RocCurveChart data={rocData} loading={loadingSection.roc} modelName={MODEL_OPTIONS.find(m=>m.key===selectedModel)?.label} />
        <LearningCurveChart data={learningData} loading={loadingSection.learning} modelName={MODEL_OPTIONS.find(m=>m.key===selectedModel)?.label} />

        {/* Cross-Validation */}
        <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden" data-testid="cross-validation-card">
          <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#00E5FF]" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
              Cross-Validation
            </h3>
          </div>
          <div className="p-6">
            {crossValData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#A1A1AA] uppercase tracking-widest font-bold">Mean Accuracy</span>
                  <span className="text-2xl font-black text-[#00E5FF] font-mono" data-testid="cv-mean-score">
                    {(crossValData.mean * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-[#A1A1AA] font-mono">
                  Std: {'\u00B1'}{(crossValData.std * 100).toFixed(2)}% | Folds: {crossValData.folds}
                </div>
                <div className="flex gap-2 mt-3">
                  {crossValData.scores.map((score, i) => (
                    <div key={i} className="flex-1 text-center">
                      <div className="h-16 bg-white/5 rounded-sm relative overflow-hidden">
                        <div className="absolute bottom-0 w-full bg-[#00E5FF]/30 transition-all duration-500"
                          style={{ height: `${score * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-[#A1A1AA] font-mono mt-1 block">F{i + 1}</span>
                      <span className="text-[10px] text-white font-mono">{(score * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-[#A1A1AA]/50 text-xs animate-pulse">Loading...</div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Training */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden" data-testid="custom-training-card">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
            Custom Training
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(selectedModel === "random_forest" || selectedModel === "gradient_boosting") && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-bold">N Estimators</Label>
                    <span className="text-sm font-bold text-[#00E5FF] font-mono">{customParams.n_estimators}</span>
                  </div>
                  <Slider data-testid="slider-n-estimators" value={[customParams.n_estimators]}
                    onValueChange={(v) => setCustomParams(p => ({ ...p, n_estimators: v[0] }))}
                    min={10} max={500} step={10} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-bold">Max Depth</Label>
                    <span className="text-sm font-bold text-[#00E5FF] font-mono">{customParams.max_depth}</span>
                  </div>
                  <Slider data-testid="slider-max-depth" value={[customParams.max_depth]}
                    onValueChange={(v) => setCustomParams(p => ({ ...p, max_depth: v[0] }))}
                    min={2} max={30} step={1} />
                </div>
              </>
            )}
            {selectedModel === "knn" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-bold">N Neighbors</Label>
                  <span className="text-sm font-bold text-[#00E5FF] font-mono">{customParams.n_neighbors}</span>
                </div>
                <Slider data-testid="slider-n-neighbors" value={[customParams.n_neighbors]}
                  onValueChange={(v) => setCustomParams(p => ({ ...p, n_neighbors: v[0] }))}
                  min={1} max={20} step={1} />
              </div>
            )}
            {(selectedModel === "svm" || selectedModel === "mlp") && (
              <div className="text-xs text-[#A1A1AA] font-mono">
                Default hyperparameters used for {MODEL_OPTIONS.find(m=>m.key===selectedModel)?.label}.
              </div>
            )}
          </div>
          <button data-testid="retrain-button" onClick={handleCustomTrain} disabled={trainLoading}
            className="mt-6 bg-[#00E5FF] text-[#030305] font-bold uppercase tracking-widest hover:bg-[#33EEFF] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all rounded-sm px-6 py-2.5 disabled:opacity-30 flex items-center gap-2 text-sm">
            <RefreshCw className={`w-4 h-4 ${trainLoading ? "animate-spin" : ""}`} />
            {trainLoading ? "Training..." : "Retrain Model"}
          </button>
        </div>
      </div>
    </div>
  );
}

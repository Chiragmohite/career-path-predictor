import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Clock, Trash2, Brain } from "lucide-react";

export default function HistoryPage() {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${token}` };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchHistory(); }, [token]);
  useEffect(() => { if (token) fetchHistory(); }, [token]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/predictions/history`, { headers });
      setHistory(res.data.history);
    } catch { toast.error("Failed to load history"); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/predictions/history/${id}`, { headers });
      setHistory((h) => h.filter((p) => p.id !== id));
      toast.success("Prediction deleted");
    } catch { toast.error("Delete failed"); }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div data-testid="history-page" className="space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 text-[#00E5FF]" />
        <h2 className="text-xl font-bold tracking-tighter text-white uppercase" style={{ fontFamily: "'Unbounded', sans-serif" }}>
          Prediction History
        </h2>
        <span className="text-xs text-[#A1A1AA] font-mono">{history.length} records</span>
      </div>

      {loading ? (
        <div className="text-center text-[#A1A1AA] text-sm animate-pulse py-20 font-mono">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="bg-[#0D0D12] border border-white/10 rounded-sm p-12 text-center" data-testid="empty-history">
          <Clock className="w-12 h-12 text-[#A1A1AA]/20 mx-auto mb-4" />
          <p className="text-[#A1A1AA] text-sm font-mono uppercase tracking-widest">No predictions yet</p>
          <p className="text-[#A1A1AA]/50 text-xs font-mono mt-1">Run predictions to see them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="bg-[#0D0D12] border border-white/10 rounded-sm p-5 hover:border-[#00E5FF]/30 transition-colors" data-testid={`history-item-${item.id}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Brain className="w-4 h-4 text-[#00E5FF]" />
                    <span className="text-base font-bold text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
                      {item.result?.predicted_career}
                    </span>
                    <span className="text-sm font-bold text-[#00E5FF] font-mono">{item.result?.confidence}%</span>
                    <span className="text-xs text-[#A1A1AA]/50 font-mono">{item.result?.model_used}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs font-mono text-[#A1A1AA]">
                    <span>Math: <span className="text-white">{item.input?.math_score}</span></span>
                    <span>Prog: <span className="text-white">{item.input?.programming_skill}</span></span>
                    <span>Comm: <span className="text-white">{item.input?.communication_skill}</span></span>
                    <span>Logic: <span className="text-white">{item.input?.logical_reasoning}</span></span>
                    <span>Interest: <span className="text-[#00E5FF]">{item.input?.interest}</span></span>
                  </div>
                  <div className="mt-2 text-[10px] text-[#A1A1AA]/50 font-mono">{formatDate(item.created_at)}</div>
                </div>
                <button onClick={() => handleDelete(item.id)} data-testid={`delete-history-${item.id}`}
                  className="p-2 text-[#A1A1AA] hover:text-[#FF0055] hover:bg-[#FF0055]/10 rounded-sm transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

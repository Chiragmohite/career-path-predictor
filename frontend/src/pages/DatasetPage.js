import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";

export default function DatasetPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { if (token) fetchData(); }, [page, token]);
 // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [token]);
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/dataset?page=${page}&page_size=50`, { headers });
      setData(res.data);
    } catch { toast.error("Failed to load dataset"); }
    setLoading(false);
  };

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;

  return (
    <div data-testid="dataset-page" className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="w-5 h-5 text-[#00E5FF]" />
        <h2 className="text-xl font-bold tracking-tighter text-white uppercase" style={{ fontFamily: "'Unbounded', sans-serif" }}>
          Dataset Explorer
        </h2>
        {data && <span className="text-xs text-[#A1A1AA] font-mono">{data.total} samples</span>}
      </div>

      {/* Stats cards */}
      {data?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.stats.feature_stats).map(([key, stats]) => (
            <div key={key} className="bg-[#0D0D12] border border-white/10 rounded-sm p-4" data-testid={`stat-card-${key}`}>
              <div className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-bold mb-2">
                {key.replace(/_/g, " ")}
              </div>
              <div className="text-xl font-black text-[#00E5FF] font-mono">{stats.mean}</div>
              <div className="text-[10px] text-[#A1A1AA] font-mono mt-1">
                Range: {stats.min}-{stats.max} | Std: {stats.std}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Distribution cards */}
      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0D0D12] border border-white/10 rounded-sm p-6" data-testid="career-distribution">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-bold">Career Distribution</span>
            </div>
            <div className="space-y-2">
              {Object.entries(data.stats.career_distribution).map(([career, count]) => (
                <div key={career} className="flex items-center justify-between">
                  <span className="text-xs text-white font-mono">{career}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00E5FF] rounded-full" style={{ width: `${(count / data.total) * 100}%` }} />
                    </div>
                    <span className="text-xs text-[#A1A1AA] font-mono w-10 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#0D0D12] border border-white/10 rounded-sm p-6" data-testid="interest-distribution">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-[#FF0055]" />
              <span className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-bold">Interest Distribution</span>
            </div>
            <div className="space-y-2">
              {Object.entries(data.stats.interest_distribution).map(([interest, count]) => (
                <div key={interest} className="flex items-center justify-between">
                  <span className="text-xs text-white font-mono">{interest}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF0055] rounded-full" style={{ width: `${(count / data.total) * 100}%` }} />
                    </div>
                    <span className="text-xs text-[#A1A1AA] font-mono w-10 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-[#00E5FF] text-xs uppercase tracking-widest font-bold font-mono">#</TableHead>
                <TableHead className="text-[#00E5FF] text-xs uppercase tracking-widest font-bold font-mono">Math</TableHead>
                <TableHead className="text-[#00E5FF] text-xs uppercase tracking-widest font-bold font-mono">Prog</TableHead>
                <TableHead className="text-[#00E5FF] text-xs uppercase tracking-widest font-bold font-mono">Comm</TableHead>
                <TableHead className="text-[#00E5FF] text-xs uppercase tracking-widest font-bold font-mono">Logic</TableHead>
                <TableHead className="text-[#00E5FF] text-xs uppercase tracking-widest font-bold font-mono">Interest</TableHead>
                <TableHead className="text-[#00E5FF] text-xs uppercase tracking-widest font-bold font-mono">Career</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.map((row, i) => (
                <TableRow key={i} className="border-white/5 hover:bg-[#00E5FF]/5">
                  <TableCell className="text-[#A1A1AA] text-xs font-mono">{(page - 1) * 50 + i + 1}</TableCell>
                  <TableCell className="text-white text-xs font-mono">{row.math_score}</TableCell>
                  <TableCell className="text-white text-xs font-mono">{row.programming_skill}</TableCell>
                  <TableCell className="text-white text-xs font-mono">{row.communication_skill}</TableCell>
                  <TableCell className="text-white text-xs font-mono">{row.logical_reasoning}</TableCell>
                  <TableCell className="text-xs font-mono">
                    <span className="px-2 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] rounded-sm">{row.interest}</span>
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    <span className="px-2 py-0.5 bg-[#FF0055]/10 text-[#FF0055] rounded-sm">{row.career}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-[#A1A1AA] font-mono">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button data-testid="dataset-prev-page" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 border border-white/10 text-[#A1A1AA] hover:text-[#00E5FF] hover:border-[#00E5FF]/30 rounded-sm disabled:opacity-30 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button data-testid="dataset-next-page" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 border border-white/10 text-[#A1A1AA] hover:text-[#00E5FF] hover:border-[#00E5FF]/30 rounded-sm disabled:opacity-30 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export default function AiInsights({ insights, loading, onGenerate }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#0D0D12] border border-white/10 rounded-sm overflow-hidden" data-testid="ai-insights-card">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF0055]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Unbounded', sans-serif" }}>
            AI Career Advisor
          </h3>
          <span className="text-[10px] text-[#A1A1AA] font-mono">Groq</span>
        </div>
        {!insights && (
          <button data-testid="generate-insights-button" onClick={onGenerate} disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#FF0055] text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[#FF3377] hover:shadow-[0_0_15px_rgba(255,0,85,0.4)] transition-all disabled:opacity-30">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {loading ? "Analyzing..." : "Generate Insights"}
          </button>
        )}
      </div>

      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-8 gap-3" data-testid="ai-loading">
            <Loader2 className="w-5 h-5 text-[#FF0055] animate-spin" />
            <span className="text-sm text-[#A1A1AA] font-mono animate-pulse">Groq is analyzing your career profile...</span>
          </div>
        )}

        {!loading && !insights && (
          <div className="text-center py-6" data-testid="ai-empty-state">
            <Sparkles className="w-10 h-10 text-[#A1A1AA]/20 mx-auto mb-3" />
            <p className="text-xs text-[#A1A1AA] font-mono uppercase tracking-widest">Click Generate to get AI-powered career advice</p>
          </div>
        )}

        {insights && insights.status === "success" && (
          <div data-testid="ai-insights-content">
            <div className={`prose prose-invert prose-sm max-w-none font-mono text-[#A1A1AA] leading-relaxed ${!expanded ? "max-h-64 overflow-hidden relative" : ""}`}>
              <div className="whitespace-pre-wrap text-xs" dangerouslySetInnerHTML={{
                __html: insights.insights
                  ?.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                  ?.replace(/### (.*)/g, '<h4 class="text-[#00E5FF] text-sm font-bold uppercase tracking-widest mt-4 mb-2" style="font-family: \'Unbounded\', sans-serif">$1</h4>')
                  ?.replace(/## (.*)/g, '<h3 class="text-[#00E5FF] text-sm font-bold uppercase tracking-widest mt-4 mb-2" style="font-family: \'Unbounded\', sans-serif">$1</h3>')
                  ?.replace(/- (.*)/g, '<div class="flex items-start gap-2 my-1"><span class="text-[#FF0055] mt-0.5">&#9656;</span><span>$1</span></div>')
                  ?.replace(/\d\. (.*)/g, '<div class="flex items-start gap-2 my-1"><span class="text-[#00E5FF] font-bold">&#8250;</span><span>$1</span></div>')
                  || ""
              }} />
              {!expanded && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0D0D12] to-transparent" />
              )}
            </div>
            <button data-testid="toggle-insights-expand" onClick={() => setExpanded(!expanded)}
              className="mt-3 text-xs text-[#00E5FF] font-mono uppercase tracking-widest hover:text-[#33EEFF] transition-colors">
              {expanded ? "Show less" : "Show more"}
            </button>
          </div>
        )}

        {insights && insights.status === "error" && (
          <div className="text-center py-6" data-testid="ai-error">
            <p className="text-xs text-[#FF0055] font-mono">AI service unavailable. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}

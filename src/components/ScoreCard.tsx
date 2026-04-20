import { motion } from "motion/react";
import { AnalysisResult } from "../utils/analyzer";
import { CheckCircle2, AlertCircle, Sparkles, Target, MessageSquare, Tag, XCircle, Languages, Linkedin } from "lucide-react";

interface ScoreCardProps {
  result: AnalysisResult | null;
}

export default function ScoreCard({ result }: ScoreCardProps) {
  if (!result) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10";
    if (score >= 50) return "bg-amber-500/10 border-amber-500/20 shadow-amber-500/10";
    return "bg-rose-500/10 border-rose-500/20 shadow-rose-500/10";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-12 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      {/* Left Column: Scores and Keywords */}
      <div className="lg:col-span-4 space-y-6">
        {/* Main Score Badge */}
        <div className={`p-8 rounded-3xl border shadow-2xl text-center relative overflow-hidden transition-all duration-500 ${getScoreBg(result.score)}`}>
          {result.languageDetected && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 text-gray-400 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/5">
              <Languages size={12} />
              {result.languageDetected}
            </div>
          )}
          <div className="flex items-center gap-2 mb-4 justify-center text-gray-400">
            <Sparkles size={18} className="animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">ATS Match Score</span>
          </div>
          <div className="relative inline-block">
            <p className={`text-7xl font-black tracking-tighter ${getScoreColor(result.score)}`}>
              {result.score}<span className="text-2xl text-gray-500 font-medium tracking-normal">/100</span>
            </p>
          </div>
        </div>

        {/* JD Match Score (If available) */}
        {result.jdMatchScore !== undefined && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/20 shadow-xl text-center relative overflow-hidden group interactive-border"
          >
            <div className="flex items-center gap-2 mb-2 justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Target size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Job Fit Match</span>
            </div>
            <p className={`text-6xl font-black tracking-tighter ${getScoreColor(result.jdMatchScore)}`}>
              {result.jdMatchScore}<span className="text-xl text-indigo-500/30 font-medium">%</span>
            </p>
          </motion.div>
        )}

        {/* Keywords */}
        <div className="p-6 glass-card rounded-3xl space-y-6 interactive-border">
          <h3 className="text-xs font-bold flex items-center gap-2 text-slate-400 uppercase tracking-[0.15em]">
            <Tag size={16} className="text-indigo-400" />
            Keywords Intelligence
          </h3>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] text-emerald-400 uppercase font-black mb-3 tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Found Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {result.keywordsFound?.map((kw, i) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-300 text-[10px] font-bold rounded-lg border border-emerald-500/20 backdrop-blur-sm transition-colors hover:bg-emerald-500/20">{kw}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-rose-400 uppercase font-black mb-3 tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Missing Opportunities
              </p>
              <div className="flex flex-wrap gap-2">
                {result.keywordsMissing?.map((kw, i) => (
                  <span key={i} className="px-3 py-1.5 bg-rose-500/10 text-rose-300 text-[10px] font-bold rounded-lg border border-rose-500/20 backdrop-blur-sm transition-colors hover:bg-rose-500/20">{kw}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Insights */}
      <div className="lg:col-span-8 space-y-6">
        {/* Strategic Suggestions */}
        <div className="p-8 glass-card rounded-3xl interactive-border">
          <h3 className="text-xl font-bold flex items-center gap-3 mb-8 text-white">
            <AlertCircle size={24} className="text-indigo-400" />
            Strategic Enhancements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.suggestions.map((suggestion, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-5 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-all group"
              >
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <CheckCircle2 size={14} />
                </div>
                <span className="text-slate-300 text-xs leading-relaxed font-medium group-hover:text-white transition-colors">{suggestion}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Interview Prep */}
        <div className="p-8 bg-indigo-600/[0.03] rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-colors"></div>
          <h3 className="text-xl font-bold flex items-center gap-3 mb-8 text-white">
            <MessageSquare size={24} className="text-indigo-400" />
            Candidate Q&A Predictions
          </h3>
          <div className="space-y-4 relative z-10">
            {result.interviewQuestions?.map((q, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 * i }}
                className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-indigo-500/40 hover:bg-white/[0.06] transition-all"
              >
                <p className="text-sm text-slate-300 leading-relaxed">
                  <span className="text-indigo-500 font-black mr-3 opacity-60">#{i+1}</span> {q}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* LinkedIn Tips */}
        {result.linkedInTips && result.linkedInTips.length > 0 && (
          <div className="p-8 bg-blue-500/[0.03] rounded-3xl border border-blue-500/20 shadow-2xl">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-8 text-white">
              <Linkedin size={24} className="text-blue-400" />
              Professional Presence Optimization
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.linkedInTips.map((tip, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i }}
                  className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-start gap-3 hover:bg-blue-500/10 transition-colors"
                >
                  <Sparkles size={16} className="text-blue-400 mt-1 flex-shrink-0" />
                  <p className="text-xs text-blue-100 leading-relaxed font-medium">{tip}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Observation & Quote */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          <div className="p-6 glass-card rounded-3xl border-indigo-500/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-10"><Sparkles size={40} /></div>
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">AI Deep Insight</h4>
            <p className="text-white text-sm italic font-medium leading-relaxed">"{result.improvementIdea}"</p>
          </div>
          <div className="p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 flex items-center justify-center text-center relative">
            <div className="absolute -z-10 w-full h-full bg-indigo-500/5 blur-2xl rounded-full"></div>
            <p className="text-indigo-100 font-serif italic text-xl leading-snug">"{result.motivationalQuote}"</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

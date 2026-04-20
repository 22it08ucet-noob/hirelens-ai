import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Upload from "./components/Upload";
import ScoreCard from "./components/ScoreCard";
import { AnalysisResult } from "./utils/analyzer";
import { Eye, Flame } from "lucide-react";

export default function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  return (
    <div className="min-h-screen text-slate-200 selection:bg-indigo-500/30">
      <div className="mesh-gradient" />
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <Flame size={12} className="fill-indigo-400" />
            AI-Powered Analysis
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-4 flex items-center justify-center gap-4">
            HireLens AI <Eye className="text-indigo-500" size={48} />
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">
            See your resume through the eyes of recruiters. Optimize your ATS score and get hired faster.
          </p>
        </motion.div>

        <Upload setResult={setResult} result={result} />
        
        <AnimatePresence mode="wait">
          {result && <ScoreCard result={result} />}
        </AnimatePresence>

        <footer className="mt-24 text-slate-500 text-sm flex flex-col md:flex-row items-center gap-2 md:gap-4 border-t border-white/5 pt-8 w-full justify-center">
          <span>© 2026 HireLens AI</span>
          <span className="hidden md:inline w-1 h-1 rounded-full bg-slate-700"></span>
          <a 
            href="https://22it08ucet-noob.github.io/karthickraja26-portfolio/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
          >
            Crafted with <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>❤️</motion.span> by 
            <span className="font-semibold text-slate-400 group-hover:text-indigo-400 border-b border-transparent group-hover:border-indigo-400/50">Karthick</span>
          </a>
        </footer>
      </div>
    </div>
  );
}

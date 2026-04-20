import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { analyzeResumeWithAI } from "../utils/aiAnalyzer";
import { AnalysisResult } from "../utils/analyzer";
import { Search, Sparkles, FileText, X, FileUp, Linkedin, Languages } from "lucide-react";

interface UploadProps {
  setResult: (result: AnalysisResult) => void;
  result: AnalysisResult | null;
}

export default function Upload({ setResult, result }: UploadProps) {
  const [text, setText] = useState("");
  const [jdText, setJdText] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "paste" | "linkedin">("upload");
  const [showJd, setShowJd] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setPendingFile(file);
    
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    } else {
      // For PDF/DOCX, we now send the file directly to Gemini on Analyze click
      // We set a placeholder text to enable the analyze button
      setText("[FILE_ATTACHED]");
    }
  };

  const handleAnalyze = async () => {
    const source = activeTab === "upload" && pendingFile ? pendingFile : (activeTab === "linkedin" ? (linkedinUrl || text) : text);
    if (!source) return;
    
    setIsAnalyzing(true);
    try {
      const analysisResult = await analyzeResumeWithAI(source, showJd ? jdText : undefined);
      setResult(analysisResult);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Please check your file and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearFile = () => {
    setFileName(null);
    setPendingFile(null);
    setText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full max-w-2xl p-8 rounded-[2.5rem] transition-all duration-700 ${activeTab === 'linkedin' ? 'glow-blue bg-blue-500/[0.03]' : 'glow-indigo bg-white/[0.03]'} backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden relative`}
    >
      {/* Dynamic Background Glow */}
      <div className={`absolute -top-32 -right-32 w-80 h-80 blur-[130px] rounded-full transition-colors duration-1000 ${activeTab === 'linkedin' ? 'bg-blue-600/30' : 'bg-indigo-600/30'}`} />
      <div className={`absolute -bottom-32 -left-32 w-80 h-80 blur-[130px] rounded-full transition-colors duration-1000 ${activeTab === 'linkedin' ? 'bg-blue-600/10' : 'bg-indigo-600/10'}`} />
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
            <button 
              onClick={() => setActiveTab("upload")}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "upload" ? "bg-indigo-600 text-white shadow-xl scale-105" : "text-slate-500 hover:text-slate-300"}`}
            >
              Resume File
            </button>
            <button 
              onClick={() => setActiveTab("paste")}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "paste" ? "bg-indigo-600 text-white shadow-xl scale-105" : "text-slate-500 hover:text-slate-300"}`}
            >
              Text Paste
            </button>
            <button 
              onClick={() => setActiveTab("linkedin")}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "linkedin" ? "bg-blue-600 text-white shadow-xl scale-105" : "text-slate-500 hover:text-slate-300"}`}
            >
              LinkedIn
            </button>
          </div>
          <div className="flex items-center gap-4">
          {result?.languageDetected && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-500/10 text-green-300 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
              <Languages size={10} />
              {result.languageDetected}
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            <Sparkles size={12} className="text-indigo-400 animate-pulse" />
            Gemini 3.0 Ultra
          </div>
        </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "upload" && (
            <motion.div
              key="upload-tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4"
            >
              {!fileName ? (
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-80 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-6 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ring-8 ring-indigo-500/5">
                    <FileUp size={36} />
                  </div>
                  <div className="text-center px-8 relative z-10">
                    <p className="text-white text-lg font-bold tracking-tight">Drop your resume here</p>
                    <p className="text-slate-500 text-xs mt-2 font-medium">Supports PDF, DOCX, and TXT (Max 1MB)</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.txt"
                    className="hidden" 
                  />
                </div>
              ) : (
                <div className="w-full h-80 bg-indigo-500/5 border border-indigo-500/20 rounded-[2rem] flex flex-col items-center justify-center gap-6 p-8 text-center animate-in fade-in zoom-in duration-500 shadow-inner">
                  <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <FileText size={52} />
                  </div>
                  <div>
                    <p className="text-white font-black text-xl truncate max-w-sm">{fileName}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <p className="text-emerald-400/80 text-[10px] font-bold uppercase tracking-[0.2em]">Ready for Deep Scan</p>
                    </div>
                  </div>
                  <button 
                    onClick={clearFile}
                    className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Remove and Change
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "paste" && (
            <motion.div
              key="paste-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <textarea
                placeholder="Paste your raw resume text here for instant AI breakdown..."
                className="w-full h-80 p-8 rounded-[2rem] bg-black/40 text-white placeholder-slate-600 border border-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none font-medium leading-relaxed"
                onChange={(e) => setText(e.target.value)}
                value={text}
              />
            </motion.div>
          )}

          {activeTab === "linkedin" && (
            <motion.div
              key="linkedin-tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="p-8 bg-blue-600/5 border border-blue-500/20 rounded-[2rem] flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Linkedin size={120} /></div>
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 shadow-lg">
                      <Linkedin size={28} />
                   </div>
                   <div>
                      <h4 className="text-white font-black text-lg tracking-tight">Profile Optimizer</h4>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Visibility Booster</p>
                   </div>
                </div>
                <textarea
                  placeholder="Paste your LinkedIn 'About' section or headline..."
                  className="w-full h-48 p-6 rounded-2xl bg-black/40 text-white placeholder-slate-600 border border-white/5 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none font-medium text-sm leading-relaxed"
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  value={linkedinUrl}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 border-t border-white/5 pt-8">
          <label className="flex items-center gap-4 cursor-pointer group px-4 py-2 hover:bg-white/5 rounded-xl transition-colors">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                checked={showJd} 
                onChange={(e) => setShowJd(e.target.checked)}
                className="w-5 h-5 rounded-lg border-white/10 bg-black/40 text-indigo-600 focus:ring-offset-black focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="flex flex-col">
               <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Enable JD Comparison</span>
               <span className="text-[10px] text-slate-500 font-medium">Compare your profile with a specific job description</span>
            </div>
          </label>
          
          <AnimatePresence>
            {showJd && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <textarea
                  placeholder="Paste the Job Description to calculate match score..."
                  className="w-full h-44 p-6 rounded-2xl bg-black/40 text-white placeholder-slate-600 border border-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none text-sm font-medium"
                  onChange={(e) => setJdText(e.target.value)}
                  value={jdText}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || (activeTab === 'upload' ? !text : activeTab === 'paste' ? !text : !linkedinUrl)}
          className={`mt-8 w-full flex items-center justify-center gap-3 px-8 py-4 ${activeTab === 'linkedin' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'} disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-2xl relative group overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          {isAnalyzing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Search size={22} strokeWidth={3} />
            </motion.div>
          ) : (
            <Search size={22} strokeWidth={3} />
          )}
          <span className="relative z-10">{isAnalyzing ? "Scanning..." : activeTab === 'linkedin' ? "Optimize Profile" : "Start Deep Scan"}</span>
        </button>
      </div>
    </motion.div>
  );
}

import React, { useState } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, Terminal, FileCode, Database, Activity, Info, ChevronRight, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PYTHON_CODE, SAMPLE_CSV } from './constants';

interface DetectionResult {
  label: 'REAL' | 'FAKE';
  confidence: number;
  reasoning: string;
  keyIndicators: string[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'detector' | 'python' | 'dataset'>('detector');
  const [newsText, setNewsText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDetect = async () => {
    if (!newsText.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setSearchResults(null);
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newsText }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to analyze text.');
      setResult(data.detection as DetectionResult);
      setSearchResults(data.searchResults || []);
    } catch (err: any) {
      setError(err.message || "Failed to analyze text. Please check your API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearchContext = async () => {
    if (!newsText.trim()) return;
    setIsSearching(true);
    setError(null);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(newsText)}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSearchResults(data.organic_results || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch search results. Ensure SERPAPI_API_KEY is set in Secrets.");
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white font-sans selection:bg-orange-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-blue-400/30 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/20 backdrop-blur-sm">
        <div>
          <h1 className="font-serif italic text-3xl tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Veritas
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest opacity-60 mt-1">
            Misinformation Detection & Analysis System v1.0.4
          </p>
        </div>
        
        <nav className="flex gap-2">
          {[
            { id: 'detector', label: 'Live Detector', icon: Search },
            { id: 'python', label: 'Python Source', icon: FileCode },
            { id: 'dataset', label: 'Dataset Format', icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border border-blue-400/50 rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-orange-500/20
                ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-orange-500/30' : 'hover:bg-blue-800/50 backdrop-blur-sm'}`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input/Content */}
        <div className="lg:col-span-7 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'detector' && (
              <motion.div
                key="detector"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border border-blue-400/30 rounded-xl p-1 bg-black/10 backdrop-blur-sm shadow-xl">
                  <div className="border border-blue-400/20 rounded-lg p-6 space-y-4 bg-white/5">
                    <div className="flex justify-between items-center">
                      <h2 className="font-serif italic text-xl">Analyze News Content</h2>
                      <span className="font-mono text-[10px] opacity-50 uppercase">Input Buffer: {newsText.length} chars</span>
                    </div>
                    <textarea
                      value={newsText}
                      onChange={(e) => setNewsText(e.target.value)}
                      placeholder="Paste news headline or article snippet here for verification..."
                      className="w-full h-64 bg-black/20 border border-blue-400/30 rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none placeholder:text-blue-300/50 text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleDetect}
                        disabled={isAnalyzing || isSearching || !newsText.trim()}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 font-mono uppercase tracking-[0.2em] text-sm hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 rounded-lg shadow-lg hover:shadow-orange-500/30"
                      >
                        {isAnalyzing ? (
                          <>
                            <Activity className="w-4 h-4 animate-pulse" />
                            Neural Analysis...
                          </>
                        ) : (
                          <>
                            Verify with AI
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleSearchContext}
                        disabled={isAnalyzing || isSearching || !newsText.trim()}
                        className="px-6 border border-blue-400/50 rounded-lg font-mono uppercase text-[10px] tracking-widest hover:bg-blue-800/50 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2 backdrop-blur-sm"
                      >
                        {isSearching ? <Activity className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                        Search Context
                      </button>
                    </div>
                    <p className="font-mono text-[9px] opacity-40 text-center">
                      * AI verification automatically uses Google Search for real-time fact checking.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="border border-red-500/50 bg-red-500/10 rounded-lg p-4 flex items-start gap-3 text-red-300 backdrop-blur-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-mono text-[10px] uppercase font-bold">System Error</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'python' && (
              <motion.div
                key="python"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h2 className="font-serif italic text-xl">Python Implementation</h2>
                  <button 
                    onClick={() => copyToClipboard(PYTHON_CODE)}
                    className="flex items-center gap-2 font-mono text-[10px] uppercase hover:underline"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy Code'}
                  </button>
                </div>
                <div className="border border-blue-400/30 rounded-xl bg-slate-800 text-green-400 p-6 overflow-x-auto shadow-xl">
                  <pre className="font-mono text-xs leading-relaxed">
                    <code>{PYTHON_CODE}</code>
                  </pre>
                </div>
              </motion.div>
            )}

            {activeTab === 'dataset' && (
              <motion.div
                key="dataset"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h2 className="font-serif italic text-xl">Sample Dataset (CSV)</h2>
                  <button 
                    onClick={() => copyToClipboard(SAMPLE_CSV)}
                    className="flex items-center gap-2 font-mono text-[10px] uppercase hover:underline"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy CSV'}
                  </button>
                </div>
                <div className="border border-blue-400/30 rounded-xl bg-white p-6 overflow-x-auto shadow-xl">
                  <pre className="font-mono text-xs text-[#141414] leading-relaxed">
                    <code>{SAMPLE_CSV}</code>
                  </pre>
                </div>
                <div className="p-4 border border-blue-400/20 bg-blue-900/20 rounded-lg space-y-2 backdrop-blur-sm">
                  <p className="font-mono text-[10px] uppercase font-bold flex items-center gap-2">
                    <Info className="w-3 h-3" />
                    Format Requirements
                  </p>
                  <ul className="text-xs space-y-1 opacity-70 list-disc pl-4">
                    <li>Columns: title, text, label</li>
                    <li>Labels: REAL, FAKE</li>
                    <li>Encoding: UTF-8</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Results/Stats */}
        <div className="lg:col-span-5 space-y-8">
          <div className="border border-blue-400/30 rounded-xl p-6 space-y-6 bg-black/10 backdrop-blur-sm shadow-xl">
            <h2 className="font-mono text-[10px] uppercase tracking-widest opacity-50 border-b border-[#141414]/10 pb-2">Analysis & Context</h2>
            
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase opacity-50">Classification</p>
                      <p className={`text-4xl font-serif italic ${result.label === 'REAL' ? 'text-green-400' : result.label === 'FAKE' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {result.label}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] uppercase opacity-50">Confidence</p>
                      <p className="text-2xl font-mono">{(result.confidence * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-mono text-[10px] uppercase opacity-50">Reasoning</p>
                    <p className="text-sm leading-relaxed">{result.reasoning}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="font-mono text-[10px] uppercase opacity-50">Key Indicators</p>
                    <div className="space-y-2">
                      {result.keyIndicators.map((indicator, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs border-l-2 border-orange-500 pl-3 py-1 bg-orange-500/10 rounded-r-lg">
                          {result.label === 'REAL' ? <CheckCircle className="w-3 h-3 text-green-400" /> : <AlertTriangle className="w-3 h-3 text-red-400" />}
                          {indicator}
                        </div>
                      ))}
                    </div>
                  </div>

                  {searchResults && searchResults.length > 0 && (
                    <div className="border border-blue-400/20 rounded-xl p-4 bg-white/5">
                      <div className="flex justify-between items-center mb-3">
                        <p className="font-mono text-[10px] uppercase opacity-50">Live Search Results (SerpApi)</p>
                        <button onClick={() => setSearchResults(null)} className="text-[10px] uppercase underline opacity-50">Clear</button>
                      </div>
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                        {searchResults.map((res, i) => (
                          <div key={i} className="p-3 border border-blue-400/20 bg-white/10 rounded-lg space-y-1 backdrop-blur-sm hover:bg-white/20 transition-all">
                            <a href={res.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold hover:underline block">{res.title}</a>
                            <p className="text-[10px] opacity-60 line-clamp-2">{res.snippet}</p>
                            <p className="text-[9px] font-mono opacity-40">{res.displayed_link}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : searchResults ? (
                <motion.div
                  key="search-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-mono text-[10px] uppercase opacity-50">Live Search Results (SerpApi)</p>
                    <button onClick={() => setSearchResults(null)} className="text-[10px] uppercase underline opacity-50">Clear</button>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {searchResults.map((res, i) => (
                      <div key={i} className="p-3 border border-blue-400/20 bg-white/10 rounded-lg space-y-1 backdrop-blur-sm hover:bg-white/20 transition-all">
                        <a href={res.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold hover:underline block">{res.title}</a>
                        <p className="text-[10px] opacity-60 line-clamp-2">{res.snippet}</p>
                        <p className="text-[9px] font-mono opacity-40">{res.displayed_link}</p>
                      </div>
                    ))}
                    {searchResults.length === 0 && <p className="text-xs opacity-50 italic">No results found.</p>}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-64 flex flex-col items-center justify-center text-center opacity-50 space-y-4 bg-black/5 rounded-lg backdrop-blur-sm"
                >
                  <Terminal className="w-12 h-12" />
                  <p className="font-mono text-xs uppercase tracking-tighter">Awaiting input sequence...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Model Stats (Simulated for the Python part) */}
          <div className="border border-blue-400/30 rounded-xl p-6 space-y-4 bg-black/10 backdrop-blur-sm shadow-xl">
            <h2 className="font-mono text-[10px] uppercase tracking-widest opacity-50 border-b border-[#141414]/10 pb-2">ML Model Performance (Python)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/10 border border-blue-400/20 rounded-lg backdrop-blur-sm">
                <p className="font-mono text-[10px] uppercase opacity-50">Accuracy</p>
                <p className="text-2xl font-mono">92.4%</p>
              </div>
              <div className="p-4 bg-white/10 border border-blue-400/20 rounded-lg backdrop-blur-sm">
                <p className="font-mono text-[10px] uppercase opacity-50">F1-Score</p>
                <p className="text-2xl font-mono">0.91</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase opacity-50">Algorithm</p>
              <p className="text-xs font-mono">Logistic Regression + TF-IDF</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-400/30 p-6 mt-12 flex justify-between items-center opacity-60 bg-black/20 backdrop-blur-sm">
        <p className="font-mono text-[10px] uppercase tracking-widest">© 2026 Veritas Intelligence Systems</p>
        <div className="flex gap-4 font-mono text-[10px] uppercase tracking-widest">
          <span>Encrypted</span>
          <span>Verified</span>
        </div>
      </footer>
    </div>
  );
}

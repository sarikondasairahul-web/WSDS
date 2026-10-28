import React, { useState } from 'react';
import { Send, FileText, Copy, Check, Download, AlertOctagon, Sparkles, MessageSquare, ShieldCheck, Tag } from 'lucide-react';
import { NLPAnalysisResult, ThreatLevel } from '../types';
import { BENCHMARK_CASES } from '../data/mockData';

interface TextThreatScannerProps {
  onIncidentDetected: (text: string, result: NLPAnalysisResult) => void;
  setThreatLevel: (level: ThreatLevel) => void;
}

export const TextThreatScanner: React.FC<TextThreatScannerProps> = ({
  onIncidentDetected,
  setThreatLevel,
}) => {
  const [inputText, setInputText] = useState(
    "I noticed you took the subway from 34th street. You're wearing that dark coat again. I know where you get off. You can't avoid me forever."
  );
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<NLPAnalysisResult | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  const handleScan = async (overrideText?: string) => {
    const textToScan = overrideText !== undefined ? overrideText : inputText;
    if (!textToScan.trim()) return;

    setIsScanning(true);
    try {
      const response = await fetch('/api/nlp/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToScan,
          source: 'text_harassment_scanner',
          context: 'SMS/Chat message suspicious harassment or stalking analysis',
        }),
      });

      if (!response.ok) throw new Error('Analysis request failed');
      const data: NLPAnalysisResult = await response.json();
      setResult(data);
      setThreatLevel(data.threatLevel);
      onIncidentDetected(textToScan, data);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopyReport = () => {
    if (!result?.policeReportDraft) return;
    navigator.clipboard.writeText(result.policeReportDraft);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleDownloadReport = () => {
    if (!result?.policeReportDraft) return;
    const blob = new Blob([result.policeReportDraft], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `police_incident_evidence_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectBenchmark = (benchText: string) => {
    setInputText(benchText);
    handleScan(benchText);
  };

  return (
    <div className="space-y-6">
      {/* Header kicker */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <MessageSquare className="w-4 h-4" />
          <span>Semantic NLP Text Classifier</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
          Text Message & Harassment Threat Scanner
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Paste any SMS, WhatsApp communication, suspicious email, or stalking message. The NLP
          engine parses contextual intimidation vectors, extracts named entities, calculates
          distress severity, and formats legally-sound evidence logs.
        </p>

        {/* Benchmark quick load pills */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="text-xs font-medium text-slate-400 mb-2.5">
            Load Verified Benchmark Scenarios:
          </div>
          <div className="flex flex-wrap gap-2">
            {BENCHMARK_CASES.map((b) => (
              <button
                key={b.id}
                onClick={() => handleSelectBenchmark(b.text)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 hover:border-rose-500 hover:text-rose-300 text-slate-300 transition-colors text-left"
              >
                {b.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input & Token Attention */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm">
            <label className="block text-sm font-semibold text-white mb-2">
              Message / Text Transcript Input
            </label>
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste suspicious text message, email, or chat transcript here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {inputText.length} characters · Tokenizer active
              </span>

              <button
                onClick={() => handleScan()}
                disabled={isScanning || !inputText.trim()}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Analyzing Syntax...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Run NLP Scan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Token Analysis & Attention breakdown */}
          {result && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-rose-400" />
                <span>Detected Distressed Lexical Cues & Tokens</span>
              </h3>

              <div className="flex flex-wrap gap-2 mb-4">
                {result.detectedCues && result.detectedCues.length > 0 ? (
                  result.detectedCues.map((cue, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs rounded-md bg-rose-950/60 text-rose-300 border border-rose-800/80 font-mono"
                    >
                      {cue}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No high-risk keywords isolated.</span>
                )}
              </div>

              {/* Named Entity Extraction */}
              {result.linguisticFeatures?.entityMentions &&
                result.linguisticFeatures.entityMentions.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-slate-400 mb-2">
                      Extracted Named Entities (NER):
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {result.linguisticFeatures.entityMentions.map((ent, i) => (
                        <div
                          key={i}
                          className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between"
                        >
                          <span className="text-slate-200 font-medium truncate">{ent.entity}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                            {ent.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Right Output: Detailed NLP Diagnosis & Legal Evidence Card */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-5">
              {/* Header result row */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Threat Diagnosis
                  </div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {result.primaryCategory}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      result.threatLevel === 'EMERGENCY_CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : result.threatLevel === 'THREAT_HIGH'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                        : result.threatLevel === 'SUSPICIOUS'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {result.threatLevel}
                  </span>
                  <div className="text-xs font-mono tabular-nums text-slate-400 mt-1">
                    Risk Score: {result.threatScore}/100
                  </div>
                </div>
              </div>

              {/* Linguistic Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Intent Category</span>
                  <span className="font-semibold text-slate-200">
                    {result.linguisticFeatures.intent}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Urgency Index</span>
                  <span className="font-semibold text-slate-200">
                    {result.linguisticFeatures.urgency}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Sentiment Polarity</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-200">
                    {result.sentimentScore?.toFixed(2) ?? '0.00'}
                  </span>
                </div>
              </div>

              {/* Immediate Guidance */}
              <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4 text-xs">
                <div className="font-semibold text-rose-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>Immediate Actionable Safety Recommendation</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {result.immediateActionGuidance}
                </p>
              </div>

              {/* Police Incident FIR / Evidence Statement Draft */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    <span>Formatted Police Evidence / FIR Statement</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyReport}
                      className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1"
                    >
                      {copiedReport ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleDownloadReport}
                      className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap bg-slate-900 p-3 rounded-lg border border-slate-800/80 max-h-48 overflow-y-auto">
                  {result.policeReportDraft}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center text-slate-500 shadow-sm">
              <AlertOctagon className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <h4 className="text-sm font-semibold text-slate-300">Awaiting Text Input</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Paste a suspicious message or choose a benchmark case to inspect the detailed NLP
                threat profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

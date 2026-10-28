import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, ShieldAlert, Sparkles, CheckCircle, AlertTriangle, Play, RefreshCw, AudioLines } from 'lucide-react';
import { NLPAnalysisResult, ThreatLevel } from '../types';
import { BENCHMARK_CASES } from '../data/mockData';
import { alarmManager } from '../utils/audioAlarm';

interface AudioSpeechMonitorProps {
  onIncidentDetected: (text: string, result: NLPAnalysisResult) => void;
  currentThreatLevel: ThreatLevel;
  setThreatLevel: (level: ThreatLevel) => void;
}

export const AudioSpeechMonitor: React.FC<AudioSpeechMonitorProps> = ({
  onIncidentDetected,
  currentThreatLevel,
  setThreatLevel,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<NLPAnalysisResult | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [spottedDistressWords, setSpottedDistressWords] = useState<string[]>([]);
  const [autoSirenOnCritical, setAutoSirenOnCritical] = useState(true);

  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => {
          const updated = (prev + ' ' + finalTranscript).trim();
          evaluateDistress(updated);
          return updated;
        });
      }
      setInterimText(interim);
    };

    recognition.onerror = (err: any) => {
      console.warn('Speech recognition event:', err.error);
      if (err.error === 'not-allowed') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch {
          // already started or stopping
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // cleanup
        }
      }
    };
  }, [isListening]);

  // Audio Canvas visualizer setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      let dataArray: any = null;
      if (analyserRef.current) {
        dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteTimeDomainData(dataArray);
      }

      ctx.lineWidth = 2;
      ctx.strokeStyle = isListening
        ? currentThreatLevel === 'EMERGENCY_CRITICAL'
          ? '#ef4444'
          : '#f43f5e'
        : '#64748b';

      ctx.beginPath();

      if (dataArray && isListening) {
        const sliceWidth = width / dataArray.length;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
      } else {
        // Aesthetic resting or simulated speech wave
        const amplitude = isListening ? 18 : 6;
        for (let x = 0; x < width; x += 2) {
          const y =
            centerY +
            Math.sin(x * 0.04 + phase) * amplitude * Math.sin((x / width) * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        phase += isListening ? 0.08 : 0.02;
      }

      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening, currentThreatLevel]);

  // Start Mic & Audio Context
  const startListening = async () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      // Also connect MediaStream for real-time visualizer if allowed
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
      } catch (e) {
        console.log('Mic visualization falling back to simulated wave:', e);
      }

      setIsListening(true);
      alarmManager.playCueChime();
    } catch (e) {
      console.error('Error starting audio listener:', e);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
  };

  // Fast distress keyword detection
  const checkDistressKeywords = (text: string) => {
    const distressDict = [
      'help', 'help me', 'stop', 'leave me alone', "don't touch me",
      'call police', 'call 112', 'call 911', 'following me', 'danger',
      'scared', 'weapon', 'attack', 'let go', 'someone help'
    ];
    const lower = text.toLowerCase();
    const spotted: string[] = [];
    distressDict.forEach((kw) => {
      if (lower.includes(kw)) spotted.push(kw);
    });
    setSpottedDistressWords(spotted);
    return spotted;
  };

  // Run full NLP semantic analysis via backend
  const evaluateDistress = async (textToAnalyze: string) => {
    if (!textToAnalyze || textToAnalyze.trim().length < 5) return;

    const spotted = checkDistressKeywords(textToAnalyze);
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/nlp/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToAnalyze,
          source: 'audio_speech_stream',
          context: 'Real-time conversational speech audio monitoring',
        }),
      });

      if (!response.ok) throw new Error('Analysis server error');

      const data: NLPAnalysisResult = await response.json();
      setLatestAnalysis(data);
      setThreatLevel(data.threatLevel);

      // Trigger automatic alarm if critical
      if (data.threatLevel === 'EMERGENCY_CRITICAL' && autoSirenOnCritical) {
        alarmManager.startSiren();
      } else if (spotted.length > 0) {
        alarmManager.playCueChime();
      }

      onIncidentDetected(textToAnalyze, data);
    } catch (err) {
      console.error('NLP speech eval failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load a test benchmark speech scenario
  const handleLoadPreset = (scenario: (typeof BENCHMARK_CASES)[0]) => {
    setActivePresetId(scenario.id);
    setTranscript(scenario.text);
    setInterimText('');
    evaluateDistress(scenario.text);
  };

  const handleClearTranscript = () => {
    setTranscript('');
    setInterimText('');
    setSpottedDistressWords([]);
    setLatestAnalysis(null);
    setActivePresetId(null);
    setThreatLevel('SAFE');
  };

  return (
    <div className="space-y-6">
      {/* Banner introduction with domain branding */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <AudioLines className="w-4 h-4" />
            <span>Acoustic NLP Distress Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
            Real-Time Speech & Acoustic Threat Recognition
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Continuous natural language monitoring actively scans environmental speech for
            distress cues, coercive boundary violations, harassment, and immediate cries for
            help. Triggers safety protocols and instant emergency drafts.
          </p>
        </div>

        {/* Ambient image background */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-25 pointer-events-none hidden lg:block overflow-hidden">
          <img
            src="/src/assets/images/nlp_audio_waveform_1793170695825.jpg"
            alt="NLP Audio Waveform"
            className="w-full h-full object-cover object-left"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Audio Console */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Live Microphone Stream</h3>
                <p className="text-xs text-slate-400">
                  {isListening ? 'Microphone active · Streaming acoustic tokens' : 'Listener idle · Press start to begin'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                    isListening
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/40 animate-pulse'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>Stop Listening</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Start Listening</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Audio Waveform Canvas */}
            <div className="relative bg-slate-950 rounded-xl border border-slate-800/80 p-3 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={600}
                height={90}
                className="w-full h-24 block"
              />
              <div className="absolute top-2 right-3 text-[11px] font-mono tabular-nums text-slate-400">
                {isListening ? 'SAMPLING: 44.1 kHz' : 'STANDBY'}
              </div>
            </div>

            {/* Speech Transcript Output Box */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-medium text-slate-300">Live Speech Transcript:</span>
                {transcript && (
                  <button
                    onClick={handleClearTranscript}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Clear Text
                  </button>
                )}
              </div>

              <div className="min-h-[120px] max-h-[200px] overflow-y-auto bg-slate-950 rounded-xl p-4 border border-slate-800 text-sm leading-relaxed text-slate-200">
                {transcript ? (
                  <span>
                    {transcript}{' '}
                    {interimText && (
                      <span className="text-rose-400 italic font-mono">{interimText}</span>
                    )}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">
                    {isListening
                      ? 'Listening for speech... Speak clearly or try shouting "Help me" or "Stop following me".'
                      : 'Press "Start Listening" or select a benchmark speech simulation scenario below to evaluate distress recognition.'}
                  </span>
                )}
              </div>
            </div>

            {/* Spotted Distress Keywords Ribbon */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
                <span>Fast Distress Keywords Spotted:</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-xs">
                  <input
                    type="checkbox"
                    checked={autoSirenOnCritical}
                    onChange={(e) => setAutoSirenOnCritical(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-rose-600 focus:ring-0"
                  />
                  <span>Auto-siren on Critical</span>
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {spottedDistressWords.length > 0 ? (
                  spottedDistressWords.map((word, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span>"{word}"</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">
                    No trigger lexicons spotted yet. The local regex monitor triggers sub-second responses.
                  </span>
                )}
              </div>
            </div>

            {/* Manual Re-evaluate Button */}
            {transcript && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => evaluateDistress(transcript)}
                  disabled={isAnalyzing}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>Re-evaluate with Deep Gemini NLP</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Simulation Presets */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <h3 className="text-sm font-semibold text-white mb-1">
              Speech Distress Simulation Benchmarks
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Test how the NLP model parses various intensities of conversational threat and cries for assistance:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BENCHMARK_CASES.slice(0, 4).map((bench) => (
                <button
                  key={bench.id}
                  onClick={() => handleLoadPreset(bench)}
                  className={`p-3.5 rounded-xl text-left border transition-all ${
                    activePresetId === bench.id
                      ? 'bg-rose-950/40 border-rose-500/60 ring-1 ring-rose-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200 truncate">{bench.title}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        bench.expectedLevel === 'EMERGENCY_CRITICAL'
                          ? 'bg-red-900/60 text-red-300'
                          : 'bg-orange-900/60 text-orange-300'
                      }`}
                    >
                      {bench.expectedLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{bench.text}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: NLP Threat Assessment & Dispatch Plan */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">NLP Threat Evaluation</h3>
              {isAnalyzing && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
            </div>

            {latestAnalysis ? (
              <div className="space-y-4">
                {/* Score & Category Hero */}
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Primary NLP Category
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        latestAnalysis.threatLevel === 'EMERGENCY_CRITICAL'
                          ? 'bg-red-500/20 text-red-400'
                          : latestAnalysis.threatLevel === 'THREAT_HIGH'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {latestAnalysis.threatLevel}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-white mb-2">
                    {latestAnalysis.primaryCategory}
                  </div>

                  {/* Threat meter bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all duration-500 ${
                        latestAnalysis.threatScore > 70
                          ? 'bg-red-500'
                          : latestAnalysis.threatScore > 40
                          ? 'bg-orange-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${latestAnalysis.threatScore}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-400">
                    <span>Threat Severity Index</span>
                    <span className="font-bold text-slate-200">
                      {latestAnalysis.threatScore} / 100
                    </span>
                  </div>
                </div>

                {/* Linguistic Attributes Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Identified Intent</span>
                    <span className="font-semibold text-slate-200">
                      {latestAnalysis.linguisticFeatures?.intent || 'Analysis in progress'}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Urgency Level</span>
                    <span className="font-semibold text-slate-200">
                      {latestAnalysis.linguisticFeatures?.urgency || 'Normal'}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Emotional Tone</span>
                    <span className="font-semibold text-slate-200">
                      {latestAnalysis.linguisticFeatures?.emotionalTone || 'Neutral'}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Sentiment Polarity</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-200">
                      {latestAnalysis.sentimentScore?.toFixed(2) ?? '0.00'}
                    </span>
                  </div>
                </div>

                {/* Actionable Guidance */}
                <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-3.5 text-xs">
                  <div className="font-semibold text-rose-300 mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Recommended Immediate Protocol</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {latestAnalysis.immediateActionGuidance}
                  </p>
                </div>

                {/* Dispatch Draft Ready */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-xs font-semibold text-slate-300 mb-1">
                    Pre-composed SOS Dispatch Broadcast:
                  </div>
                  <p className="text-xs font-mono text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                    {latestAnalysis.safetyDispatchDraft}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <a
                      href={`sms:?body=${encodeURIComponent(latestAnalysis.safetyDispatchDraft)}`}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs text-center transition-colors"
                    >
                      Send SMS SOS
                    </a>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(latestAnalysis.safetyDispatchDraft)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                <AudioLines className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p>No active speech analysis yet.</p>
                <p className="text-slate-600 mt-1">
                  Start the microphone or click a simulation scenario to see real-time NLP classification.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

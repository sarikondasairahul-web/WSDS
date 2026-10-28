import React, { useState } from 'react';
import { History, Download, Trash2, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { IncidentRecord, ThreatLevel } from '../types';

interface IncidentHistoryLogProps {
  incidents: IncidentRecord[];
  onClearIncidents: () => void;
  onDeleteIncident: (id: string) => void;
}

export const IncidentHistoryLog: React.FC<IncidentHistoryLogProps> = ({
  incidents,
  onClearIncidents,
  onDeleteIncident,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);

  const filtered = incidents.filter((inc) => {
    if (filterLevel === 'ALL') return true;
    return inc.result.threatLevel === filterLevel;
  });

  const exportCSV = () => {
    if (incidents.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Source', 'ThreatLevel', 'ThreatScore', 'Category', 'DetectedCues', 'Transcript'];
    const rows = incidents.map((inc) => [
      inc.id,
      `"${inc.timestamp}"`,
      `"${inc.source}"`,
      `"${inc.result.threatLevel}"`,
      inc.result.threatScore,
      `"${inc.result.primaryCategory}"`,
      `"${(inc.result.detectedCues || []).join('; ')}"`,
      `"${(inc.text || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safety_incidents_evidence_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    if (incidents.length === 0) return;
    const blob = new Blob([JSON.stringify(incidents, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safety_incidents_evidence_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Introduction Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <History className="w-4 h-4" />
          <span>Evidence Logging & Chain of Custody</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
          Incident Evidence Vault & Audit Log
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Every classified speech transcript, threatening SMS, and emergency trigger is preserved
          with cryptographic timestamps, detected linguistic cues, and legal evidence summaries.
        </p>

        {/* Action Toolbar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            {['ALL', 'EMERGENCY_CRITICAL', 'THREAT_HIGH', 'SUSPICIOUS', 'SAFE'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  filterLevel === lvl
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl === 'ALL'
                  ? 'All Logs'
                  : lvl === 'EMERGENCY_CRITICAL'
                  ? 'Critical SOS'
                  : lvl === 'THREAT_HIGH'
                  ? 'Elevated Threat'
                  : lvl === 'SUSPICIOUS'
                  ? 'Suspicious'
                  : 'Safe'}
              </button>
            ))}
          </div>

          {/* Export Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              disabled={incidents.length === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={exportJSON}
              disabled={incidents.length === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            {incidents.length > 0 && (
              <button
                onClick={onClearIncidents}
                className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 text-xs font-medium border border-red-800/80 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Incidents Table / List */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm">
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedIncident(item)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedIncident?.id === item.id
                    ? 'bg-slate-950 border-rose-500 ring-1 ring-rose-500'
                    : 'bg-slate-950/70 border-slate-800 hover:bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        item.result.threatLevel === 'EMERGENCY_CRITICAL'
                          ? 'bg-red-500/20 text-red-400'
                          : item.result.threatLevel === 'THREAT_HIGH'
                          ? 'bg-orange-500/20 text-orange-400'
                          : item.result.threatLevel === 'SUSPICIOUS'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {item.result.threatLevel}
                    </span>

                    <span className="text-sm font-semibold text-white">
                      {item.result.primaryCategory}
                    </span>

                    <span className="text-xs text-slate-500">
                      via {item.source.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="font-mono tabular-nums">
                      Score: {item.result.threatScore}/100
                    </span>
                    <span className="font-mono tabular-nums">{item.timestamp}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteIncident(item.id);
                      }}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 italic font-serif">
                  "{item.text}"
                </p>

                {item.result.detectedCues && item.result.detectedCues.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.result.detectedCues.map((c, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">Evidence Vault Clear</h4>
            <p className="text-xs text-slate-500 mt-1">
              No incidents match this filter. As you speak or analyze text, safety audits appear here.
            </p>
          </div>
        )}
      </div>

      {/* Selected Incident Detail Modal / Drawer */}
      {selectedIncident && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase">
                Detailed Incident Evidence File
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {selectedIncident.result.primaryCategory} (ID: {selectedIncident.id})
              </h3>
            </div>

            <button
              onClick={() => setSelectedIncident(null)}
              className="px-3 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Close Details
            </button>
          </div>

          <div className="text-xs space-y-3">
            <div>
              <span className="text-slate-400 block mb-1 font-semibold">Original Transcript:</span>
              <p className="p-3 bg-slate-950 rounded-lg text-slate-200 font-mono leading-relaxed border border-slate-800">
                {selectedIncident.text}
              </p>
            </div>

            <div>
              <span className="text-slate-400 block mb-1 font-semibold">
                Formatted Legal FIR / Police Incident Statement:
              </span>
              <pre className="p-3 bg-slate-950 rounded-lg text-slate-300 font-mono whitespace-pre-wrap border border-slate-800 max-h-52 overflow-y-auto">
                {selectedIncident.result.policeReportDraft}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

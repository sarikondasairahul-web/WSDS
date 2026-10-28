import React from 'react';
import { ShieldAlert, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { ThreatLevel } from '../types';

interface TopNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSirenActive: boolean;
  onToggleSiren: () => void;
  threatLevel: ThreatLevel;
  onTriggerSOS: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  isSirenActive,
  onToggleSiren,
  threatLevel,
  onTriggerSOS,
}) => {
  const navItems = [
    { id: 'audio', label: 'Audio & Speech NLP' },
    { id: 'text', label: 'Text Threat Scanner' },
    { id: 'pipeline', label: 'NLP Architecture' },
    { id: 'dispatch', label: 'Emergency Contacts' },
    { id: 'history', label: 'Evidence Vault' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('audio');
              }}
              className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-rose-400 transition-colors"
            >
              Women Safety Detection System
            </a>
          </div>

          {/* Zone 2: Single-line Clean Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  activeTab === item.id
                    ? 'text-rose-400 border-b-2 border-rose-500 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Action & Siren Control */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onToggleSiren}
              title={isSirenActive ? 'Mute Safety Siren' : 'Test Safety Siren'}
              className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isSirenActive
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {isSirenActive ? (
                <>
                  <VolumeX className="w-4 h-4 text-white" />
                  <span className="hidden sm:inline">Mute Siren</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-rose-400" />
                  <span className="hidden sm:inline">Sound Alarm</span>
                </>
              )}
            </button>

            <button
              onClick={onTriggerSOS}
              className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg text-white shadow-md transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                threatLevel === 'EMERGENCY_CRITICAL' || isSirenActive
                  ? 'bg-red-600 hover:bg-red-700 ring-2 ring-red-400 ring-offset-2 ring-offset-slate-950 animate-bounce'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>SOS Emergency</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="md:hidden flex items-center gap-3 overflow-x-auto py-2.5 border-t border-slate-800/80 no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap px-2.5 py-1 text-xs rounded-md transition-colors ${
                activeTab === item.id
                  ? 'bg-rose-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

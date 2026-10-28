import React, { useState } from 'react';
import { MapPin, PhoneCall, Zap, Compass, RefreshCw, Radio } from 'lucide-react';
import { ThreatLevel } from '../types';

interface EmergencyStatusBannerProps {
  threatLevel: ThreatLevel;
  threatScore: number;
  location: { latitude: number; longitude: number; address?: string } | null;
  onRefreshLocation: () => void;
  isLocationLoading: boolean;
  onQuickCall: () => void;
}

export const EmergencyStatusBanner: React.FC<EmergencyStatusBannerProps> = ({
  threatLevel,
  threatScore,
  location,
  onRefreshLocation,
  isLocationLoading,
  onQuickCall,
}) => {
  const [isStrobeActive, setIsStrobeActive] = useState(false);

  // Strobe toggle
  const toggleStrobe = () => {
    setIsStrobeActive((prev) => !prev);
  };

  const getThreatBadge = () => {
    switch (threatLevel) {
      case 'EMERGENCY_CRITICAL':
        return {
          bg: 'bg-red-500/20 border-red-500/40 text-red-400',
          indicator: 'bg-red-500',
          label: 'CRITICAL DISTRESS DETECTED',
        };
      case 'THREAT_HIGH':
        return {
          bg: 'bg-orange-500/20 border-orange-500/40 text-orange-400',
          indicator: 'bg-orange-500',
          label: 'ELEVATED THREAT DETECTED',
        };
      case 'SUSPICIOUS':
        return {
          bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
          indicator: 'bg-amber-500',
          label: 'SUSPICIOUS CONVERSATIONAL CUES',
        };
      default:
        return {
          bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
          indicator: 'bg-emerald-500',
          label: 'SYSTEM NOMINAL — ACTIVE LISTENING',
        };
    }
  };

  const badge = getThreatBadge();

  return (
    <>
      {/* Visual Strobe Overlay for emergency attention */}
      {isStrobeActive && (
        <div
          onClick={toggleStrobe}
          className="fixed inset-0 z-50 pointer-events-auto cursor-pointer animate-pulse bg-white/95 flex flex-col items-center justify-center text-slate-950 p-6 text-center select-none"
        >
          <div className="bg-red-600 text-white font-black text-2xl sm:text-4xl px-8 py-4 rounded-xl shadow-2xl mb-4">
            EMERGENCY SOS FLASH
          </div>
          <p className="text-lg font-bold text-slate-900 max-w-md">
            Screen flashing high-intensity beacon. Tap anywhere to deactivate strobe light.
          </p>
        </div>
      )}

      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status & Threat Meter */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide ${badge.bg}`}
            >
              <span className={`w-2 h-2 rounded-full ${badge.indicator}`} />
              <span>{badge.label}</span>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Risk Metric:</span>
              <span className="font-mono font-bold text-slate-200 tabular-nums">
                {threatScore}/100
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-1 text-xs text-slate-400">
              <Radio className="w-3.5 h-3.5 text-rose-400" />
              <span>Continuous NLP Token Auditing</span>
            </div>
          </div>

          {/* Location & Quick Action Tools */}
          <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto text-xs">
            {/* GPS coordinates badge */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              {location ? (
                <span className="font-mono tabular-nums text-slate-200 truncate max-w-[200px]">
                  {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
                </span>
              ) : (
                <span className="text-slate-400">GPS Standing By</span>
              )}
              <button
                onClick={onRefreshLocation}
                disabled={isLocationLoading}
                title="Refresh GPS Coordinates"
                aria-label="Refresh GPS Location"
                className="hover:text-white p-0.5 ml-1 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isLocationLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Night Strobe Beacon Button */}
            <button
              onClick={toggleStrobe}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Flash high-visibility strobe beacon"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>SOS Strobe</span>
            </button>

            {/* Quick Police Dispatch Call */}
            <button
              onClick={onQuickCall}
              className="px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Dial 112 / 911</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

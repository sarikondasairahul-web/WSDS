/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { EmergencyStatusBanner } from './components/EmergencyStatusBanner';
import { AudioSpeechMonitor } from './components/AudioSpeechMonitor';
import { TextThreatScanner } from './components/TextThreatScanner';
import { NlpArchitectureView } from './components/NlpArchitectureView';
import { EmergencyDispatchCenter } from './components/EmergencyDispatchCenter';
import { IncidentHistoryLog } from './components/IncidentHistoryLog';
import { ThreatLevel, NLPAnalysisResult, EmergencyContact, IncidentRecord } from './types';
import { DEFAULT_CONTACTS } from './data/mockData';
import { alarmManager } from './utils/audioAlarm';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('audio');
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>('SAFE');
  const [threatScore, setThreatScore] = useState<number>(0);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);
  const [lastDistressCue, setLastDistressCue] = useState<string>('');

  // Location State
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState<boolean>(false);

  // Contacts State
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    try {
      const saved = localStorage.getItem('ws_emergency_contacts');
      return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
    } catch {
      return DEFAULT_CONTACTS;
    }
  });

  // Incidents State
  const [incidents, setIncidents] = useState<IncidentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('ws_incidents_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save contacts & incidents on update
  useEffect(() => {
    try {
      localStorage.setItem('ws_emergency_contacts', JSON.stringify(contacts));
    } catch {
      // ignore
    }
  }, [contacts]);

  useEffect(() => {
    try {
      localStorage.setItem('ws_incidents_history', JSON.stringify(incidents));
    } catch {
      // ignore
    }
  }, [incidents]);

  // Fetch real GPS Location
  const fetchLocation = () => {
    setIsLocationLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsLocationLoading(false);
        },
        (error) => {
          console.warn('Geolocation access warning:', error.message);
          // Fallback approximate coordinates (Metropolitan Central)
          setLocation({
            latitude: 40.7128,
            longitude: -74.006,
            address: 'Approximate Urban Zone',
          });
          setIsLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocation({
        latitude: 40.7128,
        longitude: -74.006,
        address: 'Universal Coordinates',
      });
      setIsLocationLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  // Handle Siren Toggle
  const handleToggleSiren = () => {
    if (isSirenActive) {
      alarmManager.stopSiren();
      setIsSirenActive(false);
    } else {
      alarmManager.startSiren();
      setIsSirenActive(true);
    }
  };

  // Trigger Immediate SOS Emergency
  const handleTriggerSOS = () => {
    alarmManager.startSiren();
    setIsSirenActive(true);
    setThreatLevel('EMERGENCY_CRITICAL');
    setThreatScore(100);

    const manualSOSRecord: IncidentRecord = {
      id: `sos-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      source: 'manual_sos',
      text: 'EMERGENCY SOS BUTTON ACTIVATED DIRECTLY BY USER',
      result: {
        threatLevel: 'EMERGENCY_CRITICAL',
        threatScore: 100,
        sentimentScore: -1.0,
        primaryCategory: 'Manual Emergency SOS Dispatch',
        detectedCues: ['Immediate User Panic Beacon', 'High Decibel Siren Engaged'],
        linguisticFeatures: {
          intent: 'Direct Life-Safety Emergency Intervention',
          urgency: 'CRITICAL',
          emotionalTone: 'Extreme Danger / Urgent Distress',
          entityMentions: [{ entity: 'User in Distress', category: 'PERSON' }],
        },
        policeReportDraft: `EMERGENCY DISPATCH INTAKE:\nTimestamp: ${new Date().toISOString()}\nIncident Type: Direct Manual SOS Trigger\nLocation: ${
          location ? `${location.latitude}, ${location.longitude}` : 'Tracking active'
        }\nDispatch Action: Emergency units and registered guardians alerted immediately.`,
        immediateActionGuidance:
          'Move toward public, well-lit spaces immediately. Safety siren is sounding to alert bystanders.',
        alertTriggered: true,
        safetyDispatchDraft: `CRITICAL SOS: I have activated the emergency beacon. My coordinates are https://maps.google.com/?q=${
          location?.latitude || '0'
        },${location?.longitude || '0'} - Send immediate help!`,
      },
      location: location || undefined,
    };

    setIncidents((prev) => [manualSOSRecord, ...prev]);
    setActiveTab('dispatch');
  };

  // Add Incident from Audio or Text scanner
  const handleIncidentDetected = (
    text: string,
    result: NLPAnalysisResult,
    source: 'speech_audio' | 'text_message' = 'speech_audio'
  ) => {
    setThreatScore(result.threatScore);
    setThreatLevel(result.threatLevel);
    if (result.detectedCues && result.detectedCues.length > 0) {
      setLastDistressCue(result.detectedCues[0]);
    }

    const newRecord: IncidentRecord = {
      id: `inc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      source,
      text,
      result,
      location: location || undefined,
    };

    setIncidents((prev) => [newRecord, ...prev.slice(0, 49)]); // keep latest 50
  };

  // Contact Handlers
  const handleAddContact = (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = {
      ...contact,
      id: `contact-${Date.now()}`,
    };
    setContacts((prev) => [...prev, newContact]);
  };

  const handleRemoveContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleContactAlert = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, notifyOnAlert: !c.notifyOnAlert } : c))
    );
  };

  // Clear all incidents
  const handleClearIncidents = () => {
    setIncidents([]);
    try {
      localStorage.removeItem('ws_incidents_history');
    } catch {
      // ignore
    }
  };

  const handleDeleteIncident = (id: string) => {
    setIncidents((prev) => prev.filter((inc) => inc.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navigation conforming to Top Bar Contract */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSirenActive={isSirenActive}
        onToggleSiren={handleToggleSiren}
        threatLevel={threatLevel}
        onTriggerSOS={handleTriggerSOS}
      />

      {/* Emergency Status & GPS Location Ribbon */}
      <EmergencyStatusBanner
        threatLevel={threatLevel}
        threatScore={threatScore}
        location={location}
        onRefreshLocation={fetchLocation}
        isLocationLoading={isLocationLoading}
        onQuickCall={() => {
          window.location.href = 'tel:112';
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'audio' && (
          <AudioSpeechMonitor
            onIncidentDetected={(text, result) =>
              handleIncidentDetected(text, result, 'speech_audio')
            }
            currentThreatLevel={threatLevel}
            setThreatLevel={setThreatLevel}
          />
        )}

        {activeTab === 'text' && (
          <TextThreatScanner
            onIncidentDetected={(text, result) =>
              handleIncidentDetected(text, result, 'text_message')
            }
            setThreatLevel={setThreatLevel}
          />
        )}

        {activeTab === 'pipeline' && <NlpArchitectureView />}

        {activeTab === 'dispatch' && (
          <EmergencyDispatchCenter
            contacts={contacts}
            onAddContact={handleAddContact}
            onRemoveContact={handleRemoveContact}
            onToggleContactAlert={handleToggleContactAlert}
            currentLocation={location}
            lastDistressMessage={lastDistressCue}
          />
        )}

        {activeTab === 'history' && (
          <IncidentHistoryLog
            incidents={incidents}
            onClearIncidents={handleClearIncidents}
            onDeleteIncident={handleDeleteIncident}
          />
        )}
      </main>

      {/* Clean Domain Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Women Safety Detection System</span>
            <span>·</span>
            <span>Domain: Natural Language Processing (NLP)</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Client-side Web Speech &amp; Audio Synthesizer</span>
            <span>·</span>
            <span>Gemini 3.8 Flash Threat Classifier</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

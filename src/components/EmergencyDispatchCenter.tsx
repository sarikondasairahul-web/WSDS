import React, { useState } from 'react';
import { Phone, Mail, UserPlus, Trash2, Send, ExternalLink, Shield, MapPin, Check, AlertCircle } from 'lucide-react';
import { EmergencyContact } from '../types';
import { HELPLINE_DIRECTORY } from '../data/mockData';

interface EmergencyDispatchCenterProps {
  contacts: EmergencyContact[];
  onAddContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  onRemoveContact: (id: string) => void;
  onToggleContactAlert: (id: string) => void;
  currentLocation: { latitude: number; longitude: number; address?: string } | null;
  lastDistressMessage?: string;
}

export const EmergencyDispatchCenter: React.FC<EmergencyDispatchCenterProps> = ({
  contacts,
  onAddContact,
  onRemoveContact,
  onToggleContactAlert,
  currentLocation,
  lastDistressMessage,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const mapsUrl = currentLocation
    ? `https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`
    : 'https://maps.google.com';

  const defaultBroadcastMessage = `[EMERGENCY SOS ALERT - WOMEN SAFETY SYSTEM]\nI may be in danger and need immediate assistance.\nMy current location: ${mapsUrl}\n${
    lastDistressMessage ? `Detected distress cue: "${lastDistressMessage}"\n` : ''
  }Time: ${new Date().toLocaleTimeString()} - Please call me or send help immediately.`;

  const handleSubmitNewContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    onAddContact({
      name: newName,
      relationship: newRelationship || 'Guardian',
      phone: newPhone,
      email: newEmail || '',
      notifyOnAlert: true,
    });

    setNewName('');
    setNewRelationship('');
    setNewPhone('');
    setNewEmail('');
    setShowAddForm(false);
  };

  const handleCopyBroadcast = () => {
    navigator.clipboard.writeText(defaultBroadcastMessage);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Introduction Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Shield className="w-4 h-4" />
          <span>Rapid Response Network</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
          Emergency Guardians & Dispatch Center
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Configure trusted guardians who receive instantaneous SMS alerts and live GPS tracking
          links whenever the NLP system spots critical distress keywords or physical danger.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Guardians List & Management */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Trusted Guardians</h3>
                <p className="text-xs text-slate-400">
                  {contacts.length} guardian(s) registered for instant broadcast
                </p>
              </div>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            </div>

            {/* Add Contact Form Drawer */}
            {showAddForm && (
              <form
                onSubmit={handleSubmitNewContact}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 space-y-3"
              >
                <div className="text-xs font-semibold text-rose-400">Add New Trusted Guardian</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Chen"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Relationship</label>
                    <input
                      type="text"
                      placeholder="e.g. Sister, Roommate"
                      value={newRelationship}
                      onChange={(e) => setNewRelationship(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +1 555 0192"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. maya@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs"
                  >
                    Save Guardian
                  </button>
                </div>
              </form>
            )}

            {/* Contacts Table */}
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{contact.name}</span>
                      <span className="text-xs text-slate-400">· {contact.relationship}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="font-mono text-slate-300">{contact.phone}</span>
                      {contact.email && <span>{contact.email}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Direct SMS */}
                    <a
                      href={`sms:${contact.phone}?body=${encodeURIComponent(
                        defaultBroadcastMessage
                      )}`}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-800 transition-colors"
                      title="Send Instant SMS to Guardian"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </a>

                    {/* Direct Call */}
                    <a
                      href={`tel:${contact.phone}`}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition-colors"
                      title="Call Guardian Directly"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    {/* Notification toggle */}
                    <button
                      onClick={() => onToggleContactAlert(contact.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                        contact.notifyOnAlert
                          ? 'bg-rose-950/40 text-rose-300 border border-rose-800'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {contact.notifyOnAlert ? 'Auto-Alert: ON' : 'Auto-Alert: OFF'}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onRemoveContact(contact.id)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* National & Global Helplines */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <h3 className="text-base font-semibold text-white mb-1">
              Official Women Safety Helplines
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Direct priority dispatch phone lines for instantaneous law enforcement and emergency response:
            </p>

            <div className="space-y-2.5">
              {HELPLINE_DIRECTORY.map((help, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{help.service}</div>
                    <div className="text-slate-400 text-[11px]">
                      {help.region} · {help.type} · {help.available}
                    </div>
                  </div>

                  <a
                    href={`tel:${help.number.replace(/[^0-9]/g, '')}`}
                    className="px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white font-bold font-mono text-xs flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{help.number}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Dispatch Payload Generator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-white mb-2">
              Autonomous Dispatch Payload
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time payload configured with your live GPS location and linguistic threat telemetry:
            </p>

            {/* Current GPS card */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 mb-4 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="text-xs">
                <span className="text-slate-400 block">Current Coordinate Beacon</span>
                {currentLocation ? (
                  <span className="font-mono text-slate-200 font-semibold">
                    {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
                  </span>
                ) : (
                  <span className="text-amber-400 font-mono">Standby / Default City Center</span>
                )}
              </div>
            </div>

            {/* Message payload preview */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 mb-4">
              <div className="text-xs font-semibold text-slate-400 mb-2">Message Content:</div>
              <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap bg-slate-900 p-3 rounded-lg border border-slate-800/80 max-h-48 overflow-y-auto">
                {defaultBroadcastMessage}
              </pre>
            </div>

            {/* Broadcast action triggers */}
            <div className="space-y-2">
              <button
                onClick={handleCopyBroadcast}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <span>Copy Full SOS Broadcast</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`sms:?body=${encodeURIComponent(defaultBroadcastMessage)}`}
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast SMS</span>
                </a>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(defaultBroadcastMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>WhatsApp SOS</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { EmergencyContact } from '../types';

export interface BenchmarkCase {
  id: string;
  title: string;
  category: string;
  expectedLevel: 'SAFE' | 'SUSPICIOUS' | 'THREAT_HIGH' | 'EMERGENCY_CRITICAL';
  description: string;
  text: string;
}

export const BENCHMARK_CASES: BenchmarkCase[] = [
  {
    id: 'case-distress-voice',
    title: 'Street Confrontation & Distress',
    category: 'Physical Threat / Cry for Help',
    expectedLevel: 'EMERGENCY_CRITICAL',
    description: 'Direct plea for help during an escalating confrontation in public.',
    text: "Stop following me! Leave me alone right now, don't touch me! Someone please help me, call the police!",
  },
  {
    id: 'case-stalking-sms',
    title: 'Covert Stalking & Location Tracking',
    category: 'Stalking & Harassment',
    expectedLevel: 'THREAT_HIGH',
    description: 'Unsolicited surveillance messaging showing spatial monitoring.',
    text: "I saw you leave your apartment at 8:15 PM wearing that green jacket. You took 4th avenue. I am right behind you and know where you're heading.",
  },
  {
    id: 'case-blackmail-coercion',
    title: 'Extortion & Isolation Coercion',
    category: 'Blackmail / Cyber Harassment',
    expectedLevel: 'THREAT_HIGH',
    description: 'Psychological leverage demanding isolated meeting under duress.',
    text: "If you tell anyone or go to the police, I will leak your private photos to everyone at work. Meet me behind the station alone tonight.",
  },
  {
    id: 'case-verbal-threat',
    title: 'Overt Physical Violence Threat',
    category: 'Intimidation & Violence Threat',
    expectedLevel: 'EMERGENCY_CRITICAL',
    description: 'Explicit verbal declaration of violent intent.',
    text: "You can't hide from me. When you get off the bus tonight, I will finish you. Watch your back.",
  },
  {
    id: 'case-benign-control',
    title: 'Harmless Social Banter (Control Baseline)',
    category: 'Non-Threat / Normal',
    expectedLevel: 'SAFE',
    description: 'Normal everyday communication testing false-positive immunity.',
    text: "Hey Anna, are you still at the campus library? Don't forget our group presentation meeting at 10 AM tomorrow. Let me know when you reach home safely!",
  },
];

export const DEFAULT_CONTACTS: EmergencyContact[] = [
  {
    id: 'contact-1',
    name: 'Sarah Jenkins',
    relationship: 'Sister',
    phone: '+1 (555) 392-8812',
    email: 'sarah.j@example.com',
    notifyOnAlert: true,
  },
  {
    id: 'contact-2',
    name: 'Maya Patel',
    relationship: 'Roommate / Trusted Friend',
    phone: '+1 (555) 741-2094',
    email: 'maya.p@example.com',
    notifyOnAlert: true,
  },
  {
    id: 'contact-3',
    name: 'Campus / Rapid Response Security',
    relationship: 'Local Emergency Dispatch',
    phone: '911',
    email: 'security-dispatch@campus.edu',
    notifyOnAlert: true,
  },
];

export interface HelplineDirectoryEntry {
  service: string;
  number: string;
  region: string;
  type: string;
  available: string;
}

export const HELPLINE_DIRECTORY: HelplineDirectoryEntry[] = [
  {
    service: 'Emergency Response Support System (ERSS)',
    number: '112',
    region: 'Universal / National (India, EU, etc.)',
    type: 'Police / Medical / Fire',
    available: '24/7 Toll-Free',
  },
  {
    service: 'Women Helpline (Domestic & Public Distress)',
    number: '1091 / 181',
    region: 'National Women Safety',
    type: 'Emergency Distress Intervention',
    available: '24/7 Dedicated Line',
  },
  {
    service: 'National Emergency Services (US & Canada)',
    number: '911',
    region: 'North America',
    type: 'Rapid Police Dispatch',
    available: '24/7 Immediate',
  },
  {
    service: 'National Domestic Violence Hotline',
    number: '1-800-799-SAFE (7233)',
    region: 'US / International Toll Support',
    type: 'Counseling & Shelter Escort',
    available: '24/7 Confidential',
  },
  {
    service: 'Cyber Crime Reporting Cell',
    number: '1930',
    region: 'National Cyber Security',
    type: 'Online Harassment & Doxxing',
    available: 'Immediate Intake',
  },
];

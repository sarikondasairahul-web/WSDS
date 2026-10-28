export type ThreatLevel = 'SAFE' | 'SUSPICIOUS' | 'THREAT_HIGH' | 'EMERGENCY_CRITICAL';

export interface EntityMention {
  entity: string;
  category: string;
}

export interface LinguisticFeatures {
  intent: string;
  urgency: string;
  emotionalTone: string;
  entityMentions: EntityMention[];
}

export interface NLPAnalysisResult {
  threatLevel: ThreatLevel;
  threatScore: number;
  sentimentScore: number;
  primaryCategory: string;
  detectedCues: string[];
  linguisticFeatures: LinguisticFeatures;
  policeReportDraft: string;
  immediateActionGuidance: string;
  alertTriggered: boolean;
  safetyDispatchDraft: string;
  engine?: string;
  warning?: string;
  analyzedAt?: string;
  rawText?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  notifyOnAlert: boolean;
}

export interface IncidentRecord {
  id: string;
  timestamp: string;
  source: 'speech_audio' | 'text_message' | 'manual_sos';
  text: string;
  result: NLPAnalysisResult;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
}

export interface DistressKeywordRule {
  phrase: string;
  weight: number;
  category: 'urgent_plea' | 'boundary_violation' | 'stalking' | 'violence';
}

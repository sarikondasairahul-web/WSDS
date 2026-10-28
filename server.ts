import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gemini SDK
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback rule-based NLP analyzer for high reliability
function analyzeLocally(text: string) {
  const lower = text.toLowerCase();
  
  const emergencyKeywords = [
    'help', 'help me', 'save me', 'call police', 'call 112', 'call 911',
    'emergency', 'someone help', 'danger', "i'm scared", "he has a weapon",
    'gun', 'knife', 'attack', 'kidnap', 'please stop', "don't touch me"
  ];
  
  const stalkingKeywords = [
    'following me', 'outside your house', 'watching you', 'know where you live',
    'behind you', 'following', 'saw you at', 'corner of', 'cant hide', "can't escape",
    'waiting for you'
  ];

  const harassmentKeywords = [
    'shut up', 'bitch', 'whore', 'ruin you', 'leak your', 'photos', 'kill you',
    'destroy you', 'pay me', 'blackmail', 'or else', 'regret this', 'punish'
  ];

  const coercionKeywords = [
    'if you tell anyone', 'nobody will believe you', 'do what i say', 'you owe me',
    'send me', 'come alone', 'unblock me', 'answer the call', 'meet me now'
  ];

  let matches: string[] = [];
  let score = 5;

  emergencyKeywords.forEach((kw) => {
    if (lower.includes(kw)) {
      matches.push(kw);
      score += 35;
    }
  });

  stalkingKeywords.forEach((kw) => {
    if (lower.includes(kw)) {
      matches.push(kw);
      score += 25;
    }
  });

  harassmentKeywords.forEach((kw) => {
    if (lower.includes(kw)) {
      matches.push(kw);
      score += 20;
    }
  });

  coercionKeywords.forEach((kw) => {
    if (lower.includes(kw)) {
      matches.push(kw);
      score += 18;
    }
  });

  score = Math.min(100, Math.max(0, score));

  let threatLevel: 'SAFE' | 'SUSPICIOUS' | 'THREAT_HIGH' | 'EMERGENCY_CRITICAL' = 'SAFE';
  let category = 'Normal / Non-Threat';

  if (score >= 70) {
    threatLevel = 'EMERGENCY_CRITICAL';
    category = matches.some((m) => emergencyKeywords.includes(m))
      ? 'Emergency SOS Signal'
      : 'Physical Danger & Coercion';
  } else if (score >= 45) {
    threatLevel = 'THREAT_HIGH';
    category = matches.some((m) => stalkingKeywords.includes(m))
      ? 'Stalking & Surveillance'
      : 'Verbal Harassment & Intimidation';
  } else if (score >= 20) {
    threatLevel = 'SUSPICIOUS';
    category = 'Potential Coercion / Hostile Tone';
  }

  return {
    threatLevel,
    threatScore: score,
    sentimentScore: score > 30 ? -(score / 100) : 0.1,
    primaryCategory: category,
    detectedCues: matches.length > 0 ? matches : ['No overt threat detected'],
    linguisticFeatures: {
      intent: score > 60 ? 'Direct distress / urgent danger' : score > 30 ? 'Intimidation / boundary crossing' : 'Conversational',
      urgency: score > 65 ? 'CRITICAL' : score > 35 ? 'ELEVATED' : 'LOW',
      emotionalTone: score > 65 ? 'High distress / fear' : score > 35 ? 'Aggressive / coercive' : 'Neutral',
      entityMentions: [
        { entity: 'Target Subject', category: 'PERSON' },
      ],
    },
    policeReportDraft: `INCIDENT DIARY SUMMARY:\nTimestamp: ${new Date().toISOString()}\nAnalyzed Text: "${text}"\nIdentified Threat Level: ${threatLevel} (Risk Index: ${score}/100)\nKey Linguistic Markers: ${matches.join(', ') || 'None'}\nRecommended Action: Maintain evidence log. Contact local emergency authorities if behavior persists.`,
    immediateActionGuidance: score > 60
      ? 'IMMEDIATE ACTION: Move to a crowded public area, trigger the SOS siren, and dispatch location to trusted emergency contacts.'
      : 'Keep distance, save screenshots/audio logs, and refrain from engaging further.',
    alertTriggered: score >= 60,
    safetyDispatchDraft: `EMERGENCY ALERT: Women Safety NLP Detection System detected potential danger: "${text.slice(0, 80)}...". Threat Level: ${threatLevel}. Please check on me immediately or contact police.`
  };
}

// NLP Analysis API Endpoint
app.post('/api/nlp/analyze', async (req: Request, res: Response) => {
  try {
    const { text, context = 'general', source = 'text_input' } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text content is required for NLP analysis' });
      return;
    }

    if (!ai) {
      // Use local NLP analyzer
      const localResult = analyzeLocally(text);
      res.json({ ...localResult, engine: 'nlp_local_heuristics' });
      return;
    }

    // Use Gemini 3.8 Flash with structured schema
    const prompt = `You are the core NLP engine of an AI-driven Women Safety Detection System.
Analyze the provided user text, audio transcript, or incoming chat message for signs of distress, violence, stalking, sexual harassment, coercion, verbal abuse, or immediate physical danger.

Text to analyze:
"""
${text}
"""

Context details:
- Source: ${source}
- Additional Context: ${context}

Perform in-depth Natural Language Processing (semantic token evaluation, sentiment polarity, coercive intent extraction, threat level categorization, and legal FIR summary).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are a specialized Women Safety NLP analysis system. Be vigilant, accurate, and empathetic. Detect subtle indicators of stalking, non-consensual tracking, coercion, harassment, physical danger, and explicit cries for help. Categorize threat precisely without trivializing danger.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threatLevel: {
              type: Type.STRING,
              description: 'One of: SAFE, SUSPICIOUS, THREAT_HIGH, EMERGENCY_CRITICAL',
            },
            threatScore: {
              type: Type.INTEGER,
              description: 'Threat severity score from 0 (completely safe) to 100 (life-threatening emergency)',
            },
            sentimentScore: {
              type: Type.NUMBER,
              description: 'Sentiment polarity from -1.0 (extremely negative/hostile) to +1.0 (positive)',
            },
            primaryCategory: {
              type: Type.STRING,
              description: 'Primary threat category (e.g., Stalking & Surveillance, Physical Danger, Verbal Harassment, Emergency SOS Signal, Normal / Non-Threat)',
            },
            detectedCues: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Specific linguistic distress cues or coercive n-grams found in the text',
            },
            linguisticFeatures: {
              type: Type.OBJECT,
              properties: {
                intent: { type: Type.STRING, description: 'Linguistic intent of the sender or speaker' },
                urgency: { type: Type.STRING, description: 'LOW, ELEVATED, or CRITICAL' },
                emotionalTone: { type: Type.STRING, description: 'Emotional tone detected' },
                entityMentions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      entity: { type: Type.STRING },
                      category: { type: Type.STRING, description: 'LOCATION, PERSON, TIME, or ACTION' },
                    },
                    required: ['entity', 'category'],
                  },
                },
              },
              required: ['intent', 'urgency', 'emotionalTone', 'entityMentions'],
            },
            policeReportDraft: {
              type: Type.STRING,
              description: 'Formal police FIR or incident evidence summary documenting the message, threat classification, and timestamped statement',
            },
            immediateActionGuidance: {
              type: Type.STRING,
              description: 'Clear, direct, and actionable safety guidance for the user in this situation',
            },
            alertTriggered: {
              type: Type.BOOLEAN,
              description: 'True if threatScore >= 60 or immediate emergency intervention is warranted',
            },
            safetyDispatchDraft: {
              type: Type.STRING,
              description: 'Concise SMS alert message ready to broadcast to emergency contacts with exact distress info',
            },
          },
          required: [
            'threatLevel',
            'threatScore',
            'sentimentScore',
            'primaryCategory',
            'detectedCues',
            'linguisticFeatures',
            'policeReportDraft',
            'immediateActionGuidance',
            'alertTriggered',
            'safetyDispatchDraft',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ ...parsed, engine: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('NLP Analysis error:', error);
    // Graceful fallback to local analyzer on error
    const localResult = analyzeLocally(req.body?.text || '');
    res.json({
      ...localResult,
      engine: 'nlp_local_heuristics_fallback',
      warning: 'Processed via onboard NLP heuristic engine.',
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    system: 'Women Safety Detection System (NLP)',
    geminiEnabled: Boolean(ai),
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Women Safety Detection System running at http://0.0.0.0:${port}`);
  });
}

startServer();

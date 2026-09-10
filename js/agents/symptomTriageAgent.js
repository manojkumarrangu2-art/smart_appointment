/**
 * Agent 2 — Symptom Triage Agent
 * Responsibilities:
 * - Natural language symptom extraction
 * - Real-time Emergency / Red-Flag detection
 * - Adaptive clinical follow-up questioning
 * - Risk level categorization without diagnosing
 */

import { HospitalTools } from '../services/tools.js';
import { ADAPTIVE_QUESTIONS } from '../data/hospitalData.js';

export class SymptomTriageAgent {
  constructor() {
    this.name = "Symptom Triage Agent";
    this.id = "AGENT-2";
  }

  evaluateSymptoms(symptomText, details = {}) {
    const startTime = performance.now();

    // 1. Mandatory emergency red-flag screening
    const emergencyCheck = HospitalTools.check_emergency_red_flags(symptomText);
    if (emergencyCheck.is_emergency) {
      const latency = Math.round(performance.now() - startTime);
      return {
        agent: this.name,
        agentId: this.id,
        isEmergency: true,
        riskLevel: "🔴 Emergency",
        emergencyData: emergencyCheck,
        prompt: "EMERGENCY DETECTED: Some of your symptoms require urgent emergency care. Routing to emergency escalation screen.",
        telemetry: {
          latencyMs: latency,
          toolCalled: "check_emergency_red_flags()",
          safetyTriggered: true,
          confidence: 0.99
        }
      };
    }

    // 2. Clinical symptom extraction
    const triageData = HospitalTools.analyze_symptoms(symptomText, details);

    // 3. Find next adaptive question if available
    let followUpQuestion = null;
    let followUpOptions = [];

    for (const symptom of triageData.symptoms) {
      const qData = ADAPTIVE_QUESTIONS[symptom.toLowerCase()];
      if (qData && !details[symptom.toLowerCase()]) {
        followUpQuestion = qData.question;
        followUpOptions = qData.options;
        break;
      }
    }

    const latency = Math.round(performance.now() - startTime);

    return {
      agent: this.name,
      agentId: this.id,
      isEmergency: false,
      riskLevel: triageData.risk_level,
      triageData,
      followUpQuestion,
      followUpOptions,
      prompt: followUpQuestion || "Thank you for providing these details. Let's analyze your clinical profile for specialty routing.",
      telemetry: {
        latencyMs: latency,
        toolCalled: "analyze_symptoms()",
        safetyTriggered: false,
        confidence: 0.94
      }
    };
  }
}

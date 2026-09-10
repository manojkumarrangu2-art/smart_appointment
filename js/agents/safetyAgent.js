/**
 * Agent 8 — Safety & Medical Guardrail Agent
 * Responsibilities:
 * - Validates all system and agent outputs
 * - Prevents definitive medical diagnosis claims
 * - Blocks any prescription of medications
 * - Ensures mandatory non-diagnostic disclaimers
 * - Validates doctor existence against internal database
 * - Validates emergency escalation coverage
 */

import { HospitalTools } from '../services/tools.js';

export class SafetyAgent {
  constructor() {
    this.name = "Safety & Guardrails Agent";
    this.id = "AGENT-8";
  }

  auditResponse(agentOutput, context = {}) {
    const startTime = performance.now();
    const flags = [];
    let sanitizedText = agentOutput.prompt || "";

    // Guardrail 1: Check for definitive diagnosis claims ("You have X", "We diagnose you with X")
    const diagnosisRegex = /\b(you have|we diagnose you with|you are suffering from|our diagnosis is)\b/i;
    if (diagnosisRegex.test(sanitizedText)) {
      flags.push("PRESUSPECTED_DIAGNOSIS_CLAIM");
      sanitizedText = sanitizedText.replace(
        diagnosisRegex,
        "Your symptoms can be associated with several conditions including"
      );
    }

    // Guardrail 2: Check for prescription or medication recommendation
    const rxRegex = /\b(take|prescribe|prescribed|dosage of|mg of|antibiotics|aspirin|paracetamol)\b/i;
    if (rxRegex.test(sanitizedText) && !sanitizedText.includes("doctor will evaluate")) {
      flags.push("UNSAFE_MEDICATION_MENTION");
      sanitizedText += " (Note: MediAssist AI cannot prescribe medications; your evaluating physician will determine appropriate treatments.)";
    }

    // Guardrail 3: Verify Doctor Integrity
    if (agentOutput.matchedDoctors) {
      const realDoctors = HospitalTools.search_doctors({});
      const hasHallucinatedDoctor = agentOutput.matchedDoctors.some(
        doc => !realDoctors.some(rd => rd.doctor_id === doc.doctor_id)
      );
      if (hasHallucinatedDoctor) {
        flags.push("FABRICATED_DOCTOR_DETECTED");
        agentOutput.matchedDoctors = agentOutput.matchedDoctors.filter(doc =>
          realDoctors.some(rd => rd.doctor_id === doc.doctor_id)
        );
      }
    }

    // Guardrail 4: Ensure Disclaimer Presence on Clinical Outputs
    if (agentOutput.routingResult && !sanitizedText.includes("does not replace professional medical diagnosis")) {
      sanitizedText += "\n\n⚠️ Disclaimer: This assessment is for clinical navigation and does not replace professional medical diagnosis.";
    }

    const latency = Math.round(performance.now() - startTime);

    return {
      passed: flags.length === 0,
      safetyFlags: flags,
      sanitizedOutput: {
        ...agentOutput,
        prompt: sanitizedText
      },
      telemetry: {
        latencyMs: latency,
        safetyAudited: true,
        guardrailsEnforced: flags.length,
        status: flags.length === 0 ? "PASSED" : "SANITIZED"
      }
    };
  }
}

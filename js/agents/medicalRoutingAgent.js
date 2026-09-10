/**
 * Agent 3 — Medical Routing Agent
 * Responsibilities:
 * - Maps symptom categories to appropriate hospital departments
 * - Provides clinical rationale
 * - Suggests non-diagnostic possible conditions with safety disclaimers
 */

import { HospitalTools } from '../services/tools.js';

export class MedicalRoutingAgent {
  constructor() {
    this.name = "Medical Routing Agent";
    this.id = "AGENT-3";
  }

  routeToSpecialty(triageData) {
    const startTime = performance.now();

    const recommendation = HospitalTools.get_specialty_recommendation(triageData.symptoms);

    const routingResult = {
      recommendedSpecialty: recommendation.department,
      possibleConditions: recommendation.conditions,
      clinicalRationale: recommendation.rationale,
      disclaimer: "This assessment is for healthcare navigation and does not replace professional medical diagnosis."
    };

    const latency = Math.round(performance.now() - startTime);

    return {
      agent: this.name,
      agentId: this.id,
      routingResult,
      prompt: `Based on your symptoms (${triageData.symptoms.join(', ')}), the recommended department is ${recommendation.department}. ${recommendation.rationale}`,
      telemetry: {
        latencyMs: latency,
        toolCalled: "get_specialty_recommendation()",
        confidence: 0.96
      }
    };
  }
}

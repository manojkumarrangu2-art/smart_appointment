/**
 * Agent 7 — Patient Support Agent
 * Responsibilities:
 * - Natural Language Intent Parsing ("I need a skin doctor", "Cancel my appointment", etc.)
 * - Rescheduling workflows (release old slot, update booking, notify)
 * - Cancellation workflows (slot release, receipt, notification)
 * - Hospital general navigation questions
 */

import { HospitalTools } from '../services/tools.js';

export class PatientSupportAgent {
  constructor() {
    this.name = "Patient Support Agent";
    this.id = "AGENT-7";
  }

  parseIntent(userQuery) {
    const query = userQuery.toLowerCase();

    // 1. Emergency intent
    if (query.includes("chest pain") || query.includes("cannot breathe") || query.includes("stroke") || query.includes("severe bleeding")) {
      return {
        intent: "EMERGENCY_ESCALATION",
        payload: { query }
      };
    }

    // 2. Cancellation intent
    if (query.includes("cancel") && (query.includes("appointment") || query.includes("booking") || query.includes("slot"))) {
      return {
        intent: "CANCEL_APPOINTMENT",
        payload: { query }
      };
    }

    // 3. Reschedule intent
    if (query.includes("reschedule") || query.includes("move my appointment") || query.includes("change date") || query.includes("postpone")) {
      return {
        intent: "RESCHEDULE_APPOINTMENT",
        payload: { query }
      };
    }

    // 4. View appointments intent
    if (query.includes("next appointment") || query.includes("my appointments") || query.includes("show my booking")) {
      return {
        intent: "VIEW_APPOINTMENTS",
        payload: { query }
      };
    }

    // 5. Doctor search / specialty intent
    if (query.includes("skin doctor") || query.includes("dermatologist")) {
      return {
        intent: "FIND_DOCTOR",
        payload: { specialty: "Dermatology" }
      };
    }

    if (query.includes("cardiologist") || query.includes("heart doctor")) {
      return {
        intent: "FIND_DOCTOR",
        payload: { specialty: "Cardiology" }
      };
    }

    if (query.includes("telugu")) {
      return {
        intent: "FIND_DOCTOR",
        payload: { language: "Telugu" }
      };
    }

    if (query.includes("hindi")) {
      return {
        intent: "FIND_DOCTOR",
        payload: { language: "Hindi" }
      };
    }

    if (query.includes("online consultation")) {
      return {
        intent: "FIND_DOCTOR",
        payload: { mode: "online" }
      };
    }

    // Default intent
    return {
      intent: "SYMPTOM_CHECK",
      payload: { query }
    };
  }

  reschedule(appointmentId, newDate, newTime) {
    return HospitalTools.reschedule_appointment(appointmentId, newDate, newTime);
  }

  cancel(appointmentId, reason) {
    return HospitalTools.cancel_appointment(appointmentId, reason);
  }
}

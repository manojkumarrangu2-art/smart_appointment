/**
 * MediAssist AI — Master Agent Orchestrator
 * Coordinates the 8 specialized clinical and navigational agents.
 * Broadcasts real-time telemetry to the Agent Inspector Drawer.
 */

import { PatientIntakeAgent } from './patientIntakeAgent.js';
import { SymptomTriageAgent } from './symptomTriageAgent.js';
import { MedicalRoutingAgent } from './medicalRoutingAgent.js';
import { DoctorMatchingAgent } from './doctorMatchingAgent.js';
import { AppointmentAgent } from './appointmentAgent.js';
import { NotificationAgent } from './notificationAgent.js';
import { PatientSupportAgent } from './patientSupportAgent.js';
import { SafetyAgent } from './safetyAgent.js';

class AgentOrchestrator {
  constructor() {
    this.intakeAgent = new PatientIntakeAgent();
    this.triageAgent = new SymptomTriageAgent();
    this.routingAgent = new MedicalRoutingAgent();
    this.doctorAgent = new DoctorMatchingAgent();
    this.appointmentAgent = new AppointmentAgent();
    this.notificationAgent = new NotificationAgent();
    this.supportAgent = new PatientSupportAgent();
    this.safetyAgent = new SafetyAgent();

    this.telemetryListeners = new Set();
    this.currentWorkflowState = {
      patient: null,
      symptoms: [],
      triage: null,
      routing: null,
      selectedDoctor: null,
      selectedSlot: null,
      booking: null
    };
  }

  onTelemetry(callback) {
    this.telemetryListeners.add(callback);
    return () => this.telemetryListeners.delete(callback);
  }

  broadcastTelemetry(agentId, agentName, action, telemetryData) {
    const payload = {
      timestamp: new Date().toLocaleTimeString(),
      agentId,
      agentName,
      action,
      ...telemetryData
    };
    for (const listener of this.telemetryListeners) {
      try {
        listener(payload);
      } catch (err) {
        console.error("Telemetry listener error", err);
      }
    }
  }

  // --- Workflow Actions ---
  processIntake(stepKey, userInput, currentProfile) {
    const result = this.intakeAgent.processStep(stepKey, userInput, currentProfile);
    const audited = this.safetyAgent.auditResponse(result);
    this.broadcastTelemetry("AGENT-1", "Patient Intake Agent", `Intake Step: ${stepKey}`, audited.telemetry);
    if (result.updatedProfile) {
      this.currentWorkflowState.patient = result.updatedProfile;
    }
    return audited.sanitizedOutput;
  }

  processSymptomInput(symptomText, details = {}) {
    // 1. Triage analysis
    const triageResult = this.triageAgent.evaluateSymptoms(symptomText, details);
    this.broadcastTelemetry("AGENT-2", "Symptom Triage Agent", "Symptom & Red-Flag Evaluation", triageResult.telemetry);

    if (triageResult.isEmergency) {
      return triageResult;
    }

    this.currentWorkflowState.triage = triageResult.triageData;

    // 2. Medical routing
    const routingResult = this.routingAgent.routeToSpecialty(triageResult.triageData);
    this.broadcastTelemetry("AGENT-3", "Medical Routing Agent", "Specialty Determination", routingResult.telemetry);

    // 3. Safety validation
    const auditedRouting = this.safetyAgent.auditResponse(routingResult);
    this.broadcastTelemetry("AGENT-8", "Safety & Guardrails Agent", "Clinical Verification", auditedRouting.telemetry);

    this.currentWorkflowState.routing = auditedRouting.sanitizedOutput.routingResult;

    return {
      triage: triageResult,
      routing: auditedRouting.sanitizedOutput
    };
  }

  matchDoctorsForSpecialty(specialty, language = "English", preferredMode = "all") {
    const matchResult = this.doctorAgent.matchDoctors({
      specialty,
      language,
      preferredMode
    });

    const audited = this.safetyAgent.auditResponse(matchResult);
    this.broadcastTelemetry("AGENT-4", "Doctor Matching Agent", `Matched ${matchResult.matchedDoctors.length} doctors`, audited.telemetry);

    return audited.sanitizedOutput;
  }

  getDoctorSlots(doctorId, dateString) {
    const slotResult = this.appointmentAgent.fetchSlots(doctorId, dateString);
    this.broadcastTelemetry("AGENT-5", "Appointment Agent", `Queried slots for ${doctorId} on ${dateString}`, slotResult.telemetry);
    return slotResult;
  }

  reserveSlot(doctorId, dateString, time, patientId) {
    const res = this.appointmentAgent.reserveSlot(doctorId, dateString, time, patientId);
    this.broadcastTelemetry("AGENT-5", "Appointment Agent", `Slot Lock: ${dateString} ${time}`, res.telemetry);
    return res;
  }

  executeBooking(bookingPayload) {
    // 1. Commit booking
    const bookingResult = this.appointmentAgent.confirmBooking(bookingPayload);
    this.broadcastTelemetry("AGENT-5", "Appointment Agent", "Booking Transaction Commit", bookingResult.telemetry);

    if (!bookingResult.success) {
      return bookingResult;
    }

    this.currentWorkflowState.booking = bookingResult.appointment;

    // 2. Dispatch notifications
    const notifResult = this.notificationAgent.notifyBookingSuccess(
      bookingResult.appointment,
      this.currentWorkflowState.patient || { name: bookingPayload.patientName, phone: bookingPayload.patientPhone, email: bookingPayload.patientEmail }
    );
    this.broadcastTelemetry("AGENT-6", "Notification Agent", "Multi-Channel Dispatch", notifResult.telemetry);

    return bookingResult;
  }

  handleNaturalQuery(userQuery) {
    const intent = this.supportAgent.parseIntent(userQuery);
    this.broadcastTelemetry("AGENT-7", "Patient Support Agent", `Parsed Intent: ${intent.intent}`, {
      query: userQuery,
      confidence: 0.95
    });
    return intent;
  }
}

export const orchestrator = new AgentOrchestrator();

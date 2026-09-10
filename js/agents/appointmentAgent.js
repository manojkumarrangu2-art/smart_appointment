/**
 * Agent 5 — Appointment Agent
 * Responsibilities:
 * - Real-time slot availability querying
 * - Transactional slot locking (5-minute lock)
 * - Race condition prevention and double-booking protection
 * - Appointment ID generation and database commit
 */

import { HospitalTools } from '../services/tools.js';

export class AppointmentAgent {
  constructor() {
    this.name = "Appointment Agent";
    this.id = "AGENT-5";
  }

  fetchSlots(doctorId, dateString) {
    const startTime = performance.now();
    const slots = HospitalTools.get_available_slots(doctorId, dateString);
    const latency = Math.round(performance.now() - startTime);

    return {
      agent: this.name,
      agentId: this.id,
      slots,
      prompt: `Retrieved ${slots.filter(s => s.status === 'Available').length} available consultation slots.`,
      telemetry: {
        latencyMs: latency,
        toolCalled: "get_available_slots()",
        confidence: 0.99
      }
    };
  }

  reserveSlot(doctorId, dateString, time, patientId) {
    const startTime = performance.now();
    const lockResult = HospitalTools.lock_appointment_slot(doctorId, dateString, time, patientId);
    const latency = Math.round(performance.now() - startTime);

    return {
      agent: this.name,
      agentId: this.id,
      success: lockResult.success,
      reason: lockResult.reason,
      expiresAt: lockResult.expiresAt,
      telemetry: {
        latencyMs: latency,
        toolCalled: "lock_appointment_slot()",
        confidence: 1.0
      }
    };
  }

  confirmBooking(bookingPayload) {
    const startTime = performance.now();
    try {
      const appointment = HospitalTools.book_appointment(bookingPayload);
      const latency = Math.round(performance.now() - startTime);

      return {
        agent: this.name,
        agentId: this.id,
        success: true,
        appointment,
        prompt: `Appointment ${appointment.appointment_id} successfully confirmed with ${appointment.doctor_name}.`,
        telemetry: {
          latencyMs: latency,
          toolCalled: "book_appointment()",
          transactionCommitted: true,
          confidence: 1.0
        }
      };
    } catch (err) {
      const latency = Math.round(performance.now() - startTime);
      return {
        agent: this.name,
        agentId: this.id,
        success: false,
        error: err.message,
        prompt: `Booking failed: ${err.message}`,
        telemetry: {
          latencyMs: latency,
          toolCalled: "book_appointment()",
          transactionCommitted: false,
          error: err.message
        }
      };
    }
  }
}

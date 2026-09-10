/**
 * Agent 6 — Notification Agent
 * Responsibilities:
 * - Triggers instant multi-channel confirmations (SMS, Email, Push)
 * - Configures 24h and 2h automated reminder alerts
 * - Coordinates .ics calendar export
 */

import { NotificationService } from '../services/notificationService.js';

export class NotificationAgent {
  constructor() {
    this.name = "Notification Agent";
    this.id = "AGENT-6";
  }

  notifyBookingSuccess(appointment, patient) {
    const startTime = performance.now();

    NotificationService.dispatchBookingNotifications(appointment, patient);

    const latency = Math.round(performance.now() - startTime);

    return {
      agent: this.name,
      agentId: this.id,
      success: true,
      channels: ["SMS", "Email", "In-App Push", "24h/2h Reminders"],
      prompt: `Dispatched SMS to ${patient.phone} and confirmation email with preparation guidelines to ${patient.email}.`,
      telemetry: {
        latencyMs: latency,
        toolsCalled: ["send_sms()", "send_email()", "send_push_notification()"],
        confidence: 1.0
      }
    };
  }

  notifyCancellation(appointment, patient) {
    NotificationService.dispatchCancellationNotification(appointment, patient);
  }

  notifyReschedule(appointment, patient) {
    NotificationService.dispatchRescheduleNotification(appointment, patient);
  }
}

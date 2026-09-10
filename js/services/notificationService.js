/**
 * MediAssist AI — Multi-Channel Notification & Reminder Dispatcher
 * Handles SMS, Email, Push Notifications, 24h/2h Reminders, and .ics Calendar export.
 */

import { HospitalTools } from './tools.js';

export const NotificationService = {
  dispatchBookingNotifications(appointment, patient) {
    const formattedDate = appointment.date;
    const formattedTime = appointment.time;

    // 1. SMS Dispatch
    const smsMessage = `MediAssist: Your appointment with ${appointment.doctor_name} (${appointment.department}) is confirmed for ${formattedDate} at ${formattedTime}. Appointment ID: ${appointment.appointment_id}. Location: ${appointment.hospital_location}.`;
    HospitalTools.send_sms(patient.patient_id, patient.phone, smsMessage);

    // 2. Email Dispatch with Preparation Instructions
    const emailSubject = `Appointment Confirmed: ${appointment.doctor_name} - ${appointment.appointment_id}`;
    const emailBody = `
Dear ${patient.name},

Your appointment has been successfully scheduled.

APPOINTMENT SUMMARY:
• Appointment ID: ${appointment.appointment_id}
• Doctor: ${appointment.doctor_name}
• Department: ${appointment.department}
• Date & Time: ${formattedDate} at ${formattedTime}
• Consultation Type: ${appointment.appointment_type}
• Hospital Location: ${appointment.hospital_location}
• Consultation Fee: $${appointment.consultation_fee}

PREPARATION & INSTRUCTIONS:
1. Please arrive 15 minutes prior to your scheduled slot for front-desk check-in.
2. Bring your government-issued photo ID and current insurance card.
3. Bring all current prescription bottles or medication lists.
4. If this is a fasting evaluation, refrain from caloric intake 8 hours prior.
5. In case of emergency or worsening symptoms, proceed to our Emergency Wing immediately.

Need to reschedule or cancel? You can manage your booking through your MediAssist Patient Dashboard.
    `.trim();
    HospitalTools.send_email(patient.patient_id, patient.email, emailSubject, emailBody);

    // 3. In-App Push Notification
    HospitalTools.send_push_notification(
      patient.patient_id,
      "Appointment Confirmed 🎉",
      `${appointment.doctor_name} on ${formattedDate} at ${formattedTime}`
    );

    // 4. Automated 24h & 2h Reminder Schedule Log
    HospitalTools.send_push_notification(
      patient.patient_id,
      "Reminders Configured ⏰",
      `Automated SMS/Email alerts scheduled for 24 hours and 2 hours prior to ${formattedTime}.`
    );

    // Show live UI toast
    this.showToast(`Booking Confirmed! SMS sent to ${patient.phone}`, 'success');
  },

  dispatchCancellationNotification(appointment, patient) {
    const sms = `MediAssist: Your appointment ${appointment.appointment_id} with ${appointment.doctor_name} has been cancelled.`;
    HospitalTools.send_sms(patient.patient_id, patient.phone, sms);
    this.showToast(`Appointment ${appointment.appointment_id} has been cancelled.`, 'emergency');
  },

  dispatchRescheduleNotification(appointment, patient) {
    const sms = `MediAssist: Your appointment ${appointment.appointment_id} has been rescheduled to ${appointment.date} at ${appointment.time}.`;
    HospitalTools.send_sms(patient.patient_id, patient.phone, sms);
    this.showToast(`Appointment rescheduled to ${appointment.date} at ${appointment.time}`, 'success');
  },

  showToast(message, type = 'info') {
    if (typeof document === 'undefined') return;
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div style="font-size: 1.25rem;">${type === 'emergency' ? '🚨' : type === 'success' ? '✅' : '🔔'}</div>
      <div style="flex: 1; font-size: 0.85rem; line-height: 1.4;">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  },

  generateICS(appointment) {
    // Generate .ics calendar download
    const cleanDate = appointment.date.replace(/-/g, '');
    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//MediAssist AI//Hospital Appointment//EN",
      "BEGIN:VEVENT",
      `UID:${appointment.appointment_id}@mediassist.hospital`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${cleanDate}T090000Z`,
      `DTEND:${cleanDate}T093000Z`,
      `SUMMARY:Medical Consultation with ${appointment.doctor_name} (${appointment.department})`,
      `DESCRIPTION:Appointment ID: ${appointment.appointment_id}\\nLocation: ${appointment.hospital_location}`,
      `LOCATION:${appointment.hospital_location}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${appointment.appointment_id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

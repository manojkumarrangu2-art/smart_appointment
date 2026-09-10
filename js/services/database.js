/**
 * MediAssist AI — Reactive Relational Database & Slot Transaction Engine
 * Manages Patients, Doctors, Doctor Schedules, Appointments, Triage Assessments,
 * Notifications, Audit Logs, and Transactional Slot Locking.
 */

import { INITIAL_DOCTORS, INITIAL_PATIENTS, INITIAL_APPOINTMENTS } from '../data/hospitalData.js';

const STORAGE_KEY = "mediassist_hospital_db_v1";

class HospitalDatabase {
  constructor() {
    this.subscribers = new Set();
    this.lockedSlots = new Map(); // key: `docId_date_time`, value: { expiresAt, patientId }
    this.load();
  }

  load() {
    if (typeof localStorage === 'undefined') {
      this.resetToDefaults();
      return;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.patients = parsed.patients || [...INITIAL_PATIENTS];
        this.doctors = parsed.doctors || [...INITIAL_DOCTORS];
        this.appointments = parsed.appointments || [...INITIAL_APPOINTMENTS];
        this.triageAssessments = parsed.triageAssessments || [];
        this.notifications = parsed.notifications || [];
        this.auditLogs = parsed.auditLogs || [];
        return;
      } catch (e) {
        console.error("Error loading DB, resetting to defaults", e);
      }
    }
    this.resetToDefaults();
  }

  save() {
    const data = {
      patients: this.patients,
      doctors: this.doctors,
      appointments: this.appointments,
      triageAssessments: this.triageAssessments,
      notifications: this.notifications,
      auditLogs: this.auditLogs
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    this.notifySubscribers();
  }

  resetToDefaults() {
    this.patients = [...INITIAL_PATIENTS];
    this.doctors = [...INITIAL_DOCTORS];
    this.appointments = [...INITIAL_APPOINTMENTS];
    this.triageAssessments = [];
    this.notifications = [
      {
        notification_id: "NOTIF-001",
        patient_id: "PAT-001",
        appointment_id: "MA-20260909-00125",
        type: "SMS",
        message: "Your appointment with Dr. Anil Kumar is confirmed for September 9 at 4:00 PM. Appointment ID: MA-20260909-00125.",
        status: "Delivered",
        sent_at: "2026-09-09T09:31:00Z"
      }
    ];
    this.auditLogs = [
      {
        log_id: "AUD-001",
        action: "DATABASE_INITIALIZED",
        details: "Hospital database seeded with 12 departments, 25+ certified doctors and demo records.",
        timestamp: new Date().toISOString(),
        agent_id: "SYSTEM"
      }
    ];
    this.lockedSlots.clear();
    this.save();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    for (const sub of this.subscribers) {
      try {
        sub();
      } catch (err) {
        console.error("Subscriber error", err);
      }
    }
  }

  logAudit(action, details, agentId = "SYSTEM") {
    const entry = {
      log_id: `AUD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      action,
      details,
      timestamp: new Date().toISOString(),
      agent_id: agentId
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    this.save();
    return entry;
  }

  // --- Patients ---
  getPatient(patientId) {
    return this.patients.find(p => p.patient_id === patientId) || null;
  }

  upsertPatient(patientData) {
    const existingIndex = this.patients.findIndex(p => p.patient_id === patientData.patient_id);
    if (existingIndex >= 0) {
      this.patients[existingIndex] = { ...this.patients[existingIndex], ...patientData };
      this.logAudit("PATIENT_UPDATED", `Updated patient profile for ${patientData.name}`, "PatientIntakeAgent");
    } else {
      const newPatient = {
        patient_id: patientData.patient_id || `PAT-${Date.now().toString().slice(-4)}`,
        created_at: new Date().toISOString(),
        ...patientData
      };
      this.patients.push(newPatient);
      this.logAudit("PATIENT_CREATED", `Created new patient profile for ${newPatient.name}`, "PatientIntakeAgent");
      this.save();
      return newPatient;
    }
    this.save();
    return this.patients[existingIndex];
  }

  // --- Doctors ---
  getDoctors() {
    return [...this.doctors];
  }

  getDoctor(doctorId) {
    return this.doctors.find(d => d.doctor_id === doctorId) || null;
  }

  updateDoctorStatus(doctorId, status) {
    const doc = this.doctors.find(d => d.doctor_id === doctorId);
    if (doc) {
      doc.current_status = status;
      this.logAudit("DOCTOR_STATUS_CHANGED", `Doctor ${doc.name} status updated to ${status}`, "AdminAgent");
      this.save();
    }
  }

  addDoctor(doctorData) {
    const newDoc = {
      doctor_id: `DOC-${Date.now().toString().slice(-4)}`,
      rating: 4.8,
      reviews_count: 1,
      current_status: "Active",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
      ...doctorData
    };
    this.doctors.push(newDoc);
    this.logAudit("DOCTOR_ADDED", `Added doctor ${newDoc.name} (${newDoc.specialization})`, "AdminAgent");
    this.save();
    return newDoc;
  }

  // --- Slot Generation & Transactional Safety ---
  getAvailableSlots(doctorId, dateString) {
    const doctor = this.getDoctor(doctorId);
    if (!doctor) return [];

    // Clean expired locks
    const now = Date.now();
    for (const [key, lock] of this.lockedSlots.entries()) {
      if (lock.expiresAt < now) {
        this.lockedSlots.delete(key);
      }
    }

    // Standard hospital slot templates
    const baseTimes = [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
      "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "06:00 PM"
    ];

    // Filter by existing bookings
    const bookingsOnDate = this.appointments.filter(
      a => a.doctor_id === doctorId && a.date === dateString && a.status !== "Cancelled"
    );

    return baseTimes.map(time => {
      const lockKey = `${doctorId}_${dateString}_${time}`;
      const isBooked = bookingsOnDate.some(a => a.time === time);
      const isLocked = this.lockedSlots.has(lockKey);

      let status = "Available";
      if (isBooked) status = "Booked";
      else if (isLocked) status = "Locked";

      return {
        slot_id: `SLOT-${doctorId}-${dateString}-${time.replace(/\s+/g, '')}`,
        doctor_id: doctorId,
        date: dateString,
        time,
        status,
        duration: doctor.appointment_duration || 30
      };
    });
  }

  // Transaction Step 1: Temporarily Lock Slot (5 minute expiration)
  lockSlot(doctorId, dateString, time, patientId) {
    const lockKey = `${doctorId}_${dateString}_${time}`;
    const now = Date.now();

    // Check if booked
    const isBooked = this.appointments.some(
      a => a.doctor_id === doctorId && a.date === dateString && a.time === time && a.status !== "Cancelled"
    );
    if (isBooked) {
      return { success: false, reason: "SLOT_ALREADY_BOOKED" };
    }

    // Check if locked by someone else
    const currentLock = this.lockedSlots.get(lockKey);
    if (currentLock && currentLock.expiresAt > now && currentLock.patientId !== patientId) {
      return { success: false, reason: "SLOT_CURRENTLY_LOCKED" };
    }

    // Apply 5-minute lock
    const expiresAt = now + 5 * 60 * 1000;
    this.lockedSlots.set(lockKey, { expiresAt, patientId });
    this.logAudit("SLOT_LOCKED", `Slot reserved for 5m: ${dateString} ${time} with ${doctorId}`, "AppointmentAgent");
    return { success: true, expiresAt };
  }

  unlockSlot(doctorId, dateString, time) {
    const lockKey = `${doctorId}_${dateString}_${time}`;
    this.lockedSlots.delete(lockKey);
  }

  // Transaction Step 2: Finalize Booking with Verification
  bookAppointment({ patientId, doctorId, date, time, appointmentType = "In-Person Consultation", symptomsSummary = "" }) {
    const doctor = this.getDoctor(doctorId);
    const patient = this.getPatient(patientId);

    if (!doctor) throw new Error("Invalid Doctor ID");
    if (!patient) throw new Error("Invalid Patient ID");

    // Race condition double check
    const isBooked = this.appointments.some(
      a => a.doctor_id === doctorId && a.date === date && a.time === time && a.status !== "Cancelled"
    );
    if (isBooked) {
      this.unlockSlot(doctorId, date, time);
      throw new Error("Double booking detected. This slot was just reserved by another patient.");
    }

    const dateCompact = date.replace(/-/g, '');
    const randNum = Math.floor(10000 + Math.random() * 90000);
    const appointmentId = `MA-${dateCompact}-${randNum}`;

    const newAppointment = {
      appointment_id: appointmentId,
      patient_id: patientId,
      patient_name: patient.name,
      patient_phone: patient.phone,
      doctor_id: doctorId,
      doctor_name: doctor.name,
      department: doctor.department,
      date,
      time,
      appointment_type: appointmentType,
      hospital_location: `${doctor.hospital_location}, Room ${doctor.room_number}`,
      room_number: doctor.room_number,
      status: "Confirmed",
      symptoms_summary: symptomsSummary,
      consultation_fee: doctor.consultation_fee,
      created_at: new Date().toISOString()
    };

    this.appointments.unshift(newAppointment);
    this.unlockSlot(doctorId, date, time); // Release lock now that it's committed

    this.logAudit(
      "APPOINTMENT_BOOKED",
      `Booking ${appointmentId} confirmed for ${patient.name} with ${doctor.name} at ${time} on ${date}`,
      "AppointmentAgent"
    );

    this.save();
    return newAppointment;
  }

  rescheduleAppointment(appointmentId, newDate, newTime) {
    const appt = this.appointments.find(a => a.appointment_id === appointmentId);
    if (!appt) throw new Error("Appointment not found");

    // Verify slot
    const isBooked = this.appointments.some(
      a => a.doctor_id === appt.doctor_id && a.date === newDate && a.time === newTime && a.status !== "Cancelled"
    );
    if (isBooked) throw new Error("New selected slot is already booked.");

    const oldDate = appt.date;
    const oldTime = appt.time;

    appt.date = newDate;
    appt.time = newTime;
    appt.status = "Rescheduled";
    appt.updated_at = new Date().toISOString();

    this.logAudit(
      "APPOINTMENT_RESCHEDULED",
      `Rescheduled ${appointmentId} from ${oldDate} ${oldTime} to ${newDate} ${newTime}`,
      "PatientSupportAgent"
    );

    this.save();
    return appt;
  }

  cancelAppointment(appointmentId, reason = "Patient request") {
    const appt = this.appointments.find(a => a.appointment_id === appointmentId);
    if (!appt) throw new Error("Appointment not found");

    appt.status = "Cancelled";
    appt.cancellation_reason = reason;
    appt.cancelled_at = new Date().toISOString();

    this.logAudit(
      "APPOINTMENT_CANCELLED",
      `Cancelled booking ${appointmentId} (${reason})`,
      "PatientSupportAgent"
    );

    this.save();
    return appt;
  }

  // --- Triage Assessments ---
  saveTriageAssessment(assessment) {
    const record = {
      assessment_id: `ASMT-${Date.now().toString(36).toUpperCase()}`,
      created_at: new Date().toISOString(),
      ...assessment
    };
    this.triageAssessments.unshift(record);
    this.logAudit(
      "TRIAGE_ASSESSMENT_COMPLETED",
      `Assessed risk level: ${assessment.risk_level}, Recommended: ${assessment.recommended_specialty}`,
      "SymptomTriageAgent"
    );
    this.save();
    return record;
  }

  // --- Notifications ---
  addNotification(notification) {
    const record = {
      notification_id: `NOTIF-${Date.now().toString(36).toUpperCase()}`,
      sent_at: new Date().toISOString(),
      status: "Delivered",
      ...notification
    };
    this.notifications.unshift(record);
    this.save();
    return record;
  }
}

export const db = new HospitalDatabase();

/**
 * MediAssist AI — Hospital Tools & API Execution Layer
 * Standardized function tool interfaces for autonomous agent operations.
 * Connected directly to internal hospital data stores.
 */

import { db } from './database.js';
import { EMERGENCY_RED_FLAGS, SPECIALTY_ROUTING_RULES, DEPARTMENTS } from '../data/hospitalData.js';

export const HospitalTools = {
  // Patient Tools
  get_patient_profile(patient_id) {
    return db.getPatient(patient_id);
  },

  create_patient_profile(profileData) {
    return db.upsertPatient(profileData);
  },

  // Symptom Analysis & Emergency Screening
  check_emergency_red_flags(symptomText) {
    const textLower = symptomText.toLowerCase();
    const matchedFlags = [];

    for (const flag of EMERGENCY_RED_FLAGS) {
      const match = flag.keywords.some(keyword => textLower.includes(keyword.toLowerCase()));
      if (match) {
        matchedFlags.push(flag);
      }
    }

    const isEmergency = matchedFlags.length > 0;
    return {
      is_emergency: isEmergency,
      severity: isEmergency ? "Emergency" : "Routine",
      flags: matchedFlags,
      action: isEmergency
        ? "HALT_ROUTINE_FLOW: Recommend immediate emergency care."
        : "PROCEED_WITH_STANDARD_TRIAGE"
    };
  },

  analyze_symptoms(symptomText, details = {}) {
    const textLower = symptomText.toLowerCase();
    const emergencyCheck = this.check_emergency_red_flags(textLower);

    // Extract potential symptom keywords
    const detected = [];
    const searchKeywords = [
      "fever", "cough", "sore throat", "stomach pain", "headache", "knee pain",
      "skin rash", "chest pain", "shortness of breath", "dizziness", "acid reflux",
      "back pain", "earache", "blurred vision", "toothache", "anxiety", "diarrhea"
    ];

    for (const kw of searchKeywords) {
      if (textLower.includes(kw)) {
        detected.push(kw);
      }
    }

    if (detected.length === 0) {
      detected.push("General Health Concern");
    }

    // Determine specialty routing
    const recommendation = this.get_specialty_recommendation(detected);

    const assessment = {
      symptoms: detected,
      free_text: symptomText,
      duration: details.duration || "1-3 days",
      severity: details.severity || (emergencyCheck.is_emergency ? "Severe" : "Moderate"),
      risk_level: emergencyCheck.is_emergency ? "🔴 Emergency" : "🟡 Routine",
      is_emergency: emergencyCheck.is_emergency,
      emergency_details: emergencyCheck.flags,
      recommended_specialty: recommendation.department,
      possible_conditions: recommendation.conditions,
      clinical_rationale: recommendation.rationale
    };

    return assessment;
  },

  get_specialty_recommendation(symptomsList) {
    const symptomStrings = symptomsList.map(s => s.toLowerCase());

    for (const rule of SPECIALTY_ROUTING_RULES) {
      const hasMatch = rule.symptoms.some(rs => symptomStrings.some(s => s.includes(rs) || rs.includes(s)));
      if (hasMatch) {
        return {
          department: rule.department,
          conditions: rule.conditions,
          rationale: rule.rationale
        };
      }
    }

    // Fallback default
    return {
      department: "General Medicine",
      conditions: ["General medical symptoms", "Unspecified health evaluation"],
      rationale: "Your symptoms are best evaluated initially by a General Medicine physician."
    };
  },

  // Doctor Tools
  search_doctors({ specialty, language, location, maxFee, mode = "all" }) {
    let results = db.getDoctors().filter(doc => doc.current_status === "Active");

    if (specialty && specialty !== "all") {
      results = results.filter(doc =>
        doc.department.toLowerCase().includes(specialty.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(specialty.toLowerCase())
      );
    }

    if (language && language !== "all") {
      results = results.filter(doc =>
        doc.languages.some(l => l.toLowerCase() === language.toLowerCase())
      );
    }

    if (location && location !== "all") {
      results = results.filter(doc =>
        doc.hospital_location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (maxFee) {
      results = results.filter(doc => doc.consultation_fee <= maxFee);
    }

    if (mode === "online") {
      results = results.filter(doc => doc.online_consultation);
    } else if (mode === "in_person") {
      results = results.filter(doc => doc.in_person_consultation);
    }

    // Sort by rating descending
    results.sort((a, b) => b.rating - a.rating);
    return results;
  },

  get_doctor_details(doctor_id) {
    return db.getDoctor(doctor_id);
  },

  // Appointment & Availability Tools
  get_available_slots(doctor_id, date) {
    return db.getAvailableSlots(doctor_id, date);
  },

  lock_appointment_slot(doctor_id, date, time, patient_id) {
    return db.lockSlot(doctor_id, date, time, patient_id);
  },

  book_appointment(bookingData) {
    return db.bookAppointment(bookingData);
  },

  verify_booking(appointment_id) {
    const appt = db.appointments.find(a => a.appointment_id === appointment_id);
    return {
      verified: !!appt,
      appointment: appt || null
    };
  },

  cancel_appointment(appointment_id, reason) {
    return db.cancelAppointment(appointment_id, reason);
  },

  reschedule_appointment(appointment_id, new_date, new_time) {
    return db.rescheduleAppointment(appointment_id, new_date, new_time);
  },

  get_patient_appointments(patient_id) {
    return db.appointments.filter(a => a.patient_id === patient_id);
  },

  // Notification Tools
  send_sms(patient_id, toPhone, message) {
    return db.addNotification({
      patient_id,
      type: "SMS",
      recipient: toPhone,
      message,
      sent_at: new Date().toISOString()
    });
  },

  send_email(patient_id, toEmail, subject, body) {
    return db.addNotification({
      patient_id,
      type: "Email",
      recipient: toEmail,
      subject,
      message: body,
      sent_at: new Date().toISOString()
    });
  },

  send_push_notification(patient_id, title, body) {
    return db.addNotification({
      patient_id,
      type: "Push",
      recipient: "Current Device",
      subject: title,
      message: body,
      sent_at: new Date().toISOString()
    });
  },

  get_departments() {
    return DEPARTMENTS;
  }
};

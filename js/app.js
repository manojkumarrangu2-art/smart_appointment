/**
 * MediAssist AI — Main Application Orchestration & Bootstrap
 * Connects UI, Conversational State, Voice Engine, and 8 Autonomous Agents.
 */

import { db } from './services/database.js';
import { HospitalTools } from './services/tools.js';
import { orchestrator } from './agents/orchestrator.js';
import { views } from './ui/views.js';
import { agentInspector } from './ui/agentInspector.js';
import { speechService } from './services/speechService.js';
import { NotificationService } from './services/notificationService.js';
import { ADAPTIVE_QUESTIONS } from './data/hospitalData.js';

class MediAssistApp {
  constructor() {
    this.chatState = {
      step: 'INIT',
      patient: {
        name: "John Doe",
        age: 34,
        gender: "Male",
        phone: "+1 (555) 234-5678",
        email: "john.doe@example.com",
        preferred_language: "English"
      },
      symptomText: "",
      symptomDetails: {},
      currentAdaptiveQuestion: null,
      activeAppointmentForReschedule: null,
      activeAppointmentForCancel: null
    };
  }

  init() {
    views.init();
    agentInspector.render();
    this.renderLandingDepts();

    // Default triage welcome message in chat history
    this.resetTriageChat();

    console.log("MediAssist AI Platform successfully initialized.");
  }

  // --- Navigation & Role Switching ---
  navigate(screenId) {
    views.showScreen(screenId);
  }

  switchRole(role) {
    views.setRole(role);
  }

  changeLanguage(langCode) {
    views.setLanguage(langCode);
    speechService.setLanguage(langCode);
    NotificationService.showToast(`Language set to ${langCode.toUpperCase()}`, 'info');
  }

  toggleContrast() {
    document.body.classList.toggle('high-contrast');
  }

  toggleFontScale() {
    document.body.classList.toggle('large-text');
  }

  toggleAgentDrawer() {
    agentInspector.toggle();
  }

  toggleNotificationDrawer() {
    const modal = document.getElementById('notifDrawer');
    if (modal) {
      modal.classList.toggle('active');
      this.renderNotificationHistory();
    }
  }

  renderNotificationHistory() {
    const container = document.getElementById('notifHistoryList');
    if (!container) return;

    if (db.notifications.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No notifications dispatched yet.</div>`;
      return;
    }

    container.innerHTML = db.notifications.map(n => `
      <div style="background: var(--bg-main); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 0.85rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 0.35rem;">
          <span class="badge badge-routine">${n.type}</span>
          <span>${new Date(n.sent_at).toLocaleTimeString()}</span>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-primary); line-height: 1.4;">
          ${n.subject ? `<strong>${n.subject}</strong><br>` : ''}
          ${n.message.replace(/\n/g, '<br>')}
        </div>
      </div>
    `).join('');
  }

  // --- Voice Interface (Web Speech API) ---
  toggleVoiceInput() {
    const micBtn = document.getElementById('voiceMicBtn');
    const inputField = document.getElementById('chatInputField');

    if (speechService.isListening) {
      speechService.stopListening();
      if (micBtn) micBtn.classList.remove('recording');
    } else {
      if (micBtn) micBtn.classList.add('recording');
      NotificationService.showToast("Listening... Describe your symptoms.", "info");

      speechService.startListening(
        (transcript) => {
          if (inputField) inputField.value = transcript;
          if (micBtn) micBtn.classList.remove('recording');
          this.submitChatMessage();
        },
        (error) => {
          if (micBtn) micBtn.classList.remove('recording');
          NotificationService.showToast(`Voice Input: ${error}`, "info");
        },
        () => {
          if (micBtn) micBtn.classList.remove('recording');
        }
      );
    }
  }

  toggleSpeechVoice() {
    speechService.toggleTTS(!speechService.ttsEnabled);
    const btn = document.getElementById('ttsToggleBtn');
    if (btn) {
      btn.textContent = speechService.ttsEnabled ? '🔊' : '🔇';
      NotificationService.showToast(`Text-to-Speech: ${speechService.ttsEnabled ? 'Enabled' : 'Muted'}`, 'info');
    }
  }

  // --- Conversational Symptom Triage Flow ---
  startSymptomFlow() {
    views.showScreen('symptom-wizard-screen');
    if (this.chatState.step === 'INIT') {
      this.resetTriageChat();
    }
  }

  resetTriageChat() {
    this.chatState.step = 'INIT';
    this.chatState.symptomText = "";
    this.chatState.symptomDetails = {};
    this.chatState.currentAdaptiveQuestion = null;

    const chatHistory = document.getElementById('chatHistoryContainer');
    if (chatHistory) chatHistory.innerHTML = "";

    const chipsBar = document.getElementById('commonSymptomsBar');
    if (chipsBar) chipsBar.style.display = 'none';

    this.updateStepperUI(1);

    // Initial bot message
    const welcome = orchestrator.processIntake('INIT', '', this.chatState.patient);
    this.appendAgentMessage(welcome.prompt, [
      { text: "Yes, Start", action: () => this.handleIntakeResponse("Yes, start") },
      { text: "Book directly", action: () => views.showScreen('doctor-directory-screen') }
    ]);
  }

  appendAgentMessage(text, options = []) {
    const container = document.getElementById('chatHistoryContainer');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'message-row agent';

    let optionsHtml = '';
    if (options.length > 0) {
      optionsHtml = `
        <div class="adaptive-question-card">
          <div class="question-options-grid">
            ${options.map((opt, idx) => `
              <button class="chip-option" id="chatOpt_${Date.now()}_${idx}">
                ${opt.text}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    row.innerHTML = `
      <div class="chat-avatar" style="width: 32px; height: 32px; font-size: 1rem;">🩺</div>
      <div style="flex: 1;">
        <div class="bubble">${text.replace(/\n/g, '<br>')}</div>
        ${optionsHtml}
        <div class="bubble-timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    `;

    container.appendChild(row);

    // Bind option click handlers
    options.forEach((opt, idx) => {
      const btn = row.querySelectorAll('.chip-option')[idx];
      if (btn) {
        btn.onclick = () => {
          btn.classList.add('selected');
          opt.action();
        };
      }
    });

    container.scrollTop = container.scrollHeight;

    // Speak aloud via TTS if enabled
    speechService.speak(text);
  }

  appendUserMessage(text) {
    const container = document.getElementById('chatHistoryContainer');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'message-row user';
    row.innerHTML = `
      <div style="flex: 1;">
        <div class="bubble">${text}</div>
        <div class="bubble-timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    `;

    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  }

  submitChatMessage() {
    const input = document.getElementById('chatInputField');
    if (!input || !input.value.trim()) return;

    const userText = input.value.trim();
    input.value = "";
    this.appendUserMessage(userText);

    // Check emergency directly on free-text
    const redFlag = HospitalTools.check_emergency_red_flags(userText);
    if (redFlag.is_emergency) {
      views.renderEmergencyScreen(redFlag);
      return;
    }

    if (this.chatState.step === 'INIT' || this.chatState.step === 'CONFIRM_START' || this.chatState.step === 'NAME' || this.chatState.step === 'AGE_GENDER' || this.chatState.step === 'CONTACT') {
      this.handleIntakeResponse(userText);
    } else if (this.chatState.step === 'SYMPTOMS_START' || this.chatState.step === 'AWAITING_SYMPTOMS') {
      this.handleSymptomInput(userText);
    } else if (this.chatState.step === 'ADAPTIVE_QUESTIONS') {
      this.handleAdaptiveResponse(userText);
    } else {
      this.handleSymptomInput(userText);
    }
  }

  handleIntakeResponse(text) {
    let nextKey = this.chatState.step;
    if (nextKey === 'INIT') nextKey = 'CONFIRM_START';

    const res = orchestrator.processIntake(nextKey, text, this.chatState.patient);
    this.chatState.step = res.nextStep;
    this.chatState.patient = res.updatedProfile;
    views.currentPatient = res.updatedProfile;

    // Update patient sidebar UI
    this.updateSidebarPatientProfile();

    if (res.isComplete) {
      this.updateStepperUI(2);
      const chipsBar = document.getElementById('commonSymptomsBar');
      if (chipsBar) chipsBar.style.display = 'flex';

      this.appendAgentMessage(res.prompt, [
        { text: "Fever & severe headache", action: () => this.handleSymptomInput("I have fever and severe headache for 3 days") },
        { text: "Stomach pain after eating", action: () => this.handleSymptomInput("My stomach hurts after eating") },
        { text: "Persistent knee pain & swelling", action: () => this.handleSymptomInput("Persistent knee pain and swelling for a week") }
      ]);
      this.chatState.step = 'AWAITING_SYMPTOMS';
    } else {
      this.appendAgentMessage(res.prompt);
    }
  }

  handleSymptomInput(symptomText) {
    this.chatState.symptomText = symptomText;
    this.updateStepperUI(3);

    // Process via orchestrator
    const result = orchestrator.processSymptomInput(symptomText, this.chatState.symptomDetails);

    // Emergency check
    if (result.isEmergency) {
      views.renderEmergencyScreen(result.emergencyData);
      return;
    }

    const triage = result.triage;
    const routing = result.routing.routingResult;

    // Check if adaptive follow-up exists
    if (triage.followUpQuestion && triage.followUpOptions && triage.followUpOptions.length > 0) {
      this.chatState.step = 'ADAPTIVE_QUESTIONS';
      this.chatState.currentAdaptiveQuestion = triage.followUpQuestion;

      const optionButtons = triage.followUpOptions.map(opt => ({
        text: opt,
        action: () => this.handleAdaptiveResponse(opt)
      }));

      this.appendAgentMessage(triage.followUpQuestion, optionButtons);
    } else {
      // Proceed directly to routing summary
      this.finalizeTriageAndShowSummary(triage.triageData, routing);
    }
  }

  handleAdaptiveResponse(answer) {
    this.chatState.symptomDetails[this.chatState.currentAdaptiveQuestion] = answer;
    this.appendAgentMessage("Got it, thank you. Let me evaluate your symptoms and determine the right hospital department.");

    setTimeout(() => {
      const fullText = `${this.chatState.symptomText}. ${answer}`;
      const result = orchestrator.processSymptomInput(fullText, this.chatState.symptomDetails);

      if (result.isEmergency) {
        views.renderEmergencyScreen(result.emergencyData);
        return;
      }

      this.finalizeTriageAndShowSummary(result.triage.triageData, result.routing.routingResult);
    }, 600);
  }

  finalizeTriageAndShowSummary(triageData, routingData) {
    this.updateStepperUI(4);
    views.renderSymptomSummary(triageData, routingData);
  }

  addSymptomChip(symptomName) {
    const input = document.getElementById('chatInputField');
    if (input) {
      if (input.value) input.value += `, ${symptomName}`;
      else input.value = symptomName;
      input.focus();
    }
  }

  updateSidebarPatientProfile() {
    const p = this.chatState.patient;
    const nameEl = document.getElementById('sideProfileName');
    const ageSexEl = document.getElementById('sideProfileAgeSex');
    const contactEl = document.getElementById('sideProfileContact');
    const langEl = document.getElementById('sideProfileLang');

    if (nameEl) nameEl.textContent = p.name || '—';
    if (ageSexEl) ageSexEl.textContent = p.age ? `${p.age} yrs • ${p.gender}` : '—';
    if (contactEl) contactEl.textContent = p.phone || '—';
    if (langEl) langEl.textContent = p.preferred_language || 'English';
  }

  updateStepperUI(activeStepNum) {
    const fill = document.getElementById('stepperLineFill');
    if (fill) fill.style.width = `${(activeStepNum - 1) * 25}%`;

    for (let i = 1; i <= 5; i++) {
      const step = document.getElementById(`stepIndicator${i}`);
      if (step) {
        step.classList.remove('active', 'completed');
        if (i < activeStepNum) step.classList.add('completed');
        else if (i === activeStepNum) step.classList.add('active');
      }
    }
  }

  // --- Doctor Selection & Calendar ---
  showDoctorMatching() {
    this.updateStepperUI(5);
    views.showScreen('doctor-matching-screen');
    views.renderDoctorMatchingGrid();
  }

  selectDoctor(doctorId) {
    views.selectDoctor(doctorId);
  }

  changeDateOffset(days) {
    const curr = new Date(views.selectedDate + "T00:00:00");
    curr.setDate(curr.getDate() + days);
    views.selectedDate = curr.toISOString().split('T')[0];
    views.renderCalendarSlots();
  }

  handleCustomDate(newDate) {
    if (newDate) {
      views.selectedDate = newDate;
      views.renderCalendarSlots();
    }
  }

  openConfirmModal(time) {
    views.openBookingConfirmationModal(time);
  }

  closeConfirmModal() {
    views.closeBookingConfirmationModal();
  }

  finalizeBooking() {
    const modal = document.getElementById('bookingConfirmModal');
    if (modal) modal.classList.remove('active');

    const bookingPayload = {
      patientId: views.currentPatient.patient_id || 'PAT-001',
      patientName: views.currentPatient.name,
      patientPhone: views.currentPatient.phone,
      patientEmail: views.currentPatient.email,
      doctorId: views.selectedDoctor.doctor_id,
      date: views.selectedDate,
      time: views.selectedSlot,
      appointmentType: 'In-Person Consultation',
      symptomsSummary: this.chatState.symptomText || 'Routine Medical Checkup'
    };

    const res = orchestrator.executeBooking(bookingPayload);
    if (res.success) {
      views.renderConfirmedScreen(res.appointment);
    } else {
      alert(`Booking Failed: ${res.error}`);
    }
  }

  downloadCurrentCalendar() {
    const lastAppt = db.appointments[0];
    if (lastAppt) {
      NotificationService.generateICS(lastAppt);
    }
  }

  downloadCalendar(appointmentId) {
    const appt = db.appointments.find(a => a.appointment_id === appointmentId);
    if (appt) {
      NotificationService.generateICS(appt);
    }
  }

  openDirectionsModal() {
    const modal = document.getElementById('directionsModal');
    if (modal) modal.classList.add('active');
  }

  // --- Reschedule & Cancel Workflows ---
  openRescheduleModal(appointmentId) {
    this.chatState.activeAppointmentForReschedule = appointmentId;
    const modal = document.getElementById('rescheduleModal');
    const appt = db.appointments.find(a => a.appointment_id === appointmentId);
    if (!modal || !appt) return;

    const dateInput = document.getElementById('rescheduleDateInput');
    if (dateInput) {
      dateInput.value = appt.date;
      this.renderRescheduleSlots();
    }
    modal.classList.add('active');
  }

  renderRescheduleSlots() {
    const apptId = this.chatState.activeAppointmentForReschedule;
    const appt = db.appointments.find(a => a.appointment_id === apptId);
    const dateInput = document.getElementById('rescheduleDateInput');
    const grid = document.getElementById('rescheduleSlotsGrid');

    if (!appt || !dateInput || !grid) return;

    const slots = db.getAvailableSlots(appt.doctor_id, dateInput.value);
    grid.innerHTML = slots.map(s => {
      const isAvail = s.status === 'Available';
      return `
        <button
          class="btn btn-sm ${isAvail ? 'btn-secondary' : 'btn-secondary'}"
          style="${!isAvail ? 'opacity: 0.4; cursor: not-allowed;' : ''}"
          ${isAvail ? `onclick="window.mediAssist.selectRescheduleSlot('${s.time}', this)"` : 'disabled'}
        >
          ${s.time}
        </button>
      `;
    }).join('');
  }

  selectRescheduleSlot(time, btn) {
    document.querySelectorAll('#rescheduleSlotsGrid button').forEach(b => b.classList.remove('btn-primary'));
    btn.classList.add('btn-primary');
    btn.classList.remove('btn-secondary');
    this.chatState.selectedRescheduleTime = time;
  }

  executeReschedule() {
    const apptId = this.chatState.activeAppointmentForReschedule;
    const dateInput = document.getElementById('rescheduleDateInput');
    const newTime = this.chatState.selectedRescheduleTime;

    if (!newTime || !dateInput?.value) {
      alert("Please select a new time slot.");
      return;
    }

    try {
      const updated = orchestrator.supportAgent.reschedule(apptId, dateInput.value, newTime);
      orchestrator.notificationAgent.notifyReschedule(updated, views.currentPatient);
      this.closeRescheduleModal();
      views.renderPatientDashboard();
    } catch (e) {
      alert(`Reschedule Error: ${e.message}`);
    }
  }

  closeRescheduleModal() {
    const modal = document.getElementById('rescheduleModal');
    if (modal) modal.classList.remove('active');
  }

  openCancelModal(appointmentId) {
    this.chatState.activeAppointmentForCancel = appointmentId;
    const appt = db.appointments.find(a => a.appointment_id === appointmentId);
    const modal = document.getElementById('cancelModal');
    const prompt = document.getElementById('cancelModalPrompt');

    if (prompt && appt) {
      prompt.textContent = `Are you sure you want to cancel your appointment with ${appt.doctor_name} on ${appt.date} at ${appt.time}?`;
    }
    if (modal) modal.classList.add('active');
  }

  executeCancel() {
    const apptId = this.chatState.activeAppointmentForCancel;
    const reason = document.getElementById('cancelReasonSelect')?.value || "Patient requested cancellation";
    const appt = db.appointments.find(a => a.appointment_id === apptId);

    if (appt) {
      orchestrator.supportAgent.cancel(apptId, reason);
      orchestrator.notificationAgent.notifyCancellation(appt, views.currentPatient);
    }
    this.closeCancelModal();
    views.renderPatientDashboard();
  }

  closeCancelModal() {
    const modal = document.getElementById('cancelModal');
    if (modal) modal.classList.remove('active');
  }

  // --- Natural Language Search & Conversational Commands ---
  handleNaturalSearch(query) {
    if (!query || !query.trim()) return;

    const parsed = orchestrator.handleNaturalQuery(query);

    switch (parsed.intent) {
      case 'EMERGENCY_ESCALATION':
        views.renderEmergencyScreen({ flags: [{ title: "Critical Emergency Symptoms", action: "Call Emergency Services (911 / 108 / 112)" }] });
        break;

      case 'FIND_DOCTOR':
        views.showScreen('doctor-directory-screen');
        if (parsed.payload.specialty) {
          const sel = document.getElementById('dirSpecialtyFilter');
          if (sel) sel.value = parsed.payload.specialty;
        }
        if (parsed.payload.language) {
          const sel = document.getElementById('dirLanguageFilter');
          if (sel) sel.value = parsed.payload.language;
        }
        views.renderDoctorDirectory();
        break;

      case 'CANCEL_APPOINTMENT':
        views.showScreen('patient-dashboard-screen');
        NotificationService.showToast("Select the appointment you wish to cancel below.", "info");
        break;

      case 'RESCHEDULE_APPOINTMENT':
        views.showScreen('patient-dashboard-screen');
        NotificationService.showToast("Select the appointment you wish to reschedule below.", "info");
        break;

      case 'VIEW_APPOINTMENTS':
        views.showScreen('patient-dashboard-screen');
        break;

      case 'SYMPTOM_CHECK':
      default:
        this.startSymptomFlow();
        setTimeout(() => {
          this.handleIntakeResponse("Yes, start");
          setTimeout(() => {
            this.handleIntakeResponse("John Doe");
            setTimeout(() => {
              this.handleIntakeResponse("34, Male");
              setTimeout(() => {
                this.handleIntakeResponse("+1 (555) 234-5678, john@example.com");
                setTimeout(() => {
                  this.handleSymptomInput(query);
                }, 400);
              }, 400);
            }, 400);
          }, 400);
        }, 300);
        break;
    }
  }

  triggerEmergencyDemo() {
    views.renderEmergencyScreen({
      flags: [
        { title: "Severe Chest Pain / Possible Cardiac Event", action: "Call 911 / 108 / 112 immediately." },
        { title: "Acute Respiratory Distress", action: "Emergency oxygenation required." }
      ]
    });
  }

  filterByDepartment(deptName) {
    views.showScreen('doctor-directory-screen');
    const sel = document.getElementById('dirSpecialtyFilter');
    if (sel) sel.value = deptName;
    views.renderDoctorDirectory();
  }

  showDoctorDirectory() {
    views.showScreen('doctor-directory-screen');
  }

  renderDoctorDirectory() {
    views.renderDoctorDirectory();
  }

  // --- Landing Departments Preview ---
  renderLandingDepts() {
    const container = document.getElementById('landingDeptsGrid');
    if (!container) return;

    const featured = HospitalTools.get_departments().slice(0, 4);
    container.innerHTML = featured.map(dept => `
      <div class="dept-card card-interactive" onclick="window.mediAssist.filterByDepartment('${dept.name}')">
        <div class="dept-icon">🏥</div>
        <h3>${dept.name}</h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">${dept.description}</p>
        <span style="font-size: 0.8rem; color: var(--primary); font-weight: 600; margin-top: auto;">Explore Doctors →</span>
      </div>
    `).join('');
  }

  // --- Admin Console Operations ---
  resetHospitalDB() {
    if (confirm("Reset hospital database to initial seed data?")) {
      db.resetToDefaults();
      NotificationService.showToast("Hospital database reset to defaults.", "info");
    }
  }

  toggleDoctorStatus(doctorId) {
    const doc = db.getDoctor(doctorId);
    if (!doc) return;
    const newStatus = doc.current_status === 'Active' ? 'On Leave' : 'Active';
    db.updateDoctorStatus(doctorId, newStatus);
    NotificationService.showToast(`${doc.name} marked as ${newStatus}`, "info");
  }

  // --- Doctor Portal Operations ---
  changePortalDoctor(doctorId) {
    views.selectedPortalDoctorId = doctorId;
    views.renderDoctorPortal();
  }

  markPatientArrived(appointmentId) {
    const appt = db.appointments.find(a => a.appointment_id === appointmentId);
    if (appt) {
      appt.status = "Arrived (In Waiting)";
      db.save();
      NotificationService.showToast(`Patient ${appt.patient_name} marked as Arrived.`, "success");
    }
  }

  openNotesModal(appointmentId) {
    const appt = db.appointments.find(a => a.appointment_id === appointmentId);
    if (!appt) return;
    const notes = prompt(`Enter clinical consultation notes for ${appt.patient_name}:`, appt.clinical_notes || "");
    if (notes !== null) {
      appt.clinical_notes = notes;
      appt.status = "Consultation Completed";
      db.save();
      NotificationService.showToast(`Consultation completed for ${appt.patient_name}`, "success");
    }
  }
}

// Global instance for browser event bindings
window.mediAssist = new MediAssistApp();
window.addEventListener('DOMContentLoaded', () => {
  window.mediAssist.init();
});

/**
 * MediAssist AI — UI Views & Screen Navigation Controller
 * Manages screen transitions, rendering of doctor grids, calendars,
 * dashboard metrics, modals, and multilingual string updates.
 */

import { db } from '../services/database.js';
import { HospitalTools } from '../services/tools.js';
import { I18N } from '../data/i18n.js';
import { renderQRCode } from './qrCode.js';
import { triggerConfetti } from './confetti.js';
import { NotificationService } from '../services/notificationService.js';

export class ViewsController {
  constructor() {
    this.currentLang = 'en';
    this.activeScreen = 'landing-screen';
    this.selectedDoctor = null;
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.selectedSlot = null;
    this.currentPatient = {
      name: "John Doe",
      age: 34,
      gender: "Male",
      phone: "+1 (555) 234-5678",
      email: "john.doe@example.com",
      preferred_language: "English"
    };
    this.currentTriage = null;
    this.currentRouting = null;
    this.activeRole = 'patient'; // patient | admin | doctor
    this.selectedPortalDoctorId = 'DOC-101'; // Default for Doctor Portal
  }

  init() {
    // Subscribe to DB updates for real-time reactivity
    db.subscribe(() => {
      this.refreshCurrentView();
    });
  }

  setLanguage(langCode) {
    if (!I18N[langCode]) return;
    this.currentLang = langCode;
    const t = I18N[langCode];

    // Update static i18n DOM elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) {
        el.textContent = t[key];
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key]) {
        el.setAttribute('placeholder', t[key]);
      }
    });

    this.refreshCurrentView();
  }

  getT(key) {
    return I18N[this.currentLang]?.[key] || I18N['en'][key] || key;
  }

  showScreen(screenId) {
    this.activeScreen = screenId;
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-target') === screenId);
    });

    this.refreshCurrentView();
  }

  setRole(role) {
    this.activeRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-role') === role);
    });

    if (role === 'admin') {
      this.showScreen('admin-dashboard-screen');
    } else if (role === 'doctor') {
      this.showScreen('doctor-portal-screen');
    } else {
      this.showScreen('landing-screen');
    }
  }

  refreshCurrentView() {
    switch (this.activeScreen) {
      case 'landing-screen':
        this.renderLandingStats();
        break;
      case 'doctor-matching-screen':
        this.renderDoctorMatchingGrid();
        break;
      case 'appointment-calendar-screen':
        this.renderCalendarSlots();
        break;
      case 'patient-dashboard-screen':
        this.renderPatientDashboard();
        break;
      case 'doctor-directory-screen':
        this.renderDoctorDirectory();
        break;
      case 'departments-screen':
        this.renderDepartments();
        break;
      case 'admin-dashboard-screen':
        this.renderAdminDashboard();
        break;
      case 'doctor-portal-screen':
        this.renderDoctorPortal();
        break;
      default:
        break;
    }
    this.updateNotificationBadge();
  }

  updateNotificationBadge() {
    const badge = document.getElementById('notifBadgeCount');
    if (badge) {
      const count = db.notifications.length;
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  // --- Screen 1: Landing Page ---
  renderLandingStats() {
    const totalDocs = db.doctors.length;
    const totalDepts = HospitalTools.get_departments().length;
    const totalAppts = db.appointments.filter(a => a.status === 'Confirmed').length;

    const statDocsEl = document.getElementById('landingStatDocs');
    const statDeptsEl = document.getElementById('landingStatDepts');
    const statApptsEl = document.getElementById('landingStatAppts');

    if (statDocsEl) statDocsEl.textContent = `${totalDocs}+`;
    if (statDeptsEl) statDeptsEl.textContent = `${totalDepts}`;
    if (statApptsEl) statApptsEl.textContent = `${totalAppts}+`;
  }

  // --- Screen 3: Symptom Summary & Non-Diagnostic Recommendation ---
  renderSymptomSummary(triage, routing) {
    this.currentTriage = triage;
    this.currentRouting = routing;

    const listEl = document.getElementById('summarySymptomsList');
    const durationEl = document.getElementById('summaryDuration');
    const severityEl = document.getElementById('summarySeverity');
    const deptEl = document.getElementById('summaryDept');
    const conditionsEl = document.getElementById('summaryConditions');
    const rationaleEl = document.getElementById('summaryRationale');

    if (listEl) {
      listEl.innerHTML = triage.symptoms.map(s => `
        <span class="badge badge-routine" style="font-size: 0.9rem; padding: 0.4rem 0.85rem;">
          • ${s}
        </span>
      `).join('');
    }

    if (durationEl) durationEl.textContent = triage.duration || "1-3 days";
    if (severityEl) severityEl.textContent = triage.severity || "Moderate";
    if (deptEl) deptEl.textContent = routing.recommendedSpecialty;
    if (rationaleEl) rationaleEl.textContent = routing.clinicalRationale;

    if (conditionsEl && routing.possibleConditions) {
      conditionsEl.innerHTML = routing.possibleConditions.map(c => `
        <li style="margin-bottom: 0.35rem; color: var(--text-secondary);">${c}</li>
      `).join('');
    }

    this.showScreen('symptom-summary-screen');
  }

  // --- Screen 4: Doctor Recommendations ---
  renderDoctorMatchingGrid() {
    const container = document.getElementById('matchedDoctorsGrid');
    if (!container) return;

    const specialty = this.currentRouting?.recommendedSpecialty || "General Medicine";
    const language = this.currentPatient?.preferred_language || "English";

    const doctors = HospitalTools.search_doctors({ specialty });

    if (doctors.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <h3>No doctors found matching this specialty currently.</h3>
          <button class="btn btn-secondary mt-2" onclick="window.mediAssist.showDoctorDirectory()">
            Browse All Hospital Doctors
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = doctors.map(doc => `
      <div class="doctor-card">
        <div class="doctor-header">
          <img src="${doc.avatar}" alt="${doc.name}" class="doctor-avatar" />
          <div class="doctor-meta">
            <h3>${doc.name}</h3>
            <div class="doctor-specialty">${doc.specialization}</div>
            <div class="doctor-qualification">${doc.qualifications}</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem;">
          <span style="font-weight: 700; color: #f59e0b;">⭐ ${doc.rating} (${doc.reviews_count || 120})</span>
          <span style="font-weight: 600; color: var(--text-secondary);">${doc.experience} Years Experience</span>
        </div>

        <div class="doctor-details-list">
          <div class="doctor-detail-item">
            <span>🗣️</span>
            <span>${doc.languages.join(', ')}</span>
          </div>
          <div class="doctor-detail-item">
            <span>🏥</span>
            <span>${doc.hospital_location}, Room ${doc.room_number}</span>
          </div>
          <div class="doctor-detail-item">
            <span>💵</span>
            <span>Consultation: <strong>$${doc.consultation_fee}</strong></span>
          </div>
        </div>

        <div style="margin-top: auto; padding-top: 0.5rem;">
          <button class="btn btn-primary w-full" onclick="window.mediAssist.selectDoctor('${doc.doctor_id}')">
            View Available Slots 📅
          </button>
        </div>
      </div>
    `).join('');
  }

  // --- Screen 5: Appointment Calendar & Slot Selection ---
  selectDoctor(doctorId) {
    this.selectedDoctor = db.getDoctor(doctorId);
    this.showScreen('appointment-calendar-screen');
    this.renderCalendarSlots();
  }

  renderCalendarSlots() {
    if (!this.selectedDoctor) return;

    const docNameEl = document.getElementById('calDocName');
    const docMetaEl = document.getElementById('calDocMeta');
    const dateDisplayEl = document.getElementById('calDateDisplay');
    const dateInputEl = document.getElementById('calDateInput');
    const slotsGridEl = document.getElementById('calSlotsGrid');

    if (docNameEl) docNameEl.textContent = this.selectedDoctor.name;
    if (docMetaEl) docMetaEl.textContent = `${this.selectedDoctor.specialization} • ${this.selectedDoctor.hospital_location}, Room ${this.selectedDoctor.room_number}`;
    
    if (dateInputEl) dateInputEl.value = this.selectedDate;
    if (dateDisplayEl) {
      const d = new Date(this.selectedDate + "T00:00:00");
      dateDisplayEl.textContent = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }

    const slots = db.getAvailableSlots(this.selectedDoctor.doctor_id, this.selectedDate);

    if (slotsGridEl) {
      slotsGridEl.innerHTML = slots.map(slot => {
        const isAvail = slot.status === 'Available';
        const isLocked = slot.status === 'Locked';
        const isBooked = slot.status === 'Booked';

        let badgeClass = isAvail ? 'btn-secondary' : isLocked ? 'btn-secondary' : 'btn-secondary';
        let cursor = isAvail ? 'pointer' : 'not-allowed';
        let opacity = isAvail ? '1' : '0.5';
        let statusTag = isAvail ? '🟢 Available' : isLocked ? '🔒 Held' : '🔴 Booked';

        return `
          <div style="
            border: 1px solid ${isAvail ? 'var(--primary)' : 'var(--border-light)'};
            background: ${isAvail ? 'var(--bg-surface)' : 'var(--bg-subtle)'};
            border-radius: var(--radius-md);
            padding: 0.85rem;
            text-align: center;
            opacity: ${opacity};
            cursor: ${cursor};
            transition: all var(--transition-fast);
          "
          ${isAvail ? `onclick="window.mediAssist.openConfirmModal('${slot.time}')"` : ''}
          class="${isAvail ? 'card-interactive' : ''}"
          >
            <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.25rem;">
              ${slot.time}
            </div>
            <div style="font-size: 0.75rem; color: ${isAvail ? 'var(--secondary)' : 'var(--text-tertiary)'}; font-weight: 600;">
              ${statusTag}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // --- Screen 6: Pre-booking Modal & Confirmed Booking Card ---
  openBookingConfirmationModal(time) {
    this.selectedSlot = time;
    const modal = document.getElementById('bookingConfirmModal');
    if (!modal) return;

    // Lock slot for 5 minutes
    const lock = db.lockSlot(this.selectedDoctor.doctor_id, this.selectedDate, time, this.currentPatient.patient_id || 'PAT-001');
    if (!lock.success) {
      alert(`Unable to hold slot: ${lock.reason}. Please choose another time.`);
      this.renderCalendarSlots();
      return;
    }

    const patientNameEl = document.getElementById('modalPatientName');
    const doctorNameEl = document.getElementById('modalDoctorName');
    const deptEl = document.getElementById('modalDept');
    const dateTimeEl = document.getElementById('modalDateTime');
    const locationEl = document.getElementById('modalLocation');
    const feeEl = document.getElementById('modalFee');

    if (patientNameEl) patientNameEl.textContent = this.currentPatient.name;
    if (doctorNameEl) doctorNameEl.textContent = this.selectedDoctor.name;
    if (deptEl) deptEl.textContent = this.selectedDoctor.department;
    if (dateTimeEl) dateTimeEl.textContent = `${this.selectedDate} at ${time}`;
    if (locationEl) locationEl.textContent = `${this.selectedDoctor.hospital_location}, Room ${this.selectedDoctor.room_number}`;
    if (feeEl) feeEl.textContent = `$${this.selectedDoctor.consultation_fee}`;

    modal.classList.add('active');
  }

  closeBookingConfirmationModal() {
    const modal = document.getElementById('bookingConfirmModal');
    if (modal) modal.classList.remove('active');
    if (this.selectedDoctor && this.selectedSlot) {
      db.unlockSlot(this.selectedDoctor.doctor_id, this.selectedDate, this.selectedSlot);
      this.renderCalendarSlots();
    }
  }

  renderConfirmedScreen(appointment) {
    this.showScreen('booking-confirmation-screen');
    triggerConfetti();

    const idEl = document.getElementById('confirmApptId');
    const nameEl = document.getElementById('confirmPatientName');
    const docEl = document.getElementById('confirmDoctorName');
    const deptEl = document.getElementById('confirmDept');
    const dateEl = document.getElementById('confirmDate');
    const timeEl = document.getElementById('confirmTime');
    const roomEl = document.getElementById('confirmRoom');
    const canvasEl = document.getElementById('confirmQrCanvas');

    if (idEl) idEl.textContent = appointment.appointment_id;
    if (nameEl) nameEl.textContent = appointment.patient_name;
    if (docEl) docEl.textContent = appointment.doctor_name;
    if (deptEl) deptEl.textContent = appointment.department;
    if (dateEl) dateEl.textContent = appointment.date;
    if (timeEl) timeEl.textContent = appointment.time;
    if (roomEl) roomEl.textContent = appointment.hospital_location;

    if (canvasEl) {
      renderQRCode(canvasEl, `${appointment.appointment_id}|${appointment.patient_name}|${appointment.date}`);
    }
  }

  // --- Screen 7: Emergency Screen ---
  renderEmergencyScreen(emergencyData) {
    this.showScreen('emergency-screen');

    const flagsListEl = document.getElementById('emergencyFlagsList');
    if (flagsListEl && emergencyData.flags) {
      flagsListEl.innerHTML = emergencyData.flags.map(f => `
        <li style="margin-bottom: 0.5rem;">
          <strong>${f.title}</strong>: ${f.action}
        </li>
      `).join('');
    }
  }

  // --- Screen 8: Patient Dashboard ---
  renderPatientDashboard() {
    const greetingEl = document.getElementById('dashboardGreeting');
    if (greetingEl) {
      greetingEl.textContent = `Welcome, ${this.currentPatient.name || 'John Doe'}`;
    }

    const patientAppts = db.appointments.filter(a => a.status !== 'Cancelled');
    const nextAppt = patientAppts[0] || null;

    const nextCardEl = document.getElementById('dashNextApptCard');
    if (nextCardEl) {
      if (nextAppt) {
        nextCardEl.style.display = 'flex';
        const doc = db.getDoctor(nextAppt.doctor_id);
        const avatarSrc = doc ? doc.avatar : "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80";

        nextCardEl.innerHTML = `
          <div class="appt-details-group">
            <img src="${avatarSrc}" alt="${nextAppt.doctor_name}" class="appt-doc-avatar" />
            <div class="appt-info-col">
              <h3>${nextAppt.doctor_name}</h3>
              <p>🏥 ${nextAppt.department} • Room ${nextAppt.room_number || '204'}</p>
              <p>📅 <strong>${nextAppt.date} at ${nextAppt.time}</strong> (${nextAppt.status})</p>
            </div>
          </div>
          <div class="appt-actions-group">
            <button class="btn btn-secondary" onclick="window.mediAssist.openRescheduleModal('${nextAppt.appointment_id}')">
              Reschedule
            </button>
            <button class="btn btn-danger" onclick="window.mediAssist.openCancelModal('${nextAppt.appointment_id}')">
              Cancel
            </button>
            <button class="btn btn-secondary" onclick="window.mediAssist.downloadCalendar('${nextAppt.appointment_id}')">
              📅 Calendar
            </button>
          </div>
        `;
      } else {
        nextCardEl.style.display = 'block';
        nextCardEl.innerHTML = `
          <div style="text-align: center; padding: 1rem;">
            <h3>No upcoming appointments scheduled.</h3>
            <p style="margin: 0.5rem 0 1rem; opacity: 0.85;">Start a symptom check or browse doctors to book a visit.</p>
            <button class="btn btn-secondary" onclick="window.mediAssist.startSymptomFlow()">
              Book Appointment Now
            </button>
          </div>
        `;
      }
    }

    // Previous / History table
    const tableBody = document.getElementById('dashHistoryTableBody');
    if (tableBody) {
      const allAppts = db.appointments;
      if (allAppts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1.5rem;">No past appointments on record.</td></tr>`;
      } else {
        tableBody.innerHTML = allAppts.map(a => `
          <tr>
            <td><strong>${a.appointment_id}</strong></td>
            <td>${a.doctor_name}</td>
            <td>${a.department}</td>
            <td>${a.date} at ${a.time}</td>
            <td>
              <span class="badge ${a.status === 'Confirmed' ? 'badge-success' : a.status === 'Cancelled' ? 'badge-emergency' : 'badge-routine'}">
                ${a.status}
              </span>
            </td>
            <td>
              ${a.status !== 'Cancelled' ? `
                <button class="btn btn-sm btn-secondary" onclick="window.mediAssist.openRescheduleModal('${a.appointment_id}')">
                  Reschedule
                </button>
              ` : `<span style="color: var(--text-tertiary); font-size: 0.8rem;">Cancelled</span>`}
            </td>
          </tr>
        `).join('');
      }
    }
  }

  // --- Screen 9: Doctor Directory ---
  renderDoctorDirectory() {
    const container = document.getElementById('directoryDoctorsGrid');
    if (!container) return;

    const specialtyFilter = document.getElementById('dirSpecialtyFilter')?.value || 'all';
    const languageFilter = document.getElementById('dirLanguageFilter')?.value || 'all';
    const searchFilter = document.getElementById('dirSearchInput')?.value.toLowerCase() || '';

    let doctors = db.getDoctors();

    if (specialtyFilter !== 'all') {
      doctors = doctors.filter(d => d.department.toLowerCase() === specialtyFilter.toLowerCase());
    }

    if (languageFilter !== 'all') {
      doctors = doctors.filter(d => d.languages.includes(languageFilter));
    }

    if (searchFilter) {
      doctors = doctors.filter(d =>
        d.name.toLowerCase().includes(searchFilter) ||
        d.specialization.toLowerCase().includes(searchFilter) ||
        d.department.toLowerCase().includes(searchFilter)
      );
    }

    container.innerHTML = doctors.map(doc => `
      <div class="doctor-card">
        <div class="doctor-header">
          <img src="${doc.avatar}" alt="${doc.name}" class="doctor-avatar" />
          <div class="doctor-meta">
            <h3>${doc.name}</h3>
            <div class="doctor-specialty">${doc.specialization}</div>
            <div class="doctor-qualification">${doc.qualifications}</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem;">
          <span style="font-weight: 700; color: #f59e0b;">⭐ ${doc.rating} (${doc.reviews_count || 120})</span>
          <span style="font-weight: 600; color: var(--text-secondary);">${doc.experience} Years</span>
        </div>

        <div class="doctor-details-list">
          <div class="doctor-detail-item">
            <span>🗣️</span>
            <span>${doc.languages.join(', ')}</span>
          </div>
          <div class="doctor-detail-item">
            <span>🏥</span>
            <span>${doc.hospital_location}, Room ${doc.room_number}</span>
          </div>
          <div class="doctor-detail-item">
            <span>💵</span>
            <span>Fee: <strong>$${doc.consultation_fee}</strong></span>
          </div>
        </div>

        <div style="margin-top: auto; padding-top: 0.5rem;">
          <button class="btn btn-primary w-full" onclick="window.mediAssist.selectDoctor('${doc.doctor_id}')">
            Select & Book Slot
          </button>
        </div>
      </div>
    `).join('');
  }

  // --- Screen 10: Hospital Departments ---
  renderDepartments() {
    const container = document.getElementById('departmentsGrid');
    if (!container) return;

    const depts = HospitalTools.get_departments();
    container.innerHTML = depts.map(dept => {
      const docCount = db.doctors.filter(d => d.department.toLowerCase().includes(dept.name.toLowerCase())).length;
      return `
        <div class="dept-card">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div class="dept-icon">🏥</div>
            <span class="badge badge-gray">${docCount} Specialists</span>
          </div>
          <h3 style="font-size: 1.15rem; color: var(--text-primary);">${dept.name}</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${dept.description}</p>
          <div style="font-size: 0.8rem; color: var(--text-tertiary); margin-top: auto; border-top: 1px solid var(--border-light); padding-top: 0.5rem;">
            <div>📍 ${dept.floor}</div>
            <div>👨⚕️ Chief: ${dept.chief}</div>
          </div>
          <button class="btn btn-secondary btn-sm mt-1" onclick="window.mediAssist.filterByDepartment('${dept.name}')">
            View Doctors
          </button>
        </div>
      `;
    }).join('');
  }

  // --- Screen 11: Admin Dashboard ---
  renderAdminDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const todayAppts = db.appointments.filter(a => a.date === today && a.status === 'Confirmed').length;
    const activeDocs = db.doctors.filter(d => d.current_status === 'Active').length;
    const totalBooked = db.appointments.filter(a => a.status === 'Confirmed').length;
    const totalCancelled = db.appointments.filter(a => a.status === 'Cancelled').length;

    const todayEl = document.getElementById('adminTodayAppts');
    const activeDocsEl = document.getElementById('adminActiveDocs');
    const bookedEl = document.getElementById('adminTotalBooked');
    const cancelEl = document.getElementById('adminCancelled');

    if (todayEl) todayEl.textContent = todayAppts;
    if (activeDocsEl) activeDocsEl.textContent = activeDocs;
    if (bookedEl) bookedEl.textContent = totalBooked;
    if (cancelEl) cancelEl.textContent = totalCancelled;

    // Doctor Roster Table
    const docTable = document.getElementById('adminDoctorRosterTable');
    if (docTable) {
      docTable.innerHTML = db.doctors.map(d => `
        <tr>
          <td><strong>${d.doctor_id}</strong></td>
          <td>${d.name}</td>
          <td>${d.department}</td>
          <td>${d.room_number}</td>
          <td>
            <span class="badge ${d.current_status === 'Active' ? 'badge-success' : 'badge-gray'}">
              ${d.current_status}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="window.mediAssist.toggleDoctorStatus('${d.doctor_id}')">
              ${d.current_status === 'Active' ? 'Set On Leave' : 'Set Active'}
            </button>
          </td>
        </tr>
      `).join('');
    }

    // Audit logs
    const auditLogsEl = document.getElementById('adminAuditLogs');
    if (auditLogsEl) {
      auditLogsEl.innerHTML = db.auditLogs.slice(0, 15).map(l => `
        <div style="font-size: 0.8rem; border-bottom: 1px solid var(--border-light); padding: 0.5rem 0;">
          <div style="display: flex; justify-content: space-between; color: var(--text-tertiary);">
            <span>[${l.agent_id}] <strong>${l.action}</strong></span>
            <span>${new Date(l.timestamp).toLocaleTimeString()}</span>
          </div>
          <div style="color: var(--text-secondary); margin-top: 0.2rem;">${l.details}</div>
        </div>
      `).join('');
    }
  }

  // --- Screen 12: Doctor Portal ---
  renderDoctorPortal() {
    const docSelect = document.getElementById('doctorPortalSelect');
    if (docSelect && docSelect.children.length === 0) {
      docSelect.innerHTML = db.doctors.map(d => `
        <option value="${d.doctor_id}">${d.name} (${d.department})</option>
      `).join('');
      docSelect.value = this.selectedPortalDoctorId;
    }

    const currentDoc = db.getDoctor(this.selectedPortalDoctorId) || db.doctors[0];
    const docNameEl = document.getElementById('docPortalName');
    const docStatusEl = document.getElementById('docPortalStatus');

    if (docNameEl) docNameEl.textContent = `${currentDoc.name} — Consultation Queue`;
    if (docStatusEl) {
      docStatusEl.textContent = currentDoc.current_status;
      docStatusEl.className = `badge ${currentDoc.current_status === 'Active' ? 'badge-success' : 'badge-gray'}`;
    }

    // Queue for selected doctor
    const docAppts = db.appointments.filter(a => a.doctor_id === currentDoc.doctor_id && a.status !== 'Cancelled');
    const queueTable = document.getElementById('docPortalQueueTable');

    if (queueTable) {
      if (docAppts.length === 0) {
        queueTable.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">No patients in queue for today.</td></tr>`;
      } else {
        queueTable.innerHTML = docAppts.map(a => `
          <tr>
            <td><strong>${a.time}</strong></td>
            <td>${a.patient_name}</td>
            <td>${a.symptoms_summary || 'Routine Consultation'}</td>
            <td><span class="badge badge-routine">${a.status}</span></td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="window.mediAssist.markPatientArrived('${a.appointment_id}')">
                Mark Arrived
              </button>
              <button class="btn btn-sm btn-secondary" onclick="window.mediAssist.openNotesModal('${a.appointment_id}')">
                Clinical Notes
              </button>
            </td>
          </tr>
        `).join('');
      }
    }
  }
}

export const views = new ViewsController();

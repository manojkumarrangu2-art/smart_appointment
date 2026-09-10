/**
 * MediAssist AI — Live 8-Agent Architecture Visualizer & Telemetry Drawer
 * Gives hackathon judges, users, and developers direct visibility into the
 * 8 specialized agents executing in real-time.
 */

import { orchestrator } from '../agents/orchestrator.js';

export class AgentInspectorUI {
  constructor() {
    this.container = null;
    this.isOpen = false;
    this.logs = [];
    this.agentStates = {
      "AGENT-1": { name: "Patient Intake Agent", status: "idle", lastAction: "Standby" },
      "AGENT-2": { name: "Symptom Triage Agent", status: "idle", lastAction: "Standby" },
      "AGENT-3": { name: "Medical Routing Agent", status: "idle", lastAction: "Standby" },
      "AGENT-4": { name: "Doctor Matching Agent", status: "idle", lastAction: "Standby" },
      "AGENT-5": { name: "Appointment Agent", status: "idle", lastAction: "Standby" },
      "AGENT-6": { name: "Notification Agent", status: "idle", lastAction: "Standby" },
      "AGENT-7": { name: "Patient Support Agent", status: "idle", lastAction: "Standby" },
      "AGENT-8": { name: "Safety & Guardrails Agent", status: "idle", lastAction: "Standby" }
    };

    this.init();
  }

  init() {
    orchestrator.onTelemetry((event) => {
      this.handleTelemetry(event);
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const drawer = document.getElementById('agentDrawer');
    if (drawer) {
      if (this.isOpen) drawer.classList.add('open');
      else drawer.classList.remove('open');
    }
  }

  handleTelemetry(event) {
    if (this.agentStates[event.agentId]) {
      this.agentStates[event.agentId].status = "running";
      this.agentStates[event.agentId].lastAction = event.action;
      setTimeout(() => {
        if (this.agentStates[event.agentId]) {
          this.agentStates[event.agentId].status = "done";
          this.render();
        }
      }, 750);
    }

    this.logs.unshift(event);
    if (this.logs.length > 50) this.logs.pop();
    this.render();
  }

  render() {
    const body = document.getElementById('agentDrawerBody');
    if (!body) return;

    let agentsHtml = `
      <div style="margin-bottom: 1rem;">
        <h4 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary); margin-bottom: 0.75rem;">
          Specialized Agents (8 Modules)
        </h4>
        <div style="display: flex; flex-direction: column; gap: 0.65rem;">
    `;

    for (const [id, agent] of Object.entries(this.agentStates)) {
      const statusClass = agent.status;
      agentsHtml += `
        <div class="agent-node-card ${statusClass === 'running' ? 'active' : ''}">
          <div class="agent-node-header">
            <span>${agent.name}</span>
            <span class="agent-status-tag ${statusClass}">${statusClass.toUpperCase()}</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">
            Last Action: <strong>${agent.lastAction}</strong>
          </div>
        </div>
      `;
    }

    agentsHtml += `
        </div>
      </div>
      <div>
        <h4 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary); margin-bottom: 0.75rem;">
          Real-Time Execution Telemetry Stream
        </h4>
        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
    `;

    for (const log of this.logs.slice(0, 15)) {
      agentsHtml += `
        <div class="agent-telemetry-text">
[${log.timestamp}] ${log.agentName}
Action: ${log.action}
${log.toolCalled ? `Tool: ${log.toolCalled} (${log.latencyMs || 12}ms)` : ''}
${log.guardrailsEnforced !== undefined ? `Safety Status: ${log.status} (Rules: ${log.guardrailsEnforced})` : ''}
        </div>
      `;
    }

    agentsHtml += `
        </div>
      </div>
    `;

    body.innerHTML = agentsHtml;
  }
}

export const agentInspector = new AgentInspectorUI();

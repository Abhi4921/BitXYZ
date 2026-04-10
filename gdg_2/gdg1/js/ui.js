/* ════════════════════════════════════════
   CleanMap — UI Controller (Mobile)
   ════════════════════════════════════════ */

const UI = (() => {

  // ── Toast system ──
  function toast(title, message, type = 'info') {
    const icons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>`;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('fade-out');
      setTimeout(() => el.remove(), 300);
    }, 3500);
  }

  // ── Dashboard Update ──
  function updateDashboard() {
    const stats = CLEANMAP.getStats();

    animateNumber('dash-total', stats.total);
    animateNumber('dash-progress', stats.progress);
    animateNumber('dash-cleaned', stats.resolved);

    // Live count in header
    const liveCount = stats.total - stats.resolved;
    const liveEl = document.getElementById('live-count');
    if (liveEl) liveEl.textContent = liveCount;

    // Severity bars
    const maxCount = Math.max(stats.low, stats.med, stats.high, 1);
    setBar('sev-bar-low', stats.low, maxCount);
    setBar('sev-bar-med', stats.med, maxCount);
    setBar('sev-bar-high', stats.high, maxCount);

    document.getElementById('sev-count-low').textContent = stats.low;
    document.getElementById('sev-count-med').textContent = stats.med;
    document.getElementById('sev-count-high').textContent = stats.high;
  }

  function setBar(id, count, max) {
    const el = document.getElementById(id);
    if (el) el.style.width = `${(count / max) * 100}%`;
  }

  function animateNumber(elId, target) {
    const el = document.getElementById(elId);
    if (!el) return;
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;

    const diff = target - current;
    const steps = 12;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const val = Math.round(current + (diff * step / steps));
      el.textContent = val;
      if (step >= steps) {
        el.textContent = target;
        clearInterval(interval);
      }
    }, 25);
  }

  // ── Activity Feed ──
  function renderActivityFeed() {
    const container = document.getElementById('activity-list');
    if (!container) return;
    const items = CLEANMAP.state.activityFeed.slice(0, 15);
    container.innerHTML = items.map(item => `
      <div class="activity-item">
        <span class="activity-icon">${item.icon}</span>
        <div class="activity-content">
          <p class="activity-text">${item.text}</p>
          <p class="activity-time">${CLEANMAP.timeAgo(item.time)}</p>
        </div>
      </div>
    `).join('');
  }

  // ── Reports List ──
  function renderReportsList() {
    const container = document.getElementById('report-cards');
    if (!container) return;
    const reports = CLEANMAP.getFilteredReports();

    if (reports.length === 0) {
      container.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:2rem;font-size:0.85rem;">
        No reports match this filter.
      </div>`;
      return;
    }

    container.innerHTML = reports.map(r => {
      const sev = CLEANMAP.SEVERITY[r.severity];
      const stat = CLEANMAP.STATUSES[r.status];
      return `
        <div class="report-card sev-${r.severity}" data-id="${r.id}" onclick="App.openDetail(${r.id})">
          <div class="report-card-top">
            <span class="report-card-sev sev-${sev?.cssClass}-badge">${sev?.label}</span>
            <span class="report-card-status status-${r.status}">
              <span class="status-dot-sm"></span>
              ${stat?.label}
            </span>
          </div>
          <p class="report-card-desc">${r.description}</p>
          <div class="report-card-footer">
            <span class="report-card-reporter">👤 ${r.reporter}</span>
            <span class="report-card-time">${CLEANMAP.timeAgo(r.timestamp)}</span>
          </div>
        </div>`;
    }).join('');
  }

  // ── Spot Detail Modal ──
  function openDetail(report) {
    const sev = CLEANMAP.SEVERITY[report.severity];
    const stat = CLEANMAP.STATUSES[report.status];

    document.getElementById('detail-title').textContent = `${sev?.label} Severity Spot`;

    const body = document.getElementById('detail-body');
    body.innerHTML = `
      ${report.photoUrl ? `<img class="detail-photo" src="${report.photoUrl}" alt="Spot photo" />` : ''}
      <div class="detail-grid">
        <div class="detail-field">
          <span class="detail-field-label">Severity</span>
          <span class="detail-field-value">
            <span class="detail-status-badge sev-${sev?.cssClass}-badge">${sev?.label}</span>
          </span>
        </div>
        <div class="detail-field">
          <span class="detail-field-label">Status</span>
          <span class="detail-field-value">
            <span class="detail-status-badge ${stat?.badgeClass}">${stat?.icon} ${stat?.label}</span>
          </span>
        </div>
        <div class="detail-field">
          <span class="detail-field-label">Reported</span>
          <span class="detail-field-value">${CLEANMAP.timeAgo(report.timestamp)}</span>
        </div>
        <div class="detail-field">
          <span class="detail-field-label">Reporter</span>
          <span class="detail-field-value">👤 ${report.reporter}</span>
        </div>
        ${report.claimedBy ? `
        <div class="detail-field">
          <span class="detail-field-label">Claimed By</span>
          <span class="detail-field-value">🧹 ${report.claimedBy}</span>
        </div>` : ''}
      </div>
      <p class="detail-desc">${report.description}</p>
      <div class="detail-field" style="margin-bottom:0.5rem;">
        <span class="detail-field-label">Timeline</span>
        <div class="detail-timeline" style="margin-top:0.35rem;">
          ${report.timeline.map(t => `
            <div class="timeline-item">
              <span class="timeline-dot"></span>
              <div class="timeline-content">
                <div class="timeline-action">${t.action}</div>
                <div class="timeline-time">${CLEANMAP.timeAgo(t.time)} · by ${t.actor}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>`;

    // Footer actions
    const footer = document.getElementById('detail-footer');
    if (report.status === 'pending') {
      footer.innerHTML = `<button class="btn-claim" id="btn-detail-claim">🧹 Claim for Cleanup</button>`;
      document.getElementById('btn-detail-claim').addEventListener('click', async () => {
        const btn = document.getElementById('btn-detail-claim');
        if (btn) { btn.disabled = true; btn.textContent = 'Claiming…'; }
        await App.claimSpot(report.id);
        closeModal('modal-detail');
      });
    } else if (report.status === 'progress') {
      footer.innerHTML = `<button class="btn-resolve" id="btn-detail-resolve">✅ Mark as Cleaned</button>`;
      document.getElementById('btn-detail-resolve').addEventListener('click', async () => {
        const btn = document.getElementById('btn-detail-resolve');
        if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
        await App.resolveSpot(report.id);
        closeModal('modal-detail');
      });
    } else {
      footer.innerHTML = `<div style="text-align:center;color:var(--accent-green);font-weight:700;font-size:0.85rem;padding:0.5rem;">
        ✅ This spot has been cleaned!
      </div>`;
    }

    document.getElementById('modal-detail').classList.remove('hidden');
  }

  // ── Report Modal Helpers ──
  function openReportModal() {
    resetReportForm();
    // Pre-fill saved name
    const nameInput = document.getElementById('reporter-name');
    if (nameInput && window._reporterName && window._reporterName !== 'Anonymous') {
      nameInput.value = window._reporterName;
    }
    document.getElementById('modal-report').classList.remove('hidden');
  }

  function resetReportForm() {
    document.getElementById('report-location').value = '';
    document.getElementById('coords-display').classList.add('hidden');
    document.getElementById('report-desc').value = '';

    // Reset photo
    document.getElementById('photo-preview').classList.add('hidden');
    document.getElementById('upload-zone').classList.remove('hidden');
    document.getElementById('photo-input').value = '';

    // Reset severity to Medium
    document.querySelectorAll('.sev-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('sev-medium').classList.add('active');

    window._reportLat = null;
    window._reportLng = null;
    window._reportSeverity = 2;
  }

  function closeModal(id) {
    document.getElementById(id)?.classList.add('hidden');
  }

  // ── Screen Navigation ──
  function switchScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const screen = document.getElementById(`screen-${name}`);
    const nav = document.querySelector(`[data-screen="${name}"]`);

    if (screen) screen.classList.add('active');
    if (nav) nav.classList.add('active');

    // Invalidate map size when switching to map
    if (name === 'map') MapEngine.invalidateSize();

    // Refresh data when switching screens
    if (name === 'dashboard') {
      updateDashboard();
      renderActivityFeed();
    }
    if (name === 'reports') {
      renderReportsList();
    }
  }

  return {
    toast,
    updateDashboard,
    renderActivityFeed,
    renderReportsList,
    openDetail,
    openReportModal,
    resetReportForm,
    closeModal,
    switchScreen,
  };
})();

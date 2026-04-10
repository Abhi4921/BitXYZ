/* ════════════════════════════════════════
   CleanMap — App Orchestrator (Firebase)
   With: Proof upload, Leaderboard, i18n
   ════════════════════════════════════════ */

const App = (() => {
  'use strict';

  let initialized = false;
  let _proofReportId = null;  // ID of the report being proven

  // ═══ Boot after splash ═══
  async function boot() {
    if (initialized) return;
    initialized = true;

    // 0. Apply i18n translations
    UI.applyTranslations();

    // 1. Init Firebase
    const firebaseOk = FirebaseDB.init();

    // 2. Init Leaflet map immediately (no waiting)
    MapEngine.init(CLEANMAP.CENTER());

    // 3. Show loading state
    showLoadingState();

    // 4. Seed Firebase with dummy data (only if empty on first ever run)
    if (firebaseOk) {
      await CLEANMAP.seedIfEmpty();
    } else {
      // Offline mode: seed local state directly
      seedLocalFallback();
    }

    // 5. Start real-time sync listener
    CLEANMAP.startRealtimeSync();

    // 6. Bind the single "realtimeUpdate" event → re-render everything
    CLEANMAP.on('realtimeUpdate', reports => {
      MapEngine.renderReports(reports);
      MapEngine.fitToMarkers(reports);
      UI.updateDashboard();
      UI.renderActivityFeed();
      UI.renderReportsList();
      UI.renderLeaderboard();
      hideLoadingState();
    });

    // 7. Bind other events
    CLEANMAP.on('filterChanged', () => UI.renderReportsList());
    CLEANMAP.on('activityAdded', () => UI.renderActivityFeed());

    // 8. Bind UI interactions
    bindEvents();

    // 9. Get user location (non-blocking background)
    locateUser(coords => {
      if (coords) MapEngine.showUserLocation(coords.lat, coords.lng);
    });

    // 10. Welcome toast
    setTimeout(() => {
      const mode = FirebaseDB.isConnected()
        ? i18n.t('toast.syncActive')
        : i18n.t('toast.offline');
      UI.toast(i18n.t('toast.welcome'), mode, FirebaseDB.isConnected() ? 'success' : 'warning');
    }, 1000);
  }

  // ── Loading state ──
  function showLoadingState() {
    const map = document.getElementById('map');
    if (map) {
      map.insertAdjacentHTML('afterbegin', `
        <div id="map-loading" style="
          position:absolute;inset:0;z-index:1000;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          background:rgba(10,15,30,0.85);backdrop-filter:blur(8px);gap:0.75rem;
        ">
          <div style="
            width:40px;height:40px;border:3px solid rgba(0,245,160,0.2);
            border-top-color:#00f5a0;border-radius:50%;animation:spin 0.8s linear infinite;
          "></div>
          <p style="color:#94a3b8;font-size:0.82rem;font-weight:600;">Connecting to Firebase…</p>
        </div>
        <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
      `);
    }
  }

  function hideLoadingState() {
    document.getElementById('map-loading')?.remove();
  }

  // ── Offline fallback ──
  function seedLocalFallback() {
    const dummyReports = [
      { id: 1001, severity: 3, status: 'pending', description: 'Large construction debris dumped near park entrance.', lat: 12.9716, lng: 77.5946, reporter: 'Priya Patel', timestamp: Date.now() - 5400000, timeline: [{ action: 'Reported', time: Date.now() - 5400000, actor: 'Priya Patel' }], photoUrl: null, afterPhotoUrl: null, claimedBy: null },
      { id: 1002, severity: 2, status: 'pending', description: 'Overflowing bin near MG Road metro.', lat: 12.9757, lng: 77.6071, reporter: 'Arjun Sharma', timestamp: Date.now() - 4500000, timeline: [{ action: 'Reported', time: Date.now() - 4500000, actor: 'Arjun Sharma' }], photoUrl: null, afterPhotoUrl: null, claimedBy: null },
      { id: 1003, severity: 1, status: 'pending', description: 'Scattered plastic bottles along Ulsoor Lake.', lat: 12.9820, lng: 77.6188, reporter: 'Kavitha Nair', timestamp: Date.now() - 3600000, timeline: [{ action: 'Reported', time: Date.now() - 3600000, actor: 'Kavitha Nair' }], photoUrl: null, afterPhotoUrl: null, claimedBy: null },
      { id: 1004, severity: 3, status: 'progress', description: 'Chemical containers behind industrial complex.', lat: 12.9611, lng: 77.5800, reporter: 'Rajesh Gupta', timestamp: Date.now() - 7200000, claimedBy: 'Suresh Mehta', timeline: [{ action: 'Reported', time: Date.now() - 7200000, actor: 'Rajesh Gupta' }, { action: 'Claimed', time: Date.now() - 3600000, actor: 'Suresh Mehta' }], photoUrl: null, afterPhotoUrl: null },
      { id: 1005, severity: 2, status: 'pending', description: 'Broken glass near Jayanagar market.', lat: 12.9308, lng: 77.5838, reporter: 'Meena Iyer', timestamp: Date.now() - 2700000, timeline: [{ action: 'Reported', time: Date.now() - 2700000, actor: 'Meena Iyer' }], photoUrl: null, afterPhotoUrl: null, claimedBy: null },
      { id: 1006, severity: 1, status: 'resolved', description: 'Plastic bags around Community Park. Cleaned up.', lat: 12.9856, lng: 77.5963, reporter: 'Vikram Singh', timestamp: Date.now() - 86400000, claimedBy: 'Anita Desai', timeline: [{ action: 'Reported', time: Date.now() - 86400000, actor: 'Vikram Singh' }, { action: 'Cleaned! 🎉', time: Date.now() - 43200000, actor: 'Anita Desai' }], photoUrl: null, afterPhotoUrl: null },
      { id: 1007, severity: 3, status: 'pending', description: 'Sewage overflow near residential area.', lat: 12.9550, lng: 77.6010, reporter: 'Sunita Rao', timestamp: Date.now() - 1800000, timeline: [{ action: 'Reported', time: Date.now() - 1800000, actor: 'Sunita Rao' }], photoUrl: null, afterPhotoUrl: null, claimedBy: null },
    ];
    CLEANMAP.state.reports = dummyReports;
    CLEANMAP.addActivity('Running in offline mode — Firebase not configured.', '⚠️');
    CLEANMAP.addActivity('7 waste spots loaded from local data.', '📍');

    setTimeout(() => {
      MapEngine.renderReports(CLEANMAP.state.reports);
      MapEngine.fitToMarkers(CLEANMAP.state.reports);
      UI.updateDashboard();
      UI.renderActivityFeed();
      UI.renderReportsList();
      UI.renderLeaderboard();
      hideLoadingState();
    }, 200);
  }

  // ═══ Geolocation ═══
  function locateUser(done) {
    if (!navigator.geolocation) { done(null); return; }
    navigator.geolocation.getCurrentPosition(
      pos => done({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => done(null),
      { timeout: 5000, maximumAge: 60000 }
    );
  }

  // ═══ UI Event Bindings ═══
  function bindEvents() {

    // ── Bottom Navigation ──
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => UI.switchScreen(btn.dataset.screen));
    });

    // ── FAB: Report a Spot ──
    document.getElementById('fab-report')?.addEventListener('click', () => {
      UI.openReportModal();
    });

    // ── GPS button ──
    document.getElementById('btn-gps')?.addEventListener('click', () => {
      if (!navigator.geolocation) {
        UI.toast('GPS Unavailable', 'Geolocation not supported.', 'error');
        return;
      }
      const btn = document.getElementById('btn-gps');
      if (btn) btn.style.animation = 'spin 0.8s linear infinite';

      navigator.geolocation.getCurrentPosition(
        pos => {
          if (btn) btn.style.animation = '';
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setReportLocation(lat, lng);
          MapEngine.showUserLocation(lat, lng);
          UI.toast('Location Set! 📍', `GPS captured: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'success');
        },
        () => {
          if (btn) btn.style.animation = '';
          const c = CLEANMAP.CENTER();
          setReportLocation(c.lat, c.lng);
          UI.toast('Using Map Center', 'GPS unavailable — using default location.', 'warning');
        },
        { timeout: 6000 }
      );
    });

    // ── Severity buttons ──
    document.querySelectorAll('.sev-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sev-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        window._reportSeverity = parseInt(btn.dataset.severity);
      });
    });

    // ── Photo upload (report form) ──
    document.getElementById('upload-zone')?.addEventListener('click', () => {
      document.getElementById('photo-input')?.click();
    });

    document.getElementById('photo-input')?.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      document.getElementById('preview-img').src = url;
      document.getElementById('photo-preview').classList.remove('hidden');
      document.getElementById('upload-zone').classList.add('hidden');
    });

    document.getElementById('remove-photo')?.addEventListener('click', () => {
      document.getElementById('photo-preview').classList.add('hidden');
      document.getElementById('upload-zone').classList.remove('hidden');
      document.getElementById('photo-input').value = '';
    });

    // ── Submit Report ──
    document.getElementById('btn-submit-report')?.addEventListener('click', async () => {
      if (!window._reportLat || !window._reportLng) {
        UI.toast('Location Required', 'Tap the GPS button to set your location.', 'warning');
        return;
      }

      const btn = document.getElementById('btn-submit-report');
      if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

      const desc = document.getElementById('report-desc')?.value?.trim();
      const nameInput = document.getElementById('reporter-name')?.value?.trim();
      const reporterName = nameInput || window._reporterName || 'Anonymous';

      // Save name for next time
      if (nameInput) {
        window._reporterName = nameInput;
        localStorage.setItem('cleanmap_username', nameInput);
      }

      // ── Compress photo → base64 ──
      const photoInput = document.getElementById('photo-input');
      const photoFile  = photoInput?.files?.[0] || null;
      let photoUrl = null;

      if (photoFile) {
        if (btn) { btn.disabled = true; btn.textContent = 'Compressing photo…'; }
        photoUrl = await FirebaseDB.compressToBase64(photoFile);
        if (!photoUrl) {
          UI.toast('Photo Error', 'Could not process photo. Submitting without it.', 'warning');
        }
      }

      if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

      await CLEANMAP.createReport({
        severity:    window._reportSeverity || 2,
        description: desc || 'Waste spotted at this location.',
        lat:         window._reportLat,
        lng:         window._reportLng,
        reporter:    reporterName,
        photoUrl,
      });

      UI.closeModal('modal-report');
      UI.toast(i18n.t('toast.reportSuccess'), 'Visible on all connected devices instantly.', 'success');
      UI.switchScreen('map');

      if (btn) { btn.disabled = false; btn.textContent = i18n.t('form.submit'); }
    });

    // ── Close modals ──
    document.getElementById('close-report')?.addEventListener('click', () => UI.closeModal('modal-report'));
    document.getElementById('close-detail')?.addEventListener('click', () => UI.closeModal('modal-detail'));
    document.getElementById('close-proof')?.addEventListener('click', () => UI.closeModal('modal-proof'));

    document.getElementById('modal-report')?.addEventListener('click', e => {
      if (e.target === document.getElementById('modal-report')) UI.closeModal('modal-report');
    });
    document.getElementById('modal-detail')?.addEventListener('click', e => {
      if (e.target === document.getElementById('modal-detail')) UI.closeModal('modal-detail');
    });
    document.getElementById('modal-proof')?.addEventListener('click', e => {
      if (e.target === document.getElementById('modal-proof')) UI.closeModal('modal-proof');
    });

    // ── Filter chips ──
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        CLEANMAP.setFilter('status', chip.dataset.filter);
        UI.renderReportsList();
      });
    });

    // ── Escape key ──
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        UI.closeModal('modal-report');
        UI.closeModal('modal-detail');
        UI.closeModal('modal-proof');
      }
    });

    // ═══ PROOF MODAL EVENTS ═══

    // Upload after photo
    document.getElementById('proof-upload-zone')?.addEventListener('click', () => {
      document.getElementById('proof-after-input')?.click();
    });

    document.getElementById('proof-after-input')?.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      document.getElementById('proof-after-img').src = url;
      document.getElementById('proof-after-preview').classList.remove('hidden');
      document.getElementById('proof-upload-zone').classList.add('hidden');
      document.getElementById('btn-submit-proof').disabled = false;
    });

    document.getElementById('proof-remove-after')?.addEventListener('click', () => {
      document.getElementById('proof-after-preview').classList.add('hidden');
      document.getElementById('proof-upload-zone').classList.remove('hidden');
      document.getElementById('proof-after-input').value = '';
      document.getElementById('btn-submit-proof').disabled = true;
    });

    // Submit proof
    document.getElementById('btn-submit-proof')?.addEventListener('click', async () => {
      if (!_proofReportId) return;

      const btn = document.getElementById('btn-submit-proof');
      if (btn) { btn.disabled = true; btn.textContent = 'Uploading…'; }

      const proofInput = document.getElementById('proof-after-input');
      const proofFile = proofInput?.files?.[0] || null;

      if (!proofFile) {
        UI.toast('Photo Required', 'Please upload an after-cleanup photo.', 'warning');
        if (btn) { btn.disabled = false; btn.textContent = i18n.t('form.submitProof'); }
        return;
      }

      const afterPhotoUrl = await FirebaseDB.compressToBase64(proofFile);
      if (!afterPhotoUrl) {
        UI.toast('Photo Error', 'Could not process photo. Try again.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = i18n.t('form.submitProof'); }
        return;
      }

      const success = await CLEANMAP.submitProof(_proofReportId, afterPhotoUrl);
      if (success) {
        UI.toast(i18n.t('toast.proofSuccess'), 'Before/after proof submitted for verification.', 'success');
      } else {
        UI.toast('Cannot Submit', 'Status must be "In Progress" to submit proof.', 'warning');
      }

      UI.closeModal('modal-proof');
      resetProofModal();

      if (btn) { btn.disabled = false; btn.textContent = i18n.t('form.submitProof'); }
    });

    // ═══ LANGUAGE SWITCHER ═══
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (i18n.setLanguage(lang)) {
          UI.applyTranslations();
          UI.renderReportsList();
          UI.renderLeaderboard();
          UI.renderActivityFeed();
          UI.updateDashboard();
          UI.toast('🌐 Language Changed', `Interface switched to ${btn.querySelector('.lang-name')?.textContent || lang}`, 'success');
        }
      });
    });
  }

  // ── Set report location ──
  function setReportLocation(lat, lng) {
    window._reportLat = lat;
    window._reportLng = lng;
    const locInput = document.getElementById('report-location');
    const coordsEl = document.getElementById('coords-display');
    if (locInput) locInput.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    if (coordsEl) {
      coordsEl.textContent = `📍 Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
      coordsEl.classList.remove('hidden');
    }
  }

  // ═══ Proof Modal ═══
  function openProofModal(reportId) {
    _proofReportId = reportId;
    resetProofModal();

    // Show before photo from original report
    const report = CLEANMAP.state.reports.find(r => r.id === reportId);
    const beforeImg = document.getElementById('proof-before-img');
    const beforePreview = document.getElementById('proof-before-preview');

    if (report?.photoUrl && beforeImg) {
      beforeImg.src = report.photoUrl;
      if (beforePreview) beforePreview.style.display = '';
    } else {
      if (beforePreview) beforePreview.style.display = 'none';
    }

    document.getElementById('modal-proof').classList.remove('hidden');
  }

  function resetProofModal() {
    document.getElementById('proof-after-preview')?.classList.add('hidden');
    document.getElementById('proof-upload-zone')?.classList.remove('hidden');
    const input = document.getElementById('proof-after-input');
    if (input) input.value = '';
    const btn = document.getElementById('btn-submit-proof');
    if (btn) { btn.disabled = true; btn.textContent = i18n.t('form.submitProof'); }
  }

  // ═══ Public actions (called from map popups) ═══

  async function claimSpot(id) {
    const btn = document.querySelector(`[onclick="App.claimSpot(${id})"]`);
    if (btn) { btn.disabled = true; btn.textContent = 'Claiming…'; }

    const success = await CLEANMAP.claimReport(id);
    if (success) {
      UI.toast(i18n.t('toast.claimSuccess'), 'Status updated live on all devices.', 'success');
    } else {
      UI.toast('Already Claimed', 'This spot is already in progress or cleaned.', 'warning');
    }
  }

  async function resolveSpot(id) {
    const success = await CLEANMAP.resolveReport(id);
    if (success) {
      UI.toast(i18n.t('toast.resolveSuccess'), 'Marked as resolved on all devices.', 'success');
    } else {
      UI.toast('Cannot Resolve', 'Proof must be submitted first (status: Proof Pending).', 'warning');
    }
  }

  function openDetail(id) {
    const report = CLEANMAP.state.reports.find(r => r.id === id);
    if (report) {
      UI.openDetail(report);
      MapEngine.panTo(report.lat, report.lng, 15);
    }
  }

  // ═══ Splash Init ═══
  document.addEventListener('DOMContentLoaded', () => {
    // Apply initial language from localStorage
    const savedLang = localStorage.getItem('cleanmap-lang');
    if (savedLang) i18n.setLanguage(savedLang);
    UI.applyTranslations();

    // Username
    const savedName = localStorage.getItem('cleanmap_username');
    if (savedName) {
      window._reporterName = savedName;
    } else {
      window._reporterName = `User_${Math.floor(Math.random() * 9000) + 1000}`;
      localStorage.setItem('cleanmap_username', window._reporterName);
    }

    const enterBtn = document.getElementById('btn-enter');
    enterBtn?.addEventListener('click', () => {
      const splash = document.getElementById('splash-screen');
      splash.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      splash.style.opacity = '0';
      splash.style.transform = 'scale(0.97)';
      splash.style.pointerEvents = 'none';

      setTimeout(() => {
        splash.classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        boot();
      }, 400);
    });
  });

  return {
    claimSpot,
    resolveSpot,
    openDetail,
    openProofModal,
  };
})();

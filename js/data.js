/* ════════════════════════════════════════
   CleanMap — Data Store (Firebase-backed)
   With: Proof validation, Leaderboard scoring,
         Strict status flow, i18n support
   ════════════════════════════════════════ */

const CLEANMAP = (() => {

  // ── Severity Levels (3 levels: Low / Medium / High) ──
  const SEVERITY = {
    1: { label: 'Low',    color: '#22c55e', cssClass: 'low',    markerClass: 'marker-low',    points: 10 },
    2: { label: 'Medium', color: '#f97316', cssClass: 'medium', markerClass: 'marker-medium', points: 25 },
    3: { label: 'High',   color: '#ef4444', cssClass: 'high',   markerClass: 'marker-high',   points: 50 },
  };

  // ── Strict Status Flow: pending → progress → proof_pending → resolved ──
  const STATUSES = {
    pending:       { label: 'Pending',       icon: '🟡', badgeClass: 'badge-pending' },
    progress:      { label: 'In Progress',   icon: '🔵', badgeClass: 'badge-progress' },
    proof_pending: { label: 'Proof Pending', icon: '📸', badgeClass: 'badge-proof-pending' },
    resolved:      { label: 'Cleaned',       icon: '✅', badgeClass: 'badge-resolved' },
  };

  // Valid transitions (strict flow)
  const VALID_TRANSITIONS = {
    pending:       ['progress'],
    progress:      ['proof_pending'],
    proof_pending: ['resolved'],
    resolved:      [],
  };

  // ── Base center — Bangalore, India ──
  let CENTER = { lat: 12.9716, lng: 77.5946 };

  // ── State ──
  const state = {
    reports: [],       // Mirror of Firebase data
    activityFeed: [],
    idCounter: 2000,   // Start above seed IDs (1001–1007)
    filters: { status: 'all' },
    listeners: {},
  };

  // ── Event system ──
  function on(event, fn) {
    if (!state.listeners[event]) state.listeners[event] = [];
    state.listeners[event].push(fn);
  }

  function emit(event, data) {
    (state.listeners[event] || []).forEach(fn => fn(data));
  }

  // ── Helpers ──
  function nextId()  { return ++state.idCounter; }

  function timeAgo(date) {
    const seconds = Math.floor((Date.now() - date) / 1000);
    if (seconds < 60)    return `${seconds}s ago`;
    if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  function setCenter(lat, lng) {
    CENTER = { lat, lng };
  }

  // ═══════════════════════════════════════════
  //  LEADERBOARD SCORING
  //  Low = 10pts, Medium = 25pts, High = 50pts
  //  Reporters get points for reporting
  //  Volunteers get points for cleaning
  // ═══════════════════════════════════════════

  function getLeaderboard() {
    const scores = {};

    state.reports.forEach(report => {
      const pts = SEVERITY[report.severity]?.points || 10;

      // Reporter gets points for reporting
      const reporter = report.reporter || 'Anonymous';
      if (!scores[reporter]) scores[reporter] = { name: reporter, score: 0, reports: 0, cleanups: 0 };
      scores[reporter].score += pts;
      scores[reporter].reports++;

      // Volunteer gets points for cleaning (only if resolved or proof submitted)
      if (report.claimedBy && (report.status === 'proof_pending' || report.status === 'resolved')) {
        const volunteer = report.claimedBy;
        if (!scores[volunteer]) scores[volunteer] = { name: volunteer, score: 0, reports: 0, cleanups: 0 };
        scores[volunteer].score += pts;
        scores[volunteer].cleanups++;
      }
    });

    return Object.values(scores)
      .sort((a, b) => b.score - a.score);
  }

  // ═══════════════════════════════════════════
  //  FIREBASE-BACKED MUTATIONS
  //  Each write goes to Firebase → listener fires
  //  on ALL connected devices simultaneously
  // ═══════════════════════════════════════════

  async function createReport({ severity, description, lat, lng, photoUrl, reporter }) {
    const report = {
      id:          nextId(),
      severity:    severity || 2,
      description: description || 'Waste spotted at this location.',
      lat:         lat,
      lng:         lng,
      status:      'pending',
      timestamp:   Date.now(),
      reporter:    reporter || 'Anonymous',
      photoUrl:    photoUrl || null,      // "Before" photo
      afterPhotoUrl: null,                 // "After" photo (set during proof)
      claimedBy:   null,
      timeline: [
        { action: i18n.t('timeline.reported'), time: Date.now(), actor: reporter || 'Anonymous' }
      ],
    };

    // Write to Firebase → triggers real-time update on all devices
    await FirebaseDB.pushReport(report);

    addActivity(i18n.t('activity.spotReported', { severity: SEVERITY[report.severity]?.label }), '📍');
    return report;
  }

  // STRICT FLOW: pending → progress (claim)
  async function claimReport(id) {
    const r = state.reports.find(r => r.id === id);
    if (!r) return false;

    // Strict: only pending → progress
    if (!VALID_TRANSITIONS[r.status]?.includes('progress')) return false;

    const actor = window._reporterName || 'Volunteer';
    const newTimeline = [
      ...r.timeline,
      { action: i18n.t('timeline.claimed'), time: Date.now(), actor }
    ];

    await FirebaseDB.updateReport(id, {
      status:    'progress',
      claimedBy: actor,
      timeline:  newTimeline,
    });

    addActivity(i18n.t('activity.spotClaimed', { id }), '🧹');
    return true;
  }

  // STRICT FLOW: progress → proof_pending (submit before/after proof)
  async function submitProof(id, afterPhotoUrl) {
    const r = state.reports.find(r => r.id === id);
    if (!r) return false;

    // Strict: only progress → proof_pending
    if (!VALID_TRANSITIONS[r.status]?.includes('proof_pending')) return false;

    // Require after photo
    if (!afterPhotoUrl) return false;

    const actor = r.claimedBy || window._reporterName || 'Volunteer';
    const newTimeline = [
      ...r.timeline,
      { action: i18n.t('timeline.proofSubmitted'), time: Date.now(), actor }
    ];

    await FirebaseDB.updateReport(id, {
      status:        'proof_pending',
      afterPhotoUrl: afterPhotoUrl,
      timeline:      newTimeline,
    });

    addActivity(i18n.t('activity.proofSubmitted', { id }), '📸');
    return true;
  }

  // STRICT FLOW: proof_pending → resolved (verify & close)
  async function resolveReport(id) {
    const r = state.reports.find(r => r.id === id);
    if (!r) return false;

    // Strict: only proof_pending → resolved
    if (!VALID_TRANSITIONS[r.status]?.includes('resolved')) return false;

    const actor = r.claimedBy || 'Volunteer';
    const newTimeline = [
      ...r.timeline,
      { action: i18n.t('timeline.resolved'), time: Date.now(), actor }
    ];

    await FirebaseDB.updateReport(id, {
      status:   'resolved',
      timeline: newTimeline,
    });

    addActivity(i18n.t('activity.spotCleaned', { id }), '✅');
    return true;
  }

  // ═══════════════════════════════════════════
  //  REAL-TIME LISTENER (called once on boot)
  // ═══════════════════════════════════════════

  function startRealtimeSync() {
    FirebaseDB.listenToReports(reports => {
      // Replace local state with fresh Firebase data
      state.reports = reports;

      // Update the header live count
      const liveEl = document.getElementById('live-count');
      const active = reports.filter(r => r.status !== 'resolved').length;
      if (liveEl) liveEl.textContent = active;

      // Fire all registered listeners so UI components re-render
      emit('realtimeUpdate', reports);
    });
  }

  // ── Seed dummy data (only if Firebase is empty) ──
  async function seedIfEmpty() {
    const empty = await FirebaseDB.isEmpty();
    if (!empty) {
      console.log('[CleanMap] Firebase has data — skipping seed.');
      return;
    }

    console.log('[CleanMap] Seeding initial reports to Firebase…');

    const dummyReports = [
      {
        id: 1001, severity: 3, status: 'pending',
        description: 'Large pile of construction debris and plastic waste dumped near the park entrance. Blocking the footpath.',
        lat: 12.9716, lng: 77.5946,
        reporter: 'Priya Patel',
        timestamp: Date.now() - 5400000,
        timeline: [{ action: 'Reported', time: Date.now() - 5400000, actor: 'Priya Patel' }],
        photoUrl: null, afterPhotoUrl: null, claimedBy: null,
      },
      {
        id: 1002, severity: 2, status: 'pending',
        description: 'Overflowing garbage bin near MG Road metro. Waste scattered by stray animals. Needs immediate attention.',
        lat: 12.9757, lng: 77.6071,
        reporter: 'Arjun Sharma',
        timestamp: Date.now() - 4500000,
        timeline: [{ action: 'Reported', time: Date.now() - 4500000, actor: 'Arjun Sharma' }],
        photoUrl: null, afterPhotoUrl: null, claimedBy: null,
      },
      {
        id: 1003, severity: 1, status: 'pending',
        description: 'Scattered plastic bottles and food wrappers along Ulsoor Lake walkway. Moderate littering issue.',
        lat: 12.9820, lng: 77.6188,
        reporter: 'Kavitha Nair',
        timestamp: Date.now() - 3600000,
        timeline: [{ action: 'Reported', time: Date.now() - 3600000, actor: 'Kavitha Nair' }],
        photoUrl: null, afterPhotoUrl: null, claimedBy: null,
      },
      {
        id: 1004, severity: 3, status: 'progress',
        description: 'Chemical containers illegally dumped behind the industrial complex. Strong foul smell, possible hazardous leakage.',
        lat: 12.9611, lng: 77.5800,
        reporter: 'Rajesh Gupta',
        timestamp: Date.now() - 7200000,
        claimedBy: 'Suresh Mehta',
        timeline: [
          { action: 'Reported', time: Date.now() - 7200000, actor: 'Rajesh Gupta' },
          { action: 'Claimed for cleanup', time: Date.now() - 3600000, actor: 'Suresh Mehta' },
        ],
        photoUrl: null, afterPhotoUrl: null,
      },
      {
        id: 1005, severity: 2, status: 'pending',
        description: 'Multiple broken glass bottles and metal scrap spread across the lane near Jayanagar market.',
        lat: 12.9308, lng: 77.5838,
        reporter: 'Meena Iyer',
        timestamp: Date.now() - 2700000,
        timeline: [{ action: 'Reported', time: Date.now() - 2700000, actor: 'Meena Iyer' }],
        photoUrl: null, afterPhotoUrl: null, claimedBy: null,
      },
      {
        id: 1006, severity: 1, status: 'resolved',
        description: 'Plastic bags scattered around Community Park. Reported last week, cleaned up by volunteer group.',
        lat: 12.9856, lng: 77.5963,
        reporter: 'Vikram Singh',
        timestamp: Date.now() - 86400000,
        claimedBy: 'Anita Desai',
        timeline: [
          { action: 'Reported', time: Date.now() - 86400000, actor: 'Vikram Singh' },
          { action: 'Claimed for cleanup', time: Date.now() - 82800000, actor: 'Anita Desai' },
          { action: 'Proof submitted', time: Date.now() - 50000000, actor: 'Anita Desai' },
          { action: 'Area cleaned up! 🎉', time: Date.now() - 43200000, actor: 'Anita Desai' },
        ],
        photoUrl: null, afterPhotoUrl: null,
      },
      {
        id: 1007, severity: 3, status: 'pending',
        description: 'Sewage overflow mixing with garbage near residential area. Health hazard for children and elderly.',
        lat: 12.9550, lng: 77.6010,
        reporter: 'Sunita Rao',
        timestamp: Date.now() - 1800000,
        timeline: [{ action: 'Reported', time: Date.now() - 1800000, actor: 'Sunita Rao' }],
        photoUrl: null, afterPhotoUrl: null, claimedBy: null,
      },
    ];

    await FirebaseDB.seedDatabase(dummyReports);
  }

  // ── Filtered reports (from local mirror) ──
  function getFilteredReports() {
    return state.reports.filter(r => {
      if (state.filters.status === 'all') return true;
      return r.status === state.filters.status;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }

  function setFilter(key, value) {
    state.filters[key] = value;
    emit('filterChanged');
  }

  // ── Stats ──
  function getStats() {
    const all = state.reports;
    return {
      total:    all.length,
      progress: all.filter(r => r.status === 'progress' || r.status === 'proof_pending').length,
      resolved: all.filter(r => r.status === 'resolved').length,
      low:      all.filter(r => r.severity === 1 && r.status !== 'resolved').length,
      med:      all.filter(r => r.severity === 2 && r.status !== 'resolved').length,
      high:     all.filter(r => r.severity === 3 && r.status !== 'resolved').length,
    };
  }

  // ── Activity Feed (local only, not synced) ──
  function addActivity(text, icon = '📢') {
    const item = { text, icon, time: Date.now() };
    state.activityFeed.unshift(item);
    if (state.activityFeed.length > 30) state.activityFeed.pop();
    emit('activityAdded', item);
  }

  return {
    SEVERITY,
    STATUSES,
    VALID_TRANSITIONS,
    state,
    on,
    setCenter,
    createReport,
    claimReport,
    submitProof,
    resolveReport,
    startRealtimeSync,
    seedIfEmpty,
    getFilteredReports,
    getStats,
    getLeaderboard,
    setFilter,
    addActivity,
    timeAgo,
    CENTER: () => CENTER,
  };
})();

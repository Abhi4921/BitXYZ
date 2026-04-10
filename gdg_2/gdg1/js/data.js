/* ════════════════════════════════════════
   CleanMap — Data Store (Firebase-backed)
   ════════════════════════════════════════ */

const CLEANMAP = (() => {

  // ── Severity Levels (3 levels: Low / Medium / High) ──
  const SEVERITY = {
    1: { label: 'Low',    color: '#22c55e', cssClass: 'low',    markerClass: 'marker-low' },
    2: { label: 'Medium', color: '#f97316', cssClass: 'medium', markerClass: 'marker-medium' },
    3: { label: 'High',   color: '#ef4444', cssClass: 'high',   markerClass: 'marker-high' },
  };

  const STATUSES = {
    pending:  { label: 'Pending',     icon: '🟡', badgeClass: 'badge-pending' },
    progress: { label: 'In Progress', icon: '🔵', badgeClass: 'badge-progress' },
    resolved: { label: 'Cleaned',     icon: '✅', badgeClass: 'badge-resolved' },
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
  function rnd(a,b)  { return a + Math.random() * (b - a); }
  function randInt(a,b) { return Math.floor(rnd(a, b + 1)); }

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
      photoUrl:    photoUrl || null,
      claimedBy:   null,
      timeline: [
        { action: 'Reported', time: Date.now(), actor: reporter || 'Anonymous' }
      ],
    };

    // Write to Firebase → triggers real-time update on all devices
    await FirebaseDB.pushReport(report);

    addActivity(`📍 New ${SEVERITY[report.severity]?.label} spot reported`, '📍');
    return report;
  }

  async function claimReport(id) {
    const r = state.reports.find(r => r.id === id);
    if (!r || r.status !== 'pending') return false;

    const newTimeline = [
      ...r.timeline,
      { action: 'Claimed for cleanup', time: Date.now(), actor: 'Volunteer' }
    ];

    // Patch only the changed fields in Firebase
    await FirebaseDB.updateReport(id, {
      status:    'progress',
      claimedBy: 'Volunteer',
      timeline:  newTimeline,
    });

    addActivity(`🧹 Spot #${id} claimed for cleanup!`, '🧹');
    return true;
  }

  async function resolveReport(id) {
    const r = state.reports.find(r => r.id === id);
    if (!r || r.status !== 'progress') return false;

    const actor = r.claimedBy || 'Volunteer';
    const newTimeline = [
      ...r.timeline,
      { action: 'Area cleaned up! 🎉', time: Date.now(), actor }
    ];

    await FirebaseDB.updateReport(id, {
      status:   'resolved',
      timeline: newTimeline,
    });

    addActivity(`✅ Spot #${id} cleaned! Great work!`, '✅');
    return true;
  }

  // ═══════════════════════════════════════════
  //  REAL-TIME LISTENER (called once on boot)
  //  Fires on THIS device AND all others
  //  whenever any report changes in Firebase
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
        photoUrl: null, claimedBy: null,
      },
      {
        id: 1002, severity: 2, status: 'pending',
        description: 'Overflowing garbage bin near MG Road metro. Waste scattered by stray animals. Needs immediate attention.',
        lat: 12.9757, lng: 77.6071,
        reporter: 'Arjun Sharma',
        timestamp: Date.now() - 4500000,
        timeline: [{ action: 'Reported', time: Date.now() - 4500000, actor: 'Arjun Sharma' }],
        photoUrl: null, claimedBy: null,
      },
      {
        id: 1003, severity: 1, status: 'pending',
        description: 'Scattered plastic bottles and food wrappers along Ulsoor Lake walkway. Moderate littering issue.',
        lat: 12.9820, lng: 77.6188,
        reporter: 'Kavitha Nair',
        timestamp: Date.now() - 3600000,
        timeline: [{ action: 'Reported', time: Date.now() - 3600000, actor: 'Kavitha Nair' }],
        photoUrl: null, claimedBy: null,
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
        photoUrl: null,
      },
      {
        id: 1005, severity: 2, status: 'pending',
        description: 'Multiple broken glass bottles and metal scrap spread across the lane near Jayanagar market.',
        lat: 12.9308, lng: 77.5838,
        reporter: 'Meena Iyer',
        timestamp: Date.now() - 2700000,
        timeline: [{ action: 'Reported', time: Date.now() - 2700000, actor: 'Meena Iyer' }],
        photoUrl: null, claimedBy: null,
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
          { action: 'Area cleaned up! 🎉', time: Date.now() - 43200000, actor: 'Anita Desai' },
        ],
        photoUrl: null,
      },
      {
        id: 1007, severity: 3, status: 'pending',
        description: 'Sewage overflow mixing with garbage near residential area. Health hazard for children and elderly.',
        lat: 12.9550, lng: 77.6010,
        reporter: 'Sunita Rao',
        timestamp: Date.now() - 1800000,
        timeline: [{ action: 'Reported', time: Date.now() - 1800000, actor: 'Sunita Rao' }],
        photoUrl: null, claimedBy: null,
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
      progress: all.filter(r => r.status === 'progress').length,
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
    state,
    on,
    setCenter,
    createReport,
    claimReport,
    resolveReport,
    startRealtimeSync,
    seedIfEmpty,
    getFilteredReports,
    getStats,
    setFilter,
    addActivity,
    timeAgo,
    CENTER: () => CENTER,
  };
})();

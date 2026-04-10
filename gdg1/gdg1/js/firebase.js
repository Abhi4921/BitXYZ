/* ════════════════════════════════════════════════════
   CleanMap — Firebase Realtime Database Integration
   ════════════════════════════════════════════════════

   HOW TO SET UP (takes ~2 minutes):
   1. Go to https://console.firebase.google.com/
   2. Click "Add project" → name it "cleanmap" → Continue
   3. Disable Google Analytics → Create project
   4. In the left sidebar: Build → Realtime Database
   5. Click "Create Database" → Start in TEST MODE → Enable
   6. Go to Project Settings (gear icon) → Your apps → </> Web
   7. Register app as "cleanmap" → copy the firebaseConfig values below
   ═══════════════════════════════════════════════════ */

const FirebaseDB = (() => {

  // ── ⚙️ PASTE YOUR FIREBASE CONFIG HERE ──────────────
  const firebaseConfig = {
    apiKey:            "AIzaSyDemo-ReplaceWithYourKey",
    authDomain:        "cleanmap-demo.firebaseapp.com",
    databaseURL:       "https://cleanmap-demo-default-rtdb.firebaseio.com",
    projectId:         "cleanmap-demo",
    storageBucket:     "cleanmap-demo.appspot.com",
    messagingSenderId: "000000000000",
    appId:             "1:000000000000:web:0000000000000000000000",
  };
  // ────────────────────────────────────────────────────

  let db = null;
  let reportsRef = null;
  let isConnected = false;

  function init() {
    try {
      // Prevent double-init if Firebase already initialized
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.database();
      reportsRef = db.ref('reports');
      isConnected = true;

      // Monitor connection state
      db.ref('.info/connected').on('value', snap => {
        const connected = snap.val();
        updateConnectionUI(connected);
      });

      console.log('[CleanMap] Firebase connected ✅');
    } catch (err) {
      console.warn('[CleanMap] Firebase init failed — running in offline mode:', err.message);
      isConnected = false;
    }
    return isConnected;
  }

  function updateConnectionUI(connected) {
    const dot = document.querySelector('.pulse-dot');
    const liveText = document.getElementById('live-count')?.parentElement;
    if (dot) {
      dot.style.background = connected ? '#00f5a0' : '#ef4444';
    }
  }

  // ── Listen to ALL reports (real-time) ──
  function listenToReports(callback) {
    if (!isConnected || !reportsRef) {
      callback([]);
      return;
    }

    reportsRef.on('value', snapshot => {
      const data = snapshot.val();
      const reports = data ? Object.values(data) : [];
      // Sort by timestamp descending
      reports.sort((a, b) => b.timestamp - a.timestamp);
      callback(reports);
    }, err => {
      console.error('[CleanMap] Listen error:', err);
      callback([]);
    });
  }

  // ── Push a new report ──
  async function pushReport(report) {
    if (!isConnected || !reportsRef) return report; // offline fallback
    try {
      // Use the report.id as the Firebase key for easy lookup
      await reportsRef.child(String(report.id)).set(report);
    } catch (err) {
      console.error('[CleanMap] Push report error:', err);
    }
    return report;
  }

  // ── Update fields on an existing report ──
  async function updateReport(id, patches) {
    if (!isConnected || !reportsRef) return;
    try {
      await reportsRef.child(String(id)).update(patches);
    } catch (err) {
      console.error('[CleanMap] Update report error:', err);
    }
  }

  // ── Check if DB is empty (for seed logic) ──
  async function isEmpty() {
    if (!isConnected || !reportsRef) return false;
    try {
      const snap = await reportsRef.limitToFirst(1).once('value');
      return !snap.exists();
    } catch {
      return false;
    }
  }

  // ── Push all seed reports at once ──
  async function seedDatabase(reports) {
    if (!isConnected || !reportsRef) return;
    const batch = {};
    reports.forEach(r => { batch[String(r.id)] = r; });
    try {
      await reportsRef.set(batch);
      console.log('[CleanMap] Seed data written to Firebase ✅');
    } catch (err) {
      console.error('[CleanMap] Seed error:', err);
    }
  }

  // ── Stop listening (cleanup) ──
  function stopListening() {
    if (reportsRef) reportsRef.off();
  }

  return {
    init,
    isConnected: () => isConnected,
    listenToReports,
    pushReport,
    updateReport,
    isEmpty,
    seedDatabase,
    stopListening,
  };
})();

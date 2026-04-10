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

  // ── ⚙️ YOUR FIREBASE CONFIG ──────────────────────────
  const firebaseConfig = {
    apiKey:            "AIzaSyC3LBViKrNf3B4lJfKnCvBFB-CN4HLraIM",
    authDomain:        "cleanmap-f11e4.firebaseapp.com",
    databaseURL:       "https://cleanmap-f11e4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId:         "cleanmap-f11e4",
    storageBucket:     "cleanmap-f11e4.firebasestorage.app",
    messagingSenderId: "88912370322",
    appId:             "1:88912370322:web:ff22172018737c2de0644b",
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

  // ── Compress photo → base64 (stored directly in Firebase RTDB, 100% free) ──
  // Max 800px wide, 60% JPEG quality → typically 40-80KB as base64
  async function compressToBase64(file) {
    return new Promise(resolve => {
      const img = new Image();
      const blobUrl = URL.createObjectURL(file);

      img.onload = () => {
        const MAX = 800;
        let w = img.width;
        let h = img.height;

        // Scale down if wider than MAX
        if (w > MAX) {
          h = Math.round(h * MAX / w);
          w = MAX;
        }

        const canvas = document.createElement('canvas');
        canvas.width  = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);

        // Convert to base64 JPEG at 60% quality
        const base64 = canvas.toDataURL('image/jpeg', 0.6);
        URL.revokeObjectURL(blobUrl);
        console.log(`[CleanMap] Photo compressed: ${Math.round(base64.length / 1024)}KB`);
        resolve(base64);
      };

      img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(null); };
      img.src = blobUrl;
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
    compressToBase64,
    pushReport,
    updateReport,
    isEmpty,
    seedDatabase,
    stopListening,
  };
})();

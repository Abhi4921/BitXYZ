/* ════════════════════════════════════════
   CleanMap — Map Engine (Leaflet, Mobile)
   ════════════════════════════════════════ */

const MapEngine = (() => {
  let map = null;
  let markersLayer = null;
  let userMarker = null;

  // Dark map tiles
  const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

  function init(center) {
    map = L.map('map', {
      center: [center.lat, center.lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Add zoom control to bottom-left (mobile friendly)
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    // Map click for report location picking
    map.on('click', e => {
      if (window._mapPickMode && window._mapPickCallback) {
        window._mapPickCallback(e.latlng.lat, e.latlng.lng);
        window._mapPickMode = false;
        document.getElementById('map').style.cursor = '';
      }
    });

    return map;
  }

  // ── Custom marker icon based on severity + status ──
  function createMarkerIcon(report) {
    const sev = CLEANMAP.SEVERITY[report.severity];
    let markerClass = sev?.markerClass || 'marker-low';

    // Override colour for "In Progress" (blue)
    if (report.status === 'progress') markerClass = 'marker-progress';
    if (report.status === 'pending_proof') markerClass = 'marker-pending'; // Reuse pending class visually or create new
    // Resolved spots are dimmed green
    if (report.status === 'resolved') markerClass = 'marker-resolved';

    // Use emoji icon based on status/severity
    let icon = '🗑️';
    if (report.status === 'progress')  icon = '🧹';
    else if (report.status === 'pending_proof') icon = '📷';
    else if (report.status === 'resolved') icon = '✅';
    else if (report.severity === 1)    icon = '🟢';
    else if (report.severity === 2)    icon = '🟠';
    else if (report.severity === 3)    icon = '🔴';

    const html = `<div class="custom-marker ${markerClass}">
      <span class="marker-icon">${icon}</span>
    </div>`;

    return L.divIcon({
      html,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  }

  // ── Build popup HTML ──
  function buildPopupHTML(report) {
    const sev = CLEANMAP.SEVERITY[report.severity];
    const stat = CLEANMAP.STATUSES[report.status];
    const t = (k) => typeof I18N !== 'undefined' ? I18N.t(k) : k;

    const sevBadgeClass = `sev-${sev?.cssClass}-badge`;

    let actionBtn = '';
    if (report.status === 'pending') {
      actionBtn = `<button class="popup-btn popup-btn-claim" onclick="App.claimSpot(${report.id})">🧹 ${t('claim_btn')}</button>`;
    } else if (report.status === 'progress' || report.status === 'pending_proof') {
      actionBtn = `<button class="popup-btn" onclick="App.openDetail(${report.id})">✅ ${t('resolve_btn')}</button>`;
    }
    
    // Gamification Score
    let scoreHTML = '';
    if (report.claimedBy) {
      const score = CLEANMAP.getScoreForUser(report.claimedBy);
      scoreHTML = `<div class="popup-claim-score">👤 ${report.claimedBy} <span class="score-badge">${score} ${t('pts')}</span></div>`;
    }

    // Comparison thumbnail
    let proofHTML = '';
    if (report.photoUrl && report.afterPhotoUrl) {
      proofHTML = `
      <div class="popup-comparison">
        <div class="popup-thumb"><img src="${report.photoUrl}"><span>${t('before_lbl')}</span></div>
        <div class="popup-thumb"><img src="${report.afterPhotoUrl}"><span>${t('after_lbl')}</span></div>
      </div>`;
    }

    return `<div class="popup-card">
      <div class="popup-type"><span>${t('sev_'+sev?.label.toLowerCase())}</span> <span>${t('severity')}</span></div>
      <span class="popup-severity ${sevBadgeClass}">${t('sev_'+sev?.label.toLowerCase())}</span>
      <div class="popup-status">${stat?.icon} <span>${t('status_'+report.status)}</span></div>
      ${scoreHTML}
      ${proofHTML}
      <button class="popup-btn" onclick="App.openDetail(${report.id})">${t('view_det_btn')}</button>
      ${actionBtn}
    </div>`;
  }

  // ── Render all markers ──
  function renderReports(reports) {
    markersLayer.clearLayers();

    reports.forEach(report => {
      const marker = L.marker([report.lat, report.lng], {
        icon: createMarkerIcon(report),
      });

      marker.bindPopup(buildPopupHTML(report), {
        maxWidth: 260,
        className: 'clean-popup',
      });

      markersLayer.addLayer(marker);
    });
  }

  // ── Update a single marker's popup (after claim/resolve) ──
  function refreshMarkerPopup(report) {
    markersLayer.eachLayer(layer => {
      const latlng = layer.getLatLng();
      if (Math.abs(latlng.lat - report.lat) < 0.0001 && Math.abs(latlng.lng - report.lng) < 0.0001) {
        layer.setIcon(createMarkerIcon(report));
        layer.setPopupContent(buildPopupHTML(report));
      }
    });
  }

  // ── Show user location ──
  function showUserLocation(lat, lng) {
    if (userMarker) userMarker.remove();
    const icon = L.divIcon({
      html: `<div style="
        width: 16px; height: 16px;
        background: linear-gradient(135deg, #00f5a0, #00d9f5);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 5px rgba(0,245,160,0.25);
      "></div>`,
      className: '',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    userMarker = L.marker([lat, lng], { icon }).addTo(map);
    map.flyTo([lat, lng], 14, { duration: 1.2 });
  }

  function panTo(lat, lng, zoom = 15) {
    map.flyTo([lat, lng], zoom, { duration: 0.8 });
  }

  // ── Fit map view to all markers ──
  function fitToMarkers(reports) {
    if (!map || !reports || reports.length === 0) return;
    const coords = reports.map(r => [r.lat, r.lng]);
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, animate: true, duration: 0.8 });
  }

  function getMap() { return map; }

  function invalidateSize() {
    if (map) setTimeout(() => map.invalidateSize(), 100);
  }

  return {
    init,
    renderReports,
    refreshMarkerPopup,
    showUserLocation,
    panTo,
    fitToMarkers,
    getMap,
    invalidateSize,
  };
})();

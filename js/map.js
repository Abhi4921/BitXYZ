/* ════════════════════════════════════════
   CleanMap — Map Engine (Leaflet, Mobile)
   With: Proof-based status flow support
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

    // Override colour for statuses
    if (report.status === 'progress')      markerClass = 'marker-progress';
    if (report.status === 'proof_pending') markerClass = 'marker-progress';
    if (report.status === 'resolved')      markerClass = 'marker-resolved';

    // Use emoji icon based on status/severity
    let icon = '🗑️';
    if (report.status === 'progress')       icon = '🧹';
    else if (report.status === 'proof_pending') icon = '📸';
    else if (report.status === 'resolved')  icon = '✅';
    else if (report.severity === 1)         icon = '🟢';
    else if (report.severity === 2)         icon = '🟠';
    else if (report.severity === 3)         icon = '🔴';

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

  // ── Build popup HTML with strict status flow ──
  function buildPopupHTML(report) {
    const sev = CLEANMAP.SEVERITY[report.severity];
    const stat = CLEANMAP.STATUSES[report.status];
    const sevLabel = i18n.t(`severity.${sev?.cssClass}`) || sev?.label;
    const statusLabel = i18n.t(`status.${report.status}`) || stat?.label;
    const sevBadgeClass = `sev-${sev?.cssClass}-badge`;

    let actionBtn = '';
    if (report.status === 'pending') {
      actionBtn = `<button class="popup-btn popup-btn-claim" onclick="App.claimSpot(${report.id})">🧹 ${i18n.t('action.claim')}</button>`;
    } else if (report.status === 'progress') {
      actionBtn = `<button class="popup-btn" onclick="App.openProofModal(${report.id})">📸 ${i18n.t('action.submitProof')}</button>`;
    } else if (report.status === 'proof_pending') {
      actionBtn = `<button class="popup-btn" onclick="App.resolveSpot(${report.id})">✅ ${i18n.t('action.resolve')}</button>`;
    }

    const pts = CLEANMAP.SEVERITY[report.severity]?.points || 0;

    return `<div class="popup-card">
      <div class="popup-type">${sevLabel} Severity</div>
      <span class="popup-severity ${sevBadgeClass}">${sevLabel} · ⭐ ${pts}pts</span>
      <div class="popup-status">${stat?.icon} ${statusLabel}</div>
      <button class="popup-btn" onclick="App.openDetail(${report.id})">View Details →</button>
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

  // ── Update a single marker's popup ──
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

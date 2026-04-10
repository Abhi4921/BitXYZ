const I18N = (() => {
  const dictionary = {
    en: {
      app_title: "CleanMap",
      splash_tagline: "Report. Volunteer. Clean up.",
      splash_sub: "Pin waste spots on the map, rate severity, and coordinate cleanups with your community.",
      get_started: "Get Started →",
      nav_map: "Map",
      nav_dashboard: "Dashboard",
      nav_reports: "Reports",
      dash_title: "Dashboard",
      dash_sub: "Community cleanup progress",
      total_rep: "Total Reported",
      in_prog: "In Progress",
      cleaned: "Cleaned",
      sev_brk: "Severity Breakdown",
      recent_act: "Recent Activity",
      all_rep: "All Reports",
      filter_all: "All",
      filter_pending: "Pending",
      filter_prog: "In Progress",
      filter_clean: "Cleaned",
      rep_spot: "📍 Report a Spot",
      your_name: "👤 Your Name",
      name_ph: "Enter your name (shown on the report)",
      pin_loc: "📍 Pin Location",
      loc_hint: "Tap the button to use GPS, or tap on map after closing this sheet.",
      loc_ph: "Tap to set location",
      add_photo: "📸 Add Photo",
      photo_hint: "Tap to take or choose photo",
      rate_sev: "⚡ Rate Severity",
      low: "Low",
      med: "Medium",
      high: "High",
      desc_opt: "📝 Description (optional)",
      desc_ph: "Describe the waste — size, type, any hazards...",
      submit_rep: "Submit Report",
      spot_det: "Spot Details",
      leaderboard_title: "Leaderboard (Top Cleaners)",
      no_claimed_spots: "No claimed spots yet.",
      spots_cleaned: "spots cleaned",
      pts: "pts",
      claim_btn: "🧹 Claim for Cleanup",
      resolve_btn: "✅ Upload Proof / Resolve",
      before_lbl: "Before",
      after_lbl: "After",
      severity: "Severity",
      status_pending: "Pending",
      status_progress: "In Progress",
      status_pending_proof: "Pending Proof",
      status_resolved: "Cleaned",
      view_det_btn: "View Details →",
      upload_proof: "Upload After Photo",
      skip_proof: "Skip & Mark Done",
      spot_cleaned_msg: "✅ This spot has been cleaned!",
      live: "live",
      sev_low: "Low",
      sev_medium: "Medium",
      sev_high: "High",
      status_label: "Status",
      reported_lbl: "Reported",
      reporter_lbl: "Reporter",
      claimed_by_lbl: "Claimed By",
      timeline_lbl: "Timeline",
      no_reports_msg: "No reports match this filter."
    },
    hi: {
      app_title: "क्लीनमैप",
      splash_tagline: "रिपोर्ट करें। स्वयंसेवक बनें। साफ़ करें।",
      splash_sub: "नक्शे पर कचरे के स्थानों को पिन करें, गंभीरता को रेट करें, और अपने समुदाय के साथ सफाई का समन्वय करें।",
      get_started: "शुरू करें →",
      nav_map: "नक्शा",
      nav_dashboard: "डैशबोर्ड",
      nav_reports: "रिपोर्ट्स",
      dash_title: "डैशबोर्ड",
      dash_sub: "सामुदायिक सफाई की प्रगति",
      total_rep: "कुल रिपोर्ट",
      in_prog: "प्रगति पर है",
      cleaned: "साफ़ हो गया",
      sev_brk: "गंभीरता का विवरण",
      recent_act: "हाल की गतिविधि",
      all_rep: "सभी रिपोर्ट",
      filter_all: "सभी",
      filter_pending: "लंबित",
      filter_prog: "प्रगति पर है",
      filter_clean: "साफ़ हो गया",
      rep_spot: "📍 स्थान की रिपोर्ट करें",
      your_name: "👤 आपका नाम",
      name_ph: "अपना नाम दर्ज करें",
      pin_loc: "📍 पिन स्थान",
      loc_hint: "GPS के लिए बटन टैप करें",
      loc_ph: "स्थान के लिए टैप करें",
      add_photo: "📸 फोटो जोड़ें",
      photo_hint: "फोटो खींचने या चुनने के लिए टैप करें",
      rate_sev: "⚡ गंभीरता रेट करें",
      low: "कम",
      med: "मध्यम",
      high: "अधिक",
      desc_opt: "📝 विवरण (वैकल्पिक)",
      desc_ph: "कचरे का वर्णन करें...",
      submit_rep: "रिपोर्ट जमा करें",
      spot_det: "स्थान विवरण",
      leaderboard_title: "लीडरबोर्ड",
      no_claimed_spots: "अभी तक कोई दावा नहीं।",
      spots_cleaned: "स्थान साफ़ किए",
      pts: "अंक",
      claim_btn: "🧹 सफाई के लिए दावा करें",
      resolve_btn: "✅ प्रमाण अपलोड करें",
      before_lbl: "पहले",
      after_lbl: "बाद में",
      severity: "गंभीरता",
      status_pending: "लंबित",
      status_progress: "प्रगति पर है",
      status_pending_proof: "प्रमाण लंबित",
      status_resolved: "साफ़ हो गया",
      view_det_btn: "विवरण देखें →",
      upload_proof: "बाद का फोटो अपलोड करें",
      skip_proof: "छोड़ें और हो गया चिह्नित करें",
      spot_cleaned_msg: "✅ यह स्थान साफ़ कर दिया गया है!",
      live: "लाइव",
      sev_low: "कम",
      sev_medium: "मध्यम",
      sev_high: "अधिक",
      status_label: "स्थिति",
      reported_lbl: "रिपोर्ट किया गया",
      reporter_lbl: "रिपोर्टर",
      claimed_by_lbl: "दावा किया गया",
      timeline_lbl: "समय-रेखा",
      no_reports_msg: "इस फ़िल्टर से कोई रिपोर्ट मेल नहीं खाती।"
    }
  };

  let currentLang = localStorage.getItem('cleanmap_lang') || 'en';

  const t = (key) => {
    return dictionary[currentLang]?.[key] || dictionary['en'][key] || key;
  };

  const applyTranslations = () => {
    // 1. data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = t(key);
      } else {
        if (!el.innerHTML.includes('<') || el.hasAttribute('data-i18n-safe')) {
          el.textContent = t(key);
        }
      }
    });
  };

  const setLang = (lang) => {
    currentLang = lang;
    localStorage.setItem('cleanmap_lang', lang);
    applyTranslations();
    
    // Explicitly re-render dynamic components so they pick up new inline translations
    if (typeof UI !== 'undefined' && typeof CLEANMAP !== 'undefined') {
       UI.updateDashboard();
       UI.renderReportsList();
       // Also the report details modal if it's currently open!
       const modal = document.getElementById('modal-detail');
       if (modal && !modal.classList.contains('hidden')) {
          const id = window._currentDetailId;
          if (id) {
             const r = CLEANMAP.state.reports.find(x => x.id === id);
             if (r) UI.openDetail(r);
          }
       }
    }
    // Re-render map markers completely
    if (typeof MapEngine !== 'undefined' && typeof CLEANMAP !== 'undefined') {
       // Since the map marker components inject inline strings using I18N.t(), rebuilding them fetches new values
       MapEngine.renderReports(CLEANMAP.getFilteredReports());
    }
  };

  return { t, setLang, applyTranslations, getLang: () => currentLang };
})();

document.addEventListener('DOMContentLoaded', () => {
   const toggle = document.getElementById('lang-toggle');
   if (toggle) {
     toggle.value = I18N.getLang();
     toggle.addEventListener('change', (e) => I18N.setLang(e.target.value));
   }
   setTimeout(I18N.applyTranslations, 100);
});

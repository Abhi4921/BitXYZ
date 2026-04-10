/* ════════════════════════════════════════
   CleanMap — Internationalization (i18n)
   Supports: English, Hindi, Tamil
   ════════════════════════════════════════ */

const i18n = (() => {
  let currentLanguage = localStorage.getItem('cleanmap-lang') || 'en';

  const translations = {
    en: {
      // Header & Navigation
      'app.name': 'CleanMap',
      'app.tagline': 'Report. Volunteer. Clean up.',
      'app.subtitle': 'Pin waste spots on the map, rate severity, and coordinate cleanups with your community.',
      'btn.started': 'Get Started →',
      'nav.map': 'Map',
      'nav.dashboard': 'Dashboard',
      'nav.reports': 'Reports',
      'nav.leaderboard': 'Leaderboard',
      
      // Dashboard
      'dash.title': 'Dashboard',
      'dash.subtitle': 'Community cleanup progress',
      'dash.total': 'Total Reported',
      'dash.progress': 'In Progress',
      'dash.cleaned': 'Cleaned',
      'dash.severity': 'Severity Breakdown',
      'dash.activity': 'Recent Activity',
      'dash.low': '🟢 Low',
      'dash.medium': '🟠 Medium',
      'dash.high': '🔴 High',
      
      // Reports List
      'reports.title': 'All Reports',
      'reports.filter.all': 'All',
      'reports.filter.pending': 'Pending',
      'reports.filter.progress': 'In Progress',
      'reports.filter.proofPending': 'Proof Pending',
      'reports.filter.resolved': 'Cleaned',
      'reports.empty': 'No reports match this filter.',
      
      // Report Form
      'form.reportSpot': '📍 Report a Spot',
      'form.yourName': '👤 Your Name',
      'form.location': '📍 Pin Location',
      'form.locationHint': 'Tap the button to use GPS, or tap on map after closing this sheet.',
      'form.photo': '📸 Add Photo',
      'form.photoHint': 'Tap to take or choose photo',
      'form.severity': '⚡ Rate Severity',
      'form.description': '📝 Description (optional)',
      'form.descriptionHint': 'Describe the waste — size, type, any hazards...',
      'form.submit': 'Submit Report',
      'form.beforePhoto': 'Before Photo',
      'form.afterPhoto': 'After Photo',
      'form.submitProof': 'Submit Proof',
      
      // Status Labels
      'status.pending': 'Pending',
      'status.progress': 'In Progress',
      'status.proofPending': 'Proof Pending',
      'status.resolved': 'Cleaned',
      'status.icon.pending': '🟡',
      'status.icon.progress': '🔵',
      'status.icon.proofPending': '📸',
      'status.icon.resolved': '✅',
      
      // Severity Labels
      'severity.low': 'Low',
      'severity.medium': 'Medium',
      'severity.high': 'High',
      
      // Actions
      'action.claim': 'Claim for Cleanup',
      'action.submitProof': 'Submit Before/After Photos',
      'action.resolve': 'Verify & Close',
      'action.remove': '✕',
      
      // Timeline
      'timeline.reported': 'Reported',
      'timeline.claimed': 'Claimed for cleanup',
      'timeline.proofSubmitted': 'Proof submitted',
      'timeline.resolved': 'Area cleaned up! 🎉',
      'timeline.verified': 'Verified & closed',
      
      // Activity
      'activity.spotReported': '📍 New {{severity}} spot reported',
      'activity.spotClaimed': '🧹 Spot #{{id}} claimed for cleanup!',
      'activity.proofSubmitted': '📸 Spot #{{id}} proof submitted',
      'activity.spotCleaned': '✅ Spot #{{id}} cleaned! Great work!',
      
      // Leaderboard
      'leaderboard.title': 'Leaderboard',
      'leaderboard.subtitle': 'Top volunteers by contribution score',
      'leaderboard.rank': 'Rank',
      'leaderboard.name': 'Volunteer',
      'leaderboard.score': 'Score',
      'leaderboard.reports': 'Reports',
      'leaderboard.cleanups': 'Cleanups',
      'leaderboard.nodata': 'No leaderboard data yet. Start reporting and volunteering!',
      
      // Toasts
      'toast.welcome': 'Welcome to CleanMap!',
      'toast.syncActive': '🔴 Live sync active — changes appear on all devices!',
      'toast.offline': '📱 Offline mode — Firebase not configured.',
      'toast.reportSuccess': '✅ Report submitted successfully!',
      'toast.claimSuccess': '✅ Cleanup claim registered!',
      'toast.proofSuccess': '✅ Proof submitted for verification!',
      'toast.resolveSuccess': '✅ Spot marked as cleaned!',
      'toast.error': '❌ Something went wrong. Please try again.',
      
      // Language Selection
      'lang.select': 'Language',
      'lang.english': 'English',
      'lang.hindi': 'हिंदी',
      'lang.tamil': 'தமிழ்',
      
      // Settings
      'settings.title': 'Settings',
      'settings.language': 'Language',
    },
    
    hi: {
      // Header & Navigation
      'app.name': 'क्लीनमैप',
      'app.tagline': 'रिपोर्ट करें। स्वेच्छा से काम करें। सफाई करুं।',
      'app.subtitle': 'मानचित्र पर कचरे के स्थान चिह्नित करें, गंभीरता दर करें, और अपने समुदाय के साथ सफाई का समन्वय करें।',
      'btn.started': 'शुरुआत करें →',
      'nav.map': 'मानचित्र',
      'nav.dashboard': 'डैशबोर्ड',
      'nav.reports': 'रिपोर्ट',
      'nav.leaderboard': 'लीडरबोर्ड',
      
      // Dashboard
      'dash.title': 'डैशबोर्ड',
      'dash.subtitle': 'सामुदायिक सफाई प्रगति',
      'dash.total': 'कुल रिपोर्ट किए गए',
      'dash.progress': 'चल रहा है',
      'dash.cleaned': 'साफ किया गया',
      'dash.severity': 'गंभीरता विश्लेषण',
      'dash.activity': 'हाल की गतिविधि',
      'dash.low': '🟢 कम',
      'dash.medium': '🟠 मध्यम',
      'dash.high': '🔴 उच्च',
      
      // Reports List
      'reports.title': 'सभी रिपोर्ट',
      'reports.filter.all': 'सभी',
      'reports.filter.pending': 'प्रतीक्षारत',
      'reports.filter.progress': 'चल रहा है',
      'reports.filter.proofPending': 'प्रमाण प्रतीक्षारत',
      'reports.filter.resolved': 'साफ किया गया',
      'reports.empty': 'इस फ़िल्टर से कोई रिपोर्ट नहीं मिली।',
      
      // Report Form
      'form.reportSpot': '📍 स्थान की रिपोर्ट करें',
      'form.yourName': '👤 आपका नाम',
      'form.location': '📍 स्थान चिह्नित करें',
      'form.locationHint': 'GPS का उपयोग करने के लिए बटन दबाएं, या इस शीट को बंद करने के बाद मानचित्र पर टैप करें।',
      'form.photo': '📸 फोटो जोड़ें',
      'form.photoHint': 'फोटो लेने या चुनने के लिए टैप करें',
      'form.severity': '⚡ गंभीरता दर करें',
      'form.description': '📝 विवरण (वैकल्पिक)',
      'form.descriptionHint': 'कचरे का वर्णन करें — आकार, प्रकार, कोई खतरा...',
      'form.submit': 'रिपोर्ट जमा करें',
      'form.beforePhoto': 'पहले की फोटो',
      'form.afterPhoto': 'बाद की फोटो',
      'form.submitProof': 'प्रमाण जमा करें',
      
      // Status Labels
      'status.pending': 'प्रतीक्षारत',
      'status.progress': 'चल रहा है',
      'status.proofPending': 'प्रमाण प्रतीक्षारत',
      'status.resolved': 'साफ किया गया',
      'status.icon.pending': '🟡',
      'status.icon.progress': '🔵',
      'status.icon.proofPending': '📸',
      'status.icon.resolved': '✅',
      
      // Severity Labels
      'severity.low': 'कम',
      'severity.medium': 'मध्यम',
      'severity.high': 'उच्च',
      
      // Actions
      'action.claim': 'सफाई के लिए दावा करें',
      'action.submitProof': 'पहले/बाद की फोटो जमा करें',
      'action.resolve': 'सत्यापित करें और बंद करें',
      'action.remove': '✕',
      
      // Timeline
      'timeline.reported': 'रिपोर्ट की गई',
      'timeline.claimed': 'सफाई के लिए दावा किया गया',
      'timeline.proofSubmitted': 'प्रमाण जमा किया गया',
      'timeline.resolved': 'क्षेत्र साफ किया गया! 🎉',
      'timeline.verified': 'सत्यापित और बंद',
      
      // Activity
      'activity.spotReported': '📍 नया {{severity}} स्थान रिपोर्ट किया गया',
      'activity.spotClaimed': '🧹 स्थान #{{id}} सफाई के लिए दावा किया गया!',
      'activity.proofSubmitted': '📸 स्थान #{{id}} प्रमाण जमा किया गया',
      'activity.spotCleaned': '✅ स्थान #{{id}} साफ किया गया! शानदार काम!',
      
      // Leaderboard
      'leaderboard.title': 'लीडरबोर्ड',
      'leaderboard.subtitle': 'योगदान स्कोर द्वारा शीर्ष स्वयंसेवक',
      'leaderboard.rank': 'रैंक',
      'leaderboard.name': 'स्वयंसेवक',
      'leaderboard.score': 'स्कोर',
      'leaderboard.reports': 'रिपोर्ट',
      'leaderboard.cleanups': 'सफाई',
      'leaderboard.nodata': 'अभी तक कोई लीडरबोर्ड डेटा नहीं। रिपोर्ट करना और स्वेच्छा से काम करना शुरू करें!',
      
      // Toasts
      'toast.welcome': 'क्लीनमैप में आपका स्वागत है!',
      'toast.syncActive': '🔴 लाइव सिंक सक्रिय — परिवर्तन सभी डिवाइस पर दिखाई देते हैं!',
      'toast.offline': '📱 ऑफलाइन मोड — Firebase कॉन्फ़िगर नहीं किया गया।',
      'toast.reportSuccess': '✅ रिपोर्ट सफलतापूर्वक प्रस्तुत की गई!',
      'toast.claimSuccess': '✅ सफाई दावा पंजीकृत!',
      'toast.proofSuccess': '✅ प्रमाण सत्यापन के लिए प्रस्तुत किया गया!',
      'toast.resolveSuccess': '✅ स्थान को साफ के रूप में चिह्नित किया गया!',
      'toast.error': '❌ कुछ गलत हुआ। कृपया पुनः प्रयास करें।',
      
      // Language Selection
      'lang.select': 'भाषा',
      'lang.english': 'English',
      'lang.hindi': 'हिंदी',
      'lang.tamil': 'தமிழ்',
      
      // Settings
      'settings.title': 'सेटिंग्स',
      'settings.language': 'भाषा',
    },
    
    ta: {
      // Header & Navigation
      'app.name': 'கிளீன்மேப்',
      'app.tagline': 'அறிக்கை தர. தன்னார்வ செயல். சுத்தம் செய்க.',
      'app.subtitle': 'வரைபடத்தில் கழிவு நிலங்களைக் குறிக்கவும், தீவிரத்தை மதிப்பிடவும், உங்கள் சமூதாயத்துடன் சுத்தம் ஆய்வை ஒத்திசைக்கவும்.',
      'btn.started': 'தொடங்க →',
      'nav.map': 'வரைபடம்',
      'nav.dashboard': 'கட்டளை பலகை',
      'nav.reports': 'அறிக்கைகள்',
      'nav.leaderboard': 'தலைவர் பலகை',
      
      // Dashboard
      'dash.title': 'கட்டளை பலகை',
      'dash.subtitle': 'சமூதாய சுத்தம் வளர்ச்சி',
      'dash.total': 'மொத்த அறிக்கை செய்யப்பட்ட',
      'dash.progress': 'நிலைமை',
      'dash.cleaned': 'சுத்தம் செய்யப்பட்ட',
      'dash.severity': 'தீவிரத வெடிப்பு',
      'dash.activity': 'சமீபத்திய நடவடிக்கை',
      'dash.low': '🟢 குறைந்த',
      'dash.medium': '🟠 நடுத்தர',
      'dash.high': '🔴 உயர்',
      
      // Reports List
      'reports.title': 'அனைத்து அறிக்கைகள்',
      'reports.filter.all': 'அனைத்து',
      'reports.filter.pending': 'நிலுவையில்',
      'reports.filter.progress': 'நிலைமை',
      'reports.filter.proofPending': 'ஆதாரம் நிலுவையில்',
      'reports.filter.resolved': 'சுத்தம் செய்யப்பட்ட',
      'reports.empty': 'இந்த வடிகட்டி உடன் பொருந்தவில்லை.',
      
      // Report Form
      'form.reportSpot': '📍 இடத்தை அறிக்கை செய்க',
      'form.yourName': '👤 உங்கள் பெயர்',
      'form.location': '📍 இடத்தை குறிக்க',
      'form.locationHint': 'GPS ஐ பயன்படுத்த பொத்தானை குட்டி, அல்லது இந்த தாளை மூடிய பிறகு வரைபடத்தில் குட்டி.',
      'form.photo': '📸 புகைப்படம் சேர்க்க',
      'form.photoHint': 'புகைப்படம் எடுக்க அல்லது புகைப்படம் தேர்ந்தெடுக்க குட்டி',
      'form.severity': '⚡ தீவிரத மதிப்பிட',
      'form.description': '📝 விபரணை (விருப்பமான)',
      'form.descriptionHint': 'கழிவை விபரணை செய். — அளவு, வகை, ஏதேனும் ஆபத்து...',
      'form.submit': 'அறிக்கை சமர்ப்பிக்க',
      'form.beforePhoto': 'முன்பு புகைப்படம்',
      'form.afterPhoto': 'பிறகு புகைப்படம்',
      'form.submitProof': 'ஆதாரம் சமர்ப்பிக்க',
      
      // Status Labels
      'status.pending': 'நிலுவையில்',
      'status.progress': 'நிலைமை',
      'status.proofPending': 'ஆதாரம் நிலுவையில்',
      'status.resolved': 'சுத்தம் செய்யப்பட்ட',
      'status.icon.pending': '🟡',
      'status.icon.progress': '🔵',
      'status.icon.proofPending': '📸',
      'status.icon.resolved': '✅',
      
      // Severity Labels
      'severity.low': 'குறைந்த',
      'severity.medium': 'நடுத்தர',
      'severity.high': 'உயர்',
      
      // Actions
      'action.claim': 'சுத்தம் செய்ய கோரிக்கை',
      'action.submitProof': 'முன்பு/பிறகு புகைப்படங்களை சமர்ப்பிக்க',
      'action.resolve': 'சரிபார்த்து மூட',
      'action.remove': '✕',
      
      // Timeline
      'timeline.reported': 'அறிக்கை செய்யப்பட்ட',
      'timeline.claimed': 'சுத்தம் செய்ய கோரிக்கை செய்யப்பட்ட',
      'timeline.proofSubmitted': 'ஆதாரம் சமர்ப்பிக்கப்பட்ட',
      'timeline.resolved': 'பகுதி சுத்தம் செய்யப்பட்ட! 🎉',
      'timeline.verified': 'சரிபார்க்கப்பட்ட மற்றும் மூடப்பட்ட',
      
      // Activity
      'activity.spotReported': '📍 புதிய {{severity}} இடம் அறிக்கை செய்யப்பட்ட',
      'activity.spotClaimed': '🧹 இடம் #{{id}} சுத்தம் செய்ய கோரிக்கை!',
      'activity.proofSubmitted': '📸 இடம் #{{id}} ஆதாரம் சமர்ப்பிக்கப்பட்ட',
      'activity.spotCleaned': '✅ இடம் #{{id}} சுத்தம் செய்யப்பட்ட! அருமை!',
      
      // Leaderboard
      'leaderboard.title': 'தலைவர் பலகை',
      'leaderboard.subtitle': 'பங்களிப்பு மதிப்புக்கு மிகச்சிறந்த தன்னார்வ தொழிலாளி',
      'leaderboard.rank': 'தரவரிசை',
      'leaderboard.name': 'தன்னார்வ தொழிலாளி',
      'leaderboard.score': 'மதிப்பு',
      'leaderboard.reports': 'அறிக்கைகள்',
      'leaderboard.cleanups': 'சுத்தம்',
      'leaderboard.nodata': 'இதுவரை தலைவர் பலகை தகவல் இல்லை. அறிக்கை செய்ய மற்றும் தன்னார்வ செயல் செய்ய தொடங்க!',
      
      // Toasts
      'toast.welcome': 'கிளீன்மேப்பில் உங்களை வரவேற்கிறோம்!',
      'toast.syncActive': '🔴 நேரடி ஒத்திசைப்பு சক்रியம் — மாற்றங்கள் அனைத்து சாதனங்களில் தோன்றும்!',
      'toast.offline': '📱 ஆஃப்லைன் பயன்முறை — Firebase உள்ளமைக்கப்படவில்லை.',
      'toast.reportSuccess': '✅ அறிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
      'toast.claimSuccess': '✅ சுத்தம் கோரிக்கை பதிவு!',
      'toast.proofSuccess': '✅ ஆதாரம் சரிபார்ப்புக்கு சமர்ப்பிக்கப்பட்ட!',
      'toast.resolveSuccess': '✅ இடம் சுத்தம் குறிக்கப்பட்ட!',
      'toast.error': '❌ ஏதாவது தவறு இருந்தது. மீண்டும் முயல்க.',
      
      // Language Selection
      'lang.select': 'மொழி',
      'lang.english': 'English',
      'lang.hindi': 'हिंदी',
      'lang.tamil': 'தமிழ்',
      
      // Settings
      'settings.title': 'அமைப்புகள்',
      'settings.language': 'மொழி',
    },
  };

  function t(key, replacements = {}) {
    let text = translations[currentLanguage]?.[key] || translations['en'][key] || key;
    
    // Handle replacements
    Object.entries(replacements).forEach(([placeholder, value]) => {
      text = text.replace(`{{${placeholder}}}`, value);
    });
    
    return text;
  }

  function setLanguage(lang) {
    if (translations[lang]) {
      currentLanguage = lang;
      localStorage.setItem('cleanmap-lang', lang);
      document.documentElement.lang = lang;
      return true;
    }
    return false;
  }

  function getLanguage() {
    return currentLanguage;
  }

  function getAvailableLanguages() {
    return Object.keys(translations);
  }

  return {
    t,
    setLanguage,
    getLanguage,
    getAvailableLanguages,
  };
})();

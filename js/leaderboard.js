/* ════════════════════════════════════════
   CleanMap — Leaderboard & Scoring System
   Severity-based contribution scoring
   ════════════════════════════════════════ */

const Leaderboard = (() => {

  // Scoring rules
  const SCORES = {
    report: {
      1: 10,  // Low severity report
      2: 25,  // Medium severity report
      3: 50,  // High severity report
    },
    claim: 15,        // For claiming to cleanup
    proofSubmitted: 20, // For submitting before/after photos
    cleanup: {
      1: 20,  // Low severity cleanup
      2: 50,  // Medium severity cleanup
      3: 100, // High severity cleanup
    },
  };

  // Calculate score for a single report action
  function calculateReportScore(report) {
    let score = 0;

    // Points for reporting
    if (report.reporter && report.reporter !== 'Anonymous') {
      score += SCORES.report[report.severity] || 0;
    }

    // Points for claiming
    if (report.claimedBy) {
      score += SCORES.claim;
    }

    // Points for proof submission
    if (report.proofUrls && (report.proofUrls.before || report.proofUrls.after)) {
      score += SCORES.proofSubmitted;
    }

    // Points for cleanup completion
    if (report.status === 'resolved') {
      score += SCORES.cleanup[report.severity] || 0;
    }

    return score;
  }

  // Build leaderboard from all reports
  function buildLeaderboard(reports) {
    const contributorMap = {};

    reports.forEach(report => {
      // Track reporter
      if (report.reporter && report.reporter !== 'Anonymous') {
        if (!contributorMap[report.reporter]) {
          contributorMap[report.reporter] = {
            name: report.reporter,
            score: 0,
            reportsCreated: 0,
            cleanupsCompleted: 0,
          };
        }

        contributorMap[report.reporter].score += SCORES.report[report.severity] || 0;
        contributorMap[report.reporter].reportsCreated += 1;
      }

      // Track claimer and completion
      if (report.claimedBy) {
        if (!contributorMap[report.claimedBy]) {
          contributorMap[report.claimedBy] = {
            name: report.claimedBy,
            score: 0,
            reportsCreated: 0,
            cleanupsCompleted: 0,
          };
        }

        contributorMap[report.claimedBy].score += SCORES.claim;

        // If cleanup is completed
        if (report.status === 'resolved') {
          contributorMap[report.claimedBy].score += SCORES.cleanup[report.severity] || 0;
          contributorMap[report.claimedBy].cleanupsCompleted += 1;
        }
      }

      // Track proof submissions
      if (report.proofUrls && (report.proofUrls.before || report.proofUrls.after)) {
        if (report.claimedBy && contributorMap[report.claimedBy]) {
          contributorMap[report.claimedBy].score += SCORES.proofSubmitted;
        }
      }
    });

    // Convert to array and sort by score
    return Object.values(contributorMap)
      .sort((a, b) => b.score - a.score)
      .map((contributor, index) => ({
        ...contributor,
        rank: index + 1,
        percentage: Math.min(100, (contributor.score / 500) * 100), // Max 500 for visual bar
      }));
  }

  // Get top N contributors
  function getTopContributors(reports, limit = 10) {
    return buildLeaderboard(reports).slice(0, limit);
  }

  // Get contributor stats
  function getContributorStats(reports, name) {
    const leaderboard = buildLeaderboard(reports);
    return leaderboard.find(c => c.name === name);
  }

  // Get score breakdown for a report
  function getScoreBreakdown(report) {
    const breakdown = {
      reportScore: 0,
      claimScore: 0,
      proofScore: 0,
      cleanupScore: 0,
      total: 0,
    };

    if (report.reporter && report.reporter !== 'Anonymous') {
      breakdown.reportScore = SCORES.report[report.severity] || 0;
    }

    if (report.claimedBy) {
      breakdown.claimScore = SCORES.claim;

      if (report.status === 'resolved') {
        breakdown.cleanupScore = SCORES.cleanup[report.severity] || 0;
      }
    }

    if (report.proofUrls && (report.proofUrls.before || report.proofUrls.after)) {
      breakdown.proofScore = SCORES.proofSubmitted;
    }

    breakdown.total = breakdown.reportScore + breakdown.claimScore + 
                     breakdown.proofScore + breakdown.cleanupScore;

    return breakdown;
  }

  return {
    SCORES,
    buildLeaderboard,
    getTopContributors,
    getContributorStats,
    getScoreBreakdown,
    calculateReportScore,
  };
})();

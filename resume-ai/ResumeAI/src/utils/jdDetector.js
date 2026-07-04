// JD Detection JavaScript — injected into WebView pages
// Same keyword detection logic as Chrome Extension's content.js

export const JD_DETECTOR_SCRIPT = `
(function() {
  // Prevent multiple injections
  if (window.__jdDetectorInjected) return;
  window.__jdDetectorInjected = true;

  function detectJD() {
    var text = document.body.innerText.toLowerCase();
    var keywords = [
      'job description', 'responsibilities', 'qualifications',
      'requirements', 'what you will do', 'about the role',
      'minimum qualifications', 'preferred qualifications',
      'years of experience', 'equal opportunity employer',
      'apply now', 'skills', 'full-time', 'part-time', 'remote'
    ];

    var matchCount = 0;
    for (var i = 0; i < keywords.length; i++) {
      if (text.indexOf(keywords[i]) !== -1) {
        matchCount++;
      }
    }

    if (matchCount >= 2) {
      // Extract JD using the same AI-Heuristic DOM Extractor from content.js
      var bestNode = null;
      var maxScore = 0;
      var candidates = document.querySelectorAll('div, article, section, main');

      for (var j = 0; j < candidates.length; j++) {
        var el = candidates[j];
        var elText = el.innerText || "";
        if (elText.length > 300 && elText.length < 20000) {
          var score = elText.length;
          var lowerText = elText.toLowerCase();
          if (lowerText.indexOf('about the job') !== -1) score += 10000;
          if (lowerText.indexOf('responsibilities') !== -1) score += 5000;
          if (lowerText.indexOf('qualifications') !== -1) score += 5000;
          if (lowerText.indexOf('requirements') !== -1) score += 5000;

          var childCount = el.querySelectorAll('*').length;
          if (childCount > 0) {
            score = score / Math.sqrt(childCount);
          }
          if (score > maxScore) {
            maxScore = score;
            bestNode = el;
          }
        }
      }

      var pageTitle = document.title;
      var extractedText = "";

      if (bestNode) {
        extractedText = "--- PAGE TITLE (contains Company Name) ---\\n" + pageTitle + "\\n\\n--- TARGETED JOB DESCRIPTION ---\\n\\n" + bestNode.innerText;
      } else {
        extractedText = "--- PAGE TITLE (contains Company Name) ---\\n" + pageTitle + "\\n\\n--- FULL PAGE TEXT ---\\n\\n" + document.body.innerText;
      }

      // Trim to 15000 chars (same as extension)
      extractedText = extractedText.substring(0, 15000);

      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'JD_DETECTED',
        text: extractedText,
        url: window.location.href,
        title: pageTitle
      }));
    }
  }

  // Check immediately, then after delays for SPA pages
  setTimeout(detectJD, 1500);
  setTimeout(detectJD, 3500);

  // SPA Navigation Detection
  var lastUrl = location.href;
  setInterval(function() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      window.__jdDetectorInjected = false;
      setTimeout(detectJD, 2000);
      setTimeout(detectJD, 4000);
    }
  }, 1000);
})();
true; // Required for injectedJavaScript to work
`;

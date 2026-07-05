(() => {
    // Prevent multiple injections
    if (window.jdReaderInitialized) return;
    window.jdReaderInitialized = true;

    // Listen for Authentication Sync from the Dashboard
    window.addEventListener("message", (event) => {
        if (event.data && event.data.type === "SYNC_CLERK_TOKEN") {
            chrome.storage.local.set({ clerk_token: event.data.token });
        }
    });

    // Detection logic with timeout for SPA websites (like LinkedIn)
    function checkAndInject() {
        const text = document.body.innerText.toLowerCase();
        const keywords = [
            'job description', 'responsibilities', 'qualifications',
            'requirements', 'what you will do', 'about the role',
            'minimum qualifications', 'preferred qualifications',
            'years of experience', 'equal opportunity employer',
            'apply now', 'skills', 'full-time', 'part-time', 'remote'
        ];
        
        let matchCount = 0;
        for (const kw of keywords) {
            if (text.includes(kw)) {
                matchCount++;
            }
        }
        
        // If we find at least 2 keywords, we assume it's a JD
        if (matchCount >= 2 && !document.getElementById('jd-reader-extension-root')) {
            injectWidget();
        }
    }

    // Check immediately and also after some delay for slower loading pages
    setTimeout(checkAndInject, 1000);
    setTimeout(checkAndInject, 3000);
    checkAndInject();

    // SPA Navigation Detection (For sites like LinkedIn where clicking a job changes the URL without reloading)
    let lastUrl = location.href;
    setInterval(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            
            // Remove the old widget if it's there
            const oldWidget = document.getElementById('jd-reader-extension-root');
            if (oldWidget) {
                oldWidget.remove();
            }
            
            // Wait for the new job text to render, then check
            setTimeout(checkAndInject, 1500);
            setTimeout(checkAndInject, 3500);
        }
    }, 1000);

    function injectWidget() {
        // Create root container
        const root = document.createElement('div');
        root.id = 'jd-reader-extension-root';
        
        // Widget HTML structure
        root.innerHTML = `
            <div class="jd-widget-container">
                <button class="jd-close-btn" id="jd-close" title="Dismiss">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                
                <div class="jd-header">
                    <div class="jd-logo">JD</div>
                    <div class="jd-title-group">
                        <h3 class="jd-title">Job Description Detected</h3>
                        <p class="jd-subtitle">Generate a tailored resume?</p>
                    </div>
                </div>
                
                <div class="jd-actions" id="jd-initial-actions">
                    <button class="jd-btn jd-btn-secondary" id="jd-btn-no">No Thanks</button>
                    <button class="jd-btn jd-btn-primary" id="jd-btn-yes">Yes, Tailor Resume</button>
                </div>
                
                <div class="jd-dropdown-container" id="jd-dropdown-section">
                    <div class="jd-select-wrapper">
                        <select class="jd-select" id="jd-resume-select">
                            <option value="" disabled selected>Select Base Resume</option>
                        </select>
                        <svg class="jd-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <button class="jd-generate-btn" id="jd-btn-generate" disabled>Generate Magic PDF ✨</button>
                </div>
                
                <div class="jd-loading-overlay" id="jd-loader">
                    <div class="jd-spinner"></div>
                    <div style="font-size: 13px; font-weight: 500;">Crafting perfect resume...</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(root);
        
        // Small delay to allow CSS transition to work
        setTimeout(() => {
            root.classList.add('jd-visible');
        }, 500);
        
        setupEventListeners(root);
    }
    
    function setupEventListeners(root) {
        const btnNo = root.querySelector('#jd-btn-no');
        const btnYes = root.querySelector('#jd-btn-yes');
        const btnClose = root.querySelector('#jd-close');
        const initialActions = root.querySelector('#jd-initial-actions');
        const dropdownSection = root.querySelector('#jd-dropdown-section');
        const selectElement = root.querySelector('#jd-resume-select');
        const btnGenerate = root.querySelector('#jd-btn-generate');
        const loader = root.querySelector('#jd-loader');
        
        let savedResumes = [];
        let jdText = "";
        
        // Dismiss widget
        const dismiss = () => {
            root.classList.remove('jd-visible');
            setTimeout(() => root.remove(), 600);
        };
        
        btnNo.addEventListener('click', dismiss);
        btnClose.addEventListener('click', dismiss);
        
        // Yes Clicked
        btnYes.addEventListener('click', () => {
            let extractedText = "";
            
            // AI-Heuristic DOM Extractor
            // Finds the container with the highest concentration of JD keywords and lowest number of HTML nodes.
            let bestNode = null;
            let maxScore = 0;
            
            const candidates = document.querySelectorAll('div, article, section, main');
            
            for (let el of candidates) {
                const text = el.innerText || "";
                // A typical JD is between 500 and 15000 characters.
                if (text.length > 300 && text.length < 20000) {
                    let score = text.length;
                    const lowerText = text.toLowerCase();
                    
                    // Bonus for JD specific sections
                    if (lowerText.includes('about the job')) score += 10000;
                    if (lowerText.includes('responsibilities')) score += 5000;
                    if (lowerText.includes('qualifications')) score += 5000;
                    if (lowerText.includes('requirements')) score += 5000;
                    
                    // Penalty for being a massive page wrapper (lots of child elements like navbars)
                    const childCount = el.querySelectorAll('*').length;
                    if (childCount > 0) {
                        score = score / Math.sqrt(childCount); // Penalize but don't over-penalize
                    }
                    
                    if (score > maxScore) {
                        maxScore = score;
                        bestNode = el;
                    }
                }
            }
            
            let pageTitle = document.title;
            
            if (bestNode) {
                extractedText = `--- PAGE TITLE (contains Company Name) ---\n${pageTitle}\n\n--- TARGETED JOB DESCRIPTION ---\n\n` + bestNode.innerText;
            } else {
                extractedText = `--- PAGE TITLE (contains Company Name) ---\n${pageTitle}\n\n--- FULL PAGE TEXT ---\n\n` + document.body.innerText;
            }
            
            jdText = extractedText.substring(0, 15000);
            
            // Save to local storage for the popup to read
            chrome.storage.local.set({ currentJD: jdText }, () => {
                // Change widget UI to instruct the user
                root.innerHTML = `
                    <div class="jd-widget-container" style="text-align: center; padding: 24px;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(0, 229, 255, 0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <h3 class="jd-title" style="margin-bottom: 8px;">JD Copied!</h3>
                        <p class="jd-subtitle" style="margin-bottom: 16px;">Open the extension (top right) to review and generate your resume.</p>
                        <button class="jd-btn jd-btn-secondary" id="jd-close-final">Dismiss</button>
                    </div>
                `;
                
                document.getElementById('jd-close-final').addEventListener('click', dismiss);
            });
        });
        
        // removed redundant handle select change and generate clicked handlers since we moved it to the popup.
    }
})();

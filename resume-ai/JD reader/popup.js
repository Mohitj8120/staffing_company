document.addEventListener('DOMContentLoaded', async () => {
    const authStatus = document.getElementById('auth-status');
    const authScreen = document.getElementById('auth-screen');
    const mainScreen = document.mainScreen || document.getElementById('main-screen');
    const loginBtn = document.getElementById('login-btn');
    const creditCount = document.getElementById('credit-count');
    const buyCreditsLink = document.getElementById('buy-credits-link');
    
    let authToken = null;
    let userCredits = 0;

    // Check Auth
    async function checkAuth() {
        // In a real prod extension, we would use chrome.cookies or Clerk Extension SDK
        // For demo, we check if the user has logged in to the dashboard via a mock cookie or storage
        // Here we just pretend they are authenticated if we find a token, otherwise show login screen
        chrome.storage.local.get(['clerk_token'], async (result) => {
            if (result.clerk_token) {
                authToken = result.clerk_token;
                // Verify with backend
                try {
                    const res = await fetch("http://localhost:8000/api/me", {
                        headers: { "Authorization": `Bearer ${authToken}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        userCredits = data.credits;
                        creditCount.innerText = data.subscription_status === 'pro' ? '∞' : userCredits;
                        showMainScreen();
                        return;
                    }
                } catch(e) {
                    console.error("Auth check failed", e);
                }
            }
            showAuthScreen();
        });
    }
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.clerk_token) {
            checkAuth();
        }
    });

    function showAuthScreen() {
        authStatus.innerText = "Not Authenticated";
        authStatus.classList.remove('authenticated');
        authScreen.classList.remove('hidden');
        if (mainScreen) mainScreen.classList.add('hidden');
    }

    function showMainScreen() {
        authStatus.innerText = "Connected";
        authStatus.classList.add('authenticated');
        authScreen.classList.add('hidden');
        if (mainScreen) mainScreen.classList.remove('hidden');
        loadResumes();
        loadJDData();
    }

    loginBtn.addEventListener('click', () => {
        window.open('http://localhost:5173/dashboard', '_blank');
        // Mock token for demo purposes (usually would be set by the dashboard via extension messaging)
        chrome.storage.local.set({clerk_token: "mock_demo_token_123"});
        setTimeout(checkAuth, 2000); // Check again after 2s
    });
    
    if (buyCreditsLink) {
        buyCreditsLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.open('http://localhost:5173/dashboard', '_blank');
        });
    }

    checkAuth();

    const uploadInput = document.getElementById('resume-upload');
    const dropZone = document.getElementById('drop-zone');
    const loader = document.getElementById('upload-loader');
    const resumeList = document.getElementById('resume-list');
    const emptyState = document.getElementById('empty-state');
    const toast = document.getElementById('toast');

    const jdTextarea = document.getElementById('jd-textarea');
    const jdResumeSelect = document.getElementById('jd-resume-select');
    const jdGenerateBtn = document.getElementById('generate-btn');
    const generateLoader = document.getElementById('generate-loader');
    
    // Tab switching logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
            
            if (btn.dataset.target === 'tab-jd') {
                loadJDData();
            }
        });
    });

    // Load saved resumes and JD
    loadResumes();
    loadJDData();

    // JD Select change
    jdResumeSelect.addEventListener('change', () => {
        jdGenerateBtn.disabled = !jdResumeSelect.value || !jdTextarea.value.trim();
    });

    jdTextarea.addEventListener('input', () => {
        jdGenerateBtn.disabled = !jdResumeSelect.value || !jdTextarea.value.trim();
    });

    jdGenerateBtn.addEventListener('click', async () => {
        const selectedId = jdResumeSelect.value;
        const jdText = jdTextarea.value.trim();
        
        if (!selectedId || !jdText) return;
        
        generateLoader.classList.remove('hidden');
        
        chrome.storage.local.get(['resumes'], (result) => {
            const resumes = result.resumes || [];
            const selectedResume = resumes.find(r => r.id === selectedId);
            
            if (!selectedResume) {
                showToast('Resume data not found', true);
                generateLoader.classList.add('hidden');
                return;
            }
            
            const selectedMode = document.querySelector('input[name="gen-mode"]:checked').value;
            const pageCount = document.querySelector('input[name="page-count"]:checked').value;
            
            // Send to background script
            chrome.runtime.sendMessage({
                action: "optimizeResume",
                payload: {
                    file_id: selectedResume.id,
                    jd: jdText,
                    resume_data: selectedResume.data,
                    mode: selectedMode,
                    page_count: pageCount,
                    auth_token: authToken
                }
            }, (response) => {
                generateLoader.classList.add('hidden');
                if (response && response.success) {
                    showToast('Process started! Check notifications.');
                } else {
                    showToast("Error starting process.", true);
                }
            });
        });
    });

    function loadJDData() {
        chrome.storage.local.get(['currentJD', 'resumes'], (result) => {
            if (result.currentJD) {
                jdTextarea.value = result.currentJD;
            }
            
            const resumes = result.resumes || [];
            jdResumeSelect.innerHTML = '<option value="" disabled selected>Select Base Resume</option>';
            resumes.forEach(resume => {
                const option = document.createElement('option');
                option.value = resume.id;
                option.textContent = resume.title;
                jdResumeSelect.appendChild(option);
            });
            
            jdGenerateBtn.disabled = !jdResumeSelect.value || !jdTextarea.value.trim();
        });
    }

    // Trigger file input on click
    dropZone.addEventListener('click', () => {
        uploadInput.click();
    });

    uploadInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            await handleFileUpload(e.target.files[0]);
            uploadInput.value = ''; // reset
        }
    });

    async function handleFileUpload(file) {
        if (!file.name.endsWith('.docx') && !file.name.toLowerCase().endsWith('.pdf')) {
            showToast('Only DOCX and PDF allowed', true);
            return;
        }

        loader.classList.remove('hidden');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/upload', {
                method: 'POST',
                headers: { "Authorization": `Bearer ${authToken}` },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            
            if (result.status === 'success') {
                saveResume(file.name, result.file_id, result.data);
                showToast('Resume added successfully');
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error(error);
            showToast('Error connecting to backend', true);
        } finally {
            loader.classList.add('hidden');
        }
    }

    function saveResume(filename, file_id, data) {
        chrome.storage.local.get(['resumes'], (result) => {
            const resumes = result.resumes || [];
            
            // Generate a cool title based on data if possible, else filename
            let title = filename;
            if (data && data.personal && data.personal.title) {
                title = data.personal.name ? `${data.personal.name} - ${data.personal.title}` : data.personal.title;
            }

            const newResume = {
                id: file_id,
                filename: filename,
                title: title,
                date: new Date().toLocaleDateString(),
                data: JSON.stringify(data)
            };
            
            resumes.push(newResume);
            chrome.storage.local.set({ resumes: resumes }, () => {
                renderResumes(resumes);
            });
        });
    }

    function loadResumes() {
        chrome.storage.local.get(['resumes'], (result) => {
            const resumes = result.resumes || [];
            renderResumes(resumes);
        });
    }

    function renderResumes(resumes) {
        resumeList.innerHTML = '';
        
        if (resumes.length === 0) {
            emptyState.classList.add('visible');
            return;
        }
        
        emptyState.classList.remove('visible');

        resumes.forEach(resume => {
            const card = document.createElement('div');
            card.className = 'resume-card';
            
            card.innerHTML = `
                <div class="card-info">
                    <div class="card-title">${resume.title}</div>
                    <div class="card-date">Added ${resume.date}</div>
                </div>
                <button class="delete-btn" data-id="${resume.id}" title="Remove">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            `;

            // 3D Tilt Effect
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });

            // Delete functionality
            const deleteBtn = card.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteResume(resume.id);
            });

            resumeList.appendChild(card);
        });
    }

    function deleteResume(id) {
        chrome.storage.local.get(['resumes'], (result) => {
            let resumes = result.resumes || [];
            resumes = resumes.filter(r => r.id !== id);
            chrome.storage.local.set({ resumes: resumes }, () => {
                renderResumes(resumes);
                showToast('Resume removed');
            });
        });
    }

    function showToast(message, isError = false) {
        toast.textContent = message;
        if (isError) {
            toast.classList.add('error');
        } else {
            toast.classList.remove('error');
        }
        
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Pricing Plan CTA click listeners
    const pricingButtons = ['btn-free', 'btn-starter', 'btn-pro', 'btn-apex'];
    pricingButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                window.open('http://localhost:5173/dashboard', '_blank');
            });
        }
    });
});

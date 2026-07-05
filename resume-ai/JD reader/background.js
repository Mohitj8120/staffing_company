chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "optimizeResume") {
        
        // Show notification that work has started in the background
        chrome.notifications.create({
            type: "basic",
            iconUrl: "assets/icon48.png", // fallback or default
            title: "Resume AI ✨",
            message: "Magic started! We are crafting your perfect resume in the background. You can close the extension."
        });

        // Send immediate response so the popup doesn't wait (which causes channel closed errors)
        sendResponse({ success: true, message: "Started" });
        
        // Run optimization in background
        handleOptimizeRequest(request.payload).catch(e => console.error(e));
        
        return false; // Synchronous response
    }
});

async function handleOptimizeRequest({ file_id, jd, resume_data, mode, page_count, auth_token }) {
    const formData = new FormData();
    formData.append('file_id', file_id);
    formData.append('jd', jd);
    formData.append('resume_data', resume_data); // JSON string
    formData.append('mode', mode || 'standard');
    formData.append('page_count', page_count || 'auto');

    try {
        const response = await fetch('http://localhost:8000/api/optimize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth_token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status === 'success' && result.pdf_url) {
            // Trigger download
            const downloadUrl = `http://localhost:8000${result.pdf_url}`;
            const companyName = result.company_name || "TargetCompany";
            
            // Format the directory/filename properly (Chrome downloads API supports relative paths to create folders)
            const safeCompanyName = companyName.replace(/[^a-zA-Z0-9\s_-]/g, '').trim();
            
            const candidateName = (result.optimized_data && result.optimized_data.personal && result.optimized_data.personal.name) 
                                  ? result.optimized_data.personal.name.replace(/[^a-zA-Z0-9\s_-]/g, '').trim().replace(/\s+/g, '-') 
                                  : "Candidate";
                                  
            const filenamePath = `${safeCompanyName}/${candidateName}-Resume.pdf`;
            
            chrome.downloads.download({
                url: downloadUrl,
                filename: filenamePath,
                saveAs: true // Show the save window so the user sees where it is saving
            });

            // Notify user of completion
            chrome.notifications.create({
                type: "basic",
                iconUrl: "assets/icon48.png",
                title: "Resume AI ✨",
                message: `Magic Complete! Your resume has been saved in the "${safeCompanyName}" folder.`
            });

            return result;
        } else {
            throw new Error('Failed to generate PDF URL');
        }
    } catch (error) {
        console.error("Optimization failed:", error);
        
        chrome.notifications.create({
            type: "basic",
            iconUrl: "assets/icon48.png",
            title: "Resume AI Error",
            message: "Oops! Something went wrong while generating your resume: " + error.message
        });

        throw error;
    }
}

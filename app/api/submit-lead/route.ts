import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // Destructure the data coming from the LeadCapturePopup
        const { name, email, phone, visa } = body;

        // Validation barrier
        if (!name || !email || !phone || !visa) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        console.log("New Lead Captured:", { name, email, phone, visa });

        // ==========================================
        // GOOGLE SHEETS INTEGRATION (WEBHOOK)
        // ==========================================
        // To connect this to your Google Sheet:
        // 1. Open your Google Sheet -> Extensions -> Apps Script
        // 2. Paste the provided Apps Script (check walkthrough.md)
        // 3. Deploy as Web App -> Anyone
        // 4. Paste the URL below:
        
        const GOOGLE_SCRIPT_WEBHOOK_URL = process.env.GOOGLE_SCRIPT_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbwkqzLATwvi9hnoH7xD-sKYbgJLZYWUDMV0q6mNCjK_H8-ZG3AOuUHY1QYDty_YDrvr/exec";

        if (GOOGLE_SCRIPT_WEBHOOK_URL) {
            try {
                // Forward the data to Google Sheets
                await fetch(GOOGLE_SCRIPT_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        visa,
                        timestamp: new Date().toISOString()
                    }),
                    // Adding no-cors or catching errors in case of CORS issues from Apps Script
                });
            } catch (fetchError) {
                console.error("Failed to forward to Google Sheets script:", fetchError);
                // We still return 200 so the user isn't stuck on the popup if the sheet webhook is down/missing
            }
        } else {
            console.warn("GOOGLE_SCRIPT_WEBHOOK_URL is not configured. Saving lead in server logs only for now.");
        }

        // Return success response to the client closing the popup
        return NextResponse.json({ success: true, message: "Lead submitted successfully." }, { status: 200 });

    } catch (error) {
        console.error("Error processing lead submission:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

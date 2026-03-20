"use client"

import LegalContent from "./LegalContent"

export default function PrivacyContent() {
    return (
        <LegalContent title="Privacy Policy" lastUpdated="March 20, 2026">
            <h2>1. Information We Collect</h2>
            <p>
                We collect information you provide directly to us, including:
            </p>
            <ul>
                <li>Personal identification (Name, Email, Phone).</li>
                <li>Professional history (Resumes, LinkedIn profiles, Portfolios).</li>
                <li>Interview data (Captured audio/video from sessions used for AI processing).</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>
                Your data is used to:
            </p>
            <ul>
                <li>Connect you with potential employers via our HR tie-ups.</li>
                <li>Optimize your resume for specific job descriptions.</li>
                <li>Provide real-time AI assistance during interviews via the Proxy Tool.</li>
                <li>Improve our AI models for better placement outcomes.</li>
            </ul>

            <h2>3. Data Stealth & Security</h2>
            <p>
                We prioritize your career's safety. Our Proxy Tool is designed with "Invisible Tech" to ensure that your use of our assistance remains private. 
            </p>
            <p>
                We do not sell your personal data to third-party advertisers. Your resumes are only shared with hiring managers and partners within our vetted HR network.
            </p>

            <h2>4. Data Retention</h2>
            <p>
                We retain your professional data as long as your account is active or as needed to provide you with placement services. You may request the deletion of your data at any time by contacting our support team.
            </p>

            <h2>5. Your Rights</h2>
            <p>
                You have the right to access, correct, or delete your personal information. If you are a resident of the EEA or California, you have specific additional rights under GDPR and CCPA respectively.
            </p>
        </LegalContent>
    )
}

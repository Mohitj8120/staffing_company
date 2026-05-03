"use client"

import LegalContent from "./LegalContent"

export default function CookiesContent() {
    return (
        <LegalContent title="Cookies Policy" lastUpdated="March 20, 2026">
            <h2>1. What are Cookies?</h2>
            <p>
                Cookies are small text files stored on your device when you visit a website. They help the site recognize your device and remember information about your visit.
            </p>

            <h2>2. How Averion Group Uses Cookies</h2>
            <p>
                We use cookies for the following purposes:
            </p>
            <ul>
                <li><strong>Authentication</strong>: To keep you logged in while you use our career dashboard.</li>
                <li><strong>Session Management</strong>: To manage your AI Proxy Tool credits during active interview sessions.</li>
                <li><strong>Analytics</strong>: To understand how users interact with our site and improve our placement conversion rates.</li>
            </ul>

            <h2>3. Types of Cookies We Use</h2>
            <h3>Essential Cookies</h3>
            <p>Necessary for the website to function. They cannot be switched off in our systems.</p>
            
            <h3>Performance Cookies</h3>
            <p>Used to count visits and traffic sources so we can measure and improve the performance of our site.</p>

            <h2>4. Managing Your Preferences</h2>
            <p>
                You can set your browser to block or alert you about these cookies, but some parts of the site will not then work. Most web browsers allow some control of most cookies through the browser settings.
            </p>
        </LegalContent>
    )
}

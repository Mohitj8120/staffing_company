import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import MobileToDesktopPrompt from "../src/components/MobileToDesktopPrompt";
import LeadCapturePopup from "../src/components/LeadCapturePopup";
import AuthProvider from "../src/components/AuthProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Averion Group | Premium Support",
  description: "Averion Group Staffing Solutions",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} bg-slate-50`}>
        <AuthProvider>
          {/* Google Analytics Tag */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-ZDSWZS7Z99"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-ZDSWZS7Z99');
            `}
          </Script>
          <LeadCapturePopup />
          <MobileToDesktopPrompt />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

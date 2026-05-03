import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import MobileToDesktopPrompt from "../src/components/MobileToDesktopPrompt";
import LeadCapturePopup from "../src/components/LeadCapturePopup";

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
        <LeadCapturePopup />
        <MobileToDesktopPrompt />
        {children}
      </body>
    </html>
  );
}

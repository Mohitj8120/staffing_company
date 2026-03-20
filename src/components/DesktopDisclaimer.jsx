"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function DesktopDisclaimer() {
  const [showPrompt, setShowPrompt] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    // Detect mobile device
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobileDevice) {
      if (!sessionStorage.getItem("desktopModeEnforced")) {
        setShowPrompt(true);
        // Prevent scrolling when popup is open
        document.body.style.overflow = "hidden";
      } else {
        // If already enforced and user navigates, we must re-apply the viewport 
        // because Next.js re-renders the head tag on page transitions.
        applyViewportOverride();
      }
    }
  }, [pathname]);

  const applyViewportOverride = () => {
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = "viewport";
      document.head.appendChild(viewportMeta);
    }
    // Force a 900px width which triggers the desktop/tablet layout but remains legible
    viewportMeta.setAttribute('content', 'width=900, initial-scale=0.1, maximum-scale=5.0, user-scalable=yes');
    console.log("Desktop mode override re-applied on route change.");
  };

  const enforceDesktopMode = () => {
    setShowPrompt(false);
    sessionStorage.setItem("desktopModeEnforced", "true");
    
    // Restore scrolling
    document.body.style.overflow = "auto";

    applyViewportOverride();
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-xl flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-white rounded-3xl p-8 md:p-10 w-full max-w-sm text-center shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-white/20 relative"
          >
            {/* Animated Icon */}
            <motion.div 
               animate={{ rotate: [0, -10, 10, -10, 0] }}
               transition={{ duration: 1, delay: 0.5, ease: "easeInOut", repeat: 3 }}
               className="w-20 h-20 bg-linear-to-tr from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg"
            >
              💻
            </motion.div>
            
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
              Desktop Mode
            </h2>
            
            <p className="text-gray-600 mb-8 font-medium leading-relaxed">
              Convert to desktop mode for the best viewing experience on your device.
            </p>
            
            {/* Single Action Button exactly as requested */}
            <button
              onClick={enforceDesktopMode}
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-lg py-4 rounded-2xl shadow-xl shadow-purple-500/30 hover:scale-[1.03] active:scale-95 transition-all outline-none"
            >
              OK
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

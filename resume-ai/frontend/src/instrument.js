import * as Sentry from "@sentry/react";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Performance Monitoring: sample 10% of transactions in production to keep free quota safe
    tracesSampleRate: 0.1,
    
    // Session Replay settings
    replaysSessionSampleRate: 0.1, // Sample 10% of standard sessions
    replaysOnErrorSampleRate: 1.0, // If user experiences an error, record 100% of that session to trace bugs
    
    environment: import.meta.env.MODE || "development",
  });
  console.log("Sentry React SDK initialized successfully!");
}

const appInsights = require('applicationinsights');

/**
 * Initializes and configures Azure Application Insights.
 * Best practice: Call this as early as possible in your entry point.
 */
const initAppInsights = () => {
    // Check if connection string exists
    const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

    if (!connectionString) {
        console.warn('[Monitoring] APPLICATIONINSIGHTS_CONNECTION_STRING not found. Telemetry disabled.');
        return;
    }

    try {
        appInsights.setup(connectionString)
            .setAutoCollectRequests(true)
            .setAutoCollectPerformance(true, true)
            .setAutoCollectExceptions(true)
            .setAutoCollectDependencies(true)
            .setAutoCollectConsole(true, true) // IMPORTANT: This redirects console & winston to App Insights Traces
            .setSendLiveMetrics(true)
            .start();

        console.log('[Monitoring] Application Insights initialized successfully.');
    } catch (error) {
        console.error('[Monitoring] Failed to initialize Application Insights:', error.message);
    }
};

module.exports = {
    initAppInsights,
    appInsights // Export the SDK object just in case we need custom tracking
};

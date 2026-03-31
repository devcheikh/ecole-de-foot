/**
 * Avenir de Thiawlene - Site Analytics & Tracking
 * Captures page views and user engagement
 */

(function() {
    document.addEventListener('DOMContentLoaded', async () => {
        // --- Configuration ---
        const TRACKING_TABLE = 'site_tracking';
        
        // --- Helpers ---
        function getDeviceType() {
            const ua = navigator.userAgent;
            if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
            if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile";
            return "Desktop";
        }

        function getBrowser() {
            const ua = navigator.userAgent;
            if (ua.indexOf("Firefox") > -1) return "Firefox";
            if (ua.indexOf("SamsungBrowser") > -1) return "Samsung Browser";
            if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) return "Opera";
            if (ua.indexOf("Trident") > -1) return "Internet Explorer";
            if (ua.indexOf("Edge") > -1) return "Edge";
            if (ua.indexOf("Chrome") > -1) return "Chrome";
            if (ua.indexOf("Safari") > -1) return "Safari";
            return "Unknown";
        }

        // --- Session Management ---
        let sessionId = sessionStorage.getItem('adt_session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            sessionStorage.setItem('adt_session_id', sessionId);
        }

        // --- Tracking Data ---
        const trackingData = {
            page_path: window.location.pathname.split('/').pop() || 'index.html',
            referrer: document.referrer ? new URL(document.referrer).hostname : 'Direct',
            device_type: getDeviceType(),
            browser: getBrowser(),
            screen_size: `${window.innerWidth}x${window.innerHeight}`,
            session_id: sessionId
        };

        // --- Send to Supabase ---
        try {
            if (typeof supabaseClient !== 'undefined') {
                const { error } = await supabaseClient
                    .from(TRACKING_TABLE)
                    .insert([trackingData]);
                
                if (error) console.warn('Tracking error:', error.message);
                else console.log('✓ Visit tracked');
            } else {
                console.warn('Supabase client not loaded, tracking skipped.');
            }
        } catch (e) {
            console.error('Tracking fatal error:', e);
        }
    });
})();

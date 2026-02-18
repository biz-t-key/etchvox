/**
 * Etchvox Integrated Tracking Utility
 * Standardized for professional auditing of device performance, funnel conversion, and attribution.
 */

export type EvStep = string;
export type EvEventName =
    | 'consent_view'
    | 'mic_access'
    | 'analysis_start'
    | 'analysis_error'
    | 'nebula_success'
    | 'offer_impression'
    | 'checkout_intent'
    | 'purchase_complete'
    | 'card_download'
    | 'share_click'
    | 'error_boundary';

interface EvExtra {
    status?: 'granted' | 'denied' | 'success' | 'fail';
    error_detail?: string;
    plan_type?: string;
    plan_id?: string;
    price?: number;
    revenue?: number;
    platform?: string; // For share_click
    [key: string]: any;
}

declare global {
    interface Window {
        dataLayer: any[];
        __ETCHVOX_ENTRANCE_ID__?: string;
    }
}

export const trackEv = (step: EvStep, name: EvEventName, extra: EvExtra = {}) => {
    if (typeof window === 'undefined') return;

    try {
        // 1. Entrance ID persistence (First-touch priority)
        let entranceId = localStorage.getItem('ev_entrance_id');

        // If a new entrance ID is provided via window (from URL/Middleware/Server Script), 
        // we use it. If not, fallback to stored.
        if (window.__ETCHVOX_ENTRANCE_ID__) {
            entranceId = window.__ETCHVOX_ENTRANCE_ID__;
            localStorage.setItem('ev_entrance_id', entranceId);
        } else if (!entranceId) {
            entranceId = 'direct'; // Default fallback
        }

        // 2. Device Spec (Critical for Wasm performance analysis)
        // Some properties might be unavailable in certain browsers or non-secure contexts
        const device: any = {
            user_agent: navigator.userAgent,
            cpu_cores: navigator.hardwareConcurrency || 'unknown',
        };

        // navigator.deviceMemory is available in Chrome/Edge (Secure Contexts)
        if ('deviceMemory' in navigator) {
            device.device_memory = (navigator as any).deviceMemory;
        }

        // 3. GTM DataLayer Push
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'etchvox_event',
            ev_data: {
                entrance_id: entranceId,
                step_number: step,
                step_name: name,
                device,
                ...extra
            }
        });

        if (process.env.NODE_ENV === 'development') {
            console.log(`[TrackEV] ${step} | ${name}`, extra);
        }
    } catch (err) {
        console.error('Tracking Error:', err);
    }
};

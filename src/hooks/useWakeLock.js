// src/hooks/useWakeLock.js
import { useEffect, useRef } from 'react';

/**
 * Requests a screen wake lock while `active` is true.
 * Automatically releases on unmount, when `active` becomes false,
 * or when the tab is hidden (re-acquires on visibility restore).
 */
export default function useWakeLock(active) {
  const wakeLockRef = useRef(null);

  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;

    let released = false;

    const requestLock = async () => {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      } catch {
        // Silently fail (low battery, unsupported, etc.)
      }
    };

    const handleVisibility = () => {
      if (released) return;
      if (document.visibilityState === 'visible') {
        requestLock();
      }
    };

    requestLock();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      released = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [active]);
}

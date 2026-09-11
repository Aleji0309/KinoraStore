import { useEffect, useEffectEvent, useState } from "react";
export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
export const INACTIVITY_WARNING_MS = 28 * 60 * 1000;
// Mount only in AdminPage. Token refreshes must not reset the inactivity period.
export default function useInactivityLogout(sessionKey, onLogout) {
  const [warning, setWarning] = useState(false);
  const logout = useEffectEvent(onLogout);
  useEffect(() => {
    if (!sessionKey) return;
    let lastActivity = Date.now();
    let timer;
    let expired = false;
    const check = () => {
      clearTimeout(timer);
      const elapsed = Date.now() - lastActivity;
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        expired = true;
        setWarning(false);
        void logout();
      } else {
        setWarning(elapsed >= INACTIVITY_WARNING_MS);
        timer = setTimeout(check, (elapsed >= INACTIVITY_WARNING_MS ? INACTIVITY_TIMEOUT_MS : INACTIVITY_WARNING_MS) - elapsed);
      }
    };
    const activity = () => {
      if (expired) return;
      // Check the deadline first, including after a suspended/background tab resumes.
      if (Date.now() - lastActivity >= INACTIVITY_TIMEOUT_MS) { check(); return; }
      lastActivity = Date.now();
      setWarning(false);
      clearTimeout(timer);
      timer = setTimeout(check, INACTIVITY_WARNING_MS);
    };
    const resume = () => { if (!expired) check(); };
    const events = ["mousemove", "mousedown", "click", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, activity, { passive: true, capture: true }));
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("focus", resume);
    timer = setTimeout(check, 0);
    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, activity, true));
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("focus", resume);
    };
  }, [sessionKey]);
  return Boolean(sessionKey) && warning;
}

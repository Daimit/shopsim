import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { tracker } from '../lib/tracker';

export function useTrackEvent() {
  const location = useLocation();

  const trackEvent = useCallback((
    eventType: string,
    target?: string,
    details?: Record<string, any>
  ) => {
    return tracker.track(
      eventType,
      target,
      details,
      location.pathname + location.search
    );
  }, [location.pathname, location.search]);

  return { trackEvent };
}

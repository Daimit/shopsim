import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { tracker } from '../../lib/tracker';
import { useSessionStore } from '../../store/sessionStore';

interface EventContextType {
  sessionId: string;
}

const EventContext = createContext<EventContextType>({ sessionId: '' });

export const useEventContext = () => useContext(EventContext);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const initSession = useSessionStore(state => state.initSession);
  const setActiveTask = useSessionStore(state => state.setActiveTask);
  const [sessionReady, setSessionReady] = useState(false);

  // Initialize session and tracker
  useEffect(() => {
    let cancelled = false;
    tracker.init();
    void initSession().then(() => {
      if (cancelled) return;
      setSessionReady(true);

      const params = new URLSearchParams(location.search);
      const taskParam = params.get('task');
      if (taskParam) {
        const taskNum = parseInt(taskParam, 10);
        if (!isNaN(taskNum) && taskNum >= 1 && taskNum <= 5) {
          setActiveTask(taskNum);
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Track page_view on route or search change
  useEffect(() => {
    if (!sessionReady) return;
    const page = location.pathname + location.search;
    tracker.track('page_view', 'route_navigation', {
      pathname: location.pathname,
      search: location.search,
      title: document.title,
    }, page);
  }, [location.pathname, location.search, sessionReady]);

  // Global click event listener
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Find closest interactive or meaningful element
      const interactiveEl = target.closest('button, a, input, select, textarea, [role="button"], [data-track]');
      const el = (interactiveEl || target) as HTMLElement;

      const tag = el.tagName?.toLowerCase();
      const text = (el.textContent || '').trim().slice(0, 50);
      const id = el.id || undefined;
      const role = el.getAttribute('role') || undefined;
      const ariaLabel = el.getAttribute('aria-label') || undefined;
      const href = el.getAttribute('href') || undefined;
      const trackId = el.getAttribute('data-track') || undefined;

      // Skip generic body or root container clicks
      if (['html', 'body', 'root'].includes(tag) && !id) return;

      const targetIdentifier = trackId || id || ariaLabel || (text ? `${tag}:${text}` : tag);

      tracker.track('click', targetIdentifier, {
        tag,
        text,
        id,
        role,
        ariaLabel,
        href,
        x: event.clientX,
        y: event.clientY,
      });
    };

    document.addEventListener('click', handleGlobalClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, []);

  return (
    <EventContext.Provider value={{ sessionId: tracker.getSessionId() }}>
      {children}
    </EventContext.Provider>
  );
};

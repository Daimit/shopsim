import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { tracker } from '../../lib/tracker';
import { useSessionStore } from '../../store/sessionStore';
import { useAuthStore } from '../../store/authStore';

interface EventContextType {
  sessionId: string;
}

const EventContext = createContext<EventContextType>({ sessionId: '' });

export const useEventContext = () => useContext(EventContext);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { initSession, setActiveTask, completeSession } = useSessionStore();
  const [sessionReady, setSessionReady] = useState(false);

  // Initialize session and tracker
  useEffect(() => {
    tracker.init();
    const participantLabel = user
      ? `${user.name || user.email.split('@')[0]} (${user.role})`
      : undefined;

    initSession(participantLabel, 'Standard_Usability_Study').then(() => {
      setSessionReady(true);
      tracker.track('session_start', 'app_mount', {
        participant: participantLabel || 'guest',
      });
    });
  }, [user?.id]);

  // Track page_view on route or search change
  useEffect(() => {
    if (!sessionReady) return;
    tracker.track('page_view', 'route_navigation', {
      path: location.pathname,
      search: location.search,
    });
    if (location.pathname.includes('/checkout/success')) {
      completeSession();
    }
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

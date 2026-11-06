import { InteractionEvent } from '../types';
import { api } from './api';

class EventTracker {
  private sessionId: string;
  private sequenceNum: number = 0;
  private buffer: InteractionEvent[] = [];
  private flushTimer: any = null;
  private flushIntervalMs = 5000;
  private maxBufferSize = 10;
  private isInitialized = false;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.sequenceNum = this.getStoredSequence();
  }

  private getOrCreateSessionId(): string {
    let id = sessionStorage.getItem('shopsim_session_id');
    if (!id) {
      id = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      sessionStorage.setItem('shopsim_session_id', id);
    }
    return id;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public setSessionId(newId: string): void {
    const oldId = this.sessionId;
    this.sessionId = newId;
    sessionStorage.setItem('shopsim_session_id', newId);

    // Re-bind any early buffered events from temporary 'sess_...' ID to the real DB session ID
    if (this.buffer.length > 0 && oldId !== newId) {
      this.buffer = this.buffer.map((ev) => ({
        ...ev,
        sessionId: newId,
      }));
      void this.flush();
    }
  }

  private getStoredSequence(): number {
    const seq = sessionStorage.getItem('shopsim_seq_num');
    return seq ? parseInt(seq, 10) : 0;
  }

  private incrementSequence(): number {
    this.sequenceNum += 1;
    sessionStorage.setItem('shopsim_seq_num', this.sequenceNum.toString());
    return this.sequenceNum;
  }

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Start recurring flush
    this.startFlushTimer();

    // Attach flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushSync();
    });
    window.addEventListener('pagehide', () => {
      this.flushSync();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushSync();
      }
    });
  }

  private startFlushTimer() {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush();
      }
    }, this.flushIntervalMs);
  }

  public track(
    eventType: string,
    target?: string,
    details?: Record<string, any>,
    page?: string
  ): InteractionEvent {
    const currentSessionId =
      sessionStorage.getItem('shopsim_session_id') || this.sessionId;
    this.sessionId = currentSessionId;

    const event: InteractionEvent = {
      sessionId: currentSessionId,
      timestamp: new Date().toISOString(),
      eventType,
      target: target || undefined,
      page: page || window.location.pathname,
      details: details || undefined,
      sequenceNum: this.incrementSequence(),
    };

    this.buffer.push(event);
    this.saveToLocalHistory(event);

    // Immediately flush on cart, promo, task, or checkout actions so Admin updates instantly
    const immediateFlushEvents = [
      'cart_add',
      'cart_remove',
      'quantity_change',
      'discount_apply',
      'discount_remove',
      'checkout_step',
      'checkout_complete',
      'task_complete',
      'task_abandon',
      'form_error',
      'checkout_error',
      'coupon_error',
    ];

    if (
      this.buffer.length >= this.maxBufferSize ||
      immediateFlushEvents.includes(eventType)
    ) {
      this.flush();
    }

    return event;
  }

  private saveToLocalHistory(event: InteractionEvent) {
    try {
      const historyStr = sessionStorage.getItem('shopsim_event_history');
      const history: InteractionEvent[] = historyStr ? JSON.parse(historyStr) : [];
      history.push(event);
      if (history.length > 200) history.shift();
      sessionStorage.setItem('shopsim_event_history', JSON.stringify(history));
    } catch {
      // ignore storage errors
    }
  }

  public getLocalEventHistory(): InteractionEvent[] {
    try {
      const historyStr = sessionStorage.getItem('shopsim_event_history');
      return historyStr ? JSON.parse(historyStr) : [];
    } catch {
      return [];
    }
  }

  public async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const eventsToSend = [...this.buffer];
    this.buffer = [];

    try {
      const sent = await api.sendEvents(eventsToSend);
      if (!sent) {
        throw new Error('Event submission was not acknowledged');
      }
    } catch {
      // Re-queue events if network error occurs (prevent excessive memory)
      if (this.buffer.length < 50) {
        this.buffer = [...eventsToSend, ...this.buffer];
      }
    }
  }

  private flushSync(): void {
    if (this.buffer.length === 0) return;
    try {
      const payload = JSON.stringify({ events: this.buffer });
      navigator.sendBeacon?.('/api/events', new Blob([payload], { type: 'application/json' }));
      this.buffer = [];
    } catch {
      // fallback
    }
  }
}

export const tracker = new EventTracker();

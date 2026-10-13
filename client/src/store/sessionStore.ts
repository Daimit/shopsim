import { create } from 'zustand';
import { TestSession } from '../types';
import { tracker } from '../lib/tracker';
import { api } from '../lib/api';

export interface TaskDefinition {
  id: string;
  taskNumber: number;
  title: string;
  instruction: string;
}

export const STUDY_TASKS: TaskDefinition[] = [
  {
    id: 'task_1',
    taskNumber: 1,
    title: 'Search & Buy Headphones',
    instruction: "Search for 'wireless headphones', pick the first result, and complete the purchase."
  },
  {
    id: 'task_2',
    taskNumber: 2,
    title: 'Filter Sub-$1000 Laptop',
    instruction: "Browse Electronics and find a laptop under $1000 with 4+ stars. Add it to your cart."
  },
  {
    id: 'task_3',
    taskNumber: 3,
    title: 'Compare Flagship Phones',
    instruction: "Find the 'Galaxy S24' and compare it with the 'iPhone 15'. Add your preference to cart."
  },
  {
    id: 'task_4',
    taskNumber: 4,
    title: 'Quantity & Promo Code',
    instruction: "Change the quantity to 3 units and apply discount code 'SAVE20'."
  },
  {
    id: 'task_5',
    taskNumber: 5,
    title: 'Complete Checkout',
    instruction: "Complete the checkout process with any shipping details."
  }
];

interface SessionState {
  session: TestSession | null;
  activeTaskId: string | null;
  activeTaskNumber: number | null;
  isBannerDismissed: boolean;
  initSession: (participantId?: string, scenarioId?: string) => Promise<void>;
  setActiveTask: (taskNumber: number | null) => void;
  dismissBanner: () => void;
  showBanner: () => void;
  completeTask: (taskId: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  activeTaskId: null,
  activeTaskNumber: null,
  isBannerDismissed: false,

  initSession: async (participantId = 'P_' + Math.floor(100 + Math.random() * 900), scenarioId = 'Standard_Usability_Study') => {
    let stored = sessionStorage.getItem('shopsim_test_session');
    let session: TestSession;

    if (stored) {
      try {
        session = JSON.parse(stored);
        tracker.setSessionId(session.id);
      } catch {
        session = await api.createSession({
          participantId,
          scenarioId,
          userAgent: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`
        });
      }
    } else {
      session = await api.createSession({
        participantId,
        scenarioId,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`
      });
      sessionStorage.setItem('shopsim_test_session', JSON.stringify(session));
      tracker.setSessionId(session.id);
    }

    set({ session });
  },

  setActiveTask: (taskNumber: number | null) => {
    if (taskNumber === null) {
      set({ activeTaskId: null, activeTaskNumber: null });
      return;
    }
    const found = STUDY_TASKS.find(t => t.taskNumber === taskNumber);
    if (found) {
      sessionStorage.setItem('shopsim_current_task', found.taskNumber.toString());
      tracker.track('task_started', `task_${found.taskNumber}`, {
        taskNumber: found.taskNumber,
        instruction: found.instruction
      });
      set({ activeTaskId: found.id, activeTaskNumber: found.taskNumber, isBannerDismissed: false });
    }
  },

  dismissBanner: () => {
    set({ isBannerDismissed: true });
  },

  showBanner: () => {
    set({ isBannerDismissed: false });
  },

  completeTask: async (taskId: string) => {
    const { session } = get();
    tracker.track('task_completed', taskId, { taskId });
    if (session) {
      await api.updateTaskProgress(session.id, taskId, 'completed');
    }
  }
}));

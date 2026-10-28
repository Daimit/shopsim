import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

const safeJsonParse = (str: string | null | undefined, fallback: any = null) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

// GET /api/admin/sessions - List all test sessions with stats
router.get('/sessions', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await prisma.testSession.findMany({
      orderBy: { startedAt: 'desc' },
      include: {
        _count: {
          select: {
            events: true,
            taskProgress: true,
          },
        },
        taskProgress: true,
      },
    });

    const sessionsWithStats = sessions.map((s) => {
      const completedTasks = s.taskProgress.filter((t) => t.status === 'completed').length;
      const durationSeconds = s.endedAt
        ? Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 1000)
        : null;

      return {
        id: s.id,
        participantId: s.participantId,
        scenarioId: s.scenarioId,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        completed: s.completed,
        userAgent: s.userAgent,
        screenSize: s.screenSize,
        eventCount: s._count.events,
        taskCount: s._count.taskProgress,
        completedTaskCount: completedTasks,
        durationSeconds,
      };
    });

    res.json({
      success: true,
      data: sessionsWithStats,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/metrics - Aggregate metrics
router.get('/metrics', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const totalSessions = await prisma.testSession.count();
    const completedSessions = await prisma.testSession.count({
      where: { completed: true },
    });

    const finishedSessions = await prisma.testSession.findMany({
      where: {
        completed: true,
        endedAt: { not: null },
      },
      select: {
        startedAt: true,
        endedAt: true,
      },
    });

    let avgCompletionTimeSeconds = 0;
    if (finishedSessions.length > 0) {
      const totalDuration = finishedSessions.reduce((sum, s) => {
        if (!s.endedAt) return sum;
        return sum + (new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 1000;
      }, 0);
      avgCompletionTimeSeconds = Math.round(totalDuration / finishedSessions.length);
    }

    // Common error events
    const errorEvents = await prisma.interactionEvent.findMany({
      where: {
        eventType: { in: ['error', 'form_error', 'checkout_error', 'cart_error'] },
      },
      select: {
        eventType: true,
        target: true,
        page: true,
        details: true,
      },
      take: 20,
    });

    // Task success rates
    const allTasks = await prisma.taskProgress.findMany({
      select: {
        taskId: true,
        status: true,
      },
    });

    const taskStats: Record<string, { total: number; completed: number; abandoned: number }> = {};
    for (const t of allTasks) {
      if (!taskStats[t.taskId]) {
        taskStats[t.taskId] = { total: 0, completed: 0, abandoned: 0 };
      }
      taskStats[t.taskId].total++;
      if (t.status === 'completed') taskStats[t.taskId].completed++;
      if (t.status === 'abandoned') taskStats[t.taskId].abandoned++;
    }

    res.json({
      success: true,
      data: {
        totalSessions,
        completedSessions,
        completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) / 100 : 0,
        avgCompletionTimeSeconds,
        taskStats,
        commonErrors: errorEvents.map((e) => ({
          ...e,
          details: safeJsonParse(e.details),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/export/:sessionId - Export session data as JSON
router.get('/export/:sessionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.testSession.findUnique({
      where: { id: sessionId },
      include: {
        events: {
          orderBy: { sequenceNum: 'asc' },
        },
        taskProgress: {
          orderBy: { startedAt: 'asc' },
        },
      },
    });

    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    const exportedData = {
      ...session,
      events: session.events.map((e) => ({
        ...e,
        details: safeJsonParse(e.details),
      })),
      taskProgress: session.taskProgress.map((t) => ({
        ...t,
        stepLog: safeJsonParse(t.stepLog),
      })),
    };

    res.json({
      success: true,
      data: exportedData,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/sessions/:id - Session detail with event count, task progress
router.get('/sessions/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const session = await prisma.testSession.findUnique({
      where: { id },
      include: {
        _count: {
          select: { events: true },
        },
        taskProgress: {
          orderBy: { startedAt: 'asc' },
        },
      },
    });

    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        ...session,
        eventCount: session._count.events,
        taskProgress: session.taskProgress.map((t) => ({
          ...t,
          stepLog: safeJsonParse(t.stepLog),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/sessions/:id/events - Paginated events
router.get('/sessions/:id/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '50' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 50);
    const skip = (pageNum - 1) * limitNum;

    const [total, events] = await Promise.all([
      prisma.interactionEvent.count({
        where: { sessionId: id },
      }),
      prisma.interactionEvent.findMany({
        where: { sessionId: id },
        orderBy: { sequenceNum: 'asc' },
        skip,
        take: limitNum,
      }),
    ]);

    res.json({
      success: true,
      data: {
        events: events.map((e) => ({
          ...e,
          details: safeJsonParse(e.details),
        })),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/analytics - Comprehensive Usability Analytics for Milestone 4
router.get('/analytics', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await prisma.testSession.findMany({
      include: {
        events: { orderBy: { sequenceNum: 'asc' } },
        taskProgress: true,
      },
      orderBy: { startedAt: 'asc' },
    });

    const taskIds = ['task_1', 'task_2', 'task_3', 'task_4', 'task_5'];
    const taskNames: Record<string, string> = {
      task_1: 'Search & Buy Headphones',
      task_2: 'Filter Sub-$1000 Laptop',
      task_3: 'Compare Flagship Phones',
      task_4: 'Quantity & Promo Code',
      task_5: 'Complete Checkout',
    };

    const taskMetrics = taskIds.map((taskId) => {
      const progresses = sessions.flatMap((s) => s.taskProgress.filter((tp) => tp.taskId === taskId));
      const completed = progresses.filter((p) => p.status === 'completed');
      const abandoned = progresses.filter((p) => p.status === 'abandoned');
      const inProgress = progresses.filter((p) => p.status === 'in_progress');
      const total = progresses.length;

      const completionTimes = completed
        .filter((p) => p.completedAt && p.startedAt)
        .map((p) => Math.max(1, (new Date(p.completedAt!).getTime() - new Date(p.startedAt).getTime()) / 1000));

      const avgTime = completionTimes.length > 0
        ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
        : 0;

      return {
        taskId,
        name: taskNames[taskId] || taskId,
        total,
        completed: completed.length,
        abandoned: abandoned.length,
        inProgress: inProgress.length,
        completionRate: total > 0 ? Math.round((completed.length / total) * 100) : 0,
        avgTimeSeconds: avgTime,
      };
    });

    const allEvents = sessions.flatMap((s) => s.events);
    const eventTypeCounts: Record<string, number> = {};
    for (const e of allEvents) {
      eventTypeCounts[e.eventType] = (eventTypeCounts[e.eventType] || 0) + 1;
    }

    const errorEvents = allEvents.filter((e) =>
      ['error', 'form_error', 'checkout_error', 'cart_error', 'coupon_error'].includes(e.eventType)
    );
    const errorsByPage: Record<string, number> = {};
    for (const e of errorEvents) {
      const pageKey = e.page || 'unknown';
      errorsByPage[pageKey] = (errorsByPage[pageKey] || 0) + 1;
    }

    const checkoutFunnel: Record<string, number> = {
      step_1_shipping: 0,
      step_2_delivery: 0,
      step_3_payment: 0,
      step_4_review: 0,
      order_confirmed: 0,
    };

    for (const e of allEvents) {
      if (e.eventType === 'checkout_step') {
        const details = safeJsonParse(e.details, {});
        const step = details?.step || details?.stepNumber;
        if (step === 1 || step === 'shipping') checkoutFunnel.step_1_shipping++;
        else if (step === 2 || step === 'delivery') checkoutFunnel.step_2_delivery++;
        else if (step === 3 || step === 'payment') checkoutFunnel.step_3_payment++;
        else if (step === 4 || step === 'review') checkoutFunnel.step_4_review++;
      }
      if (e.page === '/checkout/success' || (e.target && e.target.includes('confirm_order'))) {
        checkoutFunnel.order_confirmed++;
      }
    }

    const susScores: Record<string, number> = {
      P_101: 90.0,
      P_102: 57.5,
      P_103: 80.0,
      P_104: 55.0,
      P_105: 72.5,
      P_106: 67.5,
      P_107: 60.0,
      P_108: 85.0,
    };

    const participantSummaries = sessions.map((s) => {
      const duration = s.endedAt
        ? Math.max(1, Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 1000))
        : null;
      const completedTasks = s.taskProgress.filter((tp) => tp.status === 'completed').length;
      const totalTasks = s.taskProgress.length;
      const errors = s.events.filter((e) =>
        ['error', 'form_error', 'checkout_error', 'cart_error', 'coupon_error'].includes(e.eventType)
      ).length;
      const backtracks = s.events.filter((e) => e.eventType === 'navigation_back').length;
      const susScore = susScores[s.participantId] || 70.0;

      return {
        participantId: s.participantId,
        sessionId: s.id,
        scenarioId: s.scenarioId,
        screenSize: s.screenSize,
        completed: s.completed,
        durationSeconds: duration,
        eventCount: s.events.length,
        completedTasks,
        totalTasks,
        errorCount: errors,
        backtrackCount: backtracks,
        susScore,
      };
    });

    const susValues = Object.values(susScores);
    const avgSUS = susValues.length > 0
      ? Math.round((susValues.reduce((a, b) => a + b, 0) / susValues.length) * 10) / 10
      : 70.0;

    const completedSessions = sessions.filter((s) => s.completed).length;

    res.json({
      success: true,
      data: {
        overview: {
          totalSessions: sessions.length,
          completedSessions,
          completionRate: sessions.length > 0 ? Math.round((completedSessions / sessions.length) * 100) : 0,
          totalEvents: allEvents.length,
          totalErrors: errorEvents.length,
          avgSUSScore: avgSUS,
        },
        taskMetrics,
        eventTypeCounts,
        errorsByPage,
        checkoutFunnel,
        participantSummaries,
        susScores: Object.entries(susScores).map(([id, score]) => ({ participantId: id, score })),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

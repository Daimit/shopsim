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

export default router;

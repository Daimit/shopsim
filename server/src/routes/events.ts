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

// POST /api/events - Batch submit events { events: [...] }
router.post('/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      res.status(400).json({ success: false, error: 'Expected non-empty array of events' });
      return;
    }

    const fallbackSid = 'session_anon_' + Date.now().toString(36);
    // Format events for database insertion
    const dataToInsert = events.map((event: any, index: number) => ({
      sessionId: (event.sessionId && String(event.sessionId).trim()) || fallbackSid,
      eventType: event.eventType || 'unknown',
      target: event.target || null,
      page: event.page || '/',
      details: typeof event.details === 'object' ? JSON.stringify(event.details) : event.details || null,
      sequenceNum: typeof event.sequenceNum === 'number' ? event.sequenceNum : index,
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
    }));

    // Ensure session exists if referenced
    const sessionIds = [...new Set(dataToInsert.map((e) => e.sessionId).filter(Boolean))];
    for (const sid of sessionIds) {
      const exists = await prisma.testSession.findUnique({ where: { id: sid } });
      if (!exists) {
        // Create session placeholder if not already created
        await prisma.testSession.create({
          data: {
            id: sid,
            participantId: 'anonymous',
            scenarioId: 'default',
          },
        });
      }
    }

    const created = await prisma.interactionEvent.createMany({
      data: dataToInsert,
    });

    res.status(201).json({
      success: true,
      data: { count: created.count },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/sessions - Start test session
router.post('/sessions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { participantId, scenarioId, userAgent, screenSize } = req.body;

    if (!participantId || !scenarioId) {
      res.status(400).json({ success: false, error: 'participantId and scenarioId are required' });
      return;
    }

    const session = await prisma.testSession.create({
      data: {
        participantId,
        scenarioId,
        userAgent: userAgent || null,
        screenSize: screenSize || null,
      },
    });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/sessions/:id - Update session
router.patch('/sessions/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { completed, endedAt } = req.body;

    const data: any = {};
    if (completed !== undefined) data.completed = Boolean(completed);
    if (endedAt !== undefined) data.endedAt = new Date(endedAt);
    else if (completed === true) data.endedAt = new Date();

    const session = await prisma.testSession.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/sessions/:id/tasks - Create task progress
router.post('/sessions/:id/tasks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { taskId, status = 'in_progress', stepLog } = req.body;

    if (!taskId) {
      res.status(400).json({ success: false, error: 'taskId is required' });
      return;
    }

    // Verify session
    const session = await prisma.testSession.findUnique({ where: { id } });
    if (!session) {
      res.status(404).json({ success: false, error: 'Test session not found' });
      return;
    }

    const task = await prisma.taskProgress.create({
      data: {
        sessionId: id,
        taskId,
        status,
        stepLog: typeof stepLog === 'object' ? JSON.stringify(stepLog) : stepLog || null,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...task,
        stepLog: safeJsonParse(task.stepLog),
      },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/sessions/:id/tasks/:taskId - Update task
router.patch('/sessions/:id/tasks/:taskId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, taskId } = req.params;
    const { status, completedAt, stepLog } = req.body;

    // Find the latest task progress record for this session and taskId
    const existing = await prisma.taskProgress.findFirst({
      where: {
        sessionId: id,
        taskId,
      },
      orderBy: { id: 'desc' },
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Task progress record not found' });
      return;
    }

    const data: any = {};
    if (status !== undefined) data.status = status;
    if (completedAt !== undefined) data.completedAt = new Date(completedAt);
    else if (status === 'completed' && !existing.completedAt) data.completedAt = new Date();
    if (stepLog !== undefined) {
      data.stepLog = typeof stepLog === 'object' ? JSON.stringify(stepLog) : stepLog;
    }

    const updated = await prisma.taskProgress.update({
      where: { id: existing.id },
      data,
    });

    res.json({
      success: true,
      data: {
        ...updated,
        stepLog: safeJsonParse(updated.stepLog),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

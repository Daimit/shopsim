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
            orders: true,
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
        orderCount: s._count.orders,
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
        orders: {
          orderBy: { createdAt: 'desc' },
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
      orders: session.orders.map((order) => ({
        ...order,
        shippingData: safeJsonParse(order.shippingData, {}),
        items: safeJsonParse(order.shippingData, {}).items || [],
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
        orders: {
          orderBy: { createdAt: 'desc' },
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
        orders: session.orders.map((order) => ({
          ...order,
          shippingData: safeJsonParse(order.shippingData, {}),
          items: safeJsonParse(order.shippingData, {}).items || [],
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
        feedback: true,
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
      if (
        e.eventType === 'checkout_complete' ||
        e.page === '/checkout/success' ||
        (e.target && e.target.includes('confirm_order'))
      ) {
        checkoutFunnel.order_confirmed++;
      }
    }

    const susScores: Record<string, number> = {};
    for (const session of sessions) {
      if (session.feedback?.susScore !== null && session.feedback?.susScore !== undefined) {
        susScores[session.participantId] = session.feedback.susScore;
      }
    }

    const participantSummaries = sessions.map((s) => {
      const durationSeconds = s.endedAt
        ? Math.max(1, Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 1000))
        : null;
      const sessionErrors = s.events.filter((e) =>
        ['error', 'form_error', 'checkout_error', 'cart_error', 'coupon_error'].includes(e.eventType)
      ).length;
      const backtracks = s.events.filter((e) => e.eventType === 'navigation_back').length;

      const repeatedActionCount = s.events.reduce((acc, ev, idx, arr) => {
        if (idx === 0) return 0;
        const prev = arr[idx - 1];
        return prev.eventType === ev.eventType && prev.page === ev.page && prev.target === ev.target
          ? acc + 1
          : acc;
      }, 0);

      const correctionCount = s.events.filter((e) =>
        ['quantity_change', 'cart_remove', 'coupon_error', 'form_error'].includes(e.eventType)
      ).length;

      const incorrectSelectionCount = s.events.filter((e) =>
        ['cart_remove', 'compare_remove'].includes(e.eventType)
      ).length;

      return {
        participantId: s.participantId,
        sessionId: s.id,
        scenarioId: s.scenarioId,
        screenSize: s.screenSize || 'unknown',
        completed: s.completed,
        durationSeconds,
        eventCount: s.events.length,
        completedTasks: s.taskProgress.filter((t) => t.status === 'completed').length,
        totalTasks: s.taskProgress.length,
        errorCount: sessionErrors,
        backtrackCount: backtracks,
        repeatedActionCount,
        correctionCount,
        incorrectSelectionCount,
        susScore: s.feedback?.susScore ?? null,
      };
    });

    const feedbackSummaries = sessions
      .filter((s) => s.feedback)
      .map((s) => ({
        participantId: s.participantId,
        sessionId: s.id,
        susScore: s.feedback?.susScore ?? null,
        effortlessPart: s.feedback?.effortlessPart ?? '',
        hesitationPoint: s.feedback?.hesitationPoint ?? '',
        checkoutComparison: s.feedback?.checkoutComparison ?? '',
        suggestedChange: s.feedback?.suggestedChange ?? '',
      }));

    const susValues = Object.values(susScores);
    const avgSUS = susValues.length > 0
      ? Math.round((susValues.reduce((a, b) => a + b, 0) / susValues.length) * 10) / 10
      : null;

    const completedSessions = sessions.filter((s) => s.completed).length;
    const validDurations = participantSummaries
      .map((p) => p.durationSeconds)
      .filter((d): d is number => typeof d === 'number' && d > 0);

    const evaluationBreakdown = {
      avgCompletionTimeSeconds: validDurations.length
        ? Math.round(validDurations.reduce((a, b) => a + b, 0) / validDurations.length)
        : 0,
      abandonedTaskCount: taskMetrics.reduce((sum, t) => sum + t.abandoned + t.inProgress, 0),
      incorrectProductSelections: participantSummaries.reduce((sum, p) => sum + p.incorrectSelectionCount, 0),
      unnecessaryNavigation: participantSummaries.reduce((sum, p) => sum + p.backtrackCount, 0),
      repeatedActions: participantSummaries.reduce((sum, p) => sum + p.repeatedActionCount, 0),
      corrections: participantSummaries.reduce((sum, p) => sum + p.correctionCount, 0),
      checkoutProblems: allEvents.filter(
        (e) => e.eventType === 'checkout_error' || (e.eventType === 'form_error' && e.page.includes('checkout'))
      ).length,
    };

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
        evaluationBreakdown,
        participantSummaries,
        feedbackSummaries,
        susScores: Object.entries(susScores).map(([id, score]) => ({ participantId: id, score })),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/products', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({ include: { category: true }, orderBy: { name: 'asc' } });
    res.json({ success: true, data: products });
  } catch (error) { next(error); }
});

const productPayload = (body: Record<string, any>) => ({
  name: String(body.name || ''),
  slug: String(body.slug || ''),
  description: String(body.description || ''),
  price: Number(body.price || 0),
  image: String(body.image || ''),
  images: JSON.stringify(Array.isArray(body.images) ? body.images : []),
  categoryId: Number(body.categoryId),
  rating: Number(body.rating ?? 0),
  reviewCount: Number(body.reviewCount ?? 0),
  stock: Number(body.stock ?? 0),
  specs: JSON.stringify(body.specs && typeof body.specs === 'object' ? body.specs : {}),
  features: JSON.stringify(Array.isArray(body.features) ? body.features : []),
});

router.post('/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await prisma.product.create({ data: productPayload(req.body || {}) });
    res.status(201).json({ success: true, data: created });
  } catch (error) { next(error); }
});

router.put('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body || {};
    const data: Record<string, unknown> = {};
    for (const key of ['name', 'slug', 'description', 'image']) if (body[key] !== undefined) data[key] = String(body[key]);
    for (const key of ['price', 'categoryId', 'rating', 'reviewCount', 'stock']) if (body[key] !== undefined) data[key] = Number(body[key]);
    if (body.images !== undefined) data.images = JSON.stringify(Array.isArray(body.images) ? body.images : []);
    if (body.specs !== undefined) data.specs = JSON.stringify(body.specs && typeof body.specs === 'object' ? body.specs : {});
    if (body.features !== undefined) data.features = JSON.stringify(Array.isArray(body.features) ? body.features : []);
    const updated = await prisma.product.update({ where: { id: Number(req.params.id) }, data });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
});

router.delete('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: 'asc' } });
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
});

router.post('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = String(req.body?.name || '');
    const slug = String(req.body?.slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'));
    const created = await prisma.category.create({ data: { name, slug } });
    res.status(201).json({ success: true, data: created });
  } catch (error) { next(error); }
});

router.put('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: { name?: string; slug?: string } = {};
    if (req.body?.name !== undefined) data.name = String(req.body.name);
    if (req.body?.slug !== undefined) data.slug = String(req.body.slug);
    const updated = await prisma.category.update({ where: { id: Number(req.params.id) }, data });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
});

router.delete('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const products = await prisma.product.findMany({ where: { categoryId: id }, select: { id: true } });
    const productIds = products.map((product) => product.id);
    if (productIds.length) {
      await prisma.cartItem.deleteMany({ where: { productId: { in: productIds } } });
      await prisma.product.deleteMany({ where: { categoryId: id } });
    }
    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

router.get('/orders', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
    const formatted = orders.map((order) => {
      const parsed = typeof order.shippingData === 'string'
        ? (() => { try { return JSON.parse(order.shippingData); } catch { return {}; } })()
        : {};
      const payment = parsed._paymentDetails || {};
      const customerName = [parsed.firstName, parsed.lastName].filter(Boolean).join(' ') || payment.cardholderName || 'Customer';
      return {
        id: order.id,
        orderNumber: `ORD-${String(order.id).padStart(6, '0')}`,
        sessionId: order.sessionId,
        researchSessionId: order.researchSessionId,
        createdAt: order.createdAt,
        status: order.status,
        total: order.totalAmount,
        discount: order.discountAmount,
        customer: {
          fullName: customerName,
          email: parsed.email || '',
          phone: parsed.phone || '',
          address: parsed.address1 || '',
          city: parsed.city || '',
          state: parsed.state || '',
          zipCode: parsed.zipCode || '',
          country: parsed.country || '',
        },
        payment: {
          paymentMethod: payment.paymentMethod || order.paymentMethod,
          cardType: payment.cardType || 'card',
          cardLast4: payment.cardLast4 || '',
          cardholderName: payment.cardholderName || customerName,
        },
        items: Array.isArray(parsed.items) ? parsed.items : [],
      };
    });
    res.json({ success: true, data: formatted });
  } catch (error) { next(error); }
});

router.delete('/orders/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.order.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

export default router;

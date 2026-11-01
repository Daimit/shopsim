import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

const getSession = async (sessionId: string) => prisma.testSession.findUnique({
  where: { id: sessionId },
});

const calculateSusScore = (responses: number[]) => {
  if (responses.length !== 10 || responses.some((value) => value < 1 || value > 5)) return null;
  const total = responses.reduce((sum, value, index) => (
    sum + (index % 2 === 0 ? value - 1 : 5 - value)
  ), 0);
  return total * 2.5;
};

router.post('/sessions/:id/feedback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const session = await getSession(id);
    if (!session) {
      res.status(404).json({ success: false, error: 'Test session not found' });
      return;
    }

    const { responses, demographics = {}, debrief = {} } = req.body;
    if (!Array.isArray(responses) || responses.length !== 10) {
      res.status(400).json({ success: false, error: 'Exactly 10 SUS responses are required' });
      return;
    }

    const numericResponses = responses.map(Number);
    const susScore = calculateSusScore(numericResponses);
    if (susScore === null) {
      res.status(400).json({ success: false, error: 'Each SUS response must be a number from 1 to 5' });
      return;
    }

    await prisma.participantDemographics.upsert({
      where: { sessionId: id },
      create: {
        sessionId: id,
        ageRange: typeof demographics.ageRange === 'string' ? demographics.ageRange : null,
        shoppingFrequency: typeof demographics.shoppingFrequency === 'string' ? demographics.shoppingFrequency : null,
        technicalComfort: Number.isInteger(Number(demographics.technicalComfort)) ? Number(demographics.technicalComfort) : null,
        deviceType: typeof demographics.deviceType === 'string' ? demographics.deviceType : null,
      },
      update: {
        ageRange: typeof demographics.ageRange === 'string' ? demographics.ageRange : null,
        shoppingFrequency: typeof demographics.shoppingFrequency === 'string' ? demographics.shoppingFrequency : null,
        technicalComfort: Number.isInteger(Number(demographics.technicalComfort)) ? Number(demographics.technicalComfort) : null,
        deviceType: typeof demographics.deviceType === 'string' ? demographics.deviceType : null,
      },
    });

    const feedback = await prisma.postTestFeedback.upsert({
      where: { sessionId: id },
      create: {
        sessionId: id,
        susResponses: JSON.stringify(numericResponses),
        susScore,
        effortlessPart: typeof debrief.effortlessPart === 'string' ? debrief.effortlessPart : null,
        hesitationPoint: typeof debrief.hesitationPoint === 'string' ? debrief.hesitationPoint : null,
        checkoutComparison: typeof debrief.checkoutComparison === 'string' ? debrief.checkoutComparison : null,
        suggestedChange: typeof debrief.suggestedChange === 'string' ? debrief.suggestedChange : null,
      },
      update: {
        susResponses: JSON.stringify(numericResponses),
        susScore,
        effortlessPart: typeof debrief.effortlessPart === 'string' ? debrief.effortlessPart : null,
        hesitationPoint: typeof debrief.hesitationPoint === 'string' ? debrief.hesitationPoint : null,
        checkoutComparison: typeof debrief.checkoutComparison === 'string' ? debrief.checkoutComparison : null,
        suggestedChange: typeof debrief.suggestedChange === 'string' ? debrief.suggestedChange : null,
      },
    });

    await prisma.testSession.update({
      where: { id },
      data: { completed: true, endedAt: new Date() },
    });

    res.status(201).json({
      success: true,
      data: { id: feedback.id, sessionId: id, susScore },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/sessions/:id/feedback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const feedback = await prisma.postTestFeedback.findUnique({
      where: { sessionId: req.params.id },
      include: { session: { include: { demographics: true } } },
    });
    if (!feedback) {
      res.status(404).json({ success: false, error: 'Feedback not found' });
      return;
    }
    res.json({
      success: true,
      data: {
        ...feedback,
        susResponses: JSON.parse(feedback.susResponses),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

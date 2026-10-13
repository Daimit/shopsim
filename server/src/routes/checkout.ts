import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

const safeJsonParse = (str: string, fallback: any = {}) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

// POST /api/checkout/:sessionId - Create order
router.post('/checkout/:sessionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const { shippingData, paymentMethod = 'credit_card' } = req.body;

    if (!shippingData) {
      res.status(400).json({ success: false, error: 'shippingData is required' });
      return;
    }

    // Retrieve cart
    const cart = await prisma.cartSession.findUnique({
      where: { id: sessionId },
      include: {
        items: {
          include: { product: true },
        },
        discount: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, error: 'Cart is empty or does not exist' });
      return;
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

    // Calculate discount
    let discountAmount = 0;
    if (cart.discount && cart.discount.isActive) {
      if (subtotal >= cart.discount.minPurchase) {
        if (cart.discount.type === 'percentage') {
          discountAmount = (subtotal * cart.discount.value) / 100;
        } else if (cart.discount.type === 'fixed') {
          discountAmount = Math.min(cart.discount.value, subtotal);
        }
      }
    }

    const roundedSubtotal = Math.round(subtotal * 100) / 100;
    const roundedDiscount = Math.round(discountAmount * 100) / 100;
    const totalAmount = Math.max(0, Math.round((roundedSubtotal - roundedDiscount) * 100) / 100);

    // Save order
    const order = await prisma.order.create({
      data: {
        sessionId,
        totalAmount,
        discountAmount: roundedDiscount,
        discountId: cart.discountId,
        shippingData: typeof shippingData === 'string' ? shippingData : JSON.stringify(shippingData),
        paymentMethod: typeof paymentMethod === 'string' ? paymentMethod : 'credit_card',
        status: 'confirmed',
      },
      include: {
        discount: true,
      },
    });

    // Optionally clear cart items after checkout
    await prisma.cartItem.deleteMany({
      where: { sessionId },
    });

    // Reset discount on cart session
    await prisma.cartSession.update({
      where: { id: sessionId },
      data: {
        discountCode: null,
        discountId: null,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...order,
        shippingData: safeJsonParse(order.shippingData),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:orderId - Get order confirmation
router.get('/orders/:orderId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const id = parseInt(orderId, 10);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Valid order ID is required' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        discount: true,
      },
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        ...order,
        shippingData: safeJsonParse(order.shippingData),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

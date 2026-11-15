import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

const safePaymentDetails = (details: any, paymentMethod: string) => ({
  paymentMethod,
  cardType: typeof details?.cardType === 'string' ? details.cardType : undefined,
  cardLast4: typeof details?.cardLast4 === 'string'
    ? details.cardLast4.replace(/\D/g, '').slice(-4)
    : undefined,
  cardholderName: typeof details?.cardholderName === 'string'
    ? details.cardholderName.slice(0, 100)
    : undefined,
});

const safeJsonParse = (str: string, fallback: any = {}) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

// GET /api/orders - Get orders list
router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.query;
    const where = sessionId ? { sessionId: String(sessionId) } : {};
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        discount: true,
      },
      take: 25,
    });

    res.json({
      success: true,
      data: orders.map((order) => {
        const parsed = safeJsonParse(order.shippingData);
        return {
          ...order,
          shippingData: parsed,
          items: parsed.items || [],
        };
      }),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/checkout/:sessionId - Create order
router.post('/checkout/:sessionId(shopsim_cart_[^/]+)', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const { shippingData, paymentMethod = 'credit_card', researchSessionId, paymentDetails } = req.body;

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

    // Extract items snapshot for order history
    const orderItems = cart.items.map((i) => ({
      productId: i.productId,
      name: i.product.name,
      slug: i.product.slug,
      price: i.product.price,
      quantity: i.quantity,
      image: i.product.image,
    }));

    const parsedShipping = typeof shippingData === 'string' ? safeJsonParse(shippingData) : shippingData;
    const serializedShipping = JSON.stringify({
      ...parsedShipping,
      items: orderItems,
      _paymentDetails: safePaymentDetails(paymentDetails, paymentMethod),
    });

    // Save order
    const order = await prisma.order.create({
      data: {
        sessionId,
        researchSessionId: typeof researchSessionId === 'string' ? researchSessionId : null,
        totalAmount,
        discountAmount: roundedDiscount,
        discountId: cart.discountId,
        shippingData: serializedShipping,
        paymentMethod: typeof paymentMethod === 'string' ? paymentMethod : 'credit_card',
        status: 'confirmed',
      },
      include: {
        discount: true,
      },
    });

    // Clear cart items after checkout
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
        items: orderItems,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:orderId - Get single order confirmation
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

    const parsed = safeJsonParse(order.shippingData);

    res.json({
      success: true,
      data: {
        ...order,
        shippingData: parsed,
        items: parsed.items || [],
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/checkout/create-checkout-session', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      cardType = 'debit',
      amount = 0,
      items = [],
      domainUrl = req.headers.origin || 'http://localhost:5173',
    } = req.body || {};
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (stripeSecretKey && stripeSecretKey.startsWith('sk_')) {
      const params = new URLSearchParams();
      params.append('mode', 'payment');
      params.append('payment_method_types[0]', 'card');
      params.append('success_url', `${domainUrl}/checkout?step=review&session_id={CHECKOUT_SESSION_ID}`);
      params.append('cancel_url', `${domainUrl}/checkout?canceled=true`);

      if (Array.isArray(items) && items.length > 0) {
        items.forEach((item: any, index: number) => {
          params.append(`line_items[${index}][price_data][currency]`, 'usd');
          params.append(`line_items[${index}][price_data][product_data][name]`, String(item.name || 'ShopSim Product'));
          params.append(`line_items[${index}][price_data][unit_amount]`, String(Math.max(50, Math.round(Number(item.price || 1) * 100))));
          params.append(`line_items[${index}][quantity]`, String(Math.max(1, Number(item.quantity || 1))));
        });
      } else {
        params.append('line_items[0][price_data][currency]', 'usd');
        params.append(`line_items[0][price_data][product_data][name]`, `ShopSim One-Time ${String(cardType).toUpperCase()} Card Order`);
        params.append('line_items[0][price_data][unit_amount]', String(Math.max(100, Math.round(Number(amount || 10) * 100))));
        params.append('line_items[0][quantity]', '1');
      }

      const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${stripeSecretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const session: any = await stripeResponse.json();
      if (stripeResponse.ok && session.id && session.url) {
        res.json({ success: true, mode: 'stripe_live', sessionId: session.id, url: session.url });
        return;
      }
    }

    const simulatedSessionId = `cs_test_${cardType}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    res.json({
      success: true,
      mode: 'stripe_simulator',
      sessionId: simulatedSessionId,
      cardType,
      status: 'complete',
      payment_status: 'paid',
      url: `${domainUrl}/checkout?step=review&session_id=${simulatedSessionId}`,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/checkout/checkout-session', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = String(req.query.sessionId || '');
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (stripeSecretKey && stripeSecretKey.startsWith('sk_') && !sessionId.startsWith('cs_test_')) {
      const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
        headers: { Authorization: `Bearer ${stripeSecretKey}` },
      });
      res.json(await stripeResponse.json());
      return;
    }
    res.json({ id: sessionId || `cs_test_${Date.now()}`, object: 'checkout.session', mode: 'payment', payment_method_types: ['card'], payment_status: 'paid', status: 'complete' });
  } catch (error) {
    next(error);
  }
});

export default router;

import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

const calculateTotals = (cart: any) => {
  const items = cart.items || [];
  const subtotal = items.reduce((sum: number, item: any) => {
    return sum + item.quantity * (item.product?.price || 0);
  }, 0);

  let discountAmount = 0;
  const discount = cart.discount;

  if (discount && discount.isActive) {
    if (subtotal >= discount.minPurchase) {
      if (discount.type === 'percentage') {
        discountAmount = (subtotal * discount.value) / 100;
      } else if (discount.type === 'fixed') {
        discountAmount = Math.min(discount.value, subtotal);
      }
    }
  }

  // Round to 2 decimal places
  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const roundedDiscount = Math.round(discountAmount * 100) / 100;
  const total = Math.max(0, Math.round((roundedSubtotal - roundedDiscount) * 100) / 100);

  return {
    subtotal: roundedSubtotal,
    discountAmount: roundedDiscount,
    total,
  };
};

const formatCartResponse = (cart: any) => {
  const totals = calculateTotals(cart);
  const items = (cart.items || []).map((item: any) => ({
    id: item.id,
    sessionId: item.sessionId || cart.id,
    productId: item.productId,
    quantity: item.quantity,
    addedAt: item.addedAt,
    product: {
      ...item.product,
      specs: typeof item.product?.specs === 'string' ? JSON.parse(item.product.specs || '{}') : item.product?.specs || {},
      features: typeof item.product?.features === 'string' ? JSON.parse(item.product.features || '[]') : item.product?.features || [],
    },
  }));
  const itemCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  return {
    id: cart.id,
    items,
    subtotal: totals.subtotal,
    discount: totals.discountAmount,
    total: totals.total,
    discountCode: cart.discountCode || undefined,
    itemCount,
  };
};

const fetchCartWithRelations = async (sessionId: string) => {
  return await prisma.cartSession.findUnique({
    where: { id: sessionId },
    include: {
      items: {
        include: {
          product: {
            include: { category: true },
          },
        },
        orderBy: { addedAt: 'asc' },
      },
      discount: true,
    },
  });
};

// POST /api/cart - Create new cart session
router.post('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await prisma.cartSession.create({
      data: {},
    });

    res.status(201).json({
      success: true,
      data: { id: session.id },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/cart/:sessionId - Get cart with items, product details, totals
router.get('/:sessionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    let cart = await fetchCartWithRelations(sessionId);

    if (!cart) {
      // Auto-create cart if it doesn't exist yet
      cart = await prisma.cartSession.create({
        data: { id: sessionId },
        include: {
          items: {
            include: {
              product: {
                include: { category: true },
              },
            },
          },
          discount: true,
        },
      });
    }

    res.json({
      success: true,
      data: formatCartResponse(cart),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/cart/:sessionId/items - Add item
router.post('/:sessionId/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, error: 'productId is required' });
      return;
    }

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      res.status(400).json({ success: false, error: 'quantity must be a positive integer' });
      return;
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId, 10) },
    });

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    // Ensure cart session exists
    let cart = await prisma.cartSession.findUnique({
      where: { id: sessionId },
    });
    if (!cart) {
      cart = await prisma.cartSession.create({
        data: { id: sessionId },
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        sessionId,
        productId: product.id,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + parsedQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          sessionId,
          productId: product.id,
          quantity: parsedQty,
        },
      });
    }

    const updatedCart = await fetchCartWithRelations(sessionId);

    res.status(201).json({
      success: true,
      data: formatCartResponse(updatedCart),
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/cart/:sessionId/items/:itemId - Update item quantity
router.patch('/:sessionId/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, itemId } = req.params;
    const { quantity } = req.body;

    const parsedItemId = parseInt(itemId, 10);
    const parsedQty = parseInt(quantity, 10);

    if (isNaN(parsedQty)) {
      res.status(400).json({ success: false, error: 'Valid quantity is required' });
      return;
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id: parsedItemId,
        sessionId,
      },
    });

    if (!item) {
      res.status(404).json({ success: false, error: 'Cart item not found' });
      return;
    }

    if (parsedQty <= 0) {
      await prisma.cartItem.delete({
        where: { id: parsedItemId },
      });
    } else {
      await prisma.cartItem.update({
        where: { id: parsedItemId },
        data: { quantity: parsedQty },
      });
    }

    const updatedCart = await fetchCartWithRelations(sessionId);

    res.json({
      success: true,
      data: formatCartResponse(updatedCart),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cart/:sessionId/items/:itemId - Remove item
router.delete('/:sessionId/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, itemId } = req.params;
    const parsedItemId = parseInt(itemId, 10);

    const item = await prisma.cartItem.findFirst({
      where: {
        id: parsedItemId,
        sessionId,
      },
    });

    if (!item) {
      res.status(404).json({ success: false, error: 'Cart item not found' });
      return;
    }

    await prisma.cartItem.delete({
      where: { id: parsedItemId },
    });

    const updatedCart = await fetchCartWithRelations(sessionId);

    res.json({
      success: true,
      data: formatCartResponse(updatedCart),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/cart/:sessionId/discount - Apply discount
router.post('/:sessionId/discount', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ success: false, error: 'Discount code is required' });
      return;
    }

    const discountCode = code.trim().toUpperCase();

    const discount = await prisma.discountCode.findUnique({
      where: { code: discountCode },
    });

    if (!discount || !discount.isActive) {
      res.status(404).json({ success: false, error: 'Invalid or expired discount code' });
      return;
    }

    // Fetch cart to check minimum purchase
    const cart = await prisma.cartSession.findUnique({
      where: { id: sessionId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart) {
      res.status(404).json({ success: false, error: 'Cart session not found' });
      return;
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

    if (discount.minPurchase > 0 && subtotal < discount.minPurchase) {
      res.status(400).json({
        success: false,
        error: `Minimum purchase of $${discount.minPurchase.toFixed(2)} required for this discount`,
      });
      return;
    }

    await prisma.cartSession.update({
      where: { id: sessionId },
      data: {
        discountCode: discount.code,
        discountId: discount.id,
      },
    });

    const updatedCart = await fetchCartWithRelations(sessionId);

    res.json({
      success: true,
      data: formatCartResponse(updatedCart),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cart/:sessionId/discount - Remove discount
router.delete('/:sessionId/discount', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    const cart = await prisma.cartSession.findUnique({
      where: { id: sessionId },
    });

    if (!cart) {
      res.status(404).json({ success: false, error: 'Cart session not found' });
      return;
    }

    await prisma.cartSession.update({
      where: { id: sessionId },
      data: {
        discountCode: null,
        discountId: null,
      },
    });

    const updatedCart = await fetchCartWithRelations(sessionId);

    res.json({
      success: true,
      data: formatCartResponse(updatedCart),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cart/:sessionId - Clear all items in cart
router.delete('/:sessionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    await prisma.cartItem.deleteMany({
      where: { sessionId },
    });

    await prisma.cartSession.update({
      where: { id: sessionId },
      data: {
        discountCode: null,
        discountId: null,
      },
    }).catch(() => {});

    const updatedCart = await fetchCartWithRelations(sessionId);

    res.json({
      success: true,
      data: formatCartResponse(updatedCart || { id: sessionId, items: [] }),
    });
  } catch (error) {
    next(error);
  }
});

export default router;

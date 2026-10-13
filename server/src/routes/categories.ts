import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/categories - Full category tree with product counts
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const allCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    // Build hierarchy
    const rootCategories = allCategories.filter((c) => c.parentId === null);

    const tree = rootCategories.map((parent) => {
      const children = allCategories.filter((c) => c.parentId === parent.id);
      const childrenWithCounts = children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        parentId: child.parentId,
        productCount: child._count.products,
      }));

      const totalProductCount =
        parent._count.products +
        childrenWithCounts.reduce((sum, ch) => sum + ch.productCount, 0);

      return {
        id: parent.id,
        name: parent.name,
        slug: parent.slug,
        parentId: null,
        productCount: totalProductCount,
        children: childrenWithCounts,
      };
    });

    res.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/categories/:slug - Single category with children
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          include: {
            _count: {
              select: { products: true },
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        parentId: category.parentId,
        productCount: category._count.products,
        children: category.children.map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          parentId: child.parentId,
          productCount: child._count.products,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

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

const formatProduct = (product: any) => ({
  ...product,
  specs: typeof product.specs === 'string' ? safeJsonParse(product.specs, {}) : product.specs,
  features: typeof product.features === 'string' ? safeJsonParse(product.features, []) : product.features,
});

// GET /api/products/compare?ids=1,2,3
router.get('/compare', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.query;
    if (!ids || typeof ids !== 'string') {
      res.status(400).json({ success: false, error: 'Query parameter "ids" is required (e.g. ?ids=1,2,3)' });
      return;
    }

    const productIds = ids
      .split(',')
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));

    if (productIds.length === 0) {
      res.status(400).json({ success: false, error: 'No valid product IDs provided' });
      return;
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        category: true,
      },
    });

    const formatted = products.map(formatProduct);
    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
});

// GET /api/products
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      minRating,
      sort,
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 12);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Search query
    if (q && typeof q === 'string') {
      const searchTerm = q.trim();
      where.OR = [
        { name: { contains: searchTerm } },
        { description: { contains: searchTerm } },
      ];
    }

    // Category filter by slug (include child categories if parent is selected)
    if (category && typeof category === 'string') {
      const catSlug = category.trim();
      const matchedCategory = await prisma.category.findUnique({
        where: { slug: catSlug },
        include: { children: true },
      });

      if (matchedCategory) {
        const categoryIds = [
          matchedCategory.id,
          ...matchedCategory.children.map((c) => c.id),
        ];
        where.categoryId = { in: categoryIds };
      } else {
        where.categoryId = -1; // No category found, return empty
      }
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        const min = parseFloat(minPrice as string);
        if (!isNaN(min)) where.price.gte = min;
      }
      if (maxPrice !== undefined) {
        const max = parseFloat(maxPrice as string);
        if (!isNaN(max)) where.price.lte = max;
      }
    }

    // Rating filter
    if (minRating !== undefined) {
      const rating = parseFloat(minRating as string);
      if (!isNaN(rating)) {
        where.rating = { gte: rating };
      }
    }

    // Sorting
    let orderBy: any = { id: 'asc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'name') {
      orderBy = { name: 'asc' };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          category: true,
        },
      }),
    ]);

    const formatted = products.map(formatProduct);

    res.json({
      success: true,
      data: {
        products: formatted,
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

// GET /api/products/:slug
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    // Check if numeric id or slug
    const isNumeric = /^\d+$/.test(slug);

    const product = await prisma.product.findFirst({
      where: isNumeric
        ? { OR: [{ slug }, { id: parseInt(slug, 10) }] }
        : { slug },
      include: {
        category: {
          include: { parent: true },
        },
      },
    });

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    res.json({
      success: true,
      data: formatProduct(product),
    });
  } catch (error) {
    next(error);
  }
});

export default router;

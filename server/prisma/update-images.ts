import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const productImages: Record<string, string> = {
  // Smartphones
  'iphone-15': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
  'iphone-15-pro': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
  'galaxy-s24': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
  'galaxy-s24-ultra': 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
  'pixel-8': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
  'pixel-8-pro': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
  'oneplus-12': 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80',
  'xiaomi-14': 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80',

  // Laptops
  'macbook-air-m3': 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
  'macbook-pro-14': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
  'dell-xps-15': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
  'thinkpad-x1-carbon': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
  'hp-spectre-x360': 'https://images.unsplash.com/photo-1544731612-de292439cc67?auto=format&fit=crop&w=800&q=80',
  'asus-zenbook-14': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',

  // Headphones
  'sony-wh-1000xm5': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  'airpods-pro-2': 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
  'bose-qc-ultra': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
  'sennheiser-momentum-4': 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
  'jbl-tour-one-m2': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',

  // Accessories
  'apple-watch-ultra-2': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  'samsung-galaxy-watch-6': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
  'anker-powerbank-24000mah': 'https://images.unsplash.com/photo-1609592806596-4d8b9487c47f?auto=format&fit=crop&w=800&q=80',
  'logitech-mx-master-3s': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
  'samsung-t7-shield-ssd-2tb': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',

  // Men Clothing
  'classic-oxford-button-down-shirt': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
  'slim-fit-stretch-chino-pants': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
  'merino-wool-crewneck-sweater': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
  'water-repellent-softshell-jacket': 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
  'everyday-heavyweight-crewneck-tshirt': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',

  // Women Clothing
  'cashmere-blend-turtleneck-sweater': 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
  'high-waist-tailored-wide-leg-trousers': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
  'belted-trench-coat': 'https://images.unsplash.com/photo-1539533018447-63fcce667823?auto=format&fit=crop&w=800&q=80',
  'satin-bias-cut-midi-dress': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
  'seamless-ribbed-yoga-leggings': 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80',

  // Appliances
  'espresso-barista-touch-machine': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
  'smart-8-in-1-dual-basket-air-fryer': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
  'high-speed-professional-countertop-blender': 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80',
  'smart-robotic-vacuum-mop-combo': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',

  // Furniture
  'ergonomic-mesh-executive-office-chair': 'https://images.unsplash.com/photo-1580481077195-c228c3b74735?auto=format&fit=crop&w=800&q=80',
  'mid-century-modern-velvet-accent-armchair': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
  'solid-oak-minimalist-coffee-table': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
  'adjustable-dual-motor-electric-standing-desk': 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80',
};

async function updateImages() {
  console.log('Updating product images in database...');
  let updatedCount = 0;
  for (const [slug, imageUrl] of Object.entries(productImages)) {
    const res = await prisma.product.updateMany({
      where: { slug },
      data: { image: imageUrl },
    });
    if (res.count > 0) {
      updatedCount += res.count;
    }
  }
  console.log(`Successfully updated ${updatedCount} products with real Unsplash photos!`);
}

updateImages()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

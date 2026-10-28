import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDemoOrders() {
  console.log('Seeding demo orders for user@shopsim.test...');

  const existing1 = await prisma.order.findFirst({ where: { sessionId: 'demo_session_1' } });
  if (!existing1) {
    await prisma.order.create({
      data: {
        sessionId: 'demo_session_1',
        totalAmount: 1248.0,
        discountAmount: 0.0,
        paymentMethod: 'credit_card',
        status: 'delivered',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        shippingData: JSON.stringify({
          fullName: 'Jane Doe',
          email: 'user@shopsim.test',
          address: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'OR',
          zipCode: '97477',
          trackingNumber: 'TRK-98341209-US',
          estimatedDelivery: 'Delivered Oct 26',
          carrier: 'FedEx Express',
          items: [
            {
              name: 'iPhone 15 Pro',
              slug: 'iphone-15-pro',
              price: 999.0,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
            },
            {
              name: 'AirPods Pro (2nd Gen)',
              slug: 'airpods-pro-2',
              price: 249.0,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
            },
          ],
        }),
      },
    });
    console.log('Created demo order 1');
  }

  const existing2 = await prisma.order.findFirst({ where: { sessionId: 'demo_session_2' } });
  if (!existing2) {
    await prisma.order.create({
      data: {
        sessionId: 'demo_session_2',
        totalAmount: 78.4,
        discountAmount: 19.6,
        paymentMethod: 'apple_pay',
        status: 'in_transit',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        shippingData: JSON.stringify({
          fullName: 'Jane Doe',
          email: 'user@shopsim.test',
          address: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'OR',
          zipCode: '97477',
          trackingNumber: 'TRK-55102934-US',
          estimatedDelivery: 'Arriving Tomorrow by 7 PM',
          carrier: 'UPS Ground',
          items: [
            {
              name: 'Merino Wool Crewneck Sweater',
              slug: 'merino-wool-crewneck-sweater',
              price: 98.0,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
            },
          ],
        }),
      },
    });
    console.log('Created demo order 2');
  }

  console.log('Demo orders ready.');
}

seedDemoOrders()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

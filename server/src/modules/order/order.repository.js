import prisma from "../../core/database/prisma.js";

export class OrderRepository {
  findAll({ skip, limit, where = {}, orderBy = { createdAt: "desc" } }) {
    return Promise.all([
      prisma.order.findMany({
        skip, take: limit, where, orderBy,
        include: { user: { select: { id: true, name: true, email: true } }, items: true },
      }),
      prisma.order.count({ where }),
    ]);
  }

  findById(id) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { id: true, name: true, slug: true, images: true } } } },
        payment: true,
      },
    });
  }

  findByOrderNumber(orderNumber) {
    return prisma.order.findUnique({ where: { orderNumber } });
  }

  findByUserId(userId, { skip, limit }) {
    return Promise.all([
      prisma.order.findMany({
        skip, take: limit, where: { userId }, orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.order.count({ where: { userId } }),
    ]);
  }

  create(data) {
    return prisma.order.create({ data });
  }

  update(id, data) {
    return prisma.order.update({ where: { id }, data });
  }

  updateByPaymentIntent(paymentIntentId, data) {
    return prisma.order.update({ where: { paymentIntentId }, data });
  }

  createPayment(data) {
    return prisma.payment.create({ data });
  }

  updatePaymentByIntent(stripePaymentIntentId, data) {
    return prisma.payment.updateMany({ where: { stripePaymentIntentId }, data });
  }
}

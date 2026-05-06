import Stripe from "stripe";
import { OrderRepository } from "./order.repository.js";
import { ProductRepository } from "../product/product.repository.js";
import { ApiError } from "../../shared/errors/ApiError.js";
import config from "../../core/config/index.js";
import { addOrderJob, addEmailJob } from "../../core/queue/index.js";
import { getPagination, buildPaginationMeta } from "../../shared/helpers/pagination.js";
import { CANCELLABLE_STATUSES } from "../../shared/constants/orderStatus.js";

const stripe = new Stripe(config.stripe.secretKey);

export class OrderService {
  constructor() {
    this.repo = new OrderRepository();
    this.productRepo = new ProductRepository();
  }

  #generateOrderNumber() {
    return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  }

  async createOrder(userId, { items, shippingAddress, couponCode }) {
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await this.productRepo.findById(item.productId);
      if (!product) throw ApiError.badRequest(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) throw ApiError.badRequest(`Insufficient stock for ${product.name}`);

      subtotal += product.price * item.quantity;
      orderItems.push({ productId: product.id, quantity: item.quantity, price: product.price, name: product.name, image: product.images[0] || null });
    }

    const tax = parseFloat((subtotal * 0.1).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    const order = await this.repo.create({
      orderNumber: this.#generateOrderNumber(),
      userId,
      subtotal,
      tax,
      total,
      couponCode,
      shippingAddress,
      items: { create: orderItems },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "usd",
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
    });

    await this.repo.update(order.id, { paymentIntentId: paymentIntent.id });

    return { order: await this.repo.findById(order.id), clientSecret: paymentIntent.client_secret };
  }

  async handleStripeWebhook(signature, rawBody) {
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);
    } catch {
      throw ApiError.badRequest("Invalid webhook signature");
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      await this.repo.updateByPaymentIntent(intent.id, { paymentStatus: "PAID", status: "CONFIRMED" });
      await this.repo.updatePaymentByIntent(intent.id, { status: "PAID", stripeChargeId: intent.latest_charge });

      const order = await this.repo.findById(intent.metadata.orderId);
      if (order) {
        await addEmailJob("order_confirmation", { to: order.user.email, order });
        await addOrderJob("process_order", { orderId: order.id });
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object;
      await this.repo.updateByPaymentIntent(intent.id, { paymentStatus: "FAILED", status: "CANCELLED" });
      await this.repo.updatePaymentByIntent(intent.id, { status: "FAILED" });
    }

    return { received: true };
  }

  async getOrders(query) {
    const { page, limit, skip } = getPagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.userId) where.userId = query.userId;
    const [orders, total] = await this.repo.findAll({ skip, limit, where });
    return { orders, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getOrder(id) {
    const order = await this.repo.findById(id);
    if (!order) throw ApiError.notFound("Order not found");
    return order;
  }

  async getUserOrders(userId, query) {
    const { page, limit, skip } = getPagination(query);
    const [orders, total] = await this.repo.findByUserId(userId, { skip, limit });
    return { orders, pagination: buildPaginationMeta(total, page, limit) };
  }

  async updateOrderStatus(id, status, trackingNumber) {
    const order = await this.repo.findById(id);
    if (!order) throw ApiError.notFound("Order not found");
    const updated = await this.repo.update(id, { status, ...(trackingNumber ? { trackingNumber } : {}) });
    await addEmailJob("order_status_update", { to: order.user.email, order: updated });
    return updated;
  }

  async cancelOrder(id, userId) {
    const order = await this.repo.findById(id);
    if (!order) throw ApiError.notFound("Order not found");
    if (order.userId !== userId) throw ApiError.forbidden();
    if (!CANCELLABLE_STATUSES.includes(order.status)) throw ApiError.badRequest("Order cannot be cancelled at this stage");
    return this.repo.update(id, { status: "CANCELLED" });
  }
}

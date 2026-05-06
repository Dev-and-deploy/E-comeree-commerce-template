import { OrderService } from "./order.service.js";
import { success, created, paginated } from "../../shared/helpers/response.js";

const orderService = new OrderService();

export const createOrder = async (req, res, next) => {
  try {
    const result = await orderService.createOrder(req.user.id, req.body);
    created(res, result, "Order created");
  } catch (err) { next(err); }
};

export const stripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"];
    const result = await orderService.handleStripeWebhook(sig, req.body);
    res.json(result);
  } catch (err) { next(err); }
};

export const getOrders = async (req, res, next) => {
  try {
    const { orders, pagination } = await orderService.getOrders(req.query);
    paginated(res, orders, pagination);
  } catch (err) { next(err); }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await orderService.getOrder(req.params.id);
    success(res, order);
  } catch (err) { next(err); }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const { orders, pagination } = await orderService.getUserOrders(req.user.id, req.query);
    paginated(res, orders, pagination);
  } catch (err) { next(err); }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status, trackingNumber);
    success(res, order, "Order status updated");
  } catch (err) { next(err); }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user.id);
    success(res, order, "Order cancelled");
  } catch (err) { next(err); }
};

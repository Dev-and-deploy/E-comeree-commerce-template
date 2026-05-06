import { Resend } from "resend";
import config from "../config/index.js";
import logger from "../utils/logger.js";

const resend = new Resend(config.resend.apiKey);

export const sendMail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: config.resend.from,
      to,
      subject,
      html,
    });
    if (error) throw new Error(error.message);
    return data;
  } catch (err) {
    logger.error("Email send failed:", err.message);
    throw err;
  }
};

export const sendOrderConfirmation = (to, order) =>
  sendMail({
    to,
    subject: `Order Confirmed — #${order.orderNumber}`,
    html: `<h1>Thank you for your order!</h1><p>Order #${order.orderNumber} is confirmed. Total: $${order.total}</p>`,
  });

export const sendPasswordReset = (to, resetUrl) =>
  sendMail({
    to,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
  });

export const sendOtp = (to, otp) =>
  sendMail({
    to,
    subject: "Your OTP Code",
    html: `<p>Your OTP is <strong>${otp}</strong>. Expires in 10 minutes.</p>`,
  });

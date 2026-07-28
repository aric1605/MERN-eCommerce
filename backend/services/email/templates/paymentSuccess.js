import { wrapEmailLayout } from './layout.js';

export const getPaymentSuccessTemplate = (order, user, details) => {
  const appName = process.env.APP_NAME || 'MERN Shop';

  const html = wrapEmailLayout({
    title: 'Payment Successful',
    bodyContent: `
      <h2>Payment Received!</h2>
      <p>Dear ${user?.name || 'Customer'},</p>
      <p>Your payment for Order <strong>#${order._id}</strong> has been successfully processed.</p>
      <p><strong>Payment Transaction ID:</strong> ${details?.id || order.paymentResult?.id || 'N/A'}</p>
      <p><strong>Amount Paid:</strong> ₹${order.totalPrice}</p>
      <p><strong>Payment Status:</strong> Successful</p>
      <p>Your order is currently being processed for shipment.</p>
    `
  });

  const text = `Hi ${user?.name || 'Customer'},\n\nPayment received for Order #${order._id}.\nAmount: ₹${order.totalPrice}\nTransaction ID: ${details?.id || order.paymentResult?.id || 'N/A'}\n\nThanks,\n${appName} Team`;

  return { html, text, subject: `${appName} - Payment Successful for Order #${order._id}` };
};

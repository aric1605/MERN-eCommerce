import { wrapEmailLayout } from './layout.js';

export const getOrderDeliveredTemplate = (order, user) => {
  const appName = process.env.APP_NAME || 'MERN Shop';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  const html = wrapEmailLayout({
    title: 'Your Order Has Been Delivered!',
    bodyContent: `
      <h2>Order Delivered!</h2>
      <p>Dear ${user?.name || 'Customer'},</p>
      <p>Your Order <strong>#${order._id}</strong> has been successfully delivered.</p>
      <p>Delivered on: ${order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : new Date().toLocaleString()}</p>
      <p>We hope you enjoy your purchase! Thank you for shopping with ${appName}.</p>
      <p style="text-align: center;">
        <a href="${clientUrl}" class="btn">Shop More</a>
      </p>
    `
  });

  const text = `Hi ${user?.name || 'Customer'},\n\nYour Order #${order._id} has been delivered!\nThank you for shopping with ${appName}.\n\nThanks,\n${appName} Team`;

  return { html, text, subject: `${appName} - Order #${order._id} Delivered` };
};

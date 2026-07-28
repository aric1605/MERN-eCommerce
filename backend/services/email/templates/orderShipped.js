import { wrapEmailLayout } from './layout.js';

export const getOrderShippedTemplate = (order, user) => {
  const appName = process.env.APP_NAME || 'MERN Shop';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  const html = wrapEmailLayout({
    title: 'Your Order Has Shipped!',
    bodyContent: `
      <h2>Great news, ${user?.name || 'Customer'}!</h2>
      <p>Your Order <strong>#${order._id}</strong> has been shipped and is on its way to you.</p>
      <p><strong>Shipping Address:</strong></p>
      <p>
        ${order.shippingAddress?.address}, ${order.shippingAddress?.city}<br>
        ${order.shippingAddress?.postalCode}, ${order.shippingAddress?.country}
      </p>
      <p style="text-align: center;">
        <a href="${clientUrl}/order/${order._id}" class="btn">View Order Status</a>
      </p>
    `
  });

  const text = `Hi ${user?.name || 'Customer'},\n\nYour Order #${order._id} has shipped!\nView details: ${clientUrl}/order/${order._id}\n\nThanks,\n${appName} Team`;

  return { html, text, subject: `${appName} - Order #${order._id} Shipped` };
};

import { wrapEmailLayout } from './layout.js';

export const getPaymentFailedTemplate = (order, user, details) => {
  const appName = process.env.APP_NAME || 'MERN Shop';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  const html = wrapEmailLayout({
    title: 'Payment Failed',
    bodyContent: `
      <h2>Payment Issue Detected</h2>
      <p>Dear ${user?.name || 'Customer'},</p>
      <p>We were unable to process your payment for Order <strong>#${order._id}</strong>.</p>
      <p><strong>Reason:</strong> ${details?.message || details?.reason || 'Transaction cancelled or failed.'}</p>
      <p>Don't worry, your order items are saved. You can retry the payment by viewing your order details:</p>
      <p style="text-align: center;">
        <a href="${clientUrl}/order/${order._id}" class="btn">Retry Payment</a>
      </p>
    `
  });

  const text = `Hi ${user?.name || 'Customer'},\n\nPayment failed for Order #${order._id}.\nReason: ${details?.message || details?.reason || 'Transaction failed.'}\n\nRetry payment: ${clientUrl}/order/${order._id}\n\nThanks,\n${appName} Team`;

  return { html, text, subject: `${appName} - Payment Failed for Order #${order._id}` };
};

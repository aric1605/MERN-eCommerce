import { wrapEmailLayout } from './layout.js';

export const getWelcomeTemplate = (user) => {
  const appName = process.env.APP_NAME || 'MERN Shop';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  const html = wrapEmailLayout({
    title: `Welcome to ${appName}!`,
    bodyContent: `
      <h2>Welcome aboard, ${user.name}!</h2>
      <p>Thank you for signing up for an account with ${appName}. We are thrilled to have you with us.</p>
      <p>You can now browse our full product catalog, manage your cart, and place orders seamlessly.</p>
      <p style="text-align: center;">
        <a href="${clientUrl}" class="btn">Explore Products</a>
      </p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    `
  });

  const text = `Hi ${user.name},\n\nWelcome to ${appName}! Thank you for creating an account with us.\n\nBrowse products: ${clientUrl}\n\nThanks,\n${appName} Team`;

  return { html, text, subject: `Welcome to ${appName}!` };
};

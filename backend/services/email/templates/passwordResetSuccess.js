import { wrapEmailLayout } from './layout.js';

export const getPasswordResetSuccessTemplate = (user) => {
  const appName = process.env.APP_NAME || 'MERN Shop';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  const html = wrapEmailLayout({
    title: 'Password Successfully Reset',
    bodyContent: `
      <h2>Hello ${user.name},</h2>
      <p>This is confirmation that the password for your ${appName} account has been successfully updated.</p>
      <p>If you performed this change, no further action is required.</p>
      <p style="text-align: center;">
        <a href="${clientUrl}/login" class="btn">Log In Now</a>
      </p>
      <p>If you did not make this change, please contact our support team immediately.</p>
    `
  });

  const text = `Hi ${user.name},\n\nYour password for ${appName} has been successfully reset.\n\nLog in here: ${clientUrl}/login\n\nThanks,\n${appName} Team`;

  return { html, text, subject: `${appName} - Password Successfully Reset` };
};

import { wrapEmailLayout } from './layout.js';

export const getPasswordResetTemplate = (user, resetLink) => {
  const appName = process.env.APP_NAME || 'MERN Shop';

  const html = wrapEmailLayout({
    title: 'Password Reset Request',
    bodyContent: `
      <h2>Hello ${user.name},</h2>
      <p>We received a request to reset the password for your account.</p>
      <p>Click the button below to set a new password. This link will expire in 15 minutes:</p>
      <p style="text-align: center;">
        <a href="${resetLink}" class="btn">Reset Password</a>
      </p>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all;"><a href="${resetLink}">${resetLink}</a></p>
      <p>If you did not request a password reset, please ignore this message.</p>
    `
  });

  const text = `Hi ${user.name},\n\nWe received a password reset request for your account. Click the link below to set a new password (expires in 15 mins):\n${resetLink}\n\nIf you didn't request this, ignore this email.\n\nThanks,\n${appName} Team`;

  return { html, text, subject: `${appName} - Password Reset Request` };
};

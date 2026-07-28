import transporter from '../../config/email.js';
import { getWelcomeTemplate } from './templates/welcome.js';
import { getPasswordResetTemplate } from './templates/passwordReset.js';
import { getPasswordResetSuccessTemplate } from './templates/passwordResetSuccess.js';
import { getOrderConfirmationTemplate } from './templates/orderConfirmation.js';
import { getPaymentSuccessTemplate } from './templates/paymentSuccess.js';
import { getPaymentFailedTemplate } from './templates/paymentFailed.js';
import { getOrderShippedTemplate } from './templates/orderShipped.js';
import { getOrderDeliveredTemplate } from './templates/orderDelivered.js';

class EmailService {
  /**
   * Safe helper method to send emails without throwing errors that break API flows.
   */
  static async _sendMail(to, templateObj, templateName) {
    try {
      if (!to) {
        console.warn(`[EmailService] Skipping ${templateName}: No recipient email provided.`);
        return;
      }

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'MERN Shop'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to,
        subject: templateObj.subject,
        text: templateObj.text,
        html: templateObj.html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Sent ${templateName} email to ${to}: ${info.messageId}`);
    } catch (error) {
      console.error(`[EmailService] Failed to send ${templateName} email to ${to}:`, error.message);
      // Fail safely — do not re-throw error
    }
  }

  static async sendWelcome(user) {
    const template = getWelcomeTemplate(user);
    await this._sendMail(user.email, template, 'Welcome');
  }

  static async sendPasswordReset(user, resetLink) {
    const template = getPasswordResetTemplate(user, resetLink);
    await this._sendMail(user.email, template, 'PasswordReset');
  }

  static async sendPasswordResetSuccess(user) {
    const template = getPasswordResetSuccessTemplate(user);
    await this._sendMail(user.email, template, 'PasswordResetSuccess');
  }

  static async sendOrderConfirmation(order, user) {
    const email = user?.email || order.user?.email;
    const template = getOrderConfirmationTemplate(order, user);
    await this._sendMail(email, template, 'OrderConfirmation');
  }

  static async sendPaymentSuccess(order, user, details) {
    const email = user?.email || order.user?.email;
    const template = getPaymentSuccessTemplate(order, user, details);
    await this._sendMail(email, template, 'PaymentSuccess');
  }

  static async sendPaymentFailed(order, user, details) {
    const email = user?.email || order.user?.email;
    const template = getPaymentFailedTemplate(order, user, details);
    await this._sendMail(email, template, 'PaymentFailed');
  }

  static async sendOrderShipped(order, user) {
    const email = user?.email || order.user?.email;
    const template = getOrderShippedTemplate(order, user);
    await this._sendMail(email, template, 'OrderShipped');
  }

  static async sendOrderDelivered(order, user) {
    const email = user?.email || order.user?.email;
    const template = getOrderDeliveredTemplate(order, user);
    await this._sendMail(email, template, 'OrderDelivered');
  }
}

export default EmailService;

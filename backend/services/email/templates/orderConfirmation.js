import { wrapEmailLayout } from './layout.js';

export const getOrderConfirmationTemplate = (order, user) => {
  const appName = process.env.APP_NAME || 'MERN Shop';

  const itemsRows = order.orderItems
    ? order.orderItems
        .map(
          item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>₹${item.price}</td>
      <td>₹${(item.qty * item.price).toFixed(2)}</td>
    </tr>
  `
        )
        .join('')
    : '';

  const html = wrapEmailLayout({
    title: `Order Confirmation #${order._id}`,
    bodyContent: `
      <h2>Thank you for your order, ${user?.name || 'Customer'}!</h2>
      <p>We've received your order and payment. Below are your order summary details:</p>
      
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>

      <h3>Order Items</h3>
      <table class="order-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <p><strong>Subtotal:</strong> ₹${order.itemsPrice}</p>
      <p><strong>Tax:</strong> ₹${order.taxPrice}</p>
      <p><strong>Shipping:</strong> ₹${order.shippingPrice}</p>
      <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>

      <h3>Shipping Address</h3>
      <p>
        ${order.shippingAddress?.address}, ${order.shippingAddress?.city}<br>
        ${order.shippingAddress?.postalCode}, ${order.shippingAddress?.country}
      </p>

      <p>We will notify you once your order has been shipped!</p>
    `
  });

  const text = `Hi ${user?.name || 'Customer'},\n\nThank you for your order! Order ID: ${order._id}\nTotal: ₹${order.totalPrice}\nPayment Method: ${order.paymentMethod}\n\nWe will notify you when it ships.\n\nThanks,\n${appName} Team`;

  return { html, text, subject: `${appName} - Order Confirmation #${order._id}` };
};

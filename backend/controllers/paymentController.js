import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import EmailService from '../services/email/emailService.js';

const config = (req, res) =>
  res.send({
    razorpayKeyId: process.env.RAZORPAY_KEY_ID
  });

const order = async (req, res, next) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const { amount, currency, receipt, orderId } = req.body;

    // Extract order ID from receipt ('receipt#<id>') or orderId
    const dbOrderId = orderId || (receipt ? receipt.replace('receipt#', '') : null);

    if (!dbOrderId) {
      res.statusCode = 400;
      throw new Error('Order ID is required to create a Razorpay order');
    }

    const dbOrder = await Order.findById(dbOrderId);
    if (!dbOrder) {
      res.statusCode = 404;
      throw new Error('Order not found');
    }

    // Ownership Authorization Check: Ensure user owns this order
    if (dbOrder.user.toString() !== req.user._id.toString()) {
      res.statusCode = 403;
      throw new Error('Not authorized to initiate payment for this order');
    }

    // Server-side amount recalculation in paise (never trust client-supplied amount)
    const expectedAmountPaise = Math.round(dbOrder.totalPrice * 100);

    const options = {
      amount: expectedAmountPaise,
      currency: currency || 'INR',
      receipt: `receipt#${dbOrder._id}`,
      notes: {
        orderId: dbOrder._id.toString(),
        userId: req.user._id.toString()
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    if (!razorpayOrder) {
      res.statusCode = 500;
      throw new Error('Failed to create Razorpay order');
    }

    res.status(201).json(razorpayOrder);
  } catch (error) {
    next(error);
  }
};

const validate = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Signature verification using Razorpay Secret
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      res.statusCode = 400;
      throw new Error('Payment signature verification failed!');
    }

    // Find corresponding Order in database
    let dbOrder;
    if (orderId) {
      dbOrder = await Order.findById(orderId).populate('user', 'name email');
    } else {
      dbOrder = await Order.findOne({ user: req.user._id, isPaid: false }).sort({ createdAt: -1 }).populate('user', 'name email');
    }

    if (!dbOrder) {
      res.statusCode = 404;
      throw new Error('Order not found for payment validation');
    }

    // Idempotency: Ignore if already processed
    if (dbOrder.isPaid) {
      return res.status(200).json({
        id: razorpay_payment_id,
        status: 'success',
        message: 'Payment already verified',
        updateTime: new Date().toLocaleTimeString()
      });
    }

    // Update order payment status
    dbOrder.isPaid = true;
    dbOrder.paidAt = new Date();
    dbOrder.status = 'Paid';
    dbOrder.paymentResult = {
      id: razorpay_payment_id,
      status: 'captured',
      update_time: new Date().toISOString(),
      email_address: dbOrder.user?.email || req.user.email
    };

    // Decrement stock for order items atomically
    for (const item of dbOrder.orderItems) {
      await Product.updateOne(
        { _id: item.product, countInStock: { $gte: item.qty } },
        { $inc: { countInStock: -item.qty } }
      );
    }

    const updatedOrder = await dbOrder.save();

    // Trigger emails safely
    await EmailService.sendPaymentSuccess(updatedOrder, dbOrder.user || req.user, { id: razorpay_payment_id });
    await EmailService.sendOrderConfirmation(updatedOrder, dbOrder.user || req.user);

    res.status(200).json({
      id: razorpay_payment_id,
      status: 'success',
      message: 'Payment is successful',
      updateTime: new Date().toLocaleTimeString()
    });
  } catch (error) {
    next(error);
  }
};

const razorpayWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      res.statusCode = 400;
      return res.json({ message: 'Missing webhook signature' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      res.statusCode = 400;
      return res.json({ message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment ? payload.payment.entity : null;
      const orderEntity = payload.order ? payload.order.entity : null;

      const targetOrderId =
        orderEntity?.notes?.orderId ||
        paymentEntity?.notes?.orderId ||
        orderEntity?.receipt?.replace('receipt#', '');

      if (targetOrderId) {
        const order = await Order.findById(targetOrderId).populate('user', 'name email');
        if (order && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.status = 'Paid';
          order.paymentResult = {
            id: paymentEntity?.id || 'WEBHOOK',
            status: 'captured',
            update_time: new Date().toISOString(),
            email_address: paymentEntity?.email || order.user?.email
          };

          for (const item of order.orderItems) {
            await Product.updateOne(
              { _id: item.product, countInStock: { $gte: item.qty } },
              { $inc: { countInStock: -item.qty } }
            );
          }

          const updatedOrder = await order.save();
          await EmailService.sendPaymentSuccess(updatedOrder, order.user, { id: paymentEntity?.id });
          await EmailService.sendOrderConfirmation(updatedOrder, order.user);
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payment ? payload.payment.entity : null;
      const targetOrderId = paymentEntity?.notes?.orderId;

      if (targetOrderId) {
        const order = await Order.findById(targetOrderId).populate('user', 'name email');
        if (order && !order.isPaid) {
          order.status = 'Failed';
          await order.save();
          await EmailService.sendPaymentFailed(order, order.user, {
            reason: paymentEntity?.error_description || 'Payment failed'
          });
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error.message);
    res.status(200).json({ status: 'ok' }); // Always return 200 to webhook issuer to prevent retries
  }
};

export { config, order, validate, razorpayWebhook };

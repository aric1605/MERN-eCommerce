import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import EmailService from '../services/email/emailService.js';

const addDecimals = num => (Math.round(num * 100) / 100).toFixed(2);

// @desc     Create new order
// @method   POST
// @endpoint /api/v1/orders
// @access   Private
const addOrderItems = async (req, res, next) => {
  try {
    const {
      cartItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    if (!cartItems || cartItems.length === 0) {
      res.statusCode = 400;
      throw new Error('No order items.');
    }

    // 1. Fetch products from DB to verify stock and recalculate prices
    const productIds = cartItems.map(item => item.product || item._id);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    if (dbProducts.length !== cartItems.length) {
      res.statusCode = 404;
      throw new Error('One or more products in cart were not found.');
    }

    // 2. Stock validation & server-side price recalculation
    const verifiedOrderItems = [];
    let serverItemsPrice = 0;

    for (const item of cartItems) {
      const dbProduct = dbProducts.find(
        p => p._id.toString() === (item.product || item._id).toString()
      );

      if (!dbProduct) {
        res.statusCode = 404;
        throw new Error(`Product not found: ${item.name}`);
      }

      if (dbProduct.countInStock < item.qty) {
        res.statusCode = 400;
        throw new Error(
          `Insufficient stock for "${dbProduct.name}". Available: ${dbProduct.countInStock}, requested: ${item.qty}`
        );
      }

      serverItemsPrice += dbProduct.price * item.qty;

      verifiedOrderItems.push({
        name: dbProduct.name,
        qty: item.qty,
        image: dbProduct.image,
        price: dbProduct.price,
        product: dbProduct._id
      });
    }

    const calculatedItemsPrice = Number(addDecimals(serverItemsPrice));
    const calculatedShippingPrice = Number(
      addDecimals(calculatedItemsPrice > 100 ? 0 : 10)
    );
    const calculatedTaxPrice = Number(
      addDecimals(0.15 * calculatedItemsPrice)
    );
    const calculatedTotalPrice = Number(
      addDecimals(
        calculatedItemsPrice + calculatedShippingPrice + calculatedTaxPrice
      )
    );

    // Verify received prices against server-calculated prices
    if (
      Math.abs(Number(itemsPrice) - calculatedItemsPrice) > 0.01 ||
      Math.abs(Number(shippingPrice) - calculatedShippingPrice) > 0.01 ||
      Math.abs(Number(taxPrice) - calculatedTaxPrice) > 0.01 ||
      Math.abs(Number(totalPrice) - calculatedTotalPrice) > 0.01
    ) {
      res.statusCode = 400;
      throw new Error('Price mismatch detected. Order prices were recalculated.');
    }

    const order = new Order({
      user: req.user._id,
      orderItems: verifiedOrderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: calculatedItemsPrice,
      taxPrice: calculatedTaxPrice,
      shippingPrice: calculatedShippingPrice,
      totalPrice: calculatedTotalPrice,
      status: 'Pending'
    });

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};

// @desc     Get logged-in user orders
// @method   GET
// @endpoint /api/v1/orders/my-orders
// @access   Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      res.statusCode = 404;
      throw new Error('No orders found for the logged-in user.');
    }

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc     Get order by ID
// @method   GET
// @endpoint /api/v1/orders/:id
// @access   Private
const getOrderById = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;

    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      res.statusCode = 404;
      throw new Error('Order not found!');
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc     Update order to paid
// @method   PUT
// @endpoint /api/v1/orders/:id/pay
// @access   Private
const updateOrderToPaid = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;
    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      res.statusCode = 404;
      throw new Error('Order not found!');
    }

    if (order.isPaid) {
      return res.status(200).json(order);
    }

    // Update status and payment results
    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'Paid';
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.updateTime,
      email_address: req.body.email
    };

    // Decrement stock for order items atomically
    for (const item of order.orderItems) {
      await Product.updateOne(
        { _id: item.product, countInStock: { $gte: item.qty } },
        { $inc: { countInStock: -item.qty } }
      );
    }

    const updatedOrder = await order.save();

    // Trigger emails safely
    await EmailService.sendPaymentSuccess(updatedOrder, req.user || order.user, req.body);
    await EmailService.sendOrderConfirmation(updatedOrder, req.user || order.user);

    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc     Update order to shipped
// @method   PUT
// @endpoint /api/v1/orders/:id/ship
// @access   Private/Admin
const updateOrderToShipped = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;
    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      res.statusCode = 404;
      throw new Error('Order not found!');
    }

    // State transition check: Pending -> Paid -> Shipped -> Delivered
    if (!order.isPaid && order.status !== 'Paid') {
      res.statusCode = 400;
      throw new Error('Invalid state transition: Order must be Paid before it can be Shipped.');
    }

    if (order.isShipped) {
      return res.status(200).json(order);
    }

    order.isShipped = true;
    order.shippedAt = new Date();
    order.status = 'Shipped';

    const updatedOrder = await order.save();

    // Trigger Order Shipped Email safely
    await EmailService.sendOrderShipped(updatedOrder, order.user);

    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc     Update order to delivered
// @method   PUT
// @endpoint /api/v1/orders/:id/deliver
// @access   Private/Admin
const updateOrderToDeliver = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;
    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      res.statusCode = 404;
      throw new Error('Order not found!');
    }

    // State transition check: Order should be Shipped before Delivered
    if (order.status !== 'Shipped' && order.status !== 'Paid') {
      res.statusCode = 400;
      throw new Error('Invalid state transition: Order must be Shipped before it can be Delivered.');
    }

    if (order.isDelivered) {
      return res.status(200).json(order);
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.status = 'Delivered';

    const updatedOrder = await order.save();

    // Trigger Order Delivered Email safely
    await EmailService.sendOrderDelivered(updatedOrder, order.user);

    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc     Get all orders
// @method   GET
// @endpoint /api/v1/orders
// @access   Private/Admin
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'id name').sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      res.statusCode = 404;
      throw new Error('Orders not found!');
    }
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToShipped,
  updateOrderToDeliver,
  getOrders
};

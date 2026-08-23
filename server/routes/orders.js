const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

// Create New Order (Checkout)
const handleCreateOrder = (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = 'Credit / Debit Card (Sandbox)',
      couponCode = null,
      deliverySpeed = 'standard',
      currency = 'USD',
      exchangeRate = 1.0,
      displayTotal = null
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart items are required to place an order.' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street) {
      return res.status(400).json({ success: false, message: 'Valid shipping address is required.' });
    }

    // Verify products and calculate subtotal
    let subtotal = 0;
    const orderItems = [];
    const sellerIdsSet = new Set();

    for (const item of items) {
      const product = db.findById('products', item.productId || item.id);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ${item.name || item.productId || item.id} no longer exists.` });
      }

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}.`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      sellerIdsSet.add(product.sellerId);

      orderItems.push({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0],
        price: product.price,
        quantity: item.quantity,
        variant: item.variant || null,
        sellerId: product.sellerId
      });

      // Decrement inventory
      db.update('products', product.id, {
        stock: Math.max(0, product.stock - item.quantity)
      });
    }

    // Calculate Discounts & Fees
    let discountAmount = 0;
    if (couponCode) {
      const coupon = db.findOne('coupons', c => c.code.toUpperCase() === couponCode.toUpperCase().trim() && c.isActive);
      if (coupon) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        } else if (coupon.discountType === 'fixed') {
          discountAmount = Math.min(coupon.discountValue, subtotal);
        }
        // Increment coupon usage
        db.update('coupons', coupon.id, { usedCount: (coupon.usedCount || 0) + 1 });
      }
    }

    const shippingFee = deliverySpeed === 'express' ? 14.99 : (subtotal > 50 ? 0 : 9.99);
    const taxAmount = +((subtotal - discountAmount) * 0.08).toFixed(2);
    const totalAmount = +((subtotal - discountAmount) + shippingFee + taxAmount).toFixed(2);
    const isCOD = paymentMethod.toLowerCase().includes('cash on delivery') || paymentMethod.toLowerCase().includes('cod') || paymentMethod.toLowerCase().includes('cash');
    const paymentStatus = isCOD ? 'pending' : 'paid';
    const orderNumber = 'MKZ-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder = {
      id: `ord_${uuidv4().substring(0, 8)}`,
      orderNumber,
      userId: req.user.id,
      sellerIds: Array.from(sellerIdsSet),
      items: orderItems,
      shippingAddress,
      currency: currency || 'USD',
      exchangeRate: parseFloat(exchangeRate) || 1.0,
      displayTotal: displayTotal || null,
      baseSubtotalUSD: +subtotal.toFixed(2),
      baseTotalUSD: totalAmount,
      subtotal: +subtotal.toFixed(2),
      discountAmount: +discountAmount.toFixed(2),
      shippingFee: +shippingFee.toFixed(2),
      taxAmount: +taxAmount.toFixed(2),
      totalAmount,
      couponApplied: couponCode,
      paymentMethod,
      paymentStatus,
      orderStatus: 'Pending',
      deliverySpeed,
      courierName: deliverySpeed === 'express' ? 'DHL Express Air' : 'BlueDart Ground Direct',
      trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      trackingUrl: `https://track.marketzo.com/live/${orderNumber}`,
      estimatedDelivery: new Date(Date.now() + (deliverySpeed === 'express' ? 2 : 4) * 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      timeline: [
        {
          status: 'Pending',
          time: new Date().toISOString(),
          note: isCOD 
            ? 'Order placed via Cash on Delivery. Awaiting merchant confirmation.'
            : 'Order placed with online payment. Awaiting merchant confirmation.'
        }
      ],
      createdAt: new Date().toISOString()
    };

    db.insert('orders', newOrder);

    // Clear user active cart
    db.delete('cart', item => item.userId === req.user.id && !item.savedForLater);

    // Notify Customer
    db.insert('notifications', {
      id: `notif_${uuidv4().substring(0, 8)}`,
      userId: req.user.id,
      title: 'Order Confirmed! 🎉',
      message: `Your order #${orderNumber} for $${totalAmount} has been confirmed.`,
      type: 'order',
      read: false,
      link: '/account?tab=orders',
      createdAt: new Date().toISOString()
    });

    // Notify Sellers
    for (const sellerId of Array.from(sellerIdsSet)) {
      const seller = db.findById('sellers', sellerId);
      if (seller) {
        db.insert('notifications', {
          id: `notif_${uuidv4().substring(0, 8)}`,
          userId: seller.userId,
          title: 'New Order Received 📦',
          message: `New order #${orderNumber} received. Please review and dispatch.`,
          type: 'seller',
          read: false,
          link: '/seller?tab=orders',
          createdAt: new Date().toISOString()
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: newOrder
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, message: 'Failed to process order.' });
  }
};

router.post('/create', authenticate, handleCreateOrder);
router.post('/', authenticate, handleCreateOrder);

// Get Customer Orders
const handleGetMyOrders = (req, res) => {
  const orders = db.findAll('orders', o => o.userId === req.user.id);
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, orders });
};

router.get('/my-orders', authenticate, handleGetMyOrders);
router.get('/', authenticate, handleGetMyOrders);

// Get Single Order Details
router.get('/:orderId', authenticate, (req, res) => {
  const { orderId } = req.params;
  const order = db.findOne('orders', o => o.id === orderId || o.orderNumber === orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  // Ensure authorized (customer who placed it, involved seller, or admin)
  const isCustomer = order.userId === req.user.id;
  const isSeller = req.seller && order.sellerIds.includes(req.seller.id);
  const isAdmin = req.user.role === 'admin';

  if (!isCustomer && !isSeller && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Forbidden. You do not have access to this order.' });
  }

  res.json({ success: true, order });
});

// Cancel Order
router.post('/:orderId/cancel', authenticate, (req, res) => {
  const { orderId } = req.params;
  const { reason = 'Cancelled by customer' } = req.body;

  const order = db.findById('orders', orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  if (order.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Unauthorized.' });
  }

  if (['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus)) {
    return res.status(400).json({
      success: false,
      message: `Cannot cancel order in "${order.orderStatus}" state. Please request a return after delivery.`
    });
  }

  const updatedTimeline = [
    ...order.timeline,
    {
      status: 'Cancelled',
      time: new Date().toISOString(),
      note: `Order cancelled: ${reason}`
    }
  ];

  const updated = db.update('orders', orderId, {
    orderStatus: 'Cancelled',
    timeline: updatedTimeline
  });

  // Restock items
  for (const item of order.items) {
    const product = db.findById('products', item.productId);
    if (product) {
      db.update('products', product.id, { stock: product.stock + item.quantity });
    }
  }

  res.json({ success: true, message: 'Order cancelled successfully.', order: updated });
});

// Update Order Status (Seller or Admin)
router.put('/:orderId/status', authenticate, (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = db.findById('orders', orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const isSeller = req.seller && order.sellerIds.includes(req.seller.id);
    const isAdmin = req.user.role === 'admin';

    if (!isSeller && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You do not have permission to update this order.' });
    }

    // Enforce sequential order lifecycle for sellers (Admin retains override clearance)
    if (!isAdmin) {
      const allowedTransitions = {
        'Pending': ['Confirmed', 'Cancelled'],
        'Confirmed': ['Processing', 'Cancelled'],
        'Processing': ['Shipped', 'Cancelled'],
        'Shipped': ['Out for Delivery', 'Cancelled'],
        'Out for Delivery': ['Delivered', 'Returned'],
        'Delivered': ['Returned'],
        'Cancelled': [],
        'Returned': []
      };

      const allowedNext = allowedTransitions[order.orderStatus] || [];
      if (!allowedNext.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from "${order.orderStatus}" to "${status}". Sellers must follow the sequential order workflow: Pending → Confirmed → Processing → Shipped → Out for Delivery → Delivered.`
        });
      }
    }

    const defaultNotes = {
      'Confirmed': 'Order received and confirmed by merchant. Sent to fulfillment warehouse.',
      'Processing': 'Items packaged in protective Marketzo tamper-evident shipping boxes.',
      'Shipped': 'Dispatched via Marketzo Express. Courier tracking active.',
      'Out for Delivery': 'Courier out on local delivery route.',
      'Delivered': 'Shipment handed over to customer.',
      'Cancelled': 'Order cancelled.',
      'Returned': 'Return request approved and processed.'
    };

    const newTimelineEntry = {
      status,
      time: new Date().toISOString(),
      note: note || defaultNotes[status] || `Order milestone updated to ${status}`
    };

    const updatedTimeline = [...order.timeline, newTimelineEntry];
    const orderUpdates = {
      orderStatus: status,
      timeline: updatedTimeline
    };

    // If order was pending payment (e.g. Cash on Delivery), update paymentStatus to paid upon delivery collection
    if (status === 'Delivered' && order.paymentStatus !== 'paid') {
      orderUpdates.paymentStatus = 'paid';
    }

    const updated = db.update('orders', orderId, orderUpdates);

    // Notify Customer
    db.insert('notifications', {
      id: `notif_${uuidv4().substring(0, 8)}`,
      userId: order.userId,
      title: `Order #${order.orderNumber}: ${status}`,
      message: newTimelineEntry.note,
      type: 'order',
      read: false,
      link: '/account?tab=orders',
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, message: `Order marked as ${status}`, order: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Status update failed.' });
  }
});

// Live Order Tracking Endpoint
router.get('/:orderId/track', authenticate, (req, res) => {
  try {
    const { orderId } = req.params;
    const order = db.findById('orders', orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Ensure authorized user
    if (order.userId !== req.user.id && req.user.role !== 'admin' && (!req.seller || !order.sellerIds.includes(req.seller.id))) {
      return res.status(403).json({ success: false, message: 'Access denied to tracking data.' });
    }

    const tracking = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.orderStatus,
      currentStatus: order.orderStatus,
      courierName: order.courierName || 'Marketzo Direct Express',
      trackingNumber: order.trackingNumber || `TRK-${Math.floor(Math.random() * 90000000 + 10000000)}`,
      trackingUrl: order.trackingUrl || `https://track.marketzo.com/live/${order.orderNumber}`,
      estimatedDelivery: order.estimatedDelivery || 'In 2-4 business days',
      timeline: order.timeline || []
    };

    res.json({ success: true, tracking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch tracking data.' });
  }
});

module.exports = router;

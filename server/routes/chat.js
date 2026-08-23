const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get all conversations for current user (customer or seller)
router.get('/conversations', authenticate, (req, res) => {
  try {
    const userId = req.user.id;
    const seller = db.findOne('sellers', s => s.userId === userId);
    const sellerId = seller ? seller.id : null;

    // Find conversations where user is customer or seller
    const conversations = db.findAll('conversations', c => 
      c.customerId === userId || (sellerId && c.sellerId === sellerId)
    );

    // Sort by latest message
    conversations.sort((a, b) => new Date(b.lastMessageTime || b.createdAt) - new Date(a.lastMessageTime || a.createdAt));

    res.json({ success: true, conversations });
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch conversations.' });
  }
});

// Get or Create conversation for a specific product + seller
router.post(['/start', '/conversations'], authenticate, (req, res) => {
  try {
    const { sellerId, productId, initialMessage } = req.body;
    if (!sellerId) {
      return res.status(400).json({ success: false, message: 'Seller ID is required to start a chat.' });
    }

    const seller = db.findById('sellers', sellerId);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller store not found.' });
    }

    const product = productId ? db.findById('products', productId) : null;

    // Check if conversation already exists between this customer and seller (and optionally product)
    let conv = db.findOne('conversations', c => 
      c.customerId === req.user.id && 
      c.sellerId === sellerId && 
      (!productId || c.productId === productId)
    );

    if (!conv) {
      conv = db.insert('conversations', {
        id: `conv_${uuidv4().substring(0, 8)}`,
        customerId: req.user.id,
        customerName: req.user.name || 'Shopper',
        sellerId: seller.id,
        sellerName: seller.storeName,
        productId: product ? product.id : null,
        productName: product ? product.name : null,
        productImage: product && product.images ? product.images[0] : null,
        productPrice: product ? product.price : null,
        lastMessage: initialMessage || 'Conversation started',
        lastMessageTime: new Date().toISOString(),
        unreadCountCustomer: 0,
        unreadCountSeller: initialMessage ? 1 : 0,
        createdAt: new Date().toISOString()
      });

      if (initialMessage) {
        db.insert('messages', {
          id: `msg_${uuidv4().substring(0, 8)}`,
          conversationId: conv.id,
          senderId: req.user.id,
          senderRole: 'customer',
          senderName: req.user.name,
          text: initialMessage,
          image: null,
          createdAt: new Date().toISOString(),
          read: false
        });
      }
    }

    res.json({ success: true, conversation: conv });
  } catch (err) {
    console.error('Start chat error:', err);
    res.status(500).json({ success: false, message: 'Failed to initiate conversation.' });
  }
});

// Get Messages for a specific conversation
router.get(['/conversations/:id/messages', '/conversations/:id'], authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const conv = db.findById('conversations', id);
    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    // Security check: verify user is customer or seller of this conversation
    const seller = db.findOne('sellers', s => s.userId === req.user.id);
    const isCustomer = conv.customerId === req.user.id;
    const isSeller = seller && conv.sellerId === seller.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isSeller && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this conversation.' });
    }

    const messages = db.findAll('messages', m => m.conversationId === id);
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Clear unread counts for current viewer
    if (isCustomer && conv.unreadCountCustomer > 0) {
      db.update('conversations', id, { unreadCountCustomer: 0 });
    } else if (isSeller && conv.unreadCountSeller > 0) {
      db.update('conversations', id, { unreadCountSeller: 0 });
    }

    res.json({ success: true, conversation: conv, messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch message history.' });
  }
});

// Send Message
router.post('/conversations/:id/messages', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const rawText = req.body.text || req.body.message || req.body.content;
    const { image } = req.body;

    if (!rawText && !image) {
      return res.status(400).json({ success: false, message: 'Message text or image is required.' });
    }

    const text = rawText ? rawText.trim() : '';

    const conv = db.findById('conversations', id);
    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const seller = db.findOne('sellers', s => s.userId === req.user.id);
    const isCustomer = conv.customerId === req.user.id;
    const isSeller = seller && conv.sellerId === seller.id;

    if (!isCustomer && !isSeller && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to send message in this conversation.' });
    }

    const senderRole = isSeller ? 'seller' : 'customer';
    const senderName = isSeller ? (seller.storeName || req.user.name) : req.user.name;

    const newMessage = db.insert('messages', {
      id: `msg_${uuidv4().substring(0, 8)}`,
      conversationId: id,
      senderId: req.user.id,
      senderRole,
      senderName,
      text: text ? text.trim() : null,
      image: image || null,
      createdAt: new Date().toISOString(),
      read: false
    });

    // Update conversation metadata & unread counters
    db.update('conversations', id, {
      lastMessage: text ? text.trim() : '📷 Sent an image',
      lastMessageTime: new Date().toISOString(),
      unreadCountCustomer: isSeller ? (conv.unreadCountCustomer || 0) + 1 : 0,
      unreadCountSeller: isCustomer ? (conv.unreadCountSeller || 0) + 1 : 0
    });

    // Send notification to recipient
    const recipientUserId = isCustomer ? (seller ? seller.userId : null) : conv.customerId;
    if (recipientUserId) {
      db.insert('notifications', {
        id: `notif_${uuidv4().substring(0, 8)}`,
        userId: recipientUserId,
        title: `💬 New Message from ${senderName}`,
        message: text ? text.substring(0, 80) : 'Sent an image attachment.',
        type: isCustomer ? 'seller' : 'order',
        read: false,
        link: isCustomer ? '/seller?tab=messages' : '/account?tab=messages',
        createdAt: new Date().toISOString()
      });
    }

    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ success: false, message: 'Could not deliver message.' });
  }
});

module.exports = router;

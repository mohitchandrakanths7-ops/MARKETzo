const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get User Notifications
router.get('/', authenticate, (req, res) => {
  const notifications = db.findAll('notifications', n => n.userId === req.user.id);
  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const unreadCount = notifications.filter(n => !n.read).length;
  res.json({ success: true, notifications, unreadCount });
});

// Mark Notification as Read
router.put('/:notificationId/read', authenticate, (req, res) => {
  const { notificationId } = req.params;
  const notif = db.findById('notifications', notificationId);
  if (!notif || notif.userId !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  const updated = db.update('notifications', notificationId, { read: true });
  res.json({ success: true, notification: updated });
});

// Mark All Notifications as Read
router.put('/mark-all-read', authenticate, (req, res) => {
  const notifs = db.findAll('notifications', n => n.userId === req.user.id && !n.read);
  for (const n of notifs) {
    db.update('notifications', n.id, { read: true });
  }
  res.json({ success: true, message: 'All notifications marked as read.' });
});

module.exports = router;

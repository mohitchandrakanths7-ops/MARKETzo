const express = require('express');
const router = express.Router();

// Serviceability & delivery estimation checker
router.get('/check/:pincode', (req, res) => {
  const { pincode } = req.params;
  
  if (!pincode || pincode.length < 4) {
    return res.status(400).json({ success: false, message: 'Please enter a valid postal/zip code.' });
  }

  // Simulate dynamic delivery dates based on zip
  const now = new Date();
  const deliveryDays = (pincode.charCodeAt(0) % 3) + 2; // 2 to 4 days
  const deliveryDate = new Date(now.setDate(now.getDate() + deliveryDays));
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const formattedDate = deliveryDate.toLocaleDateString('en-US', options);

  const couriers = ['Marketzo Express Logistics', 'FedEx Premier', 'DHL Air Standard', 'BlueDart Priority'];
  const courier = couriers[pincode.charCodeAt(pincode.length - 1) % couriers.length];

  res.json({
    success: true,
    pincode,
    serviceable: true,
    estimatedDelivery: formattedDate,
    deliveryDays,
    shippingFee: 0.00,
    codAvailable: true,
    courierPartner: courier,
    message: `Delivery available to ${pincode} by ${formattedDate} (FREE standard delivery)`
  });
});

module.exports = router;

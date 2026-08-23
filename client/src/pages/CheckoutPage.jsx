import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  Lock, 
  Plus, 
  Zap, 
  QrCode, 
  Building, 
  Banknote,
  ArrowRight,
  PackageCheck,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { PriceSummary } from '../components/cart/PriceSummary';
import { api } from '../services/api';

export const CheckoutPage = ({ onNavigate }) => {
  const { items, summary, appliedCoupon, couponDiscount, finalTotal, fetchCart } = useCart();
  const { user } = useAuth();
  const { currentCurrency, rates, formatPrice } = useCurrency();
  const { showSuccess, showError } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '+1 (555) 234-5678',
    street: '',
    city: 'San Francisco',
    state: 'CA',
    pincode: '94102',
    country: 'United States',
    type: 'Home'
  });

  const [deliverySpeed, setDeliverySpeed] = useState('standard'); // 'standard' | 'express'
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi' | 'netbanking' | 'cod'
  
  // Card form simulation
  const [cardDetails, setCardDetails] = useState({
    number: '•••• •••• •••• 4242',
    name: user?.name || 'Alex Mercer',
    expiry: '12/28',
    cvv: '•••'
  });

  const [upiId, setUpiId] = useState('alex@marketzo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Load addresses on mount
  useEffect(() => {
    api.getAddresses().then(res => {
      if (res.success && res.addresses?.length > 0) {
        setAddresses(res.addresses);
        const defaultAddr = res.addresses.find(a => a.isDefault) || res.addresses[0];
        setSelectedAddressId(defaultAddr.id);
      }
    }).catch(() => {});
  }, []);

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddressForm.street || !newAddressForm.city || !newAddressForm.pincode) {
      showError('Please complete all required address fields.');
      return;
    }

    try {
      const res = await api.addAddress(newAddressForm);
      if (res.success) {
        setAddresses(prev => [...prev, res.address]);
        setSelectedAddressId(res.address.id);
        setShowNewAddressModal(false);
        showSuccess('Address saved!');
      }
    } catch (err) {
      showError('Could not save address.');
    }
  };

  const handlePlaceOrder = async () => {
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    if (!selectedAddress) {
      showError('Please select or add a shipping address.');
      return;
    }

    if (items.length === 0) {
      showError('Your cart is empty.');
      return;
    }

    try {
      setIsProcessing(true);

      let methodLabel = 'Credit / Debit Card (Sandbox)';
      if (paymentMethod === 'upi') methodLabel = `Instant UPI / QR (${upiId})`;
      if (paymentMethod === 'netbanking') methodLabel = 'Net Banking (Commercial Express)';
      if (paymentMethod === 'cod') methodLabel = 'Cash on Delivery';

      // 1. Process payment simulation
      if (paymentMethod !== 'cod') {
        await api.processPayment({
          amount: finalTotal,
          method: methodLabel
        });
      }

      // 2. Create order in database
      const orderPayload = {
        items,
        shippingAddress: selectedAddress,
        paymentMethod: methodLabel,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        deliverySpeed,
        currency: currentCurrency,
        exchangeRate: rates[currentCurrency] || 1.0,
        displayTotal: formatPrice(finalTotal)
      };

      const res = await api.createOrder(orderPayload);
      if (res.success) {
        setCompletedOrder(res.order);
        await fetchCart();

        // Confetti burst
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });

        showSuccess('Order successfully placed!');
      }
    } catch (err) {
      showError(err.message || 'Order placement failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Order Confirmed Success Screen
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
              completedOrder.paymentStatus === 'paid'
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-amber-600 bg-amber-50'
            }`}>
              {completedOrder.paymentStatus === 'paid' ? 'Order Confirmed & Paid' : 'Order Placed • Cash on Delivery'}
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">
              Thank You for Your Order!
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Order Number: <strong className="text-indigo-600">{completedOrder.orderNumber}</strong> • Invoice sent to {user?.email}
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs space-y-3">
            <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
              <span>Delivery Summary</span>
              <span>
                {completedOrder.paymentStatus === 'paid' ? 'Total Paid: ' : 'Total Amount (Due on Delivery): '}
                {completedOrder.displayTotal || formatPrice(completedOrder.totalAmount)}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Shipping to: </span>
              <strong className="text-slate-800">{completedOrder.shippingAddress?.fullName}, {completedOrder.shippingAddress?.street}, {completedOrder.shippingAddress?.city} ({completedOrder.shippingAddress?.pincode})</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Payment: </span>
              <strong className="text-slate-800">{completedOrder.paymentMethod}</strong>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                completedOrder.paymentStatus === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {completedOrder.paymentStatus === 'paid' ? 'Paid in Full' : 'Payment Pending / COD'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Status: </span>
              <span className="font-extrabold text-indigo-600">{completedOrder.orderStatus}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('account', { tab: 'orders' })}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Track Live Delivery Timeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Secure Checkout
          </h1>
          <p className="text-xs text-slate-500">Bank-Grade 256-Bit Encrypted Marketplace Checkout</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <Lock className="w-3.5 h-3.5" />
          <span>SSL Secured</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Address + Delivery + Payment */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Shipping Address Selection */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 font-black text-base text-slate-900">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs">1</div>
                <span>Shipping Address</span>
              </div>
              <button
                onClick={() => setShowNewAddressModal(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Address</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {addresses.map(addr => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-slate-900">{addr.fullName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                        {addr.type || 'Home'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {addr.street}, {addr.city}, {addr.state} {addr.pincode}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-2">Phone: {addr.phone}</div>

                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Delivery Speed Options */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 font-black text-base text-slate-900">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs">2</div>
              <span>Delivery Option</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div
                onClick={() => setDeliverySpeed('standard')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  deliverySpeed === 'standard' ? 'border-indigo-600 bg-indigo-50/40' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">Standard Delivery</span>
                  <span className="text-xs font-black text-emerald-600">FREE</span>
                </div>
                <p className="text-xs text-slate-500">Delivered within 2-4 business days with end-to-end carrier tracking.</p>
              </div>

              <div
                onClick={() => setDeliverySpeed('express')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  deliverySpeed === 'express' ? 'border-indigo-600 bg-indigo-50/40' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">Express Priority Next-Day</span>
                  <span className="text-xs font-black text-indigo-600">+{formatPrice(14.99)}</span>
                </div>
                <p className="text-xs text-slate-500">Priority expedited dispatch. Guaranteed delivery by tomorrow 6 PM.</p>
              </div>
            </div>
          </div>

          {/* 3. Payment Method Selection */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 font-black text-base text-slate-900">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs">3</div>
              <span>Payment Method (Sandbox Mode)</span>
            </div>

            {/* Payment Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50/60 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Credit / Debit</span>
              </button>

              <button
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'upi' ? 'border-indigo-600 bg-indigo-50/60 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span>UPI / QR</span>
              </button>

              <button
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'netbanking' ? 'border-indigo-600 bg-indigo-50/60 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building className="w-5 h-5" />
                <span>Net Banking</span>
              </button>

              <button
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50/60 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Cash on Delivery</span>
              </button>
            </div>

            {/* Method Details Pane */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-bold">Sandbox Test Card (Auto-filled)</span>
                    <span className="text-[11px] text-emerald-600 font-bold">256-Bit SSL</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={cardDetails.number}
                      readOnly
                      className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    />
                    <input
                      type="text"
                      value={cardDetails.name}
                      readOnly
                      className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">UPI Virtual Payment Address</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-600"
                  />
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="text-xs text-slate-600">
                  Select your financial institution upon clicking "Place Order". Instant clearance enabled.
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="text-xs text-slate-600">
                  Pay with exact cash or mobile QR scan directly to the courier upon delivery at your doorstep.
                </div>
              )}
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isProcessing ? 'Processing Secure Order...' : `Place Order & Pay ${formatPrice(finalTotal)}`}</span>
            </button>

          </div>

        </div>

        {/* Right Column: Sticky Summary & Review */}
        <div className="lg:col-span-4 sticky top-28 space-y-6">
          <PriceSummary isCheckoutPage={true} />

          {/* Cart Items Peek */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Order Items ({items.length})
            </h4>
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="py-2.5 flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-400">Qty: {item.quantity} {item.variant ? `(${item.variant})` : ''}</div>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Add New Address Modal */}
      {showNewAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-4">Add New Delivery Address</h3>
            <form onSubmit={handleSaveNewAddress} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newAddressForm.fullName}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newAddressForm.phone}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Address Tag</label>
                  <select
                    value={newAddressForm.type}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 font-semibold bg-white"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Office / Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Street Address / Suite</label>
                <input
                  type="text"
                  value={newAddressForm.street}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, street: e.target.value })}
                  placeholder="e.g. 500 Market St, Apt 3B"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={newAddressForm.city}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={newAddressForm.state}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Zip Code</label>
                  <input
                    type="text"
                    value={newAddressForm.pincode}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewAddressModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

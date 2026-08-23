import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  MapPin, 
  Heart, 
  Bell, 
  User, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  Receipt, 
  FileText, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Check,
  Camera,
  Upload,
  Store,
  Phone,
  Mail,
  Lock,
  Sparkles,
  AlertCircle,
  Save,
  X,
  MessageSquare,
  ExternalLink,
  Layers,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/product/ProductCard';
import { ChatInbox } from '../components/chat/ChatInbox';
import { DisputeModal } from '../components/orders/DisputeModal';
import { api } from '../services/api';

export const AccountPage = ({ routeParams = {}, onNavigate }) => {
  const { user, seller, logout, refreshProfile, isSeller } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { showSuccess, showError, showInfo } = useToast();

  const [activeTab, setActiveTab] = useState(routeParams.tab || 'orders');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Marketplace Upgrade State
  const [disputes, setDisputes] = useState([]);
  const [followedStores, setFollowedStores] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);
  const [selectedOrderForDispute, setSelectedOrderForDispute] = useState(null);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
  
  // Seller Profile Edit State (for vendors)
  const [storeName, setStoreName] = useState(seller?.storeName || '');
  const [storeDescription, setStoreDescription] = useState(seller?.description || '');
  const [storeLogo, setStoreLogo] = useState(seller?.logo || '');

  const avatarInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // Sync state with authenticated user/seller
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileAvatar(user.avatar || '');
    }
    if (seller) {
      setStoreName(seller.storeName || '');
      setStoreDescription(seller.description || '');
      setStoreLogo(seller.logo || '');
    }
  }, [user, seller]);

  useEffect(() => {
    if (routeParams.tab) {
      setActiveTab(routeParams.tab);
    }
  }, [routeParams.tab]);

  const loadDisputes = async () => {
    try {
      const res = await api.getMyDisputes();
      if (res.success) setDisputes(res.disputes || []);
    } catch (e) { console.error(e); }
  };

  const loadFollowedStores = async () => {
    try {
      const res = await api.getMyFollowing();
      if (res.success) setFollowedStores(res.followedStores || []);
    } catch (e) { console.error(e); }
  };

  const loadRfqs = async () => {
    try {
      const res = await api.getMyRfqs();
      if (res.success) setRfqs(res.rfqs || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (activeTab === 'disputes') loadDisputes();
    if (activeTab === 'following') loadFollowedStores();
    if (activeTab === 'wholesale') loadRfqs();
  }, [activeTab]);

  // Load orders, addresses, and notifications
  useEffect(() => {
    const loadAccountData = async () => {
      setIsLoading(true);
      try {
        const [ordRes, addrRes, notifRes] = await Promise.all([
          api.getMyOrders(),
          api.getAddresses(),
          api.getNotifications()
        ]);
        if (ordRes.success) setOrders(ordRes.orders || []);
        if (addrRes.success) setAddresses(addrRes.addresses || []);
        if (notifRes.success) setNotifications(notifRes.notifications || []);
      } catch (err) {
        console.error('Account data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccountData();
    loadDisputes();
    loadFollowedStores();
    loadRfqs();
  }, []);

  // Cancel Order
  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you wish to cancel this order? Stock will be restocked and payment refunded.')) return;
    try {
      const res = await api.cancelOrder(orderId, 'Customer cancellation request');
      if (res.success) {
        showSuccess('Order cancelled successfully.');
        setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
      }
    } catch (err) {
      showError(err.message || 'Could not cancel order.');
    }
  };

  // Avatar Image Upload Handler (converts to base64 Data URI)
  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showError('Image size should be under 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileAvatar(event.target.result);
      showInfo('Photo preview loaded. Click "Save Changes" to apply.');
    };
    reader.readAsDataURL(file);
  };

  // Store Logo Upload Handler for Sellers
  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please upload a valid image file for the store logo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setStoreLogo(event.target.result);
      showInfo('Store logo preview loaded. Click "Save Changes" to apply.');
    };
    reader.readAsDataURL(file);
  };

  // Cancel Editing & Restore Original Values
  const handleCancelEdit = () => {
    setProfileName(user?.name || '');
    setProfilePhone(user?.phone || '');
    setProfileAvatar(user?.avatar || '');
    if (seller) {
      setStoreName(seller.storeName || '');
      setStoreDescription(seller.description || '');
      setStoreLogo(seller.logo || '');
    }
    setIsEditingProfile(false);
  };

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    e?.preventDefault();

    // Validation
    if (!profileName || profileName.trim().length < 2) {
      showError('Please enter a valid full name (at least 2 characters).');
      return;
    }

    if (isSeller && (!storeName || storeName.trim().length < 2)) {
      showError('Please enter a valid Store / Business name.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const payload = {
        name: profileName.trim(),
        phone: profilePhone.trim(),
        avatar: profileAvatar,
        ...(isSeller && {
          storeName: storeName.trim(),
          storeDescription: storeDescription.trim(),
          storeLogo: storeLogo
        })
      };

      const res = await api.updateProfile(payload);
      if (res.success) {
        showSuccess('Profile updated successfully!');
        await refreshProfile();
        setIsEditingProfile(false);
      }
    } catch (err) {
      showError(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const ORDER_STATUS_STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

  const getStepIndex = (status) => {
    return ORDER_STATUS_STEPS.indexOf(status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Account Hero Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="relative">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`;
              }}
              className="w-16 h-16 rounded-full border-2 border-indigo-400 object-cover shrink-0 bg-slate-800"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl sm:text-2xl font-black text-white">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-400/30">
                {user?.role === 'seller' ? 'Verified Merchant' : user?.role === 'admin' ? 'Super Admin' : 'Shopper'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.email} • {user?.phone || 'No phone set'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            onNavigate('home');
          }}
          className="px-4 py-2.5 bg-slate-800 hover:bg-rose-950 text-rose-300 border border-slate-700 hover:border-rose-800 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs Navigation Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'orders', label: 'My Orders', icon: Package, count: orders.length },
          { id: 'messages', label: '💬 Messages', icon: MessageSquare },
          { id: 'disputes', label: '🛡️ Buyer Protection', icon: ShieldCheck, count: disputes.filter(d => !['resolved_refund', 'rejected'].includes(d.status)).length },
          { id: 'following', label: '❤️ Followed Stores', icon: Heart, count: followedStores.length },
          { id: 'wholesale', label: '📦 Bulk Quotes', icon: Layers, count: rfqs.length },
          { id: 'addresses', label: 'Saved Addresses', icon: MapPin, count: addresses.length },
          { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlist.length },
          { id: 'notifs', label: 'Notifications', icon: Bell, count: notifications.filter(n => !n.read).length },
          { id: 'profile', label: 'Profile Settings', icon: User }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        
        {/* 1. MY ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">No orders yet</h3>
                <p className="text-xs text-slate-500">Discover millions of products with fast delivery and great prices.</p>
                <button
                  onClick={() => onNavigate('products', {})}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              orders.map(order => {
                const currentStep = getStepIndex(order.orderStatus);
                const isCancelled = order.orderStatus === 'Cancelled';

                return (
                  <div key={order.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                    
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">Order #{order.orderNumber}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                            order.orderStatus === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                            'bg-indigo-100 text-indigo-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setSelectedOrderForTracking(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-indigo-200"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Live</span>
                        </button>

                        <button
                          onClick={() => setSelectedOrderForInvoice(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>View Invoice</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedOrderForDispute(order);
                            setIsDisputeModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-amber-200"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span>Return / Claim</span>
                        </button>

                        {order.orderStatus === 'Pending' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Multi-Step Fulfillment Timeline */}
                    {!isCancelled && (
                      <div className="py-2">
                        <div className="flex items-center justify-between relative">
                          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 z-0" />
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-500 z-0"
                            style={{ width: `${(Math.max(0, currentStep) / (ORDER_STATUS_STEPS.length - 1)) * 100}%` }}
                          />

                          {ORDER_STATUS_STEPS.map((step, idx) => {
                            const isCompleted = currentStep >= idx;
                            const isCurrent = currentStep === idx;

                            return (
                              <div key={step} className="relative z-10 flex flex-col items-center">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                  isCompleted
                                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 shadow-md'
                                    : 'bg-white border-2 border-slate-200 text-slate-400'
                                } ${isCurrent ? 'ring-4 ring-indigo-200 scale-110' : ''}`}>
                                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                                </div>
                                <span className={`text-[10px] mt-2 font-bold text-center max-w-[60px] hidden sm:block ${
                                  isCurrent ? 'text-indigo-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                                }`}>
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Order Items List */}
                    <div className="divide-y divide-slate-100 pt-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80'}
                              alt={item.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80';
                              }}
                              className="w-12 h-12 object-cover rounded-xl bg-slate-100 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-xs text-slate-800 line-clamp-1">{item.name}</div>
                              <div className="text-[11px] text-slate-400">
                                Qty: {item.quantity} {item.variant ? `• Option: ${item.variant}` : ''}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-extrabold text-xs text-slate-900">{formatPrice(item.price * item.quantity, order.currency)}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Total Footer */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-4 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex flex-wrap items-center gap-2">
                        <span>Payment: <strong>{order.paymentMethod}</strong> • Shipping: <strong>{order.deliverySpeed || 'Standard'}</strong></span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          (order.paymentStatus === 'paid' || order.orderStatus === 'Delivered')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {(order.paymentStatus === 'paid' || order.orderStatus === 'Delivered') ? 'Paid in Full' : 'Payment Pending / COD'}
                        </span>
                      </div>
                      <div className="text-sm font-extrabold text-slate-900">
                        Total: <span className="text-indigo-600 font-black">{order.displayTotal || formatPrice(order.totalAmount, order.currency)}</span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <ChatInbox isSellerView={false} onNavigate={onNavigate} />
          </div>
        )}

        {/* BUYER PROTECTION & DISPUTES TAB */}
        {activeTab === 'disputes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">🛡️ Buyer Protection & Return Center</h3>
                <p className="text-xs text-slate-500">Track claim statuses, seller responses, and platform refund resolutions</p>
              </div>
            </div>

            {disputes.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
                <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">No Active Disputes</h4>
                <p className="text-xs text-slate-500">All your Marketzo purchases are protected under our 100% money-back guarantee.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map(dsp => (
                  <div key={dsp.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <span className="font-black text-sm text-slate-900">Order #{dsp.orderNumber}</span>
                        <div className="text-xs text-slate-500 mt-0.5">Claim ID: {dsp.id} • Filed on {new Date(dsp.createdAt).toLocaleDateString()}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        dsp.status === 'resolved_refund' ? 'bg-emerald-100 text-emerald-800' :
                        dsp.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        dsp.status === 'seller_replied' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {dsp.status === 'resolved_refund' ? 'Refund Approved' :
                         dsp.status === 'rejected' ? 'Claim Declined' :
                         dsp.status === 'seller_replied' ? 'Seller Replied' : 'Under Seller Review'}
                      </span>
                    </div>

                    <div className="text-xs space-y-2 text-slate-700">
                      <div><strong>Reason:</strong> <span className="text-slate-600">{dsp.reasonLabel || dsp.reason}</span></div>
                      <div><strong>Claim Details:</strong> <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">{dsp.description}</p></div>
                      {dsp.sellerResponse && (
                        <div>
                          <strong>Seller Response ({dsp.sellerName}):</strong>
                          <p className="text-slate-700 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 mt-1">
                            💬 {dsp.sellerResponse}
                          </p>
                        </div>
                      )}
                      {dsp.adminResolutionNotes && (
                        <div>
                          <strong>Platform Arbitration Note:</strong>
                          <p className="text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 mt-1">
                            🛡️ {dsp.adminResolutionNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FOLLOWED STORES TAB */}
        {activeTab === 'following' && (
          <div className="space-y-6">
            <h3 className="text-base font-black text-slate-900">❤️ Followed Merchant Stores</h3>
            {followedStores.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
                <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">You haven't followed any stores yet</h4>
                <p className="text-xs text-slate-500">Follow verified sellers to receive priority updates on new drops & exclusive flash sales.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {followedStores.map(st => (
                  <div key={st.sellerId} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={st.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80'} alt={st.storeName} className="w-12 h-12 rounded-2xl object-cover bg-slate-100 border border-slate-200" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{st.storeName}</h4>
                        <div className="text-[11px] text-slate-400">★ {st.rating || 4.9} • {st.productCount || 10} Products</div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        await api.toggleFollowSeller(st.sellerId);
                        loadFollowedStores();
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Unfollow Store
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WHOLESALE RFQ TAB */}
        {activeTab === 'wholesale' && (
          <div className="space-y-6">
            <h3 className="text-base font-black text-slate-900">📦 Bulk Wholesale Quotes & Inquiries (RFQ)</h3>
            {rfqs.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
                <Layers className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">No RFQ Inquiries Submitted</h4>
                <p className="text-xs text-slate-500">Request customized tier pricing for bulk orders from any product detail page.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rfqs.map(r => (
                  <div key={r.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <span className="font-black text-sm text-slate-900">{r.productName}</span>
                        <div className="text-[11px] text-slate-400">Seller: {r.sellerName} • Requested on {new Date(r.createdAt).toLocaleDateString()}</div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        r.status === 'quoted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status === 'quoted' ? 'Quote Provided' : 'Pending Seller Quote'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Target Qty</span>
                        <strong>{r.targetQuantity} units</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Target Unit Price</span>
                        <strong>${r.targetPricePerUnit}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Destination</span>
                        <strong className="truncate block">{r.shippingDestination}</strong>
                      </div>
                    </div>

                    {r.sellerQuote && (
                      <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                        <div className="font-bold text-emerald-900">Official Merchant Quote Offer:</div>
                        <div className="text-xs text-emerald-800">
                          Offered <strong>${r.sellerQuote.offeredPricePerUnit}/unit</strong> for min {r.sellerQuote.minQuantity} units. Estimated {r.sellerQuote.estimatedProductionDays} days production.
                        </div>
                        {r.sellerQuote.notes && <p className="text-[11px] text-emerald-700 italic">"{r.sellerQuote.notes}"</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. SAVED ADDRESSES TAB */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addresses.map(addr => (
                <div key={addr.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">{addr.fullName}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                      {addr.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {addr.street}, {addr.city}, {addr.state} {addr.pincode}
                  </p>
                  <div className="text-xs text-slate-400">Phone: {addr.phone}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            {wishlist.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
                <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">Your wishlist is empty</h3>
                <p className="text-xs text-slate-500">Save items you love by clicking the heart icon while browsing.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {wishlist.map(item => (
                  <ProductCard key={item.id || item.productId} product={item} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. NOTIFICATIONS TAB */}
        {activeTab === 'notifs' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Account Notifications</h3>
            <div className="divide-y divide-slate-100">
              {notifications.map(n => (
                <div key={n.id} className="py-4 space-y-1">
                  <div className="font-bold text-xs text-slate-800">{n.title}</div>
                  <p className="text-xs text-slate-600">{n.message}</p>
                  <div className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. PROFILE SETTINGS TAB (VIEW & COMPLETE EDIT PROFILE FEATURE) */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl shadow-sm space-y-6">
            
            {/* Header with Edit Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-lg text-slate-900">
                  {isEditingProfile ? 'Edit Profile & Account Details' : 'Profile & Security Overview'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isEditingProfile 
                    ? 'Update your personal details, avatar photo, and merchant contact information.' 
                    : 'Manage your personal profile, credentials, and merchant settings.'}
                </p>
              </div>

              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-200 cursor-pointer self-start sm:self-auto"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {/* Hidden File Input Pickers */}
            <input
              type="file"
              ref={avatarInputRef}
              accept="image/png, image/jpeg, image/webp"
              onChange={handleAvatarFileChange}
              className="hidden"
            />
            <input
              type="file"
              ref={logoInputRef}
              accept="image/png, image/jpeg, image/webp"
              onChange={handleLogoFileChange}
              className="hidden"
            />

            {/* Profile Avatar Showcase / Photo Picker */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group shrink-0">
                <img
                  src={profileAvatar || user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileName || 'User')}`}
                  alt="Profile Avatar"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileName || 'User')}`;
                  }}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover bg-slate-200"
                />
                {isEditingProfile && (
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-950/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Upload Photo"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-[9px] font-bold">Change</span>
                  </button>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="font-extrabold text-sm text-slate-900">{profileName || user?.name}</div>
                <div className="text-xs text-slate-500">{user?.email}</div>
                {isEditingProfile ? (
                  <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Upload New Photo</span>
                    </button>
                    {profileAvatar !== user?.avatar && (
                      <button
                        type="button"
                        onClick={() => setProfileAvatar(user?.avatar || '')}
                        className="text-xs text-slate-500 hover:text-rose-600 underline font-medium"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 justify-center sm:justify-start">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Active Account Verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              
              {/* Full Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 font-semibold bg-white shadow-xs"
                  />
                ) : (
                  <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                    {user?.name}
                  </div>
                )}
              </div>

              {/* Email Address (Read-Only) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Email Address</label>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Primary Login Email (Cannot be changed)</span>
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    disabled
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-500 cursor-not-allowed select-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Email is locked to protect order history, invoices, and payment security.
                </p>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Contact Phone Number {isSeller && '(Used for WhatsApp & Call Seller Buttons)'}
                </label>
                {isEditingProfile ? (
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="e.g. +1 (555) 392-1082"
                      className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 font-semibold bg-white shadow-xs"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{user?.phone || 'No contact phone provided'}</span>
                  </div>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  Used for package delivery SMS notifications and direct buyer WhatsApp inquiry links.
                </p>
              </div>

              {/* SELLER-SPECIFIC STORE SETTINGS SECTION */}
              {isSeller && (
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                    <Store className="w-4 h-4 text-amber-500" />
                    <span>Merchant Store Profile Information</span>
                  </div>

                  {/* Store Name */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Store / Business Name</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="e.g. Apex Tech Labs"
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 font-semibold bg-white shadow-xs"
                      />
                    ) : (
                      <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                        {seller?.storeName || 'Merchant Store'}
                      </div>
                    )}
                  </div>

                  {/* Store Description */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Store Description / Tagline</label>
                    {isEditingProfile ? (
                      <textarea
                        rows="2"
                        value={storeDescription}
                        onChange={(e) => setStoreDescription(e.target.value)}
                        placeholder="Describe your marketplace store and specialties..."
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 font-semibold bg-white shadow-xs"
                      />
                    ) : (
                      <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 text-xs">
                        {seller?.description || 'Authorized marketplace merchant distributor.'}
                      </div>
                    )}
                  </div>

                  {/* Store Logo */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Store Logo</label>
                    <div className="flex items-center gap-3">
                      <img
                        src={storeLogo || seller?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80'}
                        alt="Store Logo"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80';
                        }}
                        className="w-12 h-12 rounded-xl border border-slate-200 object-cover bg-slate-100"
                      />
                      {isEditingProfile ? (
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5 text-amber-500" />
                          <span>Change Store Logo</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">Live logo on marketplace listings</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons in Edit Mode */}
              {isEditingProfile && (
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingProfile ? 'Saving Changes...' : 'Save Changes'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSavingProfile}
                    className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}

            </form>
          </div>
        )}

      </div>

      {/* Invoice Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-black text-xl text-slate-900">MARKETZO Official Invoice</h3>
                <p className="text-xs text-slate-400">Order #{selectedOrderForInvoice.orderNumber}</p>
              </div>
              <button onClick={() => setSelectedOrderForInvoice(null)} className="p-1 rounded-lg text-slate-400 cursor-pointer">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-bold uppercase">Billed To</span>
                <strong className="text-slate-800 block mt-1">{selectedOrderForInvoice.shippingAddress?.fullName}</strong>
                <p className="text-slate-600 mt-0.5">
                  {selectedOrderForInvoice.shippingAddress?.street}, {selectedOrderForInvoice.shippingAddress?.city}, {selectedOrderForInvoice.shippingAddress?.state} {selectedOrderForInvoice.shippingAddress?.pincode}
                </p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-bold uppercase">Payment Summary</span>
                <strong className="text-slate-800 block mt-1">{selectedOrderForInvoice.paymentMethod}</strong>
                <p className="text-slate-600 mt-0.5 flex items-center justify-end gap-1.5">
                  <span>Status:</span>
                  <strong className={`uppercase font-black ${
                    (selectedOrderForInvoice.paymentStatus === 'paid' || selectedOrderForInvoice.orderStatus === 'Delivered')
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }`}>
                    {(selectedOrderForInvoice.paymentStatus === 'paid' || selectedOrderForInvoice.orderStatus === 'Delivered')
                      ? 'PAID IN FULL'
                      : 'PAYMENT PENDING / COD'}
                  </strong>
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {selectedOrderForInvoice.items.map((item, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="text-slate-400 text-[11px] block">Qty: {item.quantity} {item.variant ? `(${item.variant})` : ''}</span>
                  </div>
                  <strong className="text-slate-900">{formatPrice(item.price * item.quantity, selectedOrderForInvoice.currency)}</strong>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700 text-sm">Invoice Grand Total</span>
              <span className="font-black text-xl text-indigo-600">{selectedOrderForInvoice.displayTotal || formatPrice(selectedOrderForInvoice.totalAmount, selectedOrderForInvoice.currency)}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer"
              >
                Print Invoice Receipt
              </button>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Order Tracking Modal */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Live Shipment Tracking</h3>
                  <p className="text-xs text-slate-400">Order #{selectedOrderForTracking.orderNumber}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrderForTracking(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Courier & Waybill details */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Logistics Partner</span>
                <strong className="text-slate-800 font-extrabold block mt-0.5">{selectedOrderForTracking.courierName || 'Marketzo Direct Express'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Waybill / Tracking No</span>
                <strong className="text-indigo-600 font-mono font-bold block mt-0.5">{selectedOrderForTracking.trackingNumber || 'TRK-88192049'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Delivery</span>
                <strong className="text-emerald-700 font-bold block mt-0.5">{selectedOrderForTracking.estimatedDelivery || 'In 2-4 business days'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Live Status</span>
                <strong className="text-indigo-600 font-black block mt-0.5">{selectedOrderForTracking.orderStatus}</strong>
              </div>
            </div>

            {/* Timeline Stepper */}
            <div className="space-y-4 pt-2">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Fulfillment History</h4>
              <div className="space-y-3 pl-2 border-l-2 border-indigo-200">
                {(selectedOrderForTracking.timeline || []).map((t, idx) => (
                  <div key={idx} className="relative pl-4">
                    <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                    <div className="flex items-center justify-between text-xs">
                      <strong className="text-slate-900">{t.status}</strong>
                      <span className="text-[10px] text-slate-400">{new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{t.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href={selectedOrderForTracking.trackingUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <span>Track on Carrier Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Protection Dispute Modal */}
      <DisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        order={selectedOrderForDispute}
        onDisputeCreated={(dsp) => {
          setDisputes(prev => [dsp, ...prev]);
          setActiveTab('disputes');
        }}
      />

    </div>
  );
};

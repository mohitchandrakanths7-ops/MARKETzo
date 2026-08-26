import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  DollarSign, 
  Users, 
  Store, 
  Package, 
  Tag, 
  Image, 
  Check, 
  X, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Star,
  Activity,
  Layers,
  Sparkles,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const AdminDashboard = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const { currentCurrency, formatPrice } = useCurrency();
  const { showSuccess, showError, showInfo } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'sellers' | 'verifications' | 'disputes' | 'payouts' | 'featureRequests' | 'products' | 'coupons' | 'categories'
  const [metrics, setMetrics] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [featureRequests, setFeatureRequests] = useState([]);
  const [featureFilter, setFeatureFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [featureEdits, setFeatureEdits] = useState({});
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Coupon modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 50,
    maxDiscountAmount: 30,
    description: 'Special seasonal promotional discount'
  });

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [metRes, selRes, prodRes, cpnRes, catRes, verRes, dspRes, payRes, featRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminSellers(),
        api.getAdminProducts(),
        api.getCoupons(),
        api.getCategories(),
        api.getAdminVerifications(),
        api.getAdminDisputes(),
        api.getAdminPayouts(),
        api.getAdminFeatureRequests()
      ]);

      if (metRes.success) setMetrics(metRes.stats);
      if (selRes.success) setSellers(selRes.sellers || []);
      if (prodRes.success) setProducts(prodRes.products || []);
      if (cpnRes.success) setCoupons(cpnRes.coupons || []);
      if (catRes.success) setCategories(catRes.categories || []);
      if (verRes.success) setVerifications(verRes.verifications || []);
      if (dspRes.success) setDisputes(dspRes.disputes || []);
      if (payRes.success) setPayouts(payRes.payouts || []);
      if (featRes.success) setFeatureRequests(featRes.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const handleUpdateSellerStatus = async (sellerId, status) => {
    try {
      const res = await api.updateSellerStatus(sellerId, status);
      if (res.success) {
        showSuccess(res.message);
        setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, status } : s));
      }
    } catch (err) {
      showError('Failed to update seller.');
    }
  };

  const handleUpdateProductBadge = async (productId, field, value) => {
    try {
      const res = await api.updateProductStatus(productId, { [field]: value });
      if (res.success) {
        showSuccess('Product status updated');
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, [field]: value } : p));
      }
    } catch (err) {
      showError('Failed to update product.');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discountValue) {
      showError('Code and discount value required.');
      return;
    }

    try {
      const res = await api.createCoupon(couponForm);
      if (res.success) {
        showSuccess('New coupon created!');
        setCoupons(prev => [...prev, res.coupon]);
        setShowCouponModal(false);
        setCouponForm({ code: '', discountType: 'percentage', discountValue: 10, minOrderValue: 50, maxDiscountAmount: 30, description: '' });
      }
    } catch (err) {
      showError('Could not create coupon.');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    try {
      const res = await api.deleteCoupon(couponId);
      if (res.success) {
        showSuccess('Coupon deleted.');
        setCoupons(prev => prev.filter(c => c.id !== couponId));
      }
    } catch (err) {
      showError('Failed to delete coupon.');
    }
  };

  const handleFeatureEditChange = (requestId, field, value) => {
    setFeatureEdits(prev => ({
      ...prev,
      [requestId]: {
        ...(prev[requestId] || {}),
        [field]: value
      }
    }));
  };

  const handleApproveFeatureRequest = async (request) => {
    setProcessingRequestId(request.id);
    try {
      const editData = featureEdits[request.id] || {};
      const res = await api.updateFeatureRequestStatus(request.id, {
        status: 'approved',
        priority: editData.priority !== undefined ? editData.priority : (request.priority || 1),
        homePageSection: editData.homePageSection || request.homePageSection || 'Featured Products',
        featuredUntil: editData.featuredUntil || request.featuredUntil
      });
      if (res.success) {
        showSuccess(res.message || 'Feature request approved! Product is now featured on the Home Page.');
        loadAdminData();
      }
    } catch (err) {
      showError(err.message || 'Failed to approve feature request.');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectFeatureRequest = async (request) => {
    setProcessingRequestId(request.id);
    try {
      const editData = featureEdits[request.id] || {};
      const res = await api.updateFeatureRequestStatus(request.id, {
        status: 'rejected',
        rejectionReason: editData.rejectionReason || 'Does not meet current promotional curation standards.'
      });
      if (res.success) {
        showSuccess('Feature request rejected.');
        loadAdminData();
      }
    } catch (err) {
      showError(err.message || 'Failed to reject feature request.');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRemoveFeaturedProduct = async (request) => {
    setProcessingRequestId(request.id);
    try {
      const res = await api.removeFeatureRequest(request.id);
      if (res.success) {
        showSuccess(res.message || 'Product removed from Marketzo Home Page.');
        loadAdminData();
      }
    } catch (err) {
      showError(err.message || 'Failed to remove product from Home Page.');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleSaveFeatureConfig = async (request) => {
    setProcessingRequestId(request.id);
    try {
      const editData = featureEdits[request.id] || {};
      const res = await api.updateFeatureRequestStatus(request.id, {
        status: request.status,
        priority: editData.priority !== undefined ? editData.priority : (request.priority || 1),
        homePageSection: editData.homePageSection || request.homePageSection || 'Featured Products',
        featuredUntil: editData.featuredUntil || request.featuredUntil
      });
      if (res.success) {
        showSuccess('Feature settings updated.');
        loadAdminData();
      }
    } catch (err) {
      showError(err.message || 'Failed to update feature settings.');
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center border border-slate-200 shadow-sm space-y-4">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Administrator Clearance Required</h2>
        <p className="text-xs text-slate-500">You must be logged in with Super Admin credentials to access the Marketzo Platform Control Center.</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Header */}
      <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl sm:text-2xl font-black text-white">Marketzo Control Center</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                Live Production
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Platform GMV, Multi-Vendor Moderation, and Category Governance</p>
          </div>
        </div>

        <button
          onClick={() => setShowCouponModal(true)}
          className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar whitespace-nowrap">
        {[
          { id: 'overview', label: 'Platform Executive Overview', icon: Activity },
          { id: 'sellers', label: `Sellers & Stores (${sellers.length})`, icon: Store },
          { id: 'verifications', label: `🏆 Verifications (${verifications.filter(v => v.status === 'pending').length})`, icon: ShieldCheck },
          { id: 'disputes', label: `🛡️ Buyer Disputes (${disputes.filter(d => !['resolved_refund', 'rejected'].includes(d.status)).length})`, icon: AlertTriangle },
          { id: 'payouts', label: `💰 Payout Settlements (${payouts.filter(p => p.status === 'pending').length})`, icon: Wallet },
          { id: 'featureRequests', label: `⭐ Feature Requests (${featureRequests.filter(r => r.status === 'pending').length} pending)`, icon: Star },
          { id: 'products', label: `Product Moderation (${products.length})`, icon: Package },
          { id: 'coupons', label: `Coupons & Promos (${coupons.length})`, icon: Tag },
          { id: 'categories', label: `Categories (${categories.length})`, icon: Layers }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div>
        
        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <span>Gross Merchandise Value</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><DollarSign className="w-4 h-4" /></div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {formatPrice(metrics?.totalGMV || 0)}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold">{metrics?.completedOrders || 0} orders fulfilled</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <span>Total Customers</span>
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><Users className="w-4 h-4" /></div>
                </div>
                <div className="text-3xl font-black text-slate-900">{metrics?.totalCustomers || 0}</div>
                <div className="text-[11px] text-indigo-600 font-bold">Registered shopper accounts</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <span>Registered Vendors</span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><Store className="w-4 h-4" /></div>
                </div>
                <div className="text-3xl font-black text-slate-900">{metrics?.totalSellers || 0}</div>
                <div className="text-[11px] text-amber-600 font-bold">{metrics?.pendingSellers || 0} pending verification</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <span>Active Catalog Items</span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Package className="w-4 h-4" /></div>
                </div>
                <div className="text-3xl font-black text-slate-900">{metrics?.totalProducts || 0}</div>
                <div className="text-[11px] text-slate-500">{metrics?.totalReviews || 0} customer reviews</div>
              </div>
            </div>

            {/* Quick stats banner */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <h3 className="text-xl font-black text-white">Platform Health & Compliance</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-lg">All marketplace micro-services, payment gateways, and inventory reservation queues are running at optimal throughput.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-white/10 text-emerald-400 text-xs font-bold border border-white/10">
                  API: 99.99% Uptime
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/10 text-indigo-300 text-xs font-bold border border-white/10">
                  SQLite DB: Operational
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. SELLERS MANAGEMENT */}
        {activeTab === 'sellers' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
            <div className="p-6 pb-0 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 uppercase tracking-wider">
                Multi-Vendor Merchant Directory ({sellers.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-4">Store Profile</th>
                    <th className="p-4">Owner Info</th>
                    <th className="p-4">Tax & Address</th>
                    <th className="p-4">Products</th>
                    <th className="p-4">Verification Status</th>
                    <th className="p-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sellers.map(sel => (
                    <tr key={sel.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={sel.logo}
                          alt={sel.storeName}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80';
                          }}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{sel.storeName}</div>
                          <div className="text-[11px] text-slate-400">{sel.rating} ★ ({sel.reviewCount || 0} reviews)</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{sel.ownerName}</div>
                        <div className="text-[11px] text-slate-400">{sel.ownerEmail}</div>
                      </td>
                      <td className="p-4 max-w-xs truncate">{sel.businessAddress}</td>
                      <td className="p-4 font-bold text-slate-900">{sel.productCount || 0} items</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          sel.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          sel.status === 'pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {sel.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        {sel.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateSellerStatus(sel.id, 'approved')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                          >
                            Approve
                          </button>
                        )}
                        {sel.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateSellerStatus(sel.id, 'rejected')}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🏆 SELLER VERIFICATIONS & BADGES */}
        {activeTab === 'verifications' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
            <div className="p-6 pb-0">
              <h3 className="font-extrabold text-base text-slate-900 uppercase tracking-wider">
                🏆 Merchant Document Audits & Trust Badges ({verifications.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-4">Merchant Store</th>
                    <th className="p-4">Business Registration</th>
                    <th className="p-4">Tax ID / GSTIN</th>
                    <th className="p-4">Verification State</th>
                    <th className="p-4 text-right">Compliance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {verifications.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">No seller document requests to review</td></tr>
                  ) : (
                    verifications.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <strong className="text-slate-900 block">{v.storeName || 'Merchant'}</strong>
                          <span className="text-[10px] text-slate-400">ID: {v.sellerId}</span>
                        </td>
                        <td className="p-4 font-semibold">{v.businessType}</td>
                        <td className="p-4 font-mono font-bold text-slate-800">{v.registrationNumber || v.taxId}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            v.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            v.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1.5">
                          {v.status !== 'approved' && (
                            <button
                              onClick={async () => {
                                const res = await api.reviewVerification(v.id, {
                                  status: 'approved',
                                  assignedBadges: ['Verified Seller', 'Gold Supplier', 'Fast Shipping'],
                                  adminFeedback: 'Documents verified and approved.'
                                });
                                if (res.success) {
                                  showSuccess('Seller verified and badges awarded!');
                                  loadAdminData();
                                }
                              }}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Approve & Badge
                            </button>
                          )}
                          {v.status !== 'rejected' && (
                            <button
                              onClick={async () => {
                                const res = await api.reviewVerification(v.id, {
                                  status: 'rejected',
                                  adminFeedback: 'Additional GSTIN documentation required.'
                                });
                                if (res.success) {
                                  showInfo('Verification rejected');
                                  loadAdminData();
                                }
                              }}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🛡️ BUYER DISPUTES & ARBITRATION */}
        {activeTab === 'disputes' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
            <div className="p-6 pb-0">
              <h3 className="font-extrabold text-base text-slate-900 uppercase tracking-wider">
                🛡️ Buyer Protection & Claim Arbitration ({disputes.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-4">Order #</th>
                    <th className="p-4">Customer & Reason</th>
                    <th className="p-4">Seller & Response</th>
                    <th className="p-4">Claim Status</th>
                    <th className="p-4 text-right">Arbitration Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {disputes.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">No active disputes</td></tr>
                  ) : (
                    disputes.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <strong className="text-slate-900 block">#{d.orderNumber}</strong>
                          <span className="text-[10px] text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{d.userName}</div>
                          <span className="text-rose-600 font-semibold">{d.reasonLabel || d.reason}</span>
                          <p className="text-[11px] text-slate-500 max-w-xs mt-0.5 line-clamp-2">{d.description}</p>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{d.sellerName || 'Merchant'}</div>
                          <p className="text-[11px] text-indigo-700 max-w-xs line-clamp-2">{d.sellerResponse || 'No seller response yet'}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            d.status === 'resolved_refund' ? 'bg-emerald-100 text-emerald-800' :
                            d.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1.5">
                          {d.status !== 'resolved_refund' && (
                            <button
                              onClick={async () => {
                                const res = await api.resolveDispute(d.id, {
                                  resolution: 'resolved_refund',
                                  refundAmount: d.orderTotal || 100,
                                  notes: 'Full refund arbitrated in favor of customer under Buyer Protection guarantee.'
                                });
                                if (res.success) {
                                  showSuccess('Dispute resolved: 100% refund credited!');
                                  loadAdminData();
                                }
                              }}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Issue Refund
                            </button>
                          )}
                          {d.status !== 'rejected' && (
                            <button
                              onClick={async () => {
                                const res = await api.resolveDispute(d.id, {
                                  resolution: 'rejected',
                                  notes: 'Claim dismissed based on merchant dispatch proof.'
                                });
                                if (res.success) {
                                  showInfo('Claim dismissed');
                                  loadAdminData();
                                }
                              }}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Decline Claim
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 💰 PAYOUT SETTLEMENTS */}
        {activeTab === 'payouts' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
            <div className="p-6 pb-0">
              <h3 className="font-extrabold text-base text-slate-900 uppercase tracking-wider">
                💰 Seller Payout Settlements & Wire Disbursements ({payouts.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-4">Payout ID</th>
                    <th className="p-4">Seller Store</th>
                    <th className="p-4">Withdrawal Amount</th>
                    <th className="p-4">Account Details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Settlement Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {payouts.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">No payout withdrawal requests found</td></tr>
                  ) : (
                    payouts.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-800">#{p.id}</td>
                        <td className="p-4 font-bold text-slate-900">{p.sellerStoreName || 'Merchant'}</td>
                        <td className="p-4 font-black text-emerald-600 text-sm">${p.amount}</td>
                        <td className="p-4 text-slate-700">{p.accountDetails || 'Primary Bank Account'}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            p.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            p.status === 'failed' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {p.status === 'pending' && (
                            <button
                              onClick={async () => {
                                const res = await api.processPayout(p.id, {
                                  status: 'completed',
                                  referenceNumber: `WIRE-MKZ-${Math.floor(Math.random() * 900000 + 100000)}`,
                                  notes: 'Funds successfully transferred via RTGS/ACH.'
                                });
                                if (res.success) {
                                  showSuccess('Payout marked as completed and disbursed!');
                                  loadAdminData();
                                }
                              }}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Approve & Disburse
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ⭐ HOME PAGE PRODUCTS & FEATURE REQUESTS */}
        {activeTab === 'featureRequests' && (
          <div className="space-y-6">
            
            {/* Header & Filter Controls */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                  <span>Home Page Featured Products & Seller Requests ({featureRequests.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review seller feature requests, approve placements, configure priorities, and manage storefront featured products.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Requests', count: featureRequests.length },
                  { id: 'pending', label: 'Pending Approval', count: featureRequests.filter(r => r.status === 'pending').length },
                  { id: 'approved', label: 'Live on Home Page', count: featureRequests.filter(r => r.status === 'approved').length },
                  { id: 'rejected', label: 'Rejected / Removed', count: featureRequests.filter(r => ['rejected', 'removed'].includes(r.status)).length }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFeatureFilter(f.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      featureFilter === f.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="ml-1.5 opacity-70">({f.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {(() => {
                const filtered = featureRequests.filter(r => {
                  if (featureFilter === 'pending') return r.status === 'pending';
                  if (featureFilter === 'approved') return r.status === 'approved';
                  if (featureFilter === 'rejected') return ['rejected', 'removed'].includes(r.status);
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-12 text-center space-y-3">
                      <Star className="w-12 h-12 text-slate-300 mx-auto" />
                      <h4 className="font-bold text-slate-800 text-base">No feature requests found</h4>
                      <p className="text-xs text-slate-500">
                        {featureFilter === 'pending'
                          ? 'There are no pending seller feature requests at this time.'
                          : 'No product feature requests match this filter.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="p-4">Product Details</th>
                          <th className="p-4">Seller Store</th>
                          <th className="p-4">Storefront Section</th>
                          <th className="p-4">Priority (1-100)</th>
                          <th className="p-4">Featured Expiry</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Moderation Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filtered.map(req => {
                          const edits = featureEdits[req.id] || {};
                          const currentSection = edits.homePageSection !== undefined ? edits.homePageSection : (req.homePageSection || 'Featured Products');
                          const currentPriority = edits.priority !== undefined ? edits.priority : (req.priority || 1);
                          const currentExpiry = edits.featuredUntil !== undefined ? edits.featuredUntil : (req.featuredUntil ? req.featuredUntil.split('T')[0] : '');
                          const isProcessing = processingRequestId === req.id;
                          const isLive = req.status === 'approved';
                          const isPending = req.status === 'pending';
                          const isRejected = req.status === 'rejected';

                          return (
                            <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                              
                              {/* Product Info */}
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={req.productImage || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80'}
                                    alt={req.productName}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80';
                                    }}
                                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                                  />
                                  <div className="min-w-0 max-w-xs">
                                    <div className="font-extrabold text-slate-900 truncate" title={req.productName}>
                                      {req.productName}
                                    </div>
                                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                      <span className="font-bold text-slate-800">{formatPrice(req.productPrice || 0)}</span>
                                      <span>•</span>
                                      <span className={req.productStock > 0 ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-bold'}>
                                        {req.productStock > 0 ? `${req.productStock} in stock` : 'Out of Stock'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Seller Store */}
                              <td className="p-4">
                                <div className="font-bold text-slate-900">{req.sellerStoreName || 'Merchant'}</div>
                                {req.sellerEmail && (
                                  <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{req.sellerEmail}</div>
                                )}
                                {req.sellerPhone && (
                                  <div className="text-[10px] text-slate-400">{req.sellerPhone}</div>
                                )}
                              </td>

                              {/* Section Select */}
                              <td className="p-4">
                                <select
                                  value={currentSection}
                                  onChange={(e) => handleFeatureEditChange(req.id, 'homePageSection', e.target.value)}
                                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600"
                                >
                                  <option value="Featured Products">Featured Products</option>
                                  <option value="Hot Deals">Hot Deals</option>
                                  <option value="New Arrivals">New Arrivals</option>
                                  <option value="Recommended">Recommended</option>
                                </select>
                              </td>

                              {/* Priority Input */}
                              <td className="p-4">
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={currentPriority}
                                  onChange={(e) => handleFeatureEditChange(req.id, 'priority', e.target.value)}
                                  className="w-16 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-600"
                                />
                              </td>

                              {/* Expiration Date Input */}
                              <td className="p-4">
                                <input
                                  type="date"
                                  value={currentExpiry}
                                  onChange={(e) => handleFeatureEditChange(req.id, 'featuredUntil', e.target.value)}
                                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600"
                                />
                              </td>

                              {/* Status Badge */}
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  isLive ? 'bg-emerald-100 text-emerald-800' :
                                  isPending ? 'bg-amber-100 text-amber-800 animate-pulse' :
                                  isRejected ? 'bg-rose-100 text-rose-800' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {isLive ? '✅ Live on Home Page' :
                                   isPending ? '⏳ Pending Approval' :
                                   isRejected ? '❌ Rejected' : 'Inactive'}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="p-4 text-right space-x-1.5">
                                {isPending ? (
                                  <>
                                    <button
                                      onClick={() => handleApproveFeatureRequest(req)}
                                      disabled={isProcessing}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                                      title="Approve and feature on Home Page"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Approve</span>
                                    </button>
                                    <button
                                      onClick={() => handleRejectFeatureRequest(req)}
                                      disabled={isProcessing}
                                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                                      title="Reject feature request"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                ) : isLive ? (
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleSaveFeatureConfig(req)}
                                      disabled={isProcessing}
                                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                                      title="Save updated section, priority, or expiration date"
                                    >
                                      Save Updates
                                    </button>
                                    <button
                                      onClick={() => handleRemoveFeaturedProduct(req)}
                                      disabled={isProcessing}
                                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                                      title="Remove from Marketzo Home Page"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Remove from Home Page</span>
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleApproveFeatureRequest(req)}
                                    disabled={isProcessing}
                                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                                    title="Re-approve for Home Page"
                                  >
                                    Approve for Home Page
                                  </button>
                                )}
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* 3. PRODUCT MODERATION */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
            <div className="p-6 pb-0">
              <h3 className="font-extrabold text-base text-slate-900 uppercase tracking-wider">
                Product Moderation & Featured Toggles ({products.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Vendor</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Featured</th>
                    <th className="p-4">Trending</th>
                    <th className="p-4">Best Seller</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.images?.[0]}
                          alt={p.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
                          }}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                        />
                        <div className="max-w-xs truncate font-bold text-slate-900">{p.name}</div>
                      </td>
                      <td className="p-4">{p.sellerName}</td>
                      <td className="p-4 font-bold text-slate-900">
                        <div className="font-extrabold text-xs text-slate-900">{formatPrice(p.price)}</div>
                      </td>
                      <td className="p-4">{p.stock} units</td>
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={!!p.isFeatured}
                          onChange={(e) => handleUpdateProductBadge(p.id, 'isFeatured', e.target.checked)}
                          className="w-4 h-4 accent-indigo-600 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={!!p.isTrending}
                          onChange={(e) => handleUpdateProductBadge(p.id, 'isTrending', e.target.checked)}
                          className="w-4 h-4 accent-indigo-600 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={!!p.isBestSeller}
                          onChange={(e) => handleUpdateProductBadge(p.id, 'isBestSeller', e.target.checked)}
                          className="w-4 h-4 accent-indigo-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. COUPONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 uppercase tracking-wider">
                Active Promotional Coupons ({coupons.length})
              </h3>
              <button
                onClick={() => setShowCouponModal(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map(c => (
                <div key={c.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-black text-sm">
                      {c.code}
                    </span>
                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">{c.description}</p>
                  <div className="text-xs font-bold text-slate-800">
                    Discount: {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Min Order: ${c.minOrderValue || 0} • Used: {c.usedCount || 0} times
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-xs text-slate-900">{cat.name}</h4>
                <p className="text-[11px] text-slate-400">{cat.productCount || 0} active listings</p>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Create Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">Create Promotional Coupon</h3>
              <button onClick={() => setShowCouponModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. MEGA30"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono font-bold outline-none uppercase focus:border-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold outline-none bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar ($)</option>
                    <option value="shipping">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Order ($)</label>
                  <input
                    type="number"
                    value={couponForm.minOrderValue}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Cap ($)</label>
                  <input
                    type="number"
                    value={couponForm.maxDiscountAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="e.g. 15% off orders over $50"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

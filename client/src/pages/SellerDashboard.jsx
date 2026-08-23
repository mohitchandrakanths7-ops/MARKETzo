import React, { useState, useEffect, useRef } from 'react';
import { 
  DollarSign, 
  Package, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  Store, 
  Settings, 
  CheckCircle, 
  X, 
  Upload, 
  Eye, 
  Layers,
  ArrowRight,
  Search,
  CheckCircle2,
  Phone,
  Tag,
  Truck,
  Sparkles,
  Save,
  HelpCircle,
  FileText,
  CreditCard,
  Percent,
  ExternalLink,
  MapPin,
  Calendar,
  CheckSquare,
  Navigation,
  RefreshCw,
  Loader2,
  MessageSquare,
  Flame,
  ShieldCheck,
  BarChart3,
  Wallet,
  Send,
  Building2,
  Check,
  Mail,
  User,
  Copy,
  ChevronDown,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { ChatInbox } from '../components/chat/ChatInbox';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { api } from '../services/api';

export const SellerDashboard = ({ onNavigate }) => {
  const { user, isSeller, seller, refreshProfile, becomeSeller, register, demoLogin } = useAuth();
  const { currentCurrency, activeCurrencyInfo, formatPrice } = useCurrency();
  const { showSuccess, showError, showInfo } = useToast();

  // Merchant Onboarding State
  const [storeNameInput, setStoreNameInput] = useState('');
  const [merchantNameInput, setMerchantNameInput] = useState('');
  const [merchantEmailInput, setMerchantEmailInput] = useState('');
  const [merchantPasswordInput, setMerchantPasswordInput] = useState('');
  const [isLaunchingStore, setIsLaunchingStore] = useState(false);
  const [onboardError, setOnboardError] = useState('');

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'settings'
  const [metrics, setMetrics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [viewingOrderModal, setViewingOrderModal] = useState(null);
  const [viewingAddressModal, setViewingAddressModal] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Product List Filters
  const [productSearch, setProductSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'pending' | 'draft' | 'out_of_stock'

  // Product Modal State (Add / Edit)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  const fileInputRef = useRef(null);

  const [productForm, setProductForm] = useState({
    name: '',
    categoryId: '',
    brandId: '',
    price: '',
    originalPrice: '',
    stock: 15,
    sku: '',
    weight: '0.5 kg',
    shippingInfo: 'Free 2-Day Priority Delivery',
    contactPhone: '',
    tags: '',
    description: '',
    images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'],
    variants: [],
    specs: { 'Condition': 'Brand New', 'Warranty': '1 Year Standard' },
    highlights: ['100% Authentic verified merchandise', 'Dispatched in Marketzo tamper-evident packaging'],
    offers: ['Special promotional introductory discount']
  });

  // Variant Input State
  const [newVariant, setNewVariant] = useState({ name: 'Color', value: '', priceDiff: 0, stock: 10 });
  // Spec Input State
  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  // Highlight Input State
  const [newHighlight, setNewHighlight] = useState('');
  // Direct Image URL Input
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Upgrade Systems State
  const [wallet, setWallet] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [sellerCoupons, setSellerCoupons] = useState([]);
  const [newCouponForm, setNewCouponForm] = useState({ code: '', discountType: 'percentage', discountValue: 10, minOrderValue: 50, maxDiscountAmount: 30, description: '' });
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);

  const [sellerFlashSales, setSellerFlashSales] = useState([]);
  const [newFlashForm, setNewFlashForm] = useState({ productId: '', salePrice: '', durationHours: 24, saleStock: 20 });
  const [isCreatingFlash, setIsCreatingFlash] = useState(false);

  const [verification, setVerification] = useState(null);
  const [verifForm, setVerifForm] = useState({ businessType: 'Private Company', registrationNumber: 'GSTIN-06AAACT2214M1Z8', taxId: 'US-EIN-94-2819402', identityProofUrl: '', businessProofUrl: '' });
  const [isSubmittingVerif, setIsSubmittingVerif] = useState(false);

  const [rfqs, setRfqs] = useState([]);
  const [activeRfqForQuote, setActiveRfqForQuote] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ offeredPricePerUnit: '', minQuantity: 50, shippingCost: 0, estimatedProductionDays: 3, notes: '' });
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  const [disputes, setDisputes] = useState([]);
  const [activeDisputeForResponse, setActiveDisputeForResponse] = useState(null);
  const [disputeResponseText, setDisputeResponseText] = useState('');
  const [isSubmittingDisputeResp, setIsSubmittingDisputeResp] = useState(false);

  // Store Settings Form
  const [storeForm, setStoreForm] = useState({
    storeName: seller?.storeName || '',
    description: seller?.description || '',
    logo: seller?.logo || '',
    banner: seller?.banner || '',
    businessAddress: seller?.businessAddress || '',
    payoutBank: seller?.payoutBank || '',
    phone: seller?.phone || ''
  });

  useEffect(() => {
    if (seller) {
      setStoreForm({
        storeName: seller.storeName || '',
        description: seller.description || '',
        logo: seller.logo || '',
        banner: seller.banner || '',
        businessAddress: seller.businessAddress || '',
        payoutBank: seller.payoutBank || '',
        phone: seller.phone || ''
      });
    }
  }, [seller]);

  const loadWallet = async () => {
    try {
      const res = await api.getWalletSummary();
      if (res.success) setWallet(res.wallet);
    } catch (e) { console.error(e); }
  };

  const loadSellerCoupons = async () => {
    try {
      const res = await api.getSellerCoupons();
      if (res.success) setSellerCoupons(res.coupons || []);
    } catch (e) { console.error(e); }
  };

  const loadSellerFlashSales = async () => {
    try {
      const res = await api.getAllFlashSales();
      if (res.success) setSellerFlashSales(res.flashSales || []);
    } catch (e) { console.error(e); }
  };

  const loadVerification = async () => {
    try {
      const res = await api.getVerificationStatus();
      if (res.success) setVerification(res.verification);
    } catch (e) { console.error(e); }
  };

  const loadSellerRfqs = async () => {
    try {
      const res = await api.getSellerRfqs();
      if (res.success) setRfqs(res.rfqs || []);
    } catch (e) { console.error(e); }
  };

  const loadSellerDisputes = async () => {
    try {
      const res = await api.getSellerDisputes();
      if (res.success) setDisputes(res.disputes || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (activeTab === 'orders') fetchSellerOrders();
    if (activeTab === 'wallet') loadWallet();
    if (activeTab === 'coupons') loadSellerCoupons();
    if (activeTab === 'flashsales') loadSellerFlashSales();
    if (activeTab === 'verification') loadVerification();
    if (activeTab === 'wholesale') loadSellerRfqs();
    if (activeTab === 'disputes') loadSellerDisputes();
  }, [activeTab]);

  // Fetch Seller Orders specifically
  const fetchSellerOrders = async () => {
    setIsOrdersLoading(true);
    setOrdersError(null);
    try {
      const ordRes = await api.getSellerOrders();
      if (ordRes && ordRes.success) {
        setOrders(Array.isArray(ordRes.orders) ? ordRes.orders : []);
      } else {
        setOrdersError(ordRes?.message || 'Unable to load customer orders from server.');
        setOrders([]);
      }
    } catch (err) {
      console.error('Fetch seller orders error:', err);
      setOrdersError(err.message || 'Network error occurred while fetching customer orders.');
      setOrders([]);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Load seller data
  const loadSellerData = async () => {
    try {
      setIsLoading(true);
      const [metRes, prodRes, ordRes, catRes, brdRes] = await Promise.allSettled([
        api.getSellerMetrics(),
        api.getSellerProducts(),
        api.getSellerOrders(),
        api.getCategories(),
        api.getBrands()
      ]);

      if (metRes.status === 'fulfilled' && metRes.value?.success) setMetrics(metRes.value.metrics);
      if (prodRes.status === 'fulfilled' && prodRes.value?.success) setProducts(prodRes.value.products || []);
      if (ordRes.status === 'fulfilled' && ordRes.value?.success) {
        setOrders(Array.isArray(ordRes.value.orders) ? ordRes.value.orders : []);
        setOrdersError(null);
      } else if (ordRes.status === 'fulfilled' && !ordRes.value?.success) {
        setOrdersError(ordRes.value?.message || 'Failed to load orders.');
        setOrders([]);
      } else if (ordRes.status === 'rejected') {
        setOrdersError(ordRes.reason?.message || 'Could not connect to orders service.');
        setOrders([]);
      }
      
      if (catRes.status === 'fulfilled' && catRes.value?.success) {
        setCategories(catRes.value.categories || []);
        if (!productForm.categoryId && catRes.value.categories?.length > 0) {
          setProductForm(prev => ({ ...prev, categoryId: catRes.value.categories[0].id }));
        }
      }
      if (brdRes.status === 'fulfilled' && brdRes.value?.success) setBrands(brdRes.value.brands || []);
    } catch (err) {
      console.error('Seller load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSeller) {
      loadSellerData();
    }
  }, [isSeller]);

  // Open add product modal
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      categoryId: categories[0]?.id || 'cat_electronics',
      brandId: brands[0]?.id || 'br_custom',
      price: '',
      originalPrice: '',
      stock: 15,
      sku: `MKZ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      weight: '0.5 kg',
      shippingInfo: 'Free 2-Day Priority Delivery',
      contactPhone: seller?.phone || '',
      tags: '',
      description: '',
      images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'],
      variants: [],
      specs: { 'Condition': 'Brand New', 'Warranty': '1 Year Standard' },
      highlights: ['100% Authentic verified merchandise', 'Dispatched in Marketzo tamper-evident packaging'],
      offers: ['Special promotional introductory discount']
    });
    setImageUrlInput('');
    setShowProductModal(true);
  };

  // Open edit product modal
  const handleOpenEditProduct = (prod) => {
    setEditingProductId(prod.id);
    setProductForm({
      name: prod.name,
      categoryId: prod.categoryId,
      brandId: prod.brandId || '',
      price: prod.price,
      originalPrice: prod.originalPrice || prod.price,
      stock: prod.stock,
      sku: prod.sku || `MKZ-${prod.id.slice(-5).toUpperCase()}`,
      weight: prod.weight || '0.5 kg',
      shippingInfo: prod.shippingInfo || 'Free 2-Day Priority Delivery',
      contactPhone: prod.contactPhone || seller?.phone || '',
      tags: Array.isArray(prod.tags) ? prod.tags.join(', ') : (prod.tags || ''),
      description: prod.description || '',
      images: prod.images && prod.images.length > 0 ? prod.images : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'],
      variants: prod.variants || [],
      specs: prod.specs || { 'Condition': 'Brand New', 'Warranty': '1 Year Standard' },
      highlights: prod.highlights || ['100% Authentic verified merchandise', 'Dispatched in Marketzo packaging'],
      offers: prod.offers || ['Special promotional discount']
    });
    setImageUrlInput('');
    setShowProductModal(true);
  };

  // Multiple Image Upload Handler
  const handleImageFilesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        showError(`${file.name} is not a valid image.`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showError(`${file.name} exceeds 5MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setProductForm(prev => ({
          ...prev,
          images: [...prev.images.filter(img => img !== 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'), event.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });

    showInfo(`Added ${files.length} image(s).`);
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput || !imageUrlInput.trim().startsWith('http')) {
      showError('Please enter a valid image URL starting with http:// or https://');
      return;
    }
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images.filter(img => img !== 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'), imageUrlInput.trim()]
    }));
    setImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setProductForm(prev => {
      const remaining = prev.images.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: remaining.length > 0 ? remaining : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80']
      };
    });
  };

  const handleSetPrimaryImage = (index) => {
    setProductForm(prev => {
      const target = prev.images[index];
      const others = prev.images.filter((_, idx) => idx !== index);
      return { ...prev, images: [target, ...others] };
    });
    showInfo('Selected as primary thumbnail.');
  };

  // Add Variant
  const handleAddVariant = () => {
    if (!newVariant.value) {
      showError('Please specify option value (e.g. Midnight Blue / 256GB).');
      return;
    }
    const variantItem = {
      id: `var_${Date.now()}`,
      name: newVariant.name || 'Option',
      value: newVariant.value.trim(),
      priceDiff: parseFloat(newVariant.priceDiff) || 0,
      stock: parseInt(newVariant.stock) || 10
    };
    setProductForm(prev => ({ ...prev, variants: [...prev.variants, variantItem] }));
    setNewVariant({ name: 'Color', value: '', priceDiff: 0, stock: 10 });
  };

  const handleRemoveVariant = (varId) => {
    setProductForm(prev => ({ ...prev, variants: prev.variants.filter(v => v.id !== varId) }));
  };

  // Add Spec
  const handleAddSpec = () => {
    if (!newSpec.key || !newSpec.value) return;
    setProductForm(prev => ({
      ...prev,
      specs: { ...prev.specs, [newSpec.key.trim()]: newSpec.value.trim() }
    }));
    setNewSpec({ key: '', value: '' });
  };

  const handleRemoveSpec = (keyToRemove) => {
    setProductForm(prev => {
      const updated = { ...prev.specs };
      delete updated[keyToRemove];
      return { ...prev, specs: updated };
    });
  };

  // Add Highlight
  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    setProductForm(prev => ({
      ...prev,
      highlights: [...prev.highlights, newHighlight.trim()]
    }));
    setNewHighlight('');
  };

  const handleRemoveHighlight = (idx) => {
    setProductForm(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== idx)
    }));
  };

  // Save or Publish Product
  const handleSaveProduct = async (targetStatus = 'approved') => {
    if (!productForm.name || productForm.name.trim().length < 3) {
      showError('Please enter a descriptive product title (at least 3 characters).');
      return;
    }

    if (!productForm.categoryId) {
      showError('Please select a department category.');
      return;
    }

    if (!productForm.price || isNaN(parseFloat(productForm.price)) || parseFloat(productForm.price) <= 0) {
      showError('Please specify a valid selling price.');
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const payload = {
        name: productForm.name.trim(),
        categoryId: productForm.categoryId,
        brandId: productForm.brandId || null,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : parseFloat(productForm.price),
        stock: parseInt(productForm.stock) || 0,
        sku: productForm.sku,
        weight: productForm.weight,
        shippingInfo: productForm.shippingInfo,
        contactPhone: productForm.contactPhone || seller?.phone,
        tags: productForm.tags,
        description: productForm.description,
        status: targetStatus,
        images: productForm.images,
        variants: productForm.variants,
        specs: productForm.specs,
        highlights: productForm.highlights,
        offers: productForm.offers
      };

      if (editingProductId) {
        const res = await api.updateSellerProduct(editingProductId, payload);
        if (res.success) {
          showSuccess(targetStatus === 'draft' ? 'Product updated as Draft.' : 'Product published successfully!');
          setShowProductModal(false);
          loadSellerData();
        }
      } else {
        const res = await api.addSellerProduct(payload);
        if (res.success) {
          showSuccess(targetStatus === 'draft' ? 'Product created as Draft.' : 'New product is now LIVE on the MARKETZO marketplace!');
          setShowProductModal(false);
          loadSellerData();
        }
      }
    } catch (err) {
      showError(err.message || 'Failed to save product.');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId, productName) => {
    if (!confirm(`Are you sure you want to permanently delete "${productName}" from your marketplace store?`)) return;

    try {
      const res = await api.deleteSellerProduct(productId);
      if (res.success) {
        showSuccess('Product removed from catalog.');
        setProducts(prev => prev.filter(p => p.id !== productId));
        loadSellerData();
      }
    } catch (err) {
      showError(err.message || 'Failed to delete product.');
    }
  };

  // Save store settings
  const handleSaveStoreProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateSellerProfile(storeForm);
      if (res.success) {
        showSuccess('Store profile saved!');
        await refreshProfile();
      }
    } catch (err) {
      showError('Failed to update store.');
    }
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = !productSearch || 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (statusFilter === 'approved') return p.status === 'approved' && p.stock > 0;
    if (statusFilter === 'pending') return p.status === 'pending';
    if (statusFilter === 'draft') return p.status === 'draft';
    if (statusFilter === 'out_of_stock') return p.stock <= 0 || p.status === 'out_of_stock';

    return true;
  });

  // Calculate financials
  const grossRevenue = metrics?.totalRevenue || 0;
  const commissionRate = seller?.commissionRate || 8.5;
  const platformFee = (grossRevenue * (commissionRate / 100));
  const netEarnings = grossRevenue - platformFee;

  // Handle Order Status Transitions for Seller Fulfillment
  const handleUpdateOrderStatus = async (orderId, newStatus, note = '') => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus, note);
      if (res && res.success) {
        showSuccess(`Order #${res.order?.orderNumber || ''} updated to ${newStatus}`);
        setOrders(prev => (prev || []).map(o => o.id === orderId ? { ...o, ...res.order } : o));
        try {
          const metRes = await api.getSellerMetrics();
          if (metRes && metRes.success) setMetrics(metRes.metrics);
        } catch (_) {}
      } else {
        showError(res?.message || 'Failed to update order status.');
      }
    } catch (err) {
      showError(err.message || 'Status update failed.');
    }
  };

  // Onboarding wizard if not registered as seller
  if (!isSeller) {
    const handleLaunchStore = async (e) => {
      e?.preventDefault();
      setOnboardError('');

      if (!storeNameInput || storeNameInput.trim().length < 2) {
        setOnboardError('Please enter a valid store or business name (at least 2 characters).');
        showError('Please enter a valid store name (at least 2 characters).');
        return;
      }

      setIsLaunchingStore(true);
      try {
        if (user) {
          // Logged-in user upgrading to seller
          const res = await becomeSeller({
            storeName: storeNameInput.trim()
          });

          if (res.success) {
            showSuccess(res.message || 'Merchant store created successfully! Welcome to your Merchant Portal.');
            await refreshProfile();
          } else {
            setOnboardError(res.message || 'Failed to launch merchant store.');
            showError(res.message || 'Failed to launch merchant store.');
          }
        } else {
          // Unauthenticated guest creating new merchant account
          if (!merchantNameInput.trim()) {
            const msg = 'Please enter your full name.';
            setOnboardError(msg);
            showError(msg);
            setIsLaunchingStore(false);
            return;
          }

          if (!merchantEmailInput.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(merchantEmailInput.trim())) {
            const msg = 'Please enter a valid business email address.';
            setOnboardError(msg);
            showError(msg);
            setIsLaunchingStore(false);
            return;
          }

          if (!merchantPasswordInput || merchantPasswordInput.length < 4) {
            const msg = 'Please enter a password with at least 4 characters.';
            setOnboardError(msg);
            showError(msg);
            setIsLaunchingStore(false);
            return;
          }

          const res = await register({
            name: merchantNameInput.trim(),
            email: merchantEmailInput.trim().toLowerCase(),
            password: merchantPasswordInput,
            role: 'seller',
            storeName: storeNameInput.trim()
          });

          if (res && res.success) {
            showSuccess(res.message || 'Merchant store registered and launched successfully!');
            await refreshProfile();
          } else {
            const errMsg = res?.message || 'Registration failed.';
            setOnboardError(errMsg);
            showError(errMsg);
          }
        }
      } catch (err) {
        console.error('[AUTH] Merchant launch error:', err.message || err);
        const errMsg = err.message || 'Failed to launch merchant store. Please verify your connection.';
        setOnboardError(errMsg);
        showError(errMsg);
      } finally {
        setIsLaunchingStore(false);
      }
    };

    const handleQuickDemoMerchant = async () => {
      setIsLaunchingStore(true);
      try {
        const res = await demoLogin('seller');
        if (res.success) {
          showSuccess(res.message || 'Signed in as Verified Demo Merchant!');
          await refreshProfile();
        }
      } catch (err) {
        showError('Demo merchant login failed.');
      } finally {
        setIsLaunchingStore(false);
      }
    };

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in zoom-in-95">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner border border-amber-100">
          <Store className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Become a Verified Marketzo Merchant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed mt-2">
            Reach millions of shoppers with low commission rates, rapid courier pickups, and instant payouts.
          </p>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg mx-auto text-left space-y-5">
          {user ? (
            <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm uppercase shrink-0">
                {user.name ? user.name[0] : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                  <span>Upgrading Account:</span>
                  <span className="font-extrabold truncate">{user.name}</span>
                </div>
                <div className="text-[10px] text-indigo-600 truncate">{user.email}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Create your merchant credentials to launch your store</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={merchantNameInput}
                  onChange={(e) => setMerchantNameInput(e.target.value)}
                  placeholder="e.g. Alex Henderson"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Business Email</label>
                <input
                  type="email"
                  value={merchantEmailInput}
                  onChange={(e) => setMerchantEmailInput(e.target.value)}
                  placeholder="merchant@yourdomain.com"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Account Password</label>
                <input
                  type="password"
                  value={merchantPasswordInput}
                  onChange={(e) => setMerchantPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Store / Business Name</label>
            <div className="relative">
              <input
                type="text"
                id="sellerStoreNameInput"
                value={storeNameInput}
                onChange={(e) => {
                  setStoreNameInput(e.target.value);
                  if (onboardError) setOnboardError('');
                }}
                placeholder="e.g. Apex Tech Labs"
                className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 pr-10"
              />
              <Store className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">This will be your public vendor brand name on MARKETzo.</p>
          </div>

          {onboardError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{onboardError}</span>
            </div>
          )}

          <button
            id="launchMerchantStoreButton"
            onClick={handleLaunchStore}
            disabled={isLaunchingStore}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLaunchingStore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Launching Your Store...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Launch My Merchant Store</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          {/* Quick 1-Click Demo Shortcut */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Want to test immediately?</span>
            <button
              onClick={handleQuickDemoMerchant}
              type="button"
              className="text-amber-600 hover:text-amber-700 font-bold underline cursor-pointer"
            >
              1-Click Demo Merchant
            </button>
          </div>
        </div>

        {/* Merchant Benefits Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto pt-4 text-center">
          <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-amber-600 font-black text-base">0%</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Setup Fee</div>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-emerald-600 font-black text-base">Instant</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Store Activation</div>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-indigo-600 font-black text-base">24/7</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Seller Portal</div>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-purple-600 font-black text-base">Rapid</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Courier Pickups</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Seller Header Bar */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <img
            src={seller?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80'}
            alt="Store Logo"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80';
            }}
            className="w-16 h-16 rounded-2xl border-2 border-amber-400 object-cover shrink-0 bg-slate-800"
          />
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl sm:text-2xl font-black text-white">{seller?.storeName || 'Merchant Store'}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-400/30">
                Verified Seller
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Rating: {metrics?.averageRating || 4.9} ★ • Commission: {seller?.commissionRate || 8.5}% • WhatsApp: {seller?.phone || 'Configured'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddProduct}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-amber-900/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Product</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'overview', label: 'Store Overview', icon: TrendingUp },
          { id: 'analytics', label: '📊 Analytics', icon: BarChart3 },
          { id: 'products', label: 'My Products', icon: Package, count: products.length },
          { id: 'orders', label: 'Customer Orders', icon: Clock, count: orders.length },
          { id: 'messages', label: '💬 Messages', icon: MessageSquare },
          { id: 'wallet', label: '💰 Wallet & Payouts', icon: Wallet },
          { id: 'coupons', label: '🏷️ Coupons', icon: Tag, count: sellerCoupons.length },
          { id: 'flashsales', label: '🔥 Flash Deals', icon: Flame },
          { id: 'verification', label: '🏆 Verification', icon: ShieldCheck },
          { id: 'wholesale', label: '📦 Wholesale & RFQ', icon: Layers, count: rfqs.filter(r => r.status === 'pending_seller').length },
          { id: 'disputes', label: '🛡️ Disputes', icon: AlertTriangle, count: disputes.filter(d => d.status === 'pending_seller').length },
          { id: 'settings', label: 'Store Settings', icon: Settings }
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
                  isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
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
        
        {/* 1. STORE OVERVIEW & EARNINGS BREAKDOWN */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <span>Gross Store Sales</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><DollarSign className="w-4 h-4" /></div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {formatPrice(grossRevenue)}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +18.4% this month
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <span>Total Orders</span>
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><Package className="w-4 h-4" /></div>
                </div>
                <div className="text-3xl font-black text-slate-900">{orders.length}</div>
                <div className="text-[11px] text-slate-500 font-medium">Customer fulfillment rate: 100%</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <span>Active Listings</span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><Store className="w-4 h-4" /></div>
                </div>
                <div className="text-3xl font-black text-slate-900">{products.length}</div>
                <div className="text-[11px] text-slate-500 font-medium">Published on marketplace</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <span>Low Stock Alert</span>
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600"><AlertTriangle className="w-4 h-4" /></div>
                </div>
                <div className="text-3xl font-black text-rose-600">
                  {products.filter(p => p.stock <= 5).length}
                </div>
                <div className="text-[11px] text-rose-600 font-bold">Items with &le; 5 units left</div>
              </div>
            </div>

            {/* Earnings Breakdown & Trajectory Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Financial Earnings Breakdown */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-base text-slate-900">Seller Earnings Breakdown</h3>
                </div>
                <p className="text-xs text-slate-500">Summary of product revenues, platform commission, and converted local payout.</p>

                <div className="divide-y divide-slate-100 text-xs space-y-3 pt-2">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600">Gross Sales</span>
                    <strong className="text-slate-900 font-extrabold">{formatPrice(grossRevenue)}</strong>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600 flex items-center gap-1">
                      <span>Platform Commission ({commissionRate}%)</span>
                      <Percent className="w-3 h-3 text-slate-400" />
                    </span>
                    <strong className="text-rose-600 font-extrabold">-{formatPrice(platformFee)}</strong>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600">Payment Gateway Handling</span>
                    <span className="text-emerald-700 font-bold">0.00 (Waived)</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 text-sm">
                    <span className="font-black text-slate-900">Net Estimated Payout</span>
                    <div className="text-right">
                      <span className="font-black text-emerald-600 text-lg block">{formatPrice(netEarnings)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Settlement Status: Active</span>
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    Payout bank: {seller?.payoutBank || 'Silicon Valley Commercial Bank (Ending in 4092)'}
                  </div>
                </div>
              </div>

              {/* Monthly Revenue Chart */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Monthly Sales Volume</h3>
                    <p className="text-xs text-slate-500">Gross store revenue over the last 6 calendar months</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">
                    Healthy Growth
                  </span>
                </div>

                <div className="h-48 flex items-end justify-between gap-4 pt-8 px-4 border-b border-slate-100">
                  {(metrics?.monthlySales || [
                    { month: 'Mar', sales: 4200 },
                    { month: 'Apr', sales: 6800 },
                    { month: 'May', sales: 9400 },
                    { month: 'Jun', sales: 12100 },
                    { month: 'Jul', sales: 15300 },
                    { month: 'Aug', sales: 18900 }
                  ]).map((bar, i) => {
                    const max = 20000;
                    const heightPercent = Math.min(100, Math.max(15, (bar.sales / max) * 100));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          ${bar.sales}
                        </div>
                        <div
                          className="w-full max-w-[48px] bg-indigo-600 group-hover:bg-indigo-500 rounded-t-xl transition-all"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-xs font-bold text-slate-600">{bar.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2. MY PRODUCTS CATALOG TAB */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            {/* Header & Controls Bar */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Products', count: products.length },
                  { id: 'approved', label: 'Published', count: products.filter(p => p.status === 'approved' && p.stock > 0).length },
                  { id: 'draft', label: 'Drafts', count: products.filter(p => p.status === 'draft').length },
                  { id: 'out_of_stock', label: 'Out of Stock', count: products.filter(p => p.stock <= 0).length }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === f.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="ml-1.5 opacity-70">({f.count})</span>
                  </button>
                ))}
              </div>

              {/* Search input & Add Button */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by title or SKU..."
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600"
                  />
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-200 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Package className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-800 text-base">No products match your filter</h3>
                  <p className="text-xs text-slate-500">Create a new marketplace listing to begin selling.</p>
                  <button
                    onClick={handleOpenAddProduct}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    + Add First Product
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="p-4">Product & SKU</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Selling Price</th>
                        <th className="p-4">Stock Units</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredProducts.map(prod => {
                        const isOutOfStock = prod.stock <= 0;
                        const isDraft = prod.status === 'draft';
                        const isPending = prod.status === 'pending';
                        const isApproved = prod.status === 'approved' && !isOutOfStock;

                        return (
                          <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                            
                            {/* Product Info */}
                            <td className="p-4 flex items-center gap-3">
                              <img
                                src={prod.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'}
                                alt={prod.name}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
                                }}
                                className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                              />
                              <div className="min-w-0 max-w-xs">
                                <div className="font-bold text-slate-900 truncate">{prod.name}</div>
                                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                                  <span>SKU: {prod.sku || prod.id.toUpperCase()}</span>
                                  {prod.variants?.length > 0 && (
                                    <span className="text-indigo-600 font-sans">({prod.variants.length} variants)</span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="p-4">{prod.categoryName || 'General'}</td>

                            {/* Price */}
                            <td className="p-4 font-bold text-slate-900">
                              <div className="font-extrabold text-sm text-slate-900">{formatPrice(prod.price)}</div>
                              {prod.originalPrice > prod.price && (
                                <div className="text-[11px] text-slate-400 line-through">{formatPrice(prod.originalPrice)}</div>
                              )}
                            </td>

                            {/* Stock */}
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                isOutOfStock ? 'bg-rose-100 text-rose-800' :
                                prod.stock <= 5 ? 'bg-amber-100 text-amber-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isOutOfStock ? 'Out of Stock (0)' : `${prod.stock} in stock`}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isApproved ? 'bg-emerald-100 text-emerald-800' :
                                isPending ? 'bg-amber-100 text-amber-800 animate-pulse' :
                                isDraft ? 'bg-slate-100 text-slate-600' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {isApproved ? 'Published' : isPending ? 'Pending Approval' : isDraft ? 'Draft' : 'Out of Stock'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => onNavigate('product-detail', { id: prod.id || prod.slug })}
                                  className="p-2 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer"
                                  title="View on Storefront"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="p-2 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer"
                                  title="Edit Product Details"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                  className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                                  title="Delete Listing"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 3. CUSTOMER ORDERS TAB */}
        {activeTab === 'orders' && (
          <ErrorBoundary
            errorMessage="Unable to load customer orders. Please try again."
            onReset={fetchSellerOrders}
          >
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <span>Customer Orders & Merchant Fulfillment</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review customer orders, verify shipping destinations, and update carrier delivery status.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={fetchSellerOrders}
                    disabled={isOrdersLoading}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    title="Refresh customer orders"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isOrdersLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <span className="px-3.5 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black">
                    {(orders || []).length} Total Orders
                  </span>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by Order #, Customer, Email, or Product..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    style={{ color: '#0f172a', caretColor: '#4f46e5' }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-xs text-slate-900 font-medium outline-none transition-all focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {orderSearch && (
                    <button
                      onClick={() => setOrderSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'Pending', label: 'Pending' },
                    { id: 'Confirmed', label: 'Confirmed' },
                    { id: 'Processing', label: 'Processing' },
                    { id: 'Shipped', label: 'Shipped' },
                    { id: 'Out for Delivery', label: 'Out for Delivery' },
                    { id: 'Delivered', label: 'Delivered' },
                    { id: 'Cancelled', label: 'Cancelled' }
                  ].map(tab => {
                    const count = tab.id === 'all' 
                      ? (orders || []).length 
                      : (orders || []).filter(o => (o?.orderStatus || o?.status || 'Pending').toLowerCase() === tab.id.toLowerCase()).length;
                    const isSelected = orderStatusFilter.toLowerCase() === tab.id.toLowerCase();

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setOrderStatusFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {count > 0 && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                            isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order State Renderers */}
              {isOrdersLoading ? (
                /* Loading State */
                <div className="p-16 text-center text-xs text-slate-500 space-y-4 bg-slate-50/70 rounded-3xl border border-slate-200/80">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <div className="font-bold text-slate-800 text-sm">Loading customer orders...</div>
                  <p className="text-slate-400">Fetching customer purchase records and fulfillment status from server.</p>
                </div>
              ) : ordersError ? (
                /* Error State */
                <div className="p-8 text-center text-xs space-y-3 bg-rose-50/80 rounded-3xl border border-rose-200">
                  <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
                  <div className="font-bold text-rose-800 text-sm">Unable to load customer orders. Please try again.</div>
                  <p className="text-rose-600 max-w-md mx-auto">{ordersError}</p>
                  <div className="pt-2">
                    <button
                      onClick={fetchSellerOrders}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Loading Orders</span>
                    </button>
                  </div>
                </div>
              ) : (!orders || orders.length === 0) ? (
                /* Zero Orders / Empty State */
                <div className="p-12 text-center text-xs text-slate-500 space-y-3 bg-slate-50/70 rounded-3xl border border-slate-200/80">
                  <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-xs">
                    <Package className="w-7 h-7 text-slate-400" />
                  </div>
                  <div className="font-extrabold text-sm text-slate-800">No customer orders yet.</div>
                  <p className="max-w-md mx-auto text-slate-500 leading-relaxed">
                    When shoppers place orders for products listed by your store, incoming customer orders will appear here for packaging, courier tracking, and fulfillment.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('products')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Package className="w-4 h-4" />
                      <span>View My Products Catalog</span>
                    </button>
                  </div>
                </div>
              ) : (
                (() => {
                  const filteredOrders = (orders || []).filter(order => {
                    if (!order) return false;
                    const status = order.orderStatus || order.status || 'Pending';
                    if (orderStatusFilter !== 'all' && status.toLowerCase() !== orderStatusFilter.toLowerCase()) {
                      return false;
                    }
                    if (!orderSearch.trim()) return true;
                    const q = orderSearch.toLowerCase().trim();
                    const orderNum = String(order.orderNumber || order.id || '').toLowerCase();
                    const custName = String(order.customerName || order.userName || order.shippingAddress?.fullName || '').toLowerCase();
                    const custEmail = String(order.customerEmail || order.userEmail || '').toLowerCase();
                    const custPhone = String(order.customerPhone || order.shippingAddress?.phone || '').toLowerCase();
                    const itemsMatch = Array.isArray(order.items) && order.items.some(it => it && String(it.name || '').toLowerCase().includes(q));
                    return orderNum.includes(q) || custName.includes(q) || custEmail.includes(q) || custPhone.includes(q) || itemsMatch;
                  });

                  if (filteredOrders.length === 0) {
                    return (
                      <div className="p-10 text-center text-xs text-slate-500 space-y-3 bg-slate-50/70 rounded-3xl border border-slate-200/80">
                        <Filter className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="font-bold text-slate-700 text-sm">No orders match your filter criteria</div>
                        <p className="text-slate-400">Try adjusting your search terms or selecting a different status filter.</p>
                        <button
                          onClick={() => { setOrderSearch(''); setOrderStatusFilter('all'); }}
                          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs cursor-pointer transition-all"
                        >
                          Reset Filters
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {filteredOrders.map((order, orderIdx) => {
                        if (!order) return null;

                        const STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
                        const orderStatus = order.orderStatus || order.status || 'Pending';
                        const currentStepIdx = Math.max(0, STEPS.indexOf(orderStatus));
                        const isCancelled = orderStatus === 'Cancelled';
                        const isDelivered = orderStatus === 'Delivered';
                        
                        const rawPaymentMethod = order.paymentMethod;
                        const paymentMethod = typeof rawPaymentMethod === 'string' ? rawPaymentMethod : 'Standard Payment';
                        const isCOD = paymentMethod.toLowerCase().includes('cash on delivery') || paymentMethod.toLowerCase().includes('cod') || paymentMethod.toLowerCase().includes('cash');
                        const isPaid = (typeof order.paymentStatus === 'string' && order.paymentStatus.toLowerCase() === 'paid') || isDelivered;
                        
                        const orderNumber = order.orderNumber || order.id || `MKZ-${orderIdx + 1}`;
                        
                        let orderDate = 'Recently placed';
                        if (order.createdAt) {
                          try {
                            orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                          } catch (_) {
                            orderDate = String(order.createdAt);
                          }
                        }

                        const orderItems = Array.isArray(order.items) ? order.items : [];
                        const shippingAddress = (order.shippingAddress && typeof order.shippingAddress === 'object') ? order.shippingAddress : {};
                        const customerName = order.customerName || order.userName || shippingAddress.fullName || 'Valued Customer';
                        const customerEmail = order.customerEmail || order.userEmail || 'N/A';
                        const customerPhone = order.customerPhone || shippingAddress.phone || 'N/A';
                        const orderTotalAmount = parseFloat(order.totalAmount || order.sellerItemsTotal || 0);

                        return (
                          <div key={order.id || orderIdx} className="p-6 bg-slate-50/80 rounded-3xl border border-slate-200/90 space-y-5 shadow-xs transition-all hover:border-slate-300">
                            
                            {/* Order Header & Status Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <span className="font-black text-base text-slate-900">Order #{orderNumber}</span>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    orderStatus === 'Pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                                    orderStatus === 'Confirmed' ? 'bg-indigo-100 text-indigo-800' :
                                    orderStatus === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                    orderStatus === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                                    orderStatus === 'Out for Delivery' ? 'bg-amber-100 text-amber-800' :
                                    orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                                    'bg-rose-100 text-rose-800'
                                  }`}>
                                    {orderStatus}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-400 flex items-center gap-2">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>Placed on {orderDate}</span>
                                </div>
                              </div>

                              {/* Action Stepper CTA & Direct Status Selector */}
                              <div className="flex flex-wrap items-center gap-2">
                                {orderStatus === 'Pending' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateOrderStatus(order.id, 'Confirmed')}
                                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>Confirm Order</span>
                                    </button>
                                    <button
                                      onClick={() => handleUpdateOrderStatus(order.id, 'Cancelled')}
                                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}

                                {orderStatus === 'Confirmed' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'Processing')}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Package className="w-4 h-4" />
                                    <span>Start Processing</span>
                                  </button>
                                )}

                                {orderStatus === 'Processing' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'Shipped')}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Truck className="w-4 h-4" />
                                    <span>Mark as Shipped</span>
                                  </button>
                                )}

                                {orderStatus === 'Shipped' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'Out for Delivery')}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Navigation className="w-4 h-4" />
                                    <span>Mark Out for Delivery</span>
                                  </button>
                                )}

                                {orderStatus === 'Out for Delivery' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Mark Delivered {isCOD ? '(Collect Cash)' : ''}</span>
                                  </button>
                                )}

                                {orderStatus === 'Delivered' && (
                                  <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black uppercase flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Fulfilled & Delivered</span>
                                  </span>
                                )}

                                {/* Direct Status Dropdown for Quick Status Override */}
                                <select
                                  value={orderStatus}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none hover:border-slate-300 focus:border-indigo-600 cursor-pointer shadow-2xs"
                                  title="Change order status"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Out for Delivery">Out for Delivery</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>

                            {/* Visual Fulfillment Stepper */}
                            {!isCancelled && (
                              <div className="py-2 px-2">
                                <div className="flex items-center justify-between relative">
                                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
                                  <div
                                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-500 z-0"
                                    style={{ width: `${(Math.max(0, currentStepIdx) / (STEPS.length - 1)) * 100}%` }}
                                  />

                                  {STEPS.map((step, idx) => {
                                    const isCompleted = currentStepIdx >= idx;
                                    const isCurrent = currentStepIdx === idx;

                                    return (
                                      <div key={step} className="relative z-10 flex flex-col items-center">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                          isCompleted
                                            ? 'bg-indigo-600 text-white ring-3 ring-indigo-50 shadow-xs'
                                            : 'bg-white border border-slate-300 text-slate-400'
                                        } ${isCurrent ? 'ring-4 ring-indigo-200 scale-110' : ''}`}>
                                          {isCompleted ? '✓' : idx + 1}
                                        </div>
                                        <span className={`text-[9px] mt-1.5 font-bold text-center max-w-[65px] hidden sm:block ${
                                          isCurrent ? 'text-indigo-600 font-black' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                                        }`}>
                                          {step}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Order Details & Logistics 3-Column Info Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-2xl border border-slate-200 text-xs">
                              
                              {/* 1. Customer Info */}
                              <div className="space-y-1.5">
                                <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  <span>Customer Contact</span>
                                </div>
                                <div className="font-black text-slate-900 text-xs">
                                  {customerName}
                                </div>
                                <div className="text-slate-600 text-[11px] flex items-center gap-1.5 truncate">
                                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{customerEmail}</span>
                                </div>
                                <div className="text-slate-600 text-[11px] flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{customerPhone}</span>
                                </div>
                              </div>

                              {/* 2. Destination Address */}
                              <div className="space-y-1.5 md:border-l md:border-slate-100 md:pl-4">
                                <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span>Shipping Destination</span>
                                  </span>
                                  <button
                                    onClick={() => setViewingAddressModal({ shippingAddress, orderNumber, customerName })}
                                    className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold cursor-pointer"
                                  >
                                    View Full
                                  </button>
                                </div>
                                <div className="font-bold text-slate-800 text-xs truncate">
                                  {shippingAddress.fullName || customerName}
                                </div>
                                <div className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                                  {shippingAddress.street ? `${shippingAddress.street}, ` : ''}
                                  {shippingAddress.city ? `${shippingAddress.city}, ` : ''}
                                  {shippingAddress.state ? `${shippingAddress.state} ` : ''}
                                  {shippingAddress.pincode || ''}
                                  {shippingAddress.country ? ` (${shippingAddress.country})` : ''}
                                  {!shippingAddress.street && !shippingAddress.city && 'Address details on file.'}
                                </div>
                              </div>

                              {/* 3. Payment & Logistics */}
                              <div className="space-y-1.5 md:border-l md:border-slate-100 md:pl-4">
                                <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                                  <CreditCard className="w-3 h-3 text-slate-400" />
                                  <span>Payment & Logistics</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-slate-700 font-bold text-xs truncate">{paymentMethod}</span>
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                                    isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {isPaid ? 'Paid in Full' : 'Pending COD'}
                                  </span>
                                </div>
                                <div className="text-slate-500 text-[11px]">
                                  Speed: <strong className="text-slate-700">{order.deliverySpeed === 'express' ? 'Express Dispatch' : 'Standard Delivery'}</strong>
                                </div>
                              </div>

                            </div>

                            {/* Order Products List */}
                            <div className="space-y-2">
                              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                                <span>Ordered Products ({orderItems.length})</span>
                                <button
                                  onClick={() => setViewingOrderModal(order)}
                                  className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Order Summary</span>
                                </button>
                              </div>
                              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs">
                                {orderItems.map((item, i) => {
                                  if (!item) return null;
                                  const itemPrice = parseFloat(item.price || 0);
                                  const itemQuantity = parseInt(item.quantity || 1);
                                  const itemTotal = itemPrice * itemQuantity;

                                  return (
                                    <div key={item.id || item.productId || i} className="p-3.5 flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <img
                                          src={item.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=120&auto=format&fit=crop&q=80'}
                                          alt={item.name || 'Product Image'}
                                          onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=120&auto=format&fit=crop&q=80';
                                          }}
                                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                                        />
                                        <div className="min-w-0">
                                          <div className="font-bold text-slate-900 line-clamp-1">{item.name || 'Product item'}</div>
                                          <div className="text-[11px] text-slate-400 mt-0.5">
                                            Qty: <strong className="text-slate-700">{itemQuantity}</strong> {item.variant ? `• Option: ${item.variant}` : ''}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <div className="font-extrabold text-slate-900">{formatPrice(itemTotal, order.currency)}</div>
                                        <div className="text-[10px] text-slate-400">({formatPrice(itemPrice, order.currency)} each)</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Footer Summary & Seller Quick Actions */}
                            <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  onClick={() => setViewingOrderModal(order)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Full Details</span>
                                </button>
                                <button
                                  onClick={() => setViewingAddressModal({ shippingAddress, orderNumber, customerName })}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>Address</span>
                                </button>
                                {customerPhone !== 'N/A' && (
                                  <a
                                    href={`tel:${customerPhone}`}
                                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>Call Customer</span>
                                  </a>
                                )}
                              </div>
                              <div className="text-xs font-bold text-slate-700 text-right">
                                <span className="text-slate-500 mr-1.5">Order Total:</span>
                                <span className="text-indigo-600 font-black text-sm">{order.displayTotal || formatPrice(orderTotalAmount, order.currency)}</span>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}

            </div>
          </ErrorBoundary>
        )}

        {/* 4. STORE SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl shadow-sm space-y-6">
            <h3 className="font-extrabold text-base text-slate-900">Store Profile & Settlement Configuration</h3>
            <form onSubmit={handleSaveStoreProfile} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Store Name</label>
                <input
                  type="text"
                  value={storeForm.storeName}
                  onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">About Store / Tagline</label>
                <textarea
                  rows="3"
                  value={storeForm.description}
                  onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Direct Phone & WhatsApp Number (For Buyer Inquiries)</label>
                <input
                  type="text"
                  value={storeForm.phone}
                  onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                  placeholder="e.g. +1 (555) 392-1082"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 font-semibold"
                />
                <p className="text-[10px] text-slate-400 mt-1">This number enables direct WhatsApp chatting and calling buttons for buyers on your product pages.</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Registered Business Address</label>
                <input
                  type="text"
                  value={storeForm.businessAddress}
                  onChange={(e) => setStoreForm({ ...storeForm, businessAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payout Settlement Bank</label>
                <input
                  type="text"
                  value={storeForm.payoutBank}
                  onChange={(e) => setStoreForm({ ...storeForm, payoutBank: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 font-semibold"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
              >
                Update Store Profile
              </button>
            </form>
          </div>
        )}

        {/* 📊 ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">📊 Store Performance & Sales Analytics</h3>
                <p className="text-xs text-slate-500">Real-time revenue metrics, order velocity, and customer conversion rates</p>
              </div>
            </div>

            {/* Metric KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
                <div className="text-slate-400 text-xs font-bold uppercase">Store Conversion Rate</div>
                <div className="text-2xl font-black text-indigo-600">3.8%</div>
                <div className="text-[11px] text-emerald-600 font-bold">▲ +0.6% this week</div>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
                <div className="text-slate-400 text-xs font-bold uppercase">Avg Order Value (AOV)</div>
                <div className="text-2xl font-black text-slate-900">{formatPrice(124.50)}</div>
                <div className="text-[11px] text-indigo-600 font-bold">Based on completed sales</div>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
                <div className="text-slate-400 text-xs font-bold uppercase">Store Followers</div>
                <div className="text-2xl font-black text-amber-500">2,840</div>
                <div className="text-[11px] text-slate-400">High engagement buyers</div>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
                <div className="text-slate-400 text-xs font-bold uppercase">Order Fulfillment Rate</div>
                <div className="text-2xl font-black text-emerald-600">99.2%</div>
                <div className="text-[11px] text-emerald-600 font-bold">Fast shipping score ★★★★★</div>
              </div>
            </div>

            {/* Interactive Trend Chart simulation */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Weekly Revenue Distribution ($ USD)</h4>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">Last 7 Days</span>
              </div>
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 pt-6 pb-2 border-b border-slate-100">
                {[
                  { day: 'Mon', val: 420, height: '40%' },
                  { day: 'Tue', val: 680, height: '65%' },
                  { day: 'Wed', val: 510, height: '50%' },
                  { day: 'Thu', val: 920, height: '88%' },
                  { day: 'Fri', val: 1040, height: '100%' },
                  { day: 'Sat', val: 860, height: '82%' },
                  { day: 'Sun', val: 740, height: '70%' }
                ].map((bar, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">${bar.val}</span>
                    <div className="w-full bg-indigo-600 group-hover:bg-indigo-500 rounded-2xl transition-all" style={{ height: bar.height }} />
                    <span className="text-xs font-bold text-slate-600">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 💬 MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <ChatInbox isSellerView={true} onNavigate={onNavigate} />
          </div>
        )}

        {/* 💰 WALLET & PAYOUTS TAB */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">💰 Seller Wallet & Escrow Ledger</h3>
                <p className="text-xs text-slate-500">Manage sales proceeds, platform commission deductions, and direct bank withdrawals</p>
              </div>
            </div>

            {/* Wallet Balance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-800 space-y-3">
                <div className="text-indigo-200 text-xs font-bold uppercase">Available for Withdrawal</div>
                <div className="text-3xl font-black text-amber-400">
                  {wallet ? formatPrice(wallet.balance) : formatPrice(1850.40)}
                </div>
                <div className="text-xs text-slate-300">Ready to transfer to linked bank account</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="text-slate-400 text-xs font-bold uppercase">Pending in Escrow</div>
                <div className="text-2xl font-black text-slate-800">
                  {wallet ? formatPrice(wallet.pendingBalance) : formatPrice(420.00)}
                </div>
                <div className="text-xs text-slate-500">Auto-released 48h after confirmed delivery</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="text-slate-400 text-xs font-bold uppercase">Total Settled to Date</div>
                <div className="text-2xl font-black text-emerald-600">
                  {wallet ? formatPrice(wallet.totalWithdrawn) : formatPrice(12450.00)}
                </div>
                <div className="text-xs text-slate-500">Processed with 0% delay</div>
              </div>
            </div>

            {/* Request Withdrawal Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Request Payout Withdrawal</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Withdrawal Amount ($ USD)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Settlement Bank / UPI Account</label>
                  <input
                    type="text"
                    value={withdrawDetails}
                    onChange={(e) => setWithdrawDetails(e.target.value)}
                    placeholder="e.g. Chase Bank Acct ending in 4921 / seller@okaxis"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
              <button
                onClick={async () => {
                  const amt = parseFloat(withdrawAmount);
                  if (!amt || amt < 10) {
                    showError('Minimum payout request amount is $10.');
                    return;
                  }
                  setIsWithdrawing(true);
                  try {
                    const res = await api.requestPayout(amt, withdrawDetails || 'Primary Bank Account');
                    if (res.success) {
                      showSuccess('Payout withdrawal request submitted successfully!');
                      setWithdrawAmount('');
                      loadWallet();
                    }
                  } catch (err) {
                    showError(err.message || 'Payout request failed.');
                  } finally {
                    setIsWithdrawing(false);
                  }
                }}
                disabled={isWithdrawing}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-50"
              >
                {isWithdrawing ? 'Submitting Request...' : 'Submit Withdrawal Request'}
              </button>
            </div>
          </div>
        )}

        {/* 🏷️ SELLER COUPONS TAB */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">🏷️ Store Discount Coupons & Vouchers</h3>
                <p className="text-xs text-slate-500">Create store-specific promo codes to incentivize cart conversions</p>
              </div>
            </div>

            {/* Create Coupon Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Create New Promo Code</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    value={newCouponForm.code}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. APEX20"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold uppercase outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discount Type</label>
                  <select
                    value={newCouponForm.discountType}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, discountType: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-600 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={newCouponForm.discountValue}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Spend ($)</label>
                  <input
                    type="number"
                    value={newCouponForm.minOrderValue}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, minOrderValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!newCouponForm.code.trim()) {
                    showError('Please enter a coupon code.');
                    return;
                  }
                  setIsCreatingCoupon(true);
                  try {
                    const res = await api.createSellerCoupon(newCouponForm);
                    if (res.success) {
                      showSuccess(`Coupon ${newCouponForm.code} created!`);
                      setNewCouponForm({ code: '', discountType: 'percentage', discountValue: 10, minOrderValue: 50, maxDiscountAmount: 30, description: '' });
                      loadSellerCoupons();
                    }
                  } catch (err) {
                    showError(err.message || 'Failed to create coupon.');
                  } finally {
                    setIsCreatingCoupon(false);
                  }
                }}
                disabled={isCreatingCoupon}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isCreatingCoupon ? 'Creating...' : '+ Add Coupon'}
              </button>
            </div>

            {/* Coupons List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sellerCoupons.map(c => (
                <div key={c.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-xl font-mono font-black text-sm tracking-wider">
                      {c.code}
                    </span>
                    <button
                      onClick={async () => {
                        await api.deleteSellerCoupon(c.id);
                        showInfo('Coupon deleted');
                        loadSellerCoupons();
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-600">
                    <strong>{c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}</strong> on orders over ${c.minOrderValue}
                  </div>
                  <div className="text-[10px] text-slate-400">Used: {c.usedCount || 0} times</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🔥 FLASH SALES TAB */}
        {activeTab === 'flashsales' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">🔥 Flash Sales & Timed Deals</h3>
                <p className="text-xs text-slate-500">Feature your products on the homepage animated flash sales ticker with countdown timers</p>
              </div>
            </div>

            {/* Schedule Flash Deal */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Schedule New Flash Deal</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Product *</label>
                  <select
                    value={newFlashForm.productId}
                    onChange={(e) => setNewFlashForm({ ...newFlashForm, productId: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-600 bg-white"
                  >
                    <option value="">Select product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Reg: ${p.price})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Flash Deal Price ($ USD) *</label>
                  <input
                    type="number"
                    value={newFlashForm.salePrice}
                    onChange={(e) => setNewFlashForm({ ...newFlashForm, salePrice: e.target.value })}
                    placeholder="e.g. 199.99"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    value={newFlashForm.durationHours}
                    onChange={(e) => setNewFlashForm({ ...newFlashForm, durationHours: parseInt(e.target.value) || 24 })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Deal Units Limit</label>
                  <input
                    type="number"
                    value={newFlashForm.saleStock}
                    onChange={(e) => setNewFlashForm({ ...newFlashForm, saleStock: parseInt(e.target.value) || 20 })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!newFlashForm.productId || !newFlashForm.salePrice) {
                    showError('Please select a product and enter the flash sale price.');
                    return;
                  }
                  setIsCreatingFlash(true);
                  try {
                    const res = await api.createFlashSale({
                      productId: newFlashForm.productId,
                      salePrice: parseFloat(newFlashForm.salePrice),
                      durationHours: newFlashForm.durationHours,
                      saleStock: newFlashForm.saleStock
                    });
                    if (res.success) {
                      showSuccess('Flash deal activated and live on Marketzo homepage!');
                      setNewFlashForm({ productId: '', salePrice: '', durationHours: 24, saleStock: 20 });
                      loadSellerFlashSales();
                    }
                  } catch (err) {
                    showError(err.message || 'Failed to activate flash sale.');
                  } finally {
                    setIsCreatingFlash(false);
                  }
                }}
                disabled={isCreatingFlash}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isCreatingFlash ? 'Launching...' : '🔥 Launch Flash Deal'}
              </button>
            </div>

            {/* Flash Sales List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sellerFlashSales.map(fs => (
                <div key={fs.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={fs.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=120'} alt={fs.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{fs.name}</h4>
                      <div className="text-xs font-black text-rose-600">${fs.salePrice} <span className="text-slate-400 line-through text-[10px] font-normal">${fs.originalPrice}</span></div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl flex items-center justify-between">
                    <span>Stock: {fs.saleStock} units</span>
                    <span className="text-rose-600 font-bold">⚡ Active Deal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🏆 VERIFICATION TAB */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">🏆 Business Verification & Trust Badges</h3>
                <p className="text-xs text-slate-500">Verify company credentials to earn the official Gold Verified Merchant badge</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <ShieldCheck className="w-10 h-10 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-extrabold text-sm text-emerald-900">Verified Seller Status: Active</div>
                  <p className="text-xs text-emerald-700">Your merchant profile displays the official Verified Merchant & Fast Shipping trust badges to all buyers.</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Business Identity Records</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company / Entity Type</label>
                    <input
                      type="text"
                      value={verifForm.businessType}
                      onChange={(e) => setVerifForm({ ...verifForm, businessType: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tax Registration Number (GSTIN / EIN)</label>
                    <input
                      type="text"
                      value={verifForm.registrationNumber}
                      onChange={(e) => setVerifForm({ ...verifForm, registrationNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono font-bold outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <button
                  onClick={async () => {
                    setIsSubmittingVerif(true);
                    try {
                      const res = await api.submitVerification(verifForm);
                      if (res.success) {
                        showSuccess('Business verification credentials submitted to Marketzo Compliance!');
                      }
                    } catch (err) {
                      showError(err.message || 'Failed to submit verification.');
                    } finally {
                      setIsSubmittingVerif(false);
                    }
                  }}
                  disabled={isSubmittingVerif}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingVerif ? 'Submitting...' : 'Update Verification Records'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 📦 WHOLESALE & RFQ TAB */}
        {activeTab === 'wholesale' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">📦 Alibaba-Style Wholesale & RFQ Negotiations</h3>
                <p className="text-xs text-slate-500">Review bulk quote inquiries and submit customized volume pricing offers to enterprise buyers</p>
              </div>
            </div>

            {rfqs.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
                <Layers className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">No Incoming RFQs</h4>
                <p className="text-xs text-slate-500">Enterprise buyers can request bulk quotes directly from your product pages.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rfqs.map(r => (
                  <div key={r.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <span className="font-black text-sm text-slate-900">{r.productName}</span>
                        <div className="text-[11px] text-slate-400">Buyer: {r.customerName} ({r.customerEmail}) • Received on {new Date(r.createdAt).toLocaleDateString()}</div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        r.status === 'quoted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status === 'quoted' ? 'Quote Submitted' : 'Pending Response'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl">
                      <div><span className="text-slate-400 block text-[10px]">Target Quantity</span><strong>{r.targetQuantity} units</strong></div>
                      <div><span className="text-slate-400 block text-[10px]">Buyer Budget Target</span><strong>${r.targetPricePerUnit}/unit</strong></div>
                      <div><span className="text-slate-400 block text-[10px]">Delivery Port/City</span><strong className="truncate block">{r.shippingDestination}</strong></div>
                      <div><span className="text-slate-400 block text-[10px]">Custom Specs</span><strong className="truncate block">{r.customSpecifications || 'Standard specs'}</strong></div>
                    </div>

                    {r.status === 'pending_seller' && (
                      <div className="pt-2">
                        {activeRfqForQuote === r.id ? (
                          <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 space-y-3">
                            <h5 className="font-bold text-xs text-indigo-950">Submit Official Merchant Quotation</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Offered Unit Price ($ USD) *</label>
                                <input
                                  type="number"
                                  value={quoteForm.offeredPricePerUnit}
                                  onChange={(e) => setQuoteForm({ ...quoteForm, offeredPricePerUnit: e.target.value })}
                                  placeholder="e.g. 175.00"
                                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                                />
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Min Batch Order Qty</label>
                                <input
                                  type="number"
                                  value={quoteForm.minQuantity}
                                  onChange={(e) => setQuoteForm({ ...quoteForm, minQuantity: parseInt(e.target.value) || 50 })}
                                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                                />
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Lead Time (Days)</label>
                                <input
                                  type="number"
                                  value={quoteForm.estimatedProductionDays}
                                  onChange={(e) => setQuoteForm({ ...quoteForm, estimatedProductionDays: parseInt(e.target.value) || 3 })}
                                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveRfqForQuote(null)}
                                className="px-3 py-1.5 text-slate-600 font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!quoteForm.offeredPricePerUnit) {
                                    showError('Please enter your offered unit price.');
                                    return;
                                  }
                                  setIsSubmittingQuote(true);
                                  try {
                                    const res = await api.submitRfqQuote(r.id, quoteForm);
                                    if (res.success) {
                                      showSuccess('Wholesale quotation sent to buyer!');
                                      setActiveRfqForQuote(null);
                                      loadSellerRfqs();
                                    }
                                  } catch (err) {
                                    showError(err.message || 'Failed to submit quote.');
                                  } finally {
                                    setIsSubmittingQuote(false);
                                  }
                                }}
                                disabled={isSubmittingQuote}
                                className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-md cursor-pointer disabled:opacity-50"
                              >
                                {isSubmittingQuote ? 'Submitting...' : 'Send Quotation to Buyer'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRfqForQuote(r.id);
                              setQuoteForm({ offeredPricePerUnit: r.targetPricePerUnit || 150, minQuantity: r.targetQuantity || 50, shippingCost: 0, estimatedProductionDays: 3, notes: 'Includes fast DHL express dispatch.' });
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                          >
                            💬 Send Custom Price Quote
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 🛡️ DISPUTES TAB */}
        {activeTab === 'disputes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">🛡️ Customer Returns & Dispute Resolution</h3>
                <p className="text-xs text-slate-500">Respond to customer refund or replacement requests before platform arbitration</p>
              </div>
            </div>

            {disputes.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">Zero Active Customer Disputes</h4>
                <p className="text-xs text-slate-500">All customer orders have been fulfilled with 100% satisfaction.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map(d => (
                  <div key={d.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 text-xs shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <span className="font-black text-sm text-slate-900">Order #{d.orderNumber}</span>
                        <div className="text-[11px] text-slate-400">Claimant: {d.userName} • Filed on {new Date(d.createdAt).toLocaleDateString()}</div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        d.status === 'resolved_refund' ? 'bg-emerald-100 text-emerald-800' :
                        d.status === 'seller_replied' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {d.status === 'resolved_refund' ? 'Refund Processed' :
                         d.status === 'seller_replied' ? 'Seller Replied' : 'Awaiting Seller Response'}
                      </span>
                    </div>

                    <div><strong>Customer Reason:</strong> <span className="text-slate-600">{d.reasonLabel || d.reason}</span></div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <strong>Customer Claim:</strong>
                      <p className="text-slate-600 mt-0.5">{d.description}</p>
                    </div>

                    {d.sellerResponse ? (
                      <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100">
                        <strong>Your Merchant Response:</strong>
                        <p className="text-indigo-950 mt-0.5">💬 {d.sellerResponse}</p>
                      </div>
                    ) : (
                      <div className="pt-2">
                        {activeDisputeForResponse === d.id ? (
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <label className="font-bold text-slate-700 block">Write Official Seller Response / Proposal</label>
                            <textarea
                              rows={3}
                              value={disputeResponseText}
                              onChange={(e) => setDisputeResponseText(e.target.value)}
                              placeholder="e.g. We apologize for the issue. A replacement unit has been dispatched with tracking #TRK-9821."
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveDisputeForResponse(null)}
                                className="px-3 py-1.5 text-slate-600 font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!disputeResponseText.trim()) return;
                                  setIsSubmittingDisputeResp(true);
                                  try {
                                    const res = await api.respondToDispute(d.id, disputeResponseText.trim());
                                    if (res.success) {
                                      showSuccess('Response sent to customer and arbitration panel!');
                                      setActiveDisputeForResponse(null);
                                      setDisputeResponseText('');
                                      loadSellerDisputes();
                                    }
                                  } catch (err) {
                                    showError(err.message || 'Failed to submit response.');
                                  } finally {
                                    setIsSubmittingDisputeResp(false);
                                  }
                                }}
                                disabled={isSubmittingDisputeResp || !disputeResponseText.trim()}
                                className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl font-bold shadow-sm cursor-pointer disabled:opacity-50"
                              >
                                {isSubmittingDisputeResp ? 'Submitting...' : 'Send Response'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setActiveDisputeForResponse(d.id); setDisputeResponseText(''); }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                          >
                            💬 Respond to Customer Claim
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* COMPREHENSIVE ADD / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-black text-xl text-slate-900">
                  {editingProductId ? 'Edit Marketplace Product' : 'Create & Publish New Product'}
                </h3>
                <p className="text-xs text-slate-500">Provide comprehensive product details, pricing, variants, and imagery.</p>
              </div>
              <button onClick={() => setShowProductModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden Multiple Image Picker */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageFilesUpload}
              className="hidden"
            />

            <div className="space-y-6 text-xs">
              
              {/* 1. Basic Information */}
              <div className="space-y-4">
                <div className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>1. General Product Details</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product Title *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. SonicPulse Pro ANC Wireless Studio Headphones"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Department Category *</label>
                    <select
                      value={productForm.categoryId}
                      onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-600 bg-white"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Brand</label>
                    <select
                      value={productForm.brandId}
                      onChange={(e) => setProductForm({ ...productForm, brandId: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-600 bg-white"
                    >
                      <option value="">Custom / Store Brand</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">SKU / Product Code</label>
                    <input
                      type="text"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      placeholder="e.g. MKZ-AUDIO-01"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono font-semibold outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product Description</label>
                  <textarea
                    rows="3"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Provide in-depth specs, material composition, compatibility, and key customer value..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-normal outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* 2. Pricing, Inventory & Shipping */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>2. Pricing, Stock & Logistics</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Selling Price ($ USD Base) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="e.g. 249.99"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-black text-slate-900 outline-none focus:border-indigo-600"
                      required
                    />
                    {productForm.price && (
                      <div className="text-[11px] text-indigo-600 font-bold mt-1">
                        Shopper view ({currentCurrency}): {formatPrice(parseFloat(productForm.price) || 0)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Original Price / MSRP ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                      placeholder="e.g. 299.99"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-600"
                    />
                    {productForm.originalPrice && (
                      <div className="text-[11px] text-slate-400 font-medium mt-1">
                        Shopper view: {formatPrice(parseFloat(productForm.originalPrice) || 0)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Stock Quantity (Units) *</label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      placeholder="e.g. 25"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Item Weight</label>
                    <input
                      type="text"
                      value={productForm.weight}
                      onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                      placeholder="e.g. 0.85 kg"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Shipping Speed / Policy</label>
                    <input
                      type="text"
                      value={productForm.shippingInfo}
                      onChange={(e) => setProductForm({ ...productForm, shippingInfo: e.target.value })}
                      placeholder="e.g. Free 2-Day Priority Delivery"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Direct Contact Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={productForm.contactPhone}
                      onChange={(e) => setProductForm({ ...productForm, contactPhone: e.target.value })}
                      placeholder="e.g. +1 (555) 392-1082"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tags / Search Keywords (Comma separated)</label>
                  <input
                    type="text"
                    value={productForm.tags}
                    onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                    placeholder="e.g. wireless, anc, bluetooth 5.3, studio, studio-grade"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* 3. Multiple Product Imagery */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>3. Product Images Gallery ({productForm.images.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Images</span>
                  </button>
                </div>

                {/* Direct Image URL Add */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Or paste an image URL (https://...)"
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                {/* Live Images Preview Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                  {productForm.images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-2xl overflow-hidden aspect-square border-2 border-slate-200 bg-slate-100">
                      <img
                        src={img}
                        alt={`Product ${idx}`}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
                        }}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                          PRIMARY
                        </span>
                      )}
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="p-1.5 bg-white text-slate-800 rounded-lg text-[10px] font-bold hover:bg-indigo-600 hover:text-white"
                            title="Set as Primary"
                          >
                            ★
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                          title="Remove Image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Product Variants */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-500" />
                  <span>4. Product Options / Variants</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                    placeholder="Option (e.g. Color / Storage)"
                    className="sm:w-36 px-3 py-2 border border-slate-200 rounded-xl"
                  />
                  <input
                    type="text"
                    value={newVariant.value}
                    onChange={(e) => setNewVariant({ ...newVariant, value: e.target.value })}
                    placeholder="Value (e.g. Matte Black / 512GB)"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl"
                  />
                  <input
                    type="number"
                    value={newVariant.priceDiff}
                    onChange={(e) => setNewVariant({ ...newVariant, priceDiff: e.target.value })}
                    placeholder="Price Diff (+-$)"
                    className="sm:w-28 px-3 py-2 border border-slate-200 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
                  >
                    + Add Variant
                  </button>
                </div>

                {productForm.variants?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {productForm.variants.map((v) => (
                      <span key={v.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-800 rounded-xl font-bold text-xs border border-indigo-200/70">
                        <span>{v.name}: {v.value} {v.priceDiff > 0 ? `(+$${v.priceDiff})` : ''}</span>
                        <button type="button" onClick={() => handleRemoveVariant(v.id)} className="text-slate-400 hover:text-rose-600">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Highlights & Specifications */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>5. Key Highlights & Technical Specs</span>
                </div>

                {/* Highlights */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Key Highlights (Bullet Points)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newHighlight}
                      onChange={(e) => setNewHighlight(e.target.value)}
                      placeholder="e.g. 40-Hour ANC battery life with quick charge"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                    >
                      Add Point
                    </button>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    {productForm.highlights.map((h, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-xl text-slate-700">
                        <span>• {h}</span>
                        <button type="button" onClick={() => handleRemoveHighlight(i)} className="text-slate-400 hover:text-rose-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specs */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Technical Specifications</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSpec.key}
                      onChange={(e) => setNewSpec({ ...newSpec, key: e.target.value })}
                      placeholder="Attribute (e.g. Driver Size)"
                      className="w-1/3 px-3 py-2 border border-slate-200 rounded-xl"
                    />
                    <input
                      type="text"
                      value={newSpec.value}
                      onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                      placeholder="Value (e.g. 40mm Custom Neodymium)"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpec}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                    >
                      Add Spec
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {Object.entries(productForm.specs).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-xl text-slate-700 border border-slate-100">
                        <span><strong>{key}:</strong> {val}</span>
                        <button type="button" onClick={() => handleRemoveSpec(key)} className="text-slate-400 hover:text-rose-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Action Controls: Save Draft & Publish */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isSubmittingProduct}
                  onClick={() => handleSaveProduct('draft')}
                  className="flex-1 sm:flex-none px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  disabled={isSubmittingProduct}
                  onClick={() => handleSaveProduct('approved')}
                  className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingProduct ? 'Publishing...' : editingProductId ? 'Update & Publish' : 'Publish Product to Marketplace'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: ORDER DETAILS MODAL */}
      {viewingOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-black text-lg text-slate-900">
                    Order #{viewingOrderModal.orderNumber || viewingOrderModal.id}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    viewingOrderModal.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                    viewingOrderModal.orderStatus === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                    'bg-indigo-100 text-indigo-800'
                  }`}>
                    {viewingOrderModal.orderStatus || viewingOrderModal.status || 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Placed on {viewingOrderModal.createdAt ? new Date(viewingOrderModal.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setViewingOrderModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl text-xs">
              <div className="space-y-1">
                <div className="font-bold text-slate-400 uppercase text-[10px]">Customer Details</div>
                <div className="font-bold text-slate-900">{viewingOrderModal.customerName || viewingOrderModal.userName || 'Customer'}</div>
                <div className="text-slate-600">{viewingOrderModal.customerEmail || viewingOrderModal.userEmail || 'N/A'}</div>
                <div className="text-slate-600">{viewingOrderModal.customerPhone || viewingOrderModal.shippingAddress?.phone || 'N/A'}</div>
              </div>
              <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
                <div className="font-bold text-slate-400 uppercase text-[10px]">Shipping Destination</div>
                <div className="font-bold text-slate-900">{viewingOrderModal.shippingAddress?.fullName || 'Recipient'}</div>
                <div className="text-slate-600">
                  {viewingOrderModal.shippingAddress?.street ? `${viewingOrderModal.shippingAddress.street}, ` : ''}
                  {viewingOrderModal.shippingAddress?.city ? `${viewingOrderModal.shippingAddress.city}, ` : ''}
                  {viewingOrderModal.shippingAddress?.state ? `${viewingOrderModal.shippingAddress.state} ` : ''}
                  {viewingOrderModal.shippingAddress?.pincode || ''}
                </div>
              </div>
            </div>

            {/* Line Items Breakdown */}
            <div className="space-y-3">
              <div className="font-bold text-slate-700 text-xs uppercase tracking-wider">Ordered Products</div>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                {(Array.isArray(viewingOrderModal.items) ? viewingOrderModal.items : []).map((it, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3">
                      <img
                        src={it.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=120&auto=format&fit=crop&q=80'}
                        alt={it.name}
                        className="w-10 h-10 rounded-xl object-cover bg-slate-100"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=120&auto=format&fit=crop&q=80'; }}
                      />
                      <div>
                        <div className="font-bold text-slate-900">{it.name}</div>
                        <div className="text-[11px] text-slate-400">Qty: {it.quantity} {it.variant ? `(${it.variant})` : ''}</div>
                      </div>
                    </div>
                    <div className="font-extrabold text-slate-900">
                      {formatPrice((parseFloat(it.price) || 0) * (parseInt(it.quantity) || 1), viewingOrderModal.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Payment Method:</span>
                <strong className="text-slate-800">{viewingOrderModal.paymentMethod || 'Standard Card'}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Status:</span>
                <strong className="text-slate-800 capitalize">{viewingOrderModal.paymentStatus || 'Pending'}</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                <span>Grand Total:</span>
                <span className="text-indigo-600">{viewingOrderModal.displayTotal || formatPrice(viewingOrderModal.totalAmount || 0, viewingOrderModal.currency)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setViewingOrderModal(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Summary
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: SHIPPING ADDRESS MODAL */}
      {viewingAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-base text-slate-900">Full Shipping Address</h3>
              </div>
              <button
                onClick={() => setViewingAddressModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs leading-relaxed">
              <div className="font-extrabold text-sm text-slate-900">
                {viewingAddressModal.shippingAddress?.fullName || viewingAddressModal.customerName || 'Customer'}
              </div>
              {viewingAddressModal.shippingAddress?.phone && (
                <div className="text-slate-700 font-medium">
                  📞 Phone: <strong>{viewingAddressModal.shippingAddress.phone}</strong>
                </div>
              )}
              <div className="text-slate-600 pt-1 border-t border-slate-200/60">
                {viewingAddressModal.shippingAddress?.street && <div>{viewingAddressModal.shippingAddress.street}</div>}
                <div>
                  {[
                    viewingAddressModal.shippingAddress?.city,
                    viewingAddressModal.shippingAddress?.state,
                    viewingAddressModal.shippingAddress?.pincode
                  ].filter(Boolean).join(', ')}
                </div>
                {viewingAddressModal.shippingAddress?.country && (
                  <div className="font-bold text-slate-700">{viewingAddressModal.shippingAddress.country}</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  const addr = viewingAddressModal.shippingAddress || {};
                  const text = `${addr.fullName || ''}\n${addr.street || ''}\n${addr.city || ''}, ${addr.state || ''} ${addr.pincode || ''}\n${addr.country || ''}\nPhone: ${addr.phone || ''}`;
                  navigator.clipboard.writeText(text);
                  showSuccess('Address copied to clipboard!');
                }}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Address</span>
              </button>
              <button
                onClick={() => setViewingAddressModal(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

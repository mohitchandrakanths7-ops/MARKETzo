import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Zap, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  MapPin, 
  CheckCircle2, 
  Store, 
  Tag, 
  Share2, 
  Plus, 
  Minus, 
  Sparkles, 
  Phone, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/product/ProductCard';
import { ReviewSection } from '../components/product/ReviewSection';
import { SellerChatModal } from '../components/chat/SellerChatModal';
import { WholesaleRfqModal } from '../components/wholesale/WholesaleRfqModal';
import { ShareProductModal } from '../components/product/ShareProductModal';
import { api } from '../services/api';

// Custom SVG WhatsApp Icon
const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.587 1.961.88 2.796.88h.001c3.181 0 5.768-2.586 5.768-5.766 0-3.18-2.587-5.767-5.769-5.767zm7.592 5.767c0 4.186-3.407 7.593-7.592 7.593-.001 0-.002 0-.003 0-1.328 0-2.607-.352-3.73-1.018l-4.148 1.087 1.107-4.041c-.733-1.168-1.121-2.518-1.121-3.905 0-4.186 3.407-7.593 7.592-7.593 4.185 0 7.592 3.407 7.592 7.593zm-3.693 2.115c-.2-.1-.1.183-.73-.082-.1-.016-.628-.276-1.196-.782-.442-.394-.741-.88-.828-1.029-.087-.149-.009-.23.041-.328.045-.088.1-.2.15-.3.05-.1.067-.167.1-.284.033-.117.017-.217-.008-.317-.025-.1-.234-.564-.321-.773-.085-.203-.171-.175-.235-.178-.061-.003-.131-.004-.201-.004-.07 0-.184.026-.28.131-.096.105-.367.359-.367.875s.376 1.014.428 1.084c.053.07 1.002 1.529 2.428 2.144.339.147.604.234.81.3.341.108.651.093.896.056.273-.041.839-.343.957-.674.118-.331.118-.615.083-.674-.035-.059-.13-.094-.27-.164z"/>
  </svg>
);

// Phone normalization helper for WhatsApp deep links
const normalizePhoneForWhatsApp = (phone) => {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    digits = '1' + digits;
  }
  return digits;
};

// WhatsApp link generator
const getWhatsAppUrl = (phone, productName) => {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) return null;
  const message = `Hi! I am interested in purchasing "${productName}" on MARKETZO. Is this item currently in stock?`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
};

// Tel dialer link generator
const getTelUrl = (phone) => {
  if (!phone) return null;
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned ? `tel:${cleaned}` : null;
};

export const ProductDetailPage = ({ routeParams = {}, onNavigate }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { showSuccess, showInfo, showError } = useToast();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState(() => localStorage.getItem('marketzo_pincode') || '');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [isCheckingPin, setIsCheckingPin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Swipe gesture state for mobile touch
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Modals & Social
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRfqOpen, setIsRfqOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Load product details
  useEffect(() => {
    const fetchProduct = async () => {
      const idOrSlug = routeParams.id || routeParams.slug || routeParams.productId;
      if (!idOrSlug) return;

      try {
        setIsLoading(true);
        const res = await api.getProduct(idOrSlug);
        if (res.success && res.product) {
          setProduct(res.product);
          setActiveImage(0);
          if (res.product.variants?.length > 0) {
            setSelectedVariant(res.product.variants[0]);
          }

          if (res.product.sellerId) {
            api.checkFollowSeller(res.product.sellerId).then(fRes => {
              if (fRes.success) {
                setIsFollowing(fRes.isFollowing);
                setFollowersCount(fRes.totalFollowers);
              }
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Product fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [routeParams.id, routeParams.slug, routeParams.productId]);

  const handleToggleFollow = async () => {
    if (!product?.sellerId) return;
    try {
      const res = await api.toggleFollowSeller(product.sellerId);
      if (res.success) {
        setIsFollowing(res.isFollowing);
        setFollowersCount(res.totalFollowers);
        if (res.isFollowing) {
          showSuccess(`You are now following ${product.seller?.storeName || 'this store'}!`);
        } else {
          showInfo(`Unfollowed ${product.seller?.storeName || 'store'}.`);
        }
      }
    } catch {
      showError('Please sign in to follow stores.');
    }
  };

  // Check pincode serviceability
  const handleCheckPincode = async (e) => {
    if (e) e.preventDefault();
    if (!pincode || pincode.length < 3) {
      showError('Please enter a valid postal / zip code.');
      return;
    }

    try {
      setIsCheckingPin(true);
      const res = await api.checkPincode(pincode);
      if (res.success) {
        setPincodeResult(res);
        localStorage.setItem('marketzo_pincode', pincode);
      }
    } catch {
      showError('Could not verify postal code.');
    } finally {
      setIsCheckingPin(false);
    }
  };

  const isLiked = product ? isInWishlist(product.id) : false;

  const currentPrice = selectedVariant 
    ? (product?.price || 0) + (selectedVariant.priceDiff || 0)
    : (product?.price || 0);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedVariant ? selectedVariant.value : null);
    showSuccess(`Added ${product.name} to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity, selectedVariant ? selectedVariant.value : null);
    onNavigate('checkout');
  };

  const handleAddBundle = () => {
    if (!product) return;
    addToCart(product, 1, selectedVariant ? selectedVariant.value : null);
    if (product.frequentlyBought) {
      product.frequentlyBought.forEach(p => addToCart(p, 1));
    }
    showSuccess('Added complete bundle with savings to cart!');
  };

  // Mobile Swipe Gesture Handlers
  const minSwipeDistance = 45;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (imagesLength) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Next image
      setActiveImage(prev => (prev + 1 < imagesLength ? prev + 1 : 0));
    } else if (isRightSwipe) {
      // Prev image
      setActiveImage(prev => (prev - 1 >= 0 ? prev - 1 : imagesLength - 1));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded-xl w-3/4" />
            <div className="h-5 bg-slate-200 rounded-lg w-1/2" />
            <div className="h-12 bg-slate-200 rounded-2xl w-1/3 my-6" />
            <div className="h-32 bg-slate-200 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl text-center border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">The requested marketplace product is no longer available or was removed.</p>
        <button
          onClick={() => onNavigate('products', {})}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
        >
          Browse All Products
        </button>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-28 md:pb-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
        
        {/* Breadcrumbs */}
        <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
          <span onClick={() => onNavigate('home')} className="hover:text-indigo-600 cursor-pointer">Home</span>
          <span>/</span>
          <span 
            onClick={() => onNavigate('products', { category: product.categorySlug || product.categoryId || (typeof product.category === 'object' ? product.category?.slug : product.category) })} 
            className="hover:text-indigo-600 cursor-pointer font-bold text-slate-700"
          >
            {product.categoryName || (typeof product.category === 'object' ? product.category?.name : product.category) || 'Department'}
          </span>
          <span>/</span>
          <span className="text-indigo-600 font-bold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Main Product View: Gallery + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* ========================================================
              LEFT COLUMN: Swipeable Product Image Gallery
              ======================================================== */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-4 lg:sticky lg:top-28">
            
            {/* Main Swipeable Image Box */}
            <div 
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={() => onTouchEnd(images.length)}
              className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-sm group select-none flex items-center justify-center p-3"
            >
              <img
                src={images[activeImage]}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
                }}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />

              {/* Discount / Bestseller Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {product.discountPercent > 0 && (
                  <span className="bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-xs uppercase tracking-wider">
                    {product.discountPercent}% OFF
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-lg shadow-xs uppercase tracking-wider">
                    BESTSELLER
                  </span>
                )}
              </div>

              {/* Floating Share & Wishlist Buttons */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                <button
                  type="button"
                  onClick={() => setIsShareOpen(true)}
                  className="p-2.5 rounded-2xl bg-white/90 hover:bg-white text-slate-600 hover:text-indigo-600 border border-slate-200/80 shadow-xs transition-all cursor-pointer press-feedback"
                  title="Share Product"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer press-feedback shadow-xs ${
                    isLiked 
                      ? 'bg-rose-50 border-rose-200 text-rose-600' 
                      : 'bg-white/90 hover:bg-white border-slate-200/80 text-slate-600 hover:text-rose-600'
                  }`}
                  title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Mobile Swipe Left / Right Arrow Hints */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImage(prev => (prev - 1 >= 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-sm border border-slate-200/70 transition-all sm:flex hidden"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImage(prev => (prev + 1 < images.length ? prev + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-sm border border-slate-200/70 transition-all sm:flex hidden"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Mobile Pagination Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-slate-900/60 backdrop-blur-md rounded-full">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activeImage === idx ? 'w-5 bg-white' : 'w-2 bg-white/50'
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white p-1 cursor-pointer press-feedback ${
                      activeImage === i ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200/80 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${i}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* ========================================================
              RIGHT COLUMN: Product Info, Price, Seller, Delivery & CTAs
              ======================================================== */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* 1. Header: Brand, Seller Badge & Title */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 flex-wrap gap-2">
                <span className="font-extrabold text-indigo-600 uppercase tracking-widest text-[11px]">
                  {product.brand?.name || 'Verified Collection'}
                </span>
                <span className="text-slate-500 text-xs">
                  Sold by <strong className="text-slate-900 font-bold">{product.seller?.storeName || 'Marketzo Verified Merchant'}</strong>
                </span>
              </div>

              {/* Product Name */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug mb-2">
                {product.name}
              </h1>

              {/* 2. Rating / Reviews Summary */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-xl text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{product.rating?.toFixed(1) || '4.8'}</span>
                </div>
                <span className="text-xs text-slate-600 font-semibold">{product.reviewCount || 140} verified reviews</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Genuine Stock
                </span>
              </div>
            </div>

            {/* 3. Price & Discounts / Offers Box */}
            <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {formatPrice(currentPrice)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(product.originalPrice + (selectedVariant?.priceDiff || 0))}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black uppercase">
                    Save {product.discountPercent}%
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Inclusive of all taxes • <strong>Free 2-Day Express Shipping</strong></span>
              </div>

              {/* Available Offers */}
              {product.offers?.length > 0 && (
                <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1.5 mt-2">
                  <div className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Active Marketplace Offers</span>
                  </div>
                  {product.offers.map((offer, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-amber-800 font-medium">
                      <Tag className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{offer}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Variant Selector (if available) */}
            {product.variants?.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  Select Option: <span className="text-indigo-600">{selectedVariant?.value}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer press-feedback ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span>{v.value}</span>
                        {v.priceDiff > 0 && <span className="text-amber-500 ml-1">+{formatPrice(v.priceDiff)}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 text-xs font-extrabold text-slate-900 min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>In Stock ({product.stock} units)</span>
              </div>
            </div>

            {/* 5. Direct Purchasing Actions: [ Add to Cart ] & [ Buy Now ] */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer press-feedback"
              >
                <ShoppingCart className="w-4 h-4 text-indigo-600" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer press-feedback"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* 6. Delivery & Pincode Checker */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Delivery & Estimated Date</span>
              </div>

              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter postal code"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCheckingPin}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isCheckingPin ? 'Checking...' : 'Check'}
                </button>
              </form>

              {pincodeResult && (
                <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-0.5">
                  <div className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Express delivery by <strong>{pincodeResult.estimatedDelivery}</strong></span>
                  </div>
                  <div className="text-[11px] text-emerald-700 pl-5">
                    Couriers: {pincodeResult.courierPartner} • COD Supported
                  </div>
                </div>
              )}
            </div>

            {/* 7. Seller Information & Contact Seller ([ WhatsApp ], [ Call ], [ Live Chat ]) */}
            {product.seller && (
              <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.seller.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80'}
                      alt={product.seller.storeName}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-black text-sm text-slate-900">{product.seller.storeName}</h4>
                        <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider border border-emerald-200">
                          Verified
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1 text-amber-700 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {product.seller.rating || 4.9} ({product.seller.reviewCount || 120})
                        </span>
                        <span>•</span>
                        <span className="text-[11px] text-slate-500 font-medium">{followersCount} followers</span>
                      </div>
                    </div>
                  </div>

                  {/* Follow Store Button */}
                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                      isFollowing 
                        ? 'bg-rose-50 border border-rose-200 text-rose-600' 
                        : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFollowing ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl flex items-center justify-between border border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Responds in <strong>under 10 mins</strong></span>
                  </span>
                  {product.seller.phone && (
                    <span className="text-slate-500 font-mono text-[10px]">{product.seller.phone}</span>
                  )}
                </div>

                {/* Contact Seller Action Buttons */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    Contact Seller Directly
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* WhatsApp Button */}
                    <a
                      href={getWhatsAppUrl(product.seller.phone, product.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer press-feedback"
                      title={`Chat on WhatsApp with ${product.seller.storeName}`}
                    >
                      <WhatsAppIcon className="w-4 h-4 fill-current" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Call Button */}
                    <a
                      href={getTelUrl(product.seller.phone)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer press-feedback"
                      title={`Call ${product.seller.storeName}`}
                    >
                      <Phone className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Call</span>
                    </a>
                  </div>

                  {/* In-App Live Chat Button */}
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(true)}
                    className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer press-feedback"
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span>In-App Live Chat</span>
                  </button>
                </div>
              </div>
            )}

            {/* Highlights & Description */}
            <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
              <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Product Highlights</h3>
              <ul className="space-y-2">
                {product.highlights?.map((h, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Technical Specifications */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-wider">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="flex p-3 rounded-2xl bg-slate-50 border border-slate-100 justify-between">
                  <span className="font-semibold text-slate-500">{key}</span>
                  <span className="font-bold text-slate-900">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Reviews Section */}
        <ReviewSection
          productId={product.id}
          reviews={product.reviews || []}
          averageRating={product.rating || 4.8}
          totalReviews={product.reviewCount || 0}
          onReviewSubmitted={() => {}}
        />

        {/* Related Products Grid */}
        {product.relatedProducts?.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Customers Also Viewed
              </h3>
              <button
                onClick={() => onNavigate('products', { category: product.categoryId })}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                View More
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {product.relatedProducts.slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================
          STICKY MOBILE PURCHASE BAR (Appears at bottom of screen)
          ======================================================== */}
      <div 
        className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3"
      >
        <div>
          <div className="text-xs font-bold text-slate-400 leading-none">Total Price</div>
          <div className="text-base font-black text-slate-900 leading-tight">
            {formatPrice(currentPrice * quantity)}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-[240px]">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer press-feedback"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" />
            <span>Add</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-sm shadow-indigo-200 flex items-center justify-center gap-1 cursor-pointer press-feedback"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Buy</span>
          </button>
        </div>
      </div>

      {/* In-App Seller Live Chat Modal */}
      <SellerChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        sellerId={product.sellerId}
        sellerName={product.seller?.storeName}
        product={product}
        onNavigate={onNavigate}
      />

      {/* Wholesale Bulk RFQ Modal */}
      <WholesaleRfqModal
        isOpen={isRfqOpen}
        onClose={() => setIsRfqOpen(false)}
        product={product}
      />

      {/* Social & WhatsApp / Share Modal */}
      <ShareProductModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        product={product}
      />

    </div>
  );
};

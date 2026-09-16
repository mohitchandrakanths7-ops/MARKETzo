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
  Check,
  ArrowLeft,
  BadgePercent
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
  const { addToCart, itemCount } = useCart();
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

  const originalPrice = product?.originalPrice || (product?.price ? product.price * 1.35 : 0);
  const discountPercent = product?.discountPercent || (originalPrice > currentPrice ? Math.round((1 - currentPrice / originalPrice) * 100) : 0);

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
      setActiveImage(prev => (prev + 1 < imagesLength ? prev + 1 : 0));
    } else if (isRightSwipe) {
      setActiveImage(prev => (prev - 1 >= 0 ? prev - 1 : imagesLength - 1));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="skeleton-dark h-8 w-1/3 rounded-xl" />
          <div className="skeleton-dark aspect-square rounded-3xl" />
          <div className="skeleton-dark h-6 w-3/4 rounded-xl" />
          <div className="skeleton-dark h-12 w-1/2 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-[#111827] rounded-3xl text-center border border-white/10 shadow-2xl">
          <h2 className="text-lg font-black text-white mb-2">Product Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">The requested marketplace product is no longer available or was removed.</p>
          <button
            onClick={() => onNavigate('products', {})}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            Browse All Products
          </button>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [product.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'];

  return (
    <div className="min-h-screen bg-[#080c14] md:bg-[#f8fafc] text-white md:text-slate-900 pb-32 md:pb-16 transition-colors">
      
      {/* ========================================================
          MOBILE TOP APP BAR: ← Back | Title | ♡ | 🛒 (Mobile Only)
          ======================================================== */}
      <div className="md:hidden sticky top-0 z-40 bg-[#080c14]/95 backdrop-blur-xl border-b border-white/10 px-3.5 py-2.5 flex items-center justify-between shadow-md">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#111827] text-slate-300 hover:text-white border border-white/10 cursor-pointer press-feedback text-xs font-bold"
          aria-label="Back to previous page"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-slate-300 truncate max-w-[140px]">
          {product.categoryName || 'Marketplace'}
        </span>

        <div className="flex items-center gap-2">
          {/* Wishlist Toggle Button */}
          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            className={`p-2 rounded-xl border transition-all cursor-pointer press-feedback ${
              isLiked 
                ? 'bg-rose-950/80 border-rose-600 text-rose-400' 
                : 'bg-[#111827] border-white/10 text-slate-300 hover:text-rose-400'
            }`}
            title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Cart Button */}
          <button
            type="button"
            onClick={() => onNavigate('cart')}
            className="relative p-2 rounded-xl bg-[#111827] border border-white/10 text-blue-400 cursor-pointer press-feedback"
            aria-label="Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {itemCount > 0 && (
              <span
                className="absolute -top-1 -right-1 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
              >
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-4 sm:space-y-8">
        
        {/* Breadcrumbs (Desktop) */}
        <div className="hidden md:flex text-xs font-semibold text-slate-400 items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-10 items-start">
          
          {/* ========================================================
              SWIPEABLE PRODUCT IMAGE GALLERY (Mobile & Desktop)
              ======================================================== */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-4 lg:sticky lg:top-28">
            
            {/* Main Image Box */}
            <div 
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={() => onTouchEnd(images.length)}
              className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#0a0f1d] md:bg-white border border-white/10 md:border-slate-200/90 shadow-xl group select-none flex items-center justify-center p-3"
            >
              <img
                src={images[activeImage]}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
                }}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {discountPercent > 0 && (
                  <span className="bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-md uppercase tracking-wider">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-lg shadow-md uppercase tracking-wider">
                    BESTSELLER
                  </span>
                )}
              </div>

              {/* Floating Share Button */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                <button
                  type="button"
                  onClick={() => setIsShareOpen(true)}
                  className="p-2.5 rounded-2xl bg-[#111827]/80 md:bg-white/90 text-slate-300 md:text-slate-600 hover:text-blue-400 border border-white/10 md:border-slate-200/80 shadow-md transition-all cursor-pointer press-feedback"
                  title="Share Product"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImage(prev => (prev - 1 >= 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/10 transition-all sm:flex hidden cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImage(prev => (prev + 1 < images.length ? prev + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/10 transition-all sm:flex hidden cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Mobile Pagination Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-[#080c14]/80 backdrop-blur-md rounded-full border border-white/10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activeImage === idx ? 'w-5 bg-gradient-to-r from-blue-400 to-purple-400' : 'w-2 bg-white/40'
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
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-[#0a0f1d] md:bg-white p-1 cursor-pointer press-feedback ${
                      activeImage === i ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-white/10 md:border-slate-200/80 opacity-60 hover:opacity-100'
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
              RIGHT COLUMN: Product Details, Pricing, Seller & Offers
              ======================================================== */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            
            {/* Title & Ratings */}
            <div className="p-4 sm:p-5 bg-[#111827] md:bg-white rounded-3xl border border-white/10 md:border-slate-200/90 shadow-md space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold text-blue-400 uppercase tracking-wider">
                  {product.categoryName || 'Marketplace'}
                </span>
                <span className="text-xs text-emerald-400 md:text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> In Stock
                </span>
              </div>

              {/* Product Name (Large readable typography) */}
              <h1 className="text-base sm:text-xl font-black text-white md:text-slate-900 leading-snug tracking-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews Row */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 bg-[#1a233a] md:bg-amber-50 border border-white/10 md:border-amber-200 text-amber-300 md:text-amber-800 px-2 py-0.5 rounded-lg font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating?.toFixed(1) || '4.6'}</span>
                </div>
                <span className="text-slate-400 md:text-slate-500 font-medium">
                  | {product.reviewCount || 124} Customer Reviews
                </span>
              </div>

              {/* Pricing Section */}
              <div className="pt-3 border-t border-white/10 md:border-slate-100 flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-black text-white md:text-slate-900">
                  {formatPrice(currentPrice)}
                </span>
                {originalPrice > currentPrice && (
                  <span className="text-sm text-slate-500 md:text-slate-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-extrabold uppercase">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Delivery Speed / Pincode check */}
              <div className="p-3 bg-[#0a0f1d] md:bg-slate-50 rounded-2xl border border-white/5 md:border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-300 md:text-slate-700">
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>🚚 Express 2-Day Delivery to <strong>{pincode || 'your area'}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const code = prompt('Enter your pincode:', pincode);
                    if (code) {
                      setPincode(code);
                      localStorage.setItem('marketzo_pincode', code);
                    }
                  }}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>
            </div>

            {/* ========================================================
                VERIFIED SELLER INFORMATION & DIRECT CONTACT (WhatsApp / Call)
                ======================================================== */}
            {product.seller && (
              <div className="p-4 sm:p-5 bg-[#111827] md:bg-white rounded-3xl border border-white/10 md:border-slate-200/90 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#0a0f1d] md:bg-slate-100 flex items-center justify-center text-blue-400 border border-white/10 md:border-slate-200">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400">Sold by</div>
                      <div className="text-sm font-black text-white md:text-slate-900">{product.seller.storeName || 'Verified Merchant'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-[#1a233a] md:bg-amber-50 px-2 py-1 rounded-lg border border-white/10 md:border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300 md:text-amber-800">{product.seller.rating?.toFixed(1) || '4.9'}</span>
                  </div>
                </div>

                {/* Direct WhatsApp & Call Buttons */}
                <div className="pt-2 border-t border-white/5 md:border-slate-100 space-y-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Contact Seller Directly
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {/* WhatsApp */}
                    <a
                      href={getWhatsAppUrl(product.seller.phone || '15551234567', product.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer press-feedback"
                      title="Chat on WhatsApp"
                    >
                      <WhatsAppIcon className="w-4 h-4 fill-current" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Call */}
                    <a
                      href={getTelUrl(product.seller.phone || '15551234567')}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#1a233a] md:bg-slate-800 hover:bg-[#233050] text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer press-feedback"
                      title="Call Seller"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                      <span>Call</span>
                    </a>
                  </div>

                  {/* In-App Live Chat */}
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(true)}
                    className="w-full py-2 px-3 bg-[#0a0f1d] md:bg-indigo-50 hover:bg-[#151f33] text-blue-400 md:text-indigo-700 border border-white/10 md:border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer press-feedback"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>In-App Marketplace Chat</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================
                EXCLUSIVE OFFERS & DISCOUNTS
                ======================================================== */}
            <div className="p-4 sm:p-5 bg-[#111827] md:bg-white rounded-3xl border border-white/10 md:border-slate-200/90 shadow-md space-y-2.5">
              <h3 className="font-extrabold text-xs text-white md:text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BadgePercent className="w-4 h-4 text-purple-400" />
                <span>Available Offers</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#0a0f1d] md:bg-slate-50 border border-white/5 md:border-slate-100 flex items-start gap-2">
                  <Tag className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 md:text-slate-700">Special Promo: Extra 10% Off on orders above $100 with code <strong>MARKETZO10</strong></span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0a0f1d] md:bg-slate-50 border border-white/5 md:border-slate-100 flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 md:text-slate-700">Bank Offer: Instant $15 Cashback on all Visa/Mastercard transactions</span>
                </div>
              </div>
            </div>

            {/* Product Highlights */}
            {product.highlights?.length > 0 && (
              <div className="p-4 sm:p-5 bg-[#111827] md:bg-white rounded-3xl border border-white/10 md:border-slate-200/90 shadow-md space-y-2.5">
                <h3 className="font-extrabold text-xs text-white md:text-slate-900 uppercase tracking-wider">Product Highlights</h3>
                <ul className="space-y-2">
                  {product.highlights.map((h, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 md:text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Desktop Action Buttons (Hidden on mobile, mobile uses sticky bar) */}
            <div className="hidden md:grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer press-feedback"
              >
                <ShoppingCart className="w-4 h-4 text-indigo-600" />
                <span>Add to Cart</span>
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer press-feedback"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now</span>
              </button>
            </div>

          </div>
        </div>

        {/* Technical Specifications */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="bg-[#111827] md:bg-white rounded-3xl p-4 sm:p-7 border border-white/10 md:border-slate-200 shadow-md space-y-3">
            <h3 className="font-extrabold text-xs sm:text-sm text-white md:text-slate-900 uppercase tracking-wider">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="flex p-3 rounded-2xl bg-[#0a0f1d] md:bg-slate-50 border border-white/5 md:border-slate-100 justify-between">
                  <span className="font-semibold text-slate-400 md:text-slate-500">{key}</span>
                  <span className="font-bold text-white md:text-slate-900">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Reviews Section */}
        <ReviewSection
          productId={product.id}
          reviews={product.reviews || []}
          averageRating={product.rating || 4.6}
          totalReviews={product.reviewCount || 124}
          onReviewSubmitted={() => {}}
        />

        {/* Customers Also Viewed */}
        {product.relatedProducts?.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-xl font-black text-white md:text-slate-900 tracking-tight">
                Customers Also Viewed
              </h3>
              <button
                onClick={() => onNavigate('products', { category: product.categoryId })}
                className="text-xs font-bold text-blue-400 hover:underline cursor-pointer"
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
          STICKY MOBILE PURCHASE BAR (Fixed at bottom for mobile)
          ======================================================== */}
      <div 
        className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-[#080c14]/95 backdrop-blur-xl border-t border-white/10 px-3.5 py-2.5 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] flex items-center justify-between gap-3"
      >
        <div>
          <div className="text-[10px] font-bold text-slate-400 leading-none">Total Price</div>
          <div className="text-base font-black text-white leading-tight mt-0.5">
            {formatPrice(currentPrice * quantity)}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-[240px]">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-2.5 px-3 bg-[#111827] hover:bg-[#1a233a] text-white border border-white/10 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer press-feedback"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-blue-400" />
            <span>Add</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-900/40 flex items-center justify-center gap-1 cursor-pointer press-feedback"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Buy Now</span>
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

import React, { useState, useEffect } from 'react';
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
  Info,
  ChevronRight,
  Phone,
  MessageSquare
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
    digits = '1' + digits; // Add default international prefix for 10-digit formats
  }
  return digits;
};

// WhatsApp link generator
const getWhatsAppUrl = (phone, productName) => {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) return null;
  const message = `Hi, I'm interested in your product on MARKETZO: ${productName}.`;
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
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [isCheckingPin, setIsCheckingPin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Upgrade Modals & Social
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRfqOpen, setIsRfqOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Load product details
  useEffect(() => {
    const fetchProduct = async () => {
      const idOrSlug = routeParams.id || routeParams.slug;
      if (!idOrSlug) return;

      try {
        setIsLoading(true);
        const res = await api.getProduct(idOrSlug);
        if (res.success) {
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
  }, [routeParams.id, routeParams.slug]);

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
    } catch (err) {
      showError('Please sign in to follow stores.');
    }
  };

  // Check pincode serviceability
  const handleCheckPincode = async (e) => {
    e?.preventDefault();
    if (!pincode || pincode.length < 4) {
      showError('Please enter a valid 5 or 6 digit postal code.');
      return;
    }

    try {
      setIsCheckingPin(true);
      const res = await api.checkPincode(pincode);
      if (res.success) {
        setPincodeResult(res);
      }
    } catch (err) {
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
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity, selectedVariant ? selectedVariant.value : null);
    onNavigate('checkout');
  };

  // Add frequently bought together bundle
  const handleAddBundle = () => {
    if (!product) return;
    addToCart(product, 1, selectedVariant ? selectedVariant.value : null);
    if (product.frequentlyBought) {
      product.frequentlyBought.forEach(p => addToCart(p, 1));
    }
    showSuccess('Added complete bundle to cart with bundle savings!');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-12 bg-slate-200 rounded w-1/3 my-6" />
            <div className="h-32 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">The requested marketplace product is no longer available or was removed.</p>
        <button
          onClick={() => onNavigate('products', {})}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md"
        >
          Browse All Products
        </button>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'];

  return (
    <div className="min-h-screen bg-[#0D1324] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        
        {/* Breadcrumbs */}
        <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
          <span onClick={() => onNavigate('home')} className="hover:text-indigo-400 cursor-pointer">Home</span>
          <span>/</span>
          <span 
            onClick={() => onNavigate('products', { category: product.categorySlug || product.categoryId || (typeof product.category === 'object' ? product.category?.slug : product.category) })} 
            className="hover:text-indigo-400 cursor-pointer font-semibold text-slate-300"
          >
            {product.categoryName || (typeof product.category === 'object' ? product.category?.name : product.category) || 'Department'}
          </span>
          <span>/</span>
          <span className="text-[#F5F7FF] font-bold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Main Product View: Gallery + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Image Gallery with Zoom Preview */}
          <div className="lg:col-span-6 space-y-4 sticky top-28">
            
            {/* Main Large Image */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-white/10 shadow-lg group">
              <img
                src={images[activeImage]}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
                }}
                className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.discountPercent > 0 && (
                  <span className="bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-lg shadow-md tracking-wider">
                    {product.discountPercent}% DISCOUNT
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-lg shadow-md uppercase tracking-wider">
                    BESTSELLER
                  </span>
                )}
              </div>

              {/* Floating Share & Wishlist Buttons */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  onClick={() => setIsShareOpen(true)}
                  className="p-3 rounded-2xl backdrop-blur-md bg-slate-900/80 hover:bg-slate-900 text-slate-200 hover:text-indigo-400 transition-all shadow-md cursor-pointer border border-white/10"
                  title="Share Product"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 rounded-2xl backdrop-blur-md transition-all shadow-md cursor-pointer border border-white/10 ${
                    isLiked ? 'bg-rose-500 text-white' : 'bg-slate-900/80 hover:bg-slate-900 text-slate-200 hover:text-rose-400'
                  }`}
                  title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white ${
                      activeImage === i ? 'border-indigo-500 ring-2 ring-indigo-500/40' : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${i}`}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Right Column: Product Specs, Pricing, Variants & Purchase Actions */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Brand, Seller & Title */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                <span className="font-extrabold text-indigo-400 uppercase tracking-widest text-xs">{product.brand?.name || 'Original Edition'}</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-slate-300">
                    <Store className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Sold by <strong className="text-[#F5F7FF]">{product.seller?.storeName || 'Marketzo Verified Merchant'}</strong></span>
                  </div>
                  {product.seller?.phone && (
                    <div className="flex items-center gap-1.5 ml-1">
                      <a
                        href={getWhatsAppUrl(product.seller.phone, product.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 font-bold text-[10px] transition-colors"
                        title="Quick WhatsApp Chat"
                      >
                        <WhatsAppIcon className="w-3 h-3 fill-emerald-400" />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={getTelUrl(product.seller.phone)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 border border-white/10 font-bold text-[10px] transition-colors"
                        title="Quick Phone Call"
                      >
                        <Phone className="w-3 h-3 text-slate-300" />
                        <span>Call</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Title (Enhanced Contrast, Elegant & High Visibility) */}
              <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-[#F5F7FF] tracking-tight leading-[1.3] mb-3">
                {product.name}
              </h1>

              {/* Ratings & Reviews + Share button */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 text-amber-300 px-2.5 py-1 rounded-xl text-xs font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating?.toFixed(1) || '4.9'}</span>
                  </div>
                  <span className="text-xs text-slate-300 font-semibold">{product.reviewCount || 140} Verified Ratings</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Authentic Stock
                  </span>
                </div>

                {/* Quick Share Button */}
                <button
                  onClick={() => setIsShareOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition-colors cursor-pointer"
                  title="Share this product with friends & family"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Product</span>
                </button>
              </div>
            </div>

            {/* Pricing Box */}
            <div className="p-5 bg-[#121829] rounded-3xl border border-white/10 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-[#F5F7FF]">
                  {formatPrice(currentPrice)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-base text-slate-400 line-through">
                    {formatPrice(product.originalPrice + (selectedVariant?.priceDiff || 0))}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-extrabold">
                    Save {product.discountPercent}%
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-300 font-medium">
                Inclusive of all taxes. Free 2-Day Express Shipping on this item.
              </div>

              {/* Available Offers */}
              {product.offers?.length > 0 && (
                <div className="p-3 bg-amber-400/10 rounded-2xl border border-amber-400/20 space-y-1.5">
                  <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Available Offers & Promotions</span>
                  </div>
                  {product.offers.map((offer, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                      <Tag className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{offer}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Wholesale & Bulk Tier Volume Pricing */}
              <div className="p-4 bg-gradient-to-br from-[#161c30] to-[#121829] rounded-3xl border border-amber-400/25 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded-full text-[9px] font-black uppercase tracking-wider">
                      Alibaba Bulk Tier
                    </span>
                    <span className="text-xs font-bold text-[#F5F7FF]">Wholesale Volume Pricing</span>
                  </div>
                  <button
                    onClick={() => setIsRfqOpen(true)}
                    className="text-[11px] font-extrabold text-indigo-400 hover:text-indigo-300 underline cursor-pointer text-left"
                  >
                    Request Bulk Quote (RFQ) →
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#0d1324] p-2.5 rounded-2xl border border-white/10 shadow-2xs">
                    <div className="text-[10px] text-slate-400 font-semibold">1 – {(product.moq || 5) - 1} units</div>
                    <div className="text-xs font-black text-[#F5F7FF]">{formatPrice(product.price)}</div>
                    <div className="text-[9px] text-slate-400">Retail</div>
                  </div>
                  <div className="bg-[#0d1324] p-2.5 rounded-2xl border border-amber-400/30 shadow-2xs">
                    <div className="text-[10px] text-amber-300 font-bold">{product.moq || 5} – 49 units</div>
                    <div className="text-xs font-black text-indigo-400">{formatPrice(product.price * 0.90)}</div>
                    <div className="text-[9px] text-emerald-400 font-bold">Save 10%</div>
                  </div>
                  <div className="bg-[#0d1324] p-2.5 rounded-2xl border border-amber-400/40 shadow-2xs">
                    <div className="text-[10px] text-amber-300 font-bold">50+ units</div>
                    <div className="text-xs font-black text-indigo-400">{formatPrice(product.price * 0.75)}</div>
                    <div className="text-[9px] text-emerald-400 font-bold">Save 25%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Variant Selector (e.g. Color, Storage, Size) */}
            {product.variants?.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-extrabold text-[#F5F7FF] uppercase tracking-wider block">
                  Select Option: <span className="text-indigo-400">{selectedVariant?.value}</span>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map(v => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
                            : 'bg-[#121829] text-slate-200 border-white/10 hover:border-indigo-400/50'
                        }`}
                      >
                        <span>{v.value}</span>
                        {v.priceDiff > 0 && <span className="text-amber-300 ml-1.5">+{formatPrice(v.priceDiff)}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Stock & Quantity Selector */}
          <div className="flex items-center gap-6 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 block">Quantity</label>
              <div className="flex items-center border border-white/10 rounded-2xl overflow-hidden bg-[#121829] shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 hover:bg-white/5 text-slate-300 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-xs font-extrabold text-[#F5F7FF] min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 hover:bg-white/5 text-slate-300 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 block">Stock Status</label>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3.5 py-2 rounded-2xl border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
                <span>In Stock ({product.stock} units left)</span>
              </div>
            </div>
          </div>

          {/* Action CTAs (Add to Cart & Buy Now) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <button
              onClick={handleAddToCart}
              className="w-full py-4 bg-[#1a233a] hover:bg-[#222e4c] text-white border border-white/10 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Instant Buy Now</span>
            </button>
          </div>

          {/* Delivery & Pincode Checker */}
          <div className="p-5 bg-[#121829] rounded-3xl border border-white/10 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#F5F7FF] uppercase tracking-wider">
              <Truck className="w-4 h-4 text-indigo-400" />
              <span>Delivery & Serviceability Checker</span>
            </div>

            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter 5-digit zip code"
                  className="w-full pl-9 pr-3.5 py-2 border border-white/10 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 bg-[#0d1324] text-white placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={isCheckingPin}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {isCheckingPin ? 'Checking...' : 'Check'}
              </button>
            </form>

            {pincodeResult && (
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Delivery available by <strong>{pincodeResult.estimatedDelivery}</strong></span>
                </div>
                <div className="text-[11px] text-emerald-400/80 pl-5">
                  Fulfilled via {pincodeResult.courierPartner} • Cash on Delivery Available
                </div>
              </div>
            )}
          </div>

          {/* Contact Seller / Merchant Card (Alibaba-style Direct Inquiry + In-App Chat) */}
          {product.seller && (
            <div className="p-5 bg-gradient-to-br from-[#121829] via-[#0f1527] to-[#1a1438] text-white rounded-3xl border border-white/10 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={product.seller.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80'}
                    alt={product.seller.storeName}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80';
                    }}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400/50 bg-slate-800 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-black text-sm text-[#F5F7FF]">{product.seller.storeName}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
                        Verified Seller
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase tracking-wider border border-indigo-500/30">
                        Fast Shipping
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {product.seller.rating || 4.9} ({product.seller.reviewCount || 120} reviews)
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[11px] text-slate-400">
                        {followersCount} followers
                      </span>
                    </div>
                  </div>
                </div>

                {/* Follow Store Button */}
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                    isFollowing 
                      ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30' 
                      : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFollowing ? 'fill-rose-400 text-rose-400' : ''}`} />
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>
              </div>

              {/* Response rate & contact metadata */}
              <div className="text-[11px] text-slate-300 bg-white/5 px-3.5 py-2 rounded-xl flex flex-wrap items-center justify-between gap-2 border border-white/5">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Typically responds in <strong className="text-[#F5F7FF] font-bold">under 10 mins</strong></span>
                </span>
                {product.seller.phone && (
                  <span className="text-slate-400 font-mono text-[10px] font-medium">{product.seller.phone}</span>
                )}
              </div>

              {/* Primary Action: In-App Chat With Seller */}
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-900/50 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <MessageSquare className="w-4 h-4 text-amber-300" />
                <span>💬 In-App Live Chat with Seller</span>
              </button>

              {/* Secondary Action Buttons: WhatsApp and Call Seller */}
              {product.seller.phone && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* WhatsApp Button */}
                  <a
                    href={getWhatsAppUrl(product.seller.phone, product.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-950/40 cursor-pointer active:scale-98"
                    title={`Chat with ${product.seller.storeName} on WhatsApp`}
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Call Seller Button */}
                  <a
                    href={getTelUrl(product.seller.phone)}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800/90 hover:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all border border-white/10 shadow-md cursor-pointer active:scale-98"
                    title={`Call ${product.seller.storeName} directly`}
                  >
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Call Seller</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Highlights & Description */}
          <div className="space-y-4 pt-2">
            <h3 className="font-extrabold text-sm text-[#F5F7FF] uppercase tracking-wider">Key Highlights</h3>
            <ul className="space-y-2">
              {product.highlights?.map((h, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Specifications Table */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div className="bg-[#121829] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-[#F5F7FF] uppercase tracking-wider">Technical Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {Object.entries(product.specs).map(([key, val]) => (
              <div key={key} className="flex p-3 rounded-2xl bg-[#0d1324] border border-white/5 justify-between">
                <span className="font-semibold text-slate-400">{key}</span>
                <span className="font-bold text-[#F5F7FF]">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Frequently Bought Together Bundle */}
      {product.frequentlyBought?.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-950 via-[#10162a] to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 space-y-6">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">Bundle & Save 15%</span>
            <h3 className="text-xl font-black tracking-tight text-[#F5F7FF] mt-1">Frequently Bought Together</h3>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Primary item */}
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                <img src={images[0]} alt={product.name} className="w-14 h-14 object-cover rounded-xl bg-slate-800" />
                <div>
                  <div className="text-xs font-bold text-[#F5F7FF] max-w-[150px] truncate">{product.name}</div>
                  <div className="text-xs font-bold text-amber-400">{formatPrice(product.price)}</div>
                </div>
              </div>

              <Plus className="w-5 h-5 text-indigo-400" />

              {/* Bundle complementary item */}
              {product.frequentlyBought.slice(0, 2).map((item, i) => (
                <React.Fragment key={item.id}>
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                    <img src={item.images?.[0]} alt={item.name} className="w-14 h-14 object-cover rounded-xl bg-slate-800" />
                    <div>
                      <div className="text-xs font-bold text-[#F5F7FF] max-w-[150px] truncate">{item.name}</div>
                      <div className="text-xs font-bold text-amber-400">{formatPrice(item.price)}</div>
                    </div>
                  </div>
                  {i === 0 && product.frequentlyBought.length > 1 && <Plus className="w-5 h-5 text-indigo-400" />}
                </React.Fragment>
              ))}

            </div>

            <div className="shrink-0">
              <button
                onClick={handleAddBundle}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              >
                <span>Add All to Cart</span>
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
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

      {/* Related Products Carousel */}
      {product.relatedProducts?.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-[#F5F7FF] tracking-tight">
              Customers Also Viewed
            </h3>
            <button
              onClick={() => onNavigate('products', { category: product.categoryId })}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              View More
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {product.relatedProducts.slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}

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

      {/* Social & WhatsApp / Instagram / Mobile Share Modal */}
      <ShareProductModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        product={product}
      />

    </div>
  </div>
  );
};

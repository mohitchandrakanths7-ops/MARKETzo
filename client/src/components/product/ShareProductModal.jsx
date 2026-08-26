import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  ExternalLink, 
  Sparkles, 
  MessageCircle, 
  Send, 
  Mail, 
  Smartphone,
  CheckCircle2,
  Store
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';

// Custom SVG Icons for Social Platforms
const WhatsAppIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.587 1.961.88 2.796.88h.001c3.181 0 5.768-2.586 5.768-5.766 0-3.18-2.587-5.767-5.769-5.767zm7.592 5.767c0 4.186-3.407 7.593-7.592 7.593-.001 0-.002 0-.003 0-1.328 0-2.607-.352-3.73-1.018l-4.148 1.087 1.107-4.041c-.733-1.168-1.121-2.518-1.121-3.905 0-4.186 3.407-7.593 7.592-7.593 4.185 0 7.592 3.407 7.592 7.593zm-3.693 2.115c-.2-.1-.1.183-.73-.082-.1-.016-.628-.276-1.196-.782-.442-.394-.741-.88-.828-1.029-.087-.149-.009-.23.041-.328.045-.088.1-.2.15-.3.05-.1.067-.167.1-.284.033-.117.017-.217-.008-.317-.025-.1-.234-.564-.321-.773-.085-.203-.171-.175-.235-.178-.061-.003-.131-.004-.201-.004-.07 0-.184.026-.28.131-.096.105-.367.359-.367.875s.376 1.014.428 1.084c.053.07 1.002 1.529 2.428 2.144.339.147.604.234.81.3.341.108.651.093.896.056.273-.041.839-.343.957-.674.118-.331.118-.615.083-.674-.035-.059-.13-.094-.27-.164z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TwitterXIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TelegramIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

export const ShareProductModal = ({ isOpen, onClose, product }) => {
  const { showSuccess, showInfo } = useToast();
  const { formatPrice } = useCurrency();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen || !product) return null;

  // Build canonical share URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://marketzo.com';
  const shareUrl = `${origin}/#product/${product.id || product.slug}?ref=social_share`;
  const productPrice = formatPrice(product.price);
  const productTitle = product.name || 'Amazing Product';
  const shareText = `Check out "${productTitle}" on MARKETZO for ${productPrice}! Free 2-Day Shipping & Verified Authentic.`;

  // Copy to Clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showSuccess('Product link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      showInfo('Copied product URL!');
    }
  };

  // Web Share API for Mobile Devices
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productTitle,
          text: shareText,
          url: shareUrl
        });
        showSuccess('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share error:', err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // Social share intent triggers
  const sharePlatforms = [
    {
      name: 'WhatsApp',
      icon: WhatsAppIcon,
      bgColor: 'bg-emerald-500 hover:bg-emerald-600',
      textColor: 'text-white',
      badge: 'Popular',
      onClick: () => {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    {
      name: 'Instagram',
      icon: InstagramIcon,
      bgColor: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:opacity-95',
      textColor: 'text-white',
      badge: 'Direct & Story',
      onClick: () => {
        // Copy link and provide clear instructions for Instagram DMs / Stories
        handleCopyLink();
        showSuccess('Link copied! Paste it in your Instagram Direct Message or Story link sticker.');
      }
    },
    {
      name: 'Telegram',
      icon: TelegramIcon,
      bgColor: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-white',
      onClick: () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    {
      name: 'X (Twitter)',
      icon: TwitterXIcon,
      bgColor: 'bg-slate-900 hover:bg-black',
      textColor: 'text-white',
      onClick: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    {
      name: 'Facebook',
      icon: FacebookIcon,
      bgColor: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white',
      onClick: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    {
      name: 'Email',
      icon: Mail,
      bgColor: 'bg-slate-700 hover:bg-slate-800',
      textColor: 'text-white',
      onClick: () => {
        const subject = encodeURIComponent(`Check out this deal on MARKETZO: ${productTitle}`);
        const body = encodeURIComponent(`${shareText}\n\nView product here:\n${shareUrl}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }
    }
  ];

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}&margin=10`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-5 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-wider">
            <Share2 className="w-4 h-4" />
            <span>Share This Product</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Share with Friends & Family
          </h2>
          <p className="text-xs text-slate-500">
            Share deals, recommendations, and setups instantly across social platforms
          </p>
        </div>

        {/* Product Mini Preview Card (Flipkart/Amazon style) */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
            <img
              src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80'}
              alt={productTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
              {productTitle}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-black text-slate-900">{productPrice}</span>
              {product.discountPercent > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-extrabold">
                  -{product.discountPercent}% OFF
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
              <Store className="w-3 h-3 text-slate-400" />
              <span>{product.seller?.storeName || 'Marketzo Store'}</span>
            </div>
          </div>
        </div>

        {/* Social Platforms Grid */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            Select Platform
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {sharePlatforms.map((platform) => {
              const IconComp = platform.icon;
              return (
                <button
                  key={platform.name}
                  onClick={platform.onClick}
                  className={`p-3 rounded-2xl ${platform.bgColor} ${platform.textColor} flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer relative group`}
                >
                  {platform.badge && (
                    <span className="absolute -top-1.5 right-1.5 px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full shadow-xs">
                      {platform.badge}
                    </span>
                  )}
                  <IconComp className="w-5 h-5 fill-current" />
                  <span className="text-[11px] font-bold tracking-tight">{platform.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Native OS Share (if mobile supported) */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <span>More Options (Device Share Sheet)</span>
          </button>
        )}

        {/* Copy Link Input Bar */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            Copy Product Link
          </label>
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent px-3 text-xs text-slate-700 font-medium outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scan & Shop QR Code Toggle */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className="w-full py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-slate-400" />
            <span>{showQr ? 'Hide Scan & Shop QR Code' : 'Show Scan & Shop QR Code'}</span>
          </button>

          {showQr && (
            <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-2 animate-in fade-in zoom-in-95">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                <img
                  src={qrCodeUrl}
                  alt="Product QR Code"
                  className="w-36 h-36 object-contain"
                />
              </div>
              <p className="text-[11px] font-semibold text-slate-600">
                Scan with any smartphone camera to open this product instantly
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

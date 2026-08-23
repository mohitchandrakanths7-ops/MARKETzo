import React from 'react';
import { MarketzoLogo } from './MarketzoLogo';
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones, 
  CreditCard, 
  Award, 
  Store,
  Mail,
  ArrowRight
} from 'lucide-react';

export const Footer = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800 mt-20">
      
      {/* Marketplace Trust Pillars */}
      <div className="border-b border-slate-800/80 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base mb-1">Fast & Tracked Delivery</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Complimentary expedited shipping on qualifying orders with real-time GPS tracking.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base mb-1">100% Buyer Protection</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Guaranteed authentic items from verified multi-vendor merchants with secure escrow.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base mb-1">Hassle-Free 30-Day Returns</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Zero-friction returns & instant automated refunds directly to your original payment method.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base mb-1">24/7 Priority Support</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Dedicated concierge care team ready to assist via live chat, email, or telephone.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <div onClick={() => onNavigate('home')} className="cursor-pointer">
              <MarketzoLogo showTagline={true} light={true} size="lg" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              MARKETZO is the premier modern multi-vendor marketplace connecting verified independent merchants, artisan makers, and global brands with discerning shoppers.
            </p>

            <div className="pt-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-2">Subscribe to Marketzo VIP Deals</div>
              <div className="flex max-w-sm rounded-xl overflow-hidden bg-slate-900 border border-slate-800 focus-within:border-indigo-500 transition-colors">
                <input
                  type="email"
                  placeholder="Enter your work or personal email..."
                  className="bg-transparent text-xs px-3.5 py-2.5 text-white outline-none flex-1 placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => alert('Thank you for subscribing to Marketzo VIP news!')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => onNavigate('products', { category: 'electronics-audio' })} className="hover:text-white transition-colors">Electronics & Audio</button></li>
              <li><button onClick={() => onNavigate('products', { category: 'mobiles-tablets' })} className="hover:text-white transition-colors">Mobiles & Tablets</button></li>
              <li><button onClick={() => onNavigate('products', { category: 'laptops-computers' })} className="hover:text-white transition-colors">Laptops & Workstations</button></li>
              <li><button onClick={() => onNavigate('products', { category: 'fashion-apparel' })} className="hover:text-white transition-colors">Fashion & Apparel</button></li>
              <li><button onClick={() => onNavigate('products', { category: 'jewellery-watches' })} className="hover:text-white transition-colors">Jewellery & Luxury</button></li>
              <li><button onClick={() => onNavigate('products', { category: 'home-kitchen' })} className="hover:text-white transition-colors">Home & Living</button></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => onNavigate('account', { tab: 'orders' })} className="hover:text-white transition-colors">Track Your Order</button></li>
              <li><button onClick={() => onNavigate('account', { tab: 'addresses' })} className="hover:text-white transition-colors">Shipping Information</button></li>
              <li><button onClick={() => onNavigate('account')} className="hover:text-white transition-colors">Returns & Refunds</button></li>
              <li><button onClick={() => onNavigate('cart')} className="hover:text-white transition-colors">Cart & Price Protection</button></li>
              <li><button onClick={() => onNavigate('wishlist')} className="hover:text-white transition-colors">My Wishlist</button></li>
              <li><span className="text-slate-500">Security & Privacy</span></li>
            </ul>
          </div>

          {/* Seller Marketplace Hub */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Sell on Marketzo</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('seller')}
                  className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Seller Portal</span>
                </button>
              </li>
              <li><button onClick={() => onNavigate('seller')} className="hover:text-white transition-colors">Vendor Registration</button></li>
              <li><button onClick={() => onNavigate('seller')} className="hover:text-white transition-colors">Merchant Fulfillment</button></li>
              <li><button onClick={() => onNavigate('seller')} className="hover:text-white transition-colors">Commission & Payouts</button></li>
              <li><button onClick={() => onNavigate('seller')} className="hover:text-white transition-colors">Seller Policies</button></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with payment badges & copyright */}
        <div className="border-t border-slate-800/80 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MARKETZO Inc. All rights reserved. "Buy More. Sell More." is a trademark of Marketzo.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Visa / Mastercard</span>
            <span>•</span>
            <span>UPI Instant</span>
            <span>•</span>
            <span>NetBanking</span>
            <span>•</span>
            <span>Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

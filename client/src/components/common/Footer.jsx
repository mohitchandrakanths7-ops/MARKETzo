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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        {/* Brand Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-12 border-b border-slate-800/80">
          <div className="space-y-2 max-w-md">
            <div onClick={() => onNavigate('home')} className="cursor-pointer">
              <MarketzoLogo showTagline={true} light={true} size="lg" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              MARKETZO is the premier modern multi-vendor marketplace connecting verified independent merchants, artisan makers, and global brands with shoppers worldwide.
            </p>
          </div>

          <div className="w-full md:w-auto">
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-2">Subscribe to MARKETZO VIP Deals</div>
            <div className="flex max-w-sm rounded-xl overflow-hidden bg-slate-900 border border-slate-800 focus-within:border-indigo-500 transition-colors">
              <input
                type="email"
                placeholder="Enter your email address..."
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

        {/* 5 Distinct Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 pt-12">
          
          {/* Column 1: MARKETZO */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">MARKETZO</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">About MARKETZO</button></li>
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">Contact Us</button></li>
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">Careers & Culture</button></li>
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">Press & Media</button></li>
            </ul>
          </div>

          {/* Column 2: Customer */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Customer</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => onNavigate('account', { tab: 'orders' })} className="hover:text-white transition-colors cursor-pointer">My Orders</button></li>
              <li><button onClick={() => onNavigate('wishlist')} className="hover:text-white transition-colors cursor-pointer">My Wishlist</button></li>
              <li><button onClick={() => onNavigate('account', { tab: 'messages' })} className="hover:text-white transition-colors cursor-pointer">Help Center & Chat</button></li>
              <li><button onClick={() => onNavigate('account', { tab: 'disputes' })} className="hover:text-white transition-colors cursor-pointer">Buyer Protection</button></li>
            </ul>
          </div>

          {/* Column 3: Seller */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Seller</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => onNavigate('seller')} className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer">Sell on MARKETZO</button></li>
              <li><button onClick={() => onNavigate('seller')} className="hover:text-white transition-colors cursor-pointer">Seller Dashboard</button></li>
              <li><button onClick={() => onNavigate('seller')} className="hover:text-white transition-colors cursor-pointer">Seller Help & Guide</button></li>
              <li><button onClick={() => onNavigate('seller')} className="hover:text-white transition-colors cursor-pointer">Seller Verification</button></li>
            </ul>
          </div>

          {/* Column 4: Marketplace */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Marketplace</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => onNavigate('products', {})} className="hover:text-white transition-colors cursor-pointer">Categories</button></li>
              <li><button onClick={() => onNavigate('products', { hotDeals: 'true' })} className="hover:text-white transition-colors cursor-pointer">Hot Deals</button></li>
              <li><button onClick={() => { const el = document.getElementById('trusted-sellers-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); else onNavigate('home'); }} className="hover:text-white transition-colors cursor-pointer">Seller Stores</button></li>
              <li><button onClick={() => { const el = document.getElementById('wholesale-zone-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); else onNavigate('products', { wholesale: 'true' }); }} className="hover:text-white transition-colors cursor-pointer">Wholesale Zone</button></li>
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Legal & Trust</h4>
            <ul className="space-y-2.5 text-xs">
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Refund Policy</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Shipping Policy</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with payment badges & copyright */}
        <div className="border-t border-slate-800/80 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MARKETZO Inc. All rights reserved. Verified Multi-Vendor Marketplace.</p>
          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-slate-500" /> Card Payments</span>
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

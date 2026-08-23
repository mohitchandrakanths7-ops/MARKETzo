import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showInfo, showError } = useToast();
  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      const local = JSON.parse(localStorage.getItem('marketzo_guest_wishlist') || '[]');
      setWishlist(local);
      setWishlistIds(new Set(local.map(i => i.productId || i.id)));
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.getWishlist();
      if (res.success) {
        setWishlist(res.wishlist || []);
        setWishlistIds(new Set((res.wishlist || []).map(w => w.productId)));
      }
    } catch (err) {
      console.warn('Failed to load wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId) => wishlistIds.has(productId);

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      let local = JSON.parse(localStorage.getItem('marketzo_guest_wishlist') || '[]');
      const exists = local.some(i => (i.productId || i.id) === product.id);

      if (exists) {
        local = local.filter(i => (i.productId || i.id) !== product.id);
        showInfo('Removed from wishlist');
      } else {
        local.push({
          id: `wsh_${Date.now()}`,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images?.[0] || product.image,
          rating: product.rating,
          sellerName: product.sellerName || 'Marketzo Merchant'
        });
        showSuccess('Saved to wishlist!');
      }

      localStorage.setItem('marketzo_guest_wishlist', JSON.stringify(local));
      setWishlist(local);
      setWishlistIds(new Set(local.map(i => i.productId || i.id)));
      return;
    }

    try {
      const res = await api.toggleWishlist(product.id);
      if (res.success) {
        if (res.inWishlist) {
          showSuccess(res.message);
        } else {
          showInfo(res.message);
        }
        await fetchWishlist();
      }
    } catch (err) {
      showError('Wishlist update failed.');
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      wishlistCount: wishlist.length,
      isInWishlist,
      toggleWishlist,
      fetchWishlist,
      isLoading
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};

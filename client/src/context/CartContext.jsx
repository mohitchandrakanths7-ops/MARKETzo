import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [items, setItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [summary, setSummary] = useState({
    itemCount: 0,
    subtotal: 0,
    originalSubtotal: 0,
    totalDiscount: 0,
    shippingFee: 0,
    estimatedTax: 0,
    totalAmount: 0
  });
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from backend
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      // Local storage fallback for unauthenticated guest sessions
      const localCart = JSON.parse(localStorage.getItem('marketzo_guest_cart') || '[]');
      setItems(localCart);
      const subtotal = localCart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      const origSub = localCart.reduce((sum, i) => sum + ((i.originalPrice || i.price) * i.quantity), 0);
      const shipping = subtotal > 50 || localCart.length === 0 ? 0 : 9.99;
      const tax = +(subtotal * 0.08).toFixed(2);
      setSummary({
        itemCount: localCart.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: +subtotal.toFixed(2),
        originalSubtotal: +origSub.toFixed(2),
        totalDiscount: +(origSub - subtotal).toFixed(2),
        shippingFee: shipping,
        estimatedTax: tax,
        totalAmount: +(subtotal + shipping + tax).toFixed(2)
      });
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.getCart();
      if (res.success) {
        setItems(res.items || []);
        setSavedItems(res.savedForLater || []);
        setSummary(res.summary || {});
      }
    } catch (err) {
      console.warn('Failed to load user cart:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add Item to Cart
  const addToCart = async (product, quantity = 1, variant = null) => {
    if (!isAuthenticated) {
      // Guest mode
      const localCart = JSON.parse(localStorage.getItem('marketzo_guest_cart') || '[]');
      const existingIndex = localCart.findIndex(i => i.productId === product.id && i.variant === variant);
      if (existingIndex > -1) {
        localCart[existingIndex].quantity += quantity;
      } else {
        localCart.push({
          id: `guest_${Date.now()}`,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images?.[0] || product.image,
          stock: product.stock,
          quantity,
          variant,
          sellerName: product.sellerName || 'Marketzo Merchant'
        });
      }
      localStorage.setItem('marketzo_guest_cart', JSON.stringify(localCart));
      fetchCart();
      showSuccess(`Added "${product.name.slice(0, 30)}..." to cart!`);
      return;
    }

    try {
      await api.addToCart(product.id, quantity, variant);
      await fetchCart();
      showSuccess(`Added "${product.name.slice(0, 30)}..." to cart!`);
    } catch (err) {
      showError(err.message || 'Could not add product to cart.');
    }
  };

  // Update Item Quantity
  const updateQuantity = async (cartItemId, quantity) => {
    if (!isAuthenticated) {
      let localCart = JSON.parse(localStorage.getItem('marketzo_guest_cart') || '[]');
      if (quantity <= 0) {
        localCart = localCart.filter(i => i.id !== cartItemId);
      } else {
        const item = localCart.find(i => i.id === cartItemId);
        if (item) item.quantity = quantity;
      }
      localStorage.setItem('marketzo_guest_cart', JSON.stringify(localCart));
      fetchCart();
      return;
    }

    try {
      await api.updateCartQty(cartItemId, quantity);
      await fetchCart();
    } catch (err) {
      showError(err.message || 'Failed to update quantity.');
    }
  };

  // Remove Item
  const removeFromCart = async (cartItemId) => {
    if (!isAuthenticated) {
      let localCart = JSON.parse(localStorage.getItem('marketzo_guest_cart') || '[]');
      localCart = localCart.filter(i => i.id !== cartItemId);
      localStorage.setItem('marketzo_guest_cart', JSON.stringify(localCart));
      fetchCart();
      showInfo('Item removed from cart');
      return;
    }

    try {
      await api.removeFromCart(cartItemId);
      await fetchCart();
      showInfo('Item removed from cart');
    } catch (err) {
      showError('Failed to remove item.');
    }
  };

  // Save for Later
  const toggleSaveForLater = async (cartItemId) => {
    if (!isAuthenticated) {
      showInfo('Please log in to save items for later.');
      return;
    }
    try {
      const res = await api.saveForLater(cartItemId);
      await fetchCart();
      showInfo(res.message);
    } catch (err) {
      showError('Could not update item.');
    }
  };

  // Apply Coupon
  const applyCoupon = async (code) => {
    try {
      const res = await api.validateCoupon(code, summary.subtotal);
      if (res.success && res.valid) {
        setAppliedCoupon(res.coupon);
        setCouponDiscount(res.coupon.discountAmount);
        showSuccess(res.message);
        return { success: true, message: res.message };
      }
    } catch (err) {
      showError(err.message || 'Invalid coupon code.');
      return { success: false, message: err.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    showInfo('Coupon code removed.');
  };

  // Final Total calculation with Coupon applied
  const finalTotal = Math.max(0, +(summary.totalAmount - couponDiscount).toFixed(2));

  return (
    <CartContext.Provider value={{
      items,
      savedItems,
      summary,
      appliedCoupon,
      couponDiscount,
      finalTotal,
      isLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      toggleSaveForLater,
      applyCoupon,
      removeCoupon,
      fetchCart,
      itemCount: summary.itemCount || items.reduce((s, i) => s + i.quantity, 0)
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

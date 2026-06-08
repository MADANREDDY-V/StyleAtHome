import { create } from 'zustand';
import type { CartItem, TrialCartItem } from '../types';
import { supabase } from '../lib/supabase';

interface StoreState {
  cart: CartItem[];
  trialCart: TrialCartItem[];
  wishlist: number[];
  fetchCart: (userId: number) => Promise<void>;
  fetchTrialCart: (userId: number) => Promise<void>;
  fetchWishlist: (userId: number) => Promise<void>;
  addToCart: (userId: number, productId: number, quantity?: number) => Promise<void>;
  addToTrialCart: (userId: number, productId: number, size?: string, color?: string) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  removeFromTrialCart: (trialCartItemId: number) => Promise<void>;
  toggleWishlist: (userId: number, productId: number) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  cart: [],
  trialCart: [],
  wishlist: [],

  fetchCart: async (userId) => {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId);
    
    if (!error && data) {
      set({ cart: data as CartItem[] });
    }
  },

  fetchTrialCart: async (userId) => {
    const { data, error } = await supabase
      .from('trial_cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId);
    
    if (!error && data) {
      set({ trialCart: data as TrialCartItem[] });
    }
  },

  addToCart: async (userId, productId, quantity = 1) => {
    const currentCart = get().cart;
    const existing = currentCart.find(item => item.product_id === productId);

    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
      if (!error) get().fetchCart(userId);
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({ user_id: userId, product_id: productId, quantity });
      if (!error) get().fetchCart(userId);
    }
  },

  addToTrialCart: async (userId, productId, size, color) => {
    const currentTrial = get().trialCart;
    const existing = currentTrial.find(item => item.product_id === productId);

    if (existing) {
      // Just update it if needed, or ignore since trial is usually 1 qty per product
      return;
    } else {
      const { error } = await supabase
        .from('trial_cart_items')
        .insert({ user_id: userId, product_id: productId, quantity: 1, size, color });
      if (!error) get().fetchTrialCart(userId);
    }
  },

  removeFromCart: async (cartItemId) => {
    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
    if (!error) {
      set(state => ({ cart: state.cart.filter(item => item.id !== cartItemId) }));
    }
  },

  removeFromTrialCart: async (trialCartItemId) => {
    const { error } = await supabase.from('trial_cart_items').delete().eq('id', trialCartItemId);
    if (!error) {
      set(state => ({ trialCart: state.trialCart.filter(item => item.id !== trialCartItemId) }));
    }
  },

  fetchWishlist: async (userId) => {
    const { data, error } = await supabase.from('wishlist_items').select('product_id').eq('user_id', userId);
    if (!error && data) {
      set({ wishlist: data.map(item => item.product_id) });
    }
  },

  toggleWishlist: async (userId, productId) => {
    const currentWishlist = get().wishlist;
    if (currentWishlist.includes(productId)) {
      const { error } = await supabase.from('wishlist_items').delete().eq('user_id', userId).eq('product_id', productId);
      if (!error) {
        set({ wishlist: currentWishlist.filter(id => id !== productId) });
      }
    } else {
      const { error } = await supabase.from('wishlist_items').insert({ user_id: userId, product_id: productId });
      if (!error) {
        set({ wishlist: [...currentWishlist, productId] });
      }
    }
  }
}));

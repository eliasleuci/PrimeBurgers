import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartModifier {
  label: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  id: string; // Original Product ID
  name: string;
  basePrice: number;
  price: number;
  quantity: number;
  modifiers?: CartModifier[];
  notes?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: { id: string; name: string; price: number }, modifiers?: CartModifier[], notes?: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateItemModifiers: (cartItemId: string, modifiers?: CartModifier[], notes?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
  addItem: (product, modifiers = [], notes = '') => {
    const items = get().items;
    
    // Sort modifiers array by label to ensure consistent comparison
    const sortedModifiers = [...modifiers].sort((a, b) => a.label.localeCompare(b.label));

    const existing = items.find((item) => 
      item.id === product.id && 
      JSON.stringify(item.modifiers || []) === JSON.stringify(sortedModifiers) &&
      (item.notes || '') === notes
    );

    if (existing) {
      set({
        items: items.map((item) =>
          item.cartItemId === existing.cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        ),
      });
    } else {
      const modPrice = sortedModifiers.reduce((acc, m) => acc + (Number(m.price) || 0), 0);
      const newItem: CartItem = {
        cartItemId: crypto.randomUUID(),
        id: product.id,
        name: product.name,
        basePrice: Number(product.price) || 0,
        price: (Number(product.price) || 0) + modPrice,
        quantity: 1,
        modifiers: sortedModifiers.length > 0 ? sortedModifiers : undefined,
        notes: notes ? notes : undefined
      };
      set({ items: [...items, newItem] });
    }
  },
  removeItem: (cartItemId) =>
    set({ items: get().items.filter((item) => item.cartItemId !== cartItemId) }),
  updateQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(cartItemId);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      ),
    });
  },
  updateItemModifiers: (cartItemId, modifiers = [], notes = '') => {
    set({
      items: get().items.map((item) => {
        if (item.cartItemId === cartItemId) {
          const sortedModifiers = [...modifiers].sort((a, b) => a.label.localeCompare(b.label));
          const modPrice = sortedModifiers.reduce((acc, m) => acc + (Number(m.price) || 0), 0);
          const basePrice = Number(item.basePrice) || Number(item.price) || 0;
          return { 
            ...item,
            basePrice,
            price: basePrice + modPrice,
            modifiers: sortedModifiers.length > 0 ? sortedModifiers : undefined,
            notes: notes || undefined 
          };
        }
        return item;
      }),
    });
  },
  clearCart: () => set({ items: [] }),
      getTotal: () =>
        get().items.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);

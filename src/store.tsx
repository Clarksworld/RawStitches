import { useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Product } from './data';
import { StoreContext } from './store-context';

export interface CartItem {
  product: Product;
  color: string;
  size: string;
  qty: number;
}

export interface CheckoutContact {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
}

export interface State {
  cart: CartItem[];
  wishlist: string[];
  toasts: Toast[];
  adminAuthed: boolean;
  customerPreview: boolean;
  checkoutContact: CheckoutContact | null;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type Action =
  | { type: 'ADD_TO_CART'; item: CartItem }
  | { type: 'REMOVE_FROM_CART'; productId: string; color: string; size: string }
  | { type: 'UPDATE_QTY'; productId: string; color: string; size: string; qty: number }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_WISHLIST'; productId: string }
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'START_CUSTOMER_PREVIEW' }
  | { type: 'END_CUSTOMER_PREVIEW' }
  | { type: 'SET_CHECKOUT_CONTACT'; contact: CheckoutContact }
  | { type: 'ADMIN_LOGIN' }
  | { type: 'ADMIN_LOGOUT' };

const initial: State = {
  cart: [],
  wishlist: [],
  toasts: [],
  adminAuthed: false,
  customerPreview: false,
  checkoutContact: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const key = (i: CartItem) => `${i.product.id}-${i.color}-${i.size}`;
      const exists = state.cart.find(i => key(i) === key(action.item));
      if (exists) {
        return { ...state, cart: state.cart.map(i => key(i) === key(action.item) ? { ...i, qty: i.qty + action.item.qty } : i) };
      }
      return { ...state, cart: [...state.cart, action.item] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(i => !(i.product.id === action.productId && i.color === action.color && i.size === action.size)) };
    case 'UPDATE_QTY':
      return { ...state, cart: state.cart.map(i => i.product.id === action.productId && i.color === action.color && i.size === action.size ? { ...i, qty: action.qty } : i) };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'TOGGLE_WISHLIST':
      return { ...state, wishlist: state.wishlist.includes(action.productId) ? state.wishlist.filter(id => id !== action.productId) : [...state.wishlist, action.productId] };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) };
    case 'START_CUSTOMER_PREVIEW':
      return { ...state, customerPreview: true };
    case 'END_CUSTOMER_PREVIEW':
      return { ...state, customerPreview: false, checkoutContact: null };
    case 'SET_CHECKOUT_CONTACT':
      return { ...state, checkoutContact: action.contact };
    case 'ADMIN_LOGIN':
      return { ...state, adminAuthed: true };
    case 'ADMIN_LOGOUT':
      return { ...state, adminAuthed: false };
    default:
      return state;
  }
}

const WISHLIST_KEY = 'raw-stitches-guest-wishlist';

function restoreGuestWishlist(): State {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]');
    const wishlist = Array.isArray(saved) ? [...new Set(saved.filter((id): id is string => typeof id === 'string'))] : [];
    return { ...initial, wishlist };
  } catch {
    return initial;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial, restoreGuestWishlist);
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(state.wishlist));
    } catch {
      // Shopping still works when browser storage is unavailable.
    }
  }, [state.wishlist]);
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}

export function useCart() {
  const { state, dispatch } = useStore();
  const total = state.cart.reduce((sum, i) => sum + (i.product.salePrice ?? i.product.price) * i.qty, 0);
  const count = state.cart.reduce((sum, i) => sum + i.qty, 0);
  return { items: state.cart, total, count, dispatch };
}

export function useWishlist() {
  const { state, dispatch } = useStore();
  return { ids: state.wishlist, dispatch };
}

let toastId = 0;
export function useToast() {
  const { dispatch } = useStore();
  return (message: string, type: Toast['type'] = 'success') => {
    const id = String(++toastId);
    dispatch({ type: 'ADD_TOAST', toast: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 3500);
  };
}

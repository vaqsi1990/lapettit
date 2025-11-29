// Cart utility functions using localStorage
export interface CartItem {
  id: string;
  cakeId: number;
  quantity: number;
  price: number;
  pieces?: number;
  topping?: 'marzipan' | 'cream' | null;
  filling?: string;
  cakeName?: string;
  age?: string;
  position?: 'bottom' | 'center' | 'top';
  productName?: string;
  productImage?: string;
  productType?: string;
}

const CART_STORAGE_KEY = 'lapettit_cart';

// Get cart from localStorage
export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (cartData) {
      return JSON.parse(cartData);
    }
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
  }
  
  return [];
}

// Save cart to localStorage
export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('cartUpdated'));
    // Also dispatch storage event for cross-tab synchronization
    window.dispatchEvent(new StorageEvent('storage', {
      key: CART_STORAGE_KEY,
      newValue: JSON.stringify(items)
    }));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
}

// Add item to cart
export function addToCart(item: Omit<CartItem, 'id'>): CartItem {
  const cart = getCart();
  const newItem: CartItem = {
    ...item,
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  cart.push(newItem);
  saveCart(cart);
  return newItem;
}

// Update cart item
export function updateCartItem(itemId: string, updates: Partial<CartItem>): CartItem | null {
  const cart = getCart();
  const itemIndex = cart.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) {
    return null;
  }
  
  cart[itemIndex] = { ...cart[itemIndex], ...updates };
  saveCart(cart);
  return cart[itemIndex];
}

// Remove item from cart
export function removeCartItem(itemId: string): boolean {
  const cart = getCart();
  const filteredCart = cart.filter(item => item.id !== itemId);
  
  if (filteredCart.length === cart.length) {
    return false; // Item not found
  }
  
  saveCart(filteredCart);
  return true;
}

// Clear cart
export function clearCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_STORAGE_KEY);
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('cartUpdated'));
  // Also dispatch storage event for cross-tab synchronization
  window.dispatchEvent(new StorageEvent('storage', {
    key: CART_STORAGE_KEY,
    newValue: null
  }));
}

// Get cart total
export function getCartTotal(): number {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Get cart count
export function getCartCount(): number {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}


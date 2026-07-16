/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getCartFromStorage, saveCartToStorage } from "./storage.js";

// ============================================================================
// SHOPPING CART ENGINE
// ============================================================================
// Utilizes an Array of Cart Item Objects:
// Each cart item is represented as: { id, name, price, image, quantity, isVeg }
// 
// Time Complexity of operations:
// - Check if item exists in cart: O(n) or O(1) if using key lookup. Since we have a small cart
//   (typically < 10 items), a standard array .find() O(n) is perfectly performant.
// - Update quantity: O(n) (requires searching).
// - Remove item: O(n) (requires filtering and re-indexing the array).
// ============================================================================

let cart = getCartFromStorage();

// Callback to trigger UI re-renders whenever the cart changes
let onCartChangeCallback = null;

export const registerCartCallback = (callback) => {
  onCartChangeCallback = callback;
};

const notifyCartChange = () => {
  saveCartToStorage(cart);
  if (onCartChangeCallback) {
    onCartChangeCallback(cart);
  }
};

// --- Getters ---
export const getCartItems = () => cart;

// --- Cart Operations ---

// Add item to cart
export const addToCart = (foodItem) => {
  // Find if item already exists
  const existingItem = cart.find(item => item.id === foodItem.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    // Spread and add quantity key
    cart.push({
      id: foodItem.id,
      name: foodItem.name,
      price: foodItem.price,
      image: foodItem.image,
      isVeg: foodItem.isVeg,
      quantity: 1
    });
  }
  
  notifyCartChange();
};

// Update item quantity
export const updateCartItemQuantity = (itemId, delta) => {
  const item = cart.find(i => i.id === itemId);
  if (!item) return;
  
  item.quantity += delta;
  
  if (item.quantity <= 0) {
    // Remove if quantity drops to 0 or below
    cart = cart.filter(i => i.id !== itemId);
  }
  
  notifyCartChange();
};

// Remove item completely
export const removeFromCart = (itemId) => {
  cart = cart.filter(item => item.id !== itemId);
  notifyCartChange();
};

// Clear all items
export const clearCart = () => {
  cart = [];
  notifyCartChange();
};

// Calculate totals
export const getCartTotals = () => {
  // Array.reduce() for accumulating totals - Time Complexity: O(n)
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Delivery Charge rule: Free if order > ₹199, else standard ₹40
  const deliveryCharge = (subtotal >= 199 || subtotal === 0) ? 0 : 40;
  
  // GST calculation (5%)
  const gst = Math.round(subtotal * 0.05);
  
  const grandTotal = subtotal + deliveryCharge + gst;
  
  return {
    totalItems,
    subtotal,
    deliveryCharge,
    gst,
    grandTotal
  };
};

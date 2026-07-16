/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// LOCAL STORAGE DATA LAYER
// ============================================================================

const KEYS = {
  CART: "bitespeed_cart",
  WISHLIST: "bitespeed_wishlist",
  RECENTLY_VIEWED: "bitespeed_recently_viewed",
  ORDER_HISTORY: "bitespeed_order_history",
  DARK_MODE: "bitespeed_dark_mode"
};

// --- Cart Persistence ---
export const getCartFromStorage = () => {
  try {
    const data = localStorage.getItem(KEYS.CART);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading cart from local storage", error);
    return [];
  }
};

export const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem(KEYS.CART, JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart to local storage", error);
  }
};

// --- Wishlist Persistence ---
export const getWishlistFromStorage = () => {
  try {
    const data = localStorage.getItem(KEYS.WISHLIST);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading wishlist from local storage", error);
    return [];
  }
};

export const saveWishlistToStorage = (wishlist) => {
  try {
    localStorage.setItem(KEYS.WISHLIST, JSON.stringify(wishlist));
  } catch (error) {
    console.error("Error saving wishlist to local storage", error);
  }
};

// --- Recently Viewed (STACK implementation) ---
// We push new views onto the top of the stack (front of array), 
// and maintain a maximum size of 5 items.
export const getRecentlyViewedFromStorage = () => {
  try {
    const data = localStorage.getItem(KEYS.RECENTLY_VIEWED);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading recently viewed from storage", error);
    return [];
  }
};

export const pushToRecentlyViewedStack = (restaurantId) => {
  try {
    const stack = getRecentlyViewedFromStorage();
    // Remove if already exists in the stack to prevent duplicate cards
    const filteredStack = stack.filter(id => id !== restaurantId);
    
    // Push onto the top (LIFO - index 0 is our top)
    filteredStack.unshift(restaurantId);
    
    // Limit size to 5 (LIFO pop operations)
    if (filteredStack.length > 5) {
      filteredStack.pop(); // Remove the oldest item at the bottom of the stack
    }
    
    localStorage.setItem(KEYS.RECENTLY_VIEWED, JSON.stringify(filteredStack));
    return filteredStack;
  } catch (error) {
    console.error("Error pushing to recently viewed stack", error);
    return [];
  }
};

// --- Order History (QUEUE implementation) ---
// New orders are appended to the tail of the history queue.
export const getOrderHistoryFromStorage = () => {
  try {
    const data = localStorage.getItem(KEYS.ORDER_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading order history from storage", error);
    return [];
  }
};

export const enqueueOrder = (order) => {
  try {
    const queue = getOrderHistoryFromStorage();
    
    // Enqueue: add new order to the end (tail of queue)
    queue.push(order);
    
    localStorage.setItem(KEYS.ORDER_HISTORY, JSON.stringify(queue));
    return queue;
  } catch (error) {
    console.error("Error enqueuing order history", error);
    return [];
  }
};

// --- Dark Mode State ---
export const getDarkModeFromStorage = () => {
  try {
    const data = localStorage.getItem(KEYS.DARK_MODE);
    return data === "true"; // Defaults to false if empty
  } catch (error) {
    console.error("Error reading dark mode status", error);
    return false;
  }
};

export const saveDarkModeToStorage = (isDark) => {
  try {
    localStorage.setItem(KEYS.DARK_MODE, isDark ? "true" : "false");
  } catch (error) {
    console.error("Error saving dark mode to storage", error);
  }
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { restaurants } from "./data.js";

// ============================================================================
// RESTAURANT QUERY & FILTER ENGINE
// ============================================================================
// Performs fast search, dynamic filtering, and sorting operations.
// 
// Time Complexities of filtering and sorting:
// - Search / Filtering: O(n) - requires scanning the restaurants array once to match tags or text.
// - Sorting: O(n log n) - sorts filtered results based on ratings, price, or time.
// ============================================================================

export const queryRestaurants = (filters = {}) => {
  let results = [...restaurants];
  
  const { searchQuery, category, isVeg, minRating } = filters;
  
  // 1. Search text query matching (Name, Cuisines, Address) - Time Complexity: O(n)
  if (searchQuery && searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase().trim();
    results = results.filter(r => 
      r.name.toLowerCase().includes(query) || 
      r.cuisines.some(c => c.toLowerCase().includes(query)) ||
      r.address.toLowerCase().includes(query)
    );
  }
  
  // 2. Category / Cuisine filter - Time Complexity: O(n)
  // Maps categories (e.g. "pizza", "burger", "biryani", "chinese", "southindian", "healthy", "desserts", "drinks")
  // to corresponding cuisines keywords.
  if (category && category !== "all") {
    const categoryMap = {
      pizza: "Pizza",
      burger: "Burger",
      biryani: "Biryani",
      chinese: "Chinese",
      southindian: "South Indian",
      healthy: "Healthy Food",
      desserts: "Desserts",
      drinks: "Drinks"
    };
    const targetCuisine = categoryMap[category.toLowerCase()];
    if (targetCuisine) {
      results = results.filter(r => r.cuisines.includes(targetCuisine));
    }
  }
  
  // 3. Veg-Only Filter - Time Complexity: O(n)
  if (isVeg) {
    results = results.filter(r => r.isVeg === true);
  }
  
  // 4. Minimum Rating Filter - Time Complexity: O(n)
  if (minRating) {
    results = results.filter(r => r.rating >= parseFloat(minRating));
  }
  
  // --- Sorting Layer ---
  // Sorting is executed using Array.prototype.sort(), which is O(n log n)
  const { sortBy } = filters;
  if (sortBy) {
    switch (sortBy) {
      case "rating":
        // Sort descending: highest rating first
        results.sort((a, b) => b.rating - a.rating);
        break;
      case "deliveryTime":
        // Sort ascending: fastest delivery first
        results.sort((a, b) => {
          const timeA = parseInt(a.deliveryTime.split("-")[0]);
          const timeB = parseInt(b.deliveryTime.split("-")[0]);
          return timeA - timeB;
        });
        break;
      case "priceLowHigh":
        // Sort ascending: cheapest first
        results.sort((a, b) => a.priceForTwo - b.priceForTwo);
        break;
      case "priceHighLow":
        // Sort descending: priciest first
        results.sort((a, b) => b.priceForTwo - a.priceForTwo);
        break;
      default:
        break;
    }
  }
  
  return results;
};

// --- Generate HTML for a single Restaurant Card ---
export const createRestaurantCardHTML = (restaurant, isFavorited = false) => {
  const cuisinesList = restaurant.cuisines.join(", ");
  
  return `
    <div class="restaurant-card group bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700/50 overflow-hidden relative cursor-pointer" 
         id="restaurant-card-${restaurant.id}" 
         data-id="${restaurant.id}">
      
      <!-- Card Image Header -->
      <div class="relative h-48 overflow-hidden">
        <img src="${restaurant.image}" 
             alt="${restaurant.name}" 
             referrerpolicy="no-referrer"
             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
             
        <!-- Discount / Offer Badge -->
        ${restaurant.discountBadge ? `
          <div class="absolute top-4 left-4 bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 backdrop-blur-xs">
            <span class="text-[10px] uppercase font-bold tracking-wider">${restaurant.discountBadge}</span>
          </div>
        ` : ''}
        
        <!-- Veg Only Indicator Tag -->
        ${restaurant.isVeg ? `
          <div class="absolute top-4 right-14 bg-emerald-600 text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 uppercase">
            🌱 Pure Veg
          </div>
        ` : ''}
        
        <!-- Wishlist (Favorite Heart) Button -->
        <button class="wishlist-btn absolute top-3.5 right-3.5 w-9 h-9 flex items-center justify-center bg-white/95 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 rounded-full shadow-md text-slate-400 hover:text-red-500 transition-colors duration-200 focus:outline-none" 
                data-id="${restaurant.id}" 
                id="wish-btn-${restaurant.id}"
                title="Save to Favorites"
                onclick="event.stopPropagation()">
          <i data-lucide="heart" class="w-4.5 h-4.5 transition-all ${isFavorited ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-500 dark:text-slate-400'}"></i>
        </button>
      </div>
      
      <!-- Card Information body -->
      <div class="p-5">
        <div class="flex justify-between items-start gap-2 mb-2">
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-orange-500 transition-colors duration-200 line-clamp-1">
            ${restaurant.name}
          </h3>
          
          <!-- Rating Pill -->
          <div class="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md text-xs font-bold shrink-0">
            <span>${restaurant.rating}</span>
            <i data-lucide="star" class="w-3 h-3 fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400"></i>
          </div>
        </div>
        
        <!-- Cuisines list -->
        <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
          ${cuisinesList}
        </p>
        
        <!-- Divider -->
        <div class="border-t border-slate-100 dark:border-slate-700/50 my-3"></div>
        
        <!-- Details row (Time, Price, Address) -->
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div class="flex items-center gap-1">
            <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-400"></i>
            <span>${restaurant.deliveryTime} mins</span>
          </div>
          
          <div class="flex items-center gap-1">
            <i data-lucide="wallet" class="w-3.5 h-3.5 text-slate-400"></i>
            <span>₹${restaurant.priceForTwo} for two</span>
          </div>
        </div>
        
        <!-- Address -->
        <div class="flex items-center gap-1.5 mt-3 pt-3 border-t border-dashed border-slate-100 dark:border-slate-700/40 text-[11px] text-slate-400 dark:text-slate-500">
          <i data-lucide="map-pin" class="w-3 h-3 shrink-0"></i>
          <span class="truncate">${restaurant.address}</span>
        </div>
      </div>
    </div>
  `;
};

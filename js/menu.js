/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { foodItems } from "./data.js";

// ============================================================================
// RESTAURANT MENU RENDERER
// ============================================================================
// Handles filtering dishes of a specific restaurant and compiling the menu HTML.
// 
// Time Complexity:
// - Filtering dishes by restaurant and query parameters: O(n) where n is 60 items.
// ============================================================================

export const queryRestaurantMenu = (restaurantId, filters = {}) => {
  // Filter food items belonging to this restaurant
  let items = foodItems.filter(item => item.restaurantId === parseInt(restaurantId));
  
  const { searchQuery, isVeg, category } = filters;
  
  // 1. Search filter
  if (searchQuery && searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase().trim();
    items = items.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query)
    );
  }
  
  // 2. Veg/Non-Veg filter
  if (isVeg) {
    items = items.filter(item => item.isVeg === true);
  }
  
  // 3. Category filter within menu
  if (category && category !== "all") {
    items = items.filter(item => item.category.toLowerCase() === category.toLowerCase());
  }
  
  return items;
};

// --- Generate HTML for a single Food Item / Dish Card ---
export const createFoodCardHTML = (dish, cartItem = null) => {
  const isVegBadgeColor = dish.isVeg 
    ? "border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-500" 
    : "border-red-600 dark:border-red-500 text-red-600 dark:text-red-400";
    
  const isVegDotColor = dish.isVeg ? "bg-emerald-600 dark:bg-emerald-500" : "bg-red-600 dark:bg-red-500";
  
  // Render standard Swiggy style ADD/Quantity toggler
  const itemInCart = !!cartItem;
  const quantity = cartItem ? cartItem.quantity : 0;
  
  return `
    <div class="food-card bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-xs border border-slate-100 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300 flex justify-between gap-6 relative" 
         id="food-card-${dish.id}">
      
      <!-- Dish Details (Left Column) -->
      <div class="flex-1 flex flex-col justify-between">
        <div>
          <!-- Veg / Non-Veg Indicator Square Badge -->
          <div class="w-4.5 h-4.5 border-2 ${isVegBadgeColor} rounded-md flex items-center justify-center mb-2 shrink-0 p-[2px]" title="${dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}">
            <span class="w-2 h-2 ${isVegDotColor} rounded-full"></span>
          </div>
          
          <!-- Dish Name -->
          <h4 class="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 tracking-tight">
            ${dish.name}
          </h4>
          
          <!-- Price Tag -->
          <div class="text-sm font-bold text-orange-600 dark:text-orange-500 mb-2 flex items-center">
            ₹${dish.price}
          </div>
          
          <!-- Rating -->
          <div class="flex items-center gap-1 text-amber-500 dark:text-amber-400 text-xs font-semibold mb-3">
            <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-500 text-amber-500"></i>
            <span>${dish.rating}</span>
            <span class="text-slate-400 dark:text-slate-500 font-normal ml-1">Rating</span>
          </div>
          
          <!-- Description -->
          <p class="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed line-clamp-2">
            ${dish.description}
          </p>
        </div>
        
        <!-- Trending Banner if applicable -->
        ${dish.isTrending ? `
          <div class="mt-3 inline-flex items-center gap-1 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md w-max">
            🔥 Trending Item
          </div>
        ` : ''}
      </div>
      
      <!-- Dish Image & ADD Toggler (Right Column) -->
      <div class="w-32 h-32 relative shrink-0 flex flex-col items-center">
        <!-- Food Image -->
        <div class="w-full h-full rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700/50">
          <img src="${dish.image}" 
               alt="${dish.name}" 
               referrerpolicy="no-referrer"
               class="w-full h-full object-cover" />
        </div>
        
        <!-- Add To Cart Dynamic Controller Box (Overlapping on bottom) -->
        <div class="absolute -bottom-3 shadow-md rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 w-24 h-8.5 flex items-center justify-center">
          ${itemInCart ? `
            <!-- Quantity Selector Controller -->
            <div class="flex items-center justify-between w-full h-full px-2">
              <button class="quantity-dec-btn w-6.5 h-6.5 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none" 
                      data-id="${dish.id}">
                <i data-lucide="minus" class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400"></i>
              </button>
              
              <span class="text-xs font-bold text-slate-900 dark:text-slate-100 select-none">${quantity}</span>
              
              <button class="quantity-inc-btn w-6.5 h-6.5 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none" 
                      data-id="${dish.id}">
                <i data-lucide="plus" class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400"></i>
              </button>
            </div>
          ` : `
            <!-- Standard ADD Button -->
            <button class="add-to-cart-btn w-full h-full text-xs font-extrabold text-orange-600 hover:text-white dark:text-orange-500 bg-transparent hover:bg-orange-500 transition-all duration-200 flex items-center justify-center tracking-wide cursor-pointer focus:outline-none" 
                    data-id="${dish.id}">
              ADD
            </button>
          `}
        </div>
      </div>
    </div>
  `;
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// MAIN APPLICATION CORE - BITESPEED FOOD DELIVERY
// ============================================================================

import { 
  categories, 
  promoOffers, 
  restaurants, 
  foodItems, 
  customerReviews, 
  faqs 
} from "./data.js";

import { 
  getCartFromStorage, 
  saveCartToStorage, 
  getWishlistFromStorage, 
  saveWishlistToStorage, 
  pushToRecentlyViewedStack, 
  getRecentlyViewedFromStorage, 
  enqueueOrder, 
  getOrderHistoryFromStorage, 
  getDarkModeFromStorage, 
  saveDarkModeToStorage 
} from "./storage.js";

import { 
  getCartItems, 
  addToCart, 
  updateCartItemQuantity, 
  removeFromCart, 
  clearCart, 
  getCartTotals, 
  registerCartCallback 
} from "./cart.js";

import { 
  queryRestaurants, 
  createRestaurantCardHTML 
} from "./restaurants.js";

import { 
  queryRestaurantMenu, 
  createFoodCardHTML 
} from "./menu.js";

// --- Global Application States ---
let currentView = ""; 
let activeFilters = {
  searchQuery: "",
  category: "all",
  isVeg: false,
  minRating: null,
  sortBy: "rating"
};
let currentRestaurantId = null;
let currentReviewIndex = 0;

// ============================================================================
// 1. INITIALIZATION & LAYOUT TRIGGERS
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initRouter();
  initCartDrawer();
  initWishlistDrawer();
  initMobileMenu();
  initNewsletter();
  initBackToTop();
  
  // Register cart updates to re-render cart drawer automatically
  registerCartCallback((cartItems) => {
    updateCartDrawerUI(cartItems);
  });
  
  // Trigger initial render of cart drawer
  updateCartDrawerUI(getCartItems());
  updateWishlistCountBadge();
});

// --- Dark Mode Theme Initialization ---
const initTheme = () => {
  const themeToggle = document.getElementById("theme-toggle");
  const userProfileTrigger = document.getElementById("user-profile-trigger");

  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Read saved state and apply
  let isDark = getDarkModeFromStorage();
  applyTheme(isDark);

  const toggleAction = () => {
    isDark = !document.documentElement.classList.contains("dark");
    applyTheme(isDark);
    saveDarkModeToStorage(isDark);
    showToast(isDark ? "Dark mode enabled 🌙" : "Light mode enabled ☀️", "success");
  };

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleAction);
  }
  if (userProfileTrigger) {
    userProfileTrigger.addEventListener("click", toggleAction);
  }
};

// --- Mobile Navigation Drawer Toggle ---
const initMobileMenu = () => {
  const trigger = document.getElementById("mobile-menu-trigger");
  const drawer = document.getElementById("mobile-drawer");
  const menuIcon = document.getElementById("menu-icon");
  const closeIcon = document.getElementById("close-icon");

  if (!trigger || !drawer) return;

  trigger.addEventListener("click", () => {
    const isOpen = drawer.classList.contains("max-h-[300px]");
    if (isOpen) {
      drawer.classList.remove("max-h-[300px]");
      drawer.classList.add("max-h-0");
      menuIcon.classList.remove("hidden");
      closeIcon.classList.add("hidden");
    } else {
      drawer.classList.remove("max-h-0");
      drawer.classList.add("max-h-[300px]");
      menuIcon.classList.add("hidden");
      closeIcon.classList.remove("hidden");
    }
  });

  // Close drawer on link click
  const links = drawer.querySelectorAll("a");
  links.forEach(link => {
    link.addEventListener("click", () => {
      drawer.classList.remove("max-h-[300px]");
      drawer.classList.add("max-h-0");
      menuIcon.classList.remove("hidden");
      closeIcon.classList.add("hidden");
    });
  });
};

// --- Shopping Cart Drawer Control ---
const initCartDrawer = () => {
  const trigger = document.getElementById("cart-trigger");
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");
  const closeBtn = document.getElementById("cart-close-trigger");
  const clearBtn = document.getElementById("cart-clear-btn");
  const startOrderingBtn = document.getElementById("cart-start-ordering");

  if (!trigger || !drawer || !overlay || !closeBtn) return;

  const toggleCart = (open) => {
    if (open) {
      drawer.classList.remove("closed");
      drawer.classList.add("open");
      overlay.classList.remove("pointer-events-none", "opacity-0");
      overlay.classList.add("opacity-100");
      document.body.classList.add("drawer-open");
      // Re-initialize Lucide Icons in drawer
      setTimeout(() => lucide.createIcons(), 50);
    } else {
      drawer.classList.remove("open");
      drawer.classList.add("closed");
      overlay.classList.remove("opacity-100");
      overlay.classList.add("pointer-events-none", "opacity-0");
      document.body.classList.remove("drawer-open");
    }
  };

  trigger.addEventListener("click", () => toggleCart(true));
  closeBtn.addEventListener("click", () => toggleCart(false));
  overlay.addEventListener("click", () => toggleCart(false));
  
  if (startOrderingBtn) {
    startOrderingBtn.addEventListener("click", () => toggleCart(false));
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      clearCart();
      showToast("Shopping cart cleared 🛒", "info");
    });
  }

  // Intercept checkout link to close drawer
  const checkoutBtn = document.getElementById("cart-checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => toggleCart(false));
  }
};

// --- Wishlist Sidebar Drawer Control ---
const initWishlistDrawer = () => {
  const trigger = document.getElementById("wishlist-trigger");
  const drawer = document.getElementById("wishlist-drawer");
  const overlay = document.getElementById("wishlist-overlay");
  const closeBtn = document.getElementById("wishlist-close-trigger");

  if (!trigger || !drawer || !overlay || !closeBtn) return;

  const toggleWishlist = (open) => {
    if (open) {
      drawer.classList.remove("closed");
      drawer.classList.add("open");
      overlay.classList.remove("pointer-events-none", "opacity-0");
      overlay.classList.add("opacity-100");
      document.body.classList.add("drawer-open");
      renderWishlistDrawerItems();
    } else {
      drawer.classList.remove("open");
      drawer.classList.add("closed");
      overlay.classList.remove("opacity-100");
      overlay.classList.add("pointer-events-none", "opacity-0");
      document.body.classList.remove("drawer-open");
    }
  };

  trigger.addEventListener("click", () => toggleWishlist(true));
  closeBtn.addEventListener("click", () => toggleWishlist(false));
  overlay.addEventListener("click", () => toggleWishlist(false));
};

// --- Newsletter Subscription Form ---
const initNewsletter = () => {
  const form = document.getElementById("newsletter-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector("input[type='email']");
    if (input && input.value.trim() !== "") {
      showToast("Subscribed! Coupon code WELCOME50 sent to your email ✉️", "success");
      input.value = "";
    }
  });
};

// --- Back-to-Top Floating Button ---
const initBackToTop = () => {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  });

  btn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
};

// ============================================================================
// 2. CLIENT-SIDE ROUTER ENGINE
// ============================================================================

const initRouter = () => {
  const routeChange = () => {
    const hash = window.location.hash || "#/";
    window.scrollTo({ top: 0 }); // Scroll to top of page on navigation
    
    // Quick skeleton transition to simulate network load and look highly professional
    renderSkeletonView();
    
    setTimeout(() => {
      if (hash === "#/" || hash === "") {
        renderHomeView();
      } else if (hash.startsWith("#/restaurants")) {
        renderRestaurantsView();
      } else if (hash.startsWith("#/restaurant/")) {
        const id = hash.split("#/restaurant/")[1];
        renderMenuView(id);
      } else if (hash === "#/checkout") {
        renderCheckoutView();
      } else {
        renderHomeView(); // Fallback
      }
      lucide.createIcons();
    }, 450); // Fluid skeleton loading delay
  };

  window.addEventListener("hashchange", routeChange);
  // Initial route execution
  routeChange();
};

// ============================================================================
// 3. PAGE VIEW RENDERERS (VIRTUAL DOM DIRECTIVES)
// ============================================================================

const appContainer = document.getElementById("app-view");

// --- Skeleton Page State (Fluid Transition Spacer) ---
const renderSkeletonView = () => {
  appContainer.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 skeleton-animate">
      <!-- Skeleton Hero -->
      <div class="w-full h-80 rounded-3xl bg-slate-200 dark:bg-slate-800/60 mb-8"></div>
      
      <!-- Skeleton Section Titles -->
      <div class="space-y-4">
        <div class="h-6 w-48 bg-slate-200 dark:bg-slate-800/60 rounded-md"></div>
        <div class="h-4 w-72 bg-slate-200 dark:bg-slate-800/60 rounded-md"></div>
      </div>
      
      <!-- Skeleton Grid Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${Array(4).fill(null).map(() => `
          <div class="border border-slate-100 dark:border-slate-800 rounded-3xl p-4 bg-white dark:bg-slate-800/30 space-y-4">
            <div class="w-full h-40 bg-slate-200 dark:bg-slate-800/60 rounded-2xl"></div>
            <div class="h-4 w-2/3 bg-slate-200 dark:bg-slate-800/60 rounded-md"></div>
            <div class="h-3 w-1/2 bg-slate-200 dark:bg-slate-800/60 rounded-md"></div>
            <div class="flex justify-between items-center pt-2">
              <div class="h-4 w-12 bg-slate-200 dark:bg-slate-800/60 rounded-md"></div>
              <div class="h-4 w-20 bg-slate-200 dark:bg-slate-800/60 rounded-md"></div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
};

// --- Home / Landing Page View ---
const renderHomeView = () => {
  currentView = "home";
  
  // Create Categories Grid HTML
  const categoriesHTML = Object.values(categories).map(cat => `
    <div class="category-card group bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center text-center cursor-pointer hover:-translate-y-2.5 transition-all duration-300 shadow-xs hover:shadow-lg" 
         data-cat="${cat.id}">
      <div class="category-icon-bg w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
        ${cat.icon}
      </div>
      <span class="category-name mt-3 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors">${cat.name}</span>
    </div>
  `).join("");

  // Create Offers Slides HTML
  const offersHTML = promoOffers.map(offer => `
    <div class="bg-gradient-to-br ${offer.bgGradient} rounded-3xl p-6 text-white min-w-[280px] sm:min-w-[340px] flex-1 flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow relative overflow-hidden group">
      <!-- Decorative Background Icon -->
      <div class="absolute -right-6 -bottom-6 text-8xl opacity-15 select-none group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
        ${offer.icon}
      </div>
      <div>
        <div class="bg-white/25 backdrop-blur-xs text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full w-max uppercase tracking-wider mb-3">
          CODE: ${offer.code}
        </div>
        <h3 class="text-2xl font-extrabold tracking-tight">${offer.title}</h3>
        <p class="text-xs text-white/90 font-medium mt-1">${offer.subtitle}</p>
      </div>
      <button class="copy-promo-btn mt-6 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs self-start active:scale-95 transition-all focus:outline-none" 
              data-code="${offer.code}">
        Copy Promo
      </button>
    </div>
  `).join("");

  // Create 4 Featured Restaurants HTML
  const wishlist = getWishlistFromStorage();
  const featuredRes = restaurants.slice(0, 4); // Top 4 for landing page bento
  const restaurantsHTML = featuredRes.map(res => {
    const isFavorited = wishlist.includes(res.id);
    return createRestaurantCardHTML(res, isFavorited);
  }).join("");

  // Compile full Home view
  appContainer.innerHTML = `
    <!-- Hero Header Banner Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <!-- Hero Text content -->
        <div class="lg:col-span-7 space-y-6 sm:space-y-8">
          <div class="inline-flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
            🌱 Pure & Savory Delivery Service
          </div>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 leading-tight sm:leading-none tracking-tight">
            Delicious Food <br class="hidden sm:inline"/>
            <span class="text-orange-500">Delivered To Your</span> <br/>
            Doorstep Instantly
          </h1>
          <p class="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl font-normal leading-relaxed">
            Satisfy your cravings from our curated collection of elite local bakeries, street joints, and five-star kitchens. Handcrafted, fresh, and exceptionally fast.
          </p>
          
          <!-- Hero Actions -->
          <div class="flex flex-wrap gap-4 pt-2">
            <a href="#/restaurants" class="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm px-8 py-4.5 rounded-2xl shadow-lg shadow-orange-500/20 active:scale-98 transition-all flex items-center gap-2">
              <span>Order Now</span>
              <i data-lucide="shopping-bag" class="w-4 h-4"></i>
            </a>
            <a href="#/restaurants" class="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-sm px-8 py-4.5 rounded-2xl shadow-xs active:scale-98 transition-all flex items-center gap-2">
              <span>Explore Restaurants</span>
              <i data-lucide="compass" class="w-4 h-4 text-slate-400"></i>
            </a>
          </div>

          <!-- Quick Statistics -->
          <div class="grid grid-cols-3 gap-4 pt-6 max-w-md border-t border-slate-200/60 dark:border-slate-800">
            <div>
              <div class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">12+</div>
              <div class="text-[10px] uppercase font-bold tracking-wider text-slate-400">Kinsman Kitchens</div>
            </div>
            <div>
              <div class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">60+</div>
              <div class="text-[10px] uppercase font-bold tracking-wider text-slate-400">Gourmet Dishes</div>
            </div>
            <div>
              <div class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">15 Min</div>
              <div class="text-[10px] uppercase font-bold tracking-wider text-slate-400">Average Delivery</div>
            </div>
          </div>
        </div>

        <!-- Hero Dynamic Interactive Banner Card -->
        <div class="lg:col-span-5 relative flex items-center justify-center">
          <div class="absolute inset-0 bg-orange-400/10 blur-3xl rounded-full"></div>
          <div class="relative w-full max-w-sm sm:max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80" 
                 alt="Gourmet Platter" 
                 referrerpolicy="no-referrer"
                 class="w-full h-full object-cover rounded-3xl shadow-xl hover:scale-102 transition-transform duration-500" />
                 
            <!-- Overlap Badge Card 1 -->
            <div class="absolute bottom-6 left-6 bg-white/95 dark:bg-slate-900/95 p-4 rounded-2xl shadow-lg flex items-center gap-3 border border-slate-100 dark:border-slate-800 max-w-[200px] backdrop-blur-xs">
              <div class="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-lg">🍕</div>
              <div>
                <h4 class="text-xs font-black text-slate-900 dark:text-white">Trending</h4>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Loaded Margherita</p>
              </div>
            </div>

            <!-- Overlap Badge Card 2 -->
            <div class="absolute top-6 right-6 bg-white/95 dark:bg-slate-900/95 p-3.5 rounded-2xl shadow-lg flex items-center gap-3 border border-slate-100 dark:border-slate-800 max-w-[170px] backdrop-blur-xs">
              <div class="flex text-amber-400">
                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>
                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>
                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>
                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>
                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>
              </div>
              <span class="text-[10px] font-bold text-slate-800 dark:text-white">5 Star Food</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Live Search suggestions Section -->
    <section class="bg-slate-100 dark:bg-slate-800/30 border-y border-slate-200/50 dark:border-slate-800/80 py-10">
      <div class="max-w-3xl mx-auto px-4 text-center space-y-4">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Craving something specific?</h2>
        <div class="relative max-w-xl mx-auto" id="landing-search-container">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <i data-lucide="search" class="w-5 h-5"></i>
          </div>
          <input type="text" 
                 id="landing-search-input" 
                 placeholder="Search pizza, burger, biryani, or restaurants..." 
                 class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 shadow-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500/15" />
          
          <!-- Dropdown container for live recommendations -->
          <div id="landing-search-suggestions" class="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 max-h-60 overflow-y-auto hidden z-30 text-left">
            <!-- Rendered dynamically on keystroke -->
          </div>
        </div>
      </div>
    </section>

    <!-- Food Categories Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Popular Categories</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Quickest way to satisfy your stomach's desires.</p>
        </div>
        <a href="#/restaurants" class="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 self-start sm:self-auto">
          <span>See all dishes</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </a>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        ${categoriesHTML}
      </div>
    </section>

    <!-- Promotional Offers Slider Section -->
    <section id="offers" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Hot Promotions</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Double down on flavor without burning a hole in your wallet.</p>
      </div>
      <!-- Horizontal scroll with hidden scrollbars -->
      <div class="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
        ${offersHTML}
      </div>
    </section>

    <!-- Featured Restaurants Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Featured Restaurants</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Earning top badges for taste, swift delivery, and safety.</p>
        </div>
        <a href="#/restaurants" class="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 self-start sm:self-auto">
          <span>Browse all 12 restaurants</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${restaurantsHTML}
      </div>
    </section>

    <!-- Customer Reviews / Testimonials Section (Carousel Slider) -->
    <section class="bg-slate-100 dark:bg-slate-800/30 border-y border-slate-200/50 dark:border-slate-800/80 py-16">
      <div class="max-w-4xl mx-auto px-4">
        <div class="text-center space-y-2 mb-10">
          <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Our Customer Love</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Over 50,000+ happy eaters served across the town.</p>
        </div>
        <!-- Review slide box -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/50 rounded-3xl p-8 sm:p-12 shadow-sm text-center relative max-w-2xl mx-auto" id="reviews-carousel-container">
          <div id="active-review-card">
            <!-- Inserted dynamically -->
          </div>
          <!-- Dots Nav -->
          <div class="flex justify-center gap-2 mt-6" id="review-dots">
            ${customerReviews.map((_, idx) => `
              <button class="w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none ${idx === 0 ? 'bg-orange-500 w-6' : 'bg-slate-300 dark:bg-slate-600'}" data-index="${idx}"></button>
            `).join("")}
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Accordion Section -->
    <section id="faq" class="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Frequently Asked Questions</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Need immediate answers? Check our general guides below.</p>
      </div>
      <div class="space-y-4">
        ${faqs.map((faq, idx) => `
          <div class="faq-item bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-xs">
            <button class="faq-btn w-full px-6 py-4.5 text-left font-bold text-slate-950 dark:text-slate-100 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors focus:outline-none" data-idx="${idx}">
              <span>${faq.question}</span>
              <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 transition-transform duration-300"></i>
            </button>
            <div class="faq-content max-h-0 overflow-hidden transition-all duration-300">
              <div class="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed border-t border-slate-50 dark:border-slate-700/40">
                ${faq.answer}
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </section>

    <!-- Corporate Information Section -->
    <section id="about" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/60 dark:border-slate-800">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14 items-center">
        <div class="rounded-3xl overflow-hidden shadow-lg h-72 sm:h-96">
          <img src="https://images.unsplash.com/photo-1526367790999-015078648c7e?w=800&auto=format&fit=crop&q=80" 
               alt="Delivery Agent" 
               referrerpolicy="no-referrer"
               class="w-full h-full object-cover" />
        </div>
        <div class="space-y-6">
          <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Our Mission & Values</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
            BiteSpeed is dedicated to building hyper-local ecosystems. By pairing highly specialized local bakers, regional culinary masters, and small-business owners directly with our consumers, we foster shared economic growth and deliver delicious, hand-prepared recipes to your table.
          </p>
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="p-2 bg-orange-100 dark:bg-orange-950/40 rounded-xl text-orange-600 dark:text-orange-400 shrink-0"><i data-lucide="shield-check" class="w-5 h-5"></i></div>
              <div>
                <h4 class="text-xs font-black text-slate-900 dark:text-white">Strict Quality Checks</h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">All restaurants on our list pass certified hygiene standards and culinary excellence benchmarks.</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="p-2 bg-orange-100 dark:bg-orange-950/40 rounded-xl text-orange-600 dark:text-orange-400 shrink-0"><i data-lucide="heart" class="w-5 h-5"></i></div>
              <div>
                <h4 class="text-xs font-black text-slate-900 dark:text-white">Made with Passion</h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Gourmet experiences tailored with care to give you that comfort-home-cooked feel.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Attach dynamic event listeners for Home elements
  attachHomeEventListeners();
};

const attachHomeEventListeners = () => {
  // Live suggestions logic
  const searchInput = document.getElementById("landing-search-input");
  const suggestionsBox = document.getElementById("landing-search-suggestions");
  if (searchInput && suggestionsBox) {
    searchInput.addEventListener("input", (e) => {
      const val = e.target.value.toLowerCase().trim();
      if (val === "") {
        suggestionsBox.classList.add("hidden");
        return;
      }

      // Find matches in dishes & restaurants
      const matchedDishes = foodItems.filter(item => item.name.toLowerCase().includes(val)).slice(0, 3);
      const matchedRes = restaurants.filter(res => res.name.toLowerCase().includes(val) || res.cuisines.some(c => c.toLowerCase().includes(val))).slice(0, 3);

      if (matchedDishes.length === 0 && matchedRes.length === 0) {
        suggestionsBox.innerHTML = `
          <div class="p-4 text-xs text-slate-500 dark:text-slate-400 text-center">No dishes or restaurants found</div>
        `;
        suggestionsBox.classList.remove("hidden");
        return;
      }

      let dropdownHTML = "";
      if (matchedRes.length > 0) {
        dropdownHTML += `<div class="p-2.5 bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100 dark:border-slate-800">Restaurants</div>`;
        dropdownHTML += matchedRes.map(res => `
          <div class="p-3 hover:bg-orange-50/50 dark:hover:bg-slate-700/30 flex items-center gap-3 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-700" data-type="res" data-id="${res.id}">
            <i data-lucide="store" class="w-4 h-4 text-orange-500 shrink-0"></i>
            <div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-100">${res.name}</div>
              <div class="text-[10px] text-slate-400">${res.cuisines.join(", ")}</div>
            </div>
          </div>
        `).join("");
      }

      if (matchedDishes.length > 0) {
        dropdownHTML += `<div class="p-2.5 bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100 dark:border-slate-800">Dishes / Food Items</div>`;
        dropdownHTML += matchedDishes.map(dish => `
          <div class="p-3 hover:bg-orange-50/50 dark:hover:bg-slate-700/30 flex items-center gap-3 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-700" data-type="dish" data-id="${dish.restaurantId}">
            <i data-lucide="utensils" class="w-4 h-4 text-orange-500 shrink-0"></i>
            <div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-100">${dish.name}</div>
              <div class="text-[10px] text-slate-400">At ${restaurants.find(r => r.id === dish.restaurantId).name} • ₹${dish.price}</div>
            </div>
          </div>
        `).join("");
      }

      suggestionsBox.innerHTML = dropdownHTML;
      suggestionsBox.classList.remove("hidden");
      lucide.createIcons();

      // Setup click handlers for suggestions
      const items = suggestionsBox.querySelectorAll("[data-id]");
      items.forEach(item => {
        item.addEventListener("click", () => {
          const id = item.getAttribute("data-id");
          suggestionsBox.classList.add("hidden");
          searchInput.value = "";
          window.location.hash = `#/restaurant/${id}`;
        });
      });
    });

    // Close suggestions box when clicking outside
    document.addEventListener("click", (e) => {
      if (!document.getElementById("landing-search-container")?.contains(e.target)) {
        suggestionsBox.classList.add("hidden");
      }
    });
  }

  // Category card quick filters
  const catCards = document.querySelectorAll(".category-card[data-cat]");
  catCards.forEach(card => {
    card.addEventListener("click", () => {
      const cat = card.getAttribute("data-cat");
      activeFilters.category = cat;
      window.location.hash = `#/restaurants`;
    });
  });

  // Promotional card copy promo buttons
  const copyBtns = document.querySelectorAll(".copy-promo-btn[data-code]");
  copyBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const code = btn.getAttribute("data-code");
      navigator.clipboard.writeText(code).then(() => {
        showToast(`Promo code "${code}" copied! Paste at checkout 📋`, "success");
      });
    });
  });

  // Favorite Heart Click Handler
  const hearts = document.querySelectorAll(".wishlist-btn[data-id]");
  hearts.forEach(heart => {
    heart.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(heart.getAttribute("data-id"));
      const isFav = toggleWishlistStatus(id);
      
      const icon = heart.querySelector("i");
      if (isFav) {
        icon.classList.add("fill-red-500", "text-red-500", "scale-110");
        icon.classList.remove("text-slate-500");
      } else {
        icon.classList.remove("fill-red-500", "text-red-500", "scale-110");
        icon.classList.add("text-slate-500");
      }
    });
  });

  // Restaurant card clicks to view menu
  const resCards = document.querySelectorAll(".restaurant-card[data-id]");
  resCards.forEach(card => {
    card.addEventListener("click", () => {
      const id = parseInt(card.getAttribute("data-id"));
      // Push into stack
      pushToRecentlyViewedStack(id);
      window.location.hash = `#/restaurant/${id}`;
    });
  });

  // Testimonial Carousel Setup
  renderReviewCard(currentReviewIndex);
  const dots = document.querySelectorAll("#review-dots button");
  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const index = parseInt(dot.getAttribute("data-index"));
      currentReviewIndex = index;
      renderReviewCard(index);
      // Update dots CSS
      dots.forEach((d, i) => {
        if (i === index) {
          d.className = "w-2.5 h-2.5 rounded-full bg-orange-500 w-6 transition-all duration-300 focus:outline-none";
        } else {
          d.className = "w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 transition-all duration-300 focus:outline-none";
        }
      });
    });
  });

  // FAQ accordion setup
  const faqBtns = document.querySelectorAll(".faq-btn");
  faqBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const parent = btn.parentElement;
      const content = parent.querySelector(".faq-content");
      const icon = btn.querySelector("i");
      const isOpen = content.style.maxHeight && content.style.maxHeight !== "0px";

      // Close all first for classic accordion action
      document.querySelectorAll(".faq-content").forEach(c => c.style.maxHeight = null);
      document.querySelectorAll(".faq-btn i").forEach(i => i.classList.remove("-rotate-180"));

      if (!isOpen) {
        content.style.maxHeight = content.scrollHeight + "px";
        icon.classList.add("-rotate-180");
      }
    });
  });
};

const renderReviewCard = (index) => {
  const container = document.getElementById("active-review-card");
  if (!container) return;
  const rev = customerReviews[index];
  
  container.innerHTML = `
    <div class="flex flex-col items-center space-y-4">
      <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500 shadow-md">
        <img src="${rev.avatar}" alt="${rev.name}" referrerpolicy="no-referrer" class="w-full h-full object-cover" />
      </div>
      <div class="flex text-amber-500 justify-center">
        ${Array(rev.rating).fill(null).map(() => `<i data-lucide="star" class="w-4 h-4 fill-amber-500"></i>`).join("")}
      </div>
      <p class="text-slate-600 dark:text-slate-300 text-sm sm:text-base italic leading-relaxed max-w-xl font-normal">
        "${rev.text}"
      </p>
      <div>
        <h4 class="text-xs font-black text-slate-950 dark:text-white">${rev.name}</h4>
        <span class="text-[10px] text-slate-400">${rev.date}</span>
      </div>
    </div>
  `;
  lucide.createIcons();
};

// --- Restaurants Listing Page View ---
const renderRestaurantsView = () => {
  currentView = "restaurants";

  // Create quick category filter tags HTML
  const catTagsHTML = [
    { id: "all", name: "All Foods", icon: "🍽️" },
    ...Object.values(categories)
  ].map(cat => `
    <button class="category-pill flex items-center gap-1.5 px-4.5 py-2.5 rounded-full border text-xs font-extrabold transition-all duration-300 focus:outline-none cursor-pointer ${activeFilters.category === cat.id ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/15' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-orange-500'} "
            data-cat="${cat.id}">
      <span>${cat.icon}</span>
      <span>${cat.name}</span>
    </button>
  `).join("");

  // Create the main workspace structure (Search block + filter sidebar + list grid)
  appContainer.innerHTML = `
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <!-- Page Title -->
      <div class="space-y-1 mb-8">
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Explore Top Restaurants</h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Browse our certified kitchens, filter your favorite cuisines, and sort dynamically.</p>
      </div>

      <!-- Quick Categories Badge Slider -->
      <div class="flex gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
        ${catTagsHTML}
      </div>

      <!-- Main Columns Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <!-- Filter Controls Sidebar (Left Column) -->
        <div class="lg:col-span-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-6 rounded-3xl shadow-xs space-y-6 h-fit sticky top-24">
          <div class="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
            <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <i data-lucide="sliders-horizontal" class="w-4 h-4 text-orange-500"></i>
              <span>Filters</span>
            </h3>
            <button id="reset-filters-btn" class="text-[11px] font-bold text-slate-400 hover:text-orange-500 focus:outline-none">Reset</button>
          </div>

          <!-- Pure Veg Toggle -->
          <div class="space-y-2.5">
            <h4 class="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wide">Food Habits</h4>
            <label class="relative flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" id="veg-only-checkbox" class="sr-only peer" ${activeFilters.isVeg ? 'checked' : ''} />
              <div class="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
              <span class="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">🌱 Vegetarian Only</span>
            </label>
          </div>

          <!-- Rating filter slider -->
          <div class="space-y-3">
            <div class="flex justify-between text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wide">
              <span>Minimum Rating</span>
              <span id="rating-val" class="text-orange-500">${activeFilters.minRating ? activeFilters.minRating + " ★" : "All"}</span>
            </div>
            <input type="range" 
                   id="rating-slider" 
                   min="4" 
                   max="4.9" 
                   step="0.1" 
                   value="${activeFilters.minRating || 4.0}" 
                   class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
            <div class="flex justify-between text-[10px] text-slate-400">
              <span>4.0 ★</span>
              <span>4.9 ★</span>
            </div>
          </div>

          <!-- Sorting Selector -->
          <div class="space-y-2.5">
            <h4 class="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wide">Sort Results By</h4>
            <select id="sort-select" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-orange-500">
              <option value="rating" ${activeFilters.sortBy === 'rating' ? 'selected' : ''}>Highest Rating ★</option>
              <option value="deliveryTime" ${activeFilters.sortBy === 'deliveryTime' ? 'selected' : ''}>Fastest Delivery 🚚</option>
              <option value="priceLowHigh" ${activeFilters.sortBy === 'priceLowHigh' ? 'selected' : ''}>Price: Low to High 💰</option>
              <option value="priceHighLow" ${activeFilters.sortBy === 'priceHighLow' ? 'selected' : ''}>Price: High to Low 💳</option>
            </select>
          </div>
        </div>

        <!-- Restaurants List Grid (Right Columns) -->
        <div class="lg:col-span-3 space-y-6">
          <!-- Live Search input row -->
          <div class="relative w-full">
            <div class="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
              <i data-lucide="search" class="w-4.5 h-4.5"></i>
            </div>
            <input type="text" 
                   id="restaurant-search-input" 
                   value="${activeFilters.searchQuery}"
                   placeholder="Search for restaurants, cuisines (e.g. Italian, South Indian, Biryani)..." 
                   class="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-orange-500 shadow-sm text-slate-800 dark:text-white" />
          </div>

          <!-- Recently Viewed Section (LIFO Stack UI) -->
          <div id="recently-viewed-wrapper" class="hidden bg-slate-100/50 dark:bg-slate-800/20 border border-slate-200/40 dark:border-slate-700/40 rounded-3xl p-5 space-y-3.5">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="history" class="w-4 h-4"></i>
              <span>Recently Visited Kitchens</span>
            </h3>
            <div id="recently-viewed-list" class="flex gap-4 overflow-x-auto no-scrollbar">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- List Result Count metadata -->
          <div class="flex justify-between items-center text-xs text-slate-500 font-medium">
            <span id="results-count">Showing 12 restaurants</span>
            <span class="text-[10px] uppercase font-bold tracking-wider text-orange-500 bg-orange-50 dark:bg-orange-950/20 px-2.5 py-1 rounded-md">Live Filtering</span>
          </div>

          <!-- Grid of Cards -->
          <div id="restaurants-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Rendered dynamically -->
          </div>
          
          <!-- Bonus Feature: Trending Foods slider inside restaurants view -->
          <div class="border-t border-slate-200/60 dark:border-slate-800 pt-8 space-y-4">
            <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <i data-lucide="flame" class="w-4.5 h-4.5 text-orange-500 fill-orange-500"></i>
              <span>Trending Food Delicacies</span>
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              ${foodItems.filter(item => item.isTrending).slice(0, 3).map(dish => `
                <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-3.5 flex gap-3 cursor-pointer hover:shadow-md transition-all" 
                     onclick="window.location.hash='#/restaurant/${dish.restaurantId}'">
                  <div class="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    <img src="${dish.image}" alt="${dish.name}" referrerpolicy="no-referrer" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-xs font-extrabold text-slate-900 dark:text-white truncate">${dish.name}</h4>
                    <span class="text-[10px] text-slate-400 block mt-0.5">Price: ₹${dish.price}</span>
                    <div class="flex items-center gap-1 mt-1 text-[10px] text-amber-500 font-bold">
                      <i data-lucide="star" class="w-3 h-3 fill-amber-500"></i>
                      <span>${dish.rating} rating</span>
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>

      </div>
    </section>
  `;

  // Dynamic attachment
  attachRestaurantsEventListeners();
  // Perform initial query render
  filterAndRenderRestaurants();
};

const filterAndRenderRestaurants = () => {
  const grid = document.getElementById("restaurants-grid");
  const countBadge = document.getElementById("results-count");
  if (!grid) return;

  const filtered = queryRestaurants(activeFilters);
  const wishlist = getWishlistFromStorage();

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <i data-lucide="search-x" class="w-8 h-8 text-slate-400"></i>
        </div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">No restaurants found</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm">Try relaxing your filter parameters, modifying your search query, or adjusting minimum ratings.</p>
      </div>
    `;
    countBadge.textContent = "0 restaurants match filters";
    lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(res => {
    const isFavorited = wishlist.includes(res.id);
    return createRestaurantCardHTML(res, isFavorited);
  }).join("");

  countBadge.textContent = `Showing ${filtered.length} matching restaurants`;
  lucide.createIcons();

  // Attach card clicks
  const cards = grid.querySelectorAll(".restaurant-card[data-id]");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const id = parseInt(card.getAttribute("data-id"));
      pushToRecentlyViewedStack(id);
      window.location.hash = `#/restaurant/${id}`;
    });
  });

  // Attach favorite click on listing page
  const hearts = grid.querySelectorAll(".wishlist-btn[data-id]");
  hearts.forEach(heart => {
    heart.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(heart.getAttribute("data-id"));
      const isFav = toggleWishlistStatus(id);
      
      const icon = heart.querySelector("i");
      if (isFav) {
        icon.classList.add("fill-red-500", "text-red-500", "scale-110");
        icon.classList.remove("text-slate-500");
      } else {
        icon.classList.remove("fill-red-500", "text-red-500", "scale-110");
        icon.classList.add("text-slate-500");
      }
    });
  });

  // Render Stack LIFO Row (Recently Viewed)
  renderRecentlyViewedRow();
};

const renderRecentlyViewedRow = () => {
  const wrapper = document.getElementById("recently-viewed-wrapper");
  const list = document.getElementById("recently-viewed-list");
  if (!wrapper || !list) return;

  const stack = getRecentlyViewedFromStorage();
  if (stack.length === 0) {
    wrapper.classList.add("hidden");
    return;
  }

  wrapper.classList.remove("hidden");
  
  // Resolve restaurant details for IDs in the stack
  const listHTML = stack.map(id => {
    const res = restaurants.find(r => r.id === id);
    if (!res) return "";
    return `
      <div class="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-2.5 rounded-2xl min-w-[200px] cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all" 
           onclick="window.location.hash='#/restaurant/${res.id}'">
        <div class="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-xs border">
          <img src="${res.image}" alt="${res.name}" referrerpolicy="no-referrer" class="w-full h-full object-cover" />
        </div>
        <div class="min-w-0">
          <h4 class="text-xs font-black text-slate-900 dark:text-white truncate">${res.name}</h4>
          <span class="text-[9px] text-slate-400 block mt-0.5">${res.deliveryTime} mins • ${res.rating} ★</span>
        </div>
      </div>
    `;
  }).join("");

  list.innerHTML = listHTML;
};

const attachRestaurantsEventListeners = () => {
  // Category quick pills
  const pills = document.querySelectorAll(".category-pill[data-cat]");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      const cat = pill.getAttribute("data-cat");
      activeFilters.category = cat;
      
      // Update UI active styling
      pills.forEach(p => {
        const isActive = p.getAttribute("data-cat") === cat;
        if (isActive) {
          p.className = "category-pill flex items-center gap-1.5 px-4.5 py-2.5 rounded-full border text-xs font-extrabold transition-all duration-300 focus:outline-none bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/15";
        } else {
          p.className = "category-pill flex items-center gap-1.5 px-4.5 py-2.5 rounded-full border text-xs font-extrabold transition-all duration-300 focus:outline-none bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-orange-500";
        }
      });
      
      filterAndRenderRestaurants();
    });
  });

  // Reset filters
  const resetBtn = document.getElementById("reset-filters-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      activeFilters = {
        searchQuery: "",
        category: "all",
        isVeg: false,
        minRating: null,
        sortBy: "rating"
      };
      
      // Reset DOM fields
      const searchInput = document.getElementById("restaurant-search-input");
      if (searchInput) searchInput.value = "";

      const vegCheckbox = document.getElementById("veg-only-checkbox");
      if (vegCheckbox) vegCheckbox.checked = false;

      const slider = document.getElementById("rating-slider");
      if (slider) slider.value = 4.0;

      const ratingVal = document.getElementById("rating-val");
      if (ratingVal) ratingVal.textContent = "All";

      const sortSelect = document.getElementById("sort-select");
      if (sortSelect) sortSelect.value = "rating";

      // Reset category pills
      const pills = document.querySelectorAll(".category-pill[data-cat]");
      pills.forEach(p => {
        const cat = p.getAttribute("data-cat");
        if (cat === "all") {
          p.className = "category-pill flex items-center gap-1.5 px-4.5 py-2.5 rounded-full border text-xs font-extrabold transition-all duration-300 focus:outline-none bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/15";
        } else {
          p.className = "category-pill flex items-center gap-1.5 px-4.5 py-2.5 rounded-full border text-xs font-extrabold transition-all duration-300 focus:outline-none bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-orange-500";
        }
      });

      filterAndRenderRestaurants();
      showToast("Filters restored to default values ⚙️", "info");
    });
  }

  // Pure Veg Checkbox
  const vegCheckbox = document.getElementById("veg-only-checkbox");
  if (vegCheckbox) {
    vegCheckbox.addEventListener("change", (e) => {
      activeFilters.isVeg = e.target.checked;
      filterAndRenderRestaurants();
    });
  }

  // Rating slider
  const slider = document.getElementById("rating-slider");
  const ratingVal = document.getElementById("rating-val");
  if (slider && ratingVal) {
    slider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      if (val === 4.0) {
        activeFilters.minRating = null;
        ratingVal.textContent = "All";
      } else {
        activeFilters.minRating = val;
        ratingVal.textContent = val + "+ ★";
      }
      filterAndRenderRestaurants();
    });
  }

  // Sort dropdown selector
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      activeFilters.sortBy = e.target.value;
      filterAndRenderRestaurants();
    });
  }

  // Search input with standard debouncing on keyup
  const searchInput = document.getElementById("restaurant-search-input");
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener("keyup", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        activeFilters.searchQuery = e.target.value;
        filterAndRenderRestaurants();
      }, 300);
    });
  }
};

// --- Food Menu Page View ---
const renderMenuView = (restaurantId) => {
  currentRestaurantId = parseInt(restaurantId);
  
  // Find restaurant details
  const restaurant = restaurants.find(r => r.id === currentRestaurantId);
  if (!restaurant) {
    appContainer.innerHTML = `
      <div class="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 class="text-xl font-bold">Restaurant Not Found</h2>
        <p class="text-sm text-slate-500">The restaurant link appears to be invalid or broken.</p>
        <a href="#/restaurants" class="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs">Browse Restaurants</a>
      </div>
    `;
    return;
  }

  // Dynamic Subcategory Tabs based on cuisine categories
  const menuCategories = ["all", "pizza", "burger", "biryani", "chinese", "southindian", "healthy", "desserts", "drinks"];
  const categorySubtabsHTML = menuCategories.map(cat => {
    // Check if foodItems contains any dishes for this restaurant in this category
    const hasItems = foodItems.some(i => i.restaurantId === currentRestaurantId && (cat === "all" || i.category === cat));
    if (!hasItems) return ""; // Hide empty tabs

    const icon = cat === "all" ? "🍽️" : categories[cat]?.icon || "🍲";
    const name = cat === "all" ? "All Items" : categories[cat]?.name || "Dish";

    return `
      <button class="menu-subtab flex items-center gap-1.5 px-4.5 py-2.5 rounded-full border text-xs font-extrabold transition-all duration-300 focus:outline-none cursor-pointer border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-orange-500 bg-white dark:bg-slate-800"
              data-cat="${cat}">
        <span>${icon}</span>
        <span>${name}</span>
      </button>
    `;
  }).join("");

  // Populate structural template
  appContainer.innerHTML = `
    <!-- Restaurant Banner Hero Cover Card -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="relative rounded-3xl overflow-hidden h-60 sm:h-80 border border-slate-100 dark:border-slate-800 shadow-sm">
        <img src="${restaurant.image}" alt="${restaurant.name}" referrerpolicy="no-referrer" class="w-full h-full object-cover brightness-50 dark:brightness-[0.4]" />
        
        <!-- Hover Back navigation arrow -->
        <a href="#/restaurants" class="absolute top-6 left-6 w-11 h-11 rounded-2xl bg-white/15 dark:bg-slate-900/45 text-white flex items-center justify-center hover:bg-orange-500 hover:scale-105 transition-all shadow-md focus:outline-none" title="Back to listing">
          <i data-lucide="arrow-left" class="w-5 h-5"></i>
        </a>

        <!-- Cover Details overlay -->
        <div class="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div class="space-y-1.5">
            <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight">${restaurant.name}</h1>
            <p class="text-xs sm:text-sm text-slate-200 font-medium">${restaurant.cuisines.join(" • ")}</p>
            <p class="text-[11px] sm:text-xs text-slate-300 font-normal flex items-center gap-1">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 shrink-0"></i>
              <span>${restaurant.address}</span>
            </p>
          </div>
          
          <!-- Stat blocks overlapping -->
          <div class="flex gap-4 sm:gap-6 bg-slate-950/40 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-xs text-center shrink-0">
            <div>
              <div class="font-extrabold text-white flex items-center gap-0.5 justify-center">
                <span>${restaurant.rating}</span>
                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>
              </div>
              <span class="text-[10px] text-slate-300 font-medium">Ratings</span>
            </div>
            <div class="border-l border-white/20 h-8 self-center"></div>
            <div>
              <div class="font-extrabold text-white">${restaurant.deliveryTime} mins</div>
              <span class="text-[10px] text-slate-300 font-medium">Delivery</span>
            </div>
            <div class="border-l border-white/20 h-8 self-center"></div>
            <div>
              <div class="font-extrabold text-white">₹${restaurant.priceForTwo}</div>
              <span class="text-[10px] text-slate-300 font-medium">For Two</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Menu Section (Filters + Dishes Grid) -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <!-- Subcategory Tabs Row -->
      <div class="flex gap-3 overflow-x-auto pb-4 no-scrollbar border-b border-slate-100 dark:border-slate-800">
        ${categorySubtabsHTML}
      </div>

      <!-- Menu Search & Toggle Bars -->
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-4.5 rounded-2xl shadow-xs">
        <!-- Search within menu -->
        <div class="relative w-full sm:max-w-md">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <i data-lucide="search" class="w-4 h-4"></i>
          </div>
          <input type="text" 
                 id="menu-search-input" 
                 placeholder="Search dishes inside this restaurant..." 
                 class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-orange-500" />
        </div>
        
        <!-- Pure Veg toggle -->
        <label class="relative flex items-center gap-2.5 cursor-pointer select-none self-start sm:self-auto shrink-0">
          <input type="checkbox" id="menu-veg-checkbox" class="sr-only peer" />
          <div class="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
          <span class="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">🌱 Veg Dishes Only</span>
        </label>
      </div>

      <!-- Results Count Metadata -->
      <div id="menu-results-count" class="text-xs text-slate-400 font-bold tracking-wide uppercase">
        Loading dishes...
      </div>

      <!-- Dishes Grid -->
      <div id="dishes-grid" class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        <!-- Rendered dynamically -->
      </div>
    </section>
  `;

  // Attach menu listeners
  attachMenuEventListeners();
  // Query dishes
  filterAndRenderMenu();
};

const filterAndRenderMenu = () => {
  const grid = document.getElementById("dishes-grid");
  const countHeader = document.getElementById("menu-results-count");
  if (!grid) return;

  const searchInput = document.getElementById("menu-search-input");
  const vegCheckbox = document.getElementById("menu-veg-checkbox");
  
  // Find which subtab is active (default is 'all')
  const activeTab = document.querySelector(".menu-subtab.bg-orange-500")?.getAttribute("data-cat") || "all";

  const filters = {
    searchQuery: searchInput ? searchInput.value : "",
    isVeg: vegCheckbox ? vegCheckbox.checked : false,
    category: activeTab
  };

  const dishes = queryRestaurantMenu(currentRestaurantId, filters);
  const cartItems = getCartItems();

  if (dishes.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 flex flex-col items-center justify-center text-center">
        <div class="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-lg">🍜</div>
        <h3 class="text-sm font-bold text-slate-800 dark:text-white">No dishes match criteria</h3>
        <p class="text-xs text-slate-400 max-w-xs mt-1">Try modifying your text query or removing filters to view the full menu.</p>
      </div>
    `;
    countHeader.textContent = "0 dishes found";
    lucide.createIcons();
    return;
  }

  // Render cards
  grid.innerHTML = dishes.map(dish => {
    // Check if this dish is in the cart
    const cartItem = cartItems.find(item => item.id === dish.id);
    return createFoodCardHTML(dish, cartItem);
  }).join("");

  countHeader.textContent = `${dishes.length} dishes matching criteria`;
  lucide.createIcons();

  // Attach listeners to ADD buttons and +/- selectors
  attachCartInteractionListeners(grid);
};

const attachCartInteractionListeners = (parentGrid) => {
  // 1. ADD TO CART buttons
  const addButtons = parentGrid.querySelectorAll(".add-to-cart-btn[data-id]");
  addButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      const dish = foodItems.find(item => item.id === id);
      if (dish) {
        addToCart(dish);
        showToast(`Added ${dish.name} to cart! 😋`, "success");
        // Re-render menu grid to replace ADD with quantity selector instantly
        filterAndRenderMenu();
      }
    });
  });

  // 2. INCREMENT buttons
  const incButtons = parentGrid.querySelectorAll(".quantity-inc-btn[data-id]");
  incButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      updateCartItemQuantity(id, 1);
      filterAndRenderMenu();
    });
  });

  // 3. DECREMENT buttons
  const decButtons = parentGrid.querySelectorAll(".quantity-dec-btn[data-id]");
  decButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      updateCartItemQuantity(id, -1);
      filterAndRenderMenu();
    });
  });
};

const attachMenuEventListeners = () => {
  const searchInput = document.getElementById("menu-search-input");
  const vegCheckbox = document.getElementById("menu-veg-checkbox");
  const subtabs = document.querySelectorAll(".menu-subtab[data-cat]");

  // Search keyup
  if (searchInput) {
    let debounce;
    searchInput.addEventListener("keyup", () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        filterAndRenderMenu();
      }, 200);
    });
  }

  // Veg checkbox toggle
  if (vegCheckbox) {
    vegCheckbox.addEventListener("change", () => {
      filterAndRenderMenu();
    });
  }

  // Subtabs click selection
  subtabs.forEach((tab, idx) => {
    // Set initial active state on 'all'
    const cat = tab.getAttribute("data-cat");
    if (cat === "all") {
      tab.className = "menu-subtab flex items-center gap-1.5 px-4.5 py-2.5 rounded-full border text-xs font-extrabold transition-all duration-300 focus:outline-none bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/15";
    }

    tab.addEventListener("click", () => {
      subtabs.forEach(t => {
        const c = t.getAttribute("data-cat");
        if (c === cat) {
          t.className = "menu-subtab flex items-center gap-1.5 px-4.5 py-2.5 rounded-full border text-xs font-extrabold transition-all duration-300 focus:outline-none bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/15";
        } else {
          t.className = "menu-subtab flex items-center gap-1.5 px-4.5 py-2.5 rounded-full border text-xs font-extrabold transition-all duration-300 focus:outline-none bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-orange-500";
        }
      });
      filterAndRenderMenu();
    });
  });
};

// --- Checkout Page View ---
const renderCheckoutView = () => {
  currentView = "checkout";

  const cartItems = getCartItems();
  const totals = getCartTotals();

  // Redirect to menu if cart empty
  if (cartItems.length === 0) {
    appContainer.innerHTML = `
      <div class="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 class="text-xl font-bold">Your basket is empty</h2>
        <p class="text-sm text-slate-500">You need to add dishes before proceeding to the checkout section.</p>
        <a href="#/restaurants" class="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs">Browse Restaurants</a>
      </div>
    `;
    return;
  }

  // Generate Receipt items HTML
  const itemsReceiptHTML = cartItems.map(item => `
    <div class="flex justify-between items-start text-xs border-b border-dashed border-slate-100 dark:border-slate-700/50 pb-3">
      <div>
        <h5 class="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-full shrink-0 ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}"></span>
          <span>${item.name}</span>
        </h5>
        <span class="text-[10px] text-slate-400 block mt-0.5">Quantity: ${item.quantity} x ₹${item.price}</span>
      </div>
      <span class="font-bold text-slate-900 dark:text-slate-100">₹${item.price * item.quantity}</span>
    </div>
  `).join("");

  appContainer.innerHTML = `
    <!-- Checkout Modal-Like Overlay Structure -->
    <div id="order-success-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 hidden opacity-0 transition-opacity duration-300">
      <!-- Success Card content (Inserted Dynamically upon Placing Order) -->
    </div>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="space-y-1 mb-8">
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Complete Your Order</h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Verify your address, select a payment plan, and secure your delicious recipe.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Form Details (Left Column) -->
        <form id="checkout-form" class="lg:col-span-7 space-y-8">
          
          <!-- Delivery Address Block -->
          <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-6 sm:p-8 rounded-3xl shadow-xs space-y-5">
            <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-4 border-b">
              <i data-lucide="map-pin" class="w-4.5 h-4.5 text-orange-500"></i>
              <span>1. Delivery Address</span>
            </h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
                <input type="text" id="address-name" value="Rohit Mishra" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-orange-500" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Mobile Number</label>
                <input type="tel" id="address-phone" value="+91 9876543210" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-orange-500" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Flat / House No / Building</label>
              <input type="text" id="address-flat" placeholder="Flat 402, Royal Enclave" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-orange-500" />
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Street Name / Sector / Area</label>
              <input type="text" id="address-street" value="Salt Lake, Sector V" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-orange-500" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">City</label>
                <input type="text" id="address-city" value="Kolkata" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-orange-500" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">PIN Code</label>
                <input type="text" id="address-pin" value="700091" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-orange-500" />
              </div>
            </div>
          </div>

          <!-- Payment Options Block -->
          <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-6 sm:p-8 rounded-3xl shadow-xs space-y-5">
            <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-4 border-b">
              <i data-lucide="credit-card" class="w-4.5 h-4.5 text-orange-500"></i>
              <span>2. Payment Option</span>
            </h3>

            <div class="space-y-3">
              <!-- UPI Payment Option -->
              <div class="relative flex items-center">
                <input type="radio" id="payment-upi" name="payment-method" value="upi" checked class="sr-only peer custom-radio" />
                <label for="payment-upi" class="w-full border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between cursor-pointer peer-checked:border-orange-500 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-lg">💳</div>
                    <div>
                      <h4 class="text-xs font-bold text-slate-900 dark:text-white">UPI (Paytm / Google Pay / PhonePe)</h4>
                      <p class="text-[10px] text-slate-400">Instantly pay via any UPI app safely</p>
                    </div>
                  </div>
                  <i data-lucide="circle-check-big" class="w-5 h-5 text-orange-500 hidden peer-checked:block"></i>
                </label>
              </div>

              <!-- Credit Card Option -->
              <div class="relative flex items-center">
                <input type="radio" id="payment-card" name="payment-method" value="card" class="sr-only peer custom-radio" />
                <label for="payment-card" class="w-full border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between cursor-pointer peer-checked:border-orange-500 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-lg">🪙</div>
                    <div>
                      <h4 class="text-xs font-bold text-slate-900 dark:text-white">Credit / Debit Card</h4>
                      <p class="text-[10px] text-slate-400">Secure gateways powered by stripe</p>
                    </div>
                  </div>
                  <i data-lucide="circle-check-big" class="w-5 h-5 text-orange-500 hidden peer-checked:block"></i>
                </label>
              </div>

              <!-- Cash on Delivery -->
              <div class="relative flex items-center">
                <input type="radio" id="payment-cod" name="payment-method" value="cod" class="sr-only peer custom-radio" />
                <label for="payment-cod" class="w-full border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between cursor-pointer peer-checked:border-orange-500 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-lg">💵</div>
                    <div>
                      <h4 class="text-xs font-bold text-slate-900 dark:text-white">Cash on Delivery (COD)</h4>
                      <p class="text-[10px] text-slate-400">Pay cash at your door during handoff</p>
                    </div>
                  </div>
                  <i data-lucide="circle-check-big" class="w-5 h-5 text-orange-500 hidden peer-checked:block"></i>
                </label>
              </div>
            </div>
          </div>
          
        </form>

        <!-- Final Receipt Column (Right Column) -->
        <div class="lg:col-span-5 space-y-6 h-fit sticky top-24">
          <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-6 rounded-3xl shadow-xs space-y-6">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-4 border-b">
              <i data-lucide="receipt" class="w-4.5 h-4.5"></i>
              <span>Order Summary</span>
            </h3>

            <!-- Scrollable List -->
            <div class="space-y-4 max-h-52 overflow-y-auto pr-2 no-scrollbar">
              ${itemsReceiptHTML}
            </div>

            <!-- Total Block -->
            <div class="space-y-3 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
              <div class="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span>Items Subtotal</span>
                <span class="font-bold text-slate-900 dark:text-slate-100">₹${totals.subtotal}</span>
              </div>
              <div class="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span>Delivery Charge</span>
                <span class="font-bold text-slate-900 dark:text-slate-100">${totals.deliveryCharge === 0 ? '<span class="text-emerald-500">FREE</span>' : "₹" + totals.deliveryCharge}</span>
              </div>
              <div class="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span>GST (5%)</span>
                <span class="font-bold text-slate-900 dark:text-slate-100">₹${totals.gst}</span>
              </div>
              
              <div class="border-t border-dashed border-slate-100 dark:border-slate-700 my-2"></div>
              
              <div class="flex justify-between items-center text-sm">
                <span class="font-extrabold text-slate-900 dark:text-white">Amount Payable</span>
                <span class="text-base font-extrabold text-orange-600 dark:text-orange-500">₹${totals.grandTotal}</span>
              </div>
            </div>

            <!-- Place Order Action -->
            <button type="submit" 
                    form="checkout-form"
                    id="place-order-submit-btn" 
                    class="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm px-6 py-4 rounded-2xl shadow-lg shadow-orange-500/15 text-center flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer focus:outline-none">
              <span>Place Secure Order</span>
              <i data-lucide="shield-check" class="w-4.5 h-4.5"></i>
            </button>
          </div>
          
          <!-- Coupon Box (Bonus feature) -->
          <div class="bg-orange-500/5 dark:bg-orange-950/25 border border-dashed border-orange-500/25 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <span class="text-lg">🔥</span>
              <div>
                <h4 class="text-xs font-bold text-orange-600 dark:text-orange-400">Coupon code is active</h4>
                <p class="text-[9px] text-slate-400 block">WELCOME50 is active & calculated</p>
              </div>
            </div>
            <span class="text-[10px] font-extrabold uppercase border border-orange-500/20 text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md">SAVED ₹100</span>
          </div>
        </div>

      </div>
    </section>
  `;

  // Attach submit intercept
  attachCheckoutEventListeners();
};

const attachCheckoutEventListeners = () => {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Collect values
    const name = document.getElementById("address-name").value.trim();
    const phone = document.getElementById("address-phone").value.trim();
    const flat = document.getElementById("address-flat").value.trim();
    const street = document.getElementById("address-street").value.trim();
    const city = document.getElementById("address-city").value.trim();
    const pin = document.getElementById("address-pin").value.trim();
    
    const paymentRadio = document.querySelector("input[name='payment-method']:checked");
    const payment = paymentRadio ? paymentRadio.value.toUpperCase() : "COD";

    const cartItems = getCartItems();
    const totals = getCartTotals();
    const orderId = "BITE-" + Math.floor(100000 + Math.random() * 900000);

    // Create order object
    const newOrder = {
      orderId,
      timestamp: new Date().toISOString(),
      items: cartItems,
      totals,
      payment,
      address: { name, phone, flat, street, city, pin }
    };

    // Enqueue order onto history queue in LocalStorage (Queue operation)
    enqueueOrder(newOrder);

    // Empty cart instantly
    clearCart();

    // Show Success Modal Overlap with beautiful microcheck animation
    const successModal = document.getElementById("order-success-modal");
    if (successModal) {
      successModal.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-700/50 space-y-6 text-center transform scale-95 transition-transform duration-300">
          
          <!-- Animated checkmark -->
          <div class="success-checkmark">
            <div class="check-icon">
              <span class="icon-line line-tip"></span>
              <span class="icon-line line-long"></span>
              <div class="icon-circle"></div>
            </div>
          </div>

          <div class="space-y-1.5">
            <h3 class="text-xl font-black text-slate-900 dark:text-white">Order Placed Successfully!</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Estimated delivery: <span class="font-extrabold text-orange-500">25-35 mins</span></p>
          </div>

          <!-- Order history queue indication -->
          <div class="bg-slate-50 dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-left space-y-3">
            <div class="flex justify-between font-bold text-slate-900 dark:text-white">
              <span>Order ID:</span>
              <span class="text-mono text-orange-500">${orderId}</span>
            </div>
            <div class="flex justify-between font-bold text-slate-900 dark:text-white">
              <span>Status:</span>
              <span class="text-emerald-500 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>1st in Queue</span>
              </span>
            </div>
            <p class="text-[10px] text-slate-400 font-normal border-t pt-2.5 mt-2.5 leading-relaxed">
              We have dispatched your order coordinates to our partner kitchen. Follow updates via your registered phone number ${phone}.
            </p>
          </div>

          <button id="order-success-close-btn" class="w-full bg-slate-900 hover:bg-slate-800 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-extrabold text-sm px-6 py-4 rounded-2xl shadow-md transition-colors focus:outline-none cursor-pointer">
            Keep Exploring
          </button>
        </div>
      `;

      successModal.classList.remove("hidden");
      setTimeout(() => {
        successModal.classList.add("opacity-100");
        const modalContent = successModal.querySelector("div");
        if (modalContent) modalContent.classList.remove("scale-95");
      }, 50);

      const closeSuccessBtn = document.getElementById("order-success-close-btn");
      if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener("click", () => {
          successModal.classList.remove("opacity-100");
          setTimeout(() => {
            successModal.classList.add("hidden");
            // Navigate back to Home
            window.location.hash = "#/";
          }, 300);
        });
      }
    }

    showToast("Delicious recipe ordered! 🚀", "success");
  });
};

// ============================================================================
// 4. WISHLIST MANAGEMENT DATA LAYER
// ============================================================================

const toggleWishlistStatus = (restaurantId) => {
  const wishlist = getWishlistFromStorage();
  let isAdded = false;

  const idx = wishlist.indexOf(restaurantId);
  if (idx > -1) {
    wishlist.splice(idx, 1); // Remove
  } else {
    wishlist.push(restaurantId); // Add
    isAdded = true;
  }

  saveWishlistToStorage(wishlist);
  updateWishlistCountBadge();
  showToast(isAdded ? "Added restaurant to favorites ❤️" : "Removed restaurant from favorites 🤍", "info");
  
  // Re-render components if list drawer open
  renderWishlistDrawerItems();
  
  return isAdded;
};

const updateWishlistCountBadge = () => {
  const wishlist = getWishlistFromStorage();
  const badge = document.getElementById("wishlist-count-badge");
  if (!badge) return;

  if (wishlist.length > 0) {
    badge.textContent = wishlist.length;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
};

const renderWishlistDrawerItems = () => {
  const container = document.getElementById("wishlist-items-list");
  if (!container) return;

  const wishlist = getWishlistFromStorage();
  if (wishlist.length === 0) {
    container.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center py-16">
        <div class="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-3">
          <i data-lucide="heart-off" class="w-6 h-6 text-red-400"></i>
        </div>
        <h4 class="text-xs font-bold text-slate-800 dark:text-white">No favorites added</h4>
        <p class="text-[10px] text-slate-400 max-w-xs mt-1">Tap the heart icon on any restaurant card to bookmark it for fast ordering!</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  const itemsHTML = wishlist.map(id => {
    const res = restaurants.find(r => r.id === id);
    if (!res) return "";
    return `
      <div class="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl flex justify-between items-center gap-4 group" 
           id="wish-drawer-item-${res.id}">
        <div class="flex items-center gap-3 cursor-pointer" onclick="window.location.hash='#/restaurant/${res.id}'; document.getElementById('wishlist-close-trigger').click();">
          <div class="w-14 h-14 rounded-xl overflow-hidden shrink-0 border shadow-xs">
            <img src="${res.image}" alt="${res.name}" referrerpolicy="no-referrer" class="w-full h-full object-cover" />
          </div>
          <div class="min-w-0">
            <h4 class="text-xs font-extrabold text-slate-900 dark:text-white truncate">${res.name}</h4>
            <p class="text-[10px] text-slate-400 mt-0.5 line-clamp-1">${res.cuisines.join(", ")}</p>
            <div class="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-bold">
              <span>${res.rating}</span>
              <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>
              <span class="text-slate-300 dark:text-slate-700">|</span>
              <span>${res.deliveryTime} mins</span>
            </div>
          </div>
        </div>
        
        <button class="wishlist-remove-drawer-btn text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none" 
                data-id="${res.id}">
          <i data-lucide="heart-off" class="w-4 h-4"></i>
        </button>
      </div>
    `;
  }).join("");

  container.innerHTML = `<div class="space-y-4">${itemsHTML}</div>`;
  lucide.createIcons();

  // Attach deletion buttons
  const delBtns = container.querySelectorAll(".wishlist-remove-drawer-btn[data-id]");
  delBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      toggleWishlistStatus(id);
      
      // If we are currently on the Home view or Restaurant view, re-draw the listing cards to stay in perfect sync
      if (currentView === "home") {
        renderHomeView();
      } else if (currentView === "restaurants") {
        filterAndRenderRestaurants();
      }
    });
  });
};

// ============================================================================
// 5. TOAST NOTIFICATIONS UI
// ============================================================================

export const showToast = (message, type = "success") => {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  
  let bgClass = "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700";
  let iconHTML = `<i data-lucide="info" class="w-4.5 h-4.5 text-blue-500"></i>`;
  if (type === "success") {
    iconHTML = `<i data-lucide="check-circle" class="w-4.5 h-4.5 text-emerald-500"></i>`;
  } else if (type === "error") {
    iconHTML = `<i data-lucide="alert-triangle" class="w-4.5 h-4.5 text-red-500"></i>`;
  }

  toast.className = `toast-message pointer-events-auto flex items-center gap-3 px-5 py-4.5 rounded-2xl border shadow-xl ${bgClass} text-slate-800 dark:text-slate-100 text-xs font-bold leading-none`;
  toast.innerHTML = `
    ${iconHTML}
    <span>${message}</span>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  // Self destruction
  setTimeout(() => {
    toast.remove();
  }, 3000);
};

// ============================================================================
// 6. INSTANT SHOPPING CART DRAW UI SYNC
// ============================================================================

const updateCartDrawerUI = (items) => {
  const badge = document.getElementById("cart-count-badge");
  const drawerCount = document.getElementById("cart-drawer-count");
  const emptyView = document.getElementById("empty-cart-view");
  const listContainer = document.getElementById("cart-items-container");
  const summaryFooter = document.getElementById("cart-drawer-footer");

  const totals = getCartTotals();

  // 1. Update badges
  if (badge) {
    badge.textContent = totals.totalItems;
    badge.classList.toggle("hidden", totals.totalItems === 0);
  }
  if (drawerCount) drawerCount.textContent = totals.totalItems;

  // 2. Toggle empty states
  if (totals.totalItems === 0) {
    if (emptyView) emptyView.classList.remove("hidden");
    if (listContainer) listContainer.classList.add("hidden");
    if (summaryFooter) summaryFooter.classList.add("hidden");
    return;
  }

  if (emptyView) emptyView.classList.add("hidden");
  if (listContainer) listContainer.classList.remove("hidden");
  if (summaryFooter) summaryFooter.classList.remove("hidden");

  // 3. Render items list
  listContainer.innerHTML = items.map(item => `
    <div class="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-800 relative group">
      
      <!-- Veg Badge indicator overlay -->
      <span class="absolute top-2 left-2 w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}"></span>

      <!-- Dish Image -->
      <div class="w-16 h-16 rounded-xl overflow-hidden shrink-0 border">
        <img src="${item.image}" alt="${item.name}" referrerpolicy="no-referrer" class="w-full h-full object-cover" />
      </div>

      <!-- Dish Details -->
      <div class="flex-1 min-w-0">
        <h4 class="text-xs font-extrabold text-slate-900 dark:text-white truncate pr-4">${item.name}</h4>
        <p class="text-[10px] text-orange-600 dark:text-orange-500 font-bold block mt-0.5">₹${item.price}</p>
        
        <!-- Quantity Selector control bar -->
        <div class="flex items-center gap-3.5 mt-2.5">
          <button class="cart-dec-btn w-6.5 h-6.5 bg-white dark:bg-slate-800 border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 rounded-lg flex items-center justify-center focus:outline-none" 
                  data-id="${item.id}">
            <i data-lucide="minus" class="w-3 h-3"></i>
          </button>
          
          <span class="text-xs font-extrabold text-slate-900 dark:text-white select-none">${item.quantity}</span>
          
          <button class="cart-inc-btn w-6.5 h-6.5 bg-white dark:bg-slate-800 border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 rounded-lg flex items-center justify-center focus:outline-none" 
                  data-id="${item.id}">
            <i data-lucide="plus" class="w-3 h-3"></i>
          </button>
        </div>
      </div>

      <!-- Delete Button (X) -->
      <button class="cart-remove-btn text-slate-400 hover:text-red-500 p-2 rounded-xl transition-colors focus:outline-none absolute top-2 right-2" 
              data-id="${item.id}"
              title="Remove Item">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>

    </div>
  `).join("");

  // 4. Update Receipt Figures
  const subtotalField = document.getElementById("cart-summary-subtotal");
  const deliveryField = document.getElementById("cart-summary-delivery");
  const gstField = document.getElementById("cart-summary-gst");
  const grandtotalField = document.getElementById("cart-summary-grandtotal");

  if (subtotalField) subtotalField.textContent = `₹${totals.subtotal}`;
  if (deliveryField) {
    deliveryField.innerHTML = totals.deliveryCharge === 0 
      ? `<span class="text-emerald-500 font-extrabold uppercase">FREE</span>` 
      : `₹${totals.deliveryCharge}`;
  }
  if (gstField) gstField.textContent = `₹${totals.gst}`;
  if (grandtotalField) grandtotalField.textContent = `₹${totals.grandTotal}`;

  lucide.createIcons();

  // Attach listeners to items inside the drawer
  const incBtns = listContainer.querySelectorAll(".cart-inc-btn[data-id]");
  incBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      updateCartItemQuantity(id, 1);
      // Synchronize back if currently on menu page
      if (currentView === "restaurant") {
        filterAndRenderMenu();
      }
    });
  });

  const decBtns = listContainer.querySelectorAll(".cart-dec-btn[data-id]");
  decBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      updateCartItemQuantity(id, -1);
      if (currentView === "restaurant") {
        filterAndRenderMenu();
      }
    });
  });

  const removeBtns = listContainer.querySelectorAll(".cart-remove-btn[data-id]");
  removeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      removeFromCart(id);
      showToast("Removed dish from basket 🗑️", "info");
      if (currentView === "restaurant") {
        filterAndRenderMenu();
      }
    });
  });
};

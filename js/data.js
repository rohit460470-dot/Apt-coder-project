/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// DATA STRUCTURES & COMPLEXITY ANALYSIS
// ============================================================================
// As per instructions, we utilize multiple fundamental data structures:
// 
// 1. ARRAYS []
//    - Used for: Restaurants List, Food Items List, Cart Items List.
//    - Why chosen: For storing ordered collections, which is essential for filtering, sorting,
//      and mapping elements dynamically to the DOM.
//    - Operations & Time Complexities:
//      * Add Item (Push): O(1) amortized - inserting an item at the end of the array.
//      * Remove Item (Filter/Splice): O(n) - requires shifting elements.
//      * Find Item (Find/IndexOf): O(n) - requires scanning the array linearly.
//      * Filter (Filter): O(n) - iterates through all elements to match criteria.
//      * Sort (Sort): O(n log n) - uses Dual-Pivot Quicksort or Timsort behind the scenes.
//      * Map/Reduce/ForEach: O(n) - processes each element once.
//
// 2. OBJECTS (HASHMAP) {}
//    - Used for: Categories Lookup, Cart Index Lookup (mapping itemId -> item), Wishlist State.
//    - Why chosen: Fast direct access. Instead of scanning a list of 60 items to check if an
//      item is in the cart, we use an object hash lookup, which is O(1).
//    - Operations & Time Complexities:
//      * Insert/Update: O(1) average.
//      * Delete: O(1) average.
//      * Key Lookup: O(1) average - keys are hashed to a unique index in memory, allowing
//        instant retrieval regardless of size.
//
// 3. STACK (LIFO - Last In First Out)
//    - Used for: Recently Viewed Restaurants.
//    - Why chosen: Users want to see the most recently viewed restaurants first.
//    - Operations:
//      * Push (View restaurant): O(1) - insert at top (front of the list).
//      * Limit size (Pop oldest if size > 5): O(1) - remove from bottom.
//
// 4. QUEUE (FIFO - First In First Out)
//    - Used for: Order History / Notifications Tracker.
//    - Why chosen: Orders are processed in the order they are received (First In, First Out).
//    - Operations:
//      * Enqueue (Add new order): O(1) - push to tail.
//      * Dequeue (Process/Remove oldest): O(1) - shift from head.
// ============================================================================

// --- 8 Categories (Object / HashMap for O(1) lookup) ---
export const categories = {
  pizza: { id: "pizza", name: "Pizza", icon: "🍕", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60" },
  burger: { id: "burger", name: "Burger", icon: "🍔", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60" },
  biryani: { id: "biryani", name: "Biryani", icon: "🍲", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60" },
  chinese: { id: "chinese", name: "Chinese", icon: "🍜", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60" },
  southindian: { id: "southindian", name: "South Indian", icon: "🥞", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60" },
  desserts: { id: "desserts", name: "Desserts", icon: "🍰", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=60" },
  drinks: { id: "drinks", name: "Drinks", icon: "🥤", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60" },
  healthy: { id: "healthy", name: "Healthy", icon: "🥗", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60" }
};

// --- Promotional Offers (Array) ---
export const promoOffers = [
  { id: "promo1", title: "50% OFF", subtitle: "Up to ₹100 on all orders", code: "WELCOME50", bgGradient: "from-orange-500 to-red-600", icon: "✨" },
  { id: "promo2", title: "FREE Delivery", subtitle: "On orders above ₹199", code: "FREEDEL", bgGradient: "from-blue-500 to-indigo-600", icon: "🚚" },
  { id: "promo3", title: "BUY 1 GET 1", subtitle: "Double the joy, half the price", code: "BOGO", bgGradient: "from-purple-500 to-pink-600", icon: "🍕" },
  { id: "promo4", title: "Weekend Fest", subtitle: "Flat ₹150 off on select items", code: "WEEKEND150", bgGradient: "from-emerald-500 to-teal-600", icon: "🎉" }
];

// --- 12 Restaurants (Array) ---
export const restaurants = [
  {
    id: 1,
    name: "The Pizza Palace",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80",
    rating: 4.6,
    deliveryTime: "25-30",
    cuisines: ["Pizza", "Italian", "Desserts"],
    priceForTwo: 400,
    discountBadge: "50% OFF | WELCOME50",
    isVeg: false,
    featured: true,
    reviewsCount: 1250,
    address: "Park Street, Sector 5, Kolkata"
  },
  {
    id: 2,
    name: "Burger Bistro",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80",
    rating: 4.4,
    deliveryTime: "15-20",
    cuisines: ["Burger", "American", "Healthy"],
    priceForTwo: 250,
    discountBadge: "FREE Delivery",
    isVeg: false,
    featured: true,
    reviewsCount: 840,
    address: "M.G. Road, Near Mall, Bangalore"
  },
  {
    id: 3,
    name: "Royal Biryani House",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    deliveryTime: "35-40",
    cuisines: ["Biryani", "Mughlai", "North Indian"],
    priceForTwo: 500,
    discountBadge: "Buy 1 Get 1 Free",
    isVeg: false,
    featured: true,
    reviewsCount: 3100,
    address: "Hitech City, Lane 4, Hyderabad"
  },
  {
    id: 4,
    name: "Golden Dragon Chinese",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
    rating: 4.2,
    deliveryTime: "30-35",
    cuisines: ["Chinese", "Noodles", "Drinks"],
    priceForTwo: 350,
    discountBadge: "₹100 OFF | DRAGON",
    isVeg: false,
    featured: false,
    reviewsCount: 620,
    address: "Connaught Place, New Delhi"
  },
  {
    id: 5,
    name: "Dakshin Delights",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
    rating: 4.7,
    deliveryTime: "20-25",
    cuisines: ["South Indian", "Healthy Food"],
    priceForTwo: 200,
    discountBadge: "30% OFF",
    isVeg: true,
    featured: true,
    reviewsCount: 1850,
    address: "Anna Salai, T. Nagar, Chennai"
  },
  {
    id: 6,
    name: "The Green Salad Co.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
    rating: 4.5,
    deliveryTime: "15-25",
    cuisines: ["Healthy Food", "Salads", "Drinks"],
    priceForTwo: 300,
    discountBadge: "FREE Delivery",
    isVeg: true,
    featured: false,
    reviewsCount: 410,
    address: "Bandra West, Linking Road, Mumbai"
  },
  {
    id: 7,
    name: "Sweet Tooth Patisserie",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    deliveryTime: "10-15",
    cuisines: ["Desserts", "Bakery"],
    priceForTwo: 180,
    discountBadge: "BOGO | SWEET",
    isVeg: true,
    featured: true,
    reviewsCount: 950,
    address: "Koramangala 5th Block, Bangalore"
  },
  {
    id: 8,
    name: "Noodles & Co.",
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&auto=format&fit=crop&q=80",
    rating: 4.1,
    deliveryTime: "25-30",
    cuisines: ["Chinese", "Noodles"],
    priceForTwo: 280,
    discountBadge: "20% OFF",
    isVeg: false,
    featured: false,
    reviewsCount: 530,
    address: "Sector 18, Noida"
  },
  {
    id: 9,
    name: "Biryani Blues Café",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80",
    rating: 4.5,
    deliveryTime: "30-35",
    cuisines: ["Biryani", "North Indian"],
    priceForTwo: 450,
    discountBadge: "Flat ₹150 OFF",
    isVeg: false,
    featured: false,
    reviewsCount: 1420,
    address: "DLF Phase 3, Gurgaon"
  },
  {
    id: 10,
    name: "The Beverage Bar",
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=80",
    rating: 4.3,
    deliveryTime: "15-20",
    cuisines: ["Drinks", "Healthy Food"],
    priceForTwo: 150,
    discountBadge: "10% OFF",
    isVeg: true,
    featured: false,
    reviewsCount: 290,
    address: "Salt Lake, Sector 1, Kolkata"
  },
  {
    id: 11,
    name: "La Piazza Authentic",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    rating: 4.7,
    deliveryTime: "35-40",
    cuisines: ["Pizza", "Italian"],
    priceForTwo: 600,
    discountBadge: "FREE Delivery",
    isVeg: false,
    featured: true,
    reviewsCount: 770,
    address: "Colaba, Near Gateway, Mumbai"
  },
  {
    id: 12,
    name: "Punjab Da Dhaba",
    image: "https://images.unsplash.com/photo-1515003844864-5981446ab41e?w=600&auto=format&fit=crop&q=80",
    rating: 4.6,
    deliveryTime: "25-30",
    cuisines: ["North Indian", "Healthy Food"],
    priceForTwo: 320,
    discountBadge: "50% OFF | PUNJAB",
    isVeg: true,
    featured: true,
    reviewsCount: 2340,
    address: "G.T. Road, Jalandhar"
  }
];

// --- 60 Food Items (Array of Objects) ---
// Each food item links to a restaurantId and belongs to a category.
export const foodItems = [
  // Restaurant 1: Pizza Palace (Italian, Pizza, Desserts)
  {
    id: 101,
    restaurantId: 1,
    name: "Classic Margherita Pizza",
    category: "pizza",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=60",
    description: "Classic mozzarella, sweet fresh tomato sauce, garden fresh basil, and extra virgin olive oil drizzle.",
    price: 249,
    rating: 4.7,
    isVeg: true,
    isTrending: true
  },
  {
    id: 102,
    restaurantId: 1,
    name: "Fiery Pepperoni Pizza",
    category: "pizza",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60",
    description: "Generous portions of spicy pepperoni slices, loaded mozzarella cheese, and rich marinara sauce.",
    price: 349,
    rating: 4.8,
    isVeg: false,
    isTrending: true
  },
  {
    id: 103,
    restaurantId: 1,
    name: "Double Cheese Margherita",
    category: "pizza",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60",
    description: "An extra-loaded version of the classic Margherita with 100% real liquid cheese and mozzarella blend.",
    price: 299,
    rating: 4.5,
    isVeg: true,
    isTrending: false
  },
  {
    id: 104,
    restaurantId: 1,
    name: "Farmhouse Loaded Pizza",
    category: "pizza",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60",
    description: "Overloaded with sweet corn, onions, crispy capsicum, mushrooms, and fresh golden tomatoes.",
    price: 329,
    rating: 4.6,
    isVeg: true,
    isTrending: false
  },
  {
    id: 105,
    restaurantId: 1,
    name: "Molten Chocolate Lava Cake",
    category: "desserts",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60",
    description: "Warm chocolate cake with a rich and gooey liquid chocolate center that melts in your mouth.",
    price: 119,
    rating: 4.9,
    isVeg: true,
    isTrending: true
  },

  // Restaurant 2: Burger Bistro (Burger, American, Healthy)
  {
    id: 201,
    restaurantId: 2,
    name: "Signature Cheese Burger",
    category: "burger",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60",
    description: "Flame-grilled chicken/veg patty with cheddar cheese, crisp lettuce, red onion, pickles, and bistro sauce.",
    price: 159,
    rating: 4.6,
    isVeg: false,
    isTrending: true
  },
  {
    id: 202,
    restaurantId: 2,
    name: "Crispy Aloo Tikki Burger",
    category: "burger",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60",
    description: "Double potato-peas spiced patty, house-made mayo, sliced tomatoes, and onions in a toasted bun.",
    price: 99,
    rating: 4.3,
    isVeg: true,
    isTrending: false
  },
  {
    id: 203,
    restaurantId: 2,
    name: "Mega Smokehouse BBQ Burger",
    category: "burger",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=60",
    description: "Double charcoal grilled patties with smoky BBQ sauce, cheese slices, and crispy onion rings.",
    price: 219,
    rating: 4.7,
    isVeg: false,
    isTrending: true
  },
  {
    id: 204,
    restaurantId: 2,
    name: "Vegan Power Burger",
    category: "burger",
    image: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=500&auto=format&fit=crop&q=60",
    description: "A plant-based high-protein patty, avocado spread, baby spinach, and vegan chipotle sauce.",
    price: 189,
    rating: 4.5,
    isVeg: true,
    isTrending: false
  },
  {
    id: 205,
    restaurantId: 2,
    name: "Cajun Fried Potatoes",
    category: "healthy",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60",
    description: "Skin-on seasoned wedges air-fried and tossed in a special Louisiana cajun spice blend.",
    price: 129,
    rating: 4.4,
    isVeg: true,
    isTrending: false
  },

  // Restaurant 3: Royal Biryani House (Biryani, Mughlai)
  {
    id: 301,
    restaurantId: 3,
    name: "Hyderabadi Chicken Biryani",
    category: "biryani",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60",
    description: "Fragrant basmati rice layered with succulent spiced chicken marinated in yogurt, saffron, and slow-cooked in Handi.",
    price: 349,
    rating: 4.9,
    isVeg: false,
    isTrending: true
  },
  {
    id: 302,
    restaurantId: 3,
    name: "Royal Mutton Dum Biryani",
    category: "biryani",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=60",
    description: "Tender, melt-in-mouth mutton cooked under pressure (dum) with long-grain rice, caramelized onions, and aromatic spices.",
    price: 449,
    rating: 4.9,
    isVeg: false,
    isTrending: true
  },
  {
    id: 303,
    restaurantId: 3,
    name: "Spiced Paneer Dum Biryani",
    category: "biryani",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60",
    description: "Fresh cubes of cottage cheese marinated in tikka spices, slow-cooked in dum style with premium basmati rice.",
    price: 299,
    rating: 4.6,
    isVeg: true,
    isTrending: false
  },
  {
    id: 304,
    restaurantId: 3,
    name: "Classic Veg Biryani",
    category: "biryani",
    image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500&auto=format&fit=crop&q=60",
    description: "Loaded with fresh carrots, beans, peas, and potatoes simmered in traditional Indian spices, garnished with mint.",
    price: 259,
    rating: 4.4,
    isVeg: true,
    isTrending: false
  },
  {
    id: 305,
    restaurantId: 3,
    name: "Creamy Garlic Raita",
    category: "drinks",
    image: "https://images.unsplash.com/photo-1628191139360-408a06492299?w=500&auto=format&fit=crop&q=60",
    description: "Chilled yogurt seasoned with roasted cumin, dynamic garlic notes, fresh cucumber, and mint leaves.",
    price: 59,
    rating: 4.5,
    isVeg: true,
    isTrending: false
  },

  // Restaurant 4: Golden Dragon Chinese (Chinese, Noodles, Drinks)
  {
    id: 401,
    restaurantId: 4,
    name: "Szechuan Chili Noodles",
    category: "chinese",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60",
    description: "Stir-fried noodles with crisp veggies and hot, spicy house-made Szechuan chili sauce.",
    price: 199,
    rating: 4.3,
    isVeg: true,
    isTrending: true
  },
  {
    id: 402,
    restaurantId: 4,
    name: "Crispy Hakka Veg Noodles",
    category: "chinese",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60",
    description: "Authentic wok-tossed Hakka noodles with sliced colorful bell peppers, cabbage, carrots, and spring onions.",
    price: 179,
    rating: 4.4,
    isVeg: true,
    isTrending: false
  },
  {
    id: 403,
    restaurantId: 4,
    name: "Manchurian Gravy with Fried Rice",
    category: "chinese",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=60",
    description: "Deep-fried seasoned vegetable balls drowned in a sweet, sour, and spicy dark soy gravy, paired with steamed fried rice.",
    price: 239,
    rating: 4.5,
    isVeg: true,
    isTrending: true
  },
  {
    id: 404,
    restaurantId: 4,
    name: "Chili Garlic Momos (6 Pcs)",
    category: "chinese",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60",
    description: "Steamed dumplings stuffed with dynamic minced veggies, tossed in sizzling chili garlic oil.",
    price: 149,
    rating: 4.2,
    isVeg: true,
    isTrending: false
  },
  {
    id: 405,
    restaurantId: 4,
    name: "Refreshing Mojito",
    category: "drinks",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60",
    description: "A cool bubbly blend of fresh muddled lime wedges, fresh mint leaves, pure cane sugar, and club soda.",
    price: 99,
    rating: 4.6,
    isVeg: true,
    isTrending: false
  },

  // Restaurant 5: Dakshin Delights (South Indian, Healthy)
  {
    id: 501,
    restaurantId: 5,
    name: "Butter Masala Dosa",
    category: "southindian",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60",
    description: "Crispy paper-thin crepe of fermented rice and lentil batter, smeared with pure butter and filled with spiced potato mash.",
    price: 139,
    rating: 4.8,
    isVeg: true,
    isTrending: true
  },
  {
    id: 502,
    restaurantId: 5,
    name: "Steamed Rava Idli (3 Pcs)",
    category: "southindian",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60",
    description: "Soft and fluffy steamed semolina cakes infused with roasted cashews, curry leaves, served with coconut chutney and piping hot sambar.",
    price: 99,
    rating: 4.7,
    isVeg: true,
    isTrending: false
  },
  {
    id: 503,
    restaurantId: 5,
    name: "Medu Vada (3 Pcs)",
    category: "southindian",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60",
    description: "Crispy, deep-fried savory lentil fritters donut-shaped, packed with black pepper, curry leaves, and green chilies.",
    price: 109,
    rating: 4.5,
    isVeg: true,
    isTrending: false
  },
  {
    id: 504,
    restaurantId: 5,
    name: "Onion Tomato Uttapam",
    category: "southindian",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60",
    description: "Thick savory pancake topped with finely chopped spicy red onions, tomatoes, and cilantro leaves.",
    price: 129,
    rating: 4.6,
    isVeg: true,
    isTrending: false
  },
  {
    id: 505,
    restaurantId: 5,
    name: "Traditional Filter Coffee",
    category: "drinks",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60",
    description: "Strong decoction of premium chicory-blended coffee beans frothed up with boiling high-fat milk.",
    price: 69,
    rating: 4.9,
    isVeg: true,
    isTrending: true
  },

  // Restaurant 6: The Green Salad Co. (Healthy Food, Salads, Drinks)
  {
    id: 601,
    restaurantId: 6,
    name: "Mediterranean Quinoa Bowl",
    category: "healthy",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
    description: "High-protein fluffy quinoa, juicy cherry tomatoes, crisp cucumber, feta, Kalamata olives, tossed in lemon vinaigrette.",
    price: 249,
    rating: 4.6,
    isVeg: true,
    isTrending: true
  },
  {
    id: 602,
    restaurantId: 6,
    name: "Avocado Toast with Poached Egg",
    category: "healthy",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=60",
    description: "Sourdough toast smeared with freshly mashed Hass avocado, lime juice, red chili flakes, topped with two organic soft poached eggs.",
    price: 279,
    rating: 4.8,
    isVeg: false,
    isTrending: true
  },
  {
    id: 603,
    restaurantId: 6,
    name: "Roasted Chickpea & Tofu Salad",
    category: "healthy",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60",
    description: "Crispy oven-roasted chickpeas, pan-seared organic tofu cubes, spinach, arugula, and tahini dressing.",
    price: 229,
    rating: 4.4,
    isVeg: true,
    isTrending: false
  },
  {
    id: 604,
    restaurantId: 6,
    name: "Green Goddess Detox Smoothie",
    category: "drinks",
    image: "https://images.unsplash.com/photo-1610970881699-44a5587caa16?w=500&auto=format&fit=crop&q=60",
    description: "Power green blend of spinach, organic cucumber, celery stalks, tart green apples, lemon, ginger, and cold-pressed apple juice.",
    price: 159,
    rating: 4.5,
    isVeg: true,
    isTrending: false
  },
  {
    id: 605,
    restaurantId: 6,
    name: "Hydrating Coconut Water Mix",
    category: "drinks",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&auto=format&fit=crop&q=60",
    description: "Pure natural coconut water infused with fresh chia seeds, mint sprigs, and a dash of natural honey.",
    price: 119,
    rating: 4.7,
    isVeg: true,
    isTrending: false
  },

  // Restaurant 7: Sweet Tooth Patisserie (Desserts, Bakery)
  {
    id: 701,
    restaurantId: 7,
    name: "Gourmet Red Velvet Cupcake",
    category: "desserts",
    image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop&q=60",
    description: "Classic red velvet sponge filled with a hint of premium chocolate, topped with whipped cream cheese frosting.",
    price: 89,
    rating: 4.8,
    isVeg: true,
    isTrending: true
  },
  {
    id: 702,
    restaurantId: 7,
    name: "Fudge Chocolate Brownie",
    category: "desserts",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60",
    description: "Ultra-fudgy decadence filled with toasted walnut pieces, loaded chocolate chunks, baked to perfection.",
    price: 99,
    rating: 4.7,
    isVeg: true,
    isTrending: true
  },
  {
    id: 703,
    restaurantId: 7,
    name: "New York Style Cheesecake",
    category: "desserts",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=60",
    description: "Rich, dense, and velvety smooth cream cheese filling over a buttery graham cracker crust, topped with fresh strawberry compote.",
    price: 189,
    rating: 4.9,
    isVeg: true,
    isTrending: true
  },
  {
    id: 704,
    restaurantId: 7,
    name: "French Macaron Box (3 Pcs)",
    category: "desserts",
    image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=500&auto=format&fit=crop&q=60",
    description: "Assorted classic Parisian macarons in three amazing flavors: Pistachio, Salted Caramel, and Raspberry.",
    price: 149,
    rating: 4.6,
    isVeg: true,
    isTrending: false
  },
  {
    id: 705,
    restaurantId: 7,
    name: "Chilled Vanilla Custard",
    category: "desserts",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=60",
    description: "Silky Madagascar vanilla bean custard custard topped with caramelized sugar crystals and fresh berries.",
    price: 129,
    rating: 4.5,
    isVeg: true,
    isTrending: false
  },

  // Restaurant 8: Noodles & Co. (Chinese, Noodles)
  {
    id: 801,
    restaurantId: 8,
    name: "Chili Garlic Stir-Fry Noodles",
    category: "chinese",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60",
    description: "Authentic quick-tossed wok noodles loaded with roasted garlic chunks, dry red chili flakes, and scallions.",
    price: 169,
    rating: 4.2,
    isVeg: true,
    isTrending: false
  },
  {
    id: 802,
    restaurantId: 8,
    name: "Crispy Spring Rolls (4 Pcs)",
    category: "chinese",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60",
    description: "Golden flaky wrapper filled with wok-sauteed julienned cabbage, carrots, and glass noodles, served with sweet plum sauce.",
    price: 129,
    rating: 4.3,
    isVeg: true,
    isTrending: false
  },
  {
    id: 803,
    restaurantId: 8,
    name: "Kung Pao Chicken",
    category: "chinese",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60",
    description: "Stir-fried tender chicken cubes with crunchy roasted peanuts, bell peppers, and scallions in a sweet-spicy garlic sauce.",
    price: 249,
    rating: 4.5,
    isVeg: false,
    isTrending: true
  },
  {
    id: 804,
    restaurantId: 8,
    name: "Wok Fried Jasmine Rice",
    category: "chinese",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=60",
    description: "Piping hot fragrant jasmine rice wok-tossed with fresh sweet corn, diced green peas, and light light soy sauce.",
    price: 159,
    rating: 4.1,
    isVeg: true,
    isTrending: false
  },
  {
    id: 805,
    restaurantId: 8,
    name: "Chilled Jasmine Milk Tea",
    category: "drinks",
    image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500&auto=format&fit=crop&q=60",
    description: "Traditional cold-brewed loose jasmine green tea mixed with creamy condensed milk and brown sugar boba.",
    price: 139,
    rating: 4.4,
    isVeg: true,
    isTrending: false
  },

  // Restaurant 9: Biryani Blues Café (Biryani, North Indian)
  {
    id: 901,
    restaurantId: 9,
    name: "Kolkata Style Chicken Biryani",
    category: "biryani",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=60",
    description: "Fragrant saffron-flavored light basmati rice cooked on dum with tender marinated chicken, boiled egg, and a soft spiced potato.",
    price: 329,
    rating: 4.6,
    isVeg: false,
    isTrending: true
  },
  {
    id: 902,
    restaurantId: 9,
    name: "Awadhi Egg Dum Biryani",
    category: "biryani",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60",
    description: "Delicious Lucknowi-style cooked basmati rice layered with gold-boiled fried eggs, spices, and flavored with rose water.",
    price: 249,
    rating: 4.3,
    isVeg: false,
    isTrending: false
  },
  {
    id: 903,
    restaurantId: 9,
    name: "Paneer Tikka Masala Curry",
    category: "healthy",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60",
    description: "Chargrilled paneer cubes simmered in a creamy, velvety tomato, and cashew nut gravy, garnished with pure butter.",
    price: 279,
    rating: 4.5,
    isVeg: true,
    isTrending: false
  },
  {
    id: 904,
    restaurantId: 9,
    name: "Butter Garlic Naan (2 Pcs)",
    category: "southindian",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60",
    description: "Leavened flatbread cooked in a clay tandoor, brushed with abundant garlic bits and melted butter.",
    price: 79,
    rating: 4.7,
    isVeg: true,
    isTrending: true
  },
  {
    id: 905,
    restaurantId: 9,
    name: "Sweet Punjabi Lassi",
    category: "drinks",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60",
    description: "Creamy whipped thick yogurt blended with cane sugar, topped with rose syrup and cardamoms.",
    price: 89,
    rating: 4.6,
    isVeg: true,
    isTrending: false
  },

  // Restaurant 10: The Beverage Bar (Drinks, Healthy Food)
  {
    id: 1001,
    restaurantId: 10,
    name: "Detox Celery Lemonade",
    category: "drinks",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60",
    description: "Cold-pressed pure organic celery sticks, freshly squeezed lemons, cucumber juice, with zero added sugar.",
    price: 129,
    rating: 4.2,
    isVeg: true,
    isTrending: false
  },
  {
    id: 1002,
    restaurantId: 10,
    name: "Iced Caramel Macchiato",
    category: "drinks",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60",
    description: "Freshly pulled espresso shot poured over milk, ice cubes, and drizzled with a decadent buttery caramel sauce.",
    price: 169,
    rating: 4.5,
    isVeg: true,
    isTrending: true
  },
  {
    id: 1003,
    restaurantId: 10,
    name: "Watermelon Mint Cooler",
    category: "drinks",
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop&q=60",
    description: "100% freshly blended seedless summer watermelon juice, mixed with crushed fresh mint leaves and key lime.",
    price: 119,
    rating: 4.4,
    isVeg: true,
    isTrending: false
  },
  {
    id: 1004,
    restaurantId: 10,
    name: "Organic Acai Berry Bowl",
    category: "healthy",
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500&auto=format&fit=crop&q=60",
    description: "Thick dynamic acai berry puree topped with premium chia seeds, homemade granola, sliced strawberries, and honey.",
    price: 229,
    rating: 4.6,
    isVeg: true,
    isTrending: true
  },
  {
    id: 1005,
    restaurantId: 10,
    name: "Keto Avocado Spinach Shake",
    category: "healthy",
    image: "https://images.unsplash.com/photo-1610970881699-44a5587caa16?w=500&auto=format&fit=crop&q=60",
    description: "Avocado pulp, baby spinach, organic almond milk, with vanilla keto-sweetener.",
    price: 199,
    rating: 4.3,
    isVeg: true,
    isTrending: false
  },

  // Restaurant 11: La Piazza Authentic (Pizza, Italian)
  {
    id: 1101,
    restaurantId: 11,
    name: "Neapolitan Burrata Pizza",
    category: "pizza",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60",
    description: "Slow-fermented dynamic sourdough crust crust topped with creamy burrata cheese ball, rocket leaves, and olive oil.",
    price: 499,
    rating: 4.9,
    isVeg: true,
    isTrending: true
  },
  {
    id: 1102,
    restaurantId: 11,
    name: "Truffle Mushroom Pizza",
    category: "pizza",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=60",
    description: "Smoked mozzarella, sautéed wild mushrooms, white truffle oil drizzle, and chopped parsley.",
    price: 449,
    rating: 4.8,
    isVeg: true,
    isTrending: true
  },
  {
    id: 1103,
    restaurantId: 11,
    name: "Pesto Penne Pasta",
    category: "healthy",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=60",
    description: "Durum wheat penne pasta cooked in aromatic basil-pine nut pesto cream, sprinkled with aged parmesan flakes.",
    price: 329,
    rating: 4.6,
    isVeg: true,
    isTrending: false
  },
  {
    id: 1104,
    restaurantId: 11,
    name: "Aged Garlic Bread with Herbs",
    category: "southindian",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60",
    description: "Artisanal ciabatta bread roasted with garlic butter, fresh parsley, and melted Italian provolone.",
    price: 159,
    rating: 4.5,
    isVeg: true,
    isTrending: false
  },
  {
    id: 1105,
    restaurantId: 11,
    name: "Tiramisu Classico Bowl",
    category: "desserts",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=60",
    description: "Traditional ladyfingers soaked in dark espresso syrup, layered with high-fat whipped mascarpone custard and dark cocoa powder.",
    price: 249,
    rating: 4.9,
    isVeg: true,
    isTrending: true
  },

  // Restaurant 12: Punjab Da Dhaba (North Indian, Healthy)
  {
    id: 1201,
    restaurantId: 12,
    name: "Creamy Paneer Butter Masala",
    category: "healthy",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60",
    description: "Cottage cheese chunks cooked in rich creamy red tomato-cashew curry, topped with double cream.",
    price: 249,
    rating: 4.8,
    isVeg: true,
    isTrending: true
  },
  {
    id: 1202,
    restaurantId: 12,
    name: "Dal Makhani Amritsari",
    category: "healthy",
    image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500&auto=format&fit=crop&q=60",
    description: "Black lentils slow simmered overnight on charcoal hearth with house spices, rich cream, and butter blocks.",
    price: 199,
    rating: 4.7,
    isVeg: true,
    isTrending: true
  },
  {
    id: 1203,
    restaurantId: 12,
    name: "Tandoori Roti Plain (3 Pcs)",
    category: "southindian",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60",
    description: "Whole-wheat flatbread traditional baked on the inner walls of a clay tandoor oven.",
    price: 49,
    rating: 4.5,
    isVeg: true,
    isTrending: false
  },
  {
    id: 1204,
    restaurantId: 12,
    name: "Paneer Paratha with Butter",
    category: "southindian",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60",
    description: "Flaky whole wheat paratha stuffed with freshly seasoned paneer mash and herbs, served with white butter.",
    price: 119,
    rating: 4.6,
    isVeg: true,
    isTrending: false
  },
  {
    id: 1205,
    restaurantId: 12,
    name: "Pista Malai Kulfi on stick",
    category: "desserts",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=60",
    description: "Traditional frozen rich condensed milk ice cream packed with cardamoms, saffron, and slivered pistachios.",
    price: 79,
    rating: 4.8,
    isVeg: true,
    isTrending: false
  }
];

// --- Customer Reviews ---
export const customerReviews = [
  {
    id: 1,
    name: "Anjali Sharma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=60",
    rating: 5,
    text: "The delivery is lightning fast! The biryani from Royal Biryani House arrived steaming hot. Best food app experience ever!",
    date: "2 days ago"
  },
  {
    id: 2,
    name: "Rohan Das",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=60",
    rating: 5,
    text: "Highly impressed by the user interface of the app! Smooth checkout process, perfect dark mode, and delicious pizzas from Pizza Palace.",
    date: "Yesterday"
  },
  {
    id: 3,
    name: "Vikram Malhotra",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=60",
    rating: 4,
    text: "Healthy food options are excellent. The Mediterranean Salad bowl is a staple for my daily diet. Great service and fresh food.",
    date: "3 days ago"
  }
];

// --- FAQs ---
export const faqs = [
  {
    question: "How do I place an order?",
    answer: "Browse through our list of featured restaurants or search for your favorite food items. Click 'Add to Cart' on the dishes you want, click the cart icon to review, and proceed to the Checkout screen. Add your address and complete the order!"
  },
  {
    question: "What are the payment methods supported?",
    answer: "We support a variety of payment methods including UPI (Google Pay, PhonePe, Paytm), all major Credit/Debit Cards, and Cash on Delivery (COD) for ultimate convenience."
  },
  {
    question: "How fast is the delivery?",
    answer: "Delivery times range from 15 to 45 minutes depending on your distance from the restaurant. The estimated delivery time is listed on each restaurant card!"
  },
  {
    question: "Can I cancel my order?",
    answer: "Yes, you can cancel your order within 5 minutes of placing it by contacting our 24/7 customer support via the helpline on the checkout screen."
  },
  {
    question: "Is there a delivery fee?",
    answer: "We offer FREE delivery on many restaurants, as well as on all orders exceeding ₹199. For other orders, a nominal standard fee of ₹40 applies."
  }
];

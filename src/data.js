/* ==========================================================================
   ECOGROW — SEED DATA (placeholder, ready to replace with a real backend)
   Prices in base currency (USD). All copy is placeholder.
   ========================================================================== */
(function () {
  const categories = [
    { id: "vegetables", name: "Vegetables", tint: "mint", img: "img/p/broccoli.jpg" },
    { id: "fruits", name: "Fruits", tint: "butter", img: "img/p/apple.jpg" },
    { id: "berries", name: "Berries", tint: "rose", img: "img/p/strawberry.jpg" },
    { id: "dairy", name: "Milk & Dairy", tint: "sky", img: "img/p/milk.jpg" },
    { id: "meat", name: "Meat", tint: "peach", img: "img/p/beef.jpg" },
    { id: "bakery", name: "Cake & Bakery", tint: "rose", img: "img/p/cake.jpg" },
    { id: "snacks", name: "Snacks & Nuts", tint: "sand", img: "img/p/nuts.jpg" },
    { id: "spices", name: "Spices & Herbs", tint: "peach", img: "img/p/chili.jpg" },
  ];

  const brands = ["Green Valley", "Sweet Garden", "Harvest Co.", "Fresh Field"];

  // [name, cat, img, price, sale|null, weightBase, tags, badge, stock, rating, reviews, brandIdx]
  const raw = [
    ["Fresh Broccoli", "vegetables", "broccoli", 2.49, null, "500g", ["organic", "vegan", "gluten-free", "local"], "New", 42, 4.8, 126, 0],
    ["Green Cabbage", "vegetables", "cabbage", 1.99, 1.69, "1kg", ["vegan", "gluten-free", "local"], "15% off", 30, 4.6, 88, 2],
    ["Organic Sweet Corn", "vegetables", "corn", 3.49, null, "2 pcs", ["organic", "vegan", "gluten-free"], "Hot", 25, 4.7, 61, 1],
    ["Purple Eggplant", "vegetables", "eggplant", 2.19, null, "500g", ["vegan", "gluten-free", "local"], "Organic", 18, 4.5, 40, 0],
    ["Garlic Bulbs", "vegetables", "garlic", 1.29, null, "250g", ["organic", "vegan", "gluten-free"], null, 60, 4.9, 210, 3],
    ["Pumpkin", "vegetables", "pumpkin", 4.99, 3.99, "1.5kg", ["vegan", "gluten-free", "local"], "20% off", 12, 4.6, 52, 2],
    ["Red Bell Pepper", "vegetables", "pepper", 1.79, null, "2 pcs", ["organic", "vegan", "gluten-free"], null, 35, 4.4, 33, 1],
    ["Savoy Cabbage", "vegetables", "cabbage", 2.29, null, "1 pc", ["vegan", "local"], null, 0, 4.3, 19, 3],
    ["Baby Broccoli", "vegetables", "broccoli", 3.29, null, "250g", ["organic", "vegan"], "New", 4, 4.7, 22, 0],
    ["Pumpkin Wedge", "vegetables", "pumpkin", 2.49, null, "750g", ["vegan", "gluten-free"], null, 20, 4.2, 14, 2],
    ["Red Apple", "fruits", "apple", 3.99, 3.39, "1kg", ["organic", "vegan", "gluten-free", "local"], "15% off", 50, 4.9, 302, 0],
    ["Golden Kiwi", "fruits", "kiwi", 4.49, null, "500g", ["vegan", "gluten-free"], "Hot", 28, 4.7, 97, 1],
    ["Organic Peach", "fruits", "peach", 4.99, null, "1kg", ["organic", "vegan", "gluten-free"], "Organic", 22, 4.8, 75, 1],
    ["Black Plum", "fruits", "plum", 5.49, 4.49, "500g", ["vegan", "gluten-free", "local"], "18% off", 16, 4.6, 48, 3],
    ["Green Kiwi", "fruits", "kiwi", 3.49, null, "6 pcs", ["vegan", "gluten-free"], null, 40, 4.5, 64, 2],
    ["Gala Apple Bag", "fruits", "apple", 6.99, null, "2kg", ["vegan", "local"], null, 3, 4.7, 120, 0],
    ["Flat Peach", "fruits", "peach", 5.99, null, "500g", ["organic", "vegan"], "New", 0, 4.4, 21, 1],
    ["Red Plum", "fruits", "plum", 4.29, null, "500g", ["vegan", "gluten-free"], null, 26, 4.5, 37, 3],
    ["Fresh Strawberry", "berries", "strawberry", 4.99, 3.99, "400g", ["organic", "vegan", "gluten-free", "local"], "20% off", 34, 4.9, 245, 1],
    ["Wild Strawberry Punnet", "berries", "strawberry", 6.49, null, "250g", ["organic", "vegan"], "Hot", 9, 4.8, 66, 0],
    ["Strawberry Family Pack", "berries", "strawberry", 9.99, 8.49, "1kg", ["vegan", "local"], "15% off", 14, 4.7, 51, 2],
    ["Whole Farm Milk", "dairy", "milk", 2.99, null, "1L", ["organic", "gluten-free", "local"], "Organic", 70, 4.8, 190, 2],
    ["Skimmed Milk", "dairy", "milk", 2.49, null, "1L", ["gluten-free"], null, 55, 4.4, 72, 3],
    ["Raw Milk Glass Bottle", "dairy", "milk", 4.49, null, "750ml", ["organic", "local"], "New", 11, 4.9, 45, 0],
    ["Barista Oat Milk", "dairy", "milk", 3.79, 3.29, "1L", ["vegan", "gluten-free"], "13% off", 40, 4.6, 133, 1],
    ["Grass-fed Beef Steak", "meat", "beef", 12.99, null, "500g", ["gluten-free", "local"], "Hot", 15, 4.8, 98, 2],
    ["Beef Ribeye", "meat", "beef", 18.49, 15.99, "400g", ["gluten-free"], "14% off", 8, 4.9, 77, 3],
    ["Beef Stew Cubes", "meat", "beef", 8.99, null, "500g", ["gluten-free", "local"], null, 22, 4.5, 41, 2],
    ["Minced Beef", "meat", "beef", 6.99, null, "500g", ["gluten-free"], null, 2, 4.4, 58, 3],
    ["Chocolate Fudge Cake", "bakery", "cake", 14.99, 12.49, "800g", [], "17% off", 7, 4.9, 112, 1],
    ["Mini Chocolate Cake", "bakery", "cake", 6.99, null, "300g", [], "New", 13, 4.6, 39, 1],
    ["Gluten-free Choco Cake", "bakery", "cake", 9.49, null, "500g", ["gluten-free"], null, 0, 4.5, 26, 0],
    ["Mixed Nuts", "snacks", "nuts", 7.99, 6.79, "300g", ["vegan", "gluten-free"], "15% off", 45, 4.8, 167, 3],
    ["Roasted Almonds & Hazelnuts", "snacks", "nuts", 8.49, null, "250g", ["vegan", "gluten-free", "organic"], "Organic", 30, 4.7, 84, 0],
    ["Trail Mix Jar", "snacks", "nuts", 10.99, null, "500g", ["vegan"], null, 18, 4.5, 49, 2],
    ["Walnut Halves", "snacks", "nuts", 9.99, null, "250g", ["vegan", "gluten-free"], null, 5, 4.6, 31, 1],
    ["Red Hot Chili", "spices", "chili", 1.49, null, "100g", ["organic", "vegan", "gluten-free"], "Hot", 80, 4.7, 59, 3],
    ["Bird's Eye Chili", "spices", "chili", 1.99, 1.59, "100g", ["vegan", "gluten-free", "local"], "20% off", 38, 4.6, 27, 2],
    ["Smoked Garlic", "spices", "garlic", 2.79, null, "200g", ["vegan", "gluten-free"], "New", 24, 4.8, 36, 0],
    ["Sweet Paprika Peppers", "spices", "pepper", 2.29, null, "300g", ["organic", "vegan"], null, 19, 4.3, 17, 1],
  ];

  const desc = {
    vegetables: "Harvested at first light by our partner farms and delivered within hours, so it reaches your kitchen crisp, bright and full of flavour. Rinse just before cooking; keeps 4–6 days in the crisper drawer.",
    fruits: "Tree-ripened and hand-sorted, never waxed. Picked when the sugars peak so every bite is juicy and fragrant. Store at room temperature until fully ripe, then refrigerate.",
    berries: "Plump, sweet berries picked the morning they ship. Keep them unwashed in the fridge and rinse just before eating for the best texture.",
    dairy: "From small pasture-based herds within 80 miles of our hub. Gently pasteurised to keep its natural creaminess. Keep refrigerated below 4°C.",
    meat: "Grass-fed, humanely raised and dry-aged by our butcher partners. Vacuum-packed for freshness; freeze within two days if not using.",
    bakery: "Baked fresh every morning in small batches with real butter, free-range eggs and single-origin cocoa.",
    snacks: "Slow-roasted in small batches, lightly salted or plain. Great for lunchboxes, trail days and late-night cravings.",
    spices: "Sun-dried and freshly packed for maximum aroma and heat. Store in a cool, dark cupboard.",
  };
  const nutr = {
    vegetables: [["Energy", "34 kcal"], ["Protein", "2.8 g"], ["Carbohydrate", "6.6 g"], ["Fibre", "2.6 g"], ["Vitamin C", "89 mg"]],
    fruits: [["Energy", "52 kcal"], ["Protein", "0.3 g"], ["Carbohydrate", "14 g"], ["Sugars", "10 g"], ["Fibre", "2.4 g"]],
    berries: [["Energy", "32 kcal"], ["Protein", "0.7 g"], ["Carbohydrate", "7.7 g"], ["Sugars", "4.9 g"], ["Vitamin C", "59 mg"]],
    dairy: [["Energy", "64 kcal"], ["Protein", "3.4 g"], ["Fat", "3.6 g"], ["Carbohydrate", "4.8 g"], ["Calcium", "120 mg"]],
    meat: [["Energy", "250 kcal"], ["Protein", "26 g"], ["Fat", "15 g"], ["Iron", "2.6 mg"], ["Vitamin B12", "2.6 µg"]],
    bakery: [["Energy", "371 kcal"], ["Protein", "5 g"], ["Fat", "16 g"], ["Carbohydrate", "53 g"], ["Sugars", "36 g"]],
    snacks: [["Energy", "607 kcal"], ["Protein", "20 g"], ["Fat", "54 g"], ["Carbohydrate", "21 g"], ["Fibre", "7 g"]],
    spices: [["Energy", "40 kcal"], ["Protein", "1.9 g"], ["Carbohydrate", "8.8 g"], ["Vitamin C", "144 mg"], ["Capsaicin", "high"]],
  };

  const unitFamilies = (w) => {
    const m = w.match(/^([\d.]+)\s*(g|kg|ml|L)$/);
    if (!m) return [{ label: w, mult: 1 }];
    const n = parseFloat(m[1]), u = m[2];
    if (u === "g") return [{ label: w, mult: 1 }, { label: (n * 2 >= 1000 ? (n * 2 / 1000) + "kg" : n * 2 + "g"), mult: 1.9 }];
    if (u === "kg") return [{ label: w, mult: 1 }, { label: (n * 2) + "kg", mult: 1.85 }];
    return [{ label: w, mult: 1 }, { label: u === "L" ? (n * 2) + "L" : (n * 2 >= 1000 ? (n * 2 / 1000) + "L" : n * 2 + "ml"), mult: 1.9 }];
  };

  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const products = raw.map((r, i) => ({
    id: "p" + (i + 1),
    slug: slug(r[0]),
    name: r[0], category: r[1],
    images: ["img/p/" + r[2] + ".jpg"],
    price: r[3], salePrice: r[4],
    weights: unitFamilies(r[5]),
    tags: r[6], badge: r[7], stock: r[8], rating: r[9], reviews: r[10],
    brand: brands[r[11]],
    createdAt: 40 - i,
    description: desc[r[1]],
    nutrition: nutr[r[1]],
  }));

  const testimonials = [
    { name: "Sarah Mitchell", role: "Home cook, Wilmington", img: "img/av/a1.jpg", rating: 5, quote: "Delightful service! The produce arrives so fresh it still smells like the farm. The 1-hour delivery has honestly changed how I plan our dinners." },
    { name: "Amara Okafor", role: "Mother of three", img: "img/av/a2.jpg", rating: 5, quote: "The free-delivery bar is genius — I always know exactly how close I am. Strawberries were sweeter than anything at my local supermarket." },
    { name: "Lena Brooks", role: "Nutrition coach", img: "img/av/a3.jpg", rating: 5, quote: "I recommend Ecogrow to every client. Clear organic labels, honest weights, and the dietary filters save me so much time." },
    { name: "Marcus Hale", role: "Chef, The Green Table", img: "img/av/a4.jpg", rating: 5, quote: "We source herbs and vegetables for our restaurant here twice a week. Consistent quality and the riders are always on time." },
    { name: "Priya Nair", role: "Software engineer", img: "img/av/a1.jpg", rating: 5, quote: "Reorder-last-basket means my weekly shop takes thirty seconds. The delivery slot picker is the best I've used." },
    { name: "Daniel Ortiz", role: "Retired teacher", img: "img/av/a4.jpg", rating: 5, quote: "Friendly support on the phone and a rotten peach was refunded instantly, no questions asked. That's how you earn trust." },
  ];

  const faqs = [
    { q: "Natural Citrus Fruits", a: "Our citrus is grown without synthetic waxes or post-harvest fungicides. We source oranges, lemons and limes from certified orchards and ship them within 48 hours of picking, so the peel stays fragrant and safe to zest." },
    { q: "Organic Vegetables", a: "Every vegetable marked Organic comes from a farm certified by a USDA-accredited body. That means no synthetic pesticides, no GMOs, and soil managed with compost and crop rotation for at least three years." },
    { q: "Fresh Vegetables", a: "Non-organic 'Fresh' lines are grown by local partner farms using integrated pest management. They're harvested to order and reach our cold room the same morning they're picked." },
    { q: "What are the main principles of organic farming?", a: "Organic farming rests on four principles: health (of soil, plants, animals and people), ecology (working with natural cycles), fairness (to farmers, workers and consumers) and care (precaution for future generations). In practice that means crop rotation, composting, biological pest control and no synthetic inputs." },
    { q: "Dry Fruits & Nuts", a: "Nuts and dried fruit are slow-roasted or sun-dried in small batches and packed in resealable, light-proof pouches. Store them in a cool cupboard and use within three months of opening." },
    { q: "How fast is delivery?", a: "Orders placed before 7 PM inside our delivery area arrive within one hour, or in the slot you choose at checkout. You can track your rider live on the map." },
    { q: "What if an item arrives damaged or rotten?", a: "Tap 'Report an issue' on the order page within 24 hours. We refund or replace the item instantly — no need to send anything back." },
    { q: "Do you deliver outside the city?", a: "We currently deliver to most of New Castle County. Use the area checker at checkout or in the cart to confirm your postal code." },
  ];

  const posts = [
    { slug: "seasonal-produce-guide-autumn", title: "Your Autumn Produce Guide: What to Buy This Month", date: "2026-10-02", read: 6, cat: "Seasonal", img: "img/p/pumpkin.jpg", excerpt: "Pumpkins, apples and brassicas are at their peak. Here's how to choose, store and cook them.", body: ["Autumn is the most generous season at the farm. Cooler nights concentrate sugars in apples and squash, while brassicas like broccoli and cabbage turn sweeter after the first light frost.", "When choosing pumpkins, look for a dry, firm stem and a dull rather than glossy skin — a sign of full maturity. Store whole pumpkins somewhere cool and dark and they will keep for two months.", "Apples should feel heavy for their size. Keep them in the fridge, away from leafy greens: they release ethylene, which speeds up ripening in nearby produce."] },
    { slug: "organic-vs-local", title: "Organic vs. Local: What Actually Matters?", date: "2026-09-18", read: 8, cat: "Farming", img: "img/farm.jpg", excerpt: "Both labels mean something different. We break down when each one makes the biggest difference.", body: ["'Organic' describes how food is grown; 'local' describes where. The best choice depends on what you value most — fewer synthetic inputs, lower food miles, or supporting nearby farms.", "Many of our small partner farms practise organic methods but can't yet afford certification. We label those 'Local' and publish their growing practices on each product page."] },
    { slug: "five-minute-breakfast-bowls", title: "Five-Minute Breakfast Bowls for Busy Mornings", date: "2026-09-04", read: 4, cat: "Recipes", img: "img/p/strawberry.jpg", excerpt: "Berries, nuts and farm milk — three easy combinations to start the day right.", body: ["Start with a base of oats soaked overnight in whole farm milk. In the morning, top with sliced strawberries, a handful of mixed nuts and a drizzle of honey.", "For a vegan version, swap in barista oat milk and add kiwi for a sharp, bright contrast."] },
    { slug: "reduce-food-waste", title: "How to Make Your Groceries Last Twice as Long", date: "2026-08-21", read: 5, cat: "Tips", img: "img/p/broccoli.jpg", excerpt: "Simple storage tricks from our warehouse team that keep produce fresh for days longer.", body: ["Wrap broccoli loosely in a damp towel and keep it in the crisper. Store garlic in a ventilated basket, never the fridge.", "Keep berries unwashed until you eat them, and line the container with a paper towel to absorb moisture."] },
  ];

  const stores = [
    { name: "Ecogrow Market Street", addr: "1234 Market Street, Wilmington, DE 19801", hours: "09:00 – 20:00", phone: "+1 302 555 0148" },
    { name: "Ecogrow Trolley Square", addr: "21 Delaware Ave, Wilmington, DE 19806", hours: "08:00 – 21:00", phone: "+1 302 555 0172" },
    { name: "Ecogrow Newark Hub", addr: "88 Main Street, Newark, DE 19711", hours: "09:00 – 20:00", phone: "+1 302 555 0119" },
  ];

  const partners = [
    { name: "Acadia", style: "seal" },
    { name: "Sweet Garden", style: "script" },
    { name: "Green Valley", style: "leaf" },
    { name: "Fresh Field", style: "badge" },
  ];

  window.ECO_DATA = { categories, products, testimonials, faqs, posts, stores, partners, brands };

  /* ---- ASSET LEDGER — source + license per image. VERIFY BEFORE LAUNCH ---- */
  window.ECO_ASSETS = [
    { file: "img/people/farmer-produce.jpg", source: "PxHere #1709416", license: "CC0", status: "verify before launch" },
    { file: "img/people/apples-basin.jpg", source: "PickPik", license: "Royalty-free", status: "verify before launch" },
    { file: "img/people/apple-hand.jpg", source: "PICRYL", license: "Public domain", status: "verify before launch" },
    { file: "img/rider-cut.png", source: "PxHere #1639133 (illustration, bg removed in-browser)", license: "CC0", status: "replace with photo cutout of a rider on a red scooter" },
    { file: "img/farm.jpg", source: "PxHere #323570", license: "CC0", status: "verify before launch" },
    { file: "img/veg-basket*.jpg", source: "Public Domain Pictures / PICRYL", license: "Public domain", status: "verify before launch" },
    { file: "img/p/*.jpg", source: "Public Domain Pictures, Stockvault, Needpix, PxHere, PickPik", license: "PD / CC0 / free", status: "verify before launch; run scripts/remove-bg.py for cutouts" },
    { file: "img/av/*.jpg", source: "NegativeSpace, PickPik, Public Domain Pictures", license: "CC0 / free", status: "replace with real customer photos (with consent)" },
  ];
})();

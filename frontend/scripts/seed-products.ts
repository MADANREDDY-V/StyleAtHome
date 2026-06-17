// Product Seed Script for StyleAtHome
// Run with: npx tsx scripts/seed-products.ts
// Or paste the SQL output into Supabase SQL editor

const stores = [
  { name: 'Wrogn', slug: 'wrogn', description: 'Virat Kohli\'s streetwear brand — bold, edgy, and unapologetically modern.', logo_url: 'https://picsum.photos/seed/wrogn-logo/150/150', banner_url: 'https://picsum.photos/seed/wrogn-banner/1200/400' },
  { name: 'Zudio', slug: 'zudio', description: 'Trend-forward affordable fashion for the style-conscious generation.', logo_url: 'https://picsum.photos/seed/zudio-logo/150/150', banner_url: 'https://picsum.photos/seed/zudio-banner/1200/400' },
  { name: 'Westside', slug: 'westside', description: 'Premium western and ethnic wear — timeless elegance meets contemporary craft.', logo_url: 'https://picsum.photos/seed/westside-logo/150/150', banner_url: 'https://picsum.photos/seed/westside-banner/1200/400' },
  { name: 'Max Fashion', slug: 'max-fashion', description: 'Family fashion for every occasion. Quality meets affordability.', logo_url: 'https://picsum.photos/seed/max-logo/150/150', banner_url: 'https://picsum.photos/seed/max-banner/1200/400' },
  { name: 'Pantaloons', slug: 'pantaloons', description: 'India\'s premium fashion destination since 1997. Curated collections for modern living.', logo_url: 'https://picsum.photos/seed/pantaloons-logo/150/150', banner_url: 'https://picsum.photos/seed/pantaloons-banner/1200/400' },
  { name: 'Trends', slug: 'trends', description: 'Reliance\'s fashion-forward retail — bringing global trends to Indian wardrobes.', logo_url: 'https://picsum.photos/seed/trends-logo/150/150', banner_url: 'https://picsum.photos/seed/trends-banner/1200/400' },
];

const categories = [
  { name: 'T-Shirts', section: 'Men' },
  { name: 'Shirts', section: 'Men' },
  { name: 'Jeans', section: 'Men' },
  { name: 'Trousers', section: 'Men' },
  { name: 'Dresses', section: 'Women' },
  { name: 'Tops', section: 'Women' },
  { name: 'Kurtas', section: 'Women' },
  { name: 'Jeans', section: 'Women' },
  { name: 'T-Shirts', section: 'Kids' },
  { name: 'Shorts', section: 'Kids' },
  { name: 'Dresses', section: 'Kids' },
  { name: 'Sets', section: 'Kids' },
];

// Helper to generate products
interface SeedProduct {
  name: string; brand: string; price: number; mrp: number; description: string;
  image_url: string; category_name: string; category_section: string; store_slug: string;
  section: string; color: string; sizes: string; rating: number; review_count: number;
  is_new_arrival: boolean; is_active: boolean;
}

const products: SeedProduct[] = [
  // MEN — T-Shirts (Store: Wrogn)
  { name: 'Virat Noir Oversized Tee', brand: 'Wrogn', price: 799, mrp: 1299, description: 'Premium heavyweight cotton oversized t-shirt with raw-edge detailing. Anti-pill technology for lasting freshness.', image_url: 'https://picsum.photos/seed/noir-tee/600/800', category_name: 'T-Shirts', category_section: 'Men', store_slug: 'wrogn', section: 'Men', color: 'Black', sizes: 'S, M, L, XL, XXL', rating: 4.5, review_count: 312, is_new_arrival: true, is_active: true },
  { name: 'Urban Grid Polo', brand: 'Wrogn', price: 1199, mrp: 1799, description: 'Structured polo with geometric grid pattern. Moisture-wicking fabric for active comfort.', image_url: 'https://picsum.photos/seed/grid-polo/600/800', category_name: 'T-Shirts', category_section: 'Men', store_slug: 'wrogn', section: 'Men', color: 'Navy', sizes: 'S, M, L, XL', rating: 4.3, review_count: 189, is_new_arrival: false, is_active: true },
  { name: 'Acid Wash Crew Neck', brand: 'Wrogn', price: 699, mrp: 999, description: 'Vintage acid wash finish on 100% organic cotton. Each piece uniquely distressed.', image_url: 'https://picsum.photos/seed/acid-wash/600/800', category_name: 'T-Shirts', category_section: 'Men', store_slug: 'wrogn', section: 'Men', color: 'Grey', sizes: 'M, L, XL', rating: 4.1, review_count: 87, is_new_arrival: false, is_active: true },
  { name: 'Minimal Stripe Essential', brand: 'Zudio', price: 399, mrp: 599, description: 'Lightweight striped tee in breathable cotton blend. Perfect for layering or solo wear.', image_url: 'https://picsum.photos/seed/stripe-tee/600/800', category_name: 'T-Shirts', category_section: 'Men', store_slug: 'zudio', section: 'Men', color: 'White', sizes: 'S, M, L, XL', rating: 4.0, review_count: 456, is_new_arrival: true, is_active: true },

  // MEN — Shirts
  { name: 'Oxford Button-Down Classic', brand: 'Westside', price: 1499, mrp: 2199, description: 'Premium Oxford cotton button-down with mother-of-pearl buttons. Tailored slim fit.', image_url: 'https://picsum.photos/seed/oxford-shirt/600/800', category_name: 'Shirts', category_section: 'Men', store_slug: 'westside', section: 'Men', color: 'White', sizes: 'S, M, L, XL, XXL', rating: 4.7, review_count: 234, is_new_arrival: false, is_active: true },
  { name: 'Denim Trucker Shirt', brand: 'Wrogn', price: 1799, mrp: 2499, description: 'Heavy-duty indigo denim shirt with copper rivets. Raw selvedge detailing at cuffs.', image_url: 'https://picsum.photos/seed/denim-shirt/600/800', category_name: 'Shirts', category_section: 'Men', store_slug: 'wrogn', section: 'Men', color: 'Blue', sizes: 'M, L, XL', rating: 4.4, review_count: 156, is_new_arrival: true, is_active: true },
  { name: 'Linen Resort Shirt', brand: 'Pantaloons', price: 1299, mrp: 1999, description: 'Pure linen camp-collar shirt. Relaxed fit with coconut shell buttons.', image_url: 'https://picsum.photos/seed/linen-resort/600/800', category_name: 'Shirts', category_section: 'Men', store_slug: 'pantaloons', section: 'Men', color: 'Beige', sizes: 'S, M, L, XL', rating: 4.6, review_count: 98, is_new_arrival: false, is_active: true },
  { name: 'Mandarin Collar Kurta Shirt', brand: 'Max Fashion', price: 899, mrp: 1399, description: 'Fusion mandarin collar shirt in cotton-linen blend. Perfect for festive occasions.', image_url: 'https://picsum.photos/seed/mandarin-shirt/600/800', category_name: 'Shirts', category_section: 'Men', store_slug: 'max-fashion', section: 'Men', color: 'Green', sizes: 'S, M, L, XL', rating: 4.2, review_count: 67, is_new_arrival: false, is_active: true },

  // MEN — Jeans
  { name: 'Raw Selvedge Slim Jean', brand: 'Wrogn', price: 2499, mrp: 3499, description: 'Japanese 14oz raw selvedge denim. Slim tapered fit that develops unique fading with wear.', image_url: 'https://picsum.photos/seed/selvedge-jean/600/800', category_name: 'Jeans', category_section: 'Men', store_slug: 'wrogn', section: 'Men', color: 'Navy', sizes: '28, 30, 32, 34, 36', rating: 4.8, review_count: 423, is_new_arrival: true, is_active: true },
  { name: 'Stretch Skinny Fit', brand: 'Zudio', price: 999, mrp: 1499, description: 'Ultra-stretch denim with recovery fabric technology. Skinny fit without restriction.', image_url: 'https://picsum.photos/seed/stretch-skinny/600/800', category_name: 'Jeans', category_section: 'Men', store_slug: 'zudio', section: 'Men', color: 'Black', sizes: '28, 30, 32, 34', rating: 4.1, review_count: 287, is_new_arrival: false, is_active: true },
  { name: 'Cargo Relaxed Fit Jean', brand: 'Trends', price: 1599, mrp: 2299, description: 'Relaxed cargo jeans with reinforced utility pockets. Garment-dyed for lived-in softness.', image_url: 'https://picsum.photos/seed/cargo-jean/600/800', category_name: 'Jeans', category_section: 'Men', store_slug: 'trends', section: 'Men', color: 'Grey', sizes: '30, 32, 34, 36', rating: 4.3, review_count: 134, is_new_arrival: false, is_active: true },

  // MEN — Trousers
  { name: 'Tech-Flex Chino', brand: 'Westside', price: 1899, mrp: 2699, description: 'Performance chino with 4-way stretch and wrinkle-free finish. Tailored regular fit.', image_url: 'https://picsum.photos/seed/tech-chino/600/800', category_name: 'Trousers', category_section: 'Men', store_slug: 'westside', section: 'Men', color: 'Khaki', sizes: '28, 30, 32, 34, 36', rating: 4.6, review_count: 178, is_new_arrival: true, is_active: true },
  { name: 'Pleated Wide-Leg Trouser', brand: 'Pantaloons', price: 1699, mrp: 2499, description: 'Double-pleated wide-leg trousers in premium twill. High-rise silhouette with pressed crease.', image_url: 'https://picsum.photos/seed/wide-trouser/600/800', category_name: 'Trousers', category_section: 'Men', store_slug: 'pantaloons', section: 'Men', color: 'Black', sizes: '30, 32, 34, 36', rating: 4.4, review_count: 92, is_new_arrival: false, is_active: true },
  { name: 'Jogger Trouser Hybrid', brand: 'Zudio', price: 799, mrp: 1199, description: 'The trouser that thinks it\'s a jogger. Elastic ankles with structured front pleat.', image_url: 'https://picsum.photos/seed/jogger-trouser/600/800', category_name: 'Trousers', category_section: 'Men', store_slug: 'zudio', section: 'Men', color: 'Navy', sizes: 'S, M, L, XL', rating: 4.0, review_count: 345, is_new_arrival: false, is_active: true },

  // WOMEN — Dresses
  { name: 'Floral Midi Wrap Dress', brand: 'Westside', price: 2299, mrp: 3299, description: 'Georgette wrap dress with hand-painted floral motif. Self-tie waist and flutter sleeves.', image_url: 'https://picsum.photos/seed/floral-midi/600/800', category_name: 'Dresses', category_section: 'Women', store_slug: 'westside', section: 'Women', color: 'Red', sizes: 'XS, S, M, L', rating: 4.7, review_count: 267, is_new_arrival: true, is_active: true },
  { name: 'Ribbed Bodycon Mini', brand: 'Zudio', price: 599, mrp: 899, description: 'Sculpting ribbed knit bodycon in stretch jersey. Square neckline with cap sleeves.', image_url: 'https://picsum.photos/seed/bodycon-mini/600/800', category_name: 'Dresses', category_section: 'Women', store_slug: 'zudio', section: 'Women', color: 'Black', sizes: 'XS, S, M, L', rating: 4.2, review_count: 489, is_new_arrival: false, is_active: true },
  { name: 'Tiered Maxi Summer Dress', brand: 'Max Fashion', price: 1499, mrp: 2199, description: 'Breezy tiered maxi with adjustable spaghetti straps. Smocked bust in cotton voile.', image_url: 'https://picsum.photos/seed/tiered-maxi/600/800', category_name: 'Dresses', category_section: 'Women', store_slug: 'max-fashion', section: 'Women', color: 'White', sizes: 'S, M, L, XL', rating: 4.5, review_count: 156, is_new_arrival: true, is_active: true },
  { name: 'Blazer Dress Power Move', brand: 'Pantaloons', price: 2799, mrp: 3999, description: 'Structured blazer dress with peak lapels and gold button details. Power dressing redefined.', image_url: 'https://picsum.photos/seed/blazer-dress/600/800', category_name: 'Dresses', category_section: 'Women', store_slug: 'pantaloons', section: 'Women', color: 'Navy', sizes: 'XS, S, M, L', rating: 4.8, review_count: 78, is_new_arrival: false, is_active: true },

  // WOMEN — Tops
  { name: 'Cropped Puff Sleeve Top', brand: 'Trends', price: 899, mrp: 1399, description: 'Statement puff sleeves on cropped silhouette. Elastic smocking at back for comfort.', image_url: 'https://picsum.photos/seed/puff-sleeve/600/800', category_name: 'Tops', category_section: 'Women', store_slug: 'trends', section: 'Women', color: 'Pink', sizes: 'XS, S, M, L', rating: 4.3, review_count: 234, is_new_arrival: true, is_active: true },
  { name: 'Satin Cowl Neck Camisole', brand: 'Westside', price: 1199, mrp: 1799, description: 'Luxe satin camisole with cowl neckline and adjustable straps. Bias-cut draping.', image_url: 'https://picsum.photos/seed/cowl-cami/600/800', category_name: 'Tops', category_section: 'Women', store_slug: 'westside', section: 'Women', color: 'Gold', sizes: 'XS, S, M, L', rating: 4.6, review_count: 145, is_new_arrival: false, is_active: true },
  { name: 'Oversized Graphic Tee', brand: 'Wrogn', price: 699, mrp: 999, description: 'Drop-shoulder oversized tee with abstract graphic print. Washed cotton feel.', image_url: 'https://picsum.photos/seed/graphic-tee-w/600/800', category_name: 'Tops', category_section: 'Women', store_slug: 'wrogn', section: 'Women', color: 'White', sizes: 'S, M, L', rating: 4.1, review_count: 567, is_new_arrival: false, is_active: true },
  { name: 'Ruched Mesh Top', brand: 'Zudio', price: 499, mrp: 799, description: 'Body-hugging mesh top with strategic ruching. Lined for modesty with sheer sleeves.', image_url: 'https://picsum.photos/seed/mesh-top/600/800', category_name: 'Tops', category_section: 'Women', store_slug: 'zudio', section: 'Women', color: 'Black', sizes: 'XS, S, M, L', rating: 4.0, review_count: 323, is_new_arrival: true, is_active: true },

  // WOMEN — Kurtas
  { name: 'Chanderi Silk Kurta Set', brand: 'Pantaloons', price: 3499, mrp: 4999, description: 'Handwoven chanderi silk kurta with matching palazzo. Zari border and mirror work detailing.', image_url: 'https://picsum.photos/seed/chanderi-kurta/600/800', category_name: 'Kurtas', category_section: 'Women', store_slug: 'pantaloons', section: 'Women', color: 'Blue', sizes: 'S, M, L, XL', rating: 4.9, review_count: 89, is_new_arrival: true, is_active: true },
  { name: 'Cotton A-Line Printed Kurta', brand: 'Max Fashion', price: 799, mrp: 1299, description: 'Lightweight cotton A-line kurta with block print motifs. 3/4 sleeves with button placket.', image_url: 'https://picsum.photos/seed/aline-kurta/600/800', category_name: 'Kurtas', category_section: 'Women', store_slug: 'max-fashion', section: 'Women', color: 'Yellow', sizes: 'S, M, L, XL, XXL', rating: 4.3, review_count: 412, is_new_arrival: false, is_active: true },
  { name: 'Embroidered Straight Kurta', brand: 'Westside', price: 1999, mrp: 2799, description: 'Luxe straight-cut kurta with tone-on-tone chikankari embroidery. Mandarin collar.', image_url: 'https://picsum.photos/seed/embroid-kurta/600/800', category_name: 'Kurtas', category_section: 'Women', store_slug: 'westside', section: 'Women', color: 'White', sizes: 'S, M, L, XL', rating: 4.7, review_count: 167, is_new_arrival: false, is_active: true },

  // WOMEN — Jeans
  { name: 'High-Rise Mom Jean', brand: 'Zudio', price: 1299, mrp: 1899, description: 'Vintage-inspired high-rise mom jean with tapered leg. Distressed whisker detailing.', image_url: 'https://picsum.photos/seed/mom-jean/600/800', category_name: 'Jeans', category_section: 'Women', store_slug: 'zudio', section: 'Women', color: 'Blue', sizes: '24, 26, 28, 30, 32', rating: 4.4, review_count: 378, is_new_arrival: true, is_active: true },
  { name: 'Wide-Leg Palazzo Jean', brand: 'Trends', price: 1599, mrp: 2299, description: 'Dramatic wide-leg silhouette in premium stretch denim. High waist with clean front.', image_url: 'https://picsum.photos/seed/palazzo-jean/600/800', category_name: 'Jeans', category_section: 'Women', store_slug: 'trends', section: 'Women', color: 'Black', sizes: '26, 28, 30, 32', rating: 4.5, review_count: 198, is_new_arrival: false, is_active: true },
  { name: 'Bootcut Flare Jean', brand: 'Pantaloons', price: 1799, mrp: 2499, description: 'Retro bootcut with modern stretch. Mid-rise fit with back pocket embroidery.', image_url: 'https://picsum.photos/seed/bootcut-jean/600/800', category_name: 'Jeans', category_section: 'Women', store_slug: 'pantaloons', section: 'Women', color: 'Navy', sizes: '26, 28, 30, 32', rating: 4.3, review_count: 123, is_new_arrival: false, is_active: true },

  // KIDS — T-Shirts
  { name: 'Dino Adventure Tee', brand: 'Max Fashion', price: 399, mrp: 599, description: 'Colorful dinosaur graphic on soft organic cotton. Bio-washed for extra softness on young skin.', image_url: 'https://picsum.photos/seed/dino-tee/600/800', category_name: 'T-Shirts', category_section: 'Kids', store_slug: 'max-fashion', section: 'Kids', color: 'Green', sizes: '2-3Y, 4-5Y, 6-7Y, 8-9Y', rating: 4.6, review_count: 234, is_new_arrival: true, is_active: true },
  { name: 'Rainbow Stripe Polo', brand: 'Pantaloons', price: 599, mrp: 899, description: 'Classic polo with playful rainbow stripe pattern. Soft pique cotton with ribbed collar.', image_url: 'https://picsum.photos/seed/rainbow-polo/600/800', category_name: 'T-Shirts', category_section: 'Kids', store_slug: 'pantaloons', section: 'Kids', color: 'White', sizes: '3-4Y, 5-6Y, 7-8Y, 9-10Y', rating: 4.4, review_count: 156, is_new_arrival: false, is_active: true },
  { name: 'Space Explorer Graphic Tee', brand: 'Zudio', price: 299, mrp: 499, description: 'Glow-in-the-dark space print on cotton jersey. Relaxed fit for playground adventures.', image_url: 'https://picsum.photos/seed/space-tee/600/800', category_name: 'T-Shirts', category_section: 'Kids', store_slug: 'zudio', section: 'Kids', color: 'Navy', sizes: '2-3Y, 4-5Y, 6-7Y, 8-9Y', rating: 4.2, review_count: 389, is_new_arrival: false, is_active: true },

  // KIDS — Shorts
  { name: 'Cargo Pull-On Shorts', brand: 'Max Fashion', price: 499, mrp: 799, description: 'Easy-on cargo shorts with elastic waistband. Multiple utility pockets for treasures.', image_url: 'https://picsum.photos/seed/cargo-shorts/600/800', category_name: 'Shorts', category_section: 'Kids', store_slug: 'max-fashion', section: 'Kids', color: 'Khaki', sizes: '3-4Y, 5-6Y, 7-8Y, 9-10Y', rating: 4.3, review_count: 178, is_new_arrival: true, is_active: true },
  { name: 'Denim Bermuda Shorts', brand: 'Trends', price: 599, mrp: 899, description: 'Knee-length denim bermudas with rolled-up hem. Stretch denim for active kids.', image_url: 'https://picsum.photos/seed/denim-bermuda/600/800', category_name: 'Shorts', category_section: 'Kids', store_slug: 'trends', section: 'Kids', color: 'Blue', sizes: '4-5Y, 6-7Y, 8-9Y, 10-11Y', rating: 4.1, review_count: 98, is_new_arrival: false, is_active: true },
  { name: 'Athletic Quick-Dry Shorts', brand: 'Zudio', price: 349, mrp: 549, description: 'Moisture-wicking athletic shorts with mesh lining. Built for sport and summer days.', image_url: 'https://picsum.photos/seed/athletic-shorts/600/800', category_name: 'Shorts', category_section: 'Kids', store_slug: 'zudio', section: 'Kids', color: 'Black', sizes: '3-4Y, 5-6Y, 7-8Y, 9-10Y', rating: 4.5, review_count: 267, is_new_arrival: false, is_active: true },

  // KIDS — Dresses
  { name: 'Tutu Party Dress', brand: 'Pantaloons', price: 1299, mrp: 1899, description: 'Layered tulle tutu dress with sequin bodice. Every little princess deserves sparkle.', image_url: 'https://picsum.photos/seed/tutu-dress/600/800', category_name: 'Dresses', category_section: 'Kids', store_slug: 'pantaloons', section: 'Kids', color: 'Pink', sizes: '2-3Y, 4-5Y, 6-7Y, 8-9Y', rating: 4.8, review_count: 145, is_new_arrival: true, is_active: true },
  { name: 'Cotton Frock Floral', brand: 'Max Fashion', price: 699, mrp: 999, description: 'Lightweight cotton frock with all-over floral print. Peter pan collar with back button.', image_url: 'https://picsum.photos/seed/cotton-frock/600/800', category_name: 'Dresses', category_section: 'Kids', store_slug: 'max-fashion', section: 'Kids', color: 'Yellow', sizes: '2-3Y, 4-5Y, 6-7Y', rating: 4.4, review_count: 312, is_new_arrival: false, is_active: true },
  { name: 'Denim Dungaree Dress', brand: 'Westside', price: 999, mrp: 1499, description: 'Classic denim dungaree dress with adjustable shoulder straps. Pairs with any tee.', image_url: 'https://picsum.photos/seed/dungaree-dress/600/800', category_name: 'Dresses', category_section: 'Kids', store_slug: 'westside', section: 'Kids', color: 'Blue', sizes: '3-4Y, 5-6Y, 7-8Y, 9-10Y', rating: 4.6, review_count: 89, is_new_arrival: false, is_active: true },

  // KIDS — Sets
  { name: 'Safari Explorer Set', brand: 'Max Fashion', price: 899, mrp: 1399, description: 'Matching t-shirt and shorts set with safari animal prints. Coordinated adventure wear.', image_url: 'https://picsum.photos/seed/safari-set/600/800', category_name: 'Sets', category_section: 'Kids', store_slug: 'max-fashion', section: 'Kids', color: 'Green', sizes: '2-3Y, 4-5Y, 6-7Y', rating: 4.5, review_count: 198, is_new_arrival: true, is_active: true },
  { name: 'Formal Suit Set', brand: 'Pantaloons', price: 1999, mrp: 2999, description: 'Three-piece formal set: blazer, shirt, and trousers. Wedding-ready dapper styling.', image_url: 'https://picsum.photos/seed/formal-suit/600/800', category_name: 'Sets', category_section: 'Kids', store_slug: 'pantaloons', section: 'Kids', color: 'Navy', sizes: '3-4Y, 5-6Y, 7-8Y, 9-10Y', rating: 4.7, review_count: 67, is_new_arrival: false, is_active: true },
  { name: 'Cozy Tracksuit Set', brand: 'Zudio', price: 599, mrp: 899, description: 'Fleece-lined tracksuit with zip-up hoodie and joggers. Weekend warrior essentials.', image_url: 'https://picsum.photos/seed/tracksuit-set/600/800', category_name: 'Sets', category_section: 'Kids', store_slug: 'zudio', section: 'Kids', color: 'Grey', sizes: '2-3Y, 4-5Y, 6-7Y, 8-9Y', rating: 4.3, review_count: 345, is_new_arrival: false, is_active: true },

  // Extra products to hit 50
  { name: 'Bomber Jacket Heritage', brand: 'Wrogn', price: 2999, mrp: 4299, description: 'Quilted bomber with ribbed cuffs and hem. Satin lining with interior pocket.', image_url: 'https://picsum.photos/seed/bomber-jacket/600/800', category_name: 'Shirts', category_section: 'Men', store_slug: 'wrogn', section: 'Men', color: 'Black', sizes: 'S, M, L, XL', rating: 4.7, review_count: 89, is_new_arrival: true, is_active: true },
  { name: 'Slim Fit Henley', brand: 'Trends', price: 599, mrp: 899, description: 'Waffle-knit henley with rolled sleeves. Y-neck with three wooden buttons.', image_url: 'https://picsum.photos/seed/henley/600/800', category_name: 'T-Shirts', category_section: 'Men', store_slug: 'trends', section: 'Men', color: 'Red', sizes: 'S, M, L, XL', rating: 4.2, review_count: 234, is_new_arrival: false, is_active: true },
  { name: 'Velvet Blazer Statement', brand: 'Pantaloons', price: 3999, mrp: 5499, description: 'Rich velvet blazer with peak lapels. Festive season essential for the modern man.', image_url: 'https://picsum.photos/seed/velvet-blazer/600/800', category_name: 'Shirts', category_section: 'Men', store_slug: 'pantaloons', section: 'Men', color: 'Navy', sizes: 'S, M, L, XL', rating: 4.8, review_count: 45, is_new_arrival: true, is_active: true },
  { name: 'Wrap Skirt Midi', brand: 'Westside', price: 1599, mrp: 2299, description: 'Asymmetric wrap skirt in flowing crepe. Concealed button fastening with elegant drape.', image_url: 'https://picsum.photos/seed/wrap-skirt/600/800', category_name: 'Dresses', category_section: 'Women', store_slug: 'westside', section: 'Women', color: 'Green', sizes: 'XS, S, M, L', rating: 4.5, review_count: 134, is_new_arrival: false, is_active: true },
  { name: 'Poplin Shirt Dress', brand: 'Max Fashion', price: 1299, mrp: 1899, description: 'Crisp poplin shirt dress with waist belt. Roll-up sleeves with button tabs.', image_url: 'https://picsum.photos/seed/poplin-dress/600/800', category_name: 'Dresses', category_section: 'Women', store_slug: 'max-fashion', section: 'Women', color: 'White', sizes: 'S, M, L, XL', rating: 4.4, review_count: 189, is_new_arrival: true, is_active: true },
  { name: 'Peplum Ethnic Top', brand: 'Pantaloons', price: 999, mrp: 1499, description: 'Peplum silhouette with mirror work embroidery. Round neck with tassel tie-back.', image_url: 'https://picsum.photos/seed/peplum-top/600/800', category_name: 'Tops', category_section: 'Women', store_slug: 'pantaloons', section: 'Women', color: 'Red', sizes: 'S, M, L', rating: 4.3, review_count: 112, is_new_arrival: false, is_active: true },
  { name: 'Jogger Jean Women', brand: 'Wrogn', price: 1399, mrp: 1999, description: 'Jogger-style jeans with elastic waist and cuffed ankles. Casual Fridays perfected.', image_url: 'https://picsum.photos/seed/jogger-jean-w/600/800', category_name: 'Jeans', category_section: 'Women', store_slug: 'wrogn', section: 'Women', color: 'Grey', sizes: '26, 28, 30, 32', rating: 4.2, review_count: 256, is_new_arrival: false, is_active: true },
  { name: 'Superhero Cape Set', brand: 'Trends', price: 799, mrp: 1199, description: 'T-shirt with detachable superhero cape. Ignite imagination with every wear.', image_url: 'https://picsum.photos/seed/superhero-set/600/800', category_name: 'Sets', category_section: 'Kids', store_slug: 'trends', section: 'Kids', color: 'Red', sizes: '2-3Y, 4-5Y, 6-7Y', rating: 4.6, review_count: 298, is_new_arrival: true, is_active: true },
];

// Generate SQL
function generateSQL() {
  let sql = '-- StyleAtHome Product Seed Data\n-- Run this in Supabase SQL Editor\n\n';
  
  // Insert stores
  sql += '-- STORES\n';
  for (const s of stores) {
    sql += `INSERT INTO stores (name, slug, description, logo_url, banner_url, is_active) VALUES ('${s.name.replace(/'/g, "''")}', '${s.slug}', '${s.description.replace(/'/g, "''")}', '${s.logo_url}', '${s.banner_url}', true) ON CONFLICT (slug) DO NOTHING;\n`;
  }
  
  sql += '\n-- CATEGORIES\n';
  for (const c of categories) {
    sql += `INSERT INTO categories (name, section) VALUES ('${c.name}', '${c.section}') ON CONFLICT DO NOTHING;\n`;
  }
  
  sql += '\n-- PRODUCTS (requires stores and categories to exist first)\n';
  for (const p of products) {
    sql += `INSERT INTO products (name, brand, price, mrp, description, image_url, category_id, store_id, section, color, sizes, rating, review_count, is_new_arrival, is_active) VALUES ('${p.name.replace(/'/g, "''")}', '${p.brand}', ${p.price}, ${p.mrp}, '${p.description.replace(/'/g, "''")}', '${p.image_url}', (SELECT id FROM categories WHERE name='${p.category_name}' AND section='${p.category_section}' LIMIT 1), (SELECT id FROM stores WHERE slug='${p.store_slug}' LIMIT 1), '${p.section}', '${p.color}', '${p.sizes}', ${p.rating}, ${p.review_count}, ${p.is_new_arrival}, ${p.is_active});\n`;
  }
  
  return sql;
}

console.log(generateSQL());
console.log(`\n-- Total: ${stores.length} stores, ${categories.length} categories, ${products.length} products`);

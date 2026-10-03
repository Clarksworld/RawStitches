import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  products,
  orders,
  customers,
  categories,
  collections,
} from "../src/db/schema";

const IMG = (id: string, w = 800, h = 1000) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

const SEED_PRODUCTS = [
  {
    id: "p1",
    name: "The Onyinye Wrap Dress",
    slug: "onyinye-wrap-dress",
    price: 45000,
    salePrice: null,
    category: "Dresses",
    collection: "New Arrivals",
    images: [IMG("1539109136881-3be0616acf4b"), IMG("1485968579580-b6d095142e6e")],
    colors: ["Black", "Ivory", "Burgundy"],
    colorHex: { Black: "#0A0A0A", Ivory: "#FAF7F0", Burgundy: "#6B2737" },
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 12,
    lowStockThreshold: 5,
    rating: "4.80",
    reviewCount: 24,
    description: "An elegant wrap dress crafted with meticulous attention to detail.",
    details: ["100% premium fabric", "Wrap-around tie closure", "Side pockets", "Midi length", "Made in Nigeria"],
    care: ["Hand wash or gentle machine wash", "Cool iron on reverse", "Do not bleach", "Dry flat"],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    sku: "RS-DR-001",
  },
  {
    id: "p2",
    name: "Adaeze Peplum Top",
    slug: "adaeze-peplum-top",
    price: 22500,
    salePrice: 18000,
    category: "Tops",
    collection: "Best Sellers",
    images: [IMG("1509631179647-0177331693ae"), IMG("1515886657613-9f3515b0c78f")],
    colors: ["Black", "White", "Sage"],
    colorHex: { Black: "#0A0A0A", White: "#FFFFFF", Sage: "#7A9E7E" },
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    stock: 8,
    lowStockThreshold: 5,
    rating: "4.90",
    reviewCount: 47,
    description: "A structured peplum top that adds architectural elegance to any outfit.",
    details: ["Structured boning at waist", "Back zip closure", "Peplum hem detail", "Cropped fit"],
    care: ["Dry clean recommended", "Store on padded hanger", "Avoid direct sunlight"],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    sku: "RS-TP-001",
  },
  {
    id: "p3",
    name: "Ifunanya Two-Piece Set",
    slug: "ifunanya-two-piece",
    price: 58000,
    salePrice: null,
    category: "Two-Piece Sets",
    collection: "Best Sellers",
    images: [IMG("1583744946564-b52ac1c389c8"), IMG("1547996160-81dfa63595aa")],
    colors: ["Black", "Cobalt"],
    colorHex: { Black: "#0A0A0A", Cobalt: "#1F3A6E" },
    sizes: ["S", "M", "L", "XL"],
    stock: 4,
    lowStockThreshold: 5,
    rating: "4.70",
    reviewCount: 31,
    description: "A sophisticated co-ord set designed for the woman who commands attention.",
    details: ["Matching crop top + wide-leg trousers", "Adjustable waistband", "High-rise cut", "Power fabric blend"],
    care: ["Hand wash cold", "Air dry only", "Iron on low heat"],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    sku: "RS-TS-001",
  },
  {
    id: "p4",
    name: "Chisom Midi Skirt",
    slug: "chisom-midi-skirt",
    price: 28000,
    salePrice: null,
    category: "Skirts",
    collection: "New Arrivals",
    images: [IMG("1594938298603-c8148c4b36cd"), IMG("1529139574466-a303027c1d8b")],
    colors: ["Black", "Ivory", "Terracotta"],
    colorHex: { Black: "#0A0A0A", Ivory: "#FAF7F0", Terracotta: "#C1440E" },
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 15,
    lowStockThreshold: 5,
    rating: "4.60",
    reviewCount: 18,
    description: "A fluid midi skirt with a graceful drape.",
    details: ["Asymmetric hem", "Elastic waistband", "Midi length", "Lined"],
    care: ["Machine wash cold", "Tumble dry low", "Warm iron"],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    sku: "RS-SK-001",
  },
  {
    id: "p5",
    name: "Amara Evening Dress",
    slug: "amara-evening-dress",
    price: 75000,
    salePrice: null,
    category: "Dresses",
    collection: "Evening",
    images: [IMG("1469334031218-e382a71b716b"), IMG("1487222477894-8943e31ef7b2")],
    colors: ["Black", "Midnight Blue"],
    colorHex: { Black: "#0A0A0A", "Midnight Blue": "#0D1B2A" },
    sizes: ["XS", "S", "M", "L"],
    stock: 6,
    lowStockThreshold: 3,
    rating: "5.00",
    reviewCount: 9,
    description: "Our most elevated creation — a floor-grazing silhouette with dramatic back detail.",
    details: ["Floor-length gown", "Open back with tie detail", "Built-in bodice support", "Sweep train"],
    care: ["Dry clean only", "Store in garment bag", "Handle with care"],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    sku: "RS-DR-002",
  },
  {
    id: "p6",
    name: "Ngozi Fitted Blazer",
    slug: "ngozi-fitted-blazer",
    price: 42000,
    salePrice: 35000,
    category: "Tops",
    collection: "Power Collection",
    images: [IMG("1596609548086-85bbf8ddb6b9"), IMG("1585093277360-a2b88cae4091")],
    colors: ["Black", "Camel", "Ivory"],
    colorHex: { Black: "#0A0A0A", Camel: "#C19A6B", Ivory: "#FAF7F0" },
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 0,
    lowStockThreshold: 5,
    rating: "4.50",
    reviewCount: 22,
    description: "A tailored blazer that redefines power dressing.",
    details: ["Fully lined", "Two-button closure", "Structured shoulders", "Welt pockets"],
    care: ["Dry clean recommended", "Steam to remove wrinkles", "Store on wide hanger"],
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    sku: "RS-TP-002",
  },
  {
    id: "p7",
    name: "Ebere Coord Set",
    slug: "ebere-coord-set",
    price: 52000,
    salePrice: null,
    category: "Two-Piece Sets",
    collection: "New Arrivals",
    images: [IMG("1539109136881-3be0616acf4b"), IMG("1509631179647-0177331693ae")],
    colors: ["Black", "Dusty Rose"],
    colorHex: { Black: "#0A0A0A", "Dusty Rose": "#C49A8A" },
    sizes: ["S", "M", "L", "XL"],
    stock: 10,
    lowStockThreshold: 5,
    rating: "4.70",
    reviewCount: 15,
    description: "Understated luxury in a perfectly coordinated set.",
    details: ["Oversized blazer + straight-leg trousers", "Relaxed fit", "Single button closure"],
    care: ["Dry clean preferred", "Wash separately", "Cool iron"],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    sku: "RS-TS-002",
  },
  {
    id: "p8",
    name: "Chidinma Maxi Dress",
    slug: "chidinma-maxi-dress",
    price: 38000,
    salePrice: null,
    category: "Dresses",
    collection: "Best Sellers",
    images: [IMG("1485968579580-b6d095142e6e"), IMG("1594938298603-c8148c4b36cd")],
    colors: ["Black", "White", "Emerald"],
    colorHex: { Black: "#0A0A0A", White: "#FFFFFF", Emerald: "#155E3E" },
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    stock: 20,
    lowStockThreshold: 5,
    rating: "4.90",
    reviewCount: 56,
    description: "Our bestselling maxi dress — timeless, versatile, and endlessly elegant.",
    details: ["Floor-length", "V-neckline", "Side slit", "Adjustable spaghetti straps"],
    care: ["Machine wash gentle", "Air dry", "Low heat iron"],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    sku: "RS-DR-003",
  },
];

const SEED_CUSTOMERS = [
  { id: "c1", name: "Adaeze Okonkwo", email: "adaeze@email.com", phone: "0812 345 6789", orders: 3, spent: 142500, lastOrder: "2024-11-28", status: "active" },
  { id: "c2", name: "Chisom Eze", email: "chisom@email.com", phone: "0803 987 6543", orders: 1, spent: 76000, lastOrder: "2024-11-27", status: "active" },
  { id: "c3", name: "Ngozi Abiodun", email: "ngozi@email.com", phone: "0701 234 5678", orders: 2, spent: 155000, lastOrder: "2024-11-25", status: "active" },
  { id: "c4", name: "Ebere Nwachukwu", email: "ebere@email.com", phone: "0817 654 3210", orders: 4, spent: 218000, lastOrder: "2024-11-22", status: "active" },
  { id: "c5", name: "Amara Osei", email: "amara@email.com", phone: "0905 123 4567", orders: 1, spent: 45000, lastOrder: "2024-11-20", status: "inactive" },
];

const SEED_ORDERS = [
  {
    id: "o1",
    orderNumber: "RS-2024-0089",
    date: "2024-11-28",
    customer: { name: "Adaeze Okonkwo", email: "adaeze@email.com", phone: "0812 345 6789" },
    items: [{ productId: "p1", name: "The Onyinye Wrap Dress", image: IMG("1539109136881-3be0616acf4b"), color: "Black", size: "M", qty: 1, price: 45000 }],
    subtotal: 45000,
    deliveryFee: 3500,
    discount: 0,
    total: 48500,
    paymentStatus: "paid",
    paymentMethod: "Card",
    paymentRef: "PSK-TXN-82934A",
    deliveryStatus: "shipped",
    address: { line1: "14 Bishop Street", city: "Port Harcourt", state: "Rivers", country: "Nigeria" },
    note: "",
  },
  {
    id: "o2",
    orderNumber: "RS-2024-0088",
    date: "2024-11-27",
    customer: { name: "Chisom Eze", email: "chisom@email.com", phone: "0803 987 6543" },
    items: [
      { productId: "p3", name: "Ifunanya Two-Piece Set", image: IMG("1583744946564-b52ac1c389c8"), color: "Black", size: "S", qty: 1, price: 58000 },
      { productId: "p2", name: "Adaeze Peplum Top", image: IMG("1509631179647-0177331693ae"), color: "White", size: "S", qty: 1, price: 18000 },
    ],
    subtotal: 76000,
    deliveryFee: 5000,
    discount: 5000,
    total: 76000,
    paymentStatus: "paid",
    paymentMethod: "Bank Transfer",
    paymentRef: "FLW-TXN-49201B",
    deliveryStatus: "processing",
    address: { line1: "5 Adetokunbo Ademola Crescent", city: "Abuja", state: "FCT", country: "Nigeria" },
    note: "Please gift wrap",
  },
  {
    id: "o3",
    orderNumber: "RS-2024-0087",
    date: "2024-11-25",
    customer: { name: "Ngozi Abiodun", email: "ngozi@email.com", phone: "0701 234 5678" },
    items: [{ productId: "p5", name: "Amara Evening Dress", image: IMG("1469334031218-e382a71b716b"), color: "Black", size: "M", qty: 1, price: 75000 }],
    subtotal: 75000,
    deliveryFee: 5000,
    discount: 0,
    total: 80000,
    paymentStatus: "pending",
    paymentMethod: "Card",
    paymentRef: "",
    deliveryStatus: "pending",
    address: { line1: "23 Victoria Island Boulevard", city: "Lagos", state: "Lagos", country: "Nigeria" },
    note: "",
  },
  {
    id: "o4",
    orderNumber: "RS-2024-0086",
    date: "2024-11-22",
    customer: { name: "Ebere Nwachukwu", email: "ebere@email.com", phone: "0817 654 3210" },
    items: [{ productId: "p8", name: "Chidinma Maxi Dress", image: IMG("1485968579580-b6d095142e6e"), color: "Emerald", size: "L", qty: 2, price: 38000 }],
    subtotal: 76000,
    deliveryFee: 3500,
    discount: 0,
    total: 79500,
    paymentStatus: "paid",
    paymentMethod: "Card",
    paymentRef: "PSK-TXN-71023C",
    deliveryStatus: "delivered",
    address: { line1: "No. 8 Ikeja Close", city: "Ibadan", state: "Oyo", country: "Nigeria" },
    note: "",
  },
];

const SEED_CATEGORIES = [
  { id: "cat1", name: "Dresses", slug: "dresses", image: IMG("1539109136881-3be0616acf4b", 600, 400), count: 3, enabled: true },
  { id: "cat2", name: "Tops", slug: "tops", image: IMG("1509631179647-0177331693ae", 600, 400), count: 2, enabled: true },
  { id: "cat3", name: "Two-Piece Sets", slug: "two-piece-sets", image: IMG("1583744946564-b52ac1c389c8", 600, 400), count: 2, enabled: true },
  { id: "cat4", name: "Skirts", slug: "skirts", image: IMG("1594938298603-c8148c4b36cd", 600, 400), count: 1, enabled: true },
  { id: "cat5", name: "Evening Wear", slug: "evening-wear", image: IMG("1469334031218-e382a71b716b", 600, 400), count: 1, enabled: false },
];

const SEED_COLLECTIONS = [
  { id: "col1", name: "New Arrivals", description: "Fresh pieces just added to the collection.", image: IMG("1539109136881-3be0616acf4b", 800, 600), publishDate: "2024-11-01", status: "published" },
  { id: "col2", name: "Best Sellers", description: "Our most loved and celebrated pieces.", image: IMG("1583744946564-b52ac1c389c8", 800, 600), publishDate: "2024-10-01", status: "published" },
  { id: "col3", name: "Evening", description: "Elevated pieces for unforgettable occasions.", image: IMG("1469334031218-e382a71b716b", 800, 600), publishDate: "2024-09-15", status: "draft" },
  { id: "col4", name: "Power Collection", description: "Tailored looks for the woman who means business.", image: IMG("1596609548086-85bbf8ddb6b9", 800, 600), publishDate: "2024-11-15", status: "scheduled" },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Run: source .env.local");
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log("🌱 Seeding Raw Stitches database...\n");

  console.log("  → Products");
  await db.insert(products).values(SEED_PRODUCTS as any).onConflictDoNothing();

  console.log("  → Customers");
  await db.insert(customers).values(SEED_CUSTOMERS).onConflictDoNothing();

  console.log("  → Orders");
  await db.insert(orders).values(SEED_ORDERS as any).onConflictDoNothing();

  console.log("  → Categories");
  await db.insert(categories).values(SEED_CATEGORIES).onConflictDoNothing();

  console.log("  → Collections");
  await db.insert(collections).values(SEED_COLLECTIONS).onConflictDoNothing();

  console.log("\n✅ Seed complete!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

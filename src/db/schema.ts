import {
  pgTable,
  text,
  integer,
  numeric,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

// ─── Products ───────────────────────────────────────────────────────────────
export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  price: integer("price").notNull(),
  salePrice: integer("sale_price"),
  category: text("category").notNull(),
  collection: text("collection").notNull(),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  colors: jsonb("colors").$type<string[]>().notNull().default([]),
  colorHex: jsonb("color_hex").$type<Record<string, string>>().notNull().default({}),
  sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
  stock: integer("stock").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  description: text("description").notNull().default(""),
  details: jsonb("details").$type<string[]>().notNull().default([]),
  care: jsonb("care").$type<string[]>().notNull().default([]),
  isFeatured: boolean("is_featured").notNull().default(false),
  isNewArrival: boolean("is_new_arrival").notNull().default(false),
  isBestSeller: boolean("is_best_seller").notNull().default(false),
  sku: text("sku").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Customers ───────────────────────────────────────────────────────────────
export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  orders: integer("orders").notNull().default(0),
  spent: integer("spent").notNull().default(0),
  lastOrder: text("last_order"),
  status: text("status").notNull().default("active"),
  notes: text("notes").notNull().default(""),
  addresses: jsonb("addresses")
    .$type<
      Array<{
        line1: string;
        city: string;
        state: string;
        country: string;
        isDefault?: boolean;
      }>
    >()
    .default([]),
  measurements: jsonb("measurements")
    .$type<{
      bust?: string;
      waist?: string;
      hips?: string;
      height?: string;
      preferredSize?: string;
      customNotes?: string;
    }>()
    .default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  date: text("date").notNull(),
  customer: jsonb("customer")
    .$type<{ name: string; email: string; phone: string }>()
    .notNull(),
  items: jsonb("items")
    .$type<
      Array<{
        productId: string;
        name: string;
        image: string;
        color: string;
        size: string;
        qty: number;
        price: number;
      }>
    >()
    .notNull()
    .default([]),
  subtotal: integer("subtotal").notNull().default(0),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  discount: integer("discount").notNull().default(0),
  total: integer("total").notNull().default(0),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull().default(""),
  paymentRef: text("payment_ref").notNull().default(""),
  deliveryStatus: text("delivery_status").notNull().default("pending"),
  address: jsonb("address")
    .$type<{ line1: string; city: string; state: string; country: string }>()
    .notNull(),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Categories ───────────────────────────────────────────────────────────────
export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  image: text("image").notNull().default(""),
  count: integer("count").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
});

// ─── Collections ─────────────────────────────────────────────────────────────
export const collections = pgTable("collections", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  image: text("image").notNull().default(""),
  publishDate: text("publish_date").notNull(),
  status: text("status").notNull().default("draft"),
});

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull().default(""),
  productSlug: text("product_slug").notNull().default(""),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull().default(""),
  rating: integer("rating").notNull(),
  body: text("body").notNull(),
  // status: pending | approved | rejected
  status: text("status").notNull().default("pending"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Discounts ───────────────────────────────────────────────────────────────
export const discounts = pgTable("discounts", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull().default("percentage"), // 'percentage' | 'fixed'
  value: integer("value").notNull().default(0),
  minOrder: integer("min_order").notNull().default(0),
  maxUses: integer("max_uses"),
  uses: integer("uses").notNull().default(0),
  startDate: text("start_date"),
  endDate: text("end_date"),
  status: text("status").notNull().default("active"), // 'active' | 'scheduled' | 'expired'
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Delivery Zones ───────────────────────────────────────────────────────────
export const deliveryZones = pgTable("delivery_zones", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  fee: integer("fee").notNull().default(0),
  freeThreshold: integer("free_threshold").notNull().default(0),
  time: text("time").notNull().default("3-5 business days"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Messages / Contact Submissions ─────────────────────────────────────────
export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  subject: text("subject").notNull().default("General Enquiry"),
  message: text("message").notNull(),
  // status: unread | read | replied | archived
  status: text("status").notNull().default("unread"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Type exports ─────────────────────────────────────────────────────────────
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Discount = typeof discounts.$inferSelect;
export type NewDiscount = typeof discounts.$inferInsert;
export type DeliveryZone = typeof deliveryZones.$inferSelect;
export type NewDeliveryZone = typeof deliveryZones.$inferInsert;


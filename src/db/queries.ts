import { getDb, products as productsTable, orders as ordersTable, categories as categoriesTable, collections as collectionsTable } from "./index";
import { eq, desc } from "drizzle-orm";
import { PRODUCTS, ORDERS, CATEGORIES, COLLECTIONS, type Product, type Order } from "@/data";

/**
 * Fetch all products from Neon DB with fallback to static data
 */
export async function getProducts(options?: {
  category?: string;
  query?: string;
  filter?: string;
}): Promise<Product[]> {
  try {
    const db = getDb();
    const rows = await db.select().from(productsTable);

    if (rows && rows.length > 0) {
      let list: Product[] = rows.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        salePrice: p.salePrice,
        category: p.category,
        collection: p.collection,
        images: p.images || [],
        colors: p.colors || [],
        colorHex: p.colorHex || {},
        sizes: p.sizes || [],
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        rating: Number(p.rating),
        reviewCount: p.reviewCount,
        description: p.description,
        details: p.details || [],
        care: p.care || [],
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        isBestSeller: p.isBestSeller,
        sku: p.sku,
      }));

      if (options?.category) {
        list = list.filter(
          (p) => p.category.toLowerCase() === options.category!.toLowerCase()
        );
      }
      if (options?.query) {
        const q = options.query.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
      }
      if (options?.filter === "new") {
        list = list.filter((p) => p.isNewArrival);
      } else if (options?.filter === "bestsellers") {
        list = list.filter((p) => p.isBestSeller);
      }

      return list;
    }
  } catch (error) {
    console.warn("DB getProducts fallback to static:", error);
  }

  // Fallback to static
  let items = [...PRODUCTS];
  if (options?.category) {
    items = items.filter(
      (p) => p.category.toLowerCase() === options.category!.toLowerCase()
    );
  }
  if (options?.query) {
    const q = options.query.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }
  if (options?.filter === "new") items = items.filter((p) => p.isNewArrival);
  if (options?.filter === "bestsellers") items = items.filter((p) => p.isBestSeller);

  return items;
}

/**
 * Fetch a single product by slug from Neon DB with fallback
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, slug))
      .limit(1);

    if (rows && rows.length > 0) {
      const p = rows[0];
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        salePrice: p.salePrice,
        category: p.category,
        collection: p.collection,
        images: p.images || [],
        colors: p.colors || [],
        colorHex: p.colorHex || {},
        sizes: p.sizes || [],
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        rating: Number(p.rating),
        reviewCount: p.reviewCount,
        description: p.description,
        details: p.details || [],
        care: p.care || [],
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        isBestSeller: p.isBestSeller,
        sku: p.sku,
      };
    }
  } catch (error) {
    console.warn(`DB getProductBySlug(${slug}) fallback:`, error);
  }

  return PRODUCTS.find((p) => p.slug === slug) ?? null;
}

/**
 * Fetch an order by orderNumber from Neon DB with fallback
 */
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.orderNumber, orderNumber))
      .limit(1);

    if (rows && rows.length > 0) {
      const o = rows[0];
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        date: o.date,
        customer: o.customer,
        items: o.items as any,
        subtotal: o.subtotal,
        deliveryFee: o.deliveryFee,
        discount: o.discount,
        total: o.total,
        paymentStatus: o.paymentStatus as any,
        paymentMethod: o.paymentMethod,
        paymentRef: o.paymentRef,
        deliveryStatus: o.deliveryStatus as any,
        address: o.address,
        note: o.note,
      };
    }
  } catch (error) {
    console.warn(`DB getOrderByNumber(${orderNumber}) fallback:`, error);
  }

  return ORDERS.find((o) => o.orderNumber === orderNumber) ?? null;
}

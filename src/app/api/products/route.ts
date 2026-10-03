import { NextResponse, type NextRequest } from "next/server";
import { getDb, products as productsTable } from "@/db";
import { PRODUCTS } from "@/data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const query = searchParams.get("q");
  const filter = searchParams.get("filter");

  let allProducts: any[] = [];

  try {
    const db = getDb();
    const rows = await db.select().from(productsTable);
    if (rows && rows.length > 0) {
      allProducts = rows.map((p) => ({
        ...p,
        rating: Number(p.rating),
      }));
    } else {
      allProducts = [...PRODUCTS];
    }
  } catch (error) {
    console.error("Failed to query products from DB, falling back to static:", error);
    allProducts = [...PRODUCTS];
  }

  let results = allProducts;

  if (category) {
    results = results.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (filter === "new") {
    results = results.filter((p) => p.isNewArrival);
  } else if (filter === "bestsellers") {
    results = results.filter((p) => p.isBestSeller);
  }

  return NextResponse.json({
    count: results.length,
    products: results,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const newProduct = {
      id: body.id || `p_${Date.now()}`,
      name: body.name,
      slug,
      price: Number(body.price) || 0,
      salePrice: body.salePrice ? Number(body.salePrice) : null,
      category: body.category || "Dresses",
      collection: body.collection || "New Arrivals",
      images: body.images || [],
      colors: body.colors || ["Black"],
      colorHex: body.colorHex || { Black: "#000000" },
      sizes: body.sizes || ["S", "M", "L"],
      stock: Number(body.stock) || 0,
      lowStockThreshold: Number(body.lowStockThreshold) || 5,
      rating: "5.00",
      reviewCount: 0,
      description: body.description || "",
      details: body.details || [],
      care: body.care || [],
      isFeatured: Boolean(body.isFeatured),
      isNewArrival: Boolean(body.isNewArrival),
      isBestSeller: Boolean(body.isBestSeller),
      sku: body.sku || `RS-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    await db.insert(productsTable).values(newProduct as any);

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to insert product into DB:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    const db = getDb();
    const { eq } = await import("drizzle-orm");
    await db.delete(productsTable).where(eq(productsTable.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete product from DB:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}


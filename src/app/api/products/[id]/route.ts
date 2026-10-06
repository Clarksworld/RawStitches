import { NextResponse, type NextRequest } from "next/server";
import { getDb, products as productsTable } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/products/[id] — fetch single product by id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .limit(1);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const p = rows[0];
    return NextResponse.json({
      product: { ...p, rating: Number(p.rating) },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] — full update
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    const slug =
      body.slug ||
      (body.name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const db = getDb();

    const updated = {
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
      description: body.description || "",
      details: body.details || [],
      care: body.care || [],
      isFeatured: Boolean(body.isFeatured),
      isNewArrival: Boolean(body.isNewArrival),
      isBestSeller: Boolean(body.isBestSeller),
      sku: body.sku,
      updatedAt: new Date(),
    };

    await db
      .update(productsTable)
      .set(updated as any)
      .where(eq(productsTable.id, id));

    return NextResponse.json({ success: true, product: { id, ...updated } });
  } catch (error: any) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id] — partial update (e.g. stock adjustment)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const db = getDb();

    const patch: Record<string, any> = { updatedAt: new Date() };

    if (body.stock !== undefined) patch.stock = Number(body.stock);
    if (body.isFeatured !== undefined) patch.isFeatured = Boolean(body.isFeatured);
    if (body.isNewArrival !== undefined) patch.isNewArrival = Boolean(body.isNewArrival);
    if (body.isBestSeller !== undefined) patch.isBestSeller = Boolean(body.isBestSeller);
    if (body.price !== undefined) patch.price = Number(body.price);
    if (body.salePrice !== undefined) patch.salePrice = body.salePrice ? Number(body.salePrice) : null;

    await db
      .update(productsTable)
      .set(patch)
      .where(eq(productsTable.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to patch product:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] — delete single product
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
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

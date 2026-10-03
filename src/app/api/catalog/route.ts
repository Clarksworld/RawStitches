import { NextResponse, type NextRequest } from "next/server";
import { getDb, categories as categoriesTable, collections as collectionsTable } from "@/db";
import { CATEGORIES, COLLECTIONS } from "@/data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "categories"; // "categories" | "collections"

  try {
    const db = getDb();

    if (type === "collections") {
      const rows = await db.select().from(collectionsTable);
      if (rows && rows.length > 0) {
        return NextResponse.json({ count: rows.length, collections: rows });
      }
      return NextResponse.json({ count: COLLECTIONS.length, collections: COLLECTIONS });
    }

    // Default: categories
    const rows = await db.select().from(categoriesTable);
    if (rows && rows.length > 0) {
      return NextResponse.json({ count: rows.length, categories: rows });
    }
    return NextResponse.json({ count: CATEGORIES.length, categories: CATEGORIES });
  } catch (error) {
    console.error("Failed to query catalog:", error);
    if (type === "collections") {
      return NextResponse.json({ count: COLLECTIONS.length, collections: COLLECTIONS });
    }
    return NextResponse.json({ count: CATEGORIES.length, categories: CATEGORIES });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "categories";
    const body = await request.json();
    const db = getDb();

    if (type === "collections") {
      const newCol = {
        id: body.id || `col_${Date.now()}`,
        name: body.name,
        description: body.description || "",
        image: body.image || "",
        publishDate: body.publishDate || new Date().toISOString().split("T")[0],
        status: body.status || "draft",
      };
      await db.insert(collectionsTable).values(newCol);
      return NextResponse.json({ success: true, collection: newCol }, { status: 201 });
    }

    const newCat = {
      id: body.id || `cat_${Date.now()}`,
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
      image: body.image || "",
      count: Number(body.count) || 0,
      enabled: body.enabled !== undefined ? Boolean(body.enabled) : true,
    };
    await db.insert(categoriesTable).values(newCat);
    return NextResponse.json({ success: true, category: newCat }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to insert catalog item:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create catalog item" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "categories";
    const body = await request.json();
    const db = getDb();

    if (!body.id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    if (type === "collections") {
      const updates: any = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.description !== undefined) updates.description = body.description;
      if (body.status !== undefined) updates.status = body.status;
      if (body.image !== undefined) updates.image = body.image;
      if (body.publishDate !== undefined) updates.publishDate = body.publishDate;

      const { eq } = await import("drizzle-orm");
      await db.update(collectionsTable).set(updates).where(eq(collectionsTable.id, body.id));
      return NextResponse.json({ success: true });
    }

    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.image !== undefined) updates.image = body.image;
    if (body.enabled !== undefined) updates.enabled = Boolean(body.enabled);

    const { eq } = await import("drizzle-orm");
    await db.update(categoriesTable).set(updates).where(eq(categoriesTable.id, body.id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update catalog item:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "categories";
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const db = getDb();
    const { eq } = await import("drizzle-orm");

    if (type === "collections") {
      await db.delete(collectionsTable).where(eq(collectionsTable.id, id));
    } else {
      await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete catalog item:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete item" },
      { status: 500 }
    );
  }
}

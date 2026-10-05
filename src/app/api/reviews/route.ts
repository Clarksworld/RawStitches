import { NextResponse, type NextRequest } from "next/server";
import { getDb, reviews as reviewsTable, products as productsTable } from "@/db";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/reviews?productId=xxx&status=approved
 * Returns reviews, optionally filtered by productId and/or status.
 *
 * POST /api/reviews
 * Submits a new review (status defaults to "pending" — awaits admin approval).
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const status = searchParams.get("status"); // "pending" | "approved" | "rejected" | null = all
    const featured = searchParams.get("featured"); // "true" to only return featured

    const db = getDb();
    let rows = await db
      .select()
      .from(reviewsTable)
      .orderBy(desc((reviewsTable as any).createdAt));

    if (productId) {
      rows = rows.filter((r: any) => r.productId === productId);
    }
    if (status) {
      rows = rows.filter((r: any) => r.status === status);
    }
    if (featured === "true") {
      rows = rows.filter((r: any) => r.featured === true);
    }

    return NextResponse.json({ count: rows.length, reviews: rows });
  } catch (error: any) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, productName, productSlug, customerName, customerEmail, rating, body: reviewBody } = body;

    if (!productId || !customerName || !rating || !reviewBody) {
      return NextResponse.json(
        { error: "Missing required fields: productId, customerName, rating, body" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const db = getDb();
    const newReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      productId,
      productName: productName || "",
      productSlug: productSlug || "",
      customerName,
      customerEmail: customerEmail || "",
      rating: Number(rating),
      body: reviewBody,
      status: "pending",
      featured: false,
    };

    await db.insert(reviewsTable as any).values(newReview);

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to submit review:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}

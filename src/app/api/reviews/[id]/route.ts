import { NextResponse, type NextRequest } from "next/server";
import { getDb, reviews as reviewsTable, products as productsTable } from "@/db";
import { eq, avg, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/reviews/[id]
 * Body: { action: "approve" | "reject" | "feature" | "unfeature" }
 * On "approve": recalculates the product's average rating and reviewCount.
 *
 * DELETE /api/reviews/[id]
 * Permanently removes the review.
 */

async function recalculateProductRating(db: any, productId: string) {
  try {
    // Get all approved reviews for this product
    const approvedReviews = await db
      .select()
      .from(reviewsTable)
      .where(eq((reviewsTable as any).productId, productId));

    const approved = approvedReviews.filter((r: any) => r.status === "approved");
    const reviewCount = approved.length;
    const avgRating =
      reviewCount > 0
        ? (approved.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount).toFixed(2)
        : "0";

    await db
      .update(productsTable)
      .set({ rating: avgRating, reviewCount })
      .where(eq(productsTable.id, productId));
  } catch (err) {
    console.error("Failed to recalculate product rating:", err);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body; // "approve" | "reject" | "feature" | "unfeature"

    const db = getDb();

    // Fetch existing review
    const [review] = await db
      .select()
      .from(reviewsTable)
      .where(eq((reviewsTable as any).id, id))
      .limit(1);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    let update: Record<string, any> = {};

    switch (action) {
      case "approve":
        update = { status: "approved" };
        break;
      case "reject":
        update = { status: "rejected" };
        break;
      case "feature":
        update = { featured: true };
        break;
      case "unfeature":
        update = { featured: false };
        break;
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    await db
      .update(reviewsTable)
      .set(update)
      .where(eq((reviewsTable as any).id, id));

    // If approving or rejecting, recalculate the product's star rating
    if (action === "approve" || action === "reject") {
      const targetProductId = (review as any).productId;
      await recalculateProductRating(db, targetProductId);
    }

    return NextResponse.json({ success: true, id, action });
  } catch (error: any) {
    console.error("Failed to update review:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const [review] = await db
      .select()
      .from(reviewsTable)
      .where(eq((reviewsTable as any).id, id))
      .limit(1);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    await db.delete(reviewsTable).where(eq((reviewsTable as any).id, id));

    // Recalculate rating after deletion
    await recalculateProductRating(db, (review as any).productId);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Failed to delete review:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete review" },
      { status: 500 }
    );
  }
}

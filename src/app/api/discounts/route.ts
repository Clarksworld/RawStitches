import { NextResponse, type NextRequest } from "next/server";
import { getDb, discounts as discountsTable } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(discountsTable).orderBy(discountsTable.createdAt);
    return NextResponse.json({ count: rows.length, discounts: rows });
  } catch (error: any) {
    console.error("Failed to fetch discounts:", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    if (!body.code) return NextResponse.json({ error: "Code is required" }, { status: 400 });

    // Auto-compute status based on dates
    const today = new Date().toISOString().split("T")[0];
    let status = "active";
    if (body.startDate && body.startDate > today) status = "scheduled";
    else if (body.endDate && body.endDate < today) status = "expired";

    const newDiscount = {
      id: `d_${Date.now()}`,
      code: String(body.code).toUpperCase().trim(),
      type: body.type || "percentage",
      value: Number(body.value) || 0,
      minOrder: Number(body.minOrder || body.min_order) || 0,
      maxUses: body.maxUses || body.max_uses ? Number(body.maxUses || body.max_uses) : null,
      uses: 0,
      startDate: body.startDate || body.start_date || null,
      endDate: body.endDate || body.end_date || null,
      status,
    };

    await db.insert(discountsTable).values(newDiscount as any);
    return NextResponse.json({ success: true, discount: newDiscount }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create discount:", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();
    if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const allowed = ["code", "type", "value", "minOrder", "maxUses", "startDate", "endDate", "status"];
    const updates: Record<string, any> = {};
    for (const k of allowed) if (body[k] !== undefined) updates[k] = body[k];

    // Auto re-compute status if dates changed
    if (updates.startDate || updates.endDate) {
      const today = new Date().toISOString().split("T")[0];
      const start = updates.startDate || body.existingStartDate;
      const end = updates.endDate || body.existingEndDate;
      if (start && start > today) updates.status = "scheduled";
      else if (end && end < today) updates.status = "expired";
      else updates.status = "active";
    }

    await db.update(discountsTable).set(updates).where(eq(discountsTable.id, body.id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update discount:", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const db = getDb();
    await db.delete(discountsTable).where(eq(discountsTable.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete discount:", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

// Validate a promo code at checkout (called by frontend)
export async function PUT(request: NextRequest) {
  try {
    const { code, orderTotal } = await request.json();
    if (!code) return NextResponse.json({ valid: false, error: "No code provided" });

    const db = getDb();
    const rows = await db
      .select()
      .from(discountsTable)
      .where(eq(discountsTable.code, String(code).toUpperCase().trim()))
      .limit(1);

    if (!rows.length) return NextResponse.json({ valid: false, error: "Invalid coupon code" });

    const discount = rows[0];

    if (discount.status === "expired") return NextResponse.json({ valid: false, error: "This code has expired" });
    if (discount.status === "scheduled") return NextResponse.json({ valid: false, error: "This code is not yet active" });
    if (discount.maxUses && discount.uses >= discount.maxUses)
      return NextResponse.json({ valid: false, error: "This code has reached its usage limit" });
    if (discount.minOrder && orderTotal < discount.minOrder)
      return NextResponse.json({
        valid: false,
        error: `Minimum order for this code is ₦${discount.minOrder.toLocaleString()}`,
      });

    return NextResponse.json({
      valid: true,
      code: discount.code,
      type: discount.type,
      value: discount.value,
    });
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error?.message }, { status: 500 });
  }
}

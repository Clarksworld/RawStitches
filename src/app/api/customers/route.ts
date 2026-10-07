import { NextResponse, type NextRequest } from "next/server";
import { getDb, customers as customersTable } from "@/db";
import { CUSTOMERS } from "@/data";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(customersTable)
      .orderBy(desc(customersTable.createdAt));

    if (rows && rows.length > 0) {
      return NextResponse.json({ count: rows.length, customers: rows });
    }

    // Fallback to static
    return NextResponse.json({ count: CUSTOMERS.length, customers: CUSTOMERS });
  } catch (error) {
    console.error("Failed to query customers:", error);
    return NextResponse.json({ count: CUSTOMERS.length, customers: CUSTOMERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    const email = String(body.email || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // Check if customer already exists
    const existing = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.email, email))
      .limit(1);

    if (existing.length > 0) {
      const current = existing[0];
      const updates: Record<string, any> = {};
      if (body.name && (!current.name || current.name === email.split("@")[0])) {
        updates.name = body.name;
      }
      if (body.phone && !current.phone) {
        updates.phone = body.phone;
      }
      if (Object.keys(updates).length > 0) {
        await db.update(customersTable).set(updates).where(eq(customersTable.id, current.id));
      }
      return NextResponse.json({ success: true, customer: { ...current, ...updates } }, { status: 200 });
    }

    const newCustomer = {
      id: body.id || `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: body.name || email.split("@")[0],
      email,
      phone: body.phone || "",
      orders: 0,
      spent: 0,
      lastOrder: null,
      status: "active",
    };

    await db.insert(customersTable).values(newCustomer);
    return NextResponse.json({ success: true, customer: newCustomer }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create customer:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create customer" },
      { status: 500 }
    );
  }
}

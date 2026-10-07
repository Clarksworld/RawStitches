import { NextResponse, type NextRequest } from "next/server";
import { getDb, customers as customersTable, orders as ordersTable } from "@/db";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const db = getDb();

    // Query customer by ID or email
    const rows = await db
      .select()
      .from(customersTable)
      .where(or(eq(customersTable.id, id), eq(customersTable.email, id.toLowerCase())))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const customer = rows[0];

    // Also get their orders
    const customerOrders = await db
      .select()
      .from(ordersTable);

    const filteredOrders = customerOrders.filter(
      (o) => o.customer && o.customer.email.toLowerCase() === customer.email.toLowerCase()
    );

    return NextResponse.json({ customer, orders: filteredOrders });
  } catch (error: any) {
    console.error("Failed to fetch customer:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch customer" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json();
    const db = getDb();

    const allowedFields = [
      "name",
      "phone",
      "whatsapp",
      "status",
      "notes",
      "addresses",
      "measurements",
    ];

    const updates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await db
      .update(customersTable)
      .set(updates)
      .where(or(eq(customersTable.id, id), eq(customersTable.email, id.toLowerCase())));

    return NextResponse.json({ success: true, updates });
  } catch (error: any) {
    console.error("Failed to update customer:", error);
    return NextResponse.json({ error: error?.message || "Failed to update customer" }, { status: 500 });
  }
}

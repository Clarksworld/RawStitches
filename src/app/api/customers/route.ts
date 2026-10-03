import { NextResponse, type NextRequest } from "next/server";
import { getDb, customers as customersTable } from "@/db";
import { CUSTOMERS } from "@/data";
import { desc } from "drizzle-orm";

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

    const newCustomer = {
      id: body.id || `c_${Date.now()}`,
      name: body.name,
      email: body.email,
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

import { NextResponse, type NextRequest } from "next/server";
import { getDb, orders as ordersTable, customers as customersTable } from "@/db";
import { ORDERS } from "@/data";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const rows = await db.select().from(ordersTable);
    return NextResponse.json({
      count: rows.length,
      orders: rows,
    });
  } catch (error) {
    console.error("Failed to query orders from DB, fallback to static:", error);
    return NextResponse.json({
      count: ORDERS.length,
      orders: ORDERS,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    const newOrder = {
      id: body.id || `o_${Date.now()}`,
      orderNumber: body.orderNumber || `RS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split("T")[0],
      customer: body.customer,
      items: body.items || [],
      subtotal: body.subtotal || 0,
      deliveryFee: body.deliveryFee || 0,
      discount: body.discount || 0,
      total: body.total || 0,
      paymentStatus: body.paymentStatus || "pending",
      paymentMethod: body.paymentMethod || "Card",
      paymentRef: body.paymentRef || "",
      deliveryStatus: body.deliveryStatus || "pending",
      address: body.address,
      note: body.note || "",
    };

    await db.insert(ordersTable).values(newOrder as any);

    // Automatically sync / upsert customer in the customers table
    if (body.customer?.email) {
      try {
        const customerEmail = String(body.customer.email).trim().toLowerCase();
        const existing = await db
          .select()
          .from(customersTable)
          .where(eq(customersTable.email, customerEmail))
          .limit(1);

        if (existing.length > 0) {
          const current = existing[0];
          await db
            .update(customersTable)
            .set({
              orders: (current.orders || 0) + 1,
              spent: (current.spent || 0) + (newOrder.total || 0),
              lastOrder: newOrder.date,
              phone: body.customer.phone || current.phone || "",
              name: current.name && current.name !== customerEmail.split("@")[0] ? current.name : (body.customer.name || current.name),
            })
            .where(eq(customersTable.email, customerEmail));
        } else {
          await db.insert(customersTable).values({
            id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            name: body.customer.name || customerEmail.split("@")[0],
            email: customerEmail,
            phone: body.customer.phone || "",
            orders: 1,
            spent: newOrder.total || 0,
            lastOrder: newOrder.date,
            status: "active",
          });
        }
      } catch (custErr) {
        console.error("Auto customer upsert error on order placement:", custErr);
      }
    }

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error("Order creation failed:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

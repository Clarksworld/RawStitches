import { NextResponse, type NextRequest } from "next/server";
import { getDb, orders as ordersTable } from "@/db";
import { ORDERS } from "@/data";

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

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error("Order creation failed:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

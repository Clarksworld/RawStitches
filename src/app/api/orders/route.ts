import { NextResponse, type NextRequest } from "next/server";
import { getDb, orders as ordersTable, customers as customersTable } from "@/db";
import { ORDERS } from "@/data";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim().toLowerCase();
    const phone = searchParams.get("phone")?.trim();

    const db = getDb();
    const rows = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt));

    let filtered = rows;
    if (email) {
      filtered = filtered.filter(
        (o) => o.customer?.email?.toLowerCase() === email
      );
    } else if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      filtered = filtered.filter((o) => {
        const p = (o.customer?.phone || "").replace(/[^0-9]/g, "");
        return p && (p.includes(cleanPhone) || cleanPhone.includes(p));
      });
    }

    return NextResponse.json({
      count: filtered.length,
      orders: filtered,
    });
  } catch (error) {
    console.error("Failed to query orders from DB, fallback to static:", error);
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim().toLowerCase();
    let sorted = [...ORDERS].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (email) {
      sorted = sorted.filter(
        (o) => o.customer?.email?.toLowerCase() === email
      );
    }
    return NextResponse.json({
      count: sorted.length,
      orders: sorted,
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
        const orderAddr = body.address && body.address.line1 ? {
          line1: String(body.address.line1),
          city: String(body.address.city || ""),
          state: String(body.address.state || ""),
          country: String(body.address.country || "Nigeria"),
          isDefault: true,
        } : null;

        const existing = await db
          .select()
          .from(customersTable)
          .where(eq(customersTable.email, customerEmail))
          .limit(1);

        if (existing.length > 0) {
          const current = existing[0];
          const existingAddrs = Array.isArray(current.addresses) ? current.addresses : [];
          const addressAlreadyExists = orderAddr && existingAddrs.some(
            (a: any) => a && a.line1 && a.line1.toLowerCase() === orderAddr.line1.toLowerCase()
          );
          const updatedAddresses = orderAddr && !addressAlreadyExists ? [orderAddr, ...existingAddrs] : existingAddrs;

          await db
            .update(customersTable)
            .set({
              orders: (current.orders || 0) + 1,
              spent: (current.spent || 0) + (newOrder.total || 0),
              lastOrder: newOrder.date,
              phone: body.customer.phone || current.phone || "",
              whatsapp: body.whatsapp || current.whatsapp || "",
              name: current.name && current.name !== customerEmail.split("@")[0] ? current.name : (body.customer.name || current.name),
              addresses: updatedAddresses as any,
            })
            .where(eq(customersTable.email, customerEmail));
        } else {
          await db.insert(customersTable).values({
            id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            name: body.customer.name || customerEmail.split("@")[0],
            email: customerEmail,
            phone: body.customer.phone || "",
            whatsapp: body.whatsapp || "",
            orders: 1,
            spent: newOrder.total || 0,
            lastOrder: newOrder.date,
            status: "active",
            addresses: orderAddr ? [orderAddr] : ([] as any),
            notes: body.note ? `Checkout Note: ${body.note}` : "",
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

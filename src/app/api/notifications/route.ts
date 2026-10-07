import { NextResponse, type NextRequest } from "next/server";
import { getDb, orders as ordersTable } from "@/db";
import { eq } from "drizzle-orm";
import { sendOrderStatusEmail, buildWhatsAppMessage } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, newStatus, adminNote, channel } = body;

    if (!orderNumber || !newStatus) {
      return NextResponse.json({ error: "orderNumber and newStatus required" }, { status: 400 });
    }

    const db = getDb();

    // Fetch the order from DB
    const rows = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.orderNumber, orderNumber))
      .limit(1);

    if (!rows.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = rows[0];
    const customer = order.customer as { name: string; email: string; phone: string };
    const items = (order.items as any[]) || [];

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://rawstitches.vercel.app";
    const trackingUrl = `${baseUrl}/track/${orderNumber}`;

    const results: Record<string, any> = {};

    // ─── Email notification ───────────────────────────────────────────────────
    if (!channel || channel === "email" || channel === "both") {
      const emailResult = await sendOrderStatusEmail({
        to: customer.email,
        customerName: customer.name,
        orderNumber,
        status: newStatus,
        items: items.map((i: any) => ({
          name: i.name,
          qty: i.qty,
          price: i.price,
          size: i.size,
          color: i.color,
        })),
        total: order.total,
        trackingUrl,
        adminNote,
      });
      results.email = emailResult;
    }

    // ─── WhatsApp message (return the text for admin to send) ─────────────────
    if (!channel || channel === "whatsapp" || channel === "both") {
      const waMessage = buildWhatsAppMessage({
        customerName: customer.name,
        orderNumber,
        status: newStatus,
        total: order.total,
        trackingUrl,
        adminNote,
      });

      // Build WhatsApp link (wa.me with pre-filled message)
      const phone = customer.phone
        ? customer.phone.replace(/[^0-9]/g, "").replace(/^0/, "234")
        : "";
      const waLink = phone
        ? `https://wa.me/${phone}?text=${encodeURIComponent(waMessage)}`
        : null;

      results.whatsapp = { message: waMessage, link: waLink };
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      status: newStatus,
      customer: customer.name,
      customerEmail: customer.email,
      results,
    });
  } catch (error: any) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send notification" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getDb, orders as ordersTable, products as productsTable, customers as customersTable } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();

    const [ordersRows, productsRows, customersRows] = await Promise.all([
      db.select().from(ordersTable),
      db.select().from(productsTable),
      db.select().from(customersTable),
    ]);

    const totalRevenue = ordersRows
      .filter((o) => o.paymentStatus === "paid")
      .reduce((s, o) => s + o.total, 0);

    const pendingOrders = ordersRows.filter((o) => o.deliveryStatus === "pending").length;
    const paidOrders = ordersRows.filter((o) => o.paymentStatus === "paid").length;
    const lowStock = productsRows.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);
    const outOfStock = productsRows.filter((p) => p.stock === 0);

    // Build a 7-day revenue summary from real order dates
    const now = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    const salesData = days.map((day) => {
      const dayOrders = ordersRows.filter(
        (o) => o.date === day && o.paymentStatus === "paid"
      );
      return {
        day: new Date(day).toLocaleDateString("en", { weekday: "short" }),
        date: day,
        sales: dayOrders.reduce((s, o) => s + o.total, 0),
        orders: dayOrders.length,
      };
    });

    // Recent orders (last 5)
    const recentOrders = [...ordersRows]
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
      .slice(0, 5);

    return NextResponse.json({
      totalRevenue,
      totalOrders: ordersRows.length,
      pendingOrders,
      paidOrders,
      totalProducts: productsRows.length,
      totalCustomers: customersRows.length,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      lowStock: lowStock.slice(0, 5),
      outOfStock: outOfStock.slice(0, 5),
      salesData,
      recentOrders,
    });
  } catch (error: any) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load analytics" },
      { status: 500 }
    );
  }
}

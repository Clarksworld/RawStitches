import { NextResponse } from "next/server";
import { getDb, products as productsTable } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbStatus = "unconnected";
  let productCount = 0;

  try {
    const db = getDb();
    const countRes = await db.select({ id: productsTable.id }).from(productsTable);
    dbStatus = "connected";
    productCount = countRes.length;
  } catch (err: any) {
    dbStatus = `error: ${err?.message || "unknown"}`;
  }

  return NextResponse.json({
    status: dbStatus === "connected" ? "ok" : "degraded",
    service: "Raw Stitches Next.js API",
    database: {
      status: dbStatus,
      provider: "Neon Postgres",
      branch: process.env.NEON_BRANCH || "production",
      productCount,
    },
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
}

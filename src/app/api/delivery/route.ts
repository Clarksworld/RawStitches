import { NextResponse, type NextRequest } from "next/server";
import { getDb, deliveryZones as zonesTable } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(zonesTable).orderBy(zonesTable.createdAt);
    return NextResponse.json({ count: rows.length, zones: rows });
  } catch (error: any) {
    console.error("Failed to fetch delivery zones:", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    if (!body.name) return NextResponse.json({ error: "Zone name is required" }, { status: 400 });

    const newZone = {
      id: `z_${Date.now()}`,
      name: String(body.name).trim(),
      fee: Number(body.fee) || 0,
      freeThreshold: Number(body.freeThreshold || body.free_threshold) || 0,
      time: body.time || "3-5 business days",
      active: body.active !== false,
    };

    await db.insert(zonesTable).values(newZone);
    return NextResponse.json({ success: true, zone: newZone }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create delivery zone:", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();
    if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const allowed = ["name", "fee", "freeThreshold", "time", "active"];
    const updates: Record<string, any> = {};
    for (const k of allowed) if (body[k] !== undefined) updates[k] = body[k];

    await db.update(zonesTable).set(updates).where(eq(zonesTable.id, body.id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update delivery zone:", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const db = getDb();
    await db.delete(zonesTable).where(eq(zonesTable.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete delivery zone:", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

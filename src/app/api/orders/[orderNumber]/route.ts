import { NextResponse, type NextRequest } from "next/server";
import { getOrderByNumber } from "@/db/queries";
import { getDb, orders as ordersTable } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderNumber: string }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const { orderNumber } = await params;
  try {
    const body = await request.json();
    const db = getDb();

    const updateFields: Record<string, any> = {};
    if (body.deliveryStatus !== undefined) updateFields.deliveryStatus = body.deliveryStatus;
    if (body.paymentStatus !== undefined) updateFields.paymentStatus = body.paymentStatus;
    if (body.note !== undefined) updateFields.note = body.note;
    if (body.paymentRef !== undefined) updateFields.paymentRef = body.paymentRef;
    updateFields.updatedAt = new Date();

    await db
      .update(ordersTable)
      .set(updateFields)
      .where(eq(ordersTable.orderNumber, orderNumber));

    const updated = await getOrderByNumber(orderNumber);
    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error(`Failed to update order ${orderNumber}:`, error);
    return NextResponse.json(
      { error: error?.message || "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const { orderNumber } = await params;
  try {
    const db = getDb();
    await db
      .delete(ordersTable)
      .where(eq(ordersTable.orderNumber, orderNumber));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Failed to delete order ${orderNumber}:`, error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete order" },
      { status: 500 }
    );
  }
}

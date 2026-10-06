import { NextResponse, type NextRequest } from "next/server";
import { getDb, messages as messagesTable } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// PATCH /api/contact/[id] — Update message status (read, unread, replied, archived)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["unread", "read", "replied", "archived"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const db = getDb();
    await db
      .update(messagesTable)
      .set({ status })
      .where(eq(messagesTable.id, id));

    return NextResponse.json({ success: true, id, status });
  } catch (error: any) {
    console.error("Failed to update message status:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update message" },
      { status: 500 }
    );
  }
}

// DELETE /api/contact/[id] — Permanently delete a message
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    await db.delete(messagesTable).where(eq(messagesTable.id, id));

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Failed to delete message:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete message" },
      { status: 500 }
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { getDb, messages as messagesTable } from "@/db";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/contact — Fetch all contact messages with unread counts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    const db = getDb();

    let query = db.select().from(messagesTable).orderBy(desc(messagesTable.createdAt));
    const allMessages = await query;

    const unreadCount = allMessages.filter((m) => m.status === "unread").length;

    let filtered = allMessages;
    if (statusFilter && statusFilter !== "all") {
      filtered = allMessages.filter((m) => m.status === statusFilter);
    }

    return NextResponse.json({
      messages: filtered,
      total: allMessages.length,
      unreadCount,
    });
  } catch (error: any) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch contact messages" },
      { status: 500 }
    );
  }
}

// POST /api/contact — Submit a customer contact message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const db = getDb();

    const newMsg = {
      id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      subject: subject?.trim() || "General Enquiry",
      message: message.trim(),
      status: "unread",
      createdAt: new Date(),
    };

    await db.insert(messagesTable).values(newMsg);

    return NextResponse.json({
      success: true,
      message: "Message received. Our team will contact you shortly.",
      data: newMsg,
    });
  } catch (error: any) {
    console.error("Failed to submit contact message:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit message" },
      { status: 500 }
    );
  }
}

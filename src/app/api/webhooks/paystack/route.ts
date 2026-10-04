import { NextResponse, type NextRequest } from "next/server";
import { getDb, orders as ordersTable } from "@/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/paystack
 *
 * Paystack sends signed webhook events to this endpoint for async payment events:
 * - charge.success        → card/bank payment confirmed
 * - transfer.success      → bank transfer credited
 * - transfer.failed       → transfer failed
 * - charge.dispute.create → chargeback opened
 *
 * Setup: In your Paystack dashboard (Test) → Settings → API Keys & Webhooks,
 * set the Test Webhook URL to: https://your-vercel-domain.vercel.app/api/webhooks/paystack
 *
 * Paystack signs webhook payloads using your SECRET KEY (sk_test_/sk_live_) via HMAC SHA512.
 * No separate webhook secret is needed — we verify using PAYSTACK_SECRET_KEY.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");
    // Paystack signs webhooks using your secret key (sk_test_ / sk_live_) via HMAC SHA512
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY not set — cannot verify webhook signature");
      return NextResponse.json({ error: "Gateway not configured" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const expectedSig = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSig) {
      console.warn("Paystack webhook: signature mismatch — possible spoofed request");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const { event: eventType, data } = event;

    console.log(`Paystack webhook received: ${eventType}`, data?.reference);

    const db = getDb();

    switch (eventType) {
      case "charge.success": {
        // Card or bank transfer payment confirmed by Paystack
        const reference = data?.reference;
        if (!reference) break;

        // Find the order by payment reference and mark as paid
        const [matched] = await db
          .select()
          .from(ordersTable)
          .where(eq((ordersTable as any).paymentRef, reference))
          .limit(1);

        if (matched) {
          await db
            .update(ordersTable)
            .set({ paymentStatus: "paid" } as any)
            .where(eq((ordersTable as any).paymentRef, reference));

          console.log(`Order ${matched.orderNumber} marked as paid via webhook`);
        } else {
          console.warn(`Webhook: no order found for reference ${reference}`);
        }
        break;
      }

      case "transfer.success": {
        // Payout / bank transfer to customer succeeded (refund flow)
        console.log("Transfer success:", data?.reference);
        break;
      }

      case "transfer.failed":
      case "transfer.reversed": {
        console.warn(`Transfer ${eventType}:`, data?.reference);
        break;
      }

      case "charge.dispute.create": {
        // Chargeback opened — log for admin review
        console.warn("Chargeback opened:", data?.reference, data?.customer?.email);
        break;
      }

      default:
        console.log(`Unhandled Paystack event: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Paystack webhook error:", error);
    // Return 200 anyway so Paystack doesn't retry endlessly
    return NextResponse.json({ received: true });
  }
}

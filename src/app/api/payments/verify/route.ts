import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/verify
 * Body: { reference: string }
 *
 * Calls Paystack's server-side verify endpoint using the secret key.
 * Returns { verified: true, amount, currency, status } on success.
 * This must be called from the browser after the Paystack popup callback fires
 * so we can confirm the transaction is genuine before saving the order.
 */
export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { verified: false, error: "Missing payment reference" },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is not set");
      return NextResponse.json(
        { verified: false, error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok || !data.status) {
      return NextResponse.json(
        { verified: false, error: data.message || "Verification failed" },
        { status: 400 }
      );
    }

    const txn = data.data;
    const isSuccess = txn.status === "success";

    return NextResponse.json({
      verified: isSuccess,
      status: txn.status,
      amount: txn.amount / 100, // convert from kobo back to Naira
      currency: txn.currency,
      reference: txn.reference,
      channel: txn.channel,
      paidAt: txn.paid_at,
      customerEmail: txn.customer?.email,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { verified: false, error: "Internal verification error" },
      { status: 500 }
    );
  }
}

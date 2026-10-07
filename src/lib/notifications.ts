import nodemailer from "nodemailer";

/**
 * Gmail-based email sender using App Password.
 * Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local
 */
const createTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn("⚠️  GMAIL_USER / GMAIL_APP_PASSWORD not set — emails will not be sent.");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
};

// ─── Order Status Labels ──────────────────────────────────────────────────────
export const STATUS_META: Record<
  string,
  { label: string; emoji: string; description: string; color: string }
> = {
  pending: {
    label: "Order Received",
    emoji: "📦",
    description: "We've received your order and it's being reviewed.",
    color: "#C4973F",
  },
  confirmed: {
    label: "Order Confirmed",
    emoji: "✅",
    description: "Great news! Your order has been confirmed and payment verified.",
    color: "#059669",
  },
  processing: {
    label: "Being Prepared",
    emoji: "✂️",
    description: "Our atelier team is carefully preparing and tailoring your items.",
    color: "#7C3AED",
  },
  shipped: {
    label: "On Its Way",
    emoji: "🚚",
    description: "Your order has been dispatched and is on its way to you.",
    color: "#2563EB",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    emoji: "📍",
    description: "Your order is out for delivery — expect it today!",
    color: "#D97706",
  },
  delivered: {
    label: "Delivered",
    emoji: "🎉",
    description: "Your order has been delivered. We hope you love it!",
    color: "#059669",
  },
  cancelled: {
    label: "Order Cancelled",
    emoji: "❌",
    description: "Your order has been cancelled. Contact us if this was a mistake.",
    color: "#DC2626",
  },
};

// ─── HTML Email Template ──────────────────────────────────────────────────────
function buildOrderEmail(params: {
  customerName: string;
  orderNumber: string;
  status: string;
  items: Array<{ name: string; qty: number; price: number; size?: string; color?: string }>;
  total: number;
  trackingUrl: string;
  adminNote?: string;
}) {
  const meta = STATUS_META[params.status] || STATUS_META["confirmed"];
  const formatPrice = (v: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);

  const itemsHtml = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #E5DDD0;">
          <strong style="color:#0A0A0A; font-size:13px;">${item.name}</strong>
          <br/><span style="color:#9E9189; font-size:11px;">${[item.color, item.size].filter(Boolean).join(" / ")} &times; ${item.qty}</span>
        </td>
        <td style="padding:10px 0; border-bottom:1px solid #E5DDD0; text-align:right; color:#0A0A0A; font-size:13px; font-weight:600;">
          ${formatPrice(item.price * item.qty)}
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Update — Raw Stitches</title>
</head>
<body style="margin:0; padding:0; background:#F9F6F2; font-family:'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F6F2; padding:40px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px; width:100%;">

        <!-- Header / Logo -->
        <tr>
          <td style="background:#0A0A0A; padding:30px 40px; text-align:center;">
            <h1 style="margin:0; color:#C4973F; font-size:22px; letter-spacing:6px; font-weight:400; text-transform:uppercase; font-family:Georgia, serif;">
              RAW STITCHES
            </h1>
            <p style="margin:4px 0 0; color:#9E9189; font-size:10px; letter-spacing:3px; text-transform:uppercase;">
              Lagos · Uyo · Nigeria
            </p>
          </td>
        </tr>

        <!-- Status Banner -->
        <tr>
          <td style="background:${meta.color}; padding:24px 40px; text-align:center;">
            <div style="font-size:32px; margin-bottom:8px;">${meta.emoji}</div>
            <h2 style="margin:0; color:#FFFFFF; font-size:20px; font-weight:600; letter-spacing:1px;">
              ${meta.label}
            </h2>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#FFFFFF; padding:36px 40px;">
            <p style="margin:0 0 16px; color:#0A0A0A; font-size:15px;">
              Dear <strong>${params.customerName}</strong>,
            </p>
            <p style="margin:0 0 24px; color:#5C5249; font-size:14px; line-height:1.7;">
              ${meta.description}
            </p>

            <!-- Order Number -->
            <div style="background:#F9F6F2; border:1px solid #E5DDD0; padding:14px 20px; margin-bottom:24px; text-align:center;">
              <span style="color:#9E9189; font-size:10px; text-transform:uppercase; letter-spacing:2px;">Order Number</span>
              <br/>
              <strong style="color:#0A0A0A; font-size:18px; letter-spacing:2px; font-family:Georgia, serif;">${params.orderNumber}</strong>
            </div>

            ${params.adminNote ? `
            <!-- Admin Note -->
            <div style="background:#FFF8EC; border-left:3px solid #C4973F; padding:12px 16px; margin-bottom:24px;">
              <p style="margin:0; color:#5C5249; font-size:13px; font-style:italic;">
                <strong style="color:#C4973F;">Note from Raw Stitches:</strong> ${params.adminNote}
              </p>
            </div>` : ""}

            <!-- Order Items -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <thead>
                <tr>
                  <td style="padding-bottom:8px; border-bottom:2px solid #0A0A0A; font-size:10px; text-transform:uppercase; letter-spacing:2px; color:#0A0A0A; font-weight:600;">Item</td>
                  <td style="padding-bottom:8px; border-bottom:2px solid #0A0A0A; text-align:right; font-size:10px; text-transform:uppercase; letter-spacing:2px; color:#0A0A0A; font-weight:600;">Amount</td>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
              <tfoot>
                <tr>
                  <td style="padding-top:12px; font-size:14px; font-weight:700; color:#0A0A0A;">Total</td>
                  <td style="padding-top:12px; text-align:right; font-size:16px; font-weight:700; color:#C4973F;">${formatPrice(params.total)}</td>
                </tr>
              </tfoot>
            </table>

            <!-- Track CTA -->
            <div style="text-align:center; margin:28px 0;">
              <a href="${params.trackingUrl}"
                style="background:#0A0A0A; color:#C4973F; text-decoration:none; padding:14px 36px; font-size:12px; letter-spacing:3px; text-transform:uppercase; font-weight:600; display:inline-block;">
                Track Your Order
              </a>
            </div>

            <p style="margin:24px 0 0; color:#9E9189; font-size:12px; line-height:1.7; text-align:center;">
              Questions? Reply to this email or WhatsApp us at
              <a href="https://wa.me/2348036895862" style="color:#C4973F; text-decoration:none;">+234 803 689 5862</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0A0A0A; padding:24px 40px; text-align:center;">
            <p style="margin:0 0 8px; color:#9E9189; font-size:10px; letter-spacing:2px; text-transform:uppercase;">
              Raw Stitches Atelier
            </p>
            <p style="margin:0; color:#5C5249; font-size:11px;">
              No. 62 Enwe Street, Uyo, Akwa Ibom State, Nigeria
            </p>
            <p style="margin:8px 0 0; color:#5C5249; font-size:11px;">
              <a href="https://rawstitches.com" style="color:#C4973F; text-decoration:none;">rawstitches.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── WhatsApp Message Template ────────────────────────────────────────────────
export function buildWhatsAppMessage(params: {
  customerName: string;
  orderNumber: string;
  status: string;
  total: number;
  trackingUrl: string;
  adminNote?: string;
}) {
  const meta = STATUS_META[params.status] || STATUS_META["confirmed"];
  const formatPrice = (v: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);

  const lines = [
    `${meta.emoji} *Raw Stitches Order Update*`,
    ``,
    `Hello ${params.customerName}! 👋`,
    ``,
    `*${meta.label}*`,
    meta.description,
    ``,
    `📋 Order: *${params.orderNumber}*`,
    `💳 Total: *${formatPrice(params.total)}*`,
  ];

  if (params.adminNote) {
    lines.push(``, `📝 Note: _${params.adminNote}_`);
  }

  lines.push(
    ``,
    `🔗 Track your order: ${params.trackingUrl}`,
    ``,
    `Need help? Reply to this message or call us at *0803 689 5862*.`,
    ``,
    `— The Raw Stitches Team ✨`
  );

  return lines.join("\n");
}

// ─── Send Email ───────────────────────────────────────────────────────────────
export async function sendOrderStatusEmail(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  status: string;
  items: Array<{ name: string; qty: number; price: number; size?: string; color?: string }>;
  total: number;
  trackingUrl: string;
  adminNote?: string;
}) {
  const transporter = createTransporter();
  if (!transporter) return { success: false, reason: "Email not configured" };

  const meta = STATUS_META[params.status] || STATUS_META["confirmed"];
  const fromName = "Raw Stitches";
  const fromEmail = process.env.GMAIL_USER!;

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: params.to,
      subject: `${meta.emoji} ${meta.label} — ${params.orderNumber} | Raw Stitches`,
      html: buildOrderEmail(params),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Email send error:", error);
    return { success: false, reason: error?.message };
  }
}

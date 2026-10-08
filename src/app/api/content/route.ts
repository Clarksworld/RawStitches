import { NextResponse, type NextRequest } from "next/server";
import { getDb, siteContent as siteContentTable } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const DEFAULT_CONTENT = {
  hero: {
    eyebrow: "Raw Stitches Nigeria Enterprise",
    headline: "Made for the Woman\nWho Stands Out",
    sub: "Unique, elegant and beautifully crafted women's clothing made in Nigeria.",
    image: "https://res.cloudinary.com/bisnlyad/image/upload/v1791387009/copy_of_whatsapp_image_2026-10-07_at_161833.jpg",
    primaryCta: "Shop the Collection",
    primaryLink: "/shop",
    secondaryCta: "Explore New Arrivals",
    secondaryLink: "/shop?filter=new",
  },
  announcement: {
    enabled: true,
    text: "Free delivery on orders above ₦50,000 · Made in Nigeria",
    link: "/shop",
  },
  sections: [
    { id: "hero", label: "Homepage Hero", desc: "Main banner image, headline, and CTA", published: true },
    { id: "featured", label: "Featured Products", desc: "Products highlighted on homepage", published: true },
    { id: "collections", label: "Shop by Collection", desc: "Collection cards on homepage", published: true },
    { id: "about", label: "Brand Story Section", desc: "Short brand story on homepage", published: true },
    { id: "testimonials", label: "Testimonials", desc: "Customer reviews shown on homepage", published: true },
    { id: "social", label: "Social Gallery", desc: "Instagram / TikTok / Facebook gallery", published: true },
    { id: "newsletter", label: "Newsletter / CTA", desc: "Email signup section", published: true },
    { id: "about_page", label: "About Page", desc: "Full about page content", published: true },
    { id: "faq", label: "FAQ", desc: "Frequently asked questions", published: true },
    { id: "footer", label: "Footer Content", desc: "Footer links, address, and social", published: true },
  ],
  faqs: [
    { id: "f1", q: "How do I place an order?", a: "Browse our collection, select your size and colour, and add to bag. Proceed to checkout and enter your details.", pub: true },
    { id: "f2", q: "What payment methods do you accept?", a: "We accept card payments (Visa, Mastercard, Verve), bank transfer, and USSD via Paystack.", pub: true },
    { id: "f3", q: "How long does delivery take?", a: "Delivery takes 1–2 days within Uyo/Akwa Ibom, and 3–5 days for Lagos, Abuja, and other states across Nigeria.", pub: true },
    { id: "f4", q: "What is your return policy?", a: "Items in unworn condition with original tags intact may be exchanged within 7 days of delivery.", pub: true },
    { id: "f5", q: "Do you offer bespoke or custom sizing?", a: "Yes! Our Uyo atelier offers bespoke tailored pieces. You can reach out directly via WhatsApp for custom sizing guidance.", pub: true },
  ],
  brand: {
    tagline: "Refined Nigerian Couture for the Modern Woman",
    manifesto: "Founded in Uyo, Raw Stitches creates contemporary womenswear inspired by African heritage, architectural silhouettes, and fine tailoring.",
    address: "No. 62 Enwe Street, Uyo, Akwa Ibom State, Nigeria",
    email: "info@rawstitches.ng",
    phone: "+234 803 689 5862",
    whatsapp: "+234 803 689 5862",
    instagram: "@rawstitches_",
    tiktok: "@rawstitches1",
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    const db = getDb();
    const rows = await db.select().from(siteContentTable);
    const contentMap: Record<string, any> = {};

    rows.forEach((r) => {
      contentMap[r.key] = r.value;
    });

    const result = {
      hero: contentMap.hero || DEFAULT_CONTENT.hero,
      announcement: contentMap.announcement || DEFAULT_CONTENT.announcement,
      sections: contentMap.sections || DEFAULT_CONTENT.sections,
      faqs: contentMap.faqs || DEFAULT_CONTENT.faqs,
      brand: contentMap.brand || DEFAULT_CONTENT.brand,
    };

    if (key && key in result) {
      return NextResponse.json({ [key]: (result as any)[key] });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to query site_content from DB, returning defaults:", error);
    return NextResponse.json(DEFAULT_CONTENT);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    // Body can be { key: string, value: any } or full object { hero, announcement, ... }
    if (body.key && body.value !== undefined) {
      await db
        .insert(siteContentTable)
        .values({
          key: body.key,
          value: body.value,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: siteContentTable.key,
          set: {
            value: body.value,
            updatedAt: new Date(),
          },
        });

      return NextResponse.json({ success: true, key: body.key, value: body.value });
    }

    // Otherwise handle multiple keys in a single payload
    const keys = ["hero", "announcement", "sections", "faqs", "brand"] as const;
    for (const k of keys) {
      if (body[k] !== undefined) {
        await db
          .insert(siteContentTable)
          .values({
            key: k,
            value: body[k],
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: siteContentTable.key,
            set: {
              value: body[k],
              updatedAt: new Date(),
            },
          });
      }
    }

    return NextResponse.json({ success: true, updated: Object.keys(body) });
  } catch (error: any) {
    console.error("Failed to update site_content:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update site content" },
      { status: 500 }
    );
  }
}

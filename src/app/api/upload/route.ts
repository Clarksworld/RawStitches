import { NextResponse, type NextRequest } from "next/server";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const files = formData.getAll("file") as File[];
      const folder = (formData.get("folder") as string) || "raw-stitches/products";

      if (!files || files.length === 0) {
        return NextResponse.json(
          { error: "No files found in form data" },
          { status: 400 }
        );
      }

      const results = [];

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploaded = await uploadToCloudinary(buffer, folder);
        results.push(uploaded);
      }

      if (results.length === 1) {
        return NextResponse.json({ success: true, ...results[0] });
      }

      return NextResponse.json({
        success: true,
        count: results.length,
        images: results,
      });
    }

    // Handle JSON payload (base64 image string)
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { image, folder = "raw-stitches/products" } = body;

      if (!image) {
        return NextResponse.json(
          { error: "Image base64 data is required" },
          { status: 400 }
        );
      }

      const uploaded = await uploadToCloudinary(image, folder);
      return NextResponse.json({ success: true, ...uploaded });
    }

    return NextResponse.json(
      { error: "Unsupported content type. Send multipart/form-data or application/json" },
      { status: 415 }
    );
  } catch (error: any) {
    console.error("Cloudinary upload API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload image to Cloudinary" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let publicId = searchParams.get("publicId");

    if (!publicId) {
      const body = await request.json().catch(() => ({}));
      publicId = body.publicId;
    }

    if (!publicId) {
      return NextResponse.json(
        { error: "publicId parameter is required" },
        { status: 400 }
      );
    }

    const success = await deleteFromCloudinary(publicId);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error("Cloudinary delete API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete image" },
      { status: 500 }
    );
  }
}

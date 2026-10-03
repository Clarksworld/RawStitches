import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "bisnlyad",
  api_key: process.env.CLOUDINARY_API_KEY || "254322888364567",
  api_secret: process.env.CLOUDINARY_API_SECRET || "di7_aD4pwxpfWXCKetT6BlY5f8Q",
  secure: true,
});

export interface UploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload an image buffer or base64 data string to Cloudinary
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer | string,
  folder = "raw-stitches/products"
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { quality: "auto", fetch_format: "auto" }
        ],
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload returned empty result"));
        }
        resolve({
          url: result.url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );

    if (Buffer.isBuffer(fileBuffer)) {
      uploadStream.end(fileBuffer);
    } else if (typeof fileBuffer === "string" && fileBuffer.startsWith("data:")) {
      // Base64 URI string
      cloudinary.uploader
        .upload(fileBuffer, {
          folder,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        })
        .then((res) => {
          resolve({
            url: res.url,
            secure_url: res.secure_url,
            public_id: res.public_id,
            width: res.width,
            height: res.height,
            format: res.format,
          });
        })
        .catch(reject);
    } else {
      uploadStream.end(Buffer.from(fileBuffer));
    }
  });
}

/**
 * Delete an image by public_id from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
}

/**
 * Generate an optimized delivery URL for a given Cloudinary public_id or URL
 */
export function getOptimizedImageUrl(
  publicIdOrUrl: string,
  options?: { width?: number; height?: number; crop?: string }
): string {
  if (!publicIdOrUrl) return "";
  if (!publicIdOrUrl.includes("cloudinary.com")) {
    return publicIdOrUrl; // External URL (e.g. Unsplash) untouched
  }

  const parts = publicIdOrUrl.split("/upload/");
  if (parts.length < 2) return publicIdOrUrl;

  const transformations = ["f_auto", "q_auto"];
  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  if (options?.crop) transformations.push(`c_${options.crop}`);

  return `${parts[0]}/upload/${transformations.join(",")}/${parts[1]}`;
}

export default cloudinary;

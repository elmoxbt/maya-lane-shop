import "server-only";
import { v2 as cloudinary } from "cloudinary";

let configured = false;
function client() {
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

export const cloudinaryFolder = process.env.CLOUDINARY_FOLDER ?? "maya-lane-shop";

/** Signature for direct browser → Cloudinary uploads (product images: public; digital files: authenticated raw). */
export function signUpload(kind: "image" | "digital") {
  const c = client();
  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string | number> =
    kind === "image" ? { timestamp, folder: `${cloudinaryFolder}/products` } : { timestamp, folder: `${cloudinaryFolder}/digital`, type: "authenticated" };
  const signature = c.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);
  return {
    ...params,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    resourceType: kind === "image" ? "image" : "raw",
  };
}

/** Short-lived signed URL for an authenticated raw upload. */
export function cloudinaryPrivateDownloadUrl(publicId: string, fileName: string) {
  return client().utils.private_download_url(publicId, "", {
    resource_type: "raw",
    type: "authenticated",
    attachment: fileName,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 5,
  } as never);
}

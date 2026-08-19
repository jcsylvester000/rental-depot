import crypto from "node:crypto";

/* Server-side Cloudinary helpers (signed uploads). No SDK — a small signer. */

export function cloudinaryConfig() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  };
}

export function isCloudinaryConfigured(): boolean {
  const c = cloudinaryConfig();
  return !!(c.cloudName && c.apiKey && c.apiSecret);
}

/**
 * Cloudinary signature: sha1 of the params (sorted, `k=v` joined by `&`)
 * with the API secret appended. `file`, `api_key`, and `resource_type`
 * are NOT signed.
 */
export function signUploadParams(params: Record<string, string | number>): string {
  const { apiSecret } = cloudinaryConfig();
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}

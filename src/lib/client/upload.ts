"use client";

/* Client-side upload: gets a signature from our API, then uploads the file
 * directly to Cloudinary. Falls back to a simulated asset when Cloudinary
 * isn't configured (or the user isn't signed in), so the flow always works. */

export interface UploadedAsset {
  assetRef: string; // Cloudinary public_id (or a demo ref)
  url: string; // secure delivery URL
  fileName: string;
  resourceType: string;
  simulated: boolean;
}

export async function uploadDocument(file: File, folder?: string): Promise<UploadedAsset> {
  const signRes = await fetch("/api/v1/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  const sign = (await signRes.json())?.data;

  if (!sign?.configured) {
    // Fallback: simulate a stored asset so the demo flow completes.
    return { assetRef: `demo/${Date.now()}-${file.name}`, url: URL.createObjectURL(file), fileName: file.name, resourceType: file.type.startsWith("image") ? "image" : "raw", simulated: true };
  }

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("signature", sign.signature);
  form.append("folder", sign.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return {
    assetRef: data.public_id,
    url: data.secure_url,
    fileName: data.original_filename ?? file.name,
    resourceType: data.resource_type ?? "raw",
    simulated: false,
  };
}

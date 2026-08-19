import { type NextRequest } from "next/server";
import { ok, serverError } from "@/lib/api/response";
import { auth } from "@/auth";
import { cloudinaryConfig, isCloudinaryConfigured, signUploadParams } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/uploads/sign — returns a short-lived signature for a direct
 * browser→Cloudinary upload. Auth-gated. If Cloudinary isn't configured, the
 * client uses a simulated-upload fallback (`configured: false`).
 */
export async function POST(req: NextRequest) {
  try {
    if (!isCloudinaryConfigured()) {
      return ok({ configured: false });
    }
    const session = await auth();
    if (!session?.user) {
      return ok({ configured: false, reason: "sign_in_required" });
    }

    const { folder } = (await req.json().catch(() => ({}))) as { folder?: string };
    const { cloudName, apiKey } = cloudinaryConfig();
    const timestamp = Math.round(Date.now() / 1000);
    const scopedFolder = folder ?? `rental-depot/${session.user.id}`;
    const signature = signUploadParams({ folder: scopedFolder, timestamp });

    return ok({ configured: true, cloudName, apiKey, timestamp, signature, folder: scopedFolder });
  } catch {
    return serverError("Could not sign upload");
  }
}

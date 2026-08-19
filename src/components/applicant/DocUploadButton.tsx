"use client";

import * as React from "react";
import { uploadDocument, type UploadedAsset } from "@/lib/client/upload";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/lib/client/toast";

const ACCEPT = "image/*,application/pdf,.heic,.heif";

export function DocUploadButton({
  label = "Upload",
  folder,
  variant = "ghost",
  onUploaded,
}: {
  label?: string;
  folder?: string;
  variant?: "ghost" | "accent" | "primary";
  onUploaded: (asset: UploadedAsset) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [busy, setBusy] = React.useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast("File is over 10 MB — please choose a smaller file");
    setBusy(true);
    try {
      const asset = await uploadDocument(file, folder);
      onUploaded(asset);
      toast(asset.simulated ? "Uploaded (demo mode — configure Cloudinary for live storage)" : "Document uploaded");
    } catch {
      toast("Upload failed — please try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={onChange} />
      <Button variant={variant} size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
        <Icon name="upload" size={14} /> {busy ? "Uploading…" : label}
      </Button>
    </>
  );
}

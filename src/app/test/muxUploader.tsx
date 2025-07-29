"use client";

import { useState } from "react";
import { uploadToMux } from "./uploadMuxAsset";

interface MuxUploaderProps {
  userId: string;
}

export default function MuxUploader({ userId }: MuxUploaderProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    const { uploadUrl } = await uploadToMux({ filename: file.name, userId });

    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    alert("Uploaded! Mux will process it soon.");
  };

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload}>Upload to Mux</button>
    </div>
  );
}

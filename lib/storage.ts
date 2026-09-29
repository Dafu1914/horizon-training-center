import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";

const PROVIDER = process.env.STORAGE_PROVIDER || "local";

// ==================== LOCAL ====================

async function saveLocal(
  file: File
): Promise<{ url: string; publicId: string; size: number; type: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  // Unique filename
  const ext = path.extname(file.name);
  const baseName = path
    .basename(file.name, ext)
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();
  const uniqueName = `${Date.now()}_${baseName}${ext}`;

  const filePath = path.join(uploadDir, uniqueName);
  await fs.writeFile(filePath, buffer);

  return {
    url: `/uploads/${uniqueName}`,
    publicId: uniqueName,
    size: file.size,
    type: file.type,
  };
}

// ==================== CLOUDINARY ====================

async function saveCloudinary(
  file: File
): Promise<{ url: string; publicId: string; size: number; type: string }> {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Determine resource type
  let resourceType: "image" | "video" | "raw" = "raw";
  if (file.type.startsWith("image/")) resourceType = "image";
  else if (file.type.startsWith("video/")) resourceType = "video";
  else if (file.type.startsWith("audio/")) resourceType = "video";

  const result: any = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: resourceType,
          folder: "horizon/uploads",
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    size: file.size,
    type: file.type,
  };
}

// ==================== PUBLIC API ====================

export async function uploadFile(file: File) {
  if (PROVIDER === "cloudinary") {
    return saveCloudinary(file);
  }
  return saveLocal(file);
}

export function getProvider() {
  return PROVIDER;
}
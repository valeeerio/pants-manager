import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_DATABASE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.DATABASE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Variabili d'ambiente Supabase mancanti (NEXT_PUBLIC_DATABASE_SUPABASE_URL / DATABASE_SUPABASE_SERVICE_ROLE_KEY)"
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

const BUCKET = "project-images";

function extensionFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/heic": "heic",
    "image/heif": "heif",
  };
  return map[mimeType] ?? "jpg";
}

export async function uploadJobImage(
  projectId: string,
  type: "BEFORE" | "AFTER",
  file: File
): Promise<string> {
  const extension = extensionFromMimeType(file.type);
  const path = `${projectId}/${type}-${randomUUID()}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Errore nel caricamento dell'immagine: ${error.message}`);
  }

  return path;
}

export async function deleteJobImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    throw new Error(`Errore nell'eliminazione dell'immagine: ${error.message}`);
  }
}

export async function getSignedImageUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error || !data) {
    console.error(
      `Errore nella generazione dell'URL firmato per il path "${path}": ${
        error?.message ?? "sconosciuto"
      }`
    );
    return null;
  }

  return data.signedUrl;
}

import { http } from '../lib/http';
import { HttpError } from '../helpers/httpErrors';

/**
 * Subida de imagenes a Cloudinary con un upload preset sin firma (unsigned).
 * Se usa en lugar de Firebase Storage, que exige el plan de pago Blaze.
 */

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? '';
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? '';

export type ImageFolder = 'posts' | 'mascotas' | 'negocios' | 'perfiles';

interface UploadResponse {
  secure_url: string;
}

export const hasCloudinary = (): boolean => Boolean(CLOUD && PRESET);

/** Sube una imagen (data URL o archivo) y devuelve su URL publica. */
export async function uploadImage(file: string | Blob, folder: ImageFolder, signal?: AbortSignal): Promise<string> {
  if (!hasCloudinary()) throw new HttpError('Falta configurar Cloudinary en el archivo .env.');

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', PRESET);
  form.append('asset_folder', `manada/${folder}`);

  const data = await http<UploadResponse>(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: 'POST',
    body: form,
    signal,
    timeoutMs: 45_000
  });
  return data.secure_url;
}

/** URL optimizada: formato automatico, calidad automatica y ancho maximo. */
export function optimizedUrl(url: string | undefined, width = 900): string | undefined {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}

/** Si el valor es una foto nueva (data URL) la sube; si ya es una URL la devuelve igual. */
export async function resolveImage(value: string | null | undefined, folder: ImageFolder): Promise<string> {
  if (!value) return '';
  return value.startsWith('data:') ? uploadImage(value, folder) : value;
}

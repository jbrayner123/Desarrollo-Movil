import axios from 'axios';
import { giphyClient, hasGiphyApiKey } from '../api/giphyClient';

/* ==========================================================================
 * Interfaces tipadas de la respuesta de GIPHY (endpoint /gifs/search)
 * Documentacion: https://developers.giphy.com/docs/api/endpoint#search
 * ========================================================================== */

/** Una version de la imagen. GIPHY envia las dimensiones como texto. */
export interface GiphyImageRendition {
  url: string;
  width: string;
  height: string;
  size?: string;
  mp4?: string;
  mp4_size?: string;
  webp?: string;
  webp_size?: string;
}

/** Versiones de la imagen que usa la aplicacion (GIPHY envia muchas mas). */
export interface GiphyImages {
  original: GiphyImageRendition;
  fixed_width: GiphyImageRendition;
  fixed_width_downsampled: GiphyImageRendition;
  fixed_width_still: GiphyImageRendition;
  downsized: GiphyImageRendition;
  preview_gif?: GiphyImageRendition;
}

export interface GiphyUser {
  username: string;
  display_name: string;
  avatar_url: string;
  profile_url: string;
}

/** Objeto GIF tal como lo devuelve la API. */
export interface GiphyGif {
  type: 'gif';
  id: string;
  slug: string;
  url: string;
  title: string;
  rating: string;
  username: string;
  import_datetime: string;
  images: GiphyImages;
  user?: GiphyUser;
  alt_text?: string;
}

export interface GiphyPagination {
  total_count: number;
  count: number;
  offset: number;
}

export interface GiphyMeta {
  status: number;
  msg: string;
  response_id: string;
}

/** Respuesta completa del endpoint de busqueda. */
export interface GiphySearchResponse {
  data: GiphyGif[];
  pagination: GiphyPagination;
  meta: GiphyMeta;
}

/* ==========================================================================
 * Parametros y modelo que usa la interfaz
 * ========================================================================== */

export type GiphyRating = 'g' | 'pg' | 'pg-13' | 'r';

export interface SearchGifsParams {
  q: string;
  limit?: number;
  offset?: number;
  rating?: GiphyRating;
  lang?: string;
}

/** Modelo reducido que consume la interfaz: solo los campos que se muestran. */
export interface Gif {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  stillUrl: string;
  width: number;
  height: number;
}

export interface SearchGifsResult {
  gifs: Gif[];
  totalCount: number;
  /** Offset que debe usarse para pedir la siguiente pagina. */
  nextOffset: number;
  hasMore: boolean;
}

/** Valores por defecto exigidos por el reto. */
export const DEFAULT_LIMIT = 24;
const DEFAULT_RATING: GiphyRating = 'g';
const DEFAULT_LANG = 'en';
/** GIPHY no permite offsets mayores a 4999 en la busqueda. */
const MAX_OFFSET = 4999;

/* ==========================================================================
 * Errores con mensajes entendibles
 * ========================================================================== */

export class GiphyServiceError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'GiphyServiceError';
  }
}

/** true si el error viene de cancelar la peticion (AbortController). */
export const isRequestCanceled = (error: unknown): boolean => axios.isCancel(error);

/** Traduce errores de red o HTTP a un mensaje claro en espanol. */
function toServiceError(error: unknown): GiphyServiceError {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new GiphyServiceError('GIPHY tardo demasiado en responder. Intenta de nuevo.');
    }
    if (!error.response) {
      return new GiphyServiceError('No se pudo conectar con GIPHY. Revisa tu conexion a internet.');
    }

    const status = error.response.status;
    switch (status) {
      case 400:
        return new GiphyServiceError('La busqueda enviada no es valida. Revisa el texto ingresado.', status);
      case 401:
      case 403:
        return new GiphyServiceError(
          'La API Key de GIPHY no es valida o no tiene permisos. Revisa VITE_GIPHY_API_KEY en el archivo .env.',
          status
        );
      case 404:
        return new GiphyServiceError('El servicio de busqueda de GIPHY no esta disponible.', status);
      case 414:
        return new GiphyServiceError('El texto de busqueda es demasiado largo.', status);
      case 429:
        return new GiphyServiceError(
          'Se alcanzo el limite de peticiones de GIPHY. Espera unos minutos e intenta de nuevo.',
          status
        );
      default:
        return new GiphyServiceError(`GIPHY respondio con un error (codigo ${status}). Intenta mas tarde.`, status);
    }
  }
  return new GiphyServiceError('Ocurrio un error inesperado al buscar GIFs.');
}

/** Quita emojis y simbolos pictograficos que GIPHY puede incluir en los titulos. */
const stripEmojis = (text: string): string =>
  text
    .replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\u{FE0F}\u{200D}\u{20E3}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

/** Convierte un GIF de la API al modelo de la interfaz. */
function mapGif(gif: GiphyGif): Gif {
  const image = gif.images.fixed_width;
  return {
    id: gif.id,
    title: stripEmojis(gif.title ?? '') || 'GIF sin titulo',
    url: gif.url,
    imageUrl: image.webp ?? image.url,
    stillUrl: gif.images.fixed_width_still?.url ?? image.url,
    width: Number(image.width) || 200,
    height: Number(image.height) || 200
  };
}

/* ==========================================================================
 * Servicio de busqueda
 * ========================================================================== */

/**
 * Busca GIFs en GIPHY.
 * @param params Texto de busqueda y paginacion.
 * @param signal AbortSignal para cancelar la peticion si el usuario sigue escribiendo
 *               o sale de la vista. Una peticion cancelada rechaza con un error que
 *               se reconoce con `isRequestCanceled`.
 */
export async function searchGifs(params: SearchGifsParams, signal?: AbortSignal): Promise<SearchGifsResult> {
  if (!hasGiphyApiKey()) {
    throw new GiphyServiceError('Falta configurar VITE_GIPHY_API_KEY en el archivo .env.');
  }

  const q = params.q.trim();
  const limit = params.limit ?? DEFAULT_LIMIT;
  const offset = Math.min(params.offset ?? 0, MAX_OFFSET);

  try {
    const { data } = await giphyClient.get<GiphySearchResponse>('/gifs/search', {
      params: {
        q,
        limit,
        offset,
        rating: params.rating ?? DEFAULT_RATING,
        lang: params.lang ?? DEFAULT_LANG
      },
      signal
    });

    const nextOffset = data.pagination.offset + data.pagination.count;
    return {
      gifs: data.data.map(mapGif),
      totalCount: data.pagination.total_count,
      nextOffset,
      hasMore: data.pagination.count > 0 && nextOffset < data.pagination.total_count && nextOffset <= MAX_OFFSET
    };
  } catch (error) {
    // Las cancelaciones se propagan tal cual: no son errores para el usuario.
    if (isRequestCanceled(error)) throw error;
    throw toServiceError(error);
  }
}

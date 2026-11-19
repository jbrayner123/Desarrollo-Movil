import {
  collection,
  doc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db, toIso } from '../lib/firebase';
import type { Business, BusinessType, GeoPoint, Review, UserProfile } from '../types';

/** Datos que llena la veterinaria o el petshop al registrarse o editar su perfil. */
export interface NewBusiness {
  name: string;
  tagline: string;
  phone: string;
  schedule: string;
  services: string[];
  address: string;
  neighborhood: string;
  directions: string;
  location: GeoPoint;
  logoUrl: string;
}

const businesses = collection(db, 'businesses');

function mapBusiness(id: string, x: Record<string, unknown>): Business {
  return {
    id,
    ownerId: (x.ownerId as string) ?? id,
    type: (x.type as BusinessType) ?? 'vet',
    name: (x.name as string) ?? '',
    tagline: (x.tagline as string) ?? '',
    phone: (x.phone as string) ?? '',
    schedule: (x.schedule as string) ?? '',
    services: (x.services as string[]) ?? [],
    address: (x.address as string) ?? '',
    neighborhood: (x.neighborhood as string) ?? '',
    directions: (x.directions as string) ?? '',
    city: (x.city as string) ?? 'Cali',
    location: (x.location as GeoPoint) ?? { lat: 3.4516, lng: -76.532 },
    logoUrl: (x.logoUrl as string) ?? '',
    verified: !!x.verified,
    ratingSum: (x.ratingSum as number) ?? 0,
    ratingCount: (x.ratingCount as number) ?? 0,
    positiveCount: (x.positiveCount as number) ?? 0,
    createdAt: toIso(x.createdAt)
  };
}

/** El documento usa el uid del dueno como id: una sola direccion por cuenta. */
export async function createBusiness(uid: string, type: BusinessType, data: NewBusiness): Promise<void> {
  await setDoc(doc(db, 'businesses', uid), {
    ...data,
    ownerId: uid,
    type,
    city: 'Cali',
    verified: false,
    ratingSum: 0,
    ratingCount: 0,
    positiveCount: 0,
    createdAt: serverTimestamp()
  });
}

export const updateBusiness = (uid: string, data: Partial<NewBusiness>) => updateDoc(doc(db, 'businesses', uid), data);

export const setVerified = (uid: string, verified: boolean) => updateDoc(doc(db, 'businesses', uid), { verified });

export function subscribeBusinesses(onChange: (list: Business[]) => void, onError: (e: Error) => void) {
  return onSnapshot(businesses, (snap) => onChange(snap.docs.map((d) => mapBusiness(d.id, d.data()))), onError);
}

export function subscribeBusiness(id: string, onChange: (b: Business | null) => void, onError: (e: Error) => void) {
  return onSnapshot(doc(db, 'businesses', id), (snap) => onChange(snap.exists() ? mapBusiness(snap.id, snap.data()) : null), onError);
}

// ---- Resenas -------------------------------------------------------------------

export function subscribeReviews(businessId: string, onChange: (list: Review[]) => void, onError: (e: Error) => void) {
  return onSnapshot(
    query(collection(db, 'reviews'), where('businessId', '==', businessId)),
    (snap) =>
      onChange(
        snap.docs
          .map((d) => {
            const x = d.data({ serverTimestamps: 'estimate' });
            return {
              id: d.id,
              businessId: x.businessId,
              authorId: x.authorId,
              authorName: x.authorName ?? '',
              authorPhoto: x.authorPhoto ?? '',
              rating: x.rating ?? 0,
              text: x.text ?? '',
              createdAt: toIso(x.createdAt)
            };
          })
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      ),
    onError
  );
}

/**
 * Crea la resena y actualiza los promedios del negocio en la misma operacion.
 * Las reglas exigen ambas escrituras juntas y solo una resena por usuario.
 */
export async function addReview(businessId: string, author: UserProfile, rating: number, text: string): Promise<void> {
  const batch = writeBatch(db);
  batch.set(doc(db, 'reviews', `${businessId}_${author.uid}`), {
    businessId,
    authorId: author.uid,
    authorName: author.displayName,
    authorPhoto: author.photoUrl,
    rating,
    text: text.trim(),
    createdAt: serverTimestamp()
  });
  batch.update(doc(db, 'businesses', businessId), {
    ratingSum: increment(rating),
    ratingCount: increment(1),
    positiveCount: increment(rating >= 4 ? 1 : 0)
  });
  await batch.commit();
}

// ---- Calculos para la interfaz ---------------------------------------------------

/** Porcentaje de recomendacion: resenas de 4 o 5 estrellas sobre el total. */
export const recommendation = (b: Business): number | null =>
  b.ratingCount > 0 ? Math.round((b.positiveCount / b.ratingCount) * 100) : null;

export const averageRating = (b: Business): number | null =>
  b.ratingCount > 0 ? Math.round((b.ratingSum / b.ratingCount) * 10) / 10 : null;

export const businessInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-Z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || name.slice(0, 1).toUpperCase();

/** Servicios sugeridos en el formulario segun el tipo de negocio. */
export const SERVICE_OPTIONS: Record<BusinessType, string[]> = {
  vet: ['Consulta general', 'Vacunación', 'Urgencias 24 h', 'Cirugía', 'Laboratorio', 'Odontología', 'Hospitalización', 'Peluquería'],
  petshop: ['Alimentos', 'Accesorios', 'Juguetes', 'Peluquería', 'Domicilios', 'Guardería', 'Farmacia veterinaria', 'Adopciones']
};

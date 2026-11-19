/** Modelos de dominio de Manada, alineados con las colecciones de Firestore. */

/** owner = dueno de mascota; vet = veterinaria; petshop = tienda; admin = moderador. */
export type Role = 'owner' | 'vet' | 'petshop' | 'admin';
export type BusinessType = 'vet' | 'petshop';

export interface GeoPoint {
  lat: number;
  lng: number;
}

/** users/{uid} */
export interface UserProfile {
  uid: string;
  role: Role;
  displayName: string;
  email: string;
  photoUrl: string;
  city: string;
  createdAt: string;
}

/** pets/{id} */
export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  ageYears: number;
  weightKg: number;
  photoUrl: string;
  vaccinesUpToDate: boolean;
  bio: string;
}

/** businesses/{uid}: una sola direccion por cuenta. */
export interface Business {
  id: string;
  ownerId: string;
  type: BusinessType;
  name: string;
  tagline: string;
  phone: string;
  schedule: string;
  services: string[];
  address: string;
  neighborhood: string;
  directions: string;
  city: string;
  location: GeoPoint;
  logoUrl: string;
  verified: boolean;
  ratingSum: number;
  ratingCount: number;
  positiveCount: number;
  createdAt: string;
}

/** reviews/{businessId_uid} */
export interface Review {
  id: string;
  businessId: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  rating: number;
  text: string;
  createdAt: string;
}

/** momento: cualquier cuenta (foto libre). paseo, perdido y tip: duenos. tip y aviso: veterinarias. promo: petshops. */
export type PostCategory = 'momento' | 'paseo' | 'perdido' | 'tip' | 'aviso' | 'promo';

export interface PostLocation extends GeoPoint {
  label: string;
}

/** posts/{id} */
export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  authorRole: Role;
  category: PostCategory;
  text: string;
  petName?: string;
  imageUrl?: string;
  location?: PostLocation;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

/** posts/{id}/comments/{id} */
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  text: string;
  createdAt: string;
}

export interface ChatMember {
  name: string;
  photo: string;
  role: Role;
}

/** chats/{uidA_uidB} */
export interface Chat {
  id: string;
  members: string[];
  memberInfo: Record<string, ChatMember>;
  lastMessage: string;
  lastSenderId: string;
  updatedAt: string;
  unread: Record<string, number>;
}

/** chats/{id}/messages/{id}. kind = 'location' cuando se comparte una ubicacion. */
export interface Message {
  id: string;
  senderId: string;
  text: string;
  kind: 'text' | 'location';
  location?: PostLocation;
  createdAt: string;
  /** true mientras el mensaje no ha sido confirmado por el servidor. */
  pending?: boolean;
}

/** reports/{id} */
export interface Report {
  id: string;
  postId: string;
  postExcerpt: string;
  postAuthor: string;
  reporterId: string;
  reason: string;
  createdAt: string;
}

export type MapPointKind = 'perdido' | 'paseo' | 'veterinaria' | 'petshop';

export interface MapPoint {
  id: string;
  kind: MapPointKind;
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  link: string;
}

/** Tonos pastel de las tarjetas de negocios (se alternan en el directorio). */
export type VetTone = 'mint' | 'pink' | 'lavender' | 'butter';
export const VET_TONES: VetTone[] = ['mint', 'pink', 'lavender', 'butter'];

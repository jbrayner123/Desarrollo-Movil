import { cameraOutline, locationOutline, megaphoneOutline, pawOutline, pricetagOutline, starOutline } from 'ionicons/icons';
import type { PostCategory, Role } from '../../types';

/** Etiqueta, icono y tono de cada categoria de publicacion. */
export const CATEGORY_META: Record<PostCategory, { badge: string; label: string; hint: string; icon: string; tone: string }> = {
  momento: { badge: 'Momento', label: 'Momento', hint: 'Comparte una foto', icon: cameraOutline, tone: 'sky' },
  paseo: { badge: 'De paseo', label: 'Paseo', hint: 'Invita a caminar', icon: pawOutline, tone: 'mint' },
  perdido: { badge: 'Mascota perdida', label: 'Perdido', hint: 'Reporta una mascota', icon: locationOutline, tone: 'pink' },
  tip: { badge: 'Tip', label: 'Tip', hint: 'Comparte un consejo', icon: starOutline, tone: 'lavender' },
  aviso: { badge: 'Aviso', label: 'Aviso', hint: 'Jornadas y noticias', icon: megaphoneOutline, tone: 'butter' },
  promo: { badge: 'Promoción', label: 'Promoción', hint: 'Ofertas de tu tienda', icon: pricetagOutline, tone: 'butter' }
};

/** Categorias que puede publicar cada tipo de cuenta (igual que en las reglas de Firestore). */
export const CATEGORIES_BY_ROLE: Record<Role, PostCategory[]> = {
  owner: ['momento', 'paseo', 'perdido', 'tip'],
  vet: ['momento', 'tip', 'aviso'],
  petshop: ['momento', 'promo'],
  admin: ['momento', 'paseo', 'perdido', 'tip', 'aviso', 'promo']
};

export const ROLE_LABEL: Record<Role, string> = {
  owner: 'Dueño',
  vet: 'Veterinaria',
  petshop: 'Petshop',
  admin: 'Administrador'
};

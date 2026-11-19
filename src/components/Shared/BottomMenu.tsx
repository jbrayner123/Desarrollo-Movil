import { IonIcon, useIonRouter } from '@ionic/react';
import { add, briefcaseOutline, homeOutline, locationOutline, medkitOutline, personOutline } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useHaptics } from '../../hooks/useHaptics';
import styles from './BottomMenu.module.scss';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  /** Boton central "+" siempre amarillo. */
  primary?: boolean;
}

/** Rutas de detalle donde la barra se oculta para dar foco al contenido. */
const HIDDEN_PREFIXES = ['/app/crear', '/app/chat/', '/app/negocio/'];

/**
 * Barra inferior flotante tipo capsula oscura con 5 accesos.
 * El cuarto acceso depende del tipo de cuenta: "Servicios" para duenos y
 * "Mi negocio" para veterinarias y petshops.
 */
export default function BottomMenu() {
  const router = useIonRouter();
  const { pathname } = useLocation();
  const { unreadTotal } = useApp();
  const { isBusiness } = useAuth();
  const haptics = useHaptics();

  if (!pathname.startsWith('/app/') || HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  const items: MenuItem[] = [
    { path: '/app/inicio', label: 'Inicio', icon: homeOutline },
    { path: '/app/mapa', label: 'Mapa', icon: locationOutline },
    { path: '/app/crear', label: 'Crear publicación', icon: add, primary: true },
    isBusiness
      ? { path: '/app/mi-negocio', label: 'Mi negocio', icon: briefcaseOutline }
      : { path: '/app/servicios', label: 'Veterinarias y petshops', icon: medkitOutline },
    { path: '/app/perfil', label: 'Mensajes y perfil', icon: personOutline }
  ];

  const go = (item: MenuItem) => {
    if (pathname === item.path) return;
    if (item.primary) haptics.press();
    router.push(item.path, item.primary ? 'forward' : 'none', item.primary ? 'push' : 'replace');
  };

  return (
    <nav className={styles.wrapper} aria-label="Navegación principal">
      <div className={styles.bar}>
        {items.map((item) => {
          const active = pathname.startsWith(item.path);
          const classes = [styles.item, item.primary ? styles.primary : '', active ? styles.active : ''].filter(Boolean).join(' ');
          return (
            <button key={item.path} type="button" className={classes} aria-label={item.label} aria-current={active ? 'page' : undefined} onClick={() => go(item)}>
              <IonIcon icon={item.icon} aria-hidden="true" />
              {item.path === '/app/perfil' && unreadTotal > 0 && (
                <span className={styles.badge} aria-label={`${unreadTotal} mensajes sin leer`}>
                  {unreadTotal > 9 ? '9+' : unreadTotal}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

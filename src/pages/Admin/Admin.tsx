import { useEffect, useState, type CSSProperties } from 'react';
import { IonContent, IonIcon, IonPage, IonSpinner, useIonToast } from '@ionic/react';
import { checkmarkCircleOutline, documentTextOutline, flagOutline, medkitOutline, peopleOutline, shieldCheckmarkOutline, storefrontOutline, timeOutline } from 'ionicons/icons';
import DetailHeader from '../../components/Shared/DetailHeader';
import { useScrollHeader } from '../../hooks/useScrollHeader';
import FilterChips, { type ChipOption } from '../../components/Shared/FilterChips';
import EmptyState from '../../components/Shared/EmptyState';
import { useApp } from '../../context/AppContext';
import { useRealtime } from '../../hooks/useRealtime';
import { dismissReport, fetchStats, removeReportedPost, subscribeReports, type AdminStats } from '../../services/admin.service';
import { setVerified } from '../../services/businesses.service';
import { formatNumber, timeAgo } from '../../helpers/format';
import type { Report } from '../../types';
import styles from './Admin.module.scss';

type Tab = 'reportes' | 'negocios';

/** Panel de administracion: metricas, moderacion de reportes y verificacion de negocios. */
export default function Admin() {
  const scroll = useScrollHeader(60);
  const [presentToast] = useIonToast();
  const { businesses } = useApp();
  const { data: reports, loading: reportsLoading } = useRealtime<Report[]>((onData, onError) => subscribeReports(onData, onError), [], []);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [tab, setTab] = useState<Tab>('reportes');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetchStats().then(setStats).catch(() => setStats(null));
  }, [businesses.length, reports.length]);

  const toast = (message: string) => presentToast({ message, duration: 1600, position: 'top' });

  const act = async (id: string, action: () => Promise<void>, message: string) => {
    setBusyId(id);
    try {
      await action();
      toast(message);
    } catch {
      toast('No se pudo completar la acción.');
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = businesses.filter((b) => !b.verified).length;
  const tabs: ChipOption<Tab>[] = [
    { value: 'reportes', label: `Reportes (${reports.length})`, icon: flagOutline },
    { value: 'negocios', label: `Negocios (${pendingCount} por verificar)`, icon: medkitOutline }
  ];

  const statCards = [
    { label: 'Usuarios', value: stats?.users, icon: peopleOutline, tone: styles.mint },
    { label: 'Publicaciones', value: stats?.posts, icon: documentTextOutline, tone: styles.lavender },
    { label: 'Reportes', value: reports.length, icon: flagOutline, tone: styles.pink },
    { label: 'Negocios', value: stats?.businesses, icon: storefrontOutline, tone: styles.butter }
  ];

  // Primero los negocios sin verificar.
  const sortedBusinesses = [...businesses].sort((a, b) => Number(a.verified) - Number(b.verified));

  return (
    <IonPage>
      <DetailHeader hidden={scroll.headerHidden} fallback="/app/perfil" title="Administración" />
      <IonContent fullscreen {...scroll.contentProps}>
        <div className={styles.page}>
          <h1 className={styles.title}>Panel de control.</h1>
          <p className={styles.subtitle}>Modera la comunidad y verifica los negocios.</p>

          <div className={styles.stats}>
            {statCards.map((s, i) => (
              <div key={s.label} className={`${styles.stat} ${s.tone} enter-up`} style={{ '--i': i } as CSSProperties}>
                <IonIcon icon={s.icon} aria-hidden="true" />
                <strong>{s.value === undefined ? '--' : formatNumber(s.value)}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>

          <FilterChips options={tabs} value={tab} onChange={setTab} ariaLabel="Secciones de administración" />

          {tab === 'reportes' ? (
            reportsLoading ? (
              <div className={styles.loading}>
                <IonSpinner name="dots" />
              </div>
            ) : reports.length === 0 ? (
              <EmptyState icon={checkmarkCircleOutline} title="Todo en orden" text="No hay reportes pendientes por revisar." />
            ) : (
              reports.map((r, i) => (
                <article key={r.id} className={`${styles.row} enter-up`} style={{ '--i': Math.min(i, 6) } as CSSProperties}>
                  <div className={styles.rowHead}>
                    <span className={styles.reason}>{r.reason}</span>
                    <time>{timeAgo(r.createdAt)}</time>
                  </div>
                  <p className={styles.excerpt}>{r.postExcerpt}</p>
                  <p className={styles.by}>Publicado por {r.postAuthor}</p>
                  <div className={styles.rowActions}>
                    <button type="button" className={styles.ghost} disabled={busyId === r.id} onClick={() => act(r.id, () => dismissReport(r.id), 'Reporte descartado.')}>
                      Ignorar
                    </button>
                    <button type="button" className={styles.dangerButton} disabled={busyId === r.id} onClick={() => act(r.id, () => removeReportedPost(r), 'Publicación eliminada.')}>
                      Eliminar publicación
                    </button>
                  </div>
                </article>
              ))
            )
          ) : sortedBusinesses.length === 0 ? (
            <EmptyState icon={storefrontOutline} title="Sin negocios" text="Aún no se ha registrado ninguna veterinaria o petshop." />
          ) : (
            sortedBusinesses.map((b, i) => (
              <article key={b.id} className={`${styles.row} ${styles.vetRow} enter-up`} style={{ '--i': Math.min(i, 6) } as CSSProperties}>
                <div className={styles.vetInfo}>
                  <strong>{b.name}</strong>
                  <span>
                    {b.type === 'vet' ? 'Veterinaria' : 'Petshop'} · {b.address}
                    {b.neighborhood && `, ${b.neighborhood}`}
                  </span>
                  {b.phone && <span>Tel. {b.phone}</span>}
                </div>
                {b.verified ? (
                  <button type="button" className={styles.verified} disabled={busyId === b.id} onClick={() => act(b.id, () => setVerified(b.id, false), 'Verificación retirada.')}>
                    <IonIcon icon={shieldCheckmarkOutline} aria-hidden="true" />
                    Verificada
                  </button>
                ) : (
                  <button type="button" className={styles.darkButton} disabled={busyId === b.id} onClick={() => act(b.id, () => setVerified(b.id, true), 'Negocio verificado.')}>
                    {busyId === b.id ? <IonSpinner name="dots" /> : (
                      <>
                        <IonIcon icon={timeOutline} aria-hidden="true" /> Verificar
                      </>
                    )}
                  </button>
                )}
              </article>
            ))
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}

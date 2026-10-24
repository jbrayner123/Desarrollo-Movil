import React, { useEffect, useState, useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonToast,
  IonAlert,
  IonButtons
} from '@ionic/react';
import {
  cameraOutline,
  logOutOutline,
  personOutline,
  addOutline,
  syncOutline,
  trashOutline,
  createOutline,
  checkmarkOutline,
  ellipseOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Tarea } from '../types';
import { useNavigate } from 'react-router-dom';

export const TasksPage: React.FC = () => {
  const { user, signOut, avatarUrl, updateAvatarFromUrl } = useAuth();
  const navigate = useNavigate();

  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [filter, setFilter] = useState<'todas' | 'pendientes' | 'completadas'>('todas');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  // Dialogo de edicion de tarea
  const [editingTask, setEditingTask] = useState<Tarea | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Cargar tareas iniciales
  const cargarTareas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setToastColor('danger');
        setToastMessage(`Error al cargar tareas: ${error.message}`);
      } else if (data) {
        setTareas(data as Tarea[]);
      }
    } catch (err: any) {
      setToastColor('danger');
      setToastMessage(err.message || 'Error de conexion con Supabase');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Suscripcion en tiempo real (PostgreSQL changes)
  useEffect(() => {
    cargarTareas();

    const canal = supabase
      .channel('cambios-tareas')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tareas' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const nueva = payload.new as Tarea;
            setTareas((t) => [nueva, ...t.filter((x) => x.id !== nueva.id)]);
          }
          if (payload.eventType === 'UPDATE') {
            const actualizada = payload.new as Tarea;
            setTareas((t) => t.map((x) => (x.id === actualizada.id ? actualizada : x)));
          }
          if (payload.eventType === 'DELETE') {
            const eliminadaId = payload.old.id;
            setTareas((t) => t.filter((x) => x.id !== eliminadaId));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  // 3. Crear tarea
  const handleCrearTarea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaTarea.trim()) return;

    const titulo = nuevaTarea.trim();
    setNuevaTarea('');

    try {
      const { error } = await supabase.from('tareas').insert({ titulo });
      if (error) {
        setToastColor('danger');
        setToastMessage(`Error al crear tarea: ${error.message}`);
      } else {
        setToastColor('success');
        setToastMessage('Tarea registrada en base de datos.');
      }
    } catch (err: any) {
      setToastColor('danger');
      setToastMessage(err.message || 'Error inesperado al crear tarea');
    }
  };

  // 4. Alternar estado completada
  const handleToggleCompletada = async (tarea: Tarea) => {
    try {
      const { error } = await supabase
        .from('tareas')
        .update({ completada: !tarea.completada })
        .eq('id', tarea.id);

      if (error) {
        setToastColor('danger');
        setToastMessage(`Error al actualizar estado: ${error.message}`);
      }
    } catch (err: any) {
      setToastColor('danger');
      setToastMessage(err.message || 'Error al actualizar');
    }
  };

  // 5. Guardar edicion de titulo
  const handleGuardarEdicion = async (nuevoTitulo: string) => {
    if (!editingTask || !nuevoTitulo.trim()) return;
    try {
      const { error } = await supabase
        .from('tareas')
        .update({ titulo: nuevoTitulo.trim() })
        .eq('id', editingTask.id);

      if (error) {
        setToastColor('danger');
        setToastMessage(`Error al editar titulo: ${error.message}`);
      } else {
        setToastColor('success');
        setToastMessage('Titulo de tarea modificado.');
      }
    } catch (err: any) {
      setToastColor('danger');
      setToastMessage(err.message || 'Error al editar tarea');
    } finally {
      setEditingTask(null);
    }
  };

  // 6. Eliminar tarea
  const handleEliminarTarea = async (id: number) => {
    try {
      const { error } = await supabase.from('tareas').delete().eq('id', id);
      if (error) {
        setToastColor('danger');
        setToastMessage(`Error al eliminar: ${error.message}`);
      } else {
        setToastColor('success');
        setToastMessage('Tarea eliminada de la base de datos.');
      }
    } catch (err: any) {
      setToastColor('danger');
      setToastMessage(err.message || 'Error al eliminar');
    }
  };

  // 7. Captura y subida de Avatar a Storage con RLS
  const procesarYSubirAvatar = async (blob: Blob) => {
    if (!user) return;
    setIsUploadingAvatar(true);

    try {
      const ruta = `${user.id}/${Date.now()}-avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(ruta, blob, {
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) {
        setToastColor('danger');
        setToastMessage(`Error al subir imagen a Storage: ${uploadError.message}`);
        return;
      }

      // Obtener URL publica
      const { data } = supabase.storage.from('avatars').getPublicUrl(ruta);
      if (data?.publicUrl) {
        updateAvatarFromUrl(data.publicUrl);
        setToastColor('success');
        setToastMessage('Avatar actualizado y almacenado en Supabase Storage.');
      }
    } catch (err: any) {
      setToastColor('danger');
      setToastMessage(err.message || 'Error durante la subida del avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleTomarFoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        promptLabelHeader: 'Seleccionar Fuente de Avatar',
        promptLabelPhoto: 'Elegir desde la Galeria',
        promptLabelPicture: 'Tomar Foto con Camara'
      });

      if (image?.webPath) {
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        await procesarYSubirAvatar(blob);
      }
    } catch (err: any) {
      // Si el usuario cancelo o estamos en un entorno sin soporte nativo directo, intentamos fallback
      if (err.message && err.message.includes('User cancelled')) {
        return;
      }
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await procesarYSubirAvatar(file);
    }
  };

  const handleCerrarSesion = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  // Filtrado de tareas
  const tareasFiltradas = tareas.filter((item) => {
    if (filter === 'pendientes') return !item.completada;
    if (filter === 'completadas') return item.completada;
    return true;
  });

  const totalTareas = tareas.length;
  const completadasCount = tareas.filter((t) => t.completada).length;
  const pendientesCount = totalTareas - completadasCount;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#0284c7' }} />
              <span style={{ fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                PANEL DE TAREAS SUPABASE
              </span>
            </div>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              color="danger"
              onClick={handleCerrarSesion}
              style={{ fontWeight: 600, fontSize: '0.82rem' }}
            >
              <IonIcon slot="start" icon={logOutOutline} />
              Salir
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Tarjeta de Perfil Superior con Avatar y Camara Nativa */}
        <div className="profile-card">
          <div
            className="avatar-wrapper"
            onClick={handleTomarFoto}
            title="Presiona para cambiar avatar con la camara"
          >
            {isUploadingAvatar ? (
              <IonSpinner name="crescent" style={{ color: '#38bdf8' }} />
            ) : avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="avatar-image" />
            ) : (
              <IonIcon icon={personOutline} style={{ fontSize: '32px', color: '#64748b' }} />
            )}
            <div className="avatar-overlay-btn">
              <IonIcon icon={cameraOutline} />
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileInputChange}
          />

          <div className="profile-info">
            <h2 className="profile-name">
              {(user?.user_metadata?.nombre as string) || user?.email?.split('@')[0] || 'Usuario Autenticado'}
            </h2>
            <p className="profile-email">{user?.email}</p>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              <span className="profile-badge">RLS AISLADO</span>
              <span className={`tech-badge ${realtimeConnected ? 'connected' : 'disconnected'}`}>
                <span className="live-indicator" style={{ background: realtimeConnected ? '#10b981' : '#ef4444' }} />
                {realtimeConnected ? 'REALTIME: ACTIVO' : 'REALTIME: CONECTANDO'}
              </span>
            </div>
          </div>
        </div>

        {/* Resumen Metrico */}
        <div className="stats-grid">
          <div className="stat-item">
            <p className="stat-number">{totalTareas}</p>
            <p className="stat-label">Total</p>
          </div>
          <div className="stat-item">
            <p className="stat-number" style={{ color: '#f59e0b' }}>{pendientesCount}</p>
            <p className="stat-label">Pendientes</p>
          </div>
          <div className="stat-item">
            <p className="stat-number" style={{ color: '#10b981' }}>{completadasCount}</p>
            <p className="stat-label">Completadas</p>
          </div>
        </div>

        {/* Formulario de Nueva Tarea */}
        <form onSubmit={handleCrearTarea}>
          <div className="input-container">
            <input
              type="text"
              placeholder="Escribe una nueva tarea..."
              value={nuevaTarea}
              onChange={(e) => setNuevaTarea(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                flex: 1,
                fontSize: '0.92rem'
              }}
            />
            <IonButton
              type="submit"
              size="small"
              color="primary"
              disabled={!nuevaTarea.trim()}
              style={{ margin: 0, fontWeight: 600 }}
            >
              <IonIcon slot="icon-only" icon={addOutline} />
            </IonButton>
          </div>
        </form>

        {/* Barra de Filtros y Recarga Manual */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['todas', 'pendientes', 'completadas'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilter(mode)}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  borderRadius: 4,
                  border: '1px solid #1e293b',
                  background: filter === mode ? '#0284c7' : '#0f172a',
                  color: filter === mode ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          <IonButton
            fill="clear"
            size="small"
            color="medium"
            onClick={cargarTareas}
            disabled={isLoading}
            style={{ margin: 0 }}
          >
            <IonIcon slot="icon-only" icon={syncOutline} />
          </IonButton>
        </div>

        {/* Lista de Tareas */}
        {isLoading && tareas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <IonSpinner name="crescent" style={{ color: '#0284c7' }} />
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 8 }}>Cargando tareas con RLS...</p>
          </div>
        ) : tareasFiltradas.length === 0 ? (
          <div className="tech-panel" style={{ textAlign: 'center', padding: '32px 16px' }}>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.88rem' }}>
              No hay tareas registradas en esta seccion.
            </p>
          </div>
        ) : (
          <div>
            {tareasFiltradas.map((tarea) => (
              <div
                key={tarea.id}
                style={{
                  background: '#131d33',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div
                  onClick={() => handleToggleCompletada(tarea)}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 26,
                    height: 26,
                    borderRadius: 4,
                    background: tarea.completada ? '#10b981' : '#0f172a',
                    border: tarea.completada ? '1px solid #10b981' : '1px solid #334155',
                    color: '#ffffff'
                  }}
                >
                  <IonIcon
                    icon={tarea.completada ? checkmarkOutline : ellipseOutline}
                    style={{ fontSize: 16 }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    className={tarea.completada ? 'task-title-completed' : 'task-title-text'}
                    style={{ margin: 0, wordBreak: 'break-word' }}
                  >
                    {tarea.titulo}
                  </p>
                  <span className="task-meta">
                    {new Date(tarea.created_at).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <IonButton
                    fill="clear"
                    size="small"
                    color="primary"
                    onClick={() => setEditingTask(tarea)}
                    style={{ margin: 0 }}
                  >
                    <IonIcon slot="icon-only" icon={createOutline} />
                  </IonButton>

                  <IonButton
                    fill="clear"
                    size="small"
                    color="danger"
                    onClick={() => handleEliminarTarea(tarea.id)}
                    style={{ margin: 0 }}
                  >
                    <IonIcon slot="icon-only" icon={trashOutline} />
                  </IonButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dialogo de Modificacion de Titulo */}
        <IonAlert
          isOpen={!!editingTask}
          header="Editar Titulo de Tarea"
          subHeader="Modificacion protegida con politica RLS de Supabase"
          inputs={[
            {
              name: 'titulo',
              type: 'text',
              placeholder: 'Nuevo titulo de la tarea',
              value: editingTask?.titulo || ''
            }
          ]}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => setEditingTask(null)
            },
            {
              text: 'Guardar',
              handler: (data) => {
                handleGuardarEdicion(data.titulo);
              }
            }
          ]}
          onDidDismiss={() => setEditingTask(null)}
        />

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage || ''}
          duration={3000}
          color={toastColor}
          onDidDismiss={() => setToastMessage(null)}
        />
      </IonContent>
    </IonPage>
  );
};

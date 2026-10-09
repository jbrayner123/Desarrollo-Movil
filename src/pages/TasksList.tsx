// src/pages/TasksList.tsx
import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonBadge,
  IonNote,
  IonFab,
  IonFabButton,
  IonAlert,
  useIonRouter
} from '@ionic/react';
import {
  logOutOutline,
  addOutline,
  createOutline,
  trashOutline,
  calendarOutline,
  eyeOutline
} from 'ionicons/icons';
import { useAuthContext } from '../context/AuthContext';
import { useTasksContext } from '../context/TasksContext';

/**
 * Pantalla principal del Dashboard: Lista de Tareas
 * Mantiene la estética visual del Reto 3 con FAB y opciones CRUD completas
 */
const TasksList: React.FC = () => {
  const router = useIonRouter();
  const { user, logout } = useAuthContext();
  const { tasks, toggleTaskStatus, deleteTask } = useTasksContext();

  // Estados para alertas de confirmación
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  const handleConfirmLogout = async () => {
    await logout();
    router.push('/login', 'root', 'replace');
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  return (
    <IonPage>
      {/* Encabezado nativo de Ionic con barra de herramientas */}
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonTitle>Mis Tareas</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => setShowLogoutAlert(true)}
              title="Cerrar Sesión"
              aria-label="Cerrar Sesión"
            >
              <IonIcon slot="icon-only" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="container-responsive">
          {/* Tarjeta de bienvenida con información del usuario autenticado */}
          <IonCard>
            <IonCardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <IonCardTitle style={{ fontSize: '1.15rem' }}>
                    ¡Hola, {user?.email ? user.email.split('@')[0] : 'Usuario'}! 👋
                  </IonCardTitle>
                  <IonNote color="medium" style={{ fontSize: '0.82rem' }}>
                    Sesión activa: {user?.email || 'Autenticado'}
                  </IonNote>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <IonBadge color="primary" className="badge-pill">
                    {pendingCount} pendientes
                  </IonBadge>
                  <IonBadge color="success" className="badge-pill">
                    {completedCount} listas
                  </IonBadge>
                </div>
              </div>
            </IonCardHeader>
          </IonCard>

          {/* Listado de tareas con estética del Reto 3 */}
          <IonCard>
            <IonCardHeader style={{ paddingBottom: '8px' }}>
              <IonCardTitle style={{ fontSize: '1.1rem' }}>Listado de Actividades</IonCardTitle>
            </IonCardHeader>

            <IonList lines="none" style={{ padding: '0 8px 12px 8px' }}>
              {tasks.length === 0 ? (
                <IonItem lines="none" className="ion-text-center">
                  <IonLabel color="medium">
                    <p style={{ padding: '24px 0', fontSize: '0.98rem' }}>
                      No tienes tareas registradas. Presiona el botón <strong>+</strong> para crear una.
                    </p>
                  </IonLabel>
                </IonItem>
              ) : (
                tasks.map((task) => (
                  <IonItem key={task.id} lines="full" className="task-item-modern">
                    {/* Checkbox nativo para alternar completado */}
                    <IonCheckbox
                      slot="start"
                      checked={task.completed}
                      onIonChange={() => toggleTaskStatus(task.id)}
                      aria-label={`Marcar como completada ${task.title}`}
                    />

                    {/* Texto con tachado condicional e interacción a detalle */}
                    <IonLabel
                      className="task-title-link"
                      onClick={() => router.push(`/tasks/${task.id}`, 'forward', 'push')}
                      style={{
                        textDecoration: task.completed ? 'line-through' : 'none',
                        opacity: task.completed ? 0.55 : 1,
                        cursor: 'pointer'
                      }}
                    >
                      <h2 style={{ fontWeight: 600, fontSize: '0.98rem', margin: '2px 0' }}>
                        {task.title}
                      </h2>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                        <IonBadge color="light" style={{ fontSize: '0.72rem', borderRadius: '6px' }}>
                          {task.category || 'General'}
                        </IonBadge>
                        {task.date && (
                          <IonNote color="medium" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <IonIcon icon={calendarOutline} style={{ fontSize: '11px' }} />
                            {task.date}
                          </IonNote>
                        )}
                      </div>
                    </IonLabel>

                    {/* Botón para ver detalle */}
                    <IonButton
                      slot="end"
                      fill="clear"
                      color="medium"
                      onClick={() => router.push(`/tasks/${task.id}`, 'forward', 'push')}
                      title="Ver detalle"
                      aria-label="Ver detalle"
                    >
                      <IonIcon slot="icon-only" icon={eyeOutline} />
                    </IonButton>

                    {/* Botón para editar */}
                    <IonButton
                      slot="end"
                      fill="clear"
                      className="btn-edit-task"
                      onClick={() => router.push(`/tasks/edit/${task.id}`, 'forward', 'push')}
                      title="Editar tarea"
                      aria-label="Editar tarea"
                    >
                      <IonIcon slot="icon-only" icon={createOutline} />
                    </IonButton>

                    {/* Botón para eliminar */}
                    <IonButton
                      slot="end"
                      fill="clear"
                      className="btn-delete-task"
                      onClick={() => setTaskToDelete(task.id)}
                      title="Eliminar tarea"
                      aria-label="Eliminar tarea"
                    >
                      <IonIcon slot="icon-only" icon={trashOutline} />
                    </IonButton>
                  </IonItem>
                ))
              )}
            </IonList>
          </IonCard>
        </div>

        {/* Botón de Acción Flotante (FAB) para crear tarea */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ margin: '0 8px 12px 0' }}>
          <IonFabButton
            color="primary"
            onClick={() => router.push('/tasks/new', 'forward', 'push')}
            title="Crear Nueva Tarea"
            aria-label="Crear Nueva Tarea"
          >
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* Alerta de confirmación para Cerrar Sesión */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Cerrar Sesión"
          message="¿Estás seguro de que deseas salir del sistema?"
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Cerrar Sesión',
              role: 'destructive',
              handler: handleConfirmLogout,
            },
          ]}
        />

        {/* Alerta de confirmación para Eliminar Tarea */}
        <IonAlert
          isOpen={!!taskToDelete}
          onDidDismiss={() => setTaskToDelete(null)}
          header="Eliminar Tarea"
          message="Esta acción no se puede deshacer. ¿Deseas eliminar la tarea?"
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: handleConfirmDelete,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default TasksList;

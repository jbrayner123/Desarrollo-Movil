// src/pages/TaskDetail.tsx
import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonButton,
  IonIcon,
  IonAlert,
  IonNote,
  useIonRouter
} from '@ionic/react';
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  createOutline,
  trashOutline,
  calendarOutline,
  pricetagOutline
} from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { useTasksContext } from '../context/TasksContext';

type RouteParams = {
  [key: string]: string | undefined;
  id?: string;
};

/**
 * Pantalla de Detalle de Tarea (/tasks/:id)
 * Permite visualizar toda la información y realizar acciones sobre la tarea seleccionada.
 */
const TaskDetail: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const router = useIonRouter();
  const { getTaskById, toggleTaskStatus, deleteTask } = useTasksContext();

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const task = getTaskById(id);

  if (!task) {
    return (
      <IonPage>
        <IonHeader translucent>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tasks" />
            </IonButtons>
            <IonTitle>Tarea No Encontrada</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-padding">
          <div className="container-responsive ion-text-center">
            <IonCard>
              <IonCardContent>
                <p style={{ margin: '20px 0', fontSize: '1rem', color: '#64748b' }}>
                  La tarea solicitada no existe o fue eliminada.
                </p>
                <IonButton expand="block" onClick={() => router.push('/tasks', 'root', 'replace')}>
                  Volver a Mis Tareas
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const handleDelete = () => {
    deleteTask(task.id);
    router.push('/tasks', 'root', 'replace');
  };

  const handleToggle = () => {
    toggleTaskStatus(task.id);
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tasks" />
          </IonButtons>
          <IonTitle>Detalle de Tarea</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="container-responsive">
          <IonCard>
            <IonCardHeader>
              <div className="detail-meta-row">
                <IonBadge color={task.completed ? 'success' : 'primary'} className="badge-pill">
                  {task.completed ? 'Completada' : 'Pendiente'}
                </IonBadge>

                {task.category && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={pricetagOutline} color="medium" style={{ fontSize: '14px' }} />
                    <IonNote color="medium" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {task.category}
                    </IonNote>
                  </div>
                )}
              </div>

              <IonCardTitle style={{ fontSize: '1.4rem', lineHeight: '1.3' }}>
                {task.title}
              </IonCardTitle>

              {task.date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                  <IonIcon icon={calendarOutline} color="medium" />
                  <IonNote color="medium" style={{ fontSize: '0.88rem' }}>
                    Fecha programada: <strong>{task.date}</strong>
                  </IonNote>
                </div>
              )}
            </IonCardHeader>

            <IonCardContent>
              <div className="detail-label">Descripción de la tarea</div>
              <div className="detail-desc-box">
                {task.description ? task.description : 'Sin descripción adicional para esta tarea.'}
              </div>

              {/* Botón para alternar estado */}
              <IonButton
                expand="block"
                color={task.completed ? 'medium' : 'success'}
                onClick={handleToggle}
                className="btn-modern"
              >
                <IonIcon
                  slot="start"
                  icon={task.completed ? closeCircleOutline : checkmarkCircleOutline}
                />
                {task.completed ? 'Marcar como Pendiente' : 'Marcar como Completada'}
              </IonButton>

              {/* Botón para editar */}
              <IonButton
                expand="block"
                fill="outline"
                color="primary"
                style={{ marginTop: '10px' }}
                onClick={() => router.push(`/tasks/edit/${task.id}`, 'forward', 'push')}
              >
                <IonIcon slot="start" icon={createOutline} />
                Editar Tarea
              </IonButton>

              {/* Botón para eliminar */}
              <IonButton
                expand="block"
                fill="clear"
                color="danger"
                style={{ marginTop: '10px' }}
                onClick={() => setShowDeleteAlert(true)}
              >
                <IonIcon slot="start" icon={trashOutline} />
                Eliminar Tarea
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Alerta de confirmación para eliminar */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Eliminar Tarea"
          message={`¿Seguro que deseas eliminar definitivamente "${task.title}"?`}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: handleDelete,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default TaskDetail;

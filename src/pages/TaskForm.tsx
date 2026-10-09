// src/pages/TaskForm.tsx
import React, { useState, useEffect } from 'react';
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
  IonItem,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonToast,
  IonText,
  useIonRouter
} from '@ionic/react';
import { saveOutline, closeCircleOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { useTasksContext } from '../context/TasksContext';

type RouteParams = {
  [key: string]: string | undefined;
  id?: string;
};

/**
 * Formulario unificado para Creación (/tasks/new) y Edición (/tasks/edit/:id) de Tareas
 */
const TaskForm: React.FC = () => {
  const router = useIonRouter();
  const { id } = useParams<RouteParams>();
  const isEditing = Boolean(id);

  const { addTask, updateTask, getTaskById } = useTasksContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Estudio');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Si estamos en modo edición, cargamos los datos de la tarea existente
  useEffect(() => {
    if (id) {
      const existing = getTaskById(id);
      if (existing) {
        setTitle(existing.title);
        setDescription(existing.description || '');
        setCategory(existing.category || 'General');
        setDate(existing.date || new Date().toISOString().split('T')[0]);
      } else {
        setErrorMessage('La tarea que intentas editar no existe.');
      }
    }
  }, [id, getTaskById]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage('El título de la tarea es obligatorio.');
      return;
    }

    if (isEditing && id) {
      updateTask(id, {
        title: title.trim(),
        description: description.trim(),
        category,
        date,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        completed: false,
        category,
        date,
      });
    }

    // Regresar a la lista de tareas
    router.push('/tasks', 'root', 'replace');
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tasks" />
          </IonButtons>
          <IonTitle>{isEditing ? 'Editar Tarea' : 'Nueva Tarea'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="container-responsive">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                {isEditing ? 'Modificar Tarea' : 'Crear Nueva Tarea'}
              </IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <form onSubmit={handleSubmit}>
                {/* Título de la tarea */}
                <IonItem lines="none" className="task-input-item">
                  <IonInput
                    label="Título de la tarea *"
                    labelPlacement="floating"
                    placeholder="Ej. Revisar presentación de Firebase"
                    value={title}
                    onIonInput={(e) => {
                      setTitle(e.detail.value || '');
                      if (errorMessage) setErrorMessage(null);
                    }}
                    required
                  />
                </IonItem>

                {/* Categoría */}
                <IonItem lines="none" className="task-input-item">
                  <IonSelect
                    label="Categoría"
                    labelPlacement="floating"
                    value={category}
                    onIonChange={(e) => setCategory(e.detail.value)}
                  >
                    <IonSelectOption value="Estudio">Estudio / Universidad</IonSelectOption>
                    <IonSelectOption value="Trabajo">Trabajo</IonSelectOption>
                    <IonSelectOption value="Personal">Personal</IonSelectOption>
                    <IonSelectOption value="Salud">Salud</IonSelectOption>
                    <IonSelectOption value="General">General</IonSelectOption>
                  </IonSelect>
                </IonItem>

                {/* Fecha */}
                <IonItem lines="none" className="task-input-item">
                  <IonInput
                    label="Fecha de entrega / límite"
                    labelPlacement="floating"
                    type="date"
                    value={date}
                    onIonInput={(e) => setDate(e.detail.value || '')}
                  />
                </IonItem>

                {/* Descripción detallada */}
                <IonItem lines="none" className="task-input-item">
                  <IonTextarea
                    label="Descripción detallada"
                    labelPlacement="floating"
                    placeholder="Escribe notas, especificaciones o detalles de la tarea..."
                    rows={4}
                    value={description}
                    onIonInput={(e) => setDescription(e.detail.value || '')}
                  />
                </IonItem>

                {errorMessage && (
                  <IonText color="danger">
                    <p style={{ margin: '8px 0', fontSize: '0.85rem' }}>{errorMessage}</p>
                  </IonText>
                )}

                {/* Botón de guardar */}
                <IonButton
                  expand="block"
                  type="submit"
                  className="btn-add-task"
                >
                  <IonIcon slot="start" icon={saveOutline} />
                  {isEditing ? 'Guardar Cambios' : 'Crear Tarea'}
                </IonButton>

                {/* Botón de cancelar */}
                <IonButton
                  expand="block"
                  fill="clear"
                  color="medium"
                  style={{ marginTop: '8px' }}
                  onClick={() => router.push('/tasks', 'back', 'pop')}
                >
                  <IonIcon slot="start" icon={closeCircleOutline} />
                  Cancelar
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
        </div>

        <IonToast
          isOpen={!!errorMessage}
          onDidDismiss={() => setErrorMessage(null)}
          message={errorMessage || ''}
          duration={3000}
          color="danger"
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default TaskForm;

// src/pages/FruitsList.tsx
import React, { useState, useEffect } from 'react';
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
  IonBadge,
  IonFab,
  IonFabButton,
  IonAlert,
  IonModal,
  IonInput,
  IonSearchbar,
  IonSpinner,
  IonText,
  IonNote
} from '@ionic/react';
import {
  addOutline,
  createOutline,
  trashOutline,
  businessOutline,
  calendarOutline,
  closeCircleOutline,
  saveOutline,
  logOutOutline,
  leafOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { useDexie } from '../hooks/useDexie';
import { useAuthContext } from '../context/AuthContext';
import { NetworkStatusBar } from '../components/NetworkStatusBar';
import { AppBottomNav } from '../components/AppBottomNav';
import { Fruta } from '../db/db';

/**
 * Módulo de Frutas - Almacenamiento Local Indexado con Dexie.js (IndexedDB)
 * Arquitectura Offline-First: Funciona 100% sin conexión a internet.
 * Las acciones de escritura (crear, editar, eliminar) NUNCA se bloquean por estado de red.
 */
const FruitsList: React.FC = () => {
  const {
    results: fruits,
    isPending,
    add,
    update,
    deleteItem
  } = useDexie<Fruta>('frutas');

  const { logout } = useAuthContext();

  // Estados locales
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFruit, setEditingFruit] = useState<Fruta | null>(null);
  const [fruitToDelete, setFruitToDelete] = useState<number | null>(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // Campos de formulario
  const [nombre, setNombre] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [fechaCosecha, setFechaCosecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState<string | null>(null);

  // Inicialización con datos de muestra si la base local está vacía
  useEffect(() => {
    const seedInitialFruits = async () => {
      if (fruits.length === 0 && !isPending) {
        try {
          await add({
            nombre: 'Aguacate Hass Premium',
            proveedor: 'Agroexportadora Antioquia S.A.S.',
            fechaCosecha: '2026-10-15'
          });
          await add({
            nombre: 'Platano Harton de Exportacion',
            proveedor: 'Plataneros del Uraba',
            fechaCosecha: '2026-10-18'
          });
          await add({
            nombre: 'Mango Tommy Atkins',
            proveedor: 'Frutales del Magdalena',
            fechaCosecha: '2026-10-20'
          });
        } catch {
          // Ignorar si ya fueron insertados
        }
      }
    };
    seedInitialFruits();
  }, [fruits.length, isPending, add]);

  const openCreateModal = () => {
    setEditingFruit(null);
    setNombre('');
    setProveedor('');
    setFechaCosecha(new Date().toISOString().split('T')[0]);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (fruit: Fruta) => {
    setEditingFruit(fruit);
    setNombre(fruit.nombre || '');
    setProveedor(fruit.proveedor || '');
    setFechaCosecha(fruit.fechaCosecha || new Date().toISOString().split('T')[0]);
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !proveedor.trim()) {
      setFormError('El nombre de la fruta y el proveedor son obligatorios.');
      return;
    }

    try {
      if (editingFruit && editingFruit.id) {
        await update(editingFruit.id, {
          nombre: nombre.trim(),
          proveedor: proveedor.trim(),
          fechaCosecha
        });
      } else {
        await add({
          nombre: nombre.trim(),
          proveedor: proveedor.trim(),
          fechaCosecha
        });
      }
      setShowModal(false);
    } catch (err: any) {
      setFormError(err?.message || 'Error al guardar la fruta en Dexie.');
    }
  };

  const handleConfirmDelete = async () => {
    if (fruitToDelete !== null) {
      await deleteItem(fruitToDelete);
      setFruitToDelete(null);
    }
  };

  // Filtrado de frutas
  const filteredFruits = fruits.filter((f) => {
    const term = searchText.toLowerCase();
    return (
      f.nombre?.toLowerCase().includes(term) ||
      f.proveedor?.toLowerCase().includes(term)
    );
  });

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonTitle>Frutas (Dexie IndexedDB)</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowLogoutAlert(true)} title="Cerrar Sesion">
              <IonIcon slot="icon-only" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="container-responsive">
          {/* Indicador de red - módulo Dexie local */}
          <NetworkStatusBar moduleName="Frutas (Dexie IndexedDB)" isFirebaseModule={false} />

          {/* Tarjeta de estado y busqueda */}
          <IonCard>
            <IonCardHeader style={{ paddingBottom: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <IonCardTitle style={{ fontSize: '1.15rem' }}>Inventario de Frutas</IonCardTitle>
                  <IonNote color="medium" style={{ fontSize: '0.80rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={shieldCheckmarkOutline} style={{ color: 'var(--ion-color-success, #2dd36f)' }} />
                    Persistencia local Dexie (Offline-First)
                  </IonNote>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <IonBadge color="primary" className="badge-pill">
                    {fruits.length} registros
                  </IonBadge>
                  <IonBadge color="success" style={{ fontSize: '0.70rem' }}>
                    IndexedDB
                  </IonBadge>
                </div>
              </div>
            </IonCardHeader>

            <div style={{ padding: '0 8px 8px 8px' }}>
              <IonSearchbar
                value={searchText}
                onIonInput={(e) => setSearchText(e.detail.value || '')}
                placeholder="Buscar fruta o proveedor..."
                debounce={200}
                showClearButton="focus"
              />
            </div>
          </IonCard>

          {/* Lista de Frutas */}
          <IonCard>
            {isPending && fruits.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                <IonSpinner name="crescent" color="primary" />
              </div>
            ) : (
              <IonList lines="none" style={{ padding: '4px 8px' }}>
                {filteredFruits.length === 0 ? (
                  <IonItem lines="none" className="ion-text-center">
                    <IonLabel color="medium">
                      <p style={{ padding: '24px 0', fontSize: '0.98rem' }}>
                        {searchText
                          ? 'No se encontraron frutas que coincidan con la busqueda.'
                          : 'No hay frutas registradas en Dexie. Presiona + para registrar una.'}
                      </p>
                    </IonLabel>
                  </IonItem>
                ) : (
                  filteredFruits.map((fruit) => (
                    <IonItem key={fruit.id} lines="full" className="task-item-modern">
                      {/* Icono de fruta */}
                      <div
                        slot="start"
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--ion-color-step-150, #e2e8f0)',
                          color: 'var(--ion-color-primary, #3880ff)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem',
                          flexShrink: 0
                        }}
                      >
                        <IonIcon icon={leafOutline} />
                      </div>

                      {/* Detalles de la fruta */}
                      <IonLabel>
                        <h2 style={{ fontWeight: 600, fontSize: '1rem', margin: '2px 0' }}>
                          {fruit.nombre}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                          <IonNote color="medium" style={{ fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <IonIcon icon={businessOutline} style={{ fontSize: '12px' }} />
                            <span>Proveedor: {fruit.proveedor}</span>
                          </IonNote>
                          <IonNote color="medium" style={{ fontSize: '0.80rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <IonIcon icon={calendarOutline} style={{ fontSize: '12px' }} />
                            <span>Cosecha: {fruit.fechaCosecha}</span>
                          </IonNote>
                        </div>
                      </IonLabel>

                      {/* Boton para editar (siempre activo offline) */}
                      <IonButton
                        slot="end"
                        fill="clear"
                        onClick={() => openEditModal(fruit)}
                        title="Editar fruta"
                        aria-label="Editar fruta"
                      >
                        <IonIcon slot="icon-only" icon={createOutline} />
                      </IonButton>

                      {/* Boton para eliminar (siempre activo offline) */}
                      <IonButton
                        slot="end"
                        fill="clear"
                        color="danger"
                        onClick={() => fruit.id !== undefined && setFruitToDelete(fruit.id)}
                        title="Eliminar fruta"
                        aria-label="Eliminar fruta"
                      >
                        <IonIcon slot="icon-only" icon={trashOutline} />
                      </IonButton>
                    </IonItem>
                  ))
                )}
              </IonList>
            )}
          </IonCard>
        </div>

        {/* FAB para agregar fruta (siempre activo offline) */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ margin: '0 8px 12px 0' }}>
          <IonFabButton
            color="primary"
            onClick={openCreateModal}
            title="Registrar Fruta (IndexedDB)"
            aria-label="Registrar Fruta"
          >
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* Modal de Creacion / Edicion de Fruta */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>{editingFruit ? 'Editar Fruta' : 'Nueva Fruta (Dexie)'}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  <IonIcon slot="icon-only" icon={closeCircleOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            <div className="container-responsive">
              <NetworkStatusBar moduleName="Frutas (Dexie)" isFirebaseModule={false} />

              <form onSubmit={handleSave} style={{ marginTop: '12px' }}>
                <IonItem lines="none" className="task-input-item">
                  <IonInput
                    label="Nombre de la fruta *"
                    labelPlacement="floating"
                    placeholder="Ej. Naranja Valencia"
                    value={nombre}
                    onIonInput={(e) => setNombre(e.detail.value || '')}
                    required
                  />
                </IonItem>

                <IonItem lines="none" className="task-input-item">
                  <IonInput
                    label="Proveedor / Finca *"
                    labelPlacement="floating"
                    placeholder="Ej. Citricos del Valle"
                    value={proveedor}
                    onIonInput={(e) => setProveedor(e.detail.value || '')}
                    required
                  />
                </IonItem>

                <IonItem lines="none" className="task-input-item">
                  <IonInput
                    label="Fecha de cosecha"
                    labelPlacement="floating"
                    type="date"
                    value={fechaCosecha}
                    onIonInput={(e) => setFechaCosecha(e.detail.value || '')}
                    required
                  />
                </IonItem>

                {formError && (
                  <IonText color="danger">
                    <p style={{ margin: '8px 0', fontSize: '0.85rem' }}>{formError}</p>
                  </IonText>
                )}

                <IonButton
                  expand="block"
                  type="submit"
                  className="btn-add-task"
                  style={{ marginTop: '20px' }}
                >
                  <IonIcon slot="start" icon={saveOutline} />
                  {editingFruit ? 'Guardar Cambios' : 'Registrar en Dexie'}
                </IonButton>

                <IonButton
                  expand="block"
                  fill="clear"
                  color="medium"
                  style={{ marginTop: '8px' }}
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </IonButton>
              </form>
            </div>
          </IonContent>
        </IonModal>

        {/* Alerta de confirmacion de eliminacion */}
        <IonAlert
          isOpen={fruitToDelete !== null}
          onDidDismiss={() => setFruitToDelete(null)}
          header="Eliminar Fruta"
          message="Esta accion eliminara definitivamente el registro de IndexedDB local. Deseas continuar?"
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: handleConfirmDelete
            }
          ]}
        />

        {/* Alerta de confirmacion de cierre de sesion */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Cerrar Sesion"
          message="Deseas salir del sistema?"
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Cerrar Sesion',
              role: 'destructive',
              handler: async () => {
                await logout();
              }
            }
          ]}
        />
      </IonContent>

      {/* Navegación inferior persistente */}
      <AppBottomNav />
    </IonPage>
  );
};

export default FruitsList;

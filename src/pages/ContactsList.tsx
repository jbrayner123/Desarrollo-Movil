// src/pages/ContactsList.tsx
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
  IonBadge,
  IonFab,
  IonFabButton,
  IonAlert,
  IonModal,
  IonInput,
  IonTextarea,
  IonSearchbar,
  IonSpinner,
  IonText,
  IonNote
} from '@ionic/react';
import {
  addOutline,
  createOutline,
  trashOutline,
  callOutline,
  mailOutline,
  closeCircleOutline,
  saveOutline,
  logOutOutline
} from 'ionicons/icons';
import { useCollection } from '../hooks/useCollection';
import { useNetwork } from '../hooks/useNetwork';
import { useAuthContext } from '../context/AuthContext';
import { NetworkStatusBar } from '../components/NetworkStatusBar';
import { AppBottomNav } from '../components/AppBottomNav';
import { Contact } from '../types/contact';

/**
 * Módulo de Contactos persistido en Firebase Cloud Firestore
 * Gestionado a través del Custom Hook useCollection("contacts")
 * Bloqueo estricto de acciones cuando isOnline es false
 */
const ContactsList: React.FC = () => {
  const { results: contacts, isPending, add, update, remove } = useCollection<Contact>('contacts');
  const { isOnline } = useNetwork();
  const { logout } = useAuthContext();

  // Estados locales
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // Campos del formulario
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Obtener iniciales para el avatar
  const getInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const openCreateModal = () => {
    if (!isOnline) return;
    setEditingContact(null);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (contact: Contact) => {
    if (!isOnline) return;
    setEditingContact(contact);
    setName(contact.name || '');
    setPhone(contact.phone || '');
    setEmail(contact.email || '');
    setNotes(contact.notes || '');
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOnline) {
      setFormError('Se requiere conexion para sincronizar con Cloud Firestore.');
      return;
    }

    if (!name.trim() || !phone.trim()) {
      setFormError('El nombre completo y el telefono son obligatorios.');
      return;
    }

    try {
      if (editingContact && editingContact.id) {
        await update(editingContact.id, {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          notes: notes.trim()
        });
      } else {
        await add({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          notes: notes.trim()
        });
      }
      setShowModal(false);
    } catch (err: any) {
      setFormError(err?.message || 'Error al guardar el contacto.');
    }
  };

  const handleConfirmDelete = async () => {
    if (contactToDelete && isOnline) {
      await remove(contactToDelete);
      setContactToDelete(null);
    }
  };

  // Filtrado reactivo en memoria
  const filteredContacts = contacts.filter((c) => {
    const term = searchText.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.phone?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term)
    );
  });

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonTitle>Contactos (Firestore)</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowLogoutAlert(true)} title="Cerrar Sesion">
              <IonIcon slot="icon-only" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="container-responsive">
          {/* Indicador de red nativo */}
          <NetworkStatusBar moduleName="Contactos (Cloud Firestore)" isFirebaseModule={true} />

          {/* Tarjeta de busqueda y estadisticas */}
          <IonCard>
            <IonCardHeader style={{ paddingBottom: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <IonCardTitle style={{ fontSize: '1.15rem' }}>Directorio Telefonico</IonCardTitle>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <IonBadge color="primary" className="badge-pill">
                    {contacts.length} contactos
                  </IonBadge>
                  <IonBadge color="secondary" style={{ fontSize: '0.70rem' }}>
                    Cloud Firestore
                  </IonBadge>
                </div>
              </div>
            </IonCardHeader>

            <div style={{ padding: '0 8px 8px 8px' }}>
              <IonSearchbar
                value={searchText}
                onIonInput={(e) => setSearchText(e.detail.value || '')}
                placeholder="Buscar por nombre, telefono o correo..."
                debounce={200}
                showClearButton="focus"
              />
            </div>
          </IonCard>

          {/* Lista de contactos */}
          <IonCard>
            {isPending && contacts.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                <IonSpinner name="crescent" color="primary" />
              </div>
            ) : (
              <IonList lines="none" style={{ padding: '4px 8px' }}>
                {filteredContacts.length === 0 ? (
                  <IonItem lines="none" className="ion-text-center">
                    <IonLabel color="medium">
                      <p style={{ padding: '24px 0', fontSize: '0.98rem' }}>
                        {searchText
                          ? 'No se encontraron contactos que coincidan con la busqueda.'
                          : 'No hay contactos guardados en Firestore. Presiona + para registrar uno.'}
                      </p>
                    </IonLabel>
                  </IonItem>
                ) : (
                  filteredContacts.map((contact) => (
                    <IonItem key={contact.id} lines="full" className="task-item-modern">
                      {/* Avatar con iniciales */}
                      <div
                        slot="start"
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--ion-color-primary, #3880ff)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          letterSpacing: '0.5px',
                          flexShrink: 0
                        }}
                      >
                        {getInitials(contact.name || 'C')}
                      </div>

                      {/* Datos del contacto */}
                      <IonLabel>
                        <h2 style={{ fontWeight: 600, fontSize: '1rem', margin: '2px 0' }}>
                          {contact.name}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                          <IonNote color="medium" style={{ fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <IonIcon icon={callOutline} style={{ fontSize: '12px' }} />
                            <span>{contact.phone}</span>
                          </IonNote>
                          {contact.email && (
                            <IonNote color="medium" style={{ fontSize: '0.80rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <IonIcon icon={mailOutline} style={{ fontSize: '12px' }} />
                              <span>{contact.email}</span>
                            </IonNote>
                          )}
                          {contact.notes && (
                            <IonNote color="dark" style={{ fontSize: '0.78rem', fontStyle: 'italic', marginTop: '2px' }}>
                              {contact.notes}
                            </IonNote>
                          )}
                        </div>
                      </IonLabel>

                      {/* Boton para llamada rapida */}
                      <IonButton
                        slot="end"
                        fill="clear"
                        color="success"
                        href={`tel:${contact.phone}`}
                        title="Llamar"
                        aria-label={`Llamar a ${contact.name}`}
                      >
                        <IonIcon slot="icon-only" icon={callOutline} />
                      </IonButton>

                      {/* Boton para editar - bloqueado sin conexion */}
                      <IonButton
                        slot="end"
                        fill="clear"
                        disabled={!isOnline}
                        onClick={() => openEditModal(contact)}
                        title={!isOnline ? 'Conexion requerida para editar' : 'Editar contacto'}
                        aria-label="Editar contacto"
                      >
                        <IonIcon slot="icon-only" icon={createOutline} />
                      </IonButton>

                      {/* Boton para eliminar - bloqueado sin conexion */}
                      <IonButton
                        slot="end"
                        fill="clear"
                        color="danger"
                        disabled={!isOnline}
                        onClick={() => contact.id && setContactToDelete(contact.id)}
                        title={!isOnline ? 'Conexion requerida para eliminar' : 'Eliminar contacto'}
                        aria-label="Eliminar contacto"
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

        {/* FAB para agregar contacto - bloqueado sin conexion */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ margin: '0 8px 12px 0' }}>
          <IonFabButton
            color="primary"
            disabled={!isOnline}
            onClick={openCreateModal}
            title={!isOnline ? 'Conexion requerida para registrar contactos' : 'Nuevo Contacto'}
            aria-label="Nuevo Contacto"
          >
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* Modal de Creacion / Edicion de Contacto */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>{editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  <IonIcon slot="icon-only" icon={closeCircleOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            <div className="container-responsive">
              <NetworkStatusBar moduleName="Contactos" isFirebaseModule={true} />

              <form onSubmit={handleSave} style={{ marginTop: '12px' }}>
                <IonItem lines="none" className="task-input-item">
                  <IonInput
                    label="Nombre completo *"
                    labelPlacement="floating"
                    placeholder="Ej. Ana Martinez"
                    value={name}
                    disabled={!isOnline}
                    onIonInput={(e) => setName(e.detail.value || '')}
                    required
                  />
                </IonItem>

                <IonItem lines="none" className="task-input-item">
                  <IonInput
                    label="Numero de telefono *"
                    labelPlacement="floating"
                    type="tel"
                    placeholder="Ej. +57 301 234 5678"
                    value={phone}
                    disabled={!isOnline}
                    onIonInput={(e) => setPhone(e.detail.value || '')}
                    required
                  />
                </IonItem>

                <IonItem lines="none" className="task-input-item">
                  <IonInput
                    label="Correo electronico"
                    labelPlacement="floating"
                    type="email"
                    placeholder="Ej. ana.martinez@empresa.com"
                    value={email}
                    disabled={!isOnline}
                    onIonInput={(e) => setEmail(e.detail.value || '')}
                  />
                </IonItem>

                <IonItem lines="none" className="task-input-item">
                  <IonTextarea
                    label="Notas / Cargo"
                    labelPlacement="floating"
                    placeholder="Detalles sobre el contacto, rol o departamento..."
                    rows={3}
                    value={notes}
                    disabled={!isOnline}
                    onIonInput={(e) => setNotes(e.detail.value || '')}
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
                  disabled={!isOnline}
                  style={{ marginTop: '20px' }}
                >
                  <IonIcon slot="start" icon={saveOutline} />
                  {editingContact ? 'Guardar Cambios' : 'Registrar Contacto'}
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
          isOpen={!!contactToDelete}
          onDidDismiss={() => setContactToDelete(null)}
          header="Eliminar Contacto"
          message="Esta accion eliminara definitivamente el contacto de Cloud Firestore. Deseas continuar?"
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

export default ContactsList;

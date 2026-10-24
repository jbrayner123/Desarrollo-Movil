// src/pages/FilesystemPage.tsx
import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonBadge,
  IonItem,
  IonInput,
  IonTextarea,
  IonList,
  IonLabel,
  IonNote,
  IonSpinner
} from '@ionic/react';
import {
  folderOpenOutline,
  documentTextOutline,
  trashOutline,
  addCircleOutline,
  refreshOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  saveOutline,
  bookOutline
} from 'ionicons/icons';
import { useFilesystem } from '../hooks/useFilesystem';
import { Directory } from '@capacitor/filesystem';

const FilesystemPage: React.FC = () => {
  const {
    loading,
    error,
    writeFile,
    readFile,
    deleteFile,
    listFiles,
    createDir,
    deleteDir
  } = useFilesystem();

  // Estados de formulario
  const [fileName, setFileName] = useState<string>('sensor_log.json');
  const [fileContent, setFileContent] = useState<string>('{\n  "status": "active",\n  "testId": "007",\n  "timestamp": "' + new Date().toISOString() + '"\n}');
  const [readOutput, setReadOutput] = useState<string | null>(null);
  const [dirName, setDirName] = useState<string>('logs_sensores');
  const [filesList, setFilesList] = useState<any[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const refreshDirectory = async () => {
    const list = await listFiles({ directory: Directory.Documents });
    setFilesList(list);
  };

  useEffect(() => {
    refreshDirectory();
  }, []);

  const handleWrite = async () => {
    if (!fileName.trim()) return;
    try {
      const isJson = fileName.endsWith('.json');
      await writeFile({
        path: fileName.trim(),
        data: fileContent,
        directory: Directory.Documents,
        isJson
      });
      setFeedbackMsg(`Archivo "${fileName}" guardado con exito.`);
      await refreshDirectory();
    } catch {
      // error gestionado en hook
    }
  };

  const handleRead = async () => {
    if (!fileName.trim()) return;
    try {
      const isJson = fileName.endsWith('.json');
      const data = await readFile({
        path: fileName.trim(),
        directory: Directory.Documents,
        isJson
      });
      setReadOutput(typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data));
      setFeedbackMsg(`Archivo "${fileName}" leido con exito.`);
    } catch {
      setReadOutput(null);
    }
  };

  const handleDelete = async (targetFile: string) => {
    try {
      await deleteFile({
        path: targetFile,
        directory: Directory.Documents
      });
      setFeedbackMsg(`Archivo "${targetFile}" eliminado.`);
      if (readOutput && targetFile === fileName) setReadOutput(null);
      await refreshDirectory();
    } catch {
      // error gestionado
    }
  };

  const handleCreateDir = async () => {
    if (!dirName.trim()) return;
    try {
      await createDir({
        path: dirName.trim(),
        directory: Directory.Documents
      });
      setFeedbackMsg(`Directorio "${dirName}" creado.`);
      await refreshDirectory();
    } catch {
      // error
    }
  };

  const handleDeleteDir = async () => {
    if (!dirName.trim()) return;
    try {
      await deleteDir({
        path: dirName.trim(),
        directory: Directory.Documents,
        recursive: true
      });
      setFeedbackMsg(`Directorio "${dirName}" eliminado.`);
      await refreshDirectory();
    } catch {
      // error
    }
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Sistema de Archivos</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={refreshDirectory} title="Actualizar">
              <IonIcon slot="icon-only" icon={refreshOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="sensor-grid-container">
          {error && (
            <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #f87171', borderRadius: '6px', color: '#991b1b', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={alertCircleOutline} style={{ fontSize: '1.2rem', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {feedbackMsg && (
            <div style={{ padding: '8px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', color: '#166534', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '1.1rem', flexShrink: 0 }} />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Consola de Escritura y Lectura */}
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={documentTextOutline} />
                Editor de Archivo (Directory.Documents)
              </h2>
              <IonBadge color="secondary">UTF-8</IonBadge>
            </div>

            <div className="telemetry-card-content">
              <IonItem lines="none" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '12px' }}>
                <IonInput
                  label="Nombre del archivo"
                  labelPlacement="floating"
                  placeholder="ej. datos.json o reporte.txt"
                  value={fileName}
                  onIonInput={(e) => setFileName(e.detail.value || '')}
                />
              </IonItem>

              <IonItem lines="none" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '12px' }}>
                <IonTextarea
                  label="Contenido del archivo (Texto o JSON)"
                  labelPlacement="floating"
                  rows={4}
                  value={fileContent}
                  onIonInput={(e) => setFileContent(e.detail.value || '')}
                />
              </IonItem>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <IonButton
                  expand="block"
                  className="btn-sensor-action"
                  disabled={loading}
                  onClick={handleWrite}
                >
                  <IonIcon slot="start" icon={saveOutline} />
                  Escribir Archivo
                </IonButton>

                <IonButton
                  expand="block"
                  fill="outline"
                  className="btn-sensor-action"
                  disabled={loading}
                  onClick={handleRead}
                >
                  <IonIcon slot="start" icon={bookOutline} />
                  Leer Archivo
                </IonButton>
              </div>

              {readOutput !== null && (
                <div style={{ marginTop: '14px' }}>
                  <div style={{ fontSize: '0.80rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                    CONTENIDO LEIDO DE PANTALLA:
                  </div>
                  <pre className="telemetry-display-box" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {readOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Gestion de Directorios */}
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={folderOpenOutline} />
                Operaciones con Carpetas
              </h2>
            </div>
            <div className="telemetry-card-content">
              <IonItem lines="none" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '12px' }}>
                <IonInput
                  label="Nombre del Directorio"
                  labelPlacement="floating"
                  placeholder="ej. logs_sensores"
                  value={dirName}
                  onIonInput={(e) => setDirName(e.detail.value || '')}
                />
              </IonItem>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <IonButton
                  expand="block"
                  color="secondary"
                  className="btn-sensor-action"
                  disabled={loading}
                  onClick={handleCreateDir}
                >
                  <IonIcon slot="start" icon={addCircleOutline} />
                  Crear Carpeta
                </IonButton>
                <IonButton
                  expand="block"
                  color="danger"
                  fill="outline"
                  className="btn-sensor-action"
                  disabled={loading}
                  onClick={handleDeleteDir}
                >
                  <IonIcon slot="start" icon={trashOutline} />
                  Borrar Carpeta
                </IonButton>
              </div>
            </div>
          </div>

          {/* Explorador de Archivos en Documents */}
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={folderOpenOutline} />
                Archivos en Directory.Documents
              </h2>
              <IonBadge color="primary">{filesList.length}</IonBadge>
            </div>

            <div className="telemetry-card-content" style={{ padding: '8px 16px' }}>
              {loading && filesList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <IonSpinner name="crescent" color="primary" />
                </div>
              ) : filesList.length === 0 ? (
                <p style={{ margin: '14px 0', fontSize: '0.88rem', color: '#64748b', textAlign: 'center' }}>
                  El directorio Documents esta vacio. Escribe un archivo arriba para verlo listado.
                </p>
              ) : (
                <IonList lines="full">
                  {filesList.map((f, idx) => {
                    const fName = typeof f === 'string' ? f : f?.name || `file_${idx}`;
                    return (
                      <IonItem key={idx} style={{ padding: 0 }}>
                        <IonIcon slot="start" icon={documentTextOutline} color="medium" />
                        <IonLabel>
                          <h3 style={{ fontFamily: 'var(--telemetry-font-mono)', fontSize: '0.90rem', fontWeight: 600 }}>
                            {fName}
                          </h3>
                          <IonNote color="medium" style={{ fontSize: '0.78rem' }}>
                            {typeof f === 'object' && f?.size ? `${f.size} bytes` : 'Archivo de documento'}
                          </IonNote>
                        </IonLabel>
                        <IonButton
                          slot="end"
                          fill="clear"
                          color="danger"
                          onClick={() => handleDelete(fName)}
                          title="Eliminar"
                        >
                          <IonIcon slot="icon-only" icon={trashOutline} />
                        </IonButton>
                      </IonItem>
                    );
                  })}
                </IonList>
              )}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default FilesystemPage;

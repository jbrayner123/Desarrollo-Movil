// parcial-02/src/hooks/useCamera.ts
import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface UseCameraResult {
  photoUri: string | null;
  isCapturing: boolean;
  takePhoto: () => Promise<string | null>;
  clearPhoto: () => void;
  error: string | null;
}

export function useCamera(): UseCameraResult {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const takePhoto = async (): Promise<string | null> => {
    setIsCapturing(true);
    setError(null);
    try {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        promptLabelHeader: 'Evidencia de Mision',
        promptLabelPhoto: 'Elegir desde Galeria',
        promptLabelPicture: 'Tomar Fotografia'
      });

      if (image && image.webPath) {
        setPhotoUri(image.webPath);
        return image.webPath;
      }
      return null;
    } catch (err: any) {
      if (err.message && err.message.includes('cancelled')) {
        // Cancelado por el usuario
        return null;
      }
      console.warn('Error al acceder a la camara:', err);
      setError(err.message || 'Error al capturar fotografia');
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const clearPhoto = () => {
    setPhotoUri(null);
    setError(null);
  };

  return {
    photoUri,
    isCapturing,
    takePhoto,
    clearPhoto,
    error
  };
}

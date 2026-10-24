// src/hooks/useCamera.ts
import { useState, useCallback } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Custom Hook para gestionar la Camara nativa y Galeria (@capacitor/camera).
 */
export function useCamera() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Captura una foto usando la camara nativa o galeria
   */
  const takePhoto = useCallback(async (): Promise<string | null> => {
    setError(null);
    setLoading(true);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt
      });

      const path = image.webPath || image.path || null;
      setPhoto(path);
      setLoading(false);
      return path;
    } catch (err: any) {
      // Si el usuario cancela la captura no es un error critico
      if (err?.message !== 'User cancelled photos app') {
        setError(err?.message || 'Error al capturar fotografia.');
      }
      setLoading(false);
      return null;
    }
  }, []);

  const clearPhoto = useCallback(() => {
    setPhoto(null);
    setError(null);
  }, []);

  return {
    photo,
    loading,
    error,
    takePhoto,
    clearPhoto
  };
}

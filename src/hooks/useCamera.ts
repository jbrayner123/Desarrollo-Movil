import { useCallback } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Captura de fotos con @capacitor/camera, desde la camara o la galeria.
 * Devuelve la imagen comprimida como data URL, lista para subir a Cloudinary.
 * Devuelve null si el usuario cancela.
 */
export function useCamera() {
  const takePhoto = useCallback(async (source: 'camera' | 'gallery'): Promise<string | null> => {
    try {
      const photo = await Camera.getPhoto({
        source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
        resultType: CameraResultType.DataUrl,
        quality: 75,
        width: 1280,
        correctOrientation: true,
        allowEditing: false
      });
      return photo.dataUrl ?? null;
    } catch (error) {
      // Cancelar no es un error para el usuario.
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      if (message.includes('cancel')) return null;
      if (message.includes('denied') || message.includes('permission')) {
        throw new Error('Activa el permiso de cámara y fotos en los ajustes del teléfono.');
      }
      throw new Error('No se pudo obtener la foto.');
    }
  }, []);

  return { takePhoto };
}

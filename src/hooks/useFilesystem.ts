// src/hooks/useFilesystem.ts
import { useState, useCallback } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export interface WriteFileOptions {
  path: string;
  data: any;
  directory?: Directory;
  isJson?: boolean;
}

export interface ReadFileOptions {
  path: string;
  directory?: Directory;
  isJson?: boolean;
}

export interface FileEntryOptions {
  path: string;
  directory?: Directory;
}

export interface DirectoryOptions {
  path: string;
  directory?: Directory;
  recursive?: boolean;
}

/**
 * Custom Hook para gestionar el sistema de archivos nativo (@capacitor/filesystem).
 * Configurado con Directory.Documents y Encoding.UTF8 por defecto.
 */
export function useFilesystem() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Escribe un archivo de texto o JSON en el almacenamiento
   */
  const writeFile = useCallback(async ({
    path,
    data,
    directory = Directory.Documents,
    isJson = false
  }: WriteFileOptions): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const content = isJson && typeof data !== 'string' ? JSON.stringify(data, null, 2) : String(data);
      const res = await Filesystem.writeFile({
        path,
        data: content,
        directory,
        encoding: Encoding.UTF8,
        recursive: true
      });
      setLoading(false);
      return res.uri;
    } catch (err: any) {
      const msg = err?.message || 'Error al escribir el archivo.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  }, []);

  /**
   * Lee el contenido de un archivo
   */
  const readFile = useCallback(async ({
    path,
    directory = Directory.Documents,
    isJson = false
  }: ReadFileOptions): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const res = await Filesystem.readFile({
        path,
        directory,
        encoding: Encoding.UTF8
      });
      const dataStr = typeof res.data === 'string' ? res.data : '';
      const result = isJson ? JSON.parse(dataStr) : dataStr;
      setLoading(false);
      return result;
    } catch (err: any) {
      const msg = err?.message || 'Error al leer el archivo.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  }, []);

  /**
   * Elimina un archivo
   */
  const deleteFile = useCallback(async ({
    path,
    directory = Directory.Documents
  }: FileEntryOptions): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await Filesystem.deleteFile({
        path,
        directory
      });
      setLoading(false);
    } catch (err: any) {
      const msg = err?.message || 'Error al eliminar el archivo.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  }, []);

  /**
   * Lista archivos y carpetas en un directorio
   */
  const listFiles = useCallback(async ({
    path = '',
    directory = Directory.Documents
  }: { path?: string; directory?: Directory } = {}): Promise<any[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await Filesystem.readdir({
        path,
        directory
      });
      setLoading(false);
      return res.files;
    } catch (err: any) {
      const msg = err?.message || 'Error al listar archivos.';
      setError(msg);
      setLoading(false);
      return [];
    }
  }, []);

  /**
   * Crea un nuevo directorio
   */
  const createDir = useCallback(async ({
    path,
    directory = Directory.Documents
  }: FileEntryOptions): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await Filesystem.mkdir({
        path,
        directory,
        recursive: true
      });
      setLoading(false);
    } catch (err: any) {
      const msg = err?.message || 'Error al crear directorio.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  }, []);

  /**
   * Elimina un directorio existente
   */
  const deleteDir = useCallback(async ({
    path,
    directory = Directory.Documents,
    recursive = false
  }: DirectoryOptions): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await Filesystem.rmdir({
        path,
        directory,
        recursive
      });
      setLoading(false);
    } catch (err: any) {
      const msg = err?.message || 'Error al eliminar directorio.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  }, []);

  return {
    loading,
    error,
    writeFile,
    readFile,
    deleteFile,
    listFiles,
    createDir,
    deleteDir
  };
}

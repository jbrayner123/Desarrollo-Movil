// src/hooks/useDevice.ts
import { useState, useEffect, useCallback } from 'react';
import { Device, BatteryInfo, DeviceInfo, DeviceId } from '@capacitor/device';

/**
 * Custom Hook para consultar informacion y estado de hardware del dispositivo (@capacitor/device).
 */
export function useDevice() {
  const [battery, setBattery] = useState<BatteryInfo | null>(null);
  const [info, setInfo] = useState<DeviceInfo | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Consulta datos de bateria, info del sistema e identificador unico
   */
  const loadDeviceData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [bat, devInfo, idObj]: [BatteryInfo, DeviceInfo, DeviceId] = await Promise.all([
        Device.getBatteryInfo().catch(() => ({ batteryLevel: 1, isCharging: false })),
        Device.getInfo(),
        Device.getId()
      ]);

      setBattery(bat);
      setInfo(devInfo);
      setDeviceId(idObj.identifier);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Error al obtener datos del dispositivo.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeviceData();
  }, [loadDeviceData]);

  return {
    battery,
    info,
    deviceId,
    loading,
    error,
    refresh: loadDeviceData
  };
}

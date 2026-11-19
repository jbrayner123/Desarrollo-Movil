import { useEffect, useState } from 'react';
import { Device } from '@capacitor/device';

/** Por debajo de este porcentaje, sin cargador, el mapa entra en modo ahorro. */
export const LOW_BATTERY = 20;

export interface BatteryState {
  level: number | null;
  charging: boolean;
  /** true si conviene ahorrar energia (bateria baja y sin cargador). */
  lowPower: boolean;
}

/**
 * Estado de la bateria con @capacitor/device.
 * Device no emite eventos de bateria, por eso se consulta cada minuto.
 */
export function useDevice(pollMs = 60_000) {
  const [battery, setBattery] = useState<BatteryState>({ level: null, charging: false, lowPower: false });

  useEffect(() => {
    let active = true;
    const read = async () => {
      try {
        const info = await Device.getBatteryInfo();
        const level = typeof info.batteryLevel === 'number' ? Math.round(info.batteryLevel * 100) : null;
        const charging = !!info.isCharging;
        if (active) setBattery({ level, charging, lowPower: level !== null && level < LOW_BATTERY && !charging });
      } catch {
        /* sin informacion de bateria */
      }
    };
    read();
    const id = window.setInterval(read, pollMs);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [pollMs]);

  return battery;
}

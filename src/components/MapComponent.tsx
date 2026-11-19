import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonSpinner,
  IonText,
  IonToast
} from '@ionic/react';

import LeafletMap from './LeafletMap';
import SensorStatusCard from './SensorStatusCard';
import RouteHistoryModal from './RouteHistoryModal';

import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useHaptics } from '../hooks/useHaptics';
import { esBateriaBaja, useBatteryMonitor } from '../hooks/useBatteryMonitor';
import { useGeolocation } from '../hooks/useGeolocation';
import { useReverseGeocoding, type ResultadoDireccion } from '../hooks/useReverseGeocoding';
import { useRouteHistory } from '../hooks/useRouteHistory';
import { calcularDistancia } from '../services/routeStorageService';
import { tieneApiKey } from '../services/geocodingService';
import { UMBRAL_BATERIA_PORCENTAJE } from '../config/constants';
import { formatearFecha, formatearHora } from '../utils/format';
import type { Coordenada, MotivoFin, SesionRuta } from '../types';

/**
 * MapComponent (Challenge 09)
 *
 * Orquesta los hooks de sensores sobre el mapa Leaflet:
 * 1. Red (@capacitor/network): se verifica antes de consultar OpenCage o recargar el mapa.
 * 2. Hapticos (@capacitor/haptics): vibracion al iniciar y al detener el seguimiento.
 * 3. Bateria (@capacitor/device): detiene el tracking si baja del 15 % sin cargador.
 * 4. Historial (@capacitor/preferences): cada sesion se guarda como JSON.
 * 5. Geocodificacion inversa (OpenCage): direccion legible de inicio, fin y posicion actual.
 */
export default function MapComponent() {
  // ---- Hooks de sensores y servicios ----------------------------------------
  const { conectado, tipoConexion, verificarConexion } = useNetworkStatus();
  const { vibrarInicio, vibrarFin } = useHaptics();
  const { resolverDireccion } = useReverseGeocoding(verificarConexion);
  const { sesiones, guardar, eliminar, vaciar } = useRouteHistory();
  const {
    posicion,
    ruta,
    rastreando,
    error: errorGps,
    obtenerPosicionActual,
    iniciarSeguimiento,
    detenerSeguimiento
  } = useGeolocation();

  // ---- Estado de la vista ----------------------------------------------------
  const [direccionActual, setDireccionActual] = useState<ResultadoDireccion | null>(null);
  const [cargandoDireccion, setCargandoDireccion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [avisoBateria, setAvisoBateria] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const [sesionEnMapa, setSesionEnMapa] = useState<SesionRuta | null>(null);
  const [versionTeselas, setVersionTeselas] = useState(0);

  // Datos de la sesion en curso que no necesitan provocar renders.
  const inicioSesionRef = useRef<Date | null>(null);
  const direccionInicioRef = useRef<Promise<ResultadoDireccion> | null>(null);
  const deteniendoRef = useRef(false);

  const distanciaActual = useMemo(() => calcularDistancia(ruta), [ruta]);

  // ---- Direccion de la posicion actual (OpenCage con verificacion de red) ----
  const actualizarDireccion = useCallback(
    async (p: Coordenada | null) => {
      if (!p) return;
      setCargandoDireccion(true);
      setDireccionActual(await resolverDireccion(p.lat, p.lng));
      setCargandoDireccion(false);
    },
    [resolverDireccion]
  );

  // Ubicacion inicial al abrir la pantalla.
  useEffect(() => {
    obtenerPosicionActual().then(actualizarDireccion);
  }, [obtenerPosicionActual, actualizarDireccion]);

  // ---- Detener seguimiento (manual o por bateria) ----------------------------
  const stopTracking = useCallback(
    async (motivo: MotivoFin) => {
      if (deteniendoRef.current) return;
      deteniendoRef.current = true;
      setGuardando(true);

      try {
        const puntos = await detenerSeguimiento();
        await vibrarFin();

        const inicio = inicioSesionRef.current ?? new Date();
        const fin = new Date();

        if (puntos.length === 0) {
          setToast('Seguimiento detenido. No se registraron puntos GPS, la sesion no se guardo.');
          return;
        }

        const ultimo = puntos[puntos.length - 1];
        const [dirInicio, dirFin] = await Promise.all([
          direccionInicioRef.current ?? resolverDireccion(puntos[0].lat, puntos[0].lng),
          resolverDireccion(ultimo.lat, ultimo.lng)
        ]);
        setDireccionActual(dirFin);

        const sesion: SesionRuta = {
          id: `${inicio.getTime()}`,
          fecha: formatearFecha(inicio),
          horaInicio: formatearHora(inicio),
          horaFin: formatearHora(fin),
          inicioISO: inicio.toISOString(),
          finISO: fin.toISOString(),
          coordenadas: puntos,
          direccionInicio: dirInicio.direccion,
          direccionFin: dirFin.direccion,
          distanciaMetros: Math.round(calcularDistancia(puntos)),
          duracionSegundos: Math.round((fin.getTime() - inicio.getTime()) / 1000),
          motivoFin: motivo
        };

        await guardar(sesion);
        if (motivo === 'manual') setToast('Sesion guardada en el historial.');
      } finally {
        inicioSesionRef.current = null;
        direccionInicioRef.current = null;
        deteniendoRef.current = false;
        setGuardando(false);
      }
    },
    [detenerSeguimiento, vibrarFin, resolverDireccion, guardar]
  );

  // ---- Monitoreo de bateria: parada automatica bajo el umbral ----------------
  const onBateriaBaja = useCallback(
    (nivel: number) => {
      setAvisoBateria(
        `El seguimiento se detuvo automaticamente porque la bateria esta al ${nivel}% ` +
          `(umbral ${UMBRAL_BATERIA_PORCENTAJE}%). La ruta registrada se guardo en el historial.`
      );
      stopTracking('bateria_baja');
    },
    [stopTracking]
  );

  const { bateria, leerBateria } = useBatteryMonitor({ activo: rastreando, onBateriaBaja });

  // ---- Iniciar seguimiento ---------------------------------------------------
  const startTracking = useCallback(async () => {
    // No se permite iniciar con bateria critica.
    const estadoBateria = await leerBateria();
    if (esBateriaBaja(estadoBateria)) {
      setAvisoBateria(
        `No se puede iniciar el seguimiento: la bateria esta al ${estadoBateria.nivel}%. ` +
          `Conecta el cargador o espera a superar el ${UMBRAL_BATERIA_PORCENTAJE}%.`
      );
      return;
    }

    setAvisoBateria(null);
    setSesionEnMapa(null);
    inicioSesionRef.current = new Date();

    const ok = await iniciarSeguimiento((primerPunto) => {
      // La direccion de inicio se resuelve en paralelo con el primer punto GPS.
      direccionInicioRef.current = resolverDireccion(primerPunto.lat, primerPunto.lng);
    });

    if (ok) {
      await vibrarInicio();
      setToast('Seguimiento iniciado.');
    } else {
      inicioSesionRef.current = null;
    }
  }, [leerBateria, iniciarSeguimiento, resolverDireccion, vibrarInicio]);

  // ---- Recargar mapa (verifica red antes) ------------------------------------
  const recargarMapa = useCallback(async () => {
    if (!(await verificarConexion())) {
      setToast('Sin conexion a internet. El mapa no se puede recargar.');
      return;
    }
    setVersionTeselas((v) => v + 1);
    const p = await obtenerPosicionActual();
    await actualizarDireccion(p);
  }, [verificarConexion, obtenerPosicionActual, actualizarDireccion]);

  const verSesionEnMapa = (s: SesionRuta) => {
    setSesionEnMapa(s);
    setHistorialAbierto(false);
  };

  // ---- Render ----------------------------------------------------------------
  return (
    <div className="contenedor-mapa">
      {!conectado && (
        <div className="aviso aviso-neutro" role="status">
          <span>
            <strong>Sin conexion a internet.</strong> El mapa puede no cargar y las direcciones se mostraran
            como coordenadas hasta recuperar la red.
          </span>
        </div>
      )}

      {!tieneApiKey() && (
        <div className="aviso aviso-neutro" role="status">
          <span>
            <strong>OpenCage sin configurar.</strong> Agrega VITE_OPENCAGE_API_KEY en el archivo .env para
            ver direcciones legibles.
          </span>
        </div>
      )}

      {avisoBateria && (
        <div className="aviso aviso-advertencia" role="alert">
          <span>{avisoBateria}</span>
          <IonButton size="small" fill="clear" color="dark" onClick={() => setAvisoBateria(null)}>
            Entendido
          </IonButton>
        </div>
      )}

      {errorGps && (
        <div className="aviso aviso-neutro" role="alert">
          <span>
            <strong>GPS:</strong> {errorGps}
          </span>
        </div>
      )}

      <div className="marco-mapa">
        <LeafletMap
          posicion={posicion}
          rutaActiva={ruta}
          rutaHistorial={sesionEnMapa?.coordenadas ?? null}
          seguirPosicion={rastreando || !sesionEnMapa}
          versionTeselas={versionTeselas}
        />
      </div>

      {sesionEnMapa && (
        <div className="aviso aviso-neutro">
          <span>
            Mostrando ruta del {sesionEnMapa.fecha} a las {sesionEnMapa.horaInicio} (linea punteada).
          </span>
          <IonButton size="small" fill="clear" color="dark" onClick={() => setSesionEnMapa(null)}>
            Ocultar
          </IonButton>
        </div>
      )}

      <div className="acciones">
        {rastreando ? (
          <IonButton expand="block" color="danger" disabled={guardando} onClick={() => stopTracking('manual')}>
            Detener seguimiento
          </IonButton>
        ) : (
          <IonButton expand="block" color="primary" disabled={guardando} onClick={startTracking}>
            {guardando ? <IonSpinner name="dots" /> : 'Iniciar seguimiento'}
          </IonButton>
        )}

        <div className="acciones-secundarias">
          <IonButton expand="block" fill="outline" color="dark" onClick={recargarMapa}>
            Recargar mapa
          </IonButton>
          <IonButton expand="block" fill="outline" color="dark" onClick={() => setHistorialAbierto(true)}>
            Historial
            <IonBadge color="medium" className="contador">
              {sesiones.length}
            </IonBadge>
          </IonButton>
        </div>
      </div>

      <IonCard className="tarjeta">
        <IonCardHeader>
          <IonCardSubtitle>Direccion actual</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          {cargandoDireccion ? (
            <IonSpinner name="dots" />
          ) : direccionActual ? (
            <>
              <p className="direccion-texto">{direccionActual.direccion}</p>
              {direccionActual.aviso && (
                <IonText color="medium">
                  <p className="texto-ayuda">{direccionActual.aviso}</p>
                </IonText>
              )}
            </>
          ) : (
            <IonText color="medium">
              <p>Esperando ubicacion...</p>
            </IonText>
          )}
          <IonButton
            size="small"
            fill="clear"
            color="primary"
            disabled={!posicion || cargandoDireccion}
            onClick={() => actualizarDireccion(posicion)}
          >
            Actualizar direccion
          </IonButton>
        </IonCardContent>
      </IonCard>

      <SensorStatusCard
        conectado={conectado}
        tipoConexion={tipoConexion}
        bateria={bateria}
        rastreando={rastreando}
        puntos={ruta.length}
        distanciaMetros={distanciaActual}
        precision={posicion?.precision ?? null}
      />

      <RouteHistoryModal
        abierto={historialAbierto}
        sesiones={sesiones}
        onCerrar={() => setHistorialAbierto(false)}
        onVerEnMapa={verSesionEnMapa}
        onEliminar={eliminar}
        onVaciar={vaciar}
      />

      <IonToast isOpen={!!toast} message={toast ?? ''} duration={2500} onDidDismiss={() => setToast(null)} />
    </div>
  );
}

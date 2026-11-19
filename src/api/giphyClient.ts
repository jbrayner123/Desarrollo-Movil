import axios from 'axios';

/**
 * Instancia centralizada de Axios para GIPHY.
 * Fija la URL base y el tiempo maximo de espera, e inyecta la API Key en cada
 * peticion. Asi los servicios no repiten la configuracion ni manipulan la key.
 */

export const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY ?? '';

/** true si la key existe y no es el valor de ejemplo de .env.example. */
export const hasGiphyApiKey = (): boolean =>
  GIPHY_API_KEY.trim().length > 0 && GIPHY_API_KEY !== 'tu_api_key_de_giphy';

export const giphyClient = axios.create({
  baseURL: 'https://api.giphy.com/v1',
  timeout: 10_000,
  headers: { Accept: 'application/json' }
});

// Interceptor de peticion: agrega api_key a los parametros de toda llamada.
giphyClient.interceptors.request.use((config) => {
  config.params = { ...config.params, api_key: GIPHY_API_KEY };
  return config;
});

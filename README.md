# Challenge 10: Consumo de APIs Externas con GIPHY

Aplicacion movil desarrollada con **Ionic Framework** (`@ionic/react`), **TypeScript**, **Capacitor** y **Axios**, correspondiente al **Challenge 10** del curso de *Desarrollo de Software para Plataformas Moviles*.

La aplicacion permite buscar GIFs escribiendo en un campo de texto y los muestra en una cuadricula responsiva, consumiendo el endpoint de busqueda de la **API de GIPHY**. Incluye cliente HTTP centralizado, tipado completo de la respuesta, cancelacion de peticiones con `AbortController` y manejo explicito de los estados de carga, error, vacio y resultados.

---

## 1. Requisitos Previos: API Key de GIPHY

1. Crear una cuenta en [developers.giphy.com](https://developers.giphy.com/).
2. En el **Dashboard**, pulsar **Create an App**, elegir **API** y copiar la API Key generada.
3. Copiar la plantilla de variables de entorno y colocar la key:

```bash
cp .env.example .env
```

```env
VITE_GIPHY_API_KEY=tu_api_key_de_giphy
```

> El archivo `.env` esta en `.gitignore` y no se sube al repositorio.

---

## 2. Arquitectura de Directorios (`src/`)

```text
├── android/                         <-- Proyecto nativo Android (Capacitor)
├── src/
│   ├── api/
│   │   └── giphyClient.ts           <-- Instancia de Axios: baseURL, timeout e interceptor de api_key
│   ├── services/
│   │   └── giphy.service.ts         <-- Interfaces de la respuesta, searchGifs() y mensajes de error
│   ├── hooks/
│   │   ├── useGifSearch.ts          <-- Estados (loading, error, gifs, vacio), paginacion y AbortController
│   │   └── useDebouncedValue.ts     <-- Espera a que el usuario deje de escribir
│   ├── components/
│   │   └── GifCard.tsx              <-- Tarjeta plana de cada GIF
│   ├── pages/
│   │   └── GiphySearch.tsx          <-- Pagina principal: IonSearchbar, IonGrid e IonSpinner
│   ├── theme/variables.css          <-- Tema plano y neutro
│   ├── App.tsx                      <-- Enrutador Ionic
│   └── main.tsx                     <-- Punto de entrada
├── .env.example                     <-- Plantilla de VITE_GIPHY_API_KEY
├── capacitor.config.ts              <-- appId: com.desarrollomovil.giphysearch
└── challenger-10-debug.apk          <-- APK de pruebas para Android
```

---

## 3. Funcionalidades Implementadas

### A. Cliente HTTP centralizado (`src/api/giphyClient.ts`)
- Instancia `axios.create` con `baseURL: https://api.giphy.com/v1` y `timeout` de 10 segundos.
- Interceptor de peticion que agrega `api_key` desde `import.meta.env.VITE_GIPHY_API_KEY`, para que ningun servicio manipule la key directamente.

### B. Servicio tipado (`src/services/giphy.service.ts`)
- Interfaces de la respuesta: `GiphySearchResponse`, `GiphyGif`, `GiphyImages`, `GiphyImageRendition`, `GiphyPagination` y `GiphyMeta`.
- `searchGifs(params, signal)` consume `GET /gifs/search` con los parametros:

| Parametro | Valor |
| :--- | :--- |
| `q` | Texto escrito por el usuario |
| `limit` | 24 por pagina |
| `offset` | 0, 24, 48... (boton **Cargar mas**) |
| `rating` | `"g"` |
| `lang` | `"en"` |

- Traduce los errores a mensajes entendibles: sin conexion, tiempo agotado, API Key invalida (401/403), limite de peticiones (429) y errores del servidor.
- Convierte cada GIF a un modelo reducido (`Gif`) con solo los campos que usa la interfaz.

### C. Concurrencia y cancelacion (`AbortController`)
- Solo hay una peticion activa a la vez. Cada busqueda nueva aborta la anterior.
- La busqueda se lanza 450 ms despues de la ultima tecla (debounce), o al instante con Enter o el boton **Buscar**.
- Al salir de la vista (`useIonViewWillLeave`) o desmontar el componente se cancela la peticion pendiente.
- Una respuesta tardia nunca sobrescribe una busqueda mas reciente.

### D. Estados de la interfaz
| Estado | Que se muestra |
| :--- | :--- |
| Inicial | Mensaje de bienvenida y sugerencias de busqueda |
| Cargando | `IonSpinner` con el termino que se esta buscando |
| Error | Mensaje claro y boton **Reintentar** |
| Vacio | Aviso de que no hubo resultados para el termino |
| Resultados | Cuadricula `IonGrid` / `IonRow` / `IonCol` (2 columnas en movil, 3 en tablet, 4 en escritorio) |

---

## 4. Ejecucion

```bash
npm install
cp .env.example .env     # colocar la API Key de GIPHY
npm run dev              # http://localhost:5177
```

### Compilar el APK

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

---

## 5. Lineamientos de Diseno

- Sin emojis en la interfaz. Los titulos que llegan de GIPHY se filtran para quitarles los emojis.
- Sin gradientes. Fondo gris neutro, tarjetas blancas con borde de 1 px y botones solidos sin sombra.
- Componentes oficiales de `@ionic/react` en modo `md`.

---

## Estudiante

- **Estudiante**: Jose Brayner Minotta
- **Asignatura**: Desarrollo de Aplicaciones Web y Moviles
- **Repositorio**: [https://github.com/jbrayner123/Desarrollo-Movil](https://github.com/jbrayner123/Desarrollo-Movil)

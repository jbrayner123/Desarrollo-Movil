// parcial-02/scripts/capture-screenshots.mjs
import { chromium } from 'playwright';
import { createServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.resolve(projectRoot, 'docs', 'screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch {
    console.log('Playwright Chromium no encontrado, usando Microsoft Edge del sistema...');
  }

  try {
    return await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    console.log('Microsoft Edge no disponible, intentando con Google Chrome...');
  }

  return await chromium.launch({ channel: 'chrome', headless: true });
}

async function run() {
  console.log('Iniciando servidor Vite para captura de pantallas...');
  const server = await createServer({
    root: projectRoot,
    server: { port: 5176, host: '127.0.0.1' }
  });
  await server.listen();
  const address = server.httpServer?.address();
  const port = typeof address === 'object' && address ? address.port : 5176;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Servidor de capturas activo en: ${baseUrl}`);

  let browser;
  try {
    browser = await launchBrowser();
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });

    const page = await context.newPage();

    // Inyectar estado de demostracion parametrizado
    const setDemoState = async (points = 90, missions = [
      {
        id: 1,
        completed: true,
        evidence: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23E86A33"/><text x="50%" y="50%" fill="white" font-size="16" text-anchor="middle" dy=".3em">FOTO CAPTURADA</text></svg>'
      },
      { id: 2, completed: true },
      { id: 3, completed: false }
    ]) => {
      await page.evaluate(({ p, m }) => {
        const demoUser = {
          uid: 'demo-jose-minotta',
          displayName: 'Jose Minotta',
          email: 'jose.minotta@meetgen.dev'
        };
        localStorage.setItem('parcial02_current_user', JSON.stringify(demoUser));

        const demoProgress = {
          points: p,
          missions: m
        };
        localStorage.setItem(`parcial02_progress_${demoUser.uid}`, JSON.stringify(demoProgress));
      }, { p: points, m: missions });
    };

    // 1. Captura 01: Login / Register (Arte hero Meetgen)
    console.log('1/6 Capturando 01-login-register.png...');
    await page.goto(`${baseUrl}/auth`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outputDir, '01-login-register.png') });

    // 2. Captura 02: Dashboard de Misiones
    console.log('2/6 Capturando 02-dashboard-missions.png...');
    await setDemoState(90, [
      {
        id: 1,
        completed: true,
        evidence: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23E86A33"/><text x="50%" y="50%" fill="white" font-size="16" text-anchor="middle" dy=".3em">FOTO CAPTURADA</text></svg>'
      },
      { id: 2, completed: true },
      { id: 3, completed: false }
    ]);
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outputDir, '02-dashboard-missions.png') });

    // 3. Captura 03: Modal Mision 1 (Evidencia)
    console.log('3/6 Capturando 03-mission-camera.png...');
    await page.click('#mission-card-1');
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(outputDir, '03-mission-camera.png') });

    // 4. Captura 04: Modal Mision 2 (Radar GPS de movimiento interactivo)
    console.log('4/6 Capturando 04-mission-geolocation.png...');
    await setDemoState(40, [
      {
        id: 1,
        completed: true,
        evidence: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23E86A33"/><text x="50%" y="50%" fill="white" font-size="16" text-anchor="middle" dy=".3em">FOTO CAPTURADA</text></svg>'
      },
      { id: 2, completed: false },
      { id: 3, completed: false }
    ]);
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.click('#mission-card-2');
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(outputDir, '04-mission-geolocation.png') });

    // 5. Captura 05: Modal Mision 3 (Anillo de Quietud 10s con Acelerometro)
    console.log('5/6 Capturando 05-mission-stillness.png...');
    await setDemoState(90, [
      {
        id: 1,
        completed: true,
        evidence: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23E86A33"/><text x="50%" y="50%" fill="white" font-size="16" text-anchor="middle" dy=".3em">FOTO CAPTURADA</text></svg>'
      },
      { id: 2, completed: true },
      { id: 3, completed: false }
    ]);
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.locator('#mission-card-3').scrollIntoViewIfNeeded();
    await page.click('#mission-card-3');
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(outputDir, '05-mission-stillness.png') });

    // 6. Captura 06: Resultados y Ranking
    console.log('6/6 Capturando 06-results-ranking.png...');
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.click('#tab-ranking');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outputDir, '06-results-ranking.png') });

    console.log('Exito: Las 6 capturas de pantalla fueron generadas perfectamente en:');
    console.log(outputDir);
  } catch (err) {
    console.error('Error durante la captura automatizada:', err);
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
}

run();

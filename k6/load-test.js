/**
 * Prueba de carga con k6
 * Instalación: https://grafana.com/docs/k6/latest/get-started/installation/
 * Uso:
 *   k6 run k6/load-test.js                         # smoke test (1 usuario)
 *   k6 run --env SCENARIO=chat k6/load-test.js     # test del endpoint de chat
 *   k6 run --env SCENARIO=full k6/load-test.js     # test completo todos los endpoints
 *
 * Umbrales de aceptación (SLOs):
 *   - p95 de latencia < 3000ms
 *   - tasa de errores < 1%
 *   - p99 de latencia < 5000ms
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const SCENARIO = __ENV.SCENARIO || 'smoke';

// Métricas personalizadas
const chatErrorRate = new Rate('chat_errors');
const chatLatency = new Trend('chat_latency', true);

// ─── Configuración de escenarios ───────────────────────────────────────────────

export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
    },
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },   // ramp up
        { duration: '1m',  target: 10 },   // carga sostenida
        { duration: '30s', target: 0 },    // ramp down
      ],
    },
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m',  target: 50 },
        { duration: '30s', target: 100 },
        { duration: '1m',  target: 100 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  // Solo ejecuta el escenario seleccionado
  exec: SCENARIO === 'full' ? undefined : 'smoke',

  // Umbrales (SLOs)
  thresholds: {
    http_req_duration: ['p(95)<3000', 'p(99)<5000'],
    http_req_failed: ['rate<0.01'],
    chat_errors: ['rate<0.05'],
    chat_latency: ['p(95)<3000'],
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function randomSession() {
  return `k6-session-${Math.random().toString(36).slice(2, 10)}`;
}

function chatPayload(message, sessionId) {
  return JSON.stringify({
    sessionId: sessionId || randomSession(),
    message,
    language: 'es',
  });
}

const HEADERS = { 'Content-Type': 'application/json' };

// ─── Tests por endpoint ────────────────────────────────────────────────────────

function testHome() {
  const res = http.get(`${BASE_URL}/`);
  check(res, {
    'home: status 200': (r) => r.status === 200,
    'home: contiene HTML': (r) => r.body.includes('<html') || r.body.includes('<!DOCTYPE'),
  });
  sleep(1);
}

function testHealth() {
  const res = http.get(`${BASE_URL}/api/health`);
  check(res, {
    'health: status 200': (r) => r.status === 200,
  });
}

function testChat() {
  const start = Date.now();
  const sessionId = randomSession();

  const messages = [
    'Hola, necesito una landing page',
    'Tengo presupuesto de 400 USD',
    'Mi correo es test@test.com',
  ];

  for (const message of messages) {
    const res = http.post(
      `${BASE_URL}/api/chat`,
      chatPayload(message, sessionId),
      { headers: HEADERS, timeout: '20s' }
    );

    const ok = check(res, {
      'chat: status 200': (r) => r.status === 200,
      'chat: tiene campo reply': (r) => {
        try { return JSON.parse(r.body).reply !== undefined; }
        catch { return false; }
      },
      'chat: no status 5xx': (r) => r.status < 500,
    });

    chatErrorRate.add(!ok);
    chatLatency.add(Date.now() - start);
    sleep(2); // pausa entre mensajes (simula comportamiento humano)
  }
}

function testRateLimit() {
  // Debe devolver 429 después de N requests rápidos desde la misma sesión
  const sessionId = randomSession();
  let got429 = false;

  for (let i = 0; i < 25; i++) {
    const res = http.post(
      `${BASE_URL}/api/chat`,
      chatPayload(`mensaje rapido ${i}`, sessionId),
      { headers: HEADERS, timeout: '5s' }
    );
    if (res.status === 429) { got429 = true; break; }
    sleep(0.1);
  }

  check({ got429 }, {
    'rate limit: activa 429 tras flood': (d) => d.got429 === true,
  });
}

function testStaticPages() {
  const pages = ['/blog', '/calculadora', '/privacidad', '/status', '/recursos'];
  for (const page of pages) {
    const res = http.get(`${BASE_URL}${page}`, { timeout: '10s' });
    check(res, {
      [`${page}: status 200`]: (r) => r.status === 200,
    });
    sleep(0.5);
  }
}

// ─── Función principal ─────────────────────────────────────────────────────────

export default function () {
  const scenario = SCENARIO;

  if (scenario === 'chat') {
    testChat();
  } else if (scenario === 'ratelimit') {
    testRateLimit();
  } else if (scenario === 'full') {
    testHome();
    testHealth();
    testChat();
    testStaticPages();
  } else {
    // smoke: prueba mínima de todos los endpoints
    testHome();
    testHealth();
  }
}

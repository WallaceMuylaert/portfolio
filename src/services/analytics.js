/**
 * Analytics Service
 * Responsável por rastrear visitas e coletar métricas do portfolio.
 * Envia dados para a API (Netlify Functions + Netlify Blobs) como armazenamento centralizado.
 * Mantém fallback para localStorage quando a API não está disponível (dev local).
 */

const API_BASE = '/api';

const STORAGE_KEYS = {
  VISITS: 'portfolio_visits',
  FEEDBACKS: 'portfolio_feedbacks',
  PAGE_VIEWS: 'portfolio_page_views',
};

// --- Helpers ---

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar analytics:', e);
  }
}

/**
 * Faz uma chamada à API com fallback silencioso
 */
async function apiCall(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

// --- Cookies ---

function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Gera ou recupera um ID único do visitante via cookie
 */
function getVisitorId() {
  let id = getCookie('_portfolio_vid');
  if (!id) {
    id = 'v_' + generateId();
    setCookie('_portfolio_vid', id, 730); // 2 anos
  }
  return id;
}

/**
 * Conta e incrementa sessões do visitante
 */
function getSessionCount() {
  let count = parseInt(getCookie('_portfolio_sc') || '0', 10);
  // Checa se é uma nova sessão (mais de 30min desde última atividade)
  const lastActivity = getCookie('_portfolio_la');
  const now = Date.now();
  if (!lastActivity || (now - parseInt(lastActivity, 10)) > 30 * 60 * 1000) {
    count++;
    setCookie('_portfolio_sc', String(count), 730);
  }
  setCookie('_portfolio_la', String(now), 1); // 1 dia
  return count;
}

/**
 * Registra a primeira visita do usuário
 */
function getFirstVisitDate() {
  let first = getCookie('_portfolio_fv');
  if (!first) {
    first = new Date().toISOString();
    setCookie('_portfolio_fv', first, 730);
  }
  return first;
}

// --- Detecção de info do visitante ---

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'Mobile';
  if (/Tablet|iPad/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Outro';
}

function getBrowserVersion() {
  const ua = navigator.userAgent;
  const patterns = [
    { name: 'Firefox', regex: /Firefox\/(\d+[\.\d]*)/ },
    { name: 'Edg', regex: /Edg\/(\d+[\.\d]*)/ },
    { name: 'Chrome', regex: /Chrome\/(\d+[\.\d]*)/ },
    { name: 'Safari', regex: /Version\/(\d+[\.\d]*)/ },
    { name: 'Opera', regex: /OPR\/(\d+[\.\d]*)/ },
  ];
  for (const p of patterns) {
    const match = ua.match(p.regex);
    if (match) return match[1];
  }
  return 'Desconhecida';
}

function getOSName() {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  return 'Outro';
}

/**
 * Detecta a conexão de rede do visitante
 */
function getConnectionInfo() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return { type: 'Desconhecido', downlink: null, rtt: null };
  return {
    type: conn.effectiveType || conn.type || 'Desconhecido',
    downlink: conn.downlink || null,
    rtt: conn.rtt || null,
  };
}

/**
 * Detecta timezone do visitante
 */
function getTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Desconhecido';
  }
}

/**
 * Detecta UTM params da URL
 */
function getUTMParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    const utms = {};
    utmKeys.forEach(key => {
      const val = params.get(key);
      if (val) utms[key] = val;
    });
    return Object.keys(utms).length > 0 ? utms : null;
  } catch {
    return null;
  }
}

// --- Coleta de dados do visitante ---

function collectVisitData() {
  const visitorId = getVisitorId();
  const sessionCount = getSessionCount();
  const firstVisit = getFirstVisitDate();
  const connection = getConnectionInfo();
  const utmParams = getUTMParams();

  return {
    visitorId,
    sessionCount,
    firstVisitDate: firstVisit,
    isReturning: sessionCount > 1,
    timestamp: new Date().toISOString(),
    referrer: document.referrer || 'Direto',
    device: getDeviceType(),
    browser: getBrowserName(),
    browserVersion: getBrowserVersion(),
    os: getOSName(),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    language: navigator.language,
    languages: navigator.languages ? [...navigator.languages] : [navigator.language],
    timezone: getTimezone(),
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === '1',
    touchScreen: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    deviceMemory: navigator.deviceMemory || null,
    connection,
    utmParams,
    page: window.location.pathname,
    fullUrl: window.location.href,
    colorDepth: window.screen.colorDepth,
    platform: navigator.platform || 'Desconhecido',
  };
}

// --- API Pública ---

/**
 * Registra uma nova visita ao portfolio com dados enriquecidos.
 * Envia para a API de forma assíncrona (fire-and-forget).
 * Fallback: salva no localStorage caso a API não responda.
 */
export function trackVisit() {
  const visitData = collectVisitData();

  // Fire-and-forget: envia para a API sem bloquear
  apiCall('track-visit', {
    method: 'POST',
    body: JSON.stringify(visitData),
  }).then((result) => {
    if (!result) {
      // Fallback: salva localmente se a API falhar
      const visits = getFromStorage(STORAGE_KEYS.VISITS);
      visits.push({ id: generateId(), ...visitData });
      saveToStorage(STORAGE_KEYS.VISITS, visits);
    }
  });

  return visitData;
}

/**
 * Registra uma visualização de seção.
 * Envia para a API de forma assíncrona (fire-and-forget).
 */
export function trackSectionView(sectionName) {
  const data = {
    visitorId: getVisitorId(),
    section: sectionName,
    timestamp: new Date().toISOString(),
  };

  // Fire-and-forget
  apiCall('track-section', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then((result) => {
    if (!result) {
      const views = getFromStorage(STORAGE_KEYS.PAGE_VIEWS);
      views.push({ id: generateId(), ...data });
      saveToStorage(STORAGE_KEYS.PAGE_VIEWS, views);
    }
  });
}

/**
 * Salva um feedback do visitante.
 * Envia para a API e retorna o resultado.
 */
export async function submitFeedback({ rating, foundWhatNeeded, message, contact }) {
  const feedbackData = {
    visitorId: getVisitorId(),
    timestamp: new Date().toISOString(),
    rating,
    foundWhatNeeded,
    message: message || '',
    contact: contact || '',
    device: getDeviceType(),
    browser: getBrowserName(),
    sessionCount: getSessionCount(),
  };

  const result = await apiCall('submit-feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  });

  if (!result) {
    // Fallback: salva localmente
    const feedbacks = getFromStorage(STORAGE_KEYS.FEEDBACKS);
    const feedback = { id: generateId(), ...feedbackData };
    feedbacks.push(feedback);
    saveToStorage(STORAGE_KEYS.FEEDBACKS, feedbacks);
    return feedback;
  }

  return { id: result.id, ...feedbackData };
}

/**
 * Retorna métricas agregadas para o dashboard.
 * Busca da API (dados centralizados de TODOS os visitantes).
 * Fallback: usa dados locais se a API não responder.
 */
export async function getDashboardMetrics() {
  const apiMetrics = await apiCall('metrics');

  if (apiMetrics && !apiMetrics.error) {
    return apiMetrics;
  }

  // Fallback: gera métricas a partir do localStorage (dados locais apenas)
  console.warn('API indisponível, usando dados locais como fallback.');
  return generateLocalMetrics();
}

/**
 * Gera métricas a partir dos dados locais (fallback)
 */
function generateLocalMetrics() {
  const visits = getFromStorage(STORAGE_KEYS.VISITS);
  const feedbacks = getFromStorage(STORAGE_KEYS.FEEDBACKS);
  const pageViews = getFromStorage(STORAGE_KEYS.PAGE_VIEWS);

  const now = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const visitsByDay = last7Days.map(day => ({
    date: day,
    count: visits.filter(v => v.timestamp.startsWith(day)).length,
  }));

  const deviceStats = visits.reduce((acc, v) => {
    acc[v.device] = (acc[v.device] || 0) + 1;
    return acc;
  }, {});

  const browserStats = visits.reduce((acc, v) => {
    acc[v.browser] = (acc[v.browser] || 0) + 1;
    return acc;
  }, {});

  const sectionStats = pageViews.reduce((acc, v) => {
    acc[v.section] = (acc[v.section] || 0) + 1;
    return acc;
  }, {});

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  const foundPercent = feedbacks.length
    ? Math.round((feedbacks.filter(f => f.foundWhatNeeded).length / feedbacks.length) * 100)
    : 0;

  const today = new Date().toISOString().split('T')[0];
  const visitsToday = visits.filter(v => v.timestamp.startsWith(today)).length;
  const uniqueVisitors = new Set(visits.map(v => v.visitorId)).size;
  const returningVisitors = visits.filter(v => v.isReturning).length;

  const osStats = visits.reduce((acc, v) => {
    acc[v.os] = (acc[v.os] || 0) + 1;
    return acc;
  }, {});

  return {
    totalVisits: visits.length,
    visitsToday,
    uniqueVisitors,
    returningVisitors,
    totalFeedbacks: feedbacks.length,
    avgRating: Number(avgRating),
    foundPercent,
    visitsByDay,
    deviceStats,
    browserStats,
    osStats,
    sectionStats,
    recentVisits: visits.slice(-50).reverse(),
    recentFeedbacks: feedbacks.slice(-50).reverse(),
  };
}

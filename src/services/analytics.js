/**
 * Analytics Service
 * Responsável por rastrear visitas e coletar métricas do portfolio.
 * Coleta dados enriquecidos do visitante via cookies, navigator e performance API.
 */

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
 * Coleta dados de performance da página
 */
function getPerformanceData() {
  try {
    const [nav] = performance.getEntriesByType('navigation');
    if (!nav) return null;
    return {
      loadTime: Math.round(nav.loadEventEnd - nav.startTime),
      domReady: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
      ttfb: Math.round(nav.responseStart - nav.requestStart),
    };
  } catch {
    return null;
  }
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

// --- API Pública ---

/**
 * Registra uma nova visita ao portfolio com dados enriquecidos
 */
export function trackVisit() {
  const visits = getFromStorage(STORAGE_KEYS.VISITS);
  const visitorId = getVisitorId();
  const sessionCount = getSessionCount();
  const firstVisit = getFirstVisitDate();
  const connection = getConnectionInfo();
  const utmParams = getUTMParams();

  const visit = {
    id: generateId(),
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

  visits.push(visit);
  saveToStorage(STORAGE_KEYS.VISITS, visits);

  // Coleta performance após a página carregar
  if (document.readyState === 'complete') {
    setTimeout(() => {
      const perf = getPerformanceData();
      if (perf) {
        const updated = getFromStorage(STORAGE_KEYS.VISITS);
        const idx = updated.findIndex(v => v.id === visit.id);
        if (idx !== -1) {
          updated[idx].performance = perf;
          saveToStorage(STORAGE_KEYS.VISITS, updated);
        }
      }
    }, 1000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perf = getPerformanceData();
        if (perf) {
          const updated = getFromStorage(STORAGE_KEYS.VISITS);
          const idx = updated.findIndex(v => v.id === visit.id);
          if (idx !== -1) {
            updated[idx].performance = perf;
            saveToStorage(STORAGE_KEYS.VISITS, updated);
          }
        }
      }, 1000);
    }, { once: true });
  }

  return visit;
}

/**
 * Registra uma visualização de seção
 */
export function trackSectionView(sectionName) {
  const views = getFromStorage(STORAGE_KEYS.PAGE_VIEWS);

  views.push({
    id: generateId(),
    visitorId: getVisitorId(),
    section: sectionName,
    timestamp: new Date().toISOString(),
  });

  saveToStorage(STORAGE_KEYS.PAGE_VIEWS, views);
}

/**
 * Salva um feedback do visitante
 */
export function submitFeedback({ rating, foundWhatNeeded, message, contact }) {
  const feedbacks = getFromStorage(STORAGE_KEYS.FEEDBACKS);

  const feedback = {
    id: generateId(),
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

  feedbacks.push(feedback);
  saveToStorage(STORAGE_KEYS.FEEDBACKS, feedbacks);
  return feedback;
}

/**
 * Retorna todas as visitas registradas
 */
export function getVisits() {
  return getFromStorage(STORAGE_KEYS.VISITS);
}

/**
 * Retorna todos os feedbacks
 */
export function getFeedbacks() {
  return getFromStorage(STORAGE_KEYS.FEEDBACKS);
}

/**
 * Retorna todas as visualizações de seção
 */
export function getPageViews() {
  return getFromStorage(STORAGE_KEYS.PAGE_VIEWS);
}

/**
 * Retorna métricas agregadas para o dashboard
 */
export function getDashboardMetrics() {
  const visits = getVisits();
  const feedbacks = getFeedbacks();
  const pageViews = getPageViews();

  // Visitas por dia (últimos 7 dias)
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

  // Dispositivos
  const deviceStats = visits.reduce((acc, v) => {
    acc[v.device] = (acc[v.device] || 0) + 1;
    return acc;
  }, {});

  // Browsers
  const browserStats = visits.reduce((acc, v) => {
    acc[v.browser] = (acc[v.browser] || 0) + 1;
    return acc;
  }, {});

  // Seções mais visitadas
  const sectionStats = pageViews.reduce((acc, v) => {
    acc[v.section] = (acc[v.section] || 0) + 1;
    return acc;
  }, {});

  // Média de rating
  const avgRating = feedbacks.length
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  // % que encontrou o que precisava
  const foundPercent = feedbacks.length
    ? Math.round((feedbacks.filter(f => f.foundWhatNeeded).length / feedbacks.length) * 100)
    : 0;

  // Visitas hoje
  const today = new Date().toISOString().split('T')[0];
  const visitsToday = visits.filter(v => v.timestamp.startsWith(today)).length;

  // Visitantes únicos
  const uniqueVisitors = new Set(visits.map(v => v.visitorId)).size;

  // Visitantes recorrentes
  const returningVisitors = visits.filter(v => v.isReturning).length;

  // OS stats
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

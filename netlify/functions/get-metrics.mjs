import { getStore } from "@netlify/blobs";

/**
 * Busca todos os itens de um store do Netlify Blobs
 */
async function getAllItems(storeName) {
  try {
    const store = getStore(storeName);
    const { blobs } = await store.list();

    if (!blobs || blobs.length === 0) return [];

    const items = await Promise.all(
      blobs.map(async (blob) => {
        try {
          return await store.get(blob.key, { type: "json" });
        } catch {
          return null;
        }
      })
    );

    return items.filter(Boolean);
  } catch (error) {
    console.error(`Erro ao buscar ${storeName}:`, error);
    return [];
  }
}

/**
 * Agrega as métricas para o dashboard
 */
function aggregateMetrics(visits, feedbacks, pageViews) {
  const now = new Date();

  // Visitas por dia (últimos 7 dias)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    return date.toISOString().split("T")[0];
  }).reverse();

  const visitsByDay = last7Days.map((day) => ({
    date: day,
    count: visits.filter((v) => {
      const ts = v.serverTimestamp || v.timestamp;
      return ts && ts.startsWith(day);
    }).length,
  }));

  // Dispositivos
  const deviceStats = visits.reduce((acc, v) => {
    if (v.device) acc[v.device] = (acc[v.device] || 0) + 1;
    return acc;
  }, {});

  // Browsers
  const browserStats = visits.reduce((acc, v) => {
    if (v.browser) acc[v.browser] = (acc[v.browser] || 0) + 1;
    return acc;
  }, {});

  // Seções mais visitadas
  const sectionStats = pageViews.reduce((acc, v) => {
    if (v.section) acc[v.section] = (acc[v.section] || 0) + 1;
    return acc;
  }, {});

  // Média de rating
  const avgRating = feedbacks.length
    ? (
        feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) /
        feedbacks.length
      ).toFixed(1)
    : 0;

  // % que encontrou o que precisava
  const foundPercent = feedbacks.length
    ? Math.round(
        (feedbacks.filter((f) => f.foundWhatNeeded).length /
          feedbacks.length) *
          100
      )
    : 0;

  // Visitas hoje
  const today = now.toISOString().split("T")[0];
  const visitsToday = visits.filter((v) => {
    const ts = v.serverTimestamp || v.timestamp;
    return ts && ts.startsWith(today);
  }).length;

  // Visitantes únicos
  const uniqueVisitors = new Set(
    visits.map((v) => v.visitorId).filter(Boolean)
  ).size;

  // Visitantes recorrentes
  const returningVisitors = visits.filter((v) => v.isReturning).length;

  // OS stats
  const osStats = visits.reduce((acc, v) => {
    if (v.os) acc[v.os] = (acc[v.os] || 0) + 1;
    return acc;
  }, {});

  // Ordena visitas e feedbacks por timestamp (mais recentes primeiro)
  const sortByTime = (a, b) => {
    const tsA = a.serverTimestamp || a.timestamp || "";
    const tsB = b.serverTimestamp || b.timestamp || "";
    return tsB.localeCompare(tsA);
  };

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
    recentVisits: [...visits].sort(sortByTime).slice(0, 100),
    recentFeedbacks: [...feedbacks].sort(sortByTime).slice(0, 100),
  };
}

export default async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  try {
    // Busca todos os dados dos 3 stores em paralelo
    const [visits, feedbacks, pageViews] = await Promise.all([
      getAllItems("portfolio-visits"),
      getAllItems("portfolio-feedbacks"),
      getAllItems("portfolio-pageviews"),
    ]);

    const metrics = aggregateMetrics(visits, feedbacks, pageViews);

    return new Response(JSON.stringify(metrics), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Erro ao gerar métricas:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

export const config = {
  path: "/api/metrics",
};

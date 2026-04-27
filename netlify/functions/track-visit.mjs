import { getStore } from "@netlify/blobs";

export default async (req) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  try {
    const body = await req.json();
    const store = getStore("portfolio-visits");
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const visit = {
      id,
      ...body,
      serverTimestamp: new Date().toISOString(),
    };

    await store.setJSON(id, visit);

    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Erro ao salvar visita:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers }
    );
  }
};

export const config = {
  path: "/api/track-visit",
};

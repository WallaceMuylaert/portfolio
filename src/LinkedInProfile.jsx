// src/LinkedInProfile.jsx
import React, { useEffect, useState } from "react";

/**
 * Componente que tenta buscar informações públicas do perfil do LinkedIn.
 * Utiliza a variável de ambiente REACT_APP_LINKEDIN_URL que deve apontar para
 * um endpoint que retorne os dados do perfil em JSON (por exemplo, um webhook
 * próprio ou uma API de terceiros). Caso a URL não esteja definida ou a
 * requisição falhe, o componente exibe um fallback amigável.
 */
function LinkedInProfile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = process.env.REACT_APP_LINKEDIN_URL;
    if (!url) {
      setError("URL do LinkedIn não configurada.");
      return;
    }
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <section className="app-section" aria-live="polite">
        <h2>LinkedIn</h2>
        <p style={{ color: "var(--color-muted)" }}>Erro ao carregar perfil: {error}</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="app-section" aria-live="polite">
        <h2>LinkedIn</h2>
        <p>Carregando...</p>
      </section>
    );
  }

  return (
    <section className="app-section" aria-live="polite">
      <h2>{profile.name || "Nome"}</h2>
      <p>{profile.headline || "Profissão"}</p>
      {profile.image && (
        <img
          src={profile.image}
          alt={`Foto de ${profile.name}`}
          style={{ width: "120px", borderRadius: "50%", marginTop: "1rem" }}
        />
      )}
      {profile.summary && <p>{profile.summary}</p>}
    </section>
  );
}

export default LinkedInProfile;

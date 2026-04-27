import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield, X } from 'lucide-react';

const COOKIE_CONSENT_KEY = '_portfolio_cookie_consent';

/**
 * Verifica se o consentimento de cookies já foi dado
 */
function hasConsent() {
  return document.cookie.includes(COOKIE_CONSENT_KEY + '=');
}

/**
 * Salva o consentimento
 */
function saveConsent(accepted) {
  const expires = new Date(Date.now() + 365 * 864e5).toUTCString();
  document.cookie = `${COOKIE_CONSENT_KEY}=${accepted ? 'accepted' : 'declined'}; expires=${expires}; path=/; SameSite=Lax`;
}

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mostra banner após 1.5s se não tem consentimento
    const timer = setTimeout(() => {
      if (!hasConsent()) {
        setVisible(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    saveConsent(true);
    setVisible(false);
  };

  const handleDecline = () => {
    saveConsent(false);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="cookie-banner"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <div className="cookie-content">
            <div className="cookie-icon-wrap">
              <Cookie size={28} />
            </div>
            <div className="cookie-text">
              <h4>🍪 Este site utiliza cookies</h4>
              <p>
                Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência
                de navegação, personalizar conteúdo e analisar o tráfego do site. 
                Ao continuar navegando, você concorda com nossa política de privacidade.
              </p>
            </div>
          </div>
          <div className="cookie-actions">
            <button className="cookie-btn-accept" onClick={handleAccept}>
              <Shield size={16} />
              Aceitar Todos
            </button>
            <button className="cookie-btn-decline" onClick={handleDecline}>
              Recusar
            </button>
          </div>
          <button
            className="cookie-close"
            onClick={handleDecline}
            aria-label="Fechar banner de cookies"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;

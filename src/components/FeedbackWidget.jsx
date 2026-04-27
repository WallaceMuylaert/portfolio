import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, Star, X, Send, CheckCircle } from 'lucide-react';
import { submitFeedback } from '../services/analytics';

const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [foundWhatNeeded, setFoundWhatNeeded] = useState(null);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;

    try {
      await submitFeedback({
        rating,
        foundWhatNeeded: foundWhatNeeded === true,
        message,
        contact,
      });
    } catch (err) {
      console.error('Erro ao enviar feedback:', err);
    }

    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      // Reset após fechar
      setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setFoundWhatNeeded(null);
        setMessage('');
        setContact('');
      }, 300);
    }, 2500);
  };

  return (
    <>
      {/* Botão flutuante de feedback */}
      <motion.button
        className="feedback-trigger"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Deixar feedback"
        title="Deixar feedback"
      >
        <MessageSquarePlus size={20} />
        <span>Feedback</span>
      </motion.button>

      {/* Modal de feedback */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="feedback-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            <motion.div
              className="feedback-modal"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="feedback-close"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>

              {submitted ? (
                <div className="feedback-success">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                  >
                    <CheckCircle size={48} color="#10b981" />
                  </motion.div>
                  <h3>Obrigado pelo feedback!</h3>
                  <p>Sua opinião é muito importante para mim.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="feedback-form">
                  <h3>Deixe seu feedback</h3>
                  <p className="feedback-subtitle">
                    Me ajude a melhorar este portfolio
                  </p>

                  {/* Rating com estrelas */}
                  <div className="feedback-section">
                    <label>Como avalia sua experiência?</label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                        >
                          <Star
                            size={26}
                            fill={star <= (hoverRating || rating) ? '#f59e0b' : 'none'}
                            color={star <= (hoverRating || rating) ? '#f59e0b' : '#cbd5e1'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Encontrou o que precisava */}
                  <div className="feedback-section">
                    <label>Encontrou o que precisava?</label>
                    <div className="feedback-options">
                      <button
                        type="button"
                        className={`option-btn ${foundWhatNeeded === true ? 'active-yes' : ''}`}
                        onClick={() => setFoundWhatNeeded(true)}
                      >
                        ✅ Sim
                      </button>
                      <button
                        type="button"
                        className={`option-btn ${foundWhatNeeded === false ? 'active-no' : ''}`}
                        onClick={() => setFoundWhatNeeded(false)}
                      >
                        ❌ Não
                      </button>
                    </div>
                  </div>

                  {/* Mensagem */}
                  <div className="feedback-section">
                    <label htmlFor="feedback-msg">Alguma sugestão? (opcional)</label>
                    <textarea
                      id="feedback-msg"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Conte-me como posso melhorar..."
                      rows={2}
                    />
                  </div>

                  {/* Contato */}
                  <div className="feedback-section">
                    <label htmlFor="feedback-contact">Seu contato (opcional)</label>
                    <input
                      id="feedback-contact"
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="E-mail ou WhatsApp"
                    />
                  </div>

                  <button
                    type="submit"
                    className="feedback-submit"
                    disabled={rating === 0}
                  >
                    <Send size={16} />
                    Enviar Feedback
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedbackWidget;

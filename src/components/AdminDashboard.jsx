import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, MessageSquare, TrendingUp, Monitor,
  Smartphone, Tablet, Globe, Star, ThumbsUp, LogOut, Eye,
  Calendar, Clock, Settings, Search, ArrowUpRight, Lock, Check,
  AlertCircle, UserCheck, Repeat, Wifi, ChevronLeft, ChevronRight,
  Menu, X,
} from 'lucide-react';
import { getDashboardMetrics } from '../services/analytics';
import { logout, getSession, changePassword } from '../services/auth';

const ITEMS_PER_PAGE = 10;

// --- Sub-componentes ---

const StatCard = ({ icon, label, value, subtitle, color }) => (
  <motion.div className="admin-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <div className="stat-icon" style={{ background: `${color}15`, color }}>{icon}</div>
    <div className="stat-info">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {subtitle && <span className="stat-subtitle">{subtitle}</span>}
    </div>
  </motion.div>
);

const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="mini-chart">
      {data.map((d, i) => (
        <div key={i} className="mini-chart-bar-wrapper">
          <motion.div className="mini-chart-bar"
            initial={{ height: 0 }}
            animate={{ height: `${(d.count / max) * 100}%` }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            title={`${d.date}: ${d.count} visita(s)`}
          />
          <span className="mini-chart-label">
            {new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}
          </span>
        </div>
      ))}
    </div>
  );
};

const DeviceIcon = ({ device }) => {
  if (device === 'Mobile') return <Smartphone size={16} />;
  if (device === 'Tablet') return <Tablet size={16} />;
  return <Monitor size={16} />;
};

const StarDisplay = ({ rating }) => (
  <div className="star-display">
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} size={14} fill={s <= rating ? '#f59e0b' : 'none'} color={s <= rating ? '#f59e0b' : '#cbd5e1'} />
    ))}
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button className="pagination-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <ChevronLeft size={16} />
      </button>
      <div className="pagination-info">
        <span className="pagination-current">{currentPage}</span>
        <span className="pagination-sep">/</span>
        <span>{totalPages}</span>
      </div>
      <button className="pagination-btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

// --- Dashboard Principal ---

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [visitorsPage, setVisitorsPage] = useState(1);
  const [feedbacksPage, setFeedbacksPage] = useState(1);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const session = getSession();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getDashboardMetrics()
      .then((data) => {
        if (!cancelled) {
          setMetrics(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err.message || 'Erro ao carregar métricas');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const handleLogout = () => { logout(); window.location.href = '/admin'; };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    if (newPassword !== confirmPassword) { setPasswordMsg({ type: 'error', text: 'As senhas não coincidem' }); return; }
    if (newPassword.length < 6) { setPasswordMsg({ type: 'error', text: 'Mínimo 6 caracteres' }); return; }
    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      setPasswordMsg({ type: 'success', text: 'Senha alterada!' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } else { setPasswordMsg({ type: 'error', text: result.error }); }
  };

  // Paginação visitantes
  const paginatedVisitors = useMemo(() => {
    if (!metrics) return { items: [], totalPages: 1 };
    const items = metrics.recentVisits;
    const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
    const start = (visitorsPage - 1) * ITEMS_PER_PAGE;
    return { items: items.slice(start, start + ITEMS_PER_PAGE), totalPages, total: items.length };
  }, [metrics, visitorsPage]);

  // Paginação feedbacks com busca
  const paginatedFeedbacks = useMemo(() => {
    if (!metrics) return { items: [], totalPages: 1 };
    const term = searchTerm.toLowerCase();
    const filtered = metrics.recentFeedbacks.filter(f =>
      f.message.toLowerCase().includes(term) || f.contact.toLowerCase().includes(term)
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const start = (feedbacksPage - 1) * ITEMS_PER_PAGE;
    return { items: filtered.slice(start, start + ITEMS_PER_PAGE), totalPages, total: filtered.length };
  }, [metrics, searchTerm, feedbacksPage]);

  // Reset page on search
  useEffect(() => { setFeedbacksPage(1); }, [searchTerm]);

  if (loading) {
    return (
      <div className="admin-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ marginBottom: '1rem' }}>
            <LayoutDashboard size={40} />
          </motion.div>
          <p style={{ fontSize: '1.1rem' }}>Carregando métricas...</p>
        </div>
      </div>
    );
  }

  if (loadError && !metrics) {
    return (
      <div className="admin-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#f87171' }}>
          <AlertCircle size={40} style={{ marginBottom: '1rem' }} />
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Erro ao carregar dados</p>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{loadError}</p>
          <button onClick={() => window.location.reload()} className="sidebar-link" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: <LayoutDashboard size={18} /> },
    { id: 'visitors', label: 'Visitantes', icon: <Users size={18} /> },
    { id: 'feedbacks', label: 'Feedbacks', icon: <MessageSquare size={18} /> },
    { id: 'settings', label: 'Config', icon: <Settings size={18} /> },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile header */}
      <div className="admin-mobile-header">
        <button className="admin-mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <span className="admin-mobile-title">Admin</span>
        <button className="sidebar-logout" onClick={handleLogout} title="Sair"><LogOut size={18} /></button>
      </div>

      {/* Sidebar overlay mobile */}
      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <LayoutDashboard size={22} />
          <span>Admin Panel</span>
        </div>
        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button key={tab.id}
              className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
            >
              {tab.icon}<span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{session?.username?.charAt(0).toUpperCase() || 'A'}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{session?.username || 'Admin'}</span>
              <span className="sidebar-user-role">Administrador</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Sair"><LogOut size={18} /></button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1 className="admin-title">{tabs.find(t => t.id === activeTab)?.label}</h1>
            <p className="admin-subtitle">
              {activeTab === 'overview' && 'Métricas gerais do seu portfolio'}
              {activeTab === 'visitors' && `${paginatedVisitors.total || 0} visitantes registrados`}
              {activeTab === 'feedbacks' && `${paginatedFeedbacks.total || 0} feedbacks recebidos`}
              {activeTab === 'settings' && 'Configurações do painel'}
            </p>
          </div>
          <a href="/" className="admin-view-site" target="_blank" rel="noopener noreferrer">
            <Eye size={16} /> Ver Site
          </a>
        </header>

        <AnimatePresence mode="wait">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-content">
              <div className="admin-stats-grid">
                <StatCard icon={<Users size={20} />} label="Total de Visitas" value={metrics.totalVisits} subtitle={`${metrics.visitsToday} hoje`} color="#3b82f6" />
                <StatCard icon={<UserCheck size={20} />} label="Únicos" value={metrics.uniqueVisitors} color="#06b6d4" />
                <StatCard icon={<Repeat size={20} />} label="Recorrentes" value={metrics.returningVisitors} color="#f97316" />
                <StatCard icon={<MessageSquare size={20} />} label="Feedbacks" value={metrics.totalFeedbacks} color="#8b5cf6" />
                <StatCard icon={<Star size={20} />} label="Avaliação" value={metrics.avgRating > 0 ? `${metrics.avgRating} ⭐` : '—'} color="#f59e0b" />
                <StatCard icon={<ThumbsUp size={20} />} label="Encontrou" value={metrics.totalFeedbacks > 0 ? `${metrics.foundPercent}%` : '—'} color="#10b981" />
              </div>

              <div className="admin-grid-2">
                <div className="admin-panel">
                  <h3><TrendingUp size={18} /> Últimos 7 dias</h3>
                  <MiniBarChart data={metrics.visitsByDay} />
                </div>
                <div className="admin-panel">
                  <h3><Monitor size={18} /> Dispositivos</h3>
                  <div className="device-list">
                    {Object.entries(metrics.deviceStats).length > 0 ? Object.entries(metrics.deviceStats).map(([device, count]) => (
                      <div key={device} className="device-item">
                        <DeviceIcon device={device} />
                        <span className="device-name">{device}</span>
                        <span className="device-count">{count}</span>
                        <div className="device-bar">
                          <motion.div className="device-bar-fill" initial={{ width: 0 }} animate={{ width: `${(count / metrics.totalVisits) * 100}%` }} />
                        </div>
                      </div>
                    )) : <p className="admin-empty">Nenhum dado ainda</p>}
                  </div>
                </div>
              </div>

              <div className="admin-grid-2">
                <div className="admin-panel">
                  <h3><Globe size={18} /> Navegadores</h3>
                  <div className="device-list">
                    {Object.entries(metrics.browserStats).length > 0 ? Object.entries(metrics.browserStats).map(([b, c]) => (
                      <div key={b} className="device-item"><Globe size={16} /><span className="device-name">{b}</span><span className="device-count">{c}</span></div>
                    )) : <p className="admin-empty">Nenhum dado</p>}
                  </div>
                </div>
                <div className="admin-panel">
                  <h3><Eye size={18} /> Seções populares</h3>
                  <div className="device-list">
                    {Object.entries(metrics.sectionStats).length > 0 ? Object.entries(metrics.sectionStats).sort((a, b) => b[1] - a[1]).map(([s, c]) => (
                      <div key={s} className="device-item"><ArrowUpRight size={16} /><span className="device-name">{s}</span><span className="device-count">{c}</span></div>
                    )) : <p className="admin-empty">Nenhum dado</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* VISITORS */}
          {activeTab === 'visitors' && (
            <motion.div key="visitors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-content">
              {/* Cards mobile / Table desktop */}
              <div className="admin-panel">
                {/* Desktop table */}
                <div className="admin-table-wrapper desktop-only">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Data/Hora</th>
                        <th>Tipo</th>
                        <th>Dispositivo</th>
                        <th>Navegador</th>
                        <th>SO</th>
                        <th>Tela</th>
                        <th>Timezone</th>
                        <th>Conexão</th>
                        <th>Sessões</th>
                        <th>Origem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedVisitors.items.length > 0 ? paginatedVisitors.items.map(v => (
                        <tr key={v.id}>
                          <td><div className="table-datetime"><Calendar size={13} />{new Date(v.timestamp).toLocaleDateString('pt-BR')}<Clock size={13} />{new Date(v.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div></td>
                          <td><span className={`table-badge ${v.isReturning ? 'returning' : 'new-visitor'}`}>{v.isReturning ? 'Recorrente' : 'Novo'}</span></td>
                          <td><span className="table-badge"><DeviceIcon device={v.device} />{v.device}</span></td>
                          <td>{v.browser} {v.browserVersion ? `v${v.browserVersion.split('.')[0]}` : ''}</td>
                          <td>{v.os}</td>
                          <td>{v.viewportWidth || v.screenWidth}x{v.viewportHeight || v.screenHeight}</td>
                          <td style={{ fontSize: '0.78rem' }}>{v.timezone || '—'}</td>
                          <td>{v.connection?.type !== 'Desconhecido' ? <span className="table-badge"><Wifi size={12} />{v.connection?.type}</span> : '—'}</td>
                          <td style={{ textAlign: 'center' }}>{v.sessionCount || 1}</td>
                          <td className="table-referrer">{v.referrer === 'Direto' ? 'Direto' : v.referrer}</td>
                        </tr>
                      )) : <tr><td colSpan="10" className="admin-empty-row">Nenhum visitante</td></tr>}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="mobile-only visitor-cards">
                  {paginatedVisitors.items.length > 0 ? paginatedVisitors.items.map(v => (
                    <div key={v.id} className="visitor-card">
                      <div className="visitor-card-top">
                        <span className={`table-badge ${v.isReturning ? 'returning' : 'new-visitor'}`}>
                          {v.isReturning ? <Repeat size={12} /> : <UserCheck size={12} />}
                          {v.isReturning ? 'Recorrente' : 'Novo'}
                        </span>
                        <span className="visitor-card-date">
                          {new Date(v.timestamp).toLocaleDateString('pt-BR')} {new Date(v.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="visitor-card-details">
                        <span><DeviceIcon device={v.device} /> {v.device}</span>
                        <span><Globe size={13} /> {v.browser}</span>
                        <span>{v.os}</span>
                        {v.connection?.type !== 'Desconhecido' && <span><Wifi size={13} /> {v.connection?.type}</span>}
                      </div>
                    </div>
                  )) : <p className="admin-empty">Nenhum visitante</p>}
                </div>

                <Pagination currentPage={visitorsPage} totalPages={paginatedVisitors.totalPages} onPageChange={setVisitorsPage} />
              </div>
            </motion.div>
          )}

          {/* FEEDBACKS */}
          {activeTab === 'feedbacks' && (
            <motion.div key="feedbacks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-content">
              <div className="admin-search-bar">
                <Search size={18} />
                <input type="text" placeholder="Buscar feedbacks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="feedback-grid">
                {paginatedFeedbacks.items.length > 0 ? paginatedFeedbacks.items.map(fb => (
                  <div key={fb.id} className="admin-feedback-card">
                    <div className="feedback-card-header">
                      <StarDisplay rating={fb.rating} />
                      <span className="feedback-date">{new Date(fb.timestamp).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="feedback-card-found">
                      {fb.foundWhatNeeded ? <span className="found-yes">✅ Encontrou</span> : <span className="found-no">❌ Não encontrou</span>}
                    </div>
                    {fb.message && <p className="feedback-card-message">"{fb.message}"</p>}
                    {fb.contact && <p className="feedback-card-contact">📧 {fb.contact}</p>}
                    <div className="feedback-card-meta">
                      <span><DeviceIcon device={fb.device} />{fb.device}</span>
                      <span>{fb.browser}</span>
                    </div>
                  </div>
                )) : (
                  <div className="admin-empty-state">
                    <MessageSquare size={40} />
                    <h3>Nenhum feedback</h3>
                    <p>Os feedbacks aparecerão aqui</p>
                  </div>
                )}
              </div>
              <Pagination currentPage={feedbacksPage} totalPages={paginatedFeedbacks.totalPages} onPageChange={setFeedbacksPage} />
            </motion.div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-content">
              <div className="admin-panel" style={{ maxWidth: '460px' }}>
                <h3><Lock size={18} /> Alterar Senha</h3>
                <form onSubmit={handleChangePassword} className="settings-form">
                  {passwordMsg.text && (
                    <div className={`settings-msg ${passwordMsg.type}`}>
                      {passwordMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                      {passwordMsg.text}
                    </div>
                  )}
                  <div className="settings-field">
                    <label>Senha atual</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                  </div>
                  <div className="settings-field">
                    <label>Nova senha</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                  </div>
                  <div className="settings-field">
                    <label>Confirmar</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  </div>
                  <button type="submit" className="settings-submit"><Lock size={16} /> Alterar Senha</button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;

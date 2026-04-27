import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  TrendingUp,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Star,
  ThumbsUp,
  LogOut,
  Eye,
  Calendar,
  Clock,
  Settings,
  Search,
  ArrowUpRight,
  Lock,
  Check,
  AlertCircle,
  UserCheck,
  Repeat,
  Wifi,
  MapPin,
} from 'lucide-react';
import { getDashboardMetrics } from '../services/analytics';
import { logout, getSession, changePassword } from '../services/auth';

// --- Sub-componentes ---

const StatCard = ({ icon, label, value, subtitle, color }) => (
  <motion.div
    className="admin-stat-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -3 }}
  >
    <div className="stat-icon" style={{ background: `${color}15`, color }}>
      {icon}
    </div>
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
          <motion.div
            className="mini-chart-bar"
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
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={14}
        fill={s <= rating ? '#f59e0b' : 'none'}
        color={s <= rating ? '#f59e0b' : '#cbd5e1'}
      />
    ))}
  </div>
);

// --- Dashboard Principal ---

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const session = getSession();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = () => {
    const data = getDashboardMetrics();
    setMetrics(data);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/admin';
  };



  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres' });
      return;
    }

    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      setPasswordMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: result.error });
    }
  };

  const filteredFeedbacks = useMemo(() => {
    if (!metrics) return [];
    const term = searchTerm.toLowerCase();
    return metrics.recentFeedbacks.filter(f =>
      f.message.toLowerCase().includes(term) ||
      f.contact.toLowerCase().includes(term)
    );
  }, [metrics, searchTerm]);

  if (!metrics) return null;

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: <LayoutDashboard size={18} /> },
    { id: 'visitors', label: 'Visitantes', icon: <Users size={18} /> },
    { id: 'feedbacks', label: 'Feedbacks', icon: <MessageSquare size={18} /> },
    { id: 'settings', label: 'Configurações', icon: <Settings size={18} /> },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <LayoutDashboard size={24} />
          <span>Admin</span>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {session?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{session?.username || 'Admin'}</span>
              <span className="sidebar-user-role">Administrador</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Sair">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1 className="admin-title">
              {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="admin-subtitle">
              {activeTab === 'overview' && 'Métricas gerais do seu portfolio'}
              {activeTab === 'visitors' && 'Histórico de visitantes recentes'}
              {activeTab === 'feedbacks' && 'Feedbacks deixados pelos visitantes'}
              {activeTab === 'settings' && 'Configurações do painel admin'}
            </p>
          </div>
          <div className="admin-header-actions">
            <a href="/" className="admin-view-site" target="_blank" rel="noopener noreferrer">
              <Eye size={16} />
              Ver Site
            </a>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {/* === OVERVIEW TAB === */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="admin-content"
            >
              {/* Stat Cards */}
              <div className="admin-stats-grid">
                <StatCard
                  icon={<Users size={22} />}
                  label="Total de Visitas"
                  value={metrics.totalVisits}
                  subtitle={`${metrics.visitsToday} hoje`}
                  color="#3b82f6"
                />
                <StatCard
                  icon={<UserCheck size={22} />}
                  label="Visitantes Únicos"
                  value={metrics.uniqueVisitors}
                  color="#06b6d4"
                />
                <StatCard
                  icon={<Repeat size={22} />}
                  label="Visitas Recorrentes"
                  value={metrics.returningVisitors}
                  color="#f97316"
                />
                <StatCard
                  icon={<MessageSquare size={22} />}
                  label="Feedbacks"
                  value={metrics.totalFeedbacks}
                  color="#8b5cf6"
                />
                <StatCard
                  icon={<Star size={22} />}
                  label="Avaliação Média"
                  value={metrics.avgRating > 0 ? `${metrics.avgRating} ⭐` : '—'}
                  color="#f59e0b"
                />
                <StatCard
                  icon={<ThumbsUp size={22} />}
                  label="Encontraram o que precisava"
                  value={metrics.totalFeedbacks > 0 ? `${metrics.foundPercent}%` : '—'}
                  color="#10b981"
                />
              </div>

              {/* Gráfico de visitas + Dispositivos */}
              <div className="admin-grid-2">
                <div className="admin-panel">
                  <h3>
                    <TrendingUp size={18} />
                    Visitas nos últimos 7 dias
                  </h3>
                  <MiniBarChart data={metrics.visitsByDay} />
                </div>

                <div className="admin-panel">
                  <h3>
                    <Monitor size={18} />
                    Dispositivos
                  </h3>
                  <div className="device-list">
                    {Object.entries(metrics.deviceStats).length > 0 ? (
                      Object.entries(metrics.deviceStats).map(([device, count]) => (
                        <div key={device} className="device-item">
                          <DeviceIcon device={device} />
                          <span className="device-name">{device}</span>
                          <span className="device-count">{count}</span>
                          <div className="device-bar">
                            <motion.div
                              className="device-bar-fill"
                              initial={{ width: 0 }}
                              animate={{ width: `${(count / metrics.totalVisits) * 100}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="admin-empty">Nenhum dado ainda</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Browsers + Seções */}
              <div className="admin-grid-2">
                <div className="admin-panel">
                  <h3>
                    <Globe size={18} />
                    Navegadores
                  </h3>
                  <div className="device-list">
                    {Object.entries(metrics.browserStats).length > 0 ? (
                      Object.entries(metrics.browserStats).map(([browser, count]) => (
                        <div key={browser} className="device-item">
                          <Globe size={16} />
                          <span className="device-name">{browser}</span>
                          <span className="device-count">{count}</span>
                        </div>
                      ))
                    ) : (
                      <p className="admin-empty">Nenhum dado ainda</p>
                    )}
                  </div>
                </div>

                <div className="admin-panel">
                  <h3>
                    <Eye size={18} />
                    Seções mais visitadas
                  </h3>
                  <div className="device-list">
                    {Object.entries(metrics.sectionStats).length > 0 ? (
                      Object.entries(metrics.sectionStats)
                        .sort((a, b) => b[1] - a[1])
                        .map(([section, count]) => (
                          <div key={section} className="device-item">
                            <ArrowUpRight size={16} />
                            <span className="device-name">{section}</span>
                            <span className="device-count">{count}</span>
                          </div>
                        ))
                    ) : (
                      <p className="admin-empty">Nenhum dado ainda</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* === VISITORS TAB === */}
          {activeTab === 'visitors' && (
            <motion.div
              key="visitors"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="admin-content"
            >
              <div className="admin-panel">
                <h3>
                  <Users size={18} />
                  Visitantes Recentes
                  <span className="badge">{metrics.recentVisits.length}</span>
                </h3>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Data/Hora</th>
                        <th>Visitante</th>
                        <th>Dispositivo</th>
                        <th>Navegador</th>
                        <th>Sistema</th>
                        <th>Tela</th>
                        <th>Timezone</th>
                        <th>Conexão</th>
                        <th>Sessões</th>
                        <th>Origem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.recentVisits.length > 0 ? (
                        metrics.recentVisits.map((visit) => (
                          <tr key={visit.id}>
                            <td>
                              <div className="table-datetime">
                                <Calendar size={14} />
                                {new Date(visit.timestamp).toLocaleDateString('pt-BR')}
                                <Clock size={14} />
                                {new Date(visit.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td>
                              <span className={`table-badge ${visit.isReturning ? 'returning' : 'new-visitor'}`}>
                                {visit.isReturning ? <Repeat size={12} /> : <UserCheck size={12} />}
                                {visit.isReturning ? 'Recorrente' : 'Novo'}
                              </span>
                            </td>
                            <td>
                              <span className="table-badge">
                                <DeviceIcon device={visit.device} />
                                {visit.device}
                              </span>
                            </td>
                            <td>{visit.browser} {visit.browserVersion ? `v${visit.browserVersion.split('.')[0]}` : ''}</td>
                            <td>{visit.os}</td>
                            <td>{visit.viewportWidth || visit.screenWidth}x{visit.viewportHeight || visit.screenHeight}</td>
                            <td style={{fontSize: '0.8rem'}}>{visit.timezone || '—'}</td>
                            <td>
                              {visit.connection?.type !== 'Desconhecido' ? (
                                <span className="table-badge">
                                  <Wifi size={12} />
                                  {visit.connection?.type}
                                </span>
                              ) : '—'}
                            </td>
                            <td style={{textAlign:'center'}}>{visit.sessionCount || 1}</td>
                            <td className="table-referrer">
                              {visit.referrer === 'Direto' ? 'Acesso Direto' : visit.referrer}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className="admin-empty-row">
                            Nenhum visitante registrado ainda
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* === FEEDBACKS TAB === */}
          {activeTab === 'feedbacks' && (
            <motion.div
              key="feedbacks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="admin-content"
            >
              {/* Search bar */}
              <div className="admin-search-bar">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar nos feedbacks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="feedback-grid">
                {filteredFeedbacks.length > 0 ? (
                  filteredFeedbacks.map((fb) => (
                    <motion.div
                      key={fb.id}
                      className="admin-feedback-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="feedback-card-header">
                        <StarDisplay rating={fb.rating} />
                        <span className="feedback-date">
                          {new Date(fb.timestamp).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <div className="feedback-card-found">
                        {fb.foundWhatNeeded ? (
                          <span className="found-yes">✅ Encontrou o que precisava</span>
                        ) : (
                          <span className="found-no">❌ Não encontrou o que precisava</span>
                        )}
                      </div>

                      {fb.message && (
                        <p className="feedback-card-message">"{fb.message}"</p>
                      )}

                      {fb.contact && (
                        <p className="feedback-card-contact">
                          📧 {fb.contact}
                        </p>
                      )}

                      <div className="feedback-card-meta">
                        <span>
                          <DeviceIcon device={fb.device} />
                          {fb.device}
                        </span>
                        <span>{fb.browser}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="admin-empty-state">
                    <MessageSquare size={48} />
                    <h3>Nenhum feedback encontrado</h3>
                    <p>Os feedbacks dos visitantes aparecerão aqui</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* === SETTINGS TAB === */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="admin-content"
            >
              {/* Alterar senha */}
              <div className="admin-panel" style={{ maxWidth: '500px' }}>
                <h3>
                  <Lock size={18} />
                  Alterar Senha
                </h3>
                <form onSubmit={handleChangePassword} className="settings-form">
                  {passwordMsg.text && (
                    <div className={`settings-msg ${passwordMsg.type}`}>
                      {passwordMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                      {passwordMsg.text}
                    </div>
                  )}
                  <div className="settings-field">
                    <label>Senha atual</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="settings-field">
                    <label>Nova senha</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="settings-field">
                    <label>Confirmar nova senha</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="settings-submit">
                    <Lock size={16} />
                    Alterar Senha
                  </button>
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
